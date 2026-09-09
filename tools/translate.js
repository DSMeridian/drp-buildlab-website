#!/usr/bin/env node
/*
 * Build-time translation of the site copy.
 *
 * Reads the English block out of assets/i18n.js, sends it through DeepL, and
 * writes the result to assets/i18n.draft.js. Nothing here runs in the browser
 * and no page loads the draft file -- these are drafts for review, and they
 * only become real translations when someone moves them into i18n.js.
 *
 * Translation happens once, at build time, rather than per visitor: a runtime
 * API call would put a network round-trip in front of every pageview, bill
 * per visit instead of per copy change, and leave Google indexing English
 * because the translated text would never exist in the HTML.
 *
 * Usage
 *   node tools/translate.js --langs=id,ja,ar            translate (needs a key)
 *   node tools/translate.js --langs=id --provider=mock  no key, proves the wiring
 *   node tools/translate.js --list                      what DeepL can target
 *   node tools/translate.js --langs=id --dry-run        show what would be sent
 *   node tools/translate.js --langs=id --replace       discard existing drafts
 *
 * Runs merge: translating one language leaves the others in the draft
 * file alone. Pass --replace only to throw the existing ones away.
 *
 * The key is read from DEEPL_API_KEY, or from a .env file beside this repo
 * (which .gitignore excludes). Free-tier keys end in ":fx" and are routed to
 * api-free.deepl.com automatically.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'assets', 'i18n.js');
const OUT = path.join(ROOT, 'assets', 'i18n.draft.js');

/* ── arguments ─────────────────────────────────────────────────────────── */

const argv = process.argv.slice(2);
const arg = (name, fallback) => {
  const hit = argv.find(a => a.startsWith('--' + name + '='));
  return hit ? hit.split('=').slice(1).join('=') : fallback;
};
const flag = name => argv.includes('--' + name);

const OPTS = {
  langs: arg('langs', '').split(',').map(s => s.trim()).filter(Boolean),
  provider: arg('provider', 'deepl'),
  source: arg('source', 'en'),
  list: flag('list'),
  dryRun: flag('dry-run'),
  replace: flag('replace'),
  help: flag('help') || argv.length === 0,
};

if (OPTS.help) {
  console.log(fs.readFileSync(__filename, 'utf8').split('*/')[0].replace(/^\/\*\n?/, '').replace(/^ \* ?/gm, ''));
  process.exit(0);
}

/* ── key ───────────────────────────────────────────────────────────────── */

function readKey() {
  if (process.env.DEEPL_API_KEY) return process.env.DEEPL_API_KEY.trim();
  const envFile = path.join(ROOT, '.env');
  if (fs.existsSync(envFile)) {
    const m = fs.readFileSync(envFile, 'utf8').match(/^\s*DEEPL_API_KEY\s*=\s*(.+)$/m);
    if (m) return m[1].trim().replace(/^["']|["']$/g, '');
  }
  return null;
}

const KEY = readKey();
// Free keys carry a ":fx" suffix and live on a different host; sending one to
// the paid endpoint fails with a 403 that reads like a bad key.
const API = KEY && KEY.endsWith(':fx')
  ? 'https://api-free.deepl.com/v2'
  : 'https://api.deepl.com/v2';

/* ── protecting things that must survive translation ───────────────────── */

/* Prices, placeholders and the VAT number are held back from the request and
 * put in again afterwards, with <x>...</x> marking where each one goes and
 * ignore_tags keeping DeepL out of it. HTML in the copy (<strong>, <br>,
 * <em>) is handled by tag_handling=html and needs no wrapper.
 *
 * See protect() below for why the value is substituted rather than merely
 * wrapped: an ignored tag is not as inviolable as it looks. */
// A figure: digits with optional grouping, always ending on a digit, so a
// sentence's comma or full stop is never pulled inside the span.
const NUM = '\\d(?:[\\d.,\u00a0 ]*\\d)?';
const PROTECT = new RegExp(
  '(?:&euro;|€)\\s?' + NUM +        // €499, € 8.320
  '|' + NUM + '\\s?(?:&euro;|€)' +  // 499 €   (French and Spanish order)
  '|\\{[a-zA-Z]+\\}' +                  // {cur} and friends
  // The VAT number, with the space in front of it pulled inside: DeepL
  // drops whitespace that sits outside an ignored tag, which glued the
  // translated label to the country code -- "Numer VATBE 1033.313.383" in
  // Polish, "Nomor PPNBE" in Indonesian, "VATBE" in Japanese. Inside the
  // tag the space comes back verbatim.
  '|\\s?BE\\s?\\d[\\d.]*\\d',
  'g');

/* Substitution, not pass-through.
 *
 * This used to wrap the value itself -- "<x>€499</x>" -- and trust
 * ignore_tags to hand it back untouched. Mostly it does. But DeepL has been
 * observed returning "<x>499</x>" for exactly that input: the euro sign
 * dropped from inside the tag that existed to protect it.
 *
 * That failure is invisible downstream. The sentence still reads, the number
 * is still there, and only locale.js notices -- it converts figures that
 * carry the symbol and skips the ones that do not, so the price silently
 * stays in euro in every market. A visitor in Tokyo reads "499".
 *
 * So the value is replaced by its index and never leaves this process. An
 * integer has nothing DeepL might want to localise, and what gets restored
 * afterwards is byte-for-byte what went in. */
function protect(s) {
  const held = [];
  const text = String(s).replace(PROTECT, m => '<x>' + (held.push(m) - 1) + '</x>');
  return { text, held };
}

/* Puts the held values back, and refuses to guess if one went missing.
 *
 * A dropped token means a figure that would never convert, so this throws
 * rather than returning a string with a hole in it -- failing the run costs
 * a re-translation, shipping it costs a wrong price on a live page. */
function restore(translated, held, where) {
  let out = String(translated);
  for (let i = 0; i < held.length; i++) {
    // Anchored on the closing tag, so token 1 cannot match inside token 10.
    const token = new RegExp('<x>\\s*' + i + '\\s*</x>', 'g');
    if (!token.test(out)) {
      throw new Error('lost a protected value while translating ' + where + '.'
        + '\n  expected back: ' + held[i]
        + '\n  DeepL returned: ' + out.slice(0, 200));
    }
    out = out.replace(token, () => held[i]);
  }
  return out.replace(/<\/?x>/g, '');
}

/* ── which DeepL variant a language key asks for ───────────────────────── */

/* The key stays a bare language, and the regional choice is made here.
 *
 * That split is not cosmetic. build-locales.js writes hreflang as
 * `${lang}-${MARKET}`, so a key of "pt-br" serving /br/ would come out
 * "pt-br-BR", which is not a language tag. The same would happen to
 * "es-419". Keeping the key bare keeps hreflang, the payload filenames and
 * the LOCALES table all in one shape.
 *
 * Portuguese needs an entry because DeepL no longer has a bare PT: it
 * resolves to European Portuguese, and the Portuguese market on the roadmap
 * is Brazil. European Portuguese reads as foreign there -- "estão a dar"
 * where Brazil says "estão dando", "telemóvel" for "celular" -- so the
 * default was quietly the wrong language rather than a rough edge.
 *
 * Add an entry only where the bare code is wrong or ambiguous. ES-419 would
 * belong here too if Latin America ever outgrows European Spanish. */
const TARGET = {
  pt: 'PT-BR',
};

const targetFor = lang => TARGET[lang.toLowerCase()] || lang.toUpperCase();

/* ── walking the translation object ────────────────────────────────────── */

/* Values are strings, arrays of strings, arrays of arrays, and arrays of
 * objects ({t,b,d}, {q,a}, {n,p}, ...). Rather than special-case each shape,
 * collect every string with the path that leads to it, translate the flat
 * list, then rebuild along the same paths. */
function collect(value, path, out) {
  if (typeof value === 'string') { out.push({ path: path.slice(), text: value }); return; }
  if (Array.isArray(value)) { value.forEach((v, i) => collect(v, path.concat(i), out)); return; }
  if (value && typeof value === 'object') {
    Object.keys(value).forEach(k => collect(value[k], path.concat(k), out));
  }
  // numbers and booleans (comp.rows carries `us: true`) are left alone
}

function rebuild(source, entries) {
  const clone = JSON.parse(JSON.stringify(source));
  for (const e of entries) {
    let node = clone;
    for (let i = 0; i < e.path.length - 1; i++) node = node[e.path[i]];
    node[e.path[e.path.length - 1]] = e.text;
  }
  return clone;
}

/* ── providers ─────────────────────────────────────────────────────────── */

/* One batch, with retries. Connections on this machine drop often enough that
 * a single blip was losing an entire run, and since DeepL bills per character
 * a blind re-run pays for the same text twice. Rate limits (429) and server
 * errors are retried too; a bad key or malformed request is not, because
 * repeating those just wastes time. */
async function send(body, attempt) {
  attempt = attempt || 1;
  const MAX = 4;
  try {
    const res = await fetch(API + '/translate', {
      method: 'POST',
      headers: {
        'Authorization': 'DeepL-Auth-Key ' + KEY,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    });
    if (res.status === 429 || res.status >= 500) {
      throw Object.assign(new Error('DeepL ' + res.status), { retryable: true });
    }
    if (!res.ok) {
      throw new Error('DeepL ' + res.status + ' ' + (await res.text()).slice(0, 180));
    }
    return res.json();
  } catch (err) {
    const transient = err.retryable || err.name === 'TypeError';   // fetch failed
    if (!transient || attempt >= MAX) throw err;
    const waitMs = 500 * Math.pow(2, attempt - 1);
    process.stdout.write('r');
    await new Promise(r => setTimeout(r, waitMs));
    return send(body, attempt + 1);
  }
}

async function deepl(texts, target) {
  if (!KEY) throw new Error('no DEEPL_API_KEY (set it, put it in .env, or use --provider=mock)');
  const out = [];
  // DeepL accepts up to 50 texts per request.
  for (let i = 0; i < texts.length; i += 40) {
    const batch = texts.slice(i, i + 40);
    const body = new URLSearchParams();
    body.set('target_lang', target);
    body.set('source_lang', OPTS.source.toUpperCase());
    body.set('tag_handling', 'html');
    body.set('ignore_tags', 'x');
    // Held per text, in request order, which is the order DeepL answers in.
    const held = batch.map(t => {
      const p = protect(t);
      body.append('text', p.text);
      return p.held;
    });

    const json = await send(body);
    json.translations.forEach((t, j) => out.push(
      restore(t.text, held[j], target + ' string #' + (i + j + 1))));
    process.stdout.write('.');
  }
  return out;
}

/* Marks each string so the pipeline can be verified end to end -- structure,
 * protected figures, HTML tags -- without a key or a single API call. */
async function mock(texts, target) {
  return texts.map(t => {
    const protectedOnly = protect(t).text.replace(/<x>.*?<\/x>/g, ' ');
    const tagless = protectedOnly.replace(/<[^>]+>/g, '');
    const words = tagless.replace(/ /g, '').trim();
    // keep tags and figures exactly, prefix the visible words
    return words ? t.replace(words.split(/\s+/)[0], '[' + target.toLowerCase() + ']' + words.split(/\s+/)[0]) : t;
  });
}

async function supported() {
  if (!KEY) return null;
  const res = await fetch(API + '/languages?type=target', {
    headers: { 'Authorization': 'DeepL-Auth-Key ' + KEY },
  });
  if (!res.ok) throw new Error('DeepL ' + res.status + ' ' + (await res.text()).slice(0, 120));
  return res.json();
}

/* ── main ──────────────────────────────────────────────────────────────── */

(async () => {
  const srcText = fs.readFileSync(SRC, 'utf8');
  const TRANSLATIONS = eval(srcText + ';TRANSLATIONS');   // eslint-disable-line no-eval

  if (OPTS.list) {
    const langs = await supported();
    if (!langs) { console.log('No key set, so DeepL cannot be asked what it supports.'); process.exit(1); }
    console.log(langs.map(l => l.language.padEnd(7) + l.name).join('\n'));
    console.log('\n' + langs.length + ' target languages');
    process.exit(0);
  }

  const source = TRANSLATIONS[OPTS.source];
  if (!source) { console.error('no "' + OPTS.source + '" block in i18n.js'); process.exit(1); }
  if (!OPTS.langs.length) { console.error('nothing to do: pass --langs=id,ja'); process.exit(1); }

  const entries = [];
  collect(source, [], entries);
  const texts = entries.map(e => e.text);
  const chars = texts.reduce((n, t) => n + t.length, 0);

  console.log('source          : ' + OPTS.source + '  (' + Object.keys(source).length + ' keys, '
    + texts.length + ' strings, ' + chars.toLocaleString() + ' chars)');
  console.log('targets         : ' + OPTS.langs.map(l => l + (targetFor(l) !== l.toUpperCase() ? ' → ' + targetFor(l) : '')).join(', '));
  console.log('provider        : ' + OPTS.provider + (OPTS.provider === 'deepl' ? (KEY ? ' (key found)' : ' (NO KEY)') : ''));
  console.log('billable chars  : ' + (chars * OPTS.langs.length).toLocaleString());

  if (OPTS.dryRun) {
    console.log('\n--dry-run, nothing sent. First five strings as they would go out:\n');
    texts.slice(0, 5).forEach(t => console.log('  ' + protect(t).text.slice(0, 150)));
    process.exit(0);
  }

  const translate = OPTS.provider === 'mock' ? mock : deepl;

  /* Start from the drafts already on disk. Each cost quota to produce and
   * exists nowhere else, so a run that adds Arabic must not throw away the
   * Japanese somebody is part-way through reviewing. */
  let drafts = {};
  if (!OPTS.replace && fs.existsSync(OUT)) {
    try {
      const prev = fs.readFileSync(OUT, 'utf8');
      const from = prev.indexOf('{', prev.indexOf('TRANSLATIONS_DRAFT'));
      const body = prev.slice(from, prev.lastIndexOf('}') + 1);
      drafts = eval('(' + body + ')');            // eslint-disable-line no-eval
      const kept = Object.keys(drafts).filter(l => !OPTS.langs.includes(l));
      if (kept.length) console.log('keeping         : ' + kept.join(', ') + ' (already on disk)');
    } catch (e) {
      console.log('note            : existing drafts unreadable (' + e.message + '), starting fresh');
      drafts = {};
    }
  }

  for (const lang of OPTS.langs) {
    process.stdout.write('\n' + lang + ' ');
    const translated = await translate(texts, targetFor(lang));
    if (translated.length !== entries.length) {
      throw new Error('got ' + translated.length + ' strings back, expected ' + entries.length);
    }
    drafts[lang.toLowerCase()] = rebuild(source,
      entries.map((e, i) => ({ path: e.path, text: translated[i] })));
    process.stdout.write(' done');
  }

  const banner = [
    '/* GENERATED FILE — machine translation, NOT reviewed.',
    ' *',
    ' * Written by tools/translate.js from the "' + OPTS.source + '" copy in i18n.js.',
    ' * No page loads this file. These are drafts: a language only becomes real',
    ' * once a human has read it and moved the block into i18n.js.',
    ' *',
    ' * Prices, {placeholders} and inline HTML were held out of translation, but',
    ' * that is a safeguard, not a guarantee — check every figure and every',
    ' * statement about VAT or invoicing before any of this goes near a visitor.',
    ' *',
    ' * Source: ' + OPTS.source + '  Provider: ' + OPTS.provider + '  Generated: '
      + new Date().toISOString().slice(0, 10),
    ' */',
    'const TRANSLATIONS_DRAFT = ' + JSON.stringify(drafts, null, 1) + ';',
    '',
    'if (typeof module !== "undefined") module.exports = TRANSLATIONS_DRAFT;',
    '',
  ].join('\n');

  fs.writeFileSync(OUT, banner, 'utf8');
  console.log('\n\nwrote ' + path.relative(ROOT, OUT) + '  ('
    + Object.keys(drafts).sort().join(', ') + ', ' + (banner.length / 1024).toFixed(1) + ' KB)');
  console.log('Nothing is live yet — review it, then move blocks into i18n.js.');
})().catch(err => {
  // Node's fetch says only "fetch failed" and puts the real reason -- DNS,
  // TLS, a reset connection -- in err.cause. Without this a network blip
  // reads exactly like a bad API key.
  console.error('\n' + err.message);
  if (err.cause) {
    console.error('  cause: ' + (err.cause.code || '') + ' ' + (err.cause.message || err.cause));
    if (err.cause.cause) console.error('  under: ' + (err.cause.cause.code || '') + ' ' + (err.cause.cause.message || ''));
  }
  process.exit(1);
});
