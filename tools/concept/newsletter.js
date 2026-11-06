#!/usr/bin/env node
/* Emails newly published blog articles to newsletter subscribers.
   Run by .github/workflows/blog.yml after the site is rebuilt.

     node tools/concept/newsletter.js --before=<sha> --after=<sha> [--mode=production|preview] [--dry-run]
     node tools/concept/newsletter.js --slug=<slug>[,<slug>] ...     (by hand, e.g. a workflow_dispatch)

   "Newly published" means: published now (not a draft), and absent or a draft
   at <before>. An edit to a published article never sends again.

   production  one Resend Broadcast per article and language, to that
               language's segment ("Blog newsletter (nl)"), once the article
               answers on drpbuildlab.com. A broadcast is named
               blog:<slug>:<lang>, and an existing name is skipped, so running
               this twice never emails anyone twice.
   preview     (staging) nothing goes to subscribers; ADMIN_EMAIL gets the
               English email, marked as a preview.

   Each email is built from the localized pages in concept/: the title and
   intro of /<market>/blog/<slug>/, and the texts of /<market>/blog/subscribe/.

   Needs RESEND_API_KEY and MAIL_FROM (and ADMIN_EMAIL for a preview). */
'use strict';
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFileSync } = require('child_process');
const { pathToFileURL } = require('url');
const YAML = require('yaml');

const ROOT = path.join(__dirname, '..', '..');
const SITE = path.join(ROOT, 'concept');
const ORIGIN = 'https://drpbuildlab.com';
const argv = process.argv.slice(2);
const arg = k => (argv.find(a => a.startsWith(`--${k}=`)) || '').split('=').slice(1).join('=');
const DRY = argv.includes('--dry-run');
const MODE = arg('mode') || 'preview';
const WAIT_MS = 15 * 60 * 1000;

const git = (...a) => execFileSync('git', a, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });

/* the slugs this push published */
function newlyPublished(published) {
  const manual = arg('slug');
  if (manual) return manual.split(',').map(s => s.trim()).filter(Boolean);
  const before = arg('before'), after = arg('after') || 'HEAD';
  if (!/^[0-9a-f]{7,40}$/.test(before) || /^0+$/.test(before)) { console.log('newsletter: no previous commit to compare with; nothing to send.'); return []; }
  try { git('cat-file', '-e', before + '^{commit}'); }
  catch { try { git('fetch', '--depth=1', 'origin', before); } catch (e) { throw new Error(`cannot read commit ${before}: ${e.message}`); } }
  const files = git('diff', '--name-only', before, after, '--', 'content/blog/')
    .split('\n').map(f => f.trim()).filter(f => /^content\/blog\/[a-z0-9-]+\.md$/.test(f));
  const out = [];
  for (const f of files) {
    const slug = path.basename(f, '.md');
    if (!published.has(slug)) continue;
    let was = null;
    try { was = git('show', `${before}:${f}`); } catch { /* the file did not exist yet */ }
    const fm = was && /^---\r?\n([\s\S]*?)\r?\n---/.exec(was);
    const wasDraft = fm ? (YAML.parse(fm[1]) || {}).draft === true : false;
    if (!was || wasDraft) out.push(slug);
  }
  return out;
}

const read = p => fs.readFileSync(path.join(SITE, p), 'utf8');
const text = s => String(s || '').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();

async function main() {
  const nl = await import(pathToFileURL(path.join(ROOT, 'netlify', 'shared', 'newsletter.mjs')).href);
  const posts = require('./blog').loadPosts();
  const bySlug = new Map(posts.map(p => [p.slug, p]));
  const slugs = newlyPublished(new Set(bySlug.keys()));
  if (!slugs.length) { console.log('newsletter: no newly published articles.'); return; }

  /* build every email first: a missing page or string stops before anything is sent */
  const mails = [];
  for (const slug of slugs) {
    const post = bySlug.get(slug);
    if (!post) throw new Error(`newsletter: "${slug}" is not a published article`);
    for (const lang of post.langs) {
      const prefix = nl.prefixOf(nl.LANG_HOME[lang]);
      const page = read(`${prefix}/blog/${slug}/index.html`);
      const title = text((page.match(/<h1 class="ah1"[^>]*>([\s\S]*?)<\/h1>/) || [])[1]);
      const excerpt = text((page.match(/<p class="asub"[^>]*>([\s\S]*?)<\/p>/) || [])[1]);
      if (!title) throw new Error(`newsletter: no title in concept/${prefix}/blog/${slug}/`);
      const s = nl.mailStrings(read(`${prefix}/blog/subscribe/index.html`));
      const url = `${ORIGIN}/${prefix}/blog/${slug}/`;
      const input = { s, lang, title, excerpt, url, image: post.cover ? ORIGIN + post.cover.src : null };
      mails.push({ slug, lang, url, input, name: `blog:${slug}:${lang}`, ...nl.articleEmail(input) });
    }
  }
  console.log(`newsletter: ${mails.length} email(s): ${mails.map(m => m.name).join(', ')}`);
  if (DRY) {
    const out = arg('out') || path.join(os.tmpdir(), 'drp-newsletter-preview');
    fs.mkdirSync(out, { recursive: true });
    for (const m of mails) fs.writeFileSync(path.join(out, `${m.slug}.${m.lang}.html`), m.html);
    console.log(`newsletter: dry run, nothing sent; the emails are in ${out}`);
    return;
  }

  const apiKey = process.env.RESEND_API_KEY, from = process.env.MAIL_FROM;
  if (!apiKey || !from) throw new Error('newsletter: RESEND_API_KEY or MAIL_FROM is not set');

  if (MODE !== 'production') {
    const to = String(process.env.ADMIN_EMAIL || '').split(',').map(a => a.trim()).filter(Boolean);
    if (!to.length) throw new Error('newsletter: ADMIN_EMAIL is not set; no preview sent');
    for (const slug of slugs) {
      const m = mails.find(x => x.slug === slug && x.lang === 'en');
      const langs = mails.filter(x => x.slug === slug).map(x => x.lang).join(', ');
      const banner = `Preview from staging. Nothing was sent to subscribers. On drpbuildlab.com this article goes to the subscribers in: ${langs}. The links work once the article is live there.`;
      const p = nl.articleEmail({ ...m.input, banner });
      const r = await nl.resend(apiKey, 'POST', '/emails', {
        from, to, subject: `[Preview] ${p.subject}`,
        html: p.html.split(nl.UNSUBSCRIBE).join('#'),
        text: p.text.split(nl.UNSUBSCRIBE).join('(unsubscribe link)'),
      }, { 'idempotency-key': `nl-preview-${m.name}-${arg('after') || 'manual'}`.slice(0, 256) });
      if (!r.ok && r.status !== 409) throw new Error(`newsletter: preview failed, Resend ${r.status}: ${JSON.stringify(r.data).slice(0, 300)}`);
      console.log(`newsletter: preview of ${slug} sent to ${to.join(', ')}`);
    }
    return;
  }

  /* production */
  const segments = await nl.listSegments(apiKey);
  const segOf = lang => segments.filter(s => nl.langOfSegment(s.name) === lang).sort((a, b) => String(a.created_at).localeCompare(String(b.created_at)))[0];
  const sent = new Set();
  for (let after = '', i = 0; i < 50; i++) {
    const r = await nl.resend(apiKey, 'GET', `/broadcasts?limit=100${after ? '&after=' + encodeURIComponent(after) : ''}`);
    if (!r.ok) throw new Error(`newsletter: list broadcasts ${r.status}: ${JSON.stringify(r.data).slice(0, 200)}`);
    const data = r.data.data || [];
    data.forEach(b => b.name && sent.add(b.name));
    if (!r.data.has_more || !data.length) break;
    after = data[data.length - 1].id;
  }

  const live = new Map();
  const isLive = async url => {
    if (live.has(url)) return live.get(url);
    const until = Date.now() + WAIT_MS;
    let ok = false;
    for (;;) {
      const res = await fetch(url, { redirect: 'manual' }).catch(() => null);
      if (res && res.status === 200) { ok = true; break; }
      if (Date.now() > until) break;
      console.log(`newsletter: waiting for ${url} to go live (${res ? res.status : 'no answer'})`);
      await new Promise(r => setTimeout(r, 20000));
    }
    live.set(url, ok);
    return ok;
  };

  const failed = [];
  for (const m of mails) {
    if (sent.has(m.name)) { console.log(`newsletter: ${m.name} was already sent; skipped`); continue; }
    const seg = segOf(m.lang);
    if (!seg) { console.log(`newsletter: no subscribers in ${m.lang} yet; ${m.name} skipped`); continue; }
    if (!(await isLive(m.url))) { failed.push(`${m.name}: ${m.url} is not live after 15 minutes`); continue; }
    const r = await nl.resend(apiKey, 'POST', '/broadcasts', { segment_id: seg.id, from, subject: m.subject, html: m.html, text: m.text, name: m.name, send: true });
    if (r.ok) console.log(`newsletter: ${m.name} sent to segment "${seg.name}" (broadcast ${r.data.id})`);
    else failed.push(`${m.name}: Resend ${r.status} ${JSON.stringify(r.data).slice(0, 200)}`);
  }
  if (failed.length) throw new Error('newsletter: not sent:\n  ' + failed.join('\n  ') + '\nRun the Blog workflow again (or this script with --slug) once fixed; what was sent is skipped.');
}

main().catch(e => { console.error(e.message || e); process.exit(1); });
