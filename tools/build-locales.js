#!/usr/bin/env node
/*
 * Generates a directory per market from the four source pages.
 *
 *   node tools/build-locales.js
 *
 * Output is committed, not built on Netlify. A build command is one more
 * thing that can fail on deploy, and this site has already had one outage
 * from a netlify.toml change -- generated files in git are inspectable in a
 * diff and cannot break a deploy.
 *
 * What each generated page gets that the source does not:
 *   - <html lang> for the market's language
 *   - a canonical pointing at itself, not at the source page
 *   - hreflang alternates covering every market, plus x-default
 *   - internal links prefixed with the market segment
 *   - window.__DRP_MARKET__, so the client knows its market without
 *     having to parse the URL
 *   - a <script> for its own language's translations only, generated
 *     alongside the pages into assets/i18n.<lang>.js
 *
 * Body copy is still translated client-side by app.js, exactly as it is
 * today. This step gets the URLs, the metadata and the currency right; the
 * text is a separate problem and prerendering it can follow.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..');
const MARKETS = require(path.join(ROOT, 'assets', 'markets.js'));
const TRANSLATIONS = eval(
  fs.readFileSync(path.join(ROOT, 'assets', 'i18n.js'), 'utf8') + ';TRANSLATIONS');
const PAGE_KEY = { '': 'home', '/over-ons': 'about', '/prijzen': 'pricing', '/contact': 'contact' };
const ORIGIN = 'https://drpbuildlab.com';

// Everything __-prefixed is metadata, not a market: __default, __fallback
// and __webfonts. Matched by prefix so the next one added does not have to
// be remembered here.
const CODES = Object.keys(MARKETS).filter(k => !k.startsWith('__'));
const DEFAULT = MARKETS.__default;
// x-default is advice to a crawler about the unmatched visitor, so it names
// the fallback market rather than the home one.
const FALLBACK = MARKETS.__fallback || MARKETS.__default;

/* --market=be limits page generation to one market, for the edit-and-reload
 * loop. Assets are still built in full, because they are shared and cheap;
 * what it skips is the other eighty pages, the sitemap, and the prune. The
 * markets this run did not touch keep pointing at the hashed files from the
 * last full build, which are deliberately left in place -- so the local site
 * stays coherent, but the tree is NOT publishable until a full build has
 * run. The build says so on the way out. */
const ARGV = process.argv.slice(2);
const ONLY = (ARGV.find(a => a.startsWith('--market=')) || '').split('=')[1] || '';
if (ONLY && !CODES.includes(ONLY)) {
  console.error('--market=' + ONLY + ' is not a market. Known: ' + CODES.join(', '));
  process.exit(1);
}

/* source page -> path under a market directory */
const PAGES = [
  { src: 'src/index.html', out: 'index.html', route: '' },
  { src: 'src/over-ons/index.html', out: 'over-ons/index.html', route: '/over-ons' },
  { src: 'src/prijzen/index.html', out: 'prijzen/index.html', route: '/prijzen' },
  { src: 'src/contact/index.html', out: 'contact/index.html', route: '/contact' },
];

/* Internal routes that must gain the market prefix. Ordered longest-first so
 * "/contact" is not partly matched while rewriting "/". */
const ROUTES = ['/over-ons', '/prijzen', '/contact'];

function marketiseLinks(html, code) {
  let out = html;
  for (const r of ROUTES) {
    out = out.split(`href="${r}"`).join(`href="/${code}${r}"`);
  }
  // The bare root link, only as a complete attribute value.
  out = out.split('href="/"').join(`href="/${code}/"`);
  return out;
}

function hreflangBlock(route) {
  const lines = CODES.map(code => {
    // hreflang wants language-REGION; the market code is the region.
    const tag = `${MARKETS[code].lang}-${code.toUpperCase()}`;
    return `<link rel="alternate" hreflang="${tag}" href="${ORIGIN}/${code}${route || '/'}">`;
  });
  lines.push(`<link rel="alternate" hreflang="x-default" href="${ORIGIN}/${FALLBACK}${route || '/'}">`);
  return lines.join('\n');
}


/* The market picker, with this market preselected. Grouped by region because
 * a flat list of every market is not scannable, and labelled with the
 * currency because that is half of what a visitor is choosing. */
function marketPicker(current, route) {
  const byRegion = {};
  for (const code of CODES) {
    const m = MARKETS[code];
    (byRegion[m.region] = byRegion[m.region] || []).push(code);
  }
  const groups = Object.keys(byRegion).map(region => {
    const opts = byRegion[region].map(code => {
      const m = MARKETS[code];
      const sel = code === current ? ' selected' : '';
      return `        <option value="${code}"${sel}>${m.name} — ${m.currency}</option>`;
    }).join('\n');
    return `      <optgroup label="${region}">\n${opts}\n      </optgroup>`;
  }).join('\n');

  return [
    '    <div class="market-sw">',
    `      <select id="marketSel" data-route="${route || '/'}" aria-label="Choose your market">`,
    groups,
    '      </select>',
    '    </div>',
  ].join('\n');
}


/* The social tags, in the market's language. Kept in step with <title> and
 * the meta description, which applyLang sets at runtime from these same
 * keys -- otherwise a shared link previews in a different language from the
 * page it opens. */
function socialTags(html, code, route) {
  const lang = MARKETS[code].lang;
  const t = TRANSLATIONS[lang];
  const key = PAGE_KEY[route];
  const title = t['meta.title.' + key] || t['meta.title'];
  const desc = t['meta.desc.' + key] || t['meta.desc'];
  const alt = 'DRP BuildLab — ' + [t['hero.l1'], t['hero.l2']].filter(Boolean).join(' ');

  const set = (attr, name, value) => {
    const re = new RegExp('(<meta ' + attr + '="' + name + '" content=")[^"]*(")');
    html = html.replace(re, '$1' + value.replace(/"/g, '&quot;') + '$2');
  };

  set('property', 'og:title', title);
  set('property', 'og:description', desc);
  set('property', 'og:image:alt', alt);
  set('property', 'og:locale', lang + '_' + code.toUpperCase());
  set('name', 'twitter:title', title);
  set('name', 'twitter:description', desc);
  set('name', 'twitter:image:alt', alt);
  return html;
}

/* The structured data, per market.
 *
 * Every market shipped Belgium's schema. /jp/ told Google areaServed BE,
 * named Brussels and Antwerp and accepted euro, so a crawler read a Belgian
 * business that happened to be written in Japanese -- the page indexed but
 * had no reason to rank in the market it was written for.
 *
 * What stays Belgian is what actually is Belgian: the KBO number, the VAT
 * ID, the registered address and the phone number all describe one legal
 * entity in Hallaar, and that stays true whichever market is reading.
 *
 * Edited as text rather than parsed and re-serialised, so untouched lines
 * keep their formatting and /be/ comes out byte-for-byte what it was before
 * this function existed -- which is the check that the generator reproduces
 * the hand-written original rather than merely something close to it. */
/* The English name of each language, for contactPoint.availableLanguage.
 *
 * A language missing from here used to sail straight through: JSON.stringify
 * of undefined is undefined, so the join produced "availableLanguage": [,"
 * English"] -- invalid JSON that no page would parse, in a block a human only
 * reads when something has already gone wrong. Adding Portuguese found it.
 * Hence the check below rather than a shrug. */
const LANG_NAME = {
  nl: 'Dutch', en: 'English', fr: 'French', de: 'German',
  es: 'Spanish', id: 'Indonesian', ja: 'Japanese', pt: 'Portuguese',
  it: 'Italian', pl: 'Polish',
};

/* Replace everything from `open` to the first following `close`, inclusive.
 * Index surgery rather than a multi-line regex: the thing being matched is a
 * JSON block whose own punctuation would need escaping either way, and this
 * says plainly where the edit starts and stops. */
function spliceBetween(html, open, close, replacement) {
  const i = html.indexOf(open);
  if (i === -1) return html;
  const j = html.indexOf(close, i + open.length);
  if (j === -1) return html;
  return html.slice(0, i) + replacement + html.slice(j + close.length);
}

function marketSchema(html, code) {
  const m = MARKETS[code];
  const t = TRANSLATIONS[m.lang];
  const LF = String.fromCharCode(10);

  /* areaServed: the country, whatever administrative areas the market
   * declares, then its cities -- each named in the market's own language,
   * because the page around them is. */
  const node = (type, name) =>
    `{"@type":"${type}","name":${JSON.stringify(name)}}`;
  const nodes = [node('Country', m.name)]
    .concat((m.areas || []).map(a => node('AdministrativeArea', a)))
    .concat((m.cities || []).map(c => node('City', c)));
  html = spliceBetween(html, '"areaServed": [', LF + '  ]',
    '"areaServed": [' + LF + nodes.map(n => '    ' + n).join(',' + LF) + LF + '  ]');

  /* The currency the market is quoted in. Deliberately not the offers'
   * priceCurrency, which stays EUR: that is the currency invoiced in, and
   * baking a converted figure into a static file would freeze one day's
   * exchange rate. */
  html = html.replace(/"currenciesAccepted": "[^"]*"/,
    () => '"currenciesAccepted": ' + JSON.stringify(m.currency));

  /* The market's language plus English, unless the market names its own set.
   * Belgium does, because the studio really does answer in French too. */
  if (!m.languages && !LANG_NAME[m.lang]) {
    throw new Error('no English name for language "' + m.lang + '" (market '
      + code + '). Add it to LANG_NAME, or give the market its own `languages`.');
  }
  const langs = m.languages
    || [LANG_NAME[m.lang], 'English'].filter((v, i, a) => a.indexOf(v) === i);
  html = spliceBetween(html, '"availableLanguage": [', ']',
    '"availableLanguage": [' + langs.map(l => JSON.stringify(l)).join(',') + ']');

  /* How the studio is paid.
   *
   * This read "Bankoverschrijving, Bancontact" on all nineteen markets: Dutch
   * everywhere, and naming a Belgian-only debit scheme that a visitor in
   * eighteen of them cannot use. The same shape of error as a translated tax
   * term -- a real thing, correctly named, asserted where it does not exist.
   *
   * Now the market's own language, and bank transfer alone, which is the one
   * payment fact the site can stand behind: it invoices, in euro. Nothing is
   * claimed that has not been confirmed. */
  const pay = t['pay.methods'];
  if (!pay) {
    throw new Error('no pay.methods for language "' + m.lang + '" (market '
      + code + '). Every language block needs one.');
  }
  html = html.replace(/"paymentAccepted": "[^"]*"/,
    () => '"paymentAccepted": ' + JSON.stringify(pay));

  /* The descriptive copy, taken from the translations instead of the Dutch it
   * was hardcoded in.
   *
   * All of it shipped in Dutch to every market -- the business description a
   * crawler reads, the services it knows about, both package names and both
   * package descriptions. Invisible to a visitor, and the strongest reason
   * Google had to treat nineteen markets as one Belgian page.
   *
   * Not one of these needed a new translation key. The site already says all
   * of it, in every language, in copy a human wrote or reviewed: meta.desc is
   * the business description, hero.eye the one-liner, p1/p2 the packages,
   * ex.items the service list. Reusing them means no new machine translation
   * enters the schema, and the schema cannot drift from the page. */
  const plain = s => String(s).replace(/<[^>]*>/g, '');
  const setJson = (key, value, was) => {
    const from = '"' + key + '": ' + JSON.stringify(was);
    if (!html.includes(from)) {
      throw new Error('src no longer contains ' + key + ' = ' + JSON.stringify(was).slice(0, 60)
        + '\n  (market ' + code + '; update marketSchema in build-locales.js)');
    }
    html = html.split(from).join('"' + key + '": ' + JSON.stringify(value));
  };

  /* Only the home page carries ProfessionalService, Organization and WebSite;
   * the other three have a BreadcrumbList and, on pricing, an FAQPage. So the
   * copy below is skipped where those blocks do not exist -- but where they
   * do, every literal must still be found, which is what setJson enforces.
   * A silent no-op on all four pages would hide the day someone edits the
   * Dutch in src and the schema quietly stops being translated. */
  if (html.includes('"@type": "ProfessionalService"')) {
  setJson('description', t['meta.desc'],
    'DRP BuildLab ontwerpt en bouwt websites volledig op maat voor lokale ondernemers in België. Beginnerspakket vanaf €499 of quotatie op maat voor geavanceerde projecten — met optioneel maandelijks onderhoud vanaf €29 per maand.');
  setJson('description', t['hero.eye'],
    'Websites op maat voor lokale ondernemers in België.');
  setJson('alternateName', 'DRP BuildLab — ' + plain(t['ab.logotag']),
    'DRP BuildLab — Webdesign op maat');

  // What the studio does, from the extra-services list it already publishes.
  html = html.replace(/"knowsAbout": \[[^\]]*\]/,
    () => '"knowsAbout": [' + t['ex.items'].map(i => JSON.stringify(i.n)).join(',') + ']');

  // The two offers, from the two package blocks on the pricing page.
  setJson('name', t['p1.name'], 'Beginnerspakket — Website op maat');
  setJson('description', plain(t['p1.desc']),
    'Ideaal voor lokale ondernemers die net starten zonder website, of een bestaande website willen laten aanpassen. Website op maat; maandelijks onderhoud optioneel vanaf €29 per maand.');
  setJson('name', t['p1.name'], 'Website op maat — Beginnerspakket');
  setJson('name', t['p2.name'], 'Maatwerk website — quotatie op maat');
  setJson('description', plain(t['p2.desc']),
    'Geavanceerde websites volledig op maat. Prijs wordt bepaald op basis van de omvang van het project. Maandelijks onderhoud optioneel: €29 per maand of €250 per jaar.');
  setJson('name', t['p2.name'], 'Maatwerk website op maat');
  }

  /* The contactPoint's own areaServed, which is a country code, not a list. */
  html = html.replace(/"areaServed": "[A-Z]{2}"/,
    () => '"areaServed": ' + JSON.stringify(code.toUpperCase()));

  /* Scope the entity ids to the market.
   *
   * All seventeen markets published the same three @ids while now making
   * different claims under them -- one #business simultaneously serving
   * Belgium, Japan and the United States in three currencies. An @id is a
   * global identifier, so a crawler is entitled to merge those into one
   * node and keep whichever it saw last.
   *
   * Per-market ids let each page describe the studio as that market meets
   * it. The pages are still tied to one company by the things that identify
   * a company -- the same vatID, the same BE-KBO number, the same telephone
   * and the same registered address on every one of them. */
  const base = ORIGIN + '/' + code + '/#';
  html = html.split(ORIGIN + '/#').join(base);

  /* WebSite.inLanguage, which claimed nl-BE on all seventeen. */
  html = html.replace(/"inLanguage": "[^"]*"/,
    () => '"inLanguage": ' + JSON.stringify(m.lang + '-' + code.toUpperCase()));

  return html;
}

/* The breadcrumb trail, per market.
 *
 * Every market published the root crumb as https://drpbuildlab.com/ and the
 * page crumb as the unprefixed route, so /jp/prijzen told Google its parent
 * was a URL that redirects away from Japan and that its own address belonged
 * to no market at all. The labels were Dutch on all seventeen too: applyLang
 * rewrites the visible navigation but never the JSON-LD sitting behind it.
 *
 * Names come from the same nav.* keys the visible nav uses, so a crumb and
 * the link it describes cannot drift apart. In Dutch they are already the
 * words that were hard-coded here, which is why /be/ only gains the prefix. */
const CRUMB_KEY = {
  '': 'nav.home', '/over-ons': 'nav.about',
  '/prijzen': 'nav.pricing', '/contact': 'nav.contact',
};

function breadcrumb(html, code, route) {
  const t = TRANSLATIONS[MARKETS[code].lang];
  const LF = String.fromCharCode(10);
  const crumb = (pos, name, path) => '    '
    + '{"@type":"ListItem","position":' + pos
    + ',' + '"name":' + JSON.stringify(name)
    + ',' + '"item":' + JSON.stringify(ORIGIN + '/' + code + path) + '}';

  const items = [crumb(1, t['nav.home'], '/')];
  if (route) items.push(crumb(2, t[CRUMB_KEY[route]], route));

  return spliceBetween(html, '"itemListElement": [', LF + '  ]',
    '"itemListElement": [' + LF + items.join(',' + LF) + LF + '  ]');
}

/* The webfont for a script the body face does not cover, declared in the
 * page instead of injected by JS.
 *
 * app.js loads it at runtime, which turned out to be too late to matter:
 * prerender bakes the <link> into the page but strips the inline
 * font-family that used it, so /jp/ pulled Noto Sans JP on every visit and
 * still rendered Japanese in whatever the browser fell back to. With
 * JavaScript off it downloaded the font and never applied it at all.
 *
 * The rule is keyed on html[lang] so it outranks the plain body rule in
 * styles.css whichever order the two load in. */
const SHEET = '<link rel="stylesheet" href="/assets/styles.css">';

function webfont(html, code) {
  const lang = MARKETS[code].lang;
  const wf = (MARKETS.__webfonts || {})[lang];
  if (!wf) return html;
  const href = wf.href.split('&').join('&amp;');
  return html.split(SHEET).join([
    `<link rel="stylesheet" href="${href}">`,
    '<style>',
    `html[lang="${lang}"] body{font-family:'Plus Jakarta Sans','${wf.family}',sans-serif}`,
    '</style>',
    SHEET,
  ].join('\n'));
}

/* Consent Mode, then Google Tag Manager -- in that order, inline, and before
 * anything else on the page.
 *
 * The order is the whole feature. gtag('consent','default', ... denied) has
 * to have executed before the container loads, or GTM's tags fire once with
 * no consent state and set an identifier that no later update can recall.
 * That is why this is inline in <head> and not in a deferred file: a deferred
 * script is by definition too late.
 *
 * A stored choice is replayed here too. Without that, a returning visitor who
 * accepted last week would spend the first moments of every page denied,
 * because assets/consent.js -- which knows about their choice -- has not run
 * yet.
 *
 * With no container ID in markets.js nothing is emitted at all: no dataLayer,
 * no snippet, no request to Google. The site tracks nobody until somebody
 * pastes an ID in on purpose.
 *
 * functionality_storage is granted because that is the necessary bucket, and
 * the necessary bucket is what this site was already doing before any of
 * this: remembering that a banner was dismissed. Everything a visitor could
 * reasonably object to -- analytics, ads, personalisation -- starts denied. */
function consentHead(html) {
  const gtm = (MARKETS.__gtm || '').trim();

  const consent = [
    '<script>',
    '/* Consent Mode v2 defaults. Denied until the visitor says otherwise. */',
    'window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}',
    "gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',"
      + "ad_personalization:'denied',analytics_storage:'denied',"
      + "personalization_storage:'denied',functionality_storage:'granted',"
      + "security_storage:'granted',wait_for_update:500});",
    "gtag('set','ads_data_redaction',true);",
    '/* Replay a stored choice before the container loads. */',
    "try{var c=JSON.parse(localStorage.getItem('drp-consent')||'null');"
      + "if(c&&c.v===1){gtag('consent','update',{"
      + "analytics_storage:c.analytics?'granted':'denied',"
      + "ad_storage:c.marketing?'granted':'denied',"
      + "ad_user_data:c.marketing?'granted':'denied',"
      + "ad_personalization:c.marketing?'granted':'denied',"
      + "personalization_storage:c.marketing?'granted':'denied'});}}catch(e){}",
    '<\/script>',
  ].join('\n');

  const container = [
    '<!-- Google Tag Manager -->',
    '<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({"gtm.start":',
    'new Date().getTime(),event:"gtm.js"});var f=d.getElementsByTagName(s)[0],',
    "j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=",
    "'https://www.googletagmanager.com/gtm.js?id='+i+dl;",
    "f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','" + gtm + "');<\/script>",
  ].join('\n');

  const block = gtm ? (consent + '\n' + container) : '';
  if (!block) return html;
  /* Before the market script, which is the first thing in this head that
   * build-locales writes -- so the consent defaults are the earliest
   * executable code on the page. */
  const marker = '<script>window.__DRP_MARKET__=';
  const at = html.indexOf(marker);
  if (at === -1) throw new Error('market marker not found; consentHead must run after step 5');
  return html.slice(0, at) + block + '\n' + html.slice(at);
}
/* -- assets: concatenate, hash, and rewrite every reference ---------------
 *
 * Every file a page loads is emitted into assets/build/ under a name
 * carrying a hash of its own contents -- styles.a3f9c1.css. The name changes
 * if and only if the bytes change, which is what lets _headers mark that
 * directory immutable for a year and end the class of bug where a fix ships
 * and nobody sees it because the browser still holds last week copy.
 *
 * A subdirectory, rather than marking /assets/* immutable outright: the
 * favicon, the OG image and the app icons live under /assets/ too, under
 * fixed names, and freezing those for a year is the same trap wearing a
 * different hat. Only content-addressed files get the long cache.
 *
 * The rewrite happens last, on the finished HTML, rather than at each of the
 * half-dozen places that write a script tag. Those steps go on dealing in
 * plain readable paths; this pass maps them at the end. */
const BUILD_DIR = path.join(ROOT, 'assets', 'build');
const CSS_DIR = path.join(ROOT, 'src', 'css');
const ASSETS = {};        // logical name -> served path
const EMITTED = new Set();

function shortHash(text) {
  return crypto.createHash('sha256').update(text, 'utf8').digest('hex').slice(0, 8);
}

function emitAsset(name, content) {
  const dot = name.lastIndexOf('.');
  const file = name.slice(0, dot) + '.' + shortHash(content) + name.slice(dot);
  const dest = path.join(BUILD_DIR, file);
  fs.mkdirSync(BUILD_DIR, { recursive: true });
  // Same hash means same bytes, so rewriting would only churn mtimes.
  if (!fs.existsSync(dest)) fs.writeFileSync(dest, content, 'utf8');
  ASSETS[name] = '/assets/build/' + file;
  EMITTED.add(file);
  return ASSETS[name];
}

/* Hand-written files in assets/ are sources; this copies one to its hashed
   serving name without changing a byte. */
function copyAsset(name) {
  return emitAsset(name, fs.readFileSync(path.join(ROOT, 'assets', name), 'utf8'));
}

/* src/css/*.css in filename order -- the numbers are the cascade, and the
   README there says why. The readable whole is still written to
   assets/styles.css so there is one file to grep and src/ stays previewable;
   the pages load the hashed copy. */
function buildStylesheet() {
  const parts = fs.readdirSync(CSS_DIR).filter(f => f.endsWith('.css')).sort();
  if (!parts.length) throw new Error('no stylesheet parts in src/css');
  const read = f => fs.readFileSync(path.join(CSS_DIR, f), 'utf8');
  const CR = String.fromCharCode(13), LF = String.fromCharCode(10);
  const nl = read(parts[0]).includes(CR + LF) ? CR + LF : LF;
  const css = parts.map(read).join(nl);
  fs.writeFileSync(path.join(ROOT, 'assets', 'styles.css'), css, 'utf8');
  emitAsset('styles.css', css);
  return parts.length;
}

/* The closing quote is part of the match on purpose: without it
   /assets/i18n.js would also match inside /assets/i18n.nl.js. */
function hashAssets(html) {
  const Q = String.fromCharCode(34);
  for (const name of Object.keys(ASSETS)) {
    html = html.split('/assets/' + name + Q).join(ASSETS[name] + Q);
  }
  if (html.includes('/assets/styles.css') || html.includes('/assets/app.js')) {
    throw new Error('an asset reference escaped hashing -- check hashAssets()');
  }
  return html;
}

/* Old hashes are dead weight and, worse, they are exactly what a stale page
   would still resolve. Full builds only: a --market run has not regenerated
   the other markets, so their files are still in use. */
function pruneBuildDir() {
  let gone = 0;
  for (const f of fs.readdirSync(BUILD_DIR)) {
    if (EMITTED.has(f)) continue;
    fs.unlinkSync(path.join(BUILD_DIR, f));
    gone++;
  }
  return gone;
}

function build(code, page) {
  const m = MARKETS[code];
  let html = fs.readFileSync(path.join(ROOT, page.src), 'utf8');
  const self = `${ORIGIN}/${code}${page.route || '/'}`;

  // 1. document language
  html = html.replace(/<html lang="[^"]*"/, `<html lang="${m.lang}"`);

  // 2. canonical + og:url point at this market's own URL
  html = html.replace(/<link rel="canonical" href="[^"]*">/,
    `<link rel="canonical" href="${self}">`);
  html = html.replace(/<meta property="og:url" content="[^"]*">/,
    `<meta property="og:url" content="${self}">`);

  // 2b. social tags in this market's language
  html = socialTags(html, code, page.route);

  // 2c. structured data describing this market, not Belgium
  html = marketSchema(html, code);

  // 2d. breadcrumbs that point into this market, labelled in its language
  html = breadcrumb(html, code, page.route);

  // 3. replace the existing hreflang pair with the full market set
  html = html.replace(/<link rel="alternate" hreflang="nl-be"[^>]*>\s*\n\s*<link rel="alternate" hreflang="x-default"[^>]*>/,
    hreflangBlock(page.route));
  if (!html.includes('hreflang="x-default"')) {
    html = html.replace('<link rel="canonical"',
      hreflangBlock(page.route) + '\n<link rel="canonical"');
  }

  // 4. internal links carry the market
  html = marketiseLinks(html, code);

  // 4a. the starting rate, before locale.js runs and looks for it
  html = html.split('<script defer src="/assets/i18n.js"></script>')
             .join('<script defer src="/assets/rates.boot.js"></script>'
               + '\n' + '<script defer src="/assets/lang-offer.js"></script>'
               + '\n' + '<script defer src="/assets/i18n.js"></script>');

  // 4b. this market loads its own language only, not all seven
  html = html.split('<script defer src="/assets/i18n.js"></script>')
             .join(`<script defer src="/assets/i18n.${m.lang}.js"></script>`);

  // 5. tell the client which market it is, before the deferred scripts run
  html = html.replace('<link rel="stylesheet" href="/assets/styles.css">',
    `<script>window.__DRP_MARKET__=${JSON.stringify(code)};</script>\n`
    + '<script defer src="/assets/markets.js"></script>\n'
    + '<link rel="stylesheet" href="/assets/styles.css">');

  // 5a. consent defaults and the tag container, before anything else runs
  html = consentHead(html);

  // 5b. and the font its script needs, in the page rather than via JS
  html = webfont(html, code);


  // 6. the language toggle becomes a market picker that navigates
  html = html.replace(
    /[ \t]*<div class="lang-sw"[\s\S]*?<\/div>\n/,
    marketPicker(code, page.route) + '\n');

  // 7. last: point every asset reference at its content-addressed name
  html = hashAssets(html);

  const dest = path.join(ROOT, code, page.out);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, html, 'utf8');
  return dest;
}

/* ── per-language translation payloads ──────────────────────────────
 * assets/i18n.js holds every language and is the file humans edit; it stays
 * the source of truth and translate.js keeps writing to it. Shipping it
 * whole meant /be/ downloading Japanese, German and Indonesian in order to
 * render Dutch -- 125KB where 18KB was needed, growing by another slice with
 * every language added.
 *
 * So each language is written out on its own here, and each market page is
 * pointed at just its own. The object keeps the same global name and the
 * same shape -- TRANSLATIONS, keyed by language -- holding exactly one key,
 * so applyLang() and locale.js read it without knowing the split happened.
 *
 * One key per line rather than one minified blob: these files are committed,
 * and a translation change should read in a diff as the line that changed. */
function writeLangPayloads() {
  const langs = Object.keys(TRANSLATIONS);
  for (const lang of langs) {
    const t = TRANSLATIONS[lang];
    const entries = Object.keys(t).map(
      k => `  ${JSON.stringify(k)}: ${JSON.stringify(t[k])}`).join(",\n");
    const out = [
      "/* GENERATED by tools/build-locales.js -- do not edit.",
      `   The ${lang} slice of assets/i18n.js, which is the file to edit. */`,
      "const TRANSLATIONS = {",
      `${JSON.stringify(lang)}: {`,
      entries,
      "}",
      "};",
      "",
    ].join("\n");
    emitAsset(`i18n.${lang}.js`, out);
  }
  return langs;
}
/* ── the language offer, in every language ───────────────────────
 * A page loads only its own language, which is the whole point of the split
 * -- but the bar that offers French to a French speaker on /be/ has to be
 * written in French, and /be/ has no French.
 *
 * Two short strings per language is all it needs, so they go in a file of
 * their own rather than undoing the split or fetching a whole payload to
 * read one sentence. Under a kilobyte, and the same file on every page. */
function writeLangOffer() {
  const out = {};
  for (const lang of Object.keys(TRANSLATIONS)) {
    const t = TRANSLATIONS[lang];
    if (!t['lang.offer']) continue;
    out[lang] = { o: t['lang.offer'], d: t['lang.dismiss'] || '' };
  }
  const body = [
    '/* GENERATED by tools/build-locales.js -- do not edit.',
    '   The offer-a-language bar, in each language. Edit assets/i18n.js. */',
    'window.__DRP_LANG_OFFER__ = ' + JSON.stringify(out) + ';',
    '',
  ].join('\n');
  emitAsset('lang-offer.js', body);
  return Object.keys(out);
}
/* Both of these are called from main() at the foot of this file rather than
   here. A page cannot reference a hashed filename until the hash exists, so
   everything a page loads has to be emitted before the first page is built,
   in one ordered place. */

/* ── the rate a page starts from ─────────────────────────────────
 * Every non-euro market painted €499 and held it for 1.2s, 2.9s on a slow
 * connection, because conversion could not start until /api/rates answered.
 * A visitor in São Paulo or Santiago read a euro price for the first second
 * of every pageview.
 *
 * So the day's rates are written here and shipped with the page, and
 * locale.js converts on first paint instead of waiting. The live rate is
 * still fetched and still wins -- this only decides what is on screen for
 * the second before it arrives.
 *
 * In its own file rather than inlined into all 84 pages: rates move daily,
 * and a figure inlined per page would put a diff through every page on
 * every build. This way the pages stay byte-identical and one small asset
 * changes.
 *
 * If the fetch fails the file is written empty. That returns the old
 * behaviour -- a euro flash -- which is worse than instant but better than
 * shipping a rate nobody checked. */
async function writeBootstrapRates() {
  const head = [
    '/* GENERATED by tools/build-locales.js -- do not edit.',
    '   A starting rate so prices are not euro for the first second. The live',
    '   rate from /api/rates replaces it as soon as it lands. */',
  ].join('\n');

  let rates = null;
  try {
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), 8000);
    const res = await fetch('https://open.er-api.com/v6/latest/EUR', { signal: ctl.signal });
    clearTimeout(timer);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    if (!data || !data.rates || !data.rates.USD) throw new Error('malformed');
    rates = data.rates;
  } catch (err) {
    console.warn('rates.boot.js: no live rates (' + err.message
      + '), writing empty -- prices will flash euro until /api/rates lands');
  }

  // Only the currencies the markets actually use. The feed quotes 166.
  const wanted = {};
  if (rates) {
    for (const code of CODES) {
      const cur = MARKETS[code].currency;
      if (cur !== 'EUR' && rates[cur]) wanted[cur] = rates[cur];
    }
  }

  emitAsset('rates.boot.js', head + '\n'
    + 'window.__DRP_RATES__ = ' + JSON.stringify(wanted) + ';\n');
  return Object.keys(wanted);
}

/* -- build ----------------------------------------------------------------
 *
 * Assets first, pages second, and the order is a requirement rather than a
 * preference: a page cannot reference a hashed filename before the hash
 * exists. That is why the rates fetch is awaited here, at the top, when it
 * used to run last and asynchronously -- it produces one of the files the
 * pages have to name.
 *
 * A rates outage still does not fail the build. writeBootstrapRates catches
 * its own network errors and emits an empty table, which costs a euro flash
 * on first paint and nothing else. */
async function main() {
  const parts = buildStylesheet();
  console.log(`styles.css: ${parts} parts from src/css`);

  ['app.js', 'locale.js', 'consent.js', 'markets.js'].forEach(copyAsset);

  const offers = writeLangOffer();
  console.log(`lang-offer.js: ${offers.length} languages`);
  const langs = writeLangPayloads();
  console.log(`wrote ${langs.length} language payloads: ${langs.join(", ")}`);
  const cur = await writeBootstrapRates();
  console.log('rates.boot.js: '
    + (cur.length ? cur.join(', ') : 'empty, prices will flash euro'));

  const codes = ONLY ? [ONLY] : CODES;
  let n = 0;
  for (const code of codes) {
    for (const page of PAGES) { build(code, page); n++; }
  }
  console.log(`generated ${n} pages across ${codes.length} market${codes.length === 1 ? '' : 's'}`);

  if (ONLY) {
    /* The sitemap would list one market and the prune would delete the files
       the other twenty are still pointing at. Neither is survivable in a
       commit, so both are skipped and the run says what it is. */
    console.log('');
    console.log(`  --market=${ONLY}: sitemap and prune skipped, other markets untouched.`);
    console.log('  Local preview only. Run a full `npm run build` before committing.');
    return;
  }

  /* -- sitemap ------------------------------------------------------------
   * Every market page, so each is discoverable rather than relying on the
   * crawler following hreflang. */
  const urls = [];
  for (const code of CODES) {
    for (const page of PAGES) {
      const loc = `${ORIGIN}/${code}${page.route || '/'}`;
      const alts = CODES.map(c =>
        `    <xhtml:link rel="alternate" hreflang="${MARKETS[c].lang}-${c.toUpperCase()}" href="${ORIGIN}/${c}${page.route || '/'}"/>`
      ).join('\n');
      urls.push(
        `  <url>\n    <loc>${loc}</loc>\n`
        + `    <lastmod>${new Date().toISOString().slice(0, 10)}</lastmod>\n`
        + `    <changefreq>${page.route ? 'monthly' : 'weekly'}</changefreq>\n`
        + `    <priority>${page.route ? '0.8' : '1.0'}</priority>\n`
        + alts + '\n'
        + `    <xhtml:link rel="alternate" hreflang="x-default" href="${ORIGIN}/${FALLBACK}${page.route || '/'}"/>\n`
        + '  </url>'
      );
    }
  }
  fs.writeFileSync(path.join(ROOT, 'sitemap.xml'),
    '<?xml version="1.0" encoding="UTF-8"?>\n'
    + '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n'
    + '        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n'
    + urls.join('\n') + '\n</urlset>\n', 'utf8');
  console.log(`sitemap.xml: ${urls.length} URLs`);

  const gone = pruneBuildDir();
  console.log(`assets/build: ${EMITTED.size} live${gone ? `, ${gone} stale removed` : ''}`);
}

main().catch(err => { console.error(err); process.exit(1); });
