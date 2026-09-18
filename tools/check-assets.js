#!/usr/bin/env node
/*
 * Asset resilience: does a page still work when its hashed assets are gone?
 *
 * Every file a page loads is content-addressed into assets/build/ and served
 * immutable for a year, and pruneBuildDir() deletes the hashes the current
 * build did not emit. That combination means a browser holding a page from
 * before a deploy asks for a stylesheet that no longer exists -- and a 404
 * for the one stylesheet renders the site as unstyled markup rather than as
 * a slightly out-of-date page. It was reported from production on /lu/.
 *
 * build-locales.js answers it with an onerror on each reference that has an
 * unhashed twin under /assets/. This asserts the answer actually works, by
 * serving the built site with every assets/build/ request answered 404 and
 * checking the page still comes out styled and wired.
 *
 * Asserting the attribute is present would not be enough. The bug being
 * guarded is a resource that fails to load, and only a browser can tell you
 * whether the recovery it triggers really recovers.
 *
 * Usage
 *   node tools/check-assets.js
 *   node tools/check-assets.js --market=lu,jp
 */
'use strict';

const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright-core');

const ROOT = path.resolve(__dirname, '..');
const PORT = 8142;

const ARGV = process.argv.slice(2);
const listArg = name => {
  const hit = ARGV.find(a => a.startsWith('--' + name + '='));
  return hit ? hit.slice(name.length + 3).split(',').map(s => s.trim()).filter(Boolean) : [];
};
const MARKETS = listArg('market').length ? listArg('market') : ['be', 'lu', 'jp', 'ae'];

function findChromium() {
  if (process.env.CHROMIUM_PATH) return process.env.CHROMIUM_PATH;
  const home = process.env.USERPROFILE || process.env.HOME || '';
  for (const base of [path.join(home, 'AppData/Local/ms-playwright'),
                      path.join(home, '.cache/ms-playwright')]) {
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

const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.ico': 'image/x-icon', '.webp': 'image/webp', '.woff2': 'font/woff2',
  '.webmanifest': 'application/manifest+json' };

/* `purge` is the whole experiment: when true the server pretends the last
   build never happened and every content-addressed file is gone. */
function serve(purge) {
  return http.createServer((req, res) => {
    const url = decodeURIComponent(req.url.split('?')[0]);
    if (url.startsWith('/api/')) { res.writeHead(503).end('{}'); return; }
    if (purge && url.startsWith('/assets/build/')) { res.writeHead(404).end(); return; }
    let file = path.join(ROOT, url);
    if (!path.extname(file)) file = path.join(file, 'index.html');
    if (!fs.existsSync(file) || !fs.statSync(file).isFile()) { res.writeHead(404).end(); return; }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
}

const results = [];
const check = (n, p, d) => results.push({ n, p, d });

async function measure(page, base, rel) {
  await page.goto(base + rel, { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  return page.evaluate(() => {
    let rules = 0, sheets = [];
    for (const s of document.styleSheets) {
      let n = 0;
      try { n = s.cssRules ? s.cssRules.length : 0; } catch (e) { n = -1; }
      rules += Math.max(n, 0);
      sheets.push((s.href || 'inline') + ':' + n);
    }
    const body = getComputedStyle(document.body);
    return {
      rules, sheets,
      bg: body.backgroundColor,
      font: body.fontFamily,
      /* app.js sets this up; it is the cheapest proof the scripts ran. */
      marketsLoaded: typeof window.DRP_MARKETS === 'object' && !!window.DRP_MARKETS,
      lang: document.documentElement.lang,
    };
  });
}

(async () => {
  const exe = findChromium();
  if (!exe) { console.error('No Chromium found. Set CHROMIUM_PATH, or run:\n  npx playwright install chromium'); process.exit(1); }
  const browser = await chromium.launch({ executablePath: exe });
  const base = 'http://127.0.0.1:' + PORT;

  for (const purge of [false, true]) {
    const server = serve(purge);
    await new Promise(r => server.listen(PORT, '127.0.0.1', r));
    const label = purge ? 'assets purged' : 'assets present';

    for (const mk of MARKETS) {
      const rel = '/' + mk.split('-').join('/') + '/';
      if (!fs.existsSync(path.join(ROOT, rel, 'index.html'))) continue;
      const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
      const page = await ctx.newPage();
      const m = await measure(page, base, rel);

      /* The number that matters. Unstyled is not "fewer rules", it is none:
         the reported page had a serif body on a white ground. */
      check(mk + ' [' + label + '] stylesheet applied', m.rules > 100, m.rules + ' rules; ' + m.sheets.join(', '));
      check(mk + ' [' + label + '] dark ground kept', m.bg === 'rgb(0, 0, 0)', m.bg);
      check(mk + ' [' + label + '] site face kept', /Jakarta/.test(m.font), m.font);
      check(mk + ' [' + label + '] scripts ran', m.marketsLoaded === true, 'DRP_MARKETS=' + m.marketsLoaded);
      await ctx.close();
    }
    await new Promise(r => server.close(r));
  }

  await browser.close();

  let bad = 0;
  for (const r of results) { if (!r.p) { console.log('  FAIL ' + r.n + (r.d ? '  -> ' + r.d : '')); bad++; } }
  console.log('\n' + (results.length - bad) + '/' + results.length + ' passed'
    + (bad ? '' : ' — a page whose hashed assets have been pruned still renders styled and wired'));
  process.exit(bad ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
