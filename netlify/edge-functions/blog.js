/* DRP BuildLab — likes and comments under blog articles
 *
 * GET  /api/blog?slug=<slug>[&v=<visitor>]
 *   200 { likes, liked, comments: [{ name, body, date }] }   approved comments, oldest first
 *   200 { disabled: true }                                    not configured: the page hides likes and comments
 * POST /api/blog  application/json
 *   { action: "like" | "unlike", slug, visitor }    200 { likes, liked }
 *   { action: "comment", slug, name, body, lang }   200 { received: true }   held for approval
 *   4xx / 5xx { error }
 *
 * No accounts and no cookies. A like is one row per (article, visitor); the
 * visitor id is a random UUID the browser keeps in localStorage, created only
 * when someone presses Like. A comment is stored as "pending" and appears only
 * after someone approves it in the CMS (cms.drpbuildlab.com/comments). No IP
 * address or email is stored.
 *
 * Data lives in the CMS's Neon database. BLOG_DATABASE_URL must be the
 * connection string of the restricted `blog_site` role, never the owner: that
 * role can only read and add likes, add pending comments and read approved
 * ones (drp_cms: drizzle/0003_blog_public_role.sql). It is queried over
 * Neon's HTTPS endpoint, so there is no driver to bundle.
 *
 * Optional: RESEND_API_KEY, MAIL_FROM and ADMIN_EMAIL (the same as form.js)
 * email the team when a comment is waiting.
 */

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const LANGS = ['en', 'nl', 'fr', 'de', 'it', 'es', 'pl', 'pt', 'id', 'ja', 'ar', 'af'];
const CMS_URL = 'https://cms.drpbuildlab.com/comments';

/* Per IP, in memory: resets when the isolate restarts, which is fine for
   keeping a script from hammering one isolate. */
const LIMITS = { like: [40, 10 * 60 * 1000], comment: [4, 10 * 60 * 1000] };
const windows = new Map();
function limited(kind, ip) {
  const [max, ms] = LIMITS[kind], key = kind + ':' + ip, now = Date.now();
  const w = windows.get(key);
  if (!w || now > w.resetAt) { windows.set(key, { count: 1, resetAt: now + ms }); return false; }
  if (w.count >= max) return true;
  w.count++;
  return false;
}

const json = (status, body) => new Response(JSON.stringify(body), {
  status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
});

/* One statement over Neon's SQL-over-HTTP endpoint; rows come back as arrays. */
async function sql(query, params = []) {
  const url = Deno.env.get('BLOG_DATABASE_URL');
  const res = await fetch(`https://${new URL(url).host}/sql`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Neon-Connection-String': url, 'Neon-Array-Mode': 'true', 'Neon-Raw-Text-Output': 'true' },
    body: JSON.stringify({ query, params }),
  });
  if (!res.ok) throw new Error(`database ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return (await res.json()).rows;
}

/* Only articles that exist on this site take likes and comments. The English
   page always exists (localize.js LANG_HOME.en); cached per isolate. */
const known = new Map();
async function articleExists(request, slug) {
  const hit = known.get(slug);
  if (hit && hit.until > Date.now()) return hit.ok;
  const res = await fetch(new URL(`/ie/blog/${slug}/`, request.url), { method: 'HEAD', redirect: 'manual' });
  const ok = res.status === 200;
  known.set(slug, { ok, until: Date.now() + (ok ? 10 : 1) * 60 * 1000 });
  return ok;
}

async function likeState(slug, visitor) {
  const [[likes, liked]] = await sql(
    'select count(*)::int, coalesce(bool_or(visitor = $2::uuid), false) from blog_likes where slug = $1',
    [slug, visitor || '00000000-0000-0000-0000-000000000000'],
  );
  return { likes: +likes, liked: liked === 't' || liked === 'true' };
}

/* The team hears about a waiting comment; failures here never fail the post. */
async function notify(slug, name, body, lang) {
  const apiKey = Deno.env.get('RESEND_API_KEY'), from = Deno.env.get('MAIL_FROM');
  const to = String(Deno.env.get('ADMIN_EMAIL') || '').split(',').map(a => a.trim()).filter(Boolean);
  if (!apiKey || !from || !to.length) return;
  const text = [
    `Nieuwe reactie op het blogartikel "${slug}" wacht op goedkeuring.`,
    '',
    `Naam: ${name}`,
    `Taal: ${lang}`,
    '',
    body,
    '',
    '—',
    `Goedkeuren of verwijderen: ${CMS_URL}`,
  ].join('\n');
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to, subject: `Nieuwe blogreactie: ${slug}`, text }),
  }).catch(e => console.error('blog: notify failed', e));
}

export default async (request, context) => {
  if (!Deno.env.get('BLOG_DATABASE_URL')) return json(200, { disabled: true });
  const ip = context?.ip || request.headers.get('x-nf-client-connection-ip') || 'unknown';

  try {
    if (request.method === 'GET') {
      const q = new URL(request.url).searchParams;
      const slug = q.get('slug') || '', visitor = q.get('v') || '';
      if (!SLUG.test(slug)) return json(400, { error: 'bad slug' });
      const [state, rows] = await Promise.all([
        likeState(slug, UUID.test(visitor) ? visitor : null),
        sql("select name, body, created_at from blog_comments where slug = $1 and status = 'approved' order by created_at limit 500", [slug]),
      ]);
      return json(200, { ...state, comments: rows.map(([name, body, date]) => ({ name, body, date: new Date(date).toISOString() })) });
    }

    if (request.method !== 'POST') return json(405, { error: 'GET or POST' });

    /* Only this site's own pages post here. */
    let originHost = null;
    try { originHost = new URL(request.headers.get('origin')).host; } catch { /* absent, or "null" */ }
    if (originHost && originHost !== new URL(request.url).host) return json(403, { error: 'wrong origin' });

    let data;
    try { data = await request.json(); } catch { return json(400, { error: 'unreadable body' }); }
    const slug = String(data.slug || '');
    if (!SLUG.test(slug) || slug.length > 80) return json(400, { error: 'bad slug' });

    if (data.action === 'like' || data.action === 'unlike') {
      const visitor = String(data.visitor || '');
      if (!UUID.test(visitor)) return json(400, { error: 'bad visitor' });
      if (limited('like', ip)) return json(429, { error: 'too many likes, try again later' });
      if (!(await articleExists(request, slug))) return json(404, { error: 'no such article' });
      await sql(
        data.action === 'like'
          ? 'insert into blog_likes (slug, visitor) values ($1, $2::uuid) on conflict do nothing'
          : 'delete from blog_likes where slug = $1 and visitor = $2::uuid',
        [slug, visitor],
      );
      return json(200, await likeState(slug, visitor));
    }

    if (data.action === 'comment') {
      /* the hidden honeypot: a person never fills it; answer as if received */
      if (String(data.website || '').trim()) return json(200, { received: true });
      const name = String(data.name || '').replace(/\s+/g, ' ').trim().slice(0, 60);
      const body = String(data.body || '').replace(/\r\n?/g, '\n').replace(/\n{3,}/g, '\n\n').trim().slice(0, 2000);
      const lang = LANGS.includes(data.lang) ? data.lang : 'en';
      if (!name) return json(400, { error: 'name is required' });
      if (body.length < 2) return json(400, { error: 'comment is required' });
      if (limited('comment', ip)) return json(429, { error: 'too many comments, try again later' });
      if (!(await articleExists(request, slug))) return json(404, { error: 'no such article' });
      await sql('insert into blog_comments (slug, name, body, lang) values ($1, $2, $3, $4)', [slug, name, body, lang]);
      context?.waitUntil ? context.waitUntil(notify(slug, name, body, lang)) : await notify(slug, name, body, lang);
      return json(200, { received: true });
    }

    return json(400, { error: 'unknown action' });
  } catch (e) {
    console.error('blog:', e);
    return json(503, { error: 'temporarily unavailable' });
  }
};

export const config = { path: '/api/blog' };
