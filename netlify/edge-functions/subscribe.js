/* DRP BuildLab — blog newsletter sign-up, with double opt-in
 *
 * POST /api/subscribe           (form body: email, market, bot-field)
 *   200 { sent: true }      a confirmation link was emailed (also answered for
 *                           a bot, and for an address already on the list, so
 *                           the answer never tells who is subscribed)
 *   400 / 403 / 429 / 5xx   not emailed; the reason is in { error }
 *
 * POST /api/subscribe/confirm   (form body: t, the token from that link)
 *   200 { subscribed: true }  the address is a Resend contact in the segment
 *                             of its language ("Blog newsletter (nl)")
 *   400 invalid token · 410 expired (7 days) · 5xx Resend failed
 *
 * Nothing is stored before the click on the confirmation link: the token
 * carries the address, language and market, encrypted and authenticated
 * (AES-GCM), so it cannot be read or forged. The link puts it in the URL
 * fragment of /<market>/blog/subscribe/, which no server or analytics tag
 * receives.
 *
 * The email texts are the #mail block of that same page in the visitor's
 * market (see netlify/shared/newsletter.mjs). The language is that page's
 * own lang, not something the browser claims.
 *
 * Needs RESEND_API_KEY and MAIL_FROM, the same values the form emails use.
 * NEWSLETTER_SECRET is optional: without it the token key is derived from
 * RESEND_API_KEY, so rotating that key voids links not clicked yet.
 */
import { LANGS, LANG_HOME, prefixOf, segmentName, langOfSegment, mailStrings, confirmEmail, resend, listSegments } from '../shared/newsletter.mjs';

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const MARKET = /^[a-z]{2}(?:-[a-z]{2})?$/;
const TOKEN_TTL = 7 * 24 * 60 * 60 * 1000;

/* per IP, in memory: resets when the isolate restarts, like /api/form */
const RATE = { subscribe: 5, confirm: 10 };
const RATE_WINDOW = 10 * 60 * 1000;
const windows = new Map();
function limited(kind, ip) {
  const k = kind + ':' + ip, now = Date.now(), w = windows.get(k);
  if (!w || now > w.resetAt) { windows.set(k, { count: 1, resetAt: now + RATE_WINDOW }); return false; }
  if (w.count >= RATE[kind]) return true;
  w.count++;
  return false;
}

const json = (status, body) => new Response(JSON.stringify(body), {
  status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
});

/* ── token ─────────────────────────────────────────────────────────────── */
const enc = new TextEncoder(), dec = new TextDecoder();
const b64u = bytes => btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const unb64u = s => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4)), c => c.charCodeAt(0));

let keyPromise = null;
function tokenKey() {
  const secret = Deno.env.get('NEWSLETTER_SECRET') || Deno.env.get('RESEND_API_KEY') || '';
  if (!secret) return null;
  keyPromise ||= crypto.subtle.digest('SHA-256', enc.encode('drp-newsletter-token-v1:' + secret))
    .then(raw => crypto.subtle.importKey('raw', raw, 'AES-GCM', false, ['encrypt', 'decrypt']));
  return keyPromise;
}
async function seal(payload) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, await tokenKey(), enc.encode(JSON.stringify(payload))));
  const out = new Uint8Array(iv.length + ct.length); out.set(iv); out.set(ct, iv.length);
  return b64u(out);
}
async function open(token) {
  try {
    const raw = unb64u(token);
    const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: raw.slice(0, 12) }, await tokenKey(), raw.slice(12));
    return JSON.parse(dec.decode(pt));
  } catch { return null; }
}

/* ── helpers ───────────────────────────────────────────────────────────── */
async function sha256hex(s) {
  const h = new Uint8Array(await crypto.subtle.digest('SHA-256', enc.encode(s)));
  return [...h].map(b => b.toString(16).padStart(2, '0')).join('');
}

/* The visitor's market page, for its language and the email texts. A market
   that does not exist falls back to the home market of the language asked. */
async function marketPage(request, market) {
  const tryOne = async key => {
    if (!MARKET.test(key || '')) return null;
    const res = await fetch(new URL(`/${prefixOf(key)}/blog/subscribe/`, request.url), { headers: { accept: 'text/html' } }).catch(() => null);
    if (!res || !res.ok) return null;
    const html = await res.text();
    const lang = (html.match(/<html lang="([a-z]{2})"/) || [])[1];
    if (!LANGS.includes(lang)) return null;
    try { return { market: key, lang, s: mailStrings(html) }; }
    catch (err) { console.error('subscribe:', key, err.message); return null; }
  };
  return (await tryOne(market)) || (await tryOne(LANG_HOME.en));
}

/* The segment of a language, created the first time someone confirms in it. */
let segmentCache = null;
async function segments(apiKey) {
  if (!segmentCache) segmentCache = (await listSegments(apiKey)).filter(s => langOfSegment(s.name));
  return segmentCache;
}
async function segmentFor(apiKey, lang) {
  const all = await segments(apiKey);
  /* the oldest one wins, should two ever be created at the same moment */
  const found = all.filter(s => langOfSegment(s.name) === lang).sort((a, b) => String(a.created_at).localeCompare(String(b.created_at)))[0];
  if (found) return found.id;
  const r = await resend(apiKey, 'POST', '/segments', { name: segmentName(lang) });
  if (!r.ok || !r.data?.id) throw new Error(`create segment ${r.status}: ${JSON.stringify(r.data).slice(0, 200)}`);
  segmentCache = null;
  return r.data.id;
}

/* Subscribed, in one language's segment only. A returning contact (who once
   unsubscribed, or signs up again in another language) is updated: they
   confirmed again, so they are subscribed again. */
async function addContact(apiKey, email, lang) {
  const seg = await segmentFor(apiKey, lang);
  const path = '/contacts/' + encodeURIComponent(email);
  const found = await resend(apiKey, 'GET', path);
  if (found.status === 404) {
    const created = await resend(apiKey, 'POST', '/contacts', { email, unsubscribed: false, segments: [{ id: seg }] });
    if (created.ok) return;
    if (![409, 422].includes(created.status)) throw new Error(`create contact ${created.status}: ${JSON.stringify(created.data).slice(0, 200)}`);
    /* created by a parallel click in the meantime: update it below */
  } else if (!found.ok) {
    throw new Error(`get contact ${found.status}: ${JSON.stringify(found.data).slice(0, 200)}`);
  }
  const upd = await resend(apiKey, 'PATCH', path, { unsubscribed: false });
  if (!upd.ok) throw new Error(`update contact ${upd.status}: ${JSON.stringify(upd.data).slice(0, 200)}`);
  const add = await resend(apiKey, 'POST', `${path}/segments/${seg}`);
  if (!add.ok && add.status !== 409) throw new Error(`add to segment ${add.status}: ${JSON.stringify(add.data).slice(0, 200)}`);
  /* out of the other languages' segments, so an article never arrives twice */
  const blogSegs = (await segments(apiKey)).filter(s => s.id !== seg);
  if (!blogSegs.length) return;
  const mine = await resend(apiKey, 'GET', `${path}/segments`);
  const inSegs = mine.ok && Array.isArray(mine.data?.data) ? new Set(mine.data.data.map(s => s.id)) : null;
  for (const s of blogSegs) {
    if (inSegs && !inSegs.has(s.id)) continue;
    const del = await resend(apiKey, 'DELETE', `${path}/segments/${s.id}`);
    if (!del.ok && del.status !== 404) console.error('subscribe: could not leave segment', s.name, del.status);
  }
}

function originOk(request) {
  let host = null;
  try { host = new URL(request.headers.get('origin')).host; } catch { /* absent, or "null" */ }
  return !host || host === new URL(request.url).host;
}

/* ── handlers ──────────────────────────────────────────────────────────── */
async function signUp(request, context, apiKey, from) {
  let data;
  try { data = await request.formData(); } catch { return json(400, { error: 'unreadable form' }); }
  const get = k => String(data.get(k) ?? '').slice(0, 300).trim();
  if (get('bot-field')) return json(200, { sent: true });

  const email = get('email').toLowerCase();
  if (email.length > 254 || !EMAIL.test(email)) return json(400, { error: 'invalid email' });

  const ip = context?.ip || request.headers.get('x-nf-client-connection-ip') || 'unknown';
  if (limited('subscribe', ip)) return json(429, { error: 'too many sign-ups, try again later' });

  const page = await marketPage(request, get('market'));
  if (!page) { console.error('subscribe: no subscribe page for market', get('market')); return json(503, { error: 'not available' }); }

  const token = await seal({ e: email, l: page.lang, m: page.market, t: Date.now() });
  const link = new URL(`/${prefixOf(page.market)}/blog/subscribe/#t=${token}`, request.url).href;
  const mail = confirmEmail({ s: page.s, lang: page.lang, link });

  /* At most one confirmation email per address and day: a repeated key with a
     new token is refused by Resend (409), and the first link still works. */
  const day = new Date().toISOString().slice(0, 10);
  const key = `nl-confirm-${(await sha256hex(email)).slice(0, 40)}-${day}`;
  try {
    const r = await resend(apiKey, 'POST', '/emails', { from, to: [email], subject: mail.subject, html: mail.html, text: mail.text }, { 'idempotency-key': key });
    if (r.ok || r.status === 409) return json(200, { sent: true });
    console.error('subscribe: Resend answered', r.status, JSON.stringify(r.data).slice(0, 300));
    return json(502, { error: 'the email provider answered ' + r.status });
  } catch (err) {
    console.error('subscribe: Resend unreachable', err.message);
    return json(502, { error: 'the email provider could not be reached' });
  }
}

async function confirm(request, context, apiKey) {
  let data;
  try { data = await request.formData(); } catch { return json(400, { error: 'unreadable form' }); }
  const token = String(data.get('t') ?? '').trim();

  const ip = context?.ip || request.headers.get('x-nf-client-connection-ip') || 'unknown';
  if (limited('confirm', ip)) return json(429, { error: 'too many attempts, try again later' });

  const p = /^[A-Za-z0-9_-]{40,2000}$/.test(token) ? await open(token) : null;
  if (!p || !EMAIL.test(p.e || '') || !LANGS.includes(p.l) || typeof p.t !== 'number') return json(400, { error: 'invalid token' });
  const age = Date.now() - p.t;
  if (age > TOKEN_TTL || age < -5 * 60 * 1000) return json(410, { error: 'expired' });

  try {
    await addContact(apiKey, p.e, p.l);
    return json(200, { subscribed: true });
  } catch (err) {
    console.error('subscribe: confirm failed', err.message);
    return json(502, { error: 'could not save the subscription' });
  }
}

export default async (request, context) => {
  if (request.method !== 'POST') return json(405, { error: 'POST only' });
  if (!originOk(request)) return json(403, { error: 'wrong origin' });

  const apiKey = Deno.env.get('RESEND_API_KEY');
  const from = Deno.env.get('MAIL_FROM');
  if (!apiKey || !from || !tokenKey()) {
    console.error('subscribe: RESEND_API_KEY or MAIL_FROM is not set');
    return json(503, { error: 'email is not configured' });
  }
  return new URL(request.url).pathname.replace(/\/$/, '') === '/api/subscribe/confirm'
    ? confirm(request, context, apiKey)
    : signUp(request, context, apiKey, from);
};

export const config = { path: ['/api/subscribe', '/api/subscribe/confirm'] };
