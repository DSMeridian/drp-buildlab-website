#!/usr/bin/env node
/*
 * The build, as one command.
 *
 *   npm run build                  everything: 21 markets, 84 pages
 *   npm run build -- --market=be   one market, for the edit-and-reload loop
 *   npm run build -- --lang=nl,en  every market in those languages
 *   npm run build -- --skip-check  skip the price and label assertions
 *
 * This exists because npm appends the arguments after `--` to the *last*
 * command in a script, not to each one. With build wired as three chained
 * commands, `npm run build -- --market=be` handed the flag to prerender
 * alone, which then rendered one market out of a directory the generator
 * had just rewritten with twenty-one. One entry point, one place to route
 * the flag.
 *
 * Why a single market is worth having: prerendering is the slow half, and it
 * is slow per page -- a headless Chromium load, a settle, a serialise, times
 * eighty-four. For CSS or JS work you need one market to look at, not every
 * translation of it. The assets are still built in full because they are
 * shared and cost milliseconds; it is the pages that are skipped.
 *
 * What a single-market build is not: publishable. The other twenty markets
 * still hold the previous build's hashed asset names, the sitemap is left
 * alone rather than rewritten with one market in it, and stale hashed files
 * are kept rather than pruned, because those are the files the untouched
 * markets are still pointing at. build-locales says so on the way out.
 */
'use strict';

const path = require('path');
const { spawnSync } = require('child_process');

const argv = process.argv.slice(2);
const flag = name => argv.includes('--' + name);
const value = name => {
  const hit = argv.find(a => a.startsWith('--' + name + '='));
  return hit ? hit.slice(name.length + 3) : '';
};

/* Both selectors, passed through untouched to the two scripts that
 * understand them:
 *
 *   npm run build -- --market=be        one market
 *   npm run build -- --market=be,nl     several
 *   npm run build -- --lang=nl,en       every market in those languages
 *
 * --lang is the one to reach for while a design change is being reviewed:
 * src/ feeds all thirty-four markets, and what is being checked is whether
 * the change reads right in a language somebody actually speaks. */
const market = value('market');
const lang = value('lang');
const pass = [];
if (market) pass.push('--market=' + market);
if (lang) pass.push('--lang=' + lang);

function run(script, extra) {
  const started = Date.now();
  const res = spawnSync(process.execPath, [path.join(__dirname, script), ...extra], {
    stdio: 'inherit',
  });
  if (res.error) { console.error(res.error); process.exit(1); }
  if (res.status !== 0) {
    console.error('\n' + script + ' failed (exit ' + res.status + ')');
    process.exit(res.status || 1);
  }
  return Date.now() - started;
}

const t0 = Date.now();

/* The assertions read assets/i18n.js directly and do not care about markets,
   so they run unchanged either way. They are also the cheapest thing here --
   worth keeping in the fast loop rather than making it a habit to skip. */
if (!flag('skip-check')) {
  run('check-prices.js', ['--live-only']);
  run('check-labels.js', ['--live-only']);
}

run('build-locales.js', pass);
run('prerender.js', pass);

const secs = ((Date.now() - t0) / 1000).toFixed(1);
console.log('\nbuild finished in ' + secs + 's'
  + (pass.length ? '  (' + pass.join(' ') + ', local preview only)' : ''));
