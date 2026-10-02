#!/usr/bin/env node
/*
 * Form checks: the referral hand-off, the input bounds, and the one place a
 * submitted value could reach the page as markup.
 *
 * These are behaviours that a copy change or a rebuild can silently break --
 * a prefill that stops filling, a maxlength dropped from a template, a note
 * that starts parsing a code as HTML again -- and none of them show up as a
 * failed build or a visibly wrong page. So they are asserted in a browser
 * against the built output.
 *
 * What this does NOT prove: that the site is safe from a determined caller.
 * Every check below runs in the browser, and the form endpoint accepts a
 * direct POST that never loads the page at all. The bounds here stop
 * accidents and casual abuse; the portal is what has to refuse the rest.
 * See docs/09-client-zone.md.
 *
 * Usage
 *   node tools/check-forms.js
 *   node tools/check-forms.js --market=be,jp
 */
'use strict';

const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright-core');

const ROOT = path.resolve(__dirname, '..');
const PORT = 8126;

const ARGV = process.argv.slice(2);
const listArg = name => {
  const hit = ARGV.find(a => a.startsWith('--' + name + '='));
  return hit ? hit.slice(name.length + 3).split(',').map(s => s.trim()).filter(Boolean) : [];
};
const MARKETS = listArg('market').length ? listArg('market') : ['gb', 'be', 'jp'];

/* Every field that must stay bounded, and the bound. A field missing from the
   page is a failure too: it means a template changed and this list did not. */
/* The code pattern. It looks more awkward than [A-Za-z0-9_-]{2,32}, which is
   what it replaced, and the awkwardness is the point:
 *
 * `pattern` is compiled as ^(?:...)$ with the regex `v` flag, and under `v` a
 * bare `-` inside a character class is a syntax error. A pattern that fails to
 * compile is not a strict pattern -- it is *ignored entirely*, silently, with
 * no console error and no validation at all. The old one had therefore never
 * once run in Chrome: the partner form accepted `<img src=x onerror=...>` as a
 * requested code for as long as the attribute had been there.
 *
 * This form spells the dash as its own alternative instead of a class member,
 * which compiles under `v` and means exactly what the old one intended: a
 * leading alphanumeric, then 1-31 of alphanumeric, underscore or dash. That is
 * character-for-character the rule referral.js enforces on the URL parameter.
 *
 * The compile check below is the guard. Asserting the attribute's text would
 * not have caught the original bug, because the text was right and the browser
 * was throwing it away. */
const CODE_PATTERN = '[A-Za-z0-9](?:[A-Za-z0-9_]|-){1,31}';

/* The company number: a typo guard, not a check of the number. It has to let
   through every shape a client might type -- a Belgian KBO with or without
   dots, a VAT number with its country prefix, a Dutch KvK, a UK company
   number -- and the portal validates what actually arrived. Same v-flag
   caution as the code pattern: the dash is its own alternative. */
const KBO_PATTERN = '[A-Za-z0-9](?:[A-Za-z0-9 .]|-){1,19}';
const GOOD_KBO = ['0123456789', 'BE 0123.456.789', 'BE0123456789', '1033.313.383',
  '12345678', 'DE123456789', 'SC-123456'];
const BAD_KBO = ['<b>1</b>', '=1+1', ' 0123', 'x'.repeat(21), '0123;DROP'];

const BOUNDS = {
  contact: {
    'f-vnaam': { maxlength: 64 }, 'f-anaam': { maxlength: 64 },
    'f-bedrijf': { maxlength: 100 }, 'f-tel': { maxlength: 32 },
    'f-email': { maxlength: 254 }, 'f-bericht': { maxlength: 2000 },
    'f-ref': { maxlength: 32, pattern: CODE_PATTERN },
    'f-kbo': { maxlength: 20, pattern: KBO_PATTERN, good: GOOD_KBO, bad: BAD_KBO },
  },
  'partner-worden': {
    'pa-vnaam': { maxlength: 64 }, 'pa-anaam': { maxlength: 64 },
    'pa-email': { maxlength: 254 }, 'pa-profiel': { maxlength: 200 },
    'pa-bericht': { maxlength: 2000 },
    'pa-code': { maxlength: 32, pattern: CODE_PATTERN },
  },
};

/* Codes that must be accepted, and values that must not be. The empty string
   is absent from both: the field is optional, and `pattern` does not apply to
   an empty value by specification. */
const GOOD_CODES = ['LOTTE24', 'AB', 'LOTTE_24-B', 'a-b_c', 'Z'.repeat(32)];
const BAD_CODES = ['<img src=x onerror=alert(1)>', 'A', "'; DROP TABLE--",
  '=1+1', 'a b', 'é!', 'x'.repeat(33), 'javascript:alert(1)'];

/* Which markets announce the referral, by whether their language has the
   string at all. Read from the source of truth rather than hard-coded, so
   translating ref.applied into a tenth language does not fail this file. */
const TRANSLATIONS = eval(
  fs.readFileSync(path.join(ROOT, 'assets', 'i18n.js'), 'utf8') + ';TRANSLATIONS');
const ALL_MARKETS = require(path.join(ROOT, 'assets', 'markets.js'));
const HAS_NOTE = {};
for (const code of Object.keys(ALL_MARKETS)) {
  if (code.startsWith('__')) continue;
  HAS_NOTE[code] = !!(TRANSLATIONS[ALL_MARKETS[code].lang] || {})['ref.applied'];
}

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

const results = [];
const check = (name, pass, detail) => results.push({ name, pass, detail });

(async () => {
  const exe = findChromium();
  if (!exe) { console.error('No Chromium found. Set CHROMIUM_PATH, or run:\n  npx playwright install chromium'); process.exit(1); }

  const server = serve();
  await new Promise(r => server.listen(PORT, '127.0.0.1', r));
  const browser = await chromium.launch({ executablePath: exe });
  const base = 'http://127.0.0.1:' + PORT;

  for (const market of MARKETS) {
    const mp = '/' + market.split('-').join('/');

    /* ── bounds ─────────────────────────────────────────────────────── */
    for (const [page, fields] of Object.entries(BOUNDS)) {
      const rel = mp + '/' + page;
      if (!fs.existsSync(path.join(ROOT, rel, 'index.html'))) continue;
      const ctx = await browser.newContext();
      const p = await ctx.newPage();
      await p.goto(base + rel, { waitUntil: 'domcontentloaded' });
      for (const [id, want] of Object.entries(fields)) {
        const got = await p.evaluate(sel => {
          const el = document.getElementById(sel);
          if (!el) return null;
          return { maxlength: el.getAttribute('maxlength'), pattern: el.getAttribute('pattern') };
        }, id);
        if (!got) { check(market + ' ' + id + ' exists', false, 'field not on the page'); continue; }
        check(market + ' ' + id + ' maxlength=' + want.maxlength,
          String(got.maxlength) === String(want.maxlength), 'got ' + got.maxlength);
        if (want.pattern) {
          check(market + ' ' + id + ' pattern', got.pattern === want.pattern, 'got ' + got.pattern);
          /* The attribute being right is not the same as the browser using
             it. Compile it the way the browser does, and exercise it. */
          const live = await p.evaluate(({ sel, good, bad }) => {
            const el = document.getElementById(sel);
            let compiles = true;
            try { new RegExp('^(?:' + el.getAttribute('pattern') + ')$', 'v'); }
            catch (e) { compiles = false; }
            const matches = v => { const was = el.value; el.value = v; const m = !el.validity.patternMismatch; el.value = was; return m; };
            return { compiles, rejectedGood: good.filter(v => !matches(v)), acceptedBad: bad.filter(v => matches(v)) };
          }, { sel: id, good: want.good || GOOD_CODES, bad: want.bad || BAD_CODES });
          check(market + ' ' + id + ' pattern compiles under v', live.compiles,
            'a pattern that throws is ignored entirely, not enforced');
          check(market + ' ' + id + ' accepts real values', live.rejectedGood.length === 0,
            'rejected ' + JSON.stringify(live.rejectedGood));
          check(market + ' ' + id + ' refuses junk', live.acceptedBad.length === 0,
            'accepted ' + JSON.stringify(live.acceptedBad));
        }
      }
      await ctx.close();
    }

    /* ── business or private person ─────────────────────────────────── */
    {
      const ctx = await browser.newContext();
      const p = await ctx.newPage();
      await p.goto(base + mp + '/contact', { waitUntil: 'networkidle' });
      const state = () => p.evaluate(() => {
        const f = document.getElementById('formWrap');
        const d = new FormData(f);
        return { hidden: document.getElementById('fBiz').hidden,
          sends: { bedrijf: d.has('bedrijf'), nr: d.has('ondernemingsnummer') },
          valid: f.checkValidity() };
      });
      /* Fill what is required so only the choice decides validity. */
      await p.fill('#f-vnaam', 'Jan'); await p.fill('#f-tel', '+32 1');
      await p.fill('#f-email', 'jan@example.com'); await p.check('#f-consent');
      let s = await state();
      check(market + ' kind: company fields hidden until chosen', s.hidden === true);
      check(market + ' kind: a choice is required', s.valid === false, 'form valid without one');
      await p.check('input[name="klanttype"][value="bedrijf"]');
      await p.fill('#f-bedrijf', 'Acme'); await p.fill('#f-kbo', 'BE 0123.456.789');
      s = await state();
      check(market + ' kind: business shows company fields', s.hidden === false);
      check(market + ' kind: business sends name and number', s.sends.bedrijf && s.sends.nr, JSON.stringify(s.sends));
      check(market + ' kind: business is valid', s.valid === true);
      await p.check('input[name="klanttype"][value="particulier"]');
      s = await state();
      check(market + ' kind: private hides company fields', s.hidden === true);
      check(market + ' kind: private sends no company data', !s.sends.bedrijf && !s.sends.nr, JSON.stringify(s.sends));
      const labels = await p.evaluate(() => ['fKindLbl', 'fKindBiz', 'fKindPriv', 'fKboLbl']
        .map(id => (document.getElementById(id) || {}).textContent || ''));
      check(market + ' kind: labels are filled', labels.every(Boolean), JSON.stringify(labels));
      /* f.labels is applied by position. A new label counted into it would
         shift every later field's label by one, in every language, and the
         page would still look finished. So each label is read back from its
         own field and compared with the entry meant for it. */
      const want = ((TRANSLATIONS[(ALL_MARKETS[market] || {}).lang] || {})['f.labels']) || [];
      const got = await p.evaluate(() => ['f-vnaam', 'f-anaam', 'f-bedrijf', 'f-tel', 'f-email', 'f-pakket', 'f-ref', 'f-bericht']
        .map(id => { const l = document.querySelector('label[for="' + id + '"]'); return l ? l.textContent : null; }));
      check(market + ' labels sit on their own fields', want.length === 8 && want.every((w, i) => w === got[i]),
        got.map((g, i) => g === want[i] ? 'ok' : JSON.stringify(g) + '!=' + JSON.stringify(want[i])).join(' '));
      await ctx.close();
    }

    /* ── the referral hand-off ──────────────────────────────────────── */
    const ctx = await browser.newContext();
    const p = await ctx.newPage();

    await p.goto(base + mp + '/contact', { waitUntil: 'networkidle' });
    check(market + ' no code -> empty', (await p.inputValue('#f-ref')) === '');
    check(market + ' no code -> note hidden', (await p.$eval('#refNote', e => e.hidden)) === true);

    await p.goto(base + mp + '/contact?ref=LOTTE24', { waitUntil: 'networkidle' });
    await p.waitForTimeout(200);
    check(market + ' link -> prefilled', (await p.inputValue('#f-ref')) === 'LOTTE24');
    /* The note is deliberately shown only where ref.applied exists, and it is
       written in two languages. Everywhere else the code is still captured and
       simply not announced -- see the comment on this block in app.js.
       Whether this language has the string is read from i18n.js here rather
       than asked of the page: app.js keeps its translations in a closure, so
       probing the page for them silently answers "no" for every language. */
    const note = await p.evaluate(() => ({
      text: document.getElementById('refNote').textContent,
      hidden: document.getElementById('refNote').hidden,
    }));
    const announces = HAS_NOTE[market];
    check(market + ' link -> note names code',
      announces ? (!note.hidden && /LOTTE24/.test(note.text)) : note.hidden === true,
      announces ? 'shown: ' + note.text.slice(0, 60) : 'hidden, as this language has no ref.applied');

    await p.fill('#f-ref', 'OTHER99');
    const sent = await p.$eval('#formWrap', f => new URLSearchParams(new FormData(f)).get('ref'));
    check(market + ' typed value is what submits', sent === 'OTHER99', 'got ' + sent);
    check(market + ' exactly one ref field', (await p.$$eval('[name="ref"]', e => e.length)) === 1);

    /* ── the pattern actually refuses a non-code ────────────────────── */
    await p.fill('#f-ref', '<img src=x onerror=alert(1)>');
    const valid = await p.$eval('#f-ref', el => el.checkValidity());
    check(market + ' pattern refuses markup', valid === false, 'checkValidity=' + valid);
    await p.fill('#f-ref', 'LOTTE_24-B');
    check(market + ' pattern accepts a real code',
      (await p.$eval('#f-ref', el => el.checkValidity())) === true);

    /* ── the note treats the code as text, not markup ───────────────── */
    await p.goto(base + mp + '/contact', { waitUntil: 'networkidle' });
    const injected = await p.evaluate(() => {
      /* Force a hostile code past referral.js the way a loosened pattern
         would, and ask whether the note would then parse it. */
      window.__DRP_REF__ = '<img src=x onerror="window.__XSS__=1">';
      const ev = new Event('drp-relang');
      document.dispatchEvent(ev);
      const note = document.getElementById('refNote');
      const t = (window.LANGS && window.LANGS()[document.documentElement.lang]) || {};
      if (!t['ref.applied']) return { skipped: true };
      const parts = t['ref.applied'].split('{code}');
      note.textContent = '';
      parts.forEach((part, i) => {
        if (i) { const b = document.createElement('strong'); b.textContent = window.__DRP_REF__; note.appendChild(b); }
        if (part) { const s = document.createElement('span'); s.innerHTML = part; note.appendChild(s); }
      });
      return { skipped: false, imgs: note.querySelectorAll('img').length, text: note.textContent };
    });
    if (injected.skipped) {
      check(market + ' note builds code as text', true, 'no ref.applied string in this language');
    } else {
      check(market + ' note builds code as text',
        injected.imgs === 0 && /<img/.test(injected.text),
        'imgs=' + injected.imgs);
    }

    await ctx.close();

    /* A fresh context, because the code from the test above is now in
       localStorage for ninety days and would be prefilled here -- which is
       correct behaviour and would look exactly like the junk being accepted. */
    const ctx2 = await browser.newContext();
    const p2 = await ctx2.newPage();
    await p2.goto(base + mp + '/contact?ref=' + encodeURIComponent('<script>x</script>'), { waitUntil: 'networkidle' });
    await p2.waitForTimeout(150);
    check(market + ' junk on the URL ignored', (await p2.inputValue('#f-ref')) === '',
      'got ' + JSON.stringify(await p2.inputValue('#f-ref')));
    await ctx2.close();
  }

  await browser.close();
  server.close();

  let bad = 0;
  for (const r of results) {
    if (!r.pass) { console.log('  FAIL ' + r.name + (r.detail ? '   -> ' + r.detail : '')); bad++; }
  }
  console.log('\n' + (results.length - bad) + '/' + results.length + ' passed'
    + (bad ? '' : ' across ' + MARKETS.join(', ')));
  process.exit(bad ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
