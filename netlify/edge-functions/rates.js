/* Live EUR exchange rates, proxied and cached at the edge.
 *
 * Proxied rather than called from the browser for three reasons: the upstream
 * host never sees visitor traffic, the response is cached once per hour per
 * edge region instead of once per pageview, and a provider outage degrades
 * here -- where there is a fallback -- instead of in the page.
 *
 * Rates move by fractions of a percent within a day, and these figures are
 * indicative prices rather than a checkout total (invoicing is in EUR), so an
 * hour of staleness is immaterial.
 */

const UPSTREAM = 'https://open.er-api.com/v6/latest/EUR';
const TTL = 3600;

/* Last-resort table, used only when the provider is unreachable. Snapshotted
 * from the live feed on 2026-08-22; it exists so prices still render, not to
 * be accurate, and the response is marked stale:true either way. Currencies
 * absent here fall back to EUR client-side rather than showing a guess.
 *
 * It drifts, and that is tolerable for an outage path -- but check it if a
 * major rate has moved a long way, since the previous snapshot had drifted
 * about 7% on USD before anyone noticed. */
const FALLBACK = {
  USD: 1.1583, GBP: 0.8589, CHF: 0.9422, CAD: 1.6067, AUD: 1.6185,
  NZD: 1.9822, SEK: 11.16, NOK: 10.8, DKK: 7.4751, PLN: 4.3299,
  CZK: 24.19, HUF: 368, RON: 5.2556, BGN: 1.9558, TRY: 56, JPY: 184,
  CNY: 7.7967, INR: 110, BRL: 5.9521, MXN: 19.68, ARS: 1751, CLP: 1084,
  COP: 3662, PEN: 3.895, ZAR: 18.61, AED: 4.2538, SAR: 4.3435,
  SGD: 1.4734, HKD: 9.0842, KRW: 1579, IDR: 20559, MYR: 4.6835,
  THB: 38.47, PHP: 72.44, VND: 29999, ILS: 3.5052, UAH: 51.63, RSD: 117,
  ISK: 141, MAD: 10.82, NGN: 1560, KES: 150, EGP: 59.14, PKR: 321,
  BDT: 142, TWD: 36.78, QAR: 4.2161, KWD: 0.3578,
};

const send = (body, cache) => new Response(JSON.stringify(body), {
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': cache,
  },
});

export default async () => {
  try {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), 2500);
    const r = await fetch(UPSTREAM, { signal: ctl.signal });
    clearTimeout(t);
    if (!r.ok) throw new Error('upstream ' + r.status);

    const data = await r.json();
    if (!data || !data.rates || !data.rates.USD) throw new Error('malformed');

    return send({
      base: 'EUR',
      rates: data.rates,
      updated: data.time_last_update_utc || null,
      stale: false,
    }, 'public, max-age=' + TTL + ', stale-while-revalidate=86400');
  } catch (_) {
    // Short cache on the fallback so a brief provider blip does not pin the
    // stale table in the CDN for a full hour.
    return send({
      base: 'EUR', rates: FALLBACK, updated: null, stale: true,
    }, 'public, max-age=300');
  }
};

export const config = { path: '/api/rates' };
