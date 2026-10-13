#!/usr/bin/env node
/* Turns the English base pages from build.js into the real site: every page
   in every market of assets/markets.js, in that market's language.

     node tools/concept/build.js       English base pages -> .concept-base/
     node tools/concept/localize.js    markets -> concept/   (publish dir)

   Translation
   Each page is loaded in headless Chromium with scripts off. Text is cut into
   blocks (a heading, a paragraph, a button, a label...) and each block is
   translated by DeepL as HTML, so inline markup survives and anything marked
   translate="no" (names, URLs, prices, legal text) is left alone. Every
   translation is stored in tools/concept/i18n/<lang>.json, keyed by a hash of
   the English block: a rebuild only pays for blocks that changed, and a
   reviewer can correct a translation by editing its "t" value there.

   Options
     --dry-run       count what would be sent to DeepL, translate nothing
     --langs=nl,fr   only these languages (others keep their cached copy) */
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { pathToFileURL } = require('url');
const { chromium } = require('playwright-core');

const ROOT = path.join(__dirname, '..', '..');
const BASE = path.join(ROOT, '.concept-base');
const SITE = path.join(ROOT, 'concept');
const I18N = path.join(__dirname, 'i18n');
const ORIGIN = 'https://drpbuildlab.com';
const MARKETS = require(path.join(ROOT, 'assets', 'markets.js'));
const argv = process.argv.slice(2);
const DRY = argv.includes('--dry-run');
const ONLY = ((argv.find(a => a.startsWith('--langs=')) || '').split('=')[1] || '').split(',').filter(Boolean);

/* ── markets ─────────────────────────────────────────────────────────── */
const MK = Object.keys(MARKETS).filter(k => !k.startsWith('__')).map(key => {
  const m = MARKETS[key];
  const [cc, sub] = key.split('-');
  return { key, cc, prefix: sub ? `${cc}/${sub}` : cc, lang: m.lang, currency: m.currency, name: m.name, region: m.region, hreflang: `${m.lang}-${cc.toUpperCase()}` };
});
const RTL = MARKETS.__rtl || [];
const FALLBACK = MARKETS.__fallback || 'ie';
const LANG_NAME = { nl: 'Nederlands', en: 'English', fr: 'Français', de: 'Deutsch', it: 'Italiano', es: 'Español', pt: 'Português', pl: 'Polski', id: 'Bahasa Indonesia', ja: '日本語', ar: 'العربية', af: 'Afrikaans' };
const LANG_HOME = { nl: 'be', fr: 'fr', de: 'de', it: 'it', es: 'es', pt: 'br', pl: 'pl', en: 'ie', id: 'id', ja: 'jp', ar: 'ae', af: 'za-af' };
const DEEPL = { nl: 'NL', fr: 'FR', de: 'DE', it: 'IT', es: 'ES', pl: 'PL', pt: 'PT-BR', id: 'ID', ja: 'JA', ar: 'AR', af: 'AF' };
const FORMAL = new Set(['NL', 'FR', 'DE', 'IT', 'ES', 'PL', 'PT-BR', 'JA']);
const LANGS = [...new Set(MK.map(m => m.lang))];

/* ── DeepL ───────────────────────────────────────────────────────────── */
function deeplKey() {
  if (process.env.DEEPL_API_KEY) return process.env.DEEPL_API_KEY.trim();
  const env = fs.existsSync(path.join(ROOT, '.env')) ? fs.readFileSync(path.join(ROOT, '.env'), 'utf8') : '';
  const m = env.match(/^DEEPL_API_KEY\s*=\s*(.+)$/m);
  return m ? m[1].trim().replace(/^["']|["']$/g, '') : '';
}
async function deepl(texts, target, html) {
  const key = deeplKey();
  if (!key) throw new Error('No DEEPL_API_KEY (environment or .env)');
  const host = key.endsWith(':fx') ? 'https://api-free.deepl.com' : 'https://api.deepl.com';
  const body = new URLSearchParams();
  texts.forEach(t => body.append('text', t));
  body.append('source_lang', 'EN');
  body.append('target_lang', target);
  if (html) body.append('tag_handling', 'html');
  if (FORMAL.has(target)) body.append('formality', 'prefer_more');
  for (let attempt = 1; ; attempt++) {
    const res = await fetch(host + '/v2/translate', { method: 'POST', headers: { Authorization: 'DeepL-Auth-Key ' + key }, body });
    if (res.ok) return (await res.json()).translations.map(t => t.text);
    if (attempt >= 4 || ![429, 456, 500, 502, 503, 504].includes(res.status)) throw new Error(`DeepL ${res.status}: ${await res.text()}`);
    await new Promise(r => setTimeout(r, 1500 * attempt));
  }
}

const hash = s => crypto.createHash('sha1').update(s).digest('hex').slice(0, 16);
const loadCache = l => { const f = path.join(I18N, l + '.json'); return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : {}; };
const saveCache = (l, c) => { fs.mkdirSync(I18N, { recursive: true }); fs.writeFileSync(path.join(I18N, l + '.json'), JSON.stringify(c, null, 1) + '\n'); };

/* ── in-page work (runs inside Chromium) ─────────────────────────────── */
function pageExtract() {
  /* prices that convert per market */
  const PUBLIC = new Set(['499', '29']);
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const hits = [];
  while (walker.nextNode()) { const n = walker.currentNode; if (/€\s?\d/.test(n.nodeValue) && !n.parentElement.closest('script,style,.money')) hits.push(n); }
  hits.forEach(n => {
    const frag = document.createDocumentFragment(); let last = 0; const s = n.nodeValue;
    s.replace(/€\s?(\d[\d.,]*)/g, (m, num, i) => {
      if (!PUBLIC.has(num)) return m;
      frag.append(s.slice(last, i));
      const sp = document.createElement('span'); sp.className = 'money'; sp.dataset.eur = num; sp.setAttribute('translate', 'no'); sp.textContent = m;
      frag.append(sp); last = i + m.length; return m;
    });
    frag.append(s.slice(last)); n.replaceWith(frag);
  });

  const BLOCK = new Set(['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'LI', 'DT', 'DD', 'DIV', 'UL', 'OL', 'DL', 'TABLE', 'THEAD', 'TBODY', 'TR', 'TD', 'TH', 'SECTION', 'ARTICLE', 'FORM', 'FIELDSET', 'FIGURE', 'FIGCAPTION', 'HEADER', 'FOOTER', 'NAV', 'MAIN', 'DETAILS', 'SUMMARY', 'LABEL', 'LEGEND', 'BUTTON', 'ADDRESS', 'SELECT', 'OPTION', 'TEXTAREA', 'INPUT', 'BLOCKQUOTE', 'VIDEO', 'IMG']);
  const SKIP = 'script,style,svg,noscript,video,[translate="no"]';
  const units = [];
  /* A block is translated whole when it reads as one piece of text: a
     heading, or an element with words of its own between its inline tags.
     A menu, a list of links or a label next to a value has no words of its
     own, so its parts are translated one by one and keep their structure. */
  const HEADING = new Set(['H1', 'H2', 'H3', 'H4']);
  const ownText = el => [...el.childNodes].some(n => n.nodeType === 3 && /\p{L}/u.test(n.nodeValue));
  const visit = el => {
    if (el.matches(SKIP)) return;
    const hasBlock = [...el.querySelectorAll('*')].some(d => BLOCK.has(d.tagName));
    if (!hasBlock && (HEADING.has(el.tagName) || ownText(el) || !el.children.length)) { if (/\p{L}/u.test(el.textContent)) units.push(el); return; }
    [...el.children].forEach(visit);
  };
  [...document.body.children].forEach(visit);
  units.forEach((u, i) => u.setAttribute('data-tu', i));
  const attrs = [];
  document.querySelectorAll('[alt],[aria-label],[placeholder],[title]').forEach((el, i) => {
    if (el.closest('[translate="no"]') && !el.matches('img')) return;
    ['alt', 'aria-label', 'placeholder', 'title'].forEach(a => { const v = el.getAttribute(a); if (v && /\p{L}/u.test(v)) attrs.push({ i, a, v }); });
    el.setAttribute('data-ta', i);
  });
  const meta = document.querySelector('meta[name="description"]');
  return { units: units.map(u => u.innerHTML), attrs, title: document.title, desc: meta ? meta.content : '' };
}
function pageApply({ units, attrs, title, desc }) {
  document.querySelectorAll('[data-tu]').forEach(el => { const t = units[+el.dataset.tu]; if (t != null) el.innerHTML = t; el.removeAttribute('data-tu'); });
  attrs.forEach(({ i, a, t }) => { const el = document.querySelector(`[data-ta="${i}"]`); if (el && t) el.setAttribute(a, t); });
  document.querySelectorAll('[data-ta]').forEach(el => el.removeAttribute('data-ta'));
  if (title) document.title = title;
  const meta = document.querySelector('meta[name="description"]'); if (meta && desc) meta.content = desc;
  return '<!doctype html>\n' + document.documentElement.outerHTML;
}

/* ── per-market finishing (string work) ──────────────────────────────── */
function consentTranslations() {
  const vm = require('vm');
  const code = fs.readFileSync(path.join(ROOT, 'assets', 'i18n.js'), 'utf8') + '\n;globalThis.__T = TRANSLATIONS;';
  const box = {}; vm.createContext(box); vm.runInContext(code, box);
  const out = {};
  for (const [l, block] of Object.entries(box.__T || {})) { out[l] = {}; for (const [k, v] of Object.entries(block)) if (k.startsWith('cc.')) out[l][k] = v; }
  return out;
}
const CC = consentTranslations();

function consentHead() {
  const gtm = (MARKETS.__gtm || '').trim();
  if (!gtm) return '';
  return `<script>
window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}
gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',personalization_storage:'denied',functionality_storage:'granted',security_storage:'granted',wait_for_update:500});
gtag('set','ads_data_redaction',true);
try{var c=JSON.parse(localStorage.getItem('drp-consent')||'null');if(c&&c.v===1){gtag('consent','update',{analytics_storage:c.analytics?'granted':'denied',ad_storage:c.marketing?'granted':'denied',ad_user_data:c.marketing?'granted':'denied',ad_personalization:c.marketing?'granted':'denied',personalization_storage:c.marketing?'granted':'denied'});}}catch(e){}
</script>
<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({"gtm.start":new Date().getTime(),event:"gtm.js"});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtm}');</script>`;
}

const url = (m, page) => `${ORIGIN}/${m.prefix}/${page ? page + '/' : ''}`;
const ESC = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

function orgJsonLd(m) {
  return `<script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org', '@type': 'ProfessionalService', '@id': ORIGIN + '/#business', name: 'DRP BuildLab', url: url(m, ''),
    logo: ORIGIN + '/assets/icons/icon-512.png', image: ORIGIN + '/assets/img/og-image.png', telephone: '+32473744431', email: 'info@drpbuildlab.com', vatID: 'BE1033313383',
    address: { '@type': 'PostalAddress', streetAddress: 'Honingstraat 1D', addressLocality: 'Hallaar', postalCode: '2220', addressRegion: 'Antwerpen', addressCountry: 'BE' },
    areaServed: 'Worldwide', knowsLanguage: Object.keys(LANG_NAME),
    sameAs: ['https://www.instagram.com/drp_buildlab/', 'https://www.facebook.com/share/1Hz1mJG22E/', 'https://www.tiktok.com/@drpbuildlab'],
    makesOffer: [
      { '@type': 'Offer', name: 'One-page website with contact form', price: '499', priceCurrency: 'EUR' },
      { '@type': 'Offer', name: 'Website care plan', priceSpecification: { '@type': 'UnitPriceSpecification', price: '29', priceCurrency: 'EUR', unitCode: 'MON' } }
    ]
  })}</script>`;
}

function finish(tpl, m, page) {
  let h = tpl;
  const title = (h.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || 'DRP BuildLab';
  const desc = (h.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '';
  const canonical = url(m, page);
  const alts = MK.map(x => `<link rel="alternate" hreflang="${x.hreflang}" href="${url(x, page)}">`).join('\n')
    + `\n<link rel="alternate" hreflang="x-default" href="${url(MK.find(x => x.key === FALLBACK), page)}">`;
  const head = [
    `<script>window.__DRP_MARKET__=${JSON.stringify(m.key)};var TRANSLATIONS=${JSON.stringify({ [m.lang]: CC[m.lang] || CC.en || {} })};</script>`,
    consentHead(),
    `<link rel="canonical" href="${canonical}">`, alts,
    `<meta property="og:type" content="website"><meta property="og:site_name" content="DRP BuildLab"><meta property="og:url" content="${canonical}">`,
    `<meta property="og:title" content="${title}"><meta property="og:description" content="${desc}"><meta property="og:locale" content="${m.lang}_${m.cc.toUpperCase()}">`,
    `<meta property="og:image" content="${ORIGIN}/assets/img/og-image.png"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">`,
    `<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${title}"><meta name="twitter:description" content="${desc}"><meta name="twitter:image" content="${ORIGIN}/assets/img/og-image.png">`,
    `<link rel="manifest" href="/site.webmanifest"><link rel="apple-touch-icon" href="/apple-touch-icon.png"><link rel="icon" href="/favicon.ico" sizes="32x32">`,
    (MARKETS.__webfonts || {})[m.lang] ? `<link rel="stylesheet" href="${MARKETS.__webfonts[m.lang].href}">` : '',
    page === '' ? orgJsonLd(m) : ''
  ].filter(Boolean).join('\n');
  h = h.replace('<!--HEAD-->', head);
  /* a headline line that holds only punctuation joins the line before it */
  h = h.replace(/<\/span><\/span><span class="ln"><span>(?:<em>)?([。．.!！?？、,،]+)(?:<\/em>)?<\/span><\/span>/g, '$1</span></span>');
  h = h.replace(/<html lang="en"[^>]*>/, `<html lang="${m.lang}" dir="${RTL.includes(m.lang) ? 'rtl' : 'ltr'}" data-market="${m.key}" data-currency="${m.currency}">`);

  /* legal text: the binding Dutch for Dutch, English for everyone else */
  const keep = m.lang === 'nl' ? 'nl' : 'en';
  h = h.replace(/<article class="legal" data-legal="(\w+)"[\s\S]*?<\/article>/g, (all, l) => l === keep ? all : '');

  /* internal links get the market prefix */
  h = h.replace(/href="(\/[^"]*)"/g, (all, p) => /^\/(assets|img|media|api|favicon|apple-touch|site\.webmanifest)/.test(p) || p.startsWith('//') ? all : `href="/${m.prefix}${p}"`);

  /* language menu: this country's own variants first, then one market per language.
     The 404 page has no counterpart elsewhere, so its menus go to each home page. */
  const lp = page === '404' ? '' : page;
  const siblings = MK.filter(x => x.cc === m.cc);
  const pick = l => siblings.find(x => x.lang === l) || MK.find(x => x.key === (l === 'en' ? (siblings.find(s => s.lang === 'en') || {}).key || FALLBACK : LANG_HOME[l]));
  const langs = [...new Set([...siblings.map(x => x.lang), ...Object.keys(LANG_NAME)])];
  const langMenu = `<details class="lang"><summary aria-label="${ESC(LANG_NAME[m.lang])}" translate="no">${m.lang.toUpperCase()}</summary><ul translate="no">${langs.map(l => { const t = pick(l); return t ? `<li lang="${l}"${l === m.lang ? ' aria-current="true"' : ''}><a href="/${t.prefix}/${lp ? lp + '/' : ''}" hreflang="${t.hreflang}">${LANG_NAME[l]}</a></li>` : ''; }).join('')}</ul></details>`;
  h = h.replace('<!--LANGMENU-->', langMenu);

  /* country picker in the footer */
  const regions = [...new Set(MK.map(x => x.region))];
  const picker = `<details class="ft-market"><summary translate="no">${ESC(m.name)} · ${LANG_NAME[m.lang]}</summary><div class="mk-list" translate="no">${regions.map(r => `<h3>${r}</h3>` + MK.filter(x => x.region === r).map(x => `<a href="/${x.prefix}/${lp ? lp + '/' : ''}" hreflang="${x.hreflang}"${x.key === m.key ? ' aria-current="true"' : ''}>${ESC(x.name)} · ${LANG_NAME[x.lang]}</a>`).join('')).join('')}</div></details>`;
  h = h.replace('<!--MARKETS-->', picker);
  return h;
}

/* ── run ─────────────────────────────────────────────────────────────── */
(async () => {
  const pages = [];
  (function walk(dir, rel) {
    if (fs.existsSync(path.join(dir, 'index.html'))) pages.push(rel);
    for (const d of fs.readdirSync(dir, { withFileTypes: true })) if (d.isDirectory()) walk(path.join(dir, d.name), rel ? rel + '/' + d.name : d.name);
  })(BASE, '');
  if (!pages.length) throw new Error('No base pages; run tools/concept/build.js first.');

  const exe = process.env.CHROMIUM_PATH || (() => {
    const base = path.join(process.env.LOCALAPPDATA || '', 'ms-playwright');
    const dirs = fs.existsSync(base) ? fs.readdirSync(base).filter(d => /^chromium-\d+$/.test(d)).sort().reverse() : [];
    for (const d of dirs) for (const p of ['chrome-win64/chrome.exe', 'chrome-win/chrome.exe', 'chrome-linux/chrome']) if (fs.existsSync(path.join(base, d, p))) return path.join(base, d, p);
    return undefined;
  })();
  const browser = await chromium.launch({ executablePath: exe });
  const ctx = await browser.newContext();
  await ctx.route(/^https?:/, r => r.abort());

  /* 1. what is on each page, in English */
  const extract = {};
  for (const p of pages) {
    const pg = await ctx.newPage();
    await pg.goto(pathToFileURL(path.join(BASE, p, 'index.html')).href, { waitUntil: 'domcontentloaded' });
    await pg.addScriptTag({ content: '' }).catch(() => {});
    extract[p] = await pg.evaluate(pageExtract);
    await pg.close();
  }

  /* 2. translate whatever the caches do not have yet */
  const caches = {};
  let total = 0;
  for (const l of LANGS.filter(l => l !== 'en')) {
    const cache = caches[l] = loadCache(l);
    if (ONLY.length && !ONLY.includes(l)) continue;
    const need = new Map();
    for (const p of pages) {
      const e = extract[p];
      e.units.forEach(u => { const k = hash('h' + u); if (!cache[k]) need.set(k, { src: u, html: true }); });
      [...e.attrs.map(a => a.v), e.title, e.desc].filter(Boolean).forEach(v => { const k = hash('t' + v); if (!cache[k]) need.set(k, { src: v, html: false }); });
    }
    const chars = [...need.values()].reduce((n, x) => n + x.src.length, 0);
    total += chars;
    console.log(`${l}: ${need.size} new blocks, ${chars} characters${DRY ? ' (dry run)' : ''}`);
    if (DRY || !need.size) continue;
    for (const html of [true, false]) {
      const items = [...need.entries()].filter(([, x]) => x.html === html);
      for (let i = 0; i < items.length; i += 40) {
        const chunk = items.slice(i, i + 40);
        const out = await deepl(chunk.map(([, x]) => x.src), DEEPL[l], html);
        chunk.forEach(([k, x], j) => { cache[k] = { en: x.src, t: out[j] }; });
        saveCache(l, cache);
      }
    }
  }
  /* drop translations no page uses any more, so the files stay reviewable */
  if (!DRY) for (const l of Object.keys(caches)) {
    const used = new Set();
    for (const p of pages) { const e = extract[p]; e.units.forEach(u => used.add(hash('h' + u))); [...e.attrs.map(a => a.v), e.title, e.desc].filter(Boolean).forEach(v => used.add(hash('t' + v))); }
    const c = caches[l]; let dropped = 0;
    for (const k of Object.keys(c)) if (!used.has(k)) { delete c[k]; dropped++; }
    if (dropped) { saveCache(l, c); console.log(`${l}: dropped ${dropped} unused translations`); }
  }
  console.log(`total sent to DeepL this run: ${total} characters`);
  if (DRY) { await browser.close(); return; }

  /* 3. one template per language and page, then one file per market */
  for (const d of ['index.html', '404.html', 'werk', 'diensten', 'over-ons', 'prijzen', 'contact', 'partner-worden', 'algemene-voorwaarden', 'privacy', '404'])
    fs.rmSync(path.join(SITE, d), { recursive: true, force: true });
  for (const m of MK) fs.rmSync(path.join(SITE, m.prefix), { recursive: true, force: true });

  const urls = [];
  for (const l of LANGS) {
    const cache = caches[l] || {};
    for (const p of pages) {
      const e = extract[p];
      const pg = await ctx.newPage();
      await pg.goto(pathToFileURL(path.join(BASE, p, 'index.html')).href, { waitUntil: 'domcontentloaded' });
      await pg.evaluate(pageExtract);
      const tr = l === 'en' ? { units: e.units, attrs: [], title: '', desc: '' } : {
        units: e.units.map(u => (cache[hash('h' + u)] || {}).t ?? u),
        attrs: e.attrs.map(a => ({ ...a, t: (cache[hash('t' + a.v)] || {}).t })),
        title: (cache[hash('t' + e.title)] || {}).t, desc: (cache[hash('t' + e.desc)] || {}).t
      };
      const tpl = await pg.evaluate(pageApply, tr);
      await pg.close();
      for (const m of MK.filter(x => x.lang === l)) {
        if (p === '404') { if (m.key === FALLBACK) fs.writeFileSync(path.join(SITE, '404.html'), finish(tpl, m, p).replace(/<link rel="canonical"[^>]*>\n?/, '')); continue; }
        const out = path.join(SITE, m.prefix, p);
        fs.mkdirSync(out, { recursive: true });
        fs.writeFileSync(path.join(out, 'index.html'), finish(tpl, m, p));
        urls.push({ m, p });
      }
    }
    console.log(`wrote ${l}`);
  }
  await browser.close();

  /* 4. sitemap, with every market version of each page as an alternate */
  const today = new Date().toISOString().slice(0, 10);
  const sm = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">'];
  for (const { m, p } of urls) {
    sm.push(`<url><loc>${url(m, p)}</loc><lastmod>${today}</lastmod>${MK.map(x => `<xhtml:link rel="alternate" hreflang="${x.hreflang}" href="${url(x, p)}"/>`).join('')}<xhtml:link rel="alternate" hreflang="x-default" href="${url(MK.find(x => x.key === FALLBACK), p)}"/></url>`);
  }
  sm.push('</urlset>');
  fs.writeFileSync(path.join(SITE, 'sitemap.xml'), sm.join('\n') + '\n');

  /* 5. the static files a site root needs */
  const copy = (from, to) => { fs.mkdirSync(path.dirname(path.join(SITE, to)), { recursive: true }); fs.copyFileSync(path.join(ROOT, from), path.join(SITE, to)); };
  copy('robots.txt', 'robots.txt'); copy('favicon.ico', 'favicon.ico'); copy('apple-touch-icon.png', 'apple-touch-icon.png');
  for (const f of fs.readdirSync(path.join(ROOT, 'assets', 'icons'))) copy(path.join('assets', 'icons', f), path.join('assets', 'icons', f));
  if (!fs.existsSync(path.join(SITE, 'assets', 'img', 'og-image.png'))) copy(path.join('assets', 'img', 'og-image.png'), path.join('assets', 'img', 'og-image.png'));
  const man = JSON.parse(fs.readFileSync(path.join(ROOT, 'site.webmanifest'), 'utf8'));
  man.name = 'DRP BuildLab'; man.description = 'Custom websites and webshops for businesses worldwide.'; man.lang = 'en'; man.start_url = '/'; man.theme_color = '#0b0b0c'; man.background_color = '#0b0b0c';
  fs.writeFileSync(path.join(SITE, 'site.webmanifest'), JSON.stringify(man, null, 2) + '\n');
  fs.copyFileSync(path.join(__dirname, 'site', '_redirects'), path.join(SITE, '_redirects'));
  fs.copyFileSync(path.join(__dirname, 'site', '_headers'), path.join(SITE, '_headers'));
  console.log(`done: ${urls.length} pages in ${MK.length} markets, sitemap with ${urls.length} URLs`);
})().catch(e => { console.error(e); process.exit(1); });
