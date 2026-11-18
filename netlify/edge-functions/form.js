/* DRP BuildLab — form submissions: emailed, and handed to the client zone
 * POST /api/form  (application/x-www-form-urlencoded, the same body the
 * browser posts to Netlify Forms)
 *   200 { sent, stored }  emailed to ADMIN_EMAIL through Resend, and/or
 *                         stored as a lead (or partner application) in the
 *                         client zone; one of the two is enough
 *   200 { sent: false }   a bot (honeypot filled); nothing is sent
 *   4xx / 5xx             neither worked; the reason is in { error }
 *
 * Why this exists: Netlify's spam filter quietly moves real enquiries to the
 * Spam tab. Those send no notification and never reach the client zone's
 * webhook, while the visitor still sees "thank you". On staging, 4 of the
 * first 9 contact-form submissions went that way; on the live site, a quote
 * request from /us/ on 13 Nov 2026 never reached the CRM. So the browser
 * posts every form here as well as to Netlify, and this function:
 *
 *   · emails it (since 16 Oct 2026), and
 *   · hands it to the client zone's /leads itself (since 16 Nov 2026), in
 *     the shape Netlify's webhook posts, signed the way Netlify signs (HS256
 *     JWS over the body's SHA-256) with the same secret, as issuer
 *     "drpbuildlab-website". Netlify's own webhook stays as the backup.
 *
 * The browser gives each filled-in form one id (submission-id) and sends it
 * to Netlify and here alike. The client zone keys the lead on it, so the two
 * deliveries make one lead, whichever arrives first. Without a usable id
 * nothing is handed over from here and Netlify's webhook is the only route,
 * as before.
 *
 * Environment variables (in the site's settings):
 *   RESEND_API_KEY, MAIL_FROM ('DRP BuildLab <…@drpbuildlab.com>', a domain
 *     verified in Resend), ADMIN_EMAIL (one address or a comma-separated
 *     list): the same values as the client zone. For the email.
 *   CLIENTZONE_URL (https://clientzone.drpbuildlab.com, or the staging
 *     client zone) and NETLIFY_FORMS_JWS_SECRET (the client zone's value of
 *     the same name): for the hand-over.
 * Without one set, that half is skipped; without both this answers 503 and
 * the form still succeeds through Netlify.
 */

const RESEND_URL = 'https://api.resend.com/emails';

/* Every field each form posts, with the Dutch labels __forms.html gives
   Netlify, in the order the email lists them. Anything else is ignored. */
const FORMS = {
  'offerte-aanvraag': {
    title: 'Nieuwe offerteaanvraag',
    required: ['voornaam', 'email'],
    fields: [
      ['voornaam', 'Voornaam'], ['achternaam', 'Achternaam'], ['klanttype', 'Klanttype'],
      ['bedrijf', 'Bedrijfsnaam'], ['ondernemingsnummer', 'Bedrijfs- of btw-nummer'],
      ['telefoon', 'Telefoon'], ['email', 'E-mail'], ['website', 'Website'],
      ['dienst', 'Dienst'], ['facturatie', 'Facturatie (Tinrate)'],
      ['ref', 'Partnercode'], ['bericht', 'Bericht'], ['toestemming', 'Toestemming privacybeleid'],
    ],
  },
  'partner-aanvraag': {
    title: 'Nieuwe partneraanvraag',
    required: ['voornaam', 'email'],
    fields: [
      ['voornaam', 'Voornaam'], ['achternaam', 'Achternaam'], ['email', 'E-mail'],
      ['kanaal', 'Kanaal'], ['bereik', 'Bereik'], ['profiel', 'Profiel of website'],
      ['gewenste_code', 'Gewenste code'], ['bericht', 'Bericht'],
      ['toestemming', 'Toestemming privacybeleid'],
    ],
  },
};

const MAX_FIELD = 5000;
const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
/* The client zone's own check (submissionKey in src/leads/handler.js). */
const SUBMISSION_ID = /^[A-Za-z0-9-]{8,64}$/;
const HANDOVER_TIMEOUT = 8000;

const RATE_LIMIT  = 5;
const RATE_WINDOW = 10 * 60 * 1000; // 10 minutes per IP
const ipWindows   = new Map();       // in-memory, resets when isolate restarts

function checkRate(ip) {
  const now = Date.now();
  const win = ipWindows.get(ip);
  if (!win || now > win.resetAt) {
    ipWindows.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
    return false;
  }
  if (win.count >= RATE_LIMIT) return true;
  win.count++;
  return false;
}

const json = (status, body) => new Response(JSON.stringify(body), {
  status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
});

/* One line per value; a header can't carry a newline. */
const oneLine = s => String(s).replace(/[\r\n]+/g, ' ').trim();

export default async (request, context) => {
  if (request.method !== 'POST') return json(405, { error: 'POST only' });

  /* Only this site's own pages post here. */
  let originHost = null;
  try { originHost = new URL(request.headers.get('origin')).host; } catch { /* absent, or "null" */ }
  if (originHost && originHost !== new URL(request.url).host) return json(403, { error: 'wrong origin' });

  let data;
  try { data = await request.formData(); }
  catch { return json(400, { error: 'unreadable form' }); }
  const get = k => String(data.get(k) ?? '').slice(0, MAX_FIELD).trim();

  const formName = get('form-name');
  const form = FORMS[formName];
  if (!form) return json(400, { error: 'unknown form' });

  /* The hidden honeypot: a person never fills it. Answer as if sent. */
  if (get('bot-field')) return json(200, { sent: false });

  const missing = form.required.filter(k => !get(k));
  if (missing.length) return json(400, { error: 'missing ' + missing.join(', ') });
  const email = oneLine(get('email'));
  if (!EMAIL.test(email)) return json(400, { error: 'invalid email' });

  const ip = context?.ip || request.headers.get('x-nf-client-connection-ip') || 'unknown';
  if (checkRate(ip)) return json(429, { error: 'too many submissions, try again later' });

  /* The page it came from: the market and language are in the path. */
  const referer = request.headers.get('referer') || '';
  let page = '';
  try { page = new URL(referer).pathname; } catch { /* none */ }

  /* The browser keeps one id per filled-in form: pressing send again after
     an error does not email the same enquiry twice (Resend drops a repeated
     key for 24 hours), and the client zone makes one lead of it. */
  const sid = get('submission-id');
  const validSid = SUBMISSION_ID.test(sid);

  const mail = mailConfig();
  const zone = zoneConfig();
  if (!mail && !(zone && validSid)) {
    console.error('form: neither email (RESEND_API_KEY, MAIL_FROM, ADMIN_EMAIL) nor the client zone (CLIENTZONE_URL, NETLIFY_FORMS_JWS_SECRET) is set up');
    return json(503, { error: 'not configured' });
  }
  if (!mail) console.error('form: RESEND_API_KEY, MAIL_FROM or ADMIN_EMAIL is not set; not emailed');
  if (!zone) console.error("form: CLIENTZONE_URL or NETLIFY_FORMS_JWS_SECRET is not set; left to Netlify's webhook");

  const [sent, stored] = await Promise.all([
    mail ? sendEmail(mail, { form, get, email, page, sid: validSid ? sid : '', country: context?.geo?.country?.code }) : null,
    zone && validSid ? handOver(zone, { formName, form, get, sid, referer }) : null,
  ]);
  if (sent?.ok || stored?.ok) return json(200, { sent: !!sent?.ok, stored: !!stored?.ok });
  return json(502, { error: [sent?.error, stored?.error].filter(Boolean).join('; ') });
};

function mailConfig() {
  const apiKey = Deno.env.get('RESEND_API_KEY');
  const from = Deno.env.get('MAIL_FROM');
  const to = String(Deno.env.get('ADMIN_EMAIL') || '').split(',').map(a => a.trim()).filter(Boolean);
  return apiKey && from && to.length ? { apiKey, from, to } : null;
}

function zoneConfig() {
  const url = String(Deno.env.get('CLIENTZONE_URL') || '').trim().replace(/\/+$/, '');
  const secret = Deno.env.get('NETLIFY_FORMS_JWS_SECRET') || '';
  return /^https?:\/\//.test(url) && secret ? { url, secret } : null;
}

async function sendEmail({ apiKey, from, to }, { form, get, email, page, sid, country }) {
  const name = oneLine([get('voornaam'), get('achternaam')].filter(Boolean).join(' '));
  const lines = form.fields
    .filter(([k]) => get(k))
    .map(([k, label]) => k === 'bericht' ? `\n${label}:\n${get(k)}\n` : `${label}: ${oneLine(get(k))}`);
  const text = [
    `${form.title} via drpbuildlab.com`,
    '',
    ...lines,
    '',
    '—',
    `Pagina: ${page || 'onbekend'}`,
    `Land (IP): ${country || 'onbekend'}`,
    `Ontvangen: ${new Date().toISOString()}`,
    '',
    'Antwoorden op deze e-mail gaat rechtstreeks naar de aanvrager.',
  ].join('\n');

  try {
    const res = await fetch(RESEND_URL, {
      method: 'POST',
      headers: {
        authorization: 'Bearer ' + apiKey,
        'content-type': 'application/json',
        ...(sid ? { 'idempotency-key': 'form-' + sid } : {}),
      },
      body: JSON.stringify({
        from, to, reply_to: email,
        subject: `${form.title}: ${name}${page ? ` (${page})` : ''}`,
        text,
      }),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      console.error('form: Resend answered', res.status, detail.slice(0, 300));
      return { ok: false, error: 'the email provider answered ' + res.status };
    }
    return { ok: true };
  } catch (err) {
    console.error('form: Resend unreachable', err.message);
    return { ok: false, error: 'the email provider could not be reached' };
  }
}

/* The body Netlify's outgoing webhook posts, as the client zone reads it:
   the form's fields, the hidden subject, the browser's id, and the page in
   data.referrer (the client zone takes the market from it). */
async function handOver({ url, secret }, { formName, form, get, sid, referer }) {
  const data = { 'submission-id': sid, referrer: referer };
  for (const [k] of form.fields) if (get(k)) data[k] = get(k);
  if (get('subject')) data.subject = get('subject');
  const body = JSON.stringify({ id: sid, form_name: formName, created_at: new Date().toISOString(), data });

  try {
    const res = await fetch(url + '/leads', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-webhook-signature': await sign(body, secret) },
      body,
      signal: AbortSignal.timeout(HANDOVER_TIMEOUT),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      console.error('form: the client zone answered', res.status, detail.slice(0, 300));
      return { ok: false, error: 'the client zone answered ' + res.status };
    }
    return { ok: true };
  } catch (err) {
    console.error('form: the client zone could not be reached', err.message);
    return { ok: false, error: 'the client zone could not be reached' };
  }
}

/* A JWS the way Netlify signs its webhook: HS256 over header.payload, the
   payload naming the issuer and the hex SHA-256 of the exact body sent. */
const enc = new TextEncoder();
const b64url = bytes => btoa(String.fromCharCode(...new Uint8Array(bytes)))
  .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
async function sign(body, secret) {
  const hash = await crypto.subtle.digest('SHA-256', enc.encode(body));
  const hex = [...new Uint8Array(hash)].map(b => b.toString(16).padStart(2, '0')).join('');
  const head = b64url(enc.encode(JSON.stringify({ alg: 'HS256', typ: 'JWT' })));
  const claims = b64url(enc.encode(JSON.stringify({ iss: 'drpbuildlab-website', sha256: hex })));
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const mac = await crypto.subtle.sign('HMAC', key, enc.encode(head + '.' + claims));
  return head + '.' + claims + '.' + b64url(mac);
}

export const config = { path: '/api/form' };
