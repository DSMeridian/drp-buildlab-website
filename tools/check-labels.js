#!/usr/bin/env node
/*
 * Does any language claim something the company cannot back up?
 *
 *   node tools/check-labels.js              # live languages + any draft
 *   node tools/check-labels.js --live-only  # what the build runs
 *
 * Two strings, both of which state a fact rather than sell anything: the
 * footer's registered office and VAT number, and the payment methods in the
 * schema. Everything else on the page can be clumsy and merely read badly.
 *
 * Machine translation is confident about tax words and wrong about them. The
 * Brazilian Portuguese draft came back with
 *
 *   © 2026 DRP BuildLab · ... · CNPJ BE 1033.313.383
 *
 * CNPJ is the Brazilian federal company register. DRP BuildLab is Belgian and
 * has no CNPJ, so that line asserted a registration that does not exist --
 * and it would have shipped looking entirely plausible, in a language nobody
 * on the team reads. DeepL had simply picked the local equivalent of "VAT",
 * which is exactly what a good translator would do for an ordinary noun.
 *
 * So the label is checked against a list of terms someone has decided are
 * true, rather than trusted. Adding a language means adding its term here on
 * purpose, which is the point: it forces the question to be asked once.
 *
 * "VAT" is always acceptable. It is accurate in every market -- the number
 * really is a VAT number, issued by Belgium -- and it cannot be mistaken for
 * a local registration. A language with no reviewed local term should use it.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const I18N = path.join(ROOT, 'assets', 'i18n.js');
const DRAFT = path.join(ROOT, 'assets', 'i18n.draft.js');

/* The identifier itself, which no language may alter. */
const VAT_NUMBER = 'BE 1033.313.383';

/* Labels that have been checked and are true of a Belgian VAT registration.
 *
 * "VAT" is the safe default and is allowed everywhere. The rest are the local
 * term for a *European* VAT number in that language -- not the local term for
 * whatever that country's own business tax happens to be. That distinction is
 * the whole reason this file exists. */
const ALLOWED = {
  nl: ['BTW', 'VAT'],
  en: ['VAT'],
  fr: ['TVA', 'VAT'],
  es: ['IVA', 'VAT'],
  de: ['USt-IdNr.', 'UStIdNr.', 'VAT'],
  id: ['Nomor PPN', 'PPN', 'VAT'],
  ja: ['VAT'],
  pt: ['VAT', 'IVA'],
  it: ['Partita IVA', 'IVA', 'VAT'],
  pl: ['Numer VAT', 'NIP UE', 'VAT'],
};

/* Terms that are a country's own register or tax and are therefore false
 * here, whichever language they turn up in. Listed so the failure names the
 * actual problem instead of just "unrecognised label". */
const FALSE_CLAIMS = {
  CNPJ: 'the Brazilian federal company register',
  CPF: 'a Brazilian individual taxpayer number',
  ICMS: 'a Brazilian state tax',
  ISS: 'a Brazilian municipal service tax',
  'Receita Federal': 'the Brazilian tax authority',
  RFC: 'the Mexican taxpayer register',
  RUT: 'the Chilean taxpayer register',
  NIF: 'a Spanish/Portuguese national tax number',
  EIN: 'a United States employer identification number',
  'Steuernummer': 'a German domestic tax number, not the EU VAT ID',
  'KvK': 'the Dutch chamber of commerce register',
  'SIRET': 'a French establishment register',
  'ABN': 'an Australian business number',
  'GST': 'a goods and services tax registration',
};

/* Payment schemes that only work in one country.
 *
 * paymentAccepted used to read "Bankoverschrijving, Bancontact" on every
 * market. Bancontact is a Belgian debit scheme, so eighteen markets told
 * visitors they could pay by a method unavailable to them -- the same error
 * as a translated tax term, and just as plausible-looking.
 *
 * The site states one payment fact it can stand behind: it invoices, in euro.
 * So bank transfer is all any market claims. Anything on this list turning up
 * again means someone asserted a local scheme, and should have to say why. */
const DOMESTIC_SCHEMES = {
  Bancontact: 'Belgium', iDEAL: 'the Netherlands', Sofort: 'Germany',
  Giropay: 'Germany', BLIK: 'Poland', Swish: 'Sweden', MobilePay: 'Denmark',
  Vipps: 'Norway', Pix: 'Brazil', Boleto: 'Brazil', OXXO: 'Mexico',
  Interac: 'Canada', PayNow: 'Singapore', BECS: 'Australia',
  Konbini: 'Japan', PayID: 'Australia', Twint: 'Switzerland',
};

/* ── load ────────────────────────────────────────────────────────────────── */

const LIVE = eval(fs.readFileSync(I18N, 'utf8') + ';TRANSLATIONS');
const DRAFTED = fs.existsSync(DRAFT) ? require(DRAFT) : {};

const liveOnly = process.argv.includes('--live-only');
const draftOnly = process.argv.includes('--draft-only');

const targets = [];
if (!draftOnly) for (const l of Object.keys(LIVE)) targets.push([l, LIVE[l], 'live']);
if (!liveOnly) for (const l of Object.keys(DRAFTED)) targets.push([l, DRAFTED[l], 'draft']);

/* ── check ───────────────────────────────────────────────────────────────── */

let failed = 0;

for (const [lang, block, kind] of targets) {
  const copy = block['ft.copy'];
  const label = (kind === 'live' ? 'live ' : 'draft') + '  ' + lang.padEnd(3);
  const problems = [];
  let summary = null;

  if (typeof copy !== 'string') {
    problems.push('ft.copy is missing');
  } else {
    /* The number itself, spacing included. Anchored on what precedes "BE":
     * a plain includes() is not enough, because "Partita IVABE 1033.313.383"
     * still contains "BE 1033.313.383" as a substring. The country code has
     * to stand on its own, which is precisely what goes wrong. */
    if (!new RegExp('(^|\\s)' + VAT_NUMBER.replace(/\./g, '\\.')).test(copy)) {
      const glued = copy.match(/[A-Za-z.]BE ?1033/);
      problems.push(glued
        ? 'the label is welded to the country code: "' + glued[0] + '…"'
        : 'the VAT number "' + VAT_NUMBER + '" is not present as written');
    }

    // Anything between the last separator and the number is the label.
    const m = copy.match(/·\s*([^·]*?)\s+BE ?1033\.313\.383/);
    const found = m ? m[1].trim() : null;

    if (found === null) {
      problems.push('could not find a VAT label before the number');
    } else {
      for (const term of Object.keys(FALSE_CLAIMS)) {
        if (new RegExp('\\b' + term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b').test(found)) {
          problems.push('claims "' + term + '" — ' + FALSE_CLAIMS[term]
            + ', which DRP BuildLab does not hold');
        }
      }
      const ok = (ALLOWED[lang] || ['VAT']).some(a => found === a);
      if (!ok && !problems.length) {
        problems.push('label "' + found + '" is not on the approved list for ' + lang
          + ' (' + (ALLOWED[lang] || ['VAT']).join(', ') + ')');
      }
    }

    if (!problems.length) summary = found + ' ' + VAT_NUMBER;
  }

  /* What the market says it accepts. Checked per language rather than per
   * market because that is where the string lives -- which is itself the
   * argument against putting a country's scheme in it: Dutch is /be/ and
   * /nl/, and Bancontact is true of only one of them. */
  const pay = block['pay.methods'];
  if (typeof pay !== 'string' || !pay.trim()) {
    problems.push('pay.methods is missing — paymentAccepted has nothing to say');
  } else {
    for (const scheme of Object.keys(DOMESTIC_SCHEMES)) {
      if (new RegExp('\\b' + scheme + '\\b', 'i').test(pay)) {
        problems.push('pay.methods names "' + scheme + '", which only works in '
          + DOMESTIC_SCHEMES[scheme] + ' — this string is per-language, so it '
          + 'would be claimed by every market reading ' + lang);
      }
    }
  }

  if (problems.length) {
    failed++;
    console.log(label + '  FAIL');
    problems.forEach(p => console.log('        ' + p));
  } else {
    console.log(label + '  ' + summary + '   |   ' + pay);
  }
}

console.log();
if (failed) {
  console.log(failed + ' language(s) assert something that is not true.');
  console.log('If a label is correct and simply new, add it to ALLOWED in this file.');
  console.log('If you are unsure: "VAT" is accurate in every market, and');
  console.log('bank transfer is the only payment method the site can stand behind.');
  process.exit(1);
}
console.log('every VAT label and payment method is one someone has approved.');
