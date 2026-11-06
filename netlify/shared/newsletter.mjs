/* DRP BuildLab — blog newsletter, the parts both senders share.
 *
 *   netlify/edge-functions/subscribe.js   sign-up and confirmation (Deno, on Netlify)
 *   tools/concept/newsletter.js           new-article emails (Node, in the Blog workflow)
 *
 * Subscribers live in Resend as Contacts, one Segment per language
 * ("Blog newsletter (nl)"), so an article goes out as one Broadcast per
 * language. Unsubscribing is Resend's own link and is global per contact.
 *
 * The email texts are not written here. They are the #mail block of the
 * /blog/subscribe/ page, translated by localize.js like every other string
 * (tools/concept/i18n/<lang>.json), and read from that page per language.
 */

export const LANGS = ['en', 'nl', 'fr', 'de', 'it', 'es', 'pl', 'pt', 'id', 'ja', 'ar', 'af'];
export const RTL = ['ar'];

/* The market an email links to when it is sent per language rather than per
   visitor (new-article emails): the same choice as localize.js LANG_HOME. */
export const LANG_HOME = { nl: 'be', fr: 'fr', de: 'de', it: 'it', es: 'es', pt: 'br', pl: 'pl', en: 'ie', id: 'id', ja: 'jp', ar: 'ae', af: 'za-af' };
export const prefixOf = marketKey => String(marketKey).replace('-', '/');

export const SEGMENT_PREFIX = 'Blog newsletter (';
export const segmentName = lang => `${SEGMENT_PREFIX}${lang})`;
export const langOfSegment = name => { const m = /^Blog newsletter \(([a-z]{2})\)$/.exec(name || ''); return m && LANGS.includes(m[1]) ? m[1] : null; };

export const MAIL_KEYS = ['csubj', 'chead', 'cbody', 'cbtn', 'cvalid', 'cignore', 'ahead', 'abtn', 'afoot', 'aunsub'];

const decode = s => String(s)
  .replace(/<[^>]+>/g, '')
  .replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
  .replace(/&#(\d+);/g, (m, n) => String.fromCodePoint(+n)).replace(/&#x([0-9a-f]+);/gi, (m, n) => String.fromCodePoint(parseInt(n, 16)))
  .replace(/&amp;/g, '&')
  .replace(/\s+/g, ' ').trim();

/* The #mail strings of one localized /blog/subscribe/ page. Throws when one is
   missing, so a half-built page never sends a half-empty email. */
export function mailStrings(html) {
  const block = (String(html).match(/<div id="mail" hidden(?:="")?>([\s\S]*?)<\/div>/) || [])[1];
  if (!block) throw new Error('no #mail block in the subscribe page');
  const s = {};
  for (const [, k, v] of block.matchAll(/<span data-k="([a-z]+)">([\s\S]*?)<\/span>/g)) s[k] = decode(v);
  const missing = MAIL_KEYS.filter(k => !s[k]);
  if (missing.length) throw new Error('subscribe page is missing mail strings: ' + missing.join(', '));
  return s;
}

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/* One plain layout for both emails: the wordmark, the content, a footer.
   Inline styles and a single table, because that is what mail clients read. */
function layout({ lang, title, inner, foot, banner }) {
  const dir = RTL.includes(lang) ? 'rtl' : 'ltr';
  const align = dir === 'rtl' ? 'right' : 'left';
  return `<!doctype html>
<html lang="${lang}" dir="${dir}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${esc(title)}</title></head>
<body style="margin:0;padding:0;background:#f1f2f6;color:#0b0b0c;font-family:Helvetica,Arial,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f2f6"><tr><td align="center" style="padding:32px 16px">
${banner ? `<p style="max-width:528px;margin:0 auto 16px;padding:12px 16px;background:#fff3cd;border-radius:10px;font-size:14px;line-height:1.5;color:#5c4400;text-align:left" dir="ltr">${esc(banner)}</p>` : ''}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" dir="${dir}" style="max-width:560px;background:#ffffff;border-radius:16px;text-align:${align}">
<tr><td style="padding:28px 32px 0;font-weight:800;font-size:15px;letter-spacing:.04em" dir="ltr" align="${align}"><span style="color:#0b0b0c">DRP</span> <span style="color:#1f5eff">BUILDLAB</span></td></tr>
${inner}
</table>
${foot ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" dir="${dir}" style="max-width:560px;text-align:${align}"><tr><td style="padding:18px 32px;font-size:12.5px;line-height:1.6;color:#5a5d67">${foot}</td></tr></table>` : ''}
</td></tr></table>
</body></html>`;
}

const button = (href, label) => `<a href="${esc(href)}" style="display:inline-block;background:#1f5eff;color:#ffffff;text-decoration:none;font-weight:600;font-size:16px;padding:14px 24px;border-radius:99px">${esc(label)}</a>`;

export function confirmEmail({ s, lang, link }) {
  const inner = `<tr><td style="padding:24px 32px 0"><h1 style="margin:0;font-size:26px;line-height:1.2">${esc(s.chead)}</h1></td></tr>
<tr><td style="padding:14px 32px 0;font-size:16px;line-height:1.6">${esc(s.cbody)}</td></tr>
<tr><td style="padding:24px 32px 0">${button(link, s.cbtn)}</td></tr>
<tr><td style="padding:20px 32px 0;font-size:14px;line-height:1.6;color:#5a5d67">${esc(s.cvalid)}</td></tr>
<tr><td style="padding:12px 32px 32px;font-size:14px;line-height:1.6;color:#5a5d67">${esc(s.cignore)}</td></tr>`;
  return {
    subject: s.csubj,
    html: layout({ lang, title: s.csubj, inner }),
    text: [s.chead, '', s.cbody, '', `${s.cbtn}: ${link}`, '', s.cvalid, s.cignore].join('\n'),
  };
}

/* {{{RESEND_UNSUBSCRIBE_URL}}} is filled in by Resend per recipient. */
export const UNSUBSCRIBE = '{{{RESEND_UNSUBSCRIBE_URL}}}';

/* banner: a note above the email, only for the staging preview */
export function articleEmail({ s, lang, title, excerpt, url, image, banner }) {
  const inner = `<tr><td style="padding:24px 32px 0;font-size:13px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:#1f5eff">${esc(s.ahead)}</td></tr>
${image ? `<tr><td style="padding:16px 32px 0"><a href="${esc(url)}"><img src="${esc(image)}" alt="" width="496" style="display:block;width:100%;max-width:496px;height:auto;border-radius:10px;border:0"></a></td></tr>` : ''}
<tr><td style="padding:18px 32px 0"><h1 style="margin:0;font-size:26px;line-height:1.25"><a href="${esc(url)}" style="color:#0b0b0c;text-decoration:none">${esc(title)}</a></h1></td></tr>
<tr><td style="padding:12px 32px 0;font-size:16px;line-height:1.6;color:#1d2230">${esc(excerpt)}</td></tr>
<tr><td style="padding:24px 32px 32px">${button(url, s.abtn)}</td></tr>`;
  const foot = `${esc(s.afoot)}<br><a href="${UNSUBSCRIBE}" style="color:#5a5d67">${esc(s.aunsub)}</a>`;
  return {
    subject: title,
    html: layout({ lang, title, inner, foot, banner }),
    text: [...(banner ? [banner, ''] : []), s.ahead, '', title, '', excerpt, '', `${s.abtn}: ${url}`, '', '—', s.afoot, `${s.aunsub}: ${UNSUBSCRIBE}`].join('\n'),
  };
}

/* Resend's REST API. Its default rate limit is a few requests a second, so a
   429 is waited out (Retry-After) and tried again, twice at most. */
export async function resend(apiKey, method, path, body, extraHeaders = {}) {
  for (let attempt = 1; ; attempt++) {
    const res = await fetch('https://api.resend.com' + path, {
      method,
      headers: { authorization: 'Bearer ' + apiKey, ...(body ? { 'content-type': 'application/json' } : {}), ...extraHeaders },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (res.status === 429 && attempt < 3) {
      const wait = Math.min(5, Number(res.headers.get('retry-after')) || attempt);
      await new Promise(r => setTimeout(r, wait * 1000));
      continue;
    }
    const text = await res.text();
    let data = null;
    try { data = text ? JSON.parse(text) : null; } catch { data = { raw: text.slice(0, 300) }; }
    return { ok: res.ok, status: res.status, data };
  }
}

/* Every segment, following has_more pages. */
export async function listSegments(apiKey) {
  const out = [];
  let after = '';
  for (let i = 0; i < 20; i++) {
    const r = await resend(apiKey, 'GET', `/segments?limit=100${after ? '&after=' + encodeURIComponent(after) : ''}`);
    if (!r.ok) throw new Error(`Resend segments ${r.status}: ${JSON.stringify(r.data).slice(0, 200)}`);
    const data = (r.data && r.data.data) || [];
    out.push(...data);
    if (!r.data.has_more || !data.length) break;
    after = data[data.length - 1].id;
  }
  return out;
}
