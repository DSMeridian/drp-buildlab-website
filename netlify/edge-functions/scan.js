/* Free website scan: /api/scan?url=www.example.com&lang=nl
 *
 * Runs Google's PageSpeed Insights (Lighthouse, mobile) on the visitor's
 * website and answers with only what the scan page shows: four category
 * scores, five lab metrics and the audits that cost the most, titled in the
 * visitor's language. Google's full report is ~1 MB; this is ~2 KB.
 *
 * Needs PAGESPEED_API_KEY (Google Cloud > APIs & Services > PageSpeed Insights
 * API > Credentials; free, 25,000 scans a day). Without it Google refuses
 * almost every call, so the function answers { busy: true } at once and the
 * page asks for an email instead -- the lead is not lost.
 *
 * Results are cached at the edge for an hour per address and language, so a
 * visitor who scans twice, or a shared link, does not spend another scan.
 */

const PSI = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';
const CATS = ['performance', 'accessibility', 'best-practices', 'seo'];
const METRICS = ['first-contentful-paint', 'largest-contentful-paint', 'total-blocking-time', 'cumulative-layout-shift', 'speed-index'];
/* Lighthouse locales for the site's languages (pt is Brazilian on this site) */
const LOCALE = { en: 'en', nl: 'nl', fr: 'fr', de: 'de', it: 'it', es: 'es', pl: 'pl', pt: 'pt-BR', id: 'id', ja: 'ja', ar: 'ar', af: 'en' };
/* Google needs up to ~35 s for a slow site; edge functions must answer within 40 s */
const TIMEOUT = 36000;

const json = (body, status = 200, cache = 'no-store') => new Response(JSON.stringify(body), {
  status,
  headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': cache, 'Netlify-Vary': 'query=url|lang' },
});

/* Only public websites: a hostname with a dot, no IP addresses, no ports,
   nothing local. Google would refuse most of these anyway; this keeps the
   endpoint from being used to probe addresses at all. */
export function cleanUrl(raw) {
  let s = String(raw || '').trim();
  if (!s || s.length > 200) return null;
  if (!/^https?:\/\//i.test(s)) s = 'https://' + s;
  let u;
  try { u = new URL(s); } catch { return null; }
  if (!/^https?:$/.test(u.protocol) || u.username || u.password || u.port) return null;
  const h = u.hostname.toLowerCase();
  if (!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(h) || /(^|\.)(localhost|local|internal|lan)$/.test(h)) return null;
  u.hash = '';
  return u.toString();
}

/* Google's answer -> what the page shows. Exported for the test. */
export function summarize(data) {
  const lh = data && data.lighthouseResult;
  if (!lh || !lh.categories) return null;
  const scores = {};
  for (const c of CATS) { const x = lh.categories[c]; scores[c] = x && typeof x.score === 'number' ? Math.round(x.score * 100) : null; }
  const audits = lh.audits || {};
  const metrics = METRICS.filter(id => audits[id]).map(id => ({ id, title: audits[id].title, value: audits[id].displayValue || '', score: audits[id].score }));
  /* what costs the most: weight in its category x how far it is from passing */
  const cost = new Map();
  for (const c of CATS) {
    for (const ref of (lh.categories[c] && lh.categories[c].auditRefs) || []) {
      const a = audits[ref.id];
      if (!a || ref.group === 'metrics' || ref.group === 'hidden' || a.scoreDisplayMode === 'notApplicable' || a.scoreDisplayMode === 'manual' || a.scoreDisplayMode === 'informative') continue;
      if (typeof a.score !== 'number' || a.score >= 0.9) continue;
      const w = (ref.weight || 0) * (1 - a.score) + (a.details && a.details.overallSavingsMs ? a.details.overallSavingsMs / 1000 : 0);
      if (w <= 0) continue;
      if (!cost.has(ref.id) || cost.get(ref.id).w < w) cost.set(ref.id, { id: ref.id, cat: c, title: a.title.replace(/`/g, ''), w });
    }
  }
  const issues = [...cost.values()].sort((a, b) => b.w - a.w).slice(0, 6).map(({ id, cat, title }) => ({ id, cat, title }));
  return { url: lh.finalDisplayedUrl || lh.finalUrl || lh.requestedUrl, scores, metrics, issues };
}

export default async (req) => {
  const q = new URL(req.url).searchParams;
  const url = cleanUrl(q.get('url'));
  if (!url) return json({ error: 'bad-url' }, 400);
  const key = (Deno.env.get('PAGESPEED_API_KEY') || '').trim();
  if (!key) return json({ busy: true }, 503);

  const api = new URL(PSI);
  api.searchParams.set('url', url);
  api.searchParams.set('strategy', 'mobile');
  for (const c of CATS) api.searchParams.append('category', c);
  api.searchParams.set('locale', LOCALE[q.get('lang')] || 'en');
  api.searchParams.set('key', key);

  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), TIMEOUT);
  try {
    const res = await fetch(api, { signal: ctl.signal });
    const data = await res.json().catch(() => null);
    if (res.status === 429) return json({ busy: true }, 503);
    if (!res.ok) {
      /* Google could not load the site: a typo, a site that is down, or one that blocks bots */
      console.log('scan: Google answered', res.status, data && data.error && String(data.error.message).slice(0, 200));
      return json({ error: 'unreachable' }, 422);
    }
    const out = summarize(data);
    return out ? json(out, 200, 'public, max-age=3600') : json({ error: 'unreachable' }, 422);
  } catch (err) {
    console.log('scan:', err.name === 'AbortError' ? 'timed out' : err.message);
    return json({ busy: true }, 503);
  } finally {
    clearTimeout(timer);
  }
};

/* cache: manual lets Netlify keep the 200 answers (Cache-Control above) */
export const config = { path: '/api/scan', cache: 'manual' };
