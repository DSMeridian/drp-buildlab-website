/* Visitor country -> language and currency, resolved at Netlify's edge.
 *
 * Netlify already knows the country from the connecting IP, so nothing goes
 * to a third-party geo service and the IP itself never leaves the edge -- it
 * is never logged here, never forwarded, and never reaches the client. Only a
 * two-letter country code comes back.
 *
 * Deliberately `no-store`: a cached country response is somebody else's
 * location, and this site's HTML is served through a shared CDN cache.
 */

/* ── Language ───────────────────────────────────────────────────────────
 * Every territory is mapped, so there is no such thing as an unrecognised
 * visitor. But the site only *has* the languages listed below, so this maps each
 * country to the closest one that exists rather than to its own language --
 * a visitor in Vietnam or Poland still gets English, since there is no
 * Vietnamese or Polish copy. English is the international default; Dutch
 * is reserved for the home market and the Dutch-speaking Caribbean.
 *
 * Only countries that are NOT English are listed. Everything absent falls
 * through to 'en' at the bottom of resolve(). */
const LANG_COUNTRIES = {
  nl: ['BE', 'NL', 'SR', 'AW', 'CW', 'SX', 'BQ'],

  fr: [
    'FR', 'MC', 'LU', 'CH', 'HT',
    // Overseas France
    'GF', 'GP', 'MQ', 'RE', 'YT', 'PM', 'BL', 'MF', 'NC', 'PF', 'WF', 'TF',
    // Francophone Africa
    'BJ', 'BF', 'BI', 'CM', 'CF', 'TD', 'KM', 'CD', 'CG', 'CI', 'DJ', 'GA',
    'GN', 'ML', 'NE', 'RW', 'SN', 'SC', 'TG', 'MG', 'MR', 'DZ', 'MA', 'TN',
    'VU',
  ],

  es: [
    'ES', 'MX', 'AR', 'CO', 'CL', 'PE', 'VE', 'EC', 'GT', 'CU', 'BO', 'DO',
    'HN', 'PY', 'SV', 'NI', 'CR', 'PA', 'UY', 'PR', 'GQ',
  ],

  // German, Indonesian and Japanese copy shipped 2026-09-03, machine
  // translated via DeepL and reviewed before promotion out of
  // assets/i18n.draft.js. AT is included with DE -- Austrian German is not
  // a separate site language.
  de: ['DE', 'AT'],
  id: ['ID'],
  ja: ['JP'],
};

/* ── Currency ───────────────────────────────────────────────────────────
 * ISO 3166-1 alpha-2 -> ISO 4217. Eurozone and euro-using territories are
 * omitted and fall through to EUR, which is also the currency the client is
 * actually invoiced in. A currency the rate provider does not quote (a few
 * closed or sanctioned ones do appear below) degrades to EUR client-side
 * rather than showing a price nobody can act on. */
const CURRENCY = {
  // Europe
  AL: 'ALL', BY: 'BYN', BA: 'BAM', BG: 'BGN', CZ: 'CZK', DK: 'DKK',
  FO: 'DKK', GI: 'GIP', GG: 'GBP', HU: 'HUF', IS: 'ISK', IM: 'GBP',
  JE: 'GBP', LI: 'CHF', MD: 'MDL', MK: 'MKD', NO: 'NOK', PL: 'PLN',
  RO: 'RON', RU: 'RUB', RS: 'RSD', SJ: 'NOK', SE: 'SEK', CH: 'CHF',
  UA: 'UAH', GB: 'GBP',
  // Americas
  AI: 'XCD', AG: 'XCD', AR: 'ARS', AW: 'AWG', BS: 'BSD', BB: 'BBD',
  BZ: 'BZD', BM: 'BMD', BO: 'BOB', BQ: 'USD', BR: 'BRL', VG: 'USD',
  CA: 'CAD', KY: 'KYD', CL: 'CLP', CO: 'COP', CR: 'CRC', CU: 'CUP',
  CW: 'XCG', DM: 'XCD', DO: 'DOP', EC: 'USD', SV: 'USD', FK: 'FKP',
  GL: 'DKK', GD: 'XCD', GT: 'GTQ', GY: 'GYD', HT: 'HTG', HN: 'HNL',
  JM: 'JMD', MX: 'MXN', MS: 'XCD', NI: 'NIO', PA: 'PAB', PY: 'PYG',
  PE: 'PEN', PR: 'USD', KN: 'XCD', LC: 'XCD', VC: 'XCD', SX: 'XCG',
  SR: 'SRD', TT: 'TTD', TC: 'USD', US: 'USD', UY: 'UYU', VE: 'VES',
  VI: 'USD',
  // Asia
  AF: 'AFN', AM: 'AMD', AZ: 'AZN', BH: 'BHD', BD: 'BDT', BT: 'BTN',
  BN: 'BND', KH: 'KHR', CN: 'CNY', GE: 'GEL', HK: 'HKD', IN: 'INR',
  ID: 'IDR', IR: 'IRR', IQ: 'IQD', IL: 'ILS', JP: 'JPY', JO: 'JOD',
  KZ: 'KZT', KW: 'KWD', KG: 'KGS', LA: 'LAK', LB: 'LBP', MO: 'MOP',
  MY: 'MYR', MV: 'MVR', MN: 'MNT', MM: 'MMK', NP: 'NPR', KP: 'KPW',
  OM: 'OMR', PK: 'PKR', PS: 'ILS', PH: 'PHP', QA: 'QAR', SA: 'SAR',
  SG: 'SGD', KR: 'KRW', LK: 'LKR', SY: 'SYP', TW: 'TWD', TJ: 'TJS',
  TH: 'THB', TL: 'USD', TR: 'TRY', TM: 'TMT', AE: 'AED', UZ: 'UZS',
  VN: 'VND', YE: 'YER',
  // Africa
  DZ: 'DZD', AO: 'AOA', BJ: 'XOF', BW: 'BWP', BF: 'XOF', BI: 'BIF',
  CV: 'CVE', CM: 'XAF', CF: 'XAF', TD: 'XAF', KM: 'KMF', CD: 'CDF',
  CG: 'XAF', CI: 'XOF', DJ: 'DJF', EG: 'EGP', GQ: 'XAF', ER: 'ERN',
  SZ: 'SZL', ET: 'ETB', GA: 'XAF', GM: 'GMD', GH: 'GHS', GN: 'GNF',
  GW: 'XOF', KE: 'KES', LS: 'LSL', LR: 'LRD', LY: 'LYD', MG: 'MGA',
  MW: 'MWK', ML: 'XOF', MR: 'MRU', MU: 'MUR', MA: 'MAD', EH: 'MAD',
  MZ: 'MZN', NA: 'NAD', NE: 'XOF', NG: 'NGN', RW: 'RWF', ST: 'STN',
  SN: 'XOF', SC: 'SCR', SL: 'SLE', SO: 'SOS', ZA: 'ZAR', SS: 'SSP',
  SD: 'SDG', TZ: 'TZS', TG: 'XOF', TN: 'TND', UG: 'UGX', ZM: 'ZMW',
  ZW: 'ZWG', SH: 'SHP',
  // Oceania
  AS: 'USD', AU: 'AUD', CK: 'NZD', FJ: 'FJD', PF: 'XPF', GU: 'USD',
  KI: 'AUD', MH: 'USD', FM: 'USD', NR: 'AUD', NC: 'XPF', NZ: 'NZD',
  NU: 'NZD', NF: 'AUD', MP: 'USD', PW: 'USD', PG: 'PGK', WS: 'WST',
  SB: 'SBD', TK: 'NZD', TO: 'TOP', TV: 'AUD', VU: 'VUV', WF: 'XPF',
};

function language(cc) {
  if (!cc) return null;      // null only when the country is unknown
  for (const lang in LANG_COUNTRIES) {
    if (LANG_COUNTRIES[lang].indexOf(cc) !== -1) return lang;
  }
  return 'en';
}

export default async (request, context) => {
  const cc = (((context.geo || {}).country || {}).code || '').toUpperCase();

  return new Response(JSON.stringify({
    country: cc || null,
    region: ((context.geo || {}).subdivision || {}).code || null,
    lang: language(cc),
    currency: CURRENCY[cc] || 'EUR',
  }), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store, private',
    },
  });
};

export const config = { path: '/api/geo' };
