/* DRP BuildLab — blog newsletter, the parts both senders share.
 *
 *   netlify/edge-functions/subscribe.js   sign-up and confirmation (Deno, on Netlify)
 *   tools/concept/newsletter.js           new-article emails (Node, in the Blog workflow)
 *   cms.drpbuildlab.com (drp_cms)          offers and offers-consent requests (Phase 2)
 *
 * Subscribers live in Resend as Contacts in ONE Segment, "Blog newsletter".
 * Their language is a private Topic, opt-out by default ("Blog newsletter
 * (nl)"), which only they are opted in to, plus the contact property
 * blog_lang for reading it back. An article goes out as one Broadcast per
 * language: to the segment, limited to that language's topic, so it reaches
 * only the contacts opted in to it. (One segment per language ran into the
 * free plan's 3 segments: the 4th language could not subscribe.)
 * Unsubscribing is Resend's own link and is global per contact.
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

/* Keep these names identical in drp_cms (src/lib/insights/newsletter.ts). */
export const BLOG_SEGMENT = 'Blog newsletter';
export const LANG_PROP = 'blog_lang';
export const topicName = lang => `Blog newsletter (${lang})`;
export const langOfTopic = name => { const m = /^Blog newsletter \(([a-z]{2})\)$/.exec(name || ''); return m && LANGS.includes(m[1]) ? m[1] : null; };
/* the language segments of before; only the migration still reads them */
export const langOfOldSegment = langOfTopic;

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

/* Every item of a list (/segments, /topics, ...), following has_more pages. */
export async function listAll(apiKey, path) {
  const out = [];
  let after = '';
  for (let i = 0; i < 50; i++) {
    const sep = path.includes('?') ? '&' : '?';
    const r = await resend(apiKey, 'GET', `${path}${sep}limit=100${after ? '&after=' + encodeURIComponent(after) : ''}`);
    if (!r.ok) throw new Error(`Resend ${path.split('?')[0].replace(/\/contacts\/[^/]+/, '/contacts/…')} ${r.status}: ${JSON.stringify(r.data).slice(0, 200)}`);
    const data = (r.data && r.data.data) || [];
    out.push(...data);
    if (!r.data.has_more || !data.length) break;
    after = data[data.length - 1].id;
  }
  return out;
}

const oldest = list => [...list].sort((a, b) => String(a.created_at).localeCompare(String(b.created_at)))[0];

/* The "Blog newsletter" segment id; created when missing if `create`, else
   null. The oldest wins, should two ever exist. */
export async function blogSegment(apiKey, { create = false } = {}) {
  const found = oldest((await listAll(apiKey, '/segments')).filter(s => s.name === BLOG_SEGMENT));
  if (found) return found.id;
  if (!create) return null;
  const r = await resend(apiKey, 'POST', '/segments', { name: BLOG_SEGMENT });
  if (!r.ok || !r.data?.id) throw new Error(`create segment ${r.status}: ${JSON.stringify(r.data).slice(0, 200)}`);
  return r.data.id;
}

/* The language topics, one per language (the oldest of a name wins). */
export async function blogTopics(apiKey) {
  const byLang = new Map();
  for (const t of (await listAll(apiKey, '/topics'))) {
    const lang = langOfTopic(t.name);
    if (lang && (!byLang.has(lang) || String(t.created_at) < String(byLang.get(lang).created_at))) byLang.set(lang, { ...t, lang });
  }
  return [...byLang.values()];
}

/* A new language topic: opt-out by default (which cannot change later), so a
   broadcast limited to it reaches only the contacts opted in; private, so
   only they see it on Resend's preference page. */
export async function createLangTopic(apiKey, lang) {
  const r = await resend(apiKey, 'POST', '/topics', {
    name: topicName(lang),
    default_subscription: 'opt_out',
    visibility: 'private',
    description: `New articles from the DRP BuildLab blog (${lang}).`,
  });
  if (!r.ok || !r.data?.id) throw new Error(`create topic ${r.status}: ${JSON.stringify(r.data).slice(0, 200)}`);
  return r.data.id;
}

/* The blog_lang contact property, created when missing. Resend refuses a
   property on a contact unless its key was created first. */
export async function ensureLangProperty(apiKey) {
  const have = (await listAll(apiKey, '/contact-properties')).some(p => p.key === LANG_PROP);
  if (have) return;
  const r = await resend(apiKey, 'POST', '/contact-properties', { key: LANG_PROP, type: 'string', fallback_value: '' });
  /* 409/422: created by a parallel call in the meantime */
  if (!r.ok && ![409, 422].includes(r.status)) throw new Error(`create property ${LANG_PROP} ${r.status}: ${JSON.stringify(r.data).slice(0, 200)}`);
}

/* Sets a contact's topic subscriptions. The API reference shows a bare
   array; the SDKs wrap it in { topics }, so the second form is the fallback. */
export async function setContactTopics(apiKey, emailOrId, topics) {
  if (!topics.length) return;
  const path = '/contacts/' + encodeURIComponent(emailOrId) + '/topics';
  let t = await resend(apiKey, 'PATCH', path, topics);
  if (!t.ok && t.status >= 400 && t.status < 500) t = await resend(apiKey, 'PATCH', path, { topics });
  if (!t.ok) throw new Error(`set topics ${t.status}: ${JSON.stringify(t.data).slice(0, 200)}`);
}

/* Puts a contact on the blog newsletter in one language: subscribed, in the
   blog segment, blog_lang set, opted in to that language's topic and out of
   the others (so an article never arrives twice). Creates the contact when
   missing; a returning one (unsubscribed before, or another language) is
   updated, because they confirmed again. Answers whether the contact had
   unsubscribed before. `ids` = { segment, topics: [{ id, lang }] }. */
export async function subscribeContact(apiKey, email, lang, ids) {
  const own = ids.topics.find(t => t.lang === lang);
  if (!own) throw new Error('no topic for ' + lang);
  const path = '/contacts/' + encodeURIComponent(email);
  const properties = { [LANG_PROP]: lang };
  let wasUnsubscribed = false;
  const found = await resend(apiKey, 'GET', path);
  let created = false;
  if (found.status === 404) {
    const c = await resend(apiKey, 'POST', '/contacts', { email, unsubscribed: false, segments: [{ id: ids.segment }], properties });
    if (c.ok) created = true;
    else if (![409, 422].includes(c.status)) throw new Error(`create contact ${c.status}: ${JSON.stringify(c.data).slice(0, 200)}`);
    /* else: created by a parallel click in the meantime; update it below */
  } else if (!found.ok) {
    throw new Error(`get contact ${found.status}: ${JSON.stringify(found.data).slice(0, 200)}`);
  } else {
    wasUnsubscribed = found.data?.unsubscribed === true;
  }
  if (!created) {
    const upd = await resend(apiKey, 'PATCH', path, { unsubscribed: false, properties });
    if (!upd.ok) throw new Error(`update contact ${upd.status}: ${JSON.stringify(upd.data).slice(0, 200)}`);
    const add = await resend(apiKey, 'POST', `${path}/segments/${ids.segment}`);
    if (!add.ok && add.status !== 409) throw new Error(`add to segment ${add.status}: ${JSON.stringify(add.data).slice(0, 200)}`);
  }
  await setContactTopics(apiKey, email, ids.topics.map(t => ({ id: t.id, subscription: t.lang === lang ? 'opt_in' : 'opt_out' })));
  return { wasUnsubscribed };
}

/* ── Offers consent (Phase 2) ───────────────────────────────────────────
   LEGAL DRAFT: nothing here runs until MARKETING_CONSENT_VERSION is set,
   which happens only after a lawyer approves the consent text and the
   offers terms (/offers-terms/).

   Consent to offers is a Resend Topic, opt_out by default, so only contacts
   who explicitly opted in receive an offer broadcast; private, so only they
   see it on Resend's preference page (where they can withdraw). The proof of
   consent is three contact properties. The CMS (cms.drpbuildlab.com) sends
   the offers and the consent requests; see docs/offers-consent-contract.md in
   drp_cms. Keep the names below identical on both sides. */
export const OFFERS_TOPIC_NAME = 'Offers from DRP BuildLab and partners';
export const OFFERS_PROPS = {
  version: 'offers_consent_version',
  at: 'offers_consent_at',
  source: 'offers_consent_source',
};
export const OFFERS_SOURCES = ['signup', 'reconsent'];

/* Thrown when the address is not (or no longer) a subscribed contact: the
   caller answers 409 and records nothing. */
export class NotSubscribedError extends Error {
  constructor() { super('not a subscribed contact'); this.name = 'NotSubscribedError'; }
}

/* The offers topic id, or null when it does not exist yet. Never creates it. */
export async function findOffersTopic(apiKey) {
  const found = oldest((await listAll(apiKey, '/topics')).filter(t => t.name === OFFERS_TOPIC_NAME));
  return found ? found.id : null;
}

/* The offers topic, created when missing. default_subscription cannot change
   after creation. */
let topicPromise = null;
export function findOrCreateOffersTopic(apiKey) {
  topicPromise ||= (async () => {
    const found = await findOffersTopic(apiKey);
    if (found) return found;
    const r = await resend(apiKey, 'POST', '/topics', {
      name: OFFERS_TOPIC_NAME,
      default_subscription: 'opt_out',
      visibility: 'private',
      description: 'Occasional offers from DRP BuildLab and selected partners, for subscribers who agreed to receive them.',
    });
    if (!r.ok || !r.data?.id) throw new Error(`create topic ${r.status}: ${JSON.stringify(r.data).slice(0, 200)}`);
    return r.data.id;
  })();
  topicPromise.catch(() => { topicPromise = null; });
  return topicPromise;
}

/* Ends consent to offers (topic opt_out). Used when someone who had
   unsubscribed from everything subscribes again without ticking the box:
   a global unsubscribe ended their consent, so an old opt-in must not come
   back to life. Does nothing while the topic does not exist. */
export async function optOutOffers(apiKey, email) {
  const topicId = await findOffersTopic(apiKey);
  if (topicId) await setContactTopics(apiKey, email, [{ id: topicId, subscription: 'opt_out' }]);
}

/* The three consent properties (type string), created when missing. Resend
   refuses a property on a contact unless its key was created first. */
let propsPromise = null;
export function ensureOffersProperties(apiKey) {
  propsPromise ||= (async () => {
    const have = new Set((await listAll(apiKey, '/contact-properties')).map(p => p.key));
    for (const key of Object.values(OFFERS_PROPS)) {
      if (have.has(key)) continue;
      const r = await resend(apiKey, 'POST', '/contact-properties', { key, type: 'string', fallback_value: '' });
      /* 409/422: created by a parallel call in the meantime */
      if (!r.ok && ![409, 422].includes(r.status)) throw new Error(`create property ${key} ${r.status}: ${JSON.stringify(r.data).slice(0, 200)}`);
    }
  })();
  propsPromise.catch(() => { propsPromise = null; });
  return propsPromise;
}

/* Records consent to offers for an existing, subscribed contact: opt in to
   the topic, then store version, time and source as contact properties.
   Throws NotSubscribedError when the contact is missing or unsubscribed. */
export async function optInOffers(apiKey, email, { version, source }) {
  if (!version) throw new Error('optInOffers: no consent version');
  if (!OFFERS_SOURCES.includes(source)) throw new Error('optInOffers: unknown source ' + source);
  const path = '/contacts/' + encodeURIComponent(email);
  const contact = await resend(apiKey, 'GET', path);
  if (contact.status === 404) throw new NotSubscribedError();
  if (!contact.ok) throw new Error(`get contact ${contact.status}: ${JSON.stringify(contact.data).slice(0, 200)}`);
  if (contact.data?.unsubscribed) throw new NotSubscribedError();

  const [topicId] = await Promise.all([findOrCreateOffersTopic(apiKey), ensureOffersProperties(apiKey)]);
  await setContactTopics(apiKey, email, [{ id: topicId, subscription: 'opt_in' }]);

  const props = await resend(apiKey, 'PATCH', path, {
    properties: { [OFFERS_PROPS.version]: version, [OFFERS_PROPS.at]: new Date().toISOString(), [OFFERS_PROPS.source]: source },
  });
  if (!props.ok) throw new Error(`consent properties ${props.status}: ${JSON.stringify(props.data).slice(0, 200)}`);
}
