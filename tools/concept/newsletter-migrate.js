#!/usr/bin/env node
/* One-off: moves blog newsletter subscribers from one Resend segment per
   language ("Blog newsletter (nl)") to the "Blog newsletter" segment with a
   topic per language (see netlify/shared/newsletter.mjs).

     node tools/concept/newsletter-migrate.js            dry run: shows what it would do
     node tools/concept/newsletter-migrate.js --apply    does it

   With --apply, in this order:
     1. writes every contact of the old segments to a snapshot file (JSON)
     2. deletes the old language segments (the free plan allows 3 segments,
        so the new one cannot be created next to them). Contacts are not
        deleted with a segment; any that are missing afterwards are created
        again from the snapshot, with their subscribed/unsubscribed state.
     3. creates the "Blog newsletter" segment, the blog_lang property and the
        language topics, and puts each contact in: segment, blog_lang, opted
        in to their language's topic only. An unsubscribed contact stays
        unsubscribed.
   Safe to run again: a second run finds no old segments and changes nothing,
   and it still sweeps contacts left in a language segment (e.g. created by
   the old code in the minutes before the new code was live).

   Needs RESEND_API_KEY (read from the environment, or from .env). */
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { pathToFileURL } = require('url');

const ROOT = path.join(__dirname, '..', '..');
const APPLY = process.argv.includes('--apply');

function apiKey() {
  if (process.env.RESEND_API_KEY) return process.env.RESEND_API_KEY.trim();
  try {
    const line = fs.readFileSync(path.join(ROOT, '.env'), 'utf8').split(/\r?\n/).find(l => /^RESEND_API_KEY\s*=/.test(l));
    if (line) return line.split('=').slice(1).join('=').trim().replace(/^["']|["']$/g, '');
  } catch { /* no .env */ }
  throw new Error('RESEND_API_KEY is not set');
}

async function main() {
  const nl = await import(pathToFileURL(path.join(ROOT, 'netlify', 'shared', 'newsletter.mjs')).href);
  const key = apiKey();
  const must = async (what, r) => {
    const res = await r;
    if (!res.ok) throw new Error(`${what}: Resend ${res.status} ${JSON.stringify(res.data).slice(0, 200)}`);
    return res;
  };

  const all = await nl.listAll(key, '/segments');
  const old = all.filter(s => nl.langOfOldSegment(s.name)).map(s => ({ ...s, lang: nl.langOfOldSegment(s.name) }));
  const people = new Map(); // email -> { email, unsubscribed, lang }
  for (const s of old) {
    for (const c of await nl.listAll(key, `/segments/${s.id}/contacts`)) {
      const email = c.email.toLowerCase();
      if (people.has(email)) console.log(`  ${email} is in more than one language segment; keeping ${people.get(email).lang}`);
      else people.set(email, { email, unsubscribed: c.unsubscribed === true, lang: s.lang });
    }
  }
  console.log(`segments now: ${all.map(s => `"${s.name}"`).join(', ') || 'none'}`);
  console.log(`old language segments: ${old.map(s => s.name).join(', ') || 'none'}`);
  console.log(`contacts to move: ${people.size}`);
  for (const p of people.values()) console.log(`  ${p.lang}  ${p.unsubscribed ? 'unsubscribed' : 'subscribed  '}  ${p.email}`);
  if (!old.length) { console.log('nothing to migrate.'); return; }
  if (!APPLY) { console.log('\ndry run: nothing changed. Run again with --apply to migrate.'); return; }

  /* 1. snapshot */
  const snap = path.join(os.tmpdir(), `drp-newsletter-snapshot-${Date.now()}.json`);
  fs.writeFileSync(snap, JSON.stringify({ at: new Date().toISOString(), segments: old, contacts: [...people.values()] }, null, 2));
  console.log(`\n1. snapshot: ${snap}`);

  /* 2. old segments out; contacts back if a delete took them along */
  for (const s of old) {
    await must(`delete segment ${s.name}`, nl.resend(key, 'DELETE', `/segments/${s.id}`));
    console.log(`2. deleted segment "${s.name}"`);
  }
  for (const p of people.values()) {
    const got = await nl.resend(key, 'GET', '/contacts/' + encodeURIComponent(p.email));
    if (got.status === 404) {
      await must(`re-create ${p.email}`, nl.resend(key, 'POST', '/contacts', { email: p.email, unsubscribed: p.unsubscribed }));
      console.log(`   ${p.email} was gone with the segment; created again`);
    } else if (!got.ok) throw new Error(`get ${p.email}: Resend ${got.status}`);
  }

  /* 3. the new structure */
  const segment = await nl.blogSegment(key, { create: true });
  await nl.ensureLangProperty(key);
  let topics = await nl.blogTopics(key);
  for (const lang of new Set([...people.values()].map(p => p.lang))) {
    if (!topics.some(t => t.lang === lang)) { await nl.createLangTopic(key, lang); topics = await nl.blogTopics(key); }
  }
  console.log(`3. segment "${nl.BLOG_SEGMENT}" ${segment}; topics: ${topics.map(t => t.name).join(', ')}`);
  for (const p of people.values()) {
    const cp = '/contacts/' + encodeURIComponent(p.email);
    await must(`blog_lang for ${p.email}`, nl.resend(key, 'PATCH', cp, { properties: { [nl.LANG_PROP]: p.lang } }));
    const add = await nl.resend(key, 'POST', `${cp}/segments/${segment}`);
    if (!add.ok && add.status !== 409) throw new Error(`add ${p.email} to segment: Resend ${add.status} ${JSON.stringify(add.data).slice(0, 200)}`);
    await nl.setContactTopics(key, p.email, topics.map(t => ({ id: t.id, subscription: t.lang === p.lang ? 'opt_in' : 'opt_out' })));
    console.log(`   ${p.email}: ${p.lang}${p.unsubscribed ? ' (stays unsubscribed)' : ''}`);
  }
  console.log('\ndone.');
}

main().catch(e => { console.error(e.message || e); process.exit(1); });
