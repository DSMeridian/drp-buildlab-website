#!/usr/bin/env node
/*
 * Bakes the translated text into the generated market pages.
 *
 *   node tools/build-locales.js     # structure: URLs, canonical, hreflang
 *   node tools/prerender.js         # text: this script
 *
 * Run the two in that order. build-locales.js rewrites the market
 * directories from src/, which throws away anything this script did, so
 * prerender always runs second.
 *
 * Why a browser rather than translating in Node: applyLang() in app.js maps
 * 126 translation keys onto the DOM through a long list of selectors. Any
 * reimplementation here would be a second copy of that mapping, and the two
 * would drift the first time somebody edited one of them. Loading the page
 * and letting the real applyLang run means the output is by construction
 * whatever the site would have shown anyway.
 *
 * Before this, every market page shipped Dutch body text with a <html lang>
 * claiming otherwise -- /jp/ told crawlers it was Japanese and handed them
 * "Jouw bedrijf". The pages were indexable in structure but not in content.
 *
 * Requires playwright-core and a Chromium build:
 *   npm install
 *   npx playwright install chromium      (once, if you have no Chromium yet)
 *
 * Netlify never runs this. The output is committed, like build-locales.js.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright-core');

const ROOT = path.resolve(__dirname, '..');
const MARKETS = require(path.join(ROOT, 'assets', 'markets.js'));
const CODES = Object.keys(MARKETS).filter(k => !k.startsWith('__'));
const ONLY = (process.argv.slice(2).find(a => a.startsWith('--market=')) || '').split('=')[1] || '';
const RENDER = ONLY ? [ONLY] : CODES;
const ROUTES = ['', '/over-ons', '/prijzen', '/contact'];
// Checked after each render: if applyLang did not run, the page would be
// written back still in Dutch and the bug would look fixed.
const LANG_OF = Object.fromEntries(CODES.map(c => [c, MARKETS[c].lang]));

/* Proof that the translation actually ran, without which a page that failed
 * to translate would be written back in Dutch -- the bug this script exists
 * to fix. The title is the right thing to assert on: applyLang sets it on
 * every page and it differs per language, where a nav label like "Home" is
 * identical in Dutch and English and would prove nothing. */
const TRANSLATIONS = eval(
  fs.readFileSync(path.join(ROOT, 'assets', 'i18n.js'), 'utf8') + ';TRANSLATIONS');
const PAGE_KEY = { '': 'home', '/over-ons': 'about', '/prijzen': 'pricing', '/contact': 'contact' };

function expectedTitle(lang, route) {
  const t = TRANSLATIONS[lang];
  return t['meta.title.' + PAGE_KEY[route]] || t['meta.title'];
}
const PORT = 8123;

/* Chromium locations playwright-core will not find on its own, because the
 * package here is intentionally the "core" one with no bundled browser. */
function findChromium() {
  if (process.env.CHROMIUM_PATH) return process.env.CHROMIUM_PATH;
  const home = process.env.USERPROFILE || process.env.HOME || '';
  const candidates = [
    path.join(home, 'AppData/Local/ms-playwright'),
    path.join(home, '.cache/ms-playwright'),
  ];
  for (const base of candidates) {
    if (!fs.existsSync(base)) continue;
    for (const dir of fs.readdirSync(base)) {
      if (!dir.startsWith('chromium-')) continue;
      for (const rel of ['chrome-win64/chrome.exe', 'chrome-win/chrome.exe',
                         'chrome-linux/chrome', 'chrome-mac/Chromium.app/Contents/MacOS/Chromium']) {
        const p = path.join(base, dir, rel);
        if (fs.existsSync(p)) return p;
      }
    }
  }
  return null;
}

/* A static server over the repo, so the pages load their real assets by the
 * same absolute paths they use in production. */
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.json': 'application/json',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json',
};

function serve() {
  return http.createServer((req, res) => {
    const url = decodeURIComponent(req.url.split('?')[0]);
    // Rates are deliberately unavailable: prices must stay in EUR in the
    // committed HTML. Baking a converted figure would freeze one moment's
    // exchange rate into a static file and quietly go stale.
    if (url.startsWith('/api/')) { res.writeHead(503).end('{}'); return; }
    /* Same reasoning for the bootstrap rate: it exists so a visitor never
     * sees euro, but here it would convert the prices and this script would
     * serialise the result -- freezing today's rate into a committed file,
     * which is the thing the line above exists to prevent. The page keeps
     * its <script> tag either way; it just gets nothing to work with. */
    if (url.startsWith('/assets/build/rates.boot.') && url.endsWith('.js')) {
      res.writeHead(503).end(''); return;
    }
    let file = path.join(ROOT, url);
    if (!path.extname(file)) file = path.join(file, 'index.html');
    if (!fs.existsSync(file) || !fs.statSync(file).isFile()) { res.writeHead(404).end(); return; }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
}

/* Everything app.js and locale.js write at runtime that must NOT end up in a
 * static file: reveal state, animation transforms, the webfont override, and
 * the comparison table's column widths, which are measured from the viewport
 * this render happened to use. */
function stripRuntimeState() {
  document.querySelectorAll('.rv.vv').forEach(el => el.classList.remove('vv'));
  document.body.classList.remove('scta-on');
  document.querySelectorAll('.scta.on').forEach(el => el.classList.remove('on'));
  document.querySelectorAll('[data-counted]').forEach(el => el.removeAttribute('data-counted'));

  // Counters animate from zero, so serializing mid-run baked "€1" and
  // "€19" in place of "€499" and "€29" -- a wrong price in the
  // static HTML, which is what a crawler and a JS-disabled visitor read.
  // Reset each to its resting value: prefix + the raw EUR figure + suffix,
  // deliberately unconverted, matching the rule that prices stay in euro
  // in the file and convert client-side.
  document.querySelectorAll('[data-count]').forEach(el => {
    var raw = parseInt(el.dataset.count) || 0;
    if (!raw) return;
    el.textContent = (el.dataset.prefix || '') + raw + (el.dataset.suffix || '');
  });

  // Word-by-word hero reveal staggers an "in" class over ~60ms per word, so
  // whichever words had landed by serialization time were frozen visible
  // while the rest stayed hidden -- a different subset every run.
  document.querySelectorAll('.wr.in, .hl-i.in').forEach(el => el.classList.remove('in'));

  /* Then undo the word split itself, and put the plain heading text back.
   *
   * Removing "in" above is right but was not enough. A .wr is
   * translateY(110%) inside an overflow:hidden box, so without "in" every
   * heading shipped invisible -- and the split also bakes data-wr="1", which
   * makes triggerWordReveals() return before it creates the observer that
   * would have revealed them. The only thing that recovered a heading was
   * applyLang re-splitting it from the translations.
   *
   * So if assets/i18n.<lang>.js was slow or failed, every heading on the page
   * stayed blank and every price stayed in euro. Reproduced by blocking that
   * one file: the page renders, and the largest text on it is simply gone.
   *
   * Prerendering exists so the page works before and without JavaScript.
   * Shipping the headings pre-split defeated that for the most prominent
   * copy on the site, so the split is undone here. app.js splits and animates
   * them on load exactly as it did, and because data-wr is gone it now builds
   * the observer even when applyLang never runs. */
  document.querySelectorAll('[data-wr]').forEach(el => {
    el.querySelectorAll('.wr-w').forEach(w => {
      const inner = w.querySelector('.wr');
      const frag = document.createDocumentFragment();
      if (inner) { while (inner.firstChild) frag.appendChild(inner.firstChild); }
      w.replaceWith(frag);
    });
    el.removeAttribute('data-wr');
  });


  // Webfont stack is applied per language at runtime; leaving it inline would
  // pin it before the font has loaded.
  document.body.style.removeProperty('font-family');

  const tbl = document.querySelector('.ctbl');
  if (tbl) {
    tbl.classList.remove('scrolls', 'measuring');
    ['--c1', '--c2', '--c3', '--c4'].forEach(v => tbl.style.removeProperty(v));
    if (!tbl.getAttribute('style')) tbl.removeAttribute('style');
  }
  document.querySelectorAll('.cur-note').forEach(el => el.remove());
  /* The language offer depends on the visitor's own browser languages, and
   * headless Chromium has its own. Baking it would show every visitor an
   * offer chosen for the build machine. */
  document.querySelectorAll('.lang-offer').forEach(el => el.remove());

  /* The cookie banner and anything Google Tag Manager injected.
   *
   * Both are created by script at runtime, so serialising the DOM baked them
   * into the committed page -- and both are actively harmful there. The
   * banner arrived inert: no listeners, and consent.js then added a second,
   * live one beside it, so the visitor met two banners and clicked the dead
   * one. The tag manager was worse: its own loader inserts a <script src>
   * high in the head, which serialised ABOVE the consent defaults, so the
   * committed page loaded GTM before anything had said 'denied'.
   *
   * The requests are refused during prerendering as well, so in practice
   * there is nothing left to remove -- this is the belt to that braces. */
  // .ccb-manage too: baked, it is a dead button, and addFooterLink sees it
  // and declines to add the live one.
  document.querySelectorAll('.ccb, .ccb-manage').forEach(el => el.remove());
  /* The annotation rail. This context renders with reducedMotion 'reduce',
   * so app.js declines to build one and there is normally nothing here --
   * but baked it would be a scroll indicator frozen on section 01, pointing
   * at the wrong place on every page and unable to correct itself without
   * the JS that was going to create it anyway. */
  document.querySelectorAll('.arail').forEach(el => el.remove());
  document.querySelectorAll('script[src*="googletagmanager"]').forEach(el => el.remove());
  document.querySelectorAll('[style=""]').forEach(el => el.removeAttribute('style'));
}

(async () => {
  const exe = findChromium();
  if (!exe) {
    console.error('No Chromium found. Set CHROMIUM_PATH, or run:\n  npx playwright install chromium');
    process.exit(1);
  }

  const server = serve();
  await new Promise(r => server.listen(PORT, '127.0.0.1', r));
  const browser = await chromium.launch({ executablePath: exe });
  // Wide viewport so the comparison table never enters its scrolling mode
  // during the render; reduced motion so reveals settle without animating.
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 1200 }, reducedMotion: 'reduce' });
  // One page for the whole run: opening sixty-eight was enough for Chromium
  // to crash a target partway through.
  const page = await ctx.newPage();
  /* No build should contact Google. Prices and the language offer are
   * already starved of their inputs here for the same reason: whatever the
   * page does with a live service, the committed file must not carry. */
  await page.route('**://*.googletagmanager.com/**', r => r.abort());
  const errors = [];
  page.on('pageerror', e => errors.push(e.message.slice(0, 80)));

  let done = 0, failed = 0;
  for (const code of RENDER) {
    for (const route of ROUTES) {
      const rel = path.join(code.split('-').join('/'), route.replace(/^\//, ''), 'index.html');
      const dest = path.join(ROOT, rel);
      if (!fs.existsSync(dest)) { console.log('  skip (missing) ' + rel); continue; }

      errors.length = 0;
      try {
        // domcontentloaded, not networkidle: the webfonts and the marquee's
        // animation loop keep the page permanently "busy", so networkidle
        // never fires. The scripts are deferred, so applyLang has already run
        // by this point anyway.
        await page.goto(`http://127.0.0.1:${PORT}/${code.split('-').join('/')}${route || '/'}`,
          { waitUntil: 'domcontentloaded', timeout: 30000 });

        // Wait for the translation itself rather than a timeout, and fail
        // loudly if it never lands.
        const title = expectedTitle(LANG_OF[code], route);
        await page.waitForFunction(
          expected => document.title === expected, title, { timeout: 15000 });

        const lang = await page.evaluate(() => document.documentElement.lang);
        if (lang !== LANG_OF[code]) throw new Error(`lang came out ${lang}`);

        // Strip and serialize in ONE evaluate. As two calls the marquee's
        // requestAnimationFrame loop got a frame in between and re-applied
        // its transform, so a scroll offset was baked into whichever pages
        // lost the race -- four of sixty-eight, differing per run. rAF cannot
        // interleave with synchronous JS, so one turn makes this atomic.
        const html = await page.evaluate(stripSrc => {
          (0, eval)('(' + stripSrc + ')')();
          return '<!DOCTYPE html>' + String.fromCharCode(10) + document.documentElement.outerHTML;
        }, stripRuntimeState.toString());
        fs.writeFileSync(dest, html, 'utf8');
        done++;
        if (errors.length) console.log('  note ' + rel + ': ' + errors[0]);
      } catch (err) {
        failed++;
        console.error('  FAILED ' + rel + ': ' + err.message);
      }
    }
    process.stdout.write('.');
  }

  await browser.close();
  server.close();
  console.log(`\nprerendered ${done} pages` + (failed ? `, ${failed} FAILED` : ''));
  process.exit(failed ? 1 : 0);
})();
