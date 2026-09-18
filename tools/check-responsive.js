#!/usr/bin/env node
/*
 * Responsive audit: loads real pages at real widths and reports what does
 * not fit.
 *
 * Reading the CSS tells you which breakpoints exist, not which ones work.
 * This measures the rendered page instead, and reports three things that
 * are always bugs rather than matters of taste:
 *
 *   overflow   the document is wider than the viewport, so the whole page
 *              scrolls sideways. Reported with the specific elements whose
 *              right edge sticks out, because "something overflows" is not
 *              an actionable bug report.
 *   tap        an interactive element smaller than the 24px minimum of
 *              WCAG 2.2 target size (2.5.8). Links inside a paragraph are
 *              exempt, as the spec exempts them.
 *   clipped    text cut off by a fixed height or overflow:hidden.
 *
 * Widths are the narrow end of the real range: 320 is the smallest phone
 * still in use, 360 the commonest Android, 390 a current iPhone, 768 the
 * portrait-tablet edge where the mobile nav hands over.
 *
 * Usage
 *   node tools/check-responsive.js                 every route, one market
 *   node tools/check-responsive.js --market=de,jp  markets known to be long
 *   node tools/check-responsive.js --all-markets   every market (slow)
 *   node tools/check-responsive.js --width=360     one width
 *
 * Language matters here: German and Polish compounds are much longer than
 * their English source and Japanese wraps differently, so a layout that
 * holds in /gb/ can still break in /de/. Hence --market.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright-core');

const ROOT = path.resolve(__dirname, '..');
const MARKETS = require(path.join(ROOT, 'assets', 'markets.js'));
const CODES = Object.keys(MARKETS).filter(k => !k.startsWith('__'));

const ARGV = process.argv.slice(2);
const listArg = name => {
  const hit = ARGV.find(a => a.startsWith('--' + name + '='));
  return hit ? hit.slice(name.length + 3).split(',').map(s => s.trim()).filter(Boolean) : [];
};

const WIDTHS = listArg('width').length ? listArg('width').map(Number) : [320, 360, 390, 768];
const ROUTES = ['', '/over-ons', '/prijzen', '/contact', '/partner-worden'];

/* One market per language by default. The layout is the same everywhere;
   what differs is how long the words are, and that follows the language. */
const ONE_PER_LANG = (() => {
  const seen = new Set(), out = [];
  for (const c of CODES) {
    const l = MARKETS[c].lang;
    if (seen.has(l)) continue;
    seen.add(l); out.push(c);
  }
  return out;
})();

const MARKETS_TO_CHECK = listArg('market').length ? listArg('market')
  : ARGV.includes('--all-markets') ? CODES
  : ONE_PER_LANG;

const PORT = 8124;

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

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.json': 'application/json',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon',
  '.webp': 'image/webp', '.jpg': 'image/jpeg', '.woff2': 'font/woff2',
  '.webmanifest': 'application/manifest+json',
};

function serve() {
  return http.createServer((req, res) => {
    const url = decodeURIComponent(req.url.split('?')[0]);
    if (url.startsWith('/api/')) { res.writeHead(503).end('{}'); return; }
    let file = path.join(ROOT, url);
    if (!path.extname(file)) file = path.join(file, 'index.html');
    if (!fs.existsSync(file) || !fs.statSync(file).isFile()) { res.writeHead(404).end(); return; }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
}

/* Runs in the page. Returns plain data, so everything it needs must be
   defined inside it. */
function audit(width) {
  const out = { overflow: [], tap: [], clipped: [] };

  const describe = el => {
    const id = el.id ? '#' + el.id : '';
    const cls = (typeof el.className === 'string' && el.className.trim())
      ? '.' + el.className.trim().split(/\s+/).slice(0, 3).join('.') : '';
    const text = (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 40);
    return el.tagName.toLowerCase() + id + cls + (text ? ' "' + text + '"' : '');
  };

  const docW = document.documentElement.scrollWidth;
  if (docW > width + 1) {
    /* Name the elements actually sticking out, innermost first -- an
       ancestor is wide only because a descendant is. */
    const all = document.body.querySelectorAll('*');
    const guilty = [];
    for (const el of all) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) continue;
      const cs = getComputedStyle(el);
      if (cs.position === 'fixed') continue;          // a fixed overlay is not page width
      if (r.right > width + 1) {
        // innermost: no child of this element is itself guilty
        const hasGuiltyChild = Array.from(el.children).some(c => {
          const cr = c.getBoundingClientRect();
          return cr.right > width + 1 && getComputedStyle(c).position !== 'fixed';
        });
        if (!hasGuiltyChild) guilty.push(describe(el) + ' right=' + Math.round(r.right));
      }
    }
    out.overflow.push({ docWidth: docW, by: docW - width, elements: guilty.slice(0, 6) });
  }

  const INTERACTIVE = 'a[href], button, select, input:not([type=hidden]), textarea, summary, [role=button]';
  for (const el of document.querySelectorAll(INTERACTIVE)) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;    // hidden
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.opacity === '0') continue;
    // WCAG 2.5.8 exempts a link inside a sentence.
    if (el.tagName === 'A' && el.closest('p, li')) continue;
    if (r.height < 24 || r.width < 24) {
      out.tap.push(describe(el) + ' ' + Math.round(r.width) + 'x' + Math.round(r.height));
    }
  }

  for (const el of document.querySelectorAll('h1, h2, h3, p, li, button, a, label, td, th, summary')) {
    const cs = getComputedStyle(el);
    if (cs.overflow === 'visible' && cs.overflowY === 'visible') continue;
    if (el.scrollHeight > el.clientHeight + 2 && el.clientHeight > 0
        && cs.overflowY !== 'auto' && cs.overflowY !== 'scroll') {
      out.clipped.push(describe(el) + ' ' + el.clientHeight + '<' + el.scrollHeight);
    }
  }

  return out;
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

  let problems = 0, checked = 0;
  const seen = { overflow: new Map(), tap: new Map(), clipped: new Map() };

  for (const code of MARKETS_TO_CHECK) {
    for (const route of ROUTES) {
      const rel = '/' + code.split('-').join('/') + (route || '/');
      if (!fs.existsSync(path.join(ROOT, rel, 'index.html'))
          && !fs.existsSync(path.join(ROOT, rel.replace(/\/$/, ''), 'index.html'))) continue;

      for (const width of WIDTHS) {
        const page = await browser.newPage({
          viewport: { width, height: 800 },
          deviceScaleFactor: 2,
          isMobile: width < 768,
          hasTouch: width < 768,
          reducedMotion: 'reduce',
        });
        await page.goto('http://127.0.0.1:' + PORT + rel, { waitUntil: 'networkidle' });
        await page.waitForTimeout(150);
        const res = await page.evaluate(audit, width);
        await page.close();
        checked++;

        const where = rel + ' @' + width;
        for (const o of res.overflow) {
          problems++;
          const key = o.elements.join('|') || 'unattributed';
          if (!seen.overflow.has(key)) seen.overflow.set(key, []);
          seen.overflow.get(key).push(where + ' (+' + o.by + 'px)');
        }
        for (const t of res.tap) {
          problems++;
          if (!seen.tap.has(t)) seen.tap.set(t, []);
          seen.tap.get(t).push(where);
        }
        for (const c of res.clipped) {
          problems++;
          if (!seen.clipped.has(c)) seen.clipped.set(c, []);
          seen.clipped.get(c).push(where);
        }
      }
    }
    process.stdout.write('.');
  }

  await browser.close();
  server.close();

  const report = (title, map) => {
    if (!map.size) return;
    console.log('\n' + title + '  (' + map.size + ' distinct)');
    for (const [what, wheres] of [...map.entries()].sort((a, b) => b[1].length - a[1].length)) {
      console.log('  ' + what);
      console.log('      ' + wheres.length + 'x, e.g. ' + wheres.slice(0, 3).join(', '));
    }
  };

  console.log('\n\nchecked ' + checked + ' page/width combinations across '
    + MARKETS_TO_CHECK.length + ' markets at ' + WIDTHS.join(', ') + 'px');
  report('HORIZONTAL OVERFLOW', seen.overflow);
  report('TAP TARGETS UNDER 24px', seen.tap);
  report('CLIPPED TEXT', seen.clipped);

  if (!problems) console.log('\nnothing overflows, nothing is clipped, every target is 24px or more.');
  else console.log('\n' + problems + ' problem instances.');
  process.exit(0);
})().catch(err => { console.error(err); process.exit(1); });
