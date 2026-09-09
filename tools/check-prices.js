#!/usr/bin/env node
/*
 * Are every language's prices still convertible?
 *
 *   node tools/check-prices.js              # live languages + any draft
 *   node tools/check-prices.js --draft-only
 *
 * locale.js converts euro figures to the market currency at runtime, and its
 * amountPattern REQUIRES the euro sign: a figure that loses its "€" is not a
 * cosmetic problem, it is a figure that never converts. /jp/ would print
 * "499" where it owes the reader "￥80,838".
 *
 * Machine translation is where that happens. DeepL is told to ignore the
 * spans holding prices, and it mostly does -- but it has been observed
 * returning "<x>499</x>" for "<x>€499</x>", dropping the symbol from inside
 * the very tag that was meant to protect it. Nothing downstream would notice:
 * the copy still reads plausibly, the number is still there, and only the
 * conversion quietly stops.
 *
 * So this asserts the invariant rather than trusting the safeguard. For every
 * key, the multiset of convertible amounts must be identical to English --
 * same values, same count. Order is not compared, because "499 €" and "€499"
 * are both correct and languages legitimately differ on which they use.
 *
 * The pattern is lifted out of assets/locale.js rather than restated here, so
 * this cannot drift from what the site actually does at runtime.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const LOCALE = path.join(ROOT, 'assets', 'locale.js');
const I18N = path.join(ROOT, 'assets', 'i18n.js');
const DRAFT = path.join(ROOT, 'assets', 'i18n.draft.js');

/* ── borrow locale.js's own definitions ───────────────────────────────────
 * Extracted from the file and evaluated as written. Restating the regex here
 * would mean two copies of the rule that decides whether money converts. */
function borrowFromLocale() {
  const src = fs.readFileSync(LOCALE, 'utf8');

  const sep = src.match(/var SEP_CLASS\s*=\s*([^;]+);/);
  const sepRe = src.match(/var SEP_RE\s*=\s*([^;]+);/);
  const num = src.match(/var NUM\s*=\s*([^;]+);/);
  const fn = src.match(/function amountPattern\(\)\s*\{[\s\S]*?\n  \}/);
  const range = src.match(/function rangePattern\(\)\s*\{[\s\S]*?\n  \}/);
  const parse = src.match(/function parseAmount\(raw\)\s*\{[\s\S]*?\n  \}/);
  if (!sep || !sepRe || !num || !fn || !range || !parse) {
    throw new Error('locale.js no longer exposes SEP_CLASS / SEP_RE / NUM / '
      + 'amountPattern / rangePattern / parseAmount — this check is out of date');
  }

  const body = [
    'var SEP_CLASS = ' + sep[1] + ';',
    'var SEP_RE = ' + sepRe[1] + ';',
    'var NUM = ' + num[1] + ';',
    fn[0],
    range[0],
    parse[0],
    'return { amountPattern: amountPattern, rangePattern: rangePattern,',
    '         parseAmount: parseAmount };',
  ].join('\n');

  return new Function(body)();
}

const { amountPattern, rangePattern, parseAmount } = borrowFromLocale();

/* Every convertible amount in a value, whatever shape the value is.
 *
 * Mirrors convertText in locale.js: ranges first, and consumed as they are
 * counted so the single-amount pass cannot count their high end twice.
 * Sorted, because which side of a figure the symbol sits on is a language's
 * own business -- "499 €" and "€499" are both right. */
function amounts(value) {
  const text = typeof value === 'string' ? value : JSON.stringify(value);
  const out = [];

  const rest = text.replace(rangePattern(), function (m, a, dash, b) {
    const lo = parseAmount(a), hi = parseAmount(b);
    if (lo === null || hi === null) return m;
    out.push(lo, hi);
    return ' ';
  });

  const re = amountPattern();
  let m;
  while ((m = re.exec(rest)) !== null) {
    const v = parseAmount(m[2] || m[3]);
    if (v !== null) out.push(v);
  }
  return out.sort((a, b) => a - b);
}

/* ── load the languages ──────────────────────────────────────────────────── */

const LIVE = eval(fs.readFileSync(I18N, 'utf8') + ';TRANSLATIONS');
const DRAFTED = fs.existsSync(DRAFT) ? require(DRAFT) : {};

const draftOnly = process.argv.includes('--draft-only');
const liveOnly = process.argv.includes('--live-only');
const REF = LIVE.en;
const KEYS = Object.keys(REF);

const targets = [];
if (!draftOnly) {
  for (const l of Object.keys(LIVE)) targets.push([l, LIVE[l], 'live']);
}
// --live-only is what the build runs. An unreviewed draft is expected to have
// defects, and a half-finished Polish block must not stop a Dutch deploy.
if (!liveOnly) {
  for (const l of Object.keys(DRAFTED)) targets.push([l, DRAFTED[l], 'draft']);
}

/* ── compare ─────────────────────────────────────────────────────────────── */

const total = KEYS.reduce((n, k) => n + amounts(REF[k]).length, 0);
console.log(`reference: en, ${total} convertible amounts across ${KEYS.length} keys\n`);

let failed = 0;
for (const [lang, block, kind] of targets) {
  const problems = [];
  for (const k of KEYS) {
    const want = amounts(REF[k]);
    const got = amounts(block[k]);
    if (JSON.stringify(want) === JSON.stringify(got)) continue;

    const lost = want.filter(v => !got.includes(v));
    const gained = got.filter(v => !want.includes(v));
    problems.push('    ' + k
      + '  en=' + JSON.stringify(want)
      + '  ' + lang + '=' + JSON.stringify(got)
      + (lost.length ? '  LOST ' + JSON.stringify(lost) : '')
      + (gained.length ? '  GAINED ' + JSON.stringify(gained) : ''));
  }
  const label = (kind === 'live' ? 'live ' : 'draft') + '  ' + lang.padEnd(3);
  if (problems.length) {
    failed++;
    console.log(label + '  ' + problems.length + ' key(s) whose amounts differ from English');
    problems.forEach(p => console.log(p));
  } else {
    console.log(label + '  ok');
  }
}

console.log();
if (failed) {
  console.log(failed + ' language(s) would not convert correctly.');
  console.log('A lost amount means that figure keeps its euro value in every market.');
  process.exit(1);
}
console.log('every language carries exactly English’s amounts — all convertible.');
