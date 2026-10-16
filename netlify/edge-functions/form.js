/* DRP BuildLab — form notifications by email
 * POST /api/form  (application/x-www-form-urlencoded, the same body the
 * browser posts to Netlify Forms)
 *   200 { sent: true }    emailed to ADMIN_EMAIL through Resend
 *   200 { sent: false }   a bot (honeypot filled); nothing is sent
 *   4xx / 5xx             not emailed; the reason is in { error }
 *
 * Why this exists: Netlify's spam filter quietly moves real enquiries to the
 * Spam tab. Those send no notification and never reach the client zone's
 * webhook, while the visitor still sees "thank you". On staging, 4 of the
 * first 9 contact-form submissions went that way. The browser now posts every
 * form here as well as to Netlify, so each enquiry is emailed whatever
 * Netlify decides. Netlify Forms stays the record and keeps feeding the
 * client zone.
 *
 * Needs RESEND_API_KEY, MAIL_FROM ('DRP BuildLab <…@drpbuildlab.com>', a
 * domain verified in Resend) and ADMIN_EMAIL (one address or a
 * comma-separated list) in the site's environment variables. The same values
 * as the client zone. Without them this answers 503 and the form still
 * succeeds through Netlify.
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
      ['telefoon', 'Telefoon'], ['email', 'E-mail'], ['dienst', 'Dienst'],
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

  const apiKey = Deno.env.get('RESEND_API_KEY');
  const from = Deno.env.get('MAIL_FROM');
  const to = String(Deno.env.get('ADMIN_EMAIL') || '').split(',').map(a => a.trim()).filter(Boolean);
  if (!apiKey || !from || !to.length) {
    console.error('form: RESEND_API_KEY, MAIL_FROM or ADMIN_EMAIL is not set; not emailed');
    return json(503, { error: 'email is not configured' });
  }

  /* The page it came from: the market and language are in the path. */
  let page = '';
  try { page = new URL(request.headers.get('referer') || '').pathname; } catch { /* none */ }

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
    `Land (IP): ${context?.geo?.country?.code || 'onbekend'}`,
    `Ontvangen: ${new Date().toISOString()}`,
    '',
    'Antwoorden op deze e-mail gaat rechtstreeks naar de aanvrager.',
  ].join('\n');

  /* The browser keeps one id per filled-in form, so pressing send again
     after an error does not email the same enquiry twice (Resend drops a
     repeated key for 24 hours). */
  const sid = get('submission-id');

  try {
    const res = await fetch(RESEND_URL, {
      method: 'POST',
      headers: {
        authorization: 'Bearer ' + apiKey,
        'content-type': 'application/json',
        ...(/^[A-Za-z0-9-]{8,64}$/.test(sid) ? { 'idempotency-key': 'form-' + sid } : {}),
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
      return json(502, { error: 'the email provider answered ' + res.status });
    }
    return json(200, { sent: true });
  } catch (err) {
    console.error('form: Resend unreachable', err.message);
    return json(502, { error: 'the email provider could not be reached' });
  }
};

export const config = { path: '/api/form' };
