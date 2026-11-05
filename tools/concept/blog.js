/* Blog articles for the concept site.

   Articles are Markdown files in content/blog/, written by hand or committed by
   the team CMS (cms.drpbuildlab.com). The format is described in
   content/blog/README.md; the CMS side lives in the drp_cms repo
   (src/lib/blog/contract.ts). Change both together.

     content/blog/<slug>.md               one article
     content/blog/media/<slug>/<file>     its images

   build.js turns them into /blog/ and /blog/<slug>/ base pages; images are
   copied once to concept/media/blog/<slug>/ (served without a market prefix,
   like the showreel in concept/media/). localize.js reads the per-article
   languages from .concept-base/__blog.json. */
'use strict';
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { Marked } = require('marked');
const YAML = require('yaml');

const ROOT = path.join(__dirname, '..', '..');
const DIR = path.join(ROOT, 'content', 'blog');
const SITE = path.join(ROOT, 'concept');
const MEDIA_URL = '/media/blog';

const LANGS = ['en', 'nl', 'fr', 'de', 'it', 'es', 'pl', 'pt', 'id', 'ja', 'ar', 'af'];
const CATEGORIES = { technical: 'Technical', partner: 'Clients and partners', collab: 'Collaborations' };
const ASPECTS = ['16:9', '9:16', '1:1'];
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const IMG_RE = /\.(png|jpe?g|webp|avif|gif)$/i;

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/* ./media/<slug>/<file> (how the CMS writes it) -> /media/blog/<slug>/<file> */
function mediaSrc(src, slug, file) {
  const m = /^\.?\/?media\/([a-z0-9-]+)\/([A-Za-z0-9._-]+)$/.exec(src || '');
  if (!m) throw new Error(`${file}: image "${src}" must be ./media/${slug}/<file>`);
  if (m[1] !== slug) throw new Error(`${file}: image "${src}" belongs to another article; use ./media/${slug}/`);
  if (!IMG_RE.test(m[2])) throw new Error(`${file}: "${m[2]}" is not a png, jpg, webp, avif or gif`);
  if (!fs.existsSync(path.join(DIR, 'media', slug, m[2]))) throw new Error(`${file}: image ${src} is missing from content/blog/media/${slug}/`);
  return `${MEDIA_URL}/${slug}/${m[2]}`;
}

/* The click-to-load player. Nothing from the video host loads until the
   visitor presses play (cookie-free hosts where there is a choice). */
function videoEmbed(url) {
  let u;
  try { u = new URL(url); } catch { return null; }
  if (u.protocol !== 'https:') return null;
  const host = u.hostname.replace(/^(www|m)\./, '');
  const yt = host === 'youtu.be' ? u.pathname.slice(1)
    : (host === 'youtube.com' || host === 'youtube-nocookie.com') ? (u.searchParams.get('v') || (u.pathname.match(/^\/(?:shorts|embed|live)\/([\w-]+)/) || [])[1]) : null;
  if (yt && /^[\w-]{6,}$/.test(yt)) return { kind: 'iframe', host: 'YouTube', src: `https://www.youtube-nocookie.com/embed/${yt}?autoplay=1&rel=0` };
  const vimeo = host === 'vimeo.com' ? (u.pathname.match(/^\/(\d+)/) || [])[1] : null;
  if (vimeo) return { kind: 'iframe', host: 'Vimeo', src: `https://player.vimeo.com/video/${vimeo}?autoplay=1&dnt=1` };
  if (/\.(mp4|webm)$/i.test(u.pathname)) return { kind: 'video', host: u.hostname, src: u.toString() };
  return { kind: 'link', host: u.hostname, src: u.toString() };
}

function videoBlock(v, slug, file) {
  const e = videoEmbed(v.url);
  if (!e) throw new Error(`${file}: video.url must be an https URL`);
  const aspect = ASPECTS.includes(v.aspect) ? v.aspect : '16:9';
  const poster = v.poster ? mediaSrc(v.poster, slug, file) : '';
  const credit = [v.creator ? `<span translate="no">${esc(v.creator)}</span>` : '', v.sourceUrl ? `<a class="tlink" href="${esc(v.sourceUrl)}" target="_blank" rel="noopener">Original post ↗</a>` : ''].filter(Boolean).join(' · ');
  if (e.kind === 'link') {
    return `<figure class="vembed link"><a class="btn ghost" href="${esc(e.src)}" target="_blank" rel="noopener">Watch the video ↗</a>${credit ? `<figcaption>${credit}</figcaption>` : ''}</figure>`;
  }
  return `<figure class="vembed" data-aspect="${aspect}">
  <button class="vembed-play" type="button" data-kind="${e.kind}" data-src="${esc(e.src)}" aria-label="Play the video">
    ${poster ? `<img src="${poster}" alt="" loading="lazy" decoding="async">` : ''}<span class="vembed-icon" aria-hidden="true"></span>
  </button>
  <figcaption>${credit ? credit + '<br>' : ''}<small>The video loads from <span translate="no">${esc(e.host)}</span> when you press play.</small></figcaption>
</figure>`;
}

/* Markdown, without raw HTML: what the CMS preview shows is what the site renders. */
function renderer(slug, file) {
  const md = new Marked({ gfm: true });
  md.use({
    renderer: {
      html({ text }) { return esc(text); },
      heading({ tokens, depth }) { const d = Math.min(Math.max(depth, 2), 4); return `<h${d}>${this.parser.parseInline(tokens)}</h${d}>\n`; },
      code({ text, lang }) { return `<pre translate="no"><code${lang ? ` class="language-${esc(lang)}"` : ''}>${esc(text)}</code></pre>\n`; },
      codespan({ text }) { return `<code translate="no">${text}</code>`; },
      image({ href, text }) { return `<img src="${mediaSrc(href, slug, file)}" alt="${esc(text)}" loading="lazy" decoding="async">`; },
      link({ href, title, tokens }) {
        const inner = this.parser.parseInline(tokens);
        if (!/^(https?:|mailto:|\/|#)/.test(href)) throw new Error(`${file}: link "${href}" must be absolute (https://…) or site-relative (/contact/)`);
        const ext = /^https?:/.test(href) && !/^https:\/\/drpbuildlab\.com/.test(href);
        return `<a href="${esc(href)}"${title ? ` title="${esc(title)}"` : ''}${ext ? ' target="_blank" rel="noopener"' : ''}>${inner}</a>`;
      }
    }
  });
  return md;
}

/* What `git hash-object` prints for the file. The CMS stores the same hash for
   what it published, and finds it in <meta name="drp-rev"> once that version
   is live on the site. */
const gitBlobSha = bytes => crypto.createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');

function parse(file) {
  const raw = fs.readFileSync(path.join(DIR, file), 'utf8').replace(/\r\n/g, '\n');
  const m = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/.exec(raw);
  if (!m) throw new Error(`content/blog/${file}: no frontmatter block`);
  const fm = YAML.parse(m[1]) || {};
  const where = `content/blog/${file}`;
  const need = (k, ok, msg) => { if (!ok) throw new Error(`${where}: ${k} ${msg}`); };
  need('slug', SLUG_RE.test(fm.slug || ''), 'must be lowercase letters, digits and hyphens');
  need('slug', file === fm.slug + '.md', `must match the file name (${file})`);
  need('title', typeof fm.title === 'string' && fm.title.trim(), 'is required');
  need('date', /^\d{4}-\d{2}-\d{2}$/.test(String(fm.date || '')), 'must be YYYY-MM-DD');
  need('category', CATEGORIES[fm.category], `must be one of ${Object.keys(CATEGORIES).join(', ')}`);
  need('excerpt', typeof fm.excerpt === 'string' && fm.excerpt.trim(), 'is required');
  /* English is the source language every other version is translated from, so it is always published */
  const langs = ['en', ...(Array.isArray(fm.langs) ? fm.langs : []).filter(l => l !== 'en')];
  const bad = langs.filter(l => !LANGS.includes(l));
  need('langs', !bad.length, `has unknown language(s): ${bad.join(', ')}`);
  if (fm.cover) need('cover.alt', fm.cover.alt, 'is required when there is a cover image');
  /* hashed with LF line ends, as git stores it, so a Windows checkout gives the same hash */
  return { fm, body: m[2], langs, where, rev: gitBlobSha(Buffer.from(raw, 'utf8')) };
}

/* Every published article (draft: true is skipped), newest first. */
function loadPosts() {
  if (!fs.existsSync(DIR)) return [];
  const posts = [];
  for (const file of fs.readdirSync(DIR).filter(f => f.endsWith('.md') && f !== 'README.md')) {
    const { fm, body, langs, where, rev } = parse(file);
    if (fm.draft === true) continue;
    posts.push({
      slug: fm.slug,
      rev,
      title: fm.title.trim(),
      excerpt: fm.excerpt.trim(),
      date: String(fm.date),
      updated: fm.updated ? String(fm.updated) : null,
      author: (fm.author || 'DRP BuildLab').trim(),
      category: fm.category,
      categoryLabel: CATEGORIES[fm.category],
      tags: Array.isArray(fm.tags) ? fm.tags.map(String) : [],
      langs,
      cover: fm.cover ? { src: mediaSrc(fm.cover.src, fm.slug, where), alt: String(fm.cover.alt) } : null,
      video: fm.video ? videoBlock(fm.video, fm.slug, where) : '',
      /* reading time at 200 words a minute, shown in the article masthead */
      minutes: Math.max(1, Math.round(body.replace(/!\[[^\]]*\]\([^)]*\)/g, '').split(/\s+/).filter(Boolean).length / 200)),
      /* tables scroll sideways inside their own box on narrow screens */
      html: renderer(fm.slug, where).parse(body).replace(/<table>/g, '<div class="tbl"><table>').replace(/<\/table>/g, '</table></div>')
    });
  }
  return posts.sort((a, b) => (b.date + b.slug).localeCompare(a.date + a.slug));
}

/* Images of published articles only, so a draft's files never go live. */
function copyMedia(posts) {
  const out = path.join(SITE, 'media', 'blog');
  fs.rmSync(out, { recursive: true, force: true });
  for (const p of posts) {
    const src = path.join(DIR, 'media', p.slug);
    if (!fs.existsSync(src)) continue;
    fs.mkdirSync(path.join(out, p.slug), { recursive: true });
    for (const f of fs.readdirSync(src).filter(f => IMG_RE.test(f))) fs.copyFileSync(path.join(src, f), path.join(out, p.slug, f));
  }
}

module.exports = { loadPosts, copyMedia, videoEmbed, CATEGORIES };
