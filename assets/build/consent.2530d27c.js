/* DRP BuildLab — cookie consent, and the gate in front of Google Tag Manager.
 *
 * Two halves, and the order between them is the whole point.
 *
 *   The head snippet, written into every page by build-locales.js, runs
 *   first and synchronously. It creates dataLayer, sets Consent Mode v2 to
 *   denied, replays any stored choice, and only then loads GTM. Nothing
 *   Google-owned can set an identifier before that has happened.
 *
 *   This file is deferred and draws the banner. It cannot run early enough to
 *   matter for consent, and it does not need to: the answer is already
 *   "denied" by the time it loads.
 *
 * Consent Mode v2 rather than blocking GTM outright. GTM loads on every page,
 * but with all four ad and analytics signals denied it sets no cookies and no
 * identifiers, and Google models the gap. Blocking the container entirely is
 * the stricter reading -- it also means Google never sees the IP -- and it is
 * one flag away in the head snippet if that is the call. Documented rather
 * than decided quietly, because reasonable people land on either side.
 *
 * What is deliberately NOT gated: drp-seen, drp-lang and drp-langbar. They
 * hold "the loader has run", "this is the language you picked" and "you
 * dismissed that bar" -- state the visitor created by using the site, on
 * their own device, readable by nobody. Asking permission to remember that a
 * banner was dismissed would be theatre.
 *
 * Refusing is exactly as easy as agreeing here: same weight, same size, same
 * row, no dark pattern. A consent choice where "no" is harder than "yes" is
 * not a consent choice, and regulators have said so repeatedly.
 */
(function () {
  'use strict';

  var KEY = 'drp-consent';
  var VERSION = 1;          // bump to re-ask everyone after a material change

  /* ── stored decision ──────────────────────────────────────────────────── */

  function read() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return null;
      var v = JSON.parse(raw);
      if (!v || v.v !== VERSION) return null;   // older shape: ask again
      return v;
    } catch (e) { return null; }
  }

  function write(analytics, marketing) {
    var v = {
      v: VERSION,
      analytics: !!analytics,
      marketing: !!marketing,
      at: new Date().toISOString(),
    };
    try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) { /* private mode */ }
    return v;
  }

  /* Tell Google. The head snippet defined gtag and the denied defaults; this
     is the update that follows a decision. Ad storage, ad user data and ad
     personalisation move together because they are one question to a visitor
     however many signals Google splits it into. */
  function apply(v) {
    if (typeof window.gtag !== 'function') return;
    window.gtag('consent', 'update', {
      analytics_storage:      v.analytics ? 'granted' : 'denied',
      ad_storage:             v.marketing ? 'granted' : 'denied',
      ad_user_data:           v.marketing ? 'granted' : 'denied',
      ad_personalization:     v.marketing ? 'granted' : 'denied',
      personalization_storage: v.marketing ? 'granted' : 'denied',
    });
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'drp_consent',
      drp_consent_analytics: !!v.analytics,
      drp_consent_marketing: !!v.marketing,
    });
  }

  /* ── copy ─────────────────────────────────────────────────────────────── */

  /* The page carries only its own language. English is the fallback for a
     language whose payload has not landed -- a banner in the wrong language
     is still a banner; no banner at all would mean no way to consent. */
  var EN = {
    'cc.title': 'Cookies',
    'cc.body': 'We use cookies to see how the site is used and to measure our advertising. You choose which.',
    'cc.accept': 'Accept all', 'cc.reject': 'Reject all',
    'cc.prefs': 'Choose', 'cc.save': 'Save choices',
    'cc.nec': 'Necessary', 'cc.nec.d': 'Needed for the site to work. Always on.',
    'cc.ana': 'Analytics', 'cc.ana.d': 'How visitors use the site, so we can improve it.',
    'cc.mkt': 'Marketing', 'cc.mkt.d': 'Measuring how well our advertising works.',
    'cc.manage': 'Cookie settings',
  };
  function t(key) {
    var all = (typeof TRANSLATIONS === 'undefined') ? null : TRANSLATIONS;
    var block = all && all[document.documentElement.lang];
    return (block && block[key]) || EN[key] || key;
  }

  /* ── the banner ───────────────────────────────────────────────────────── */

  var el = null;

  function close() {
    if (!el) return;
    el.remove();
    el = null;
  }

  function decide(analytics, marketing) {
    apply(write(analytics, marketing));
    close();
  }

  function row(id, label, desc, checked, locked) {
    var wrap = document.createElement('label');
    wrap.className = 'ccb-row' + (locked ? ' is-locked' : '');
    var box = document.createElement('input');
    box.type = 'checkbox';
    box.id = id;
    box.checked = checked;
    if (locked) { box.disabled = true; }
    var text = document.createElement('span');
    var strong = document.createElement('strong');
    strong.textContent = label;
    var small = document.createElement('small');
    small.textContent = desc;
    text.append(strong, small);
    wrap.append(box, text);
    return wrap;
  }

  function open(existing) {
    if (el) return;
    var prev = existing || read() || { analytics: false, marketing: false };

    el = document.createElement('div');
    el.className = 'ccb';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'false');
    el.setAttribute('aria-label', t('cc.title'));

    var body = document.createElement('p');
    body.className = 'ccb-body';
    body.textContent = t('cc.body');

    var opts = document.createElement('div');
    opts.className = 'ccb-opts';
    opts.hidden = true;
    opts.append(
      row('ccb-nec', t('cc.nec'), t('cc.nec.d'), true, true),
      row('ccb-ana', t('cc.ana'), t('cc.ana.d'), !!prev.analytics, false),
      row('ccb-mkt', t('cc.mkt'), t('cc.mkt.d'), !!prev.marketing, false)
    );

    var btns = document.createElement('div');
    btns.className = 'ccb-btns';

    var prefs = document.createElement('button');
    prefs.type = 'button';
    prefs.className = 'ccb-b ccb-b-ghost';
    prefs.textContent = t('cc.prefs');

    var save = document.createElement('button');
    save.type = 'button';
    save.className = 'ccb-b ccb-b-ghost';
    save.textContent = t('cc.save');
    save.hidden = true;

    // Same class on both, so refusing is never the quieter button.
    var reject = document.createElement('button');
    reject.type = 'button';
    reject.className = 'ccb-b ccb-b-solid';
    reject.textContent = t('cc.reject');

    var accept = document.createElement('button');
    accept.type = 'button';
    accept.className = 'ccb-b ccb-b-solid';
    accept.textContent = t('cc.accept');

    prefs.addEventListener('click', function () {
      opts.hidden = false;
      prefs.hidden = true;
      save.hidden = false;
    });
    save.addEventListener('click', function () {
      decide(document.getElementById('ccb-ana').checked,
             document.getElementById('ccb-mkt').checked);
    });
    reject.addEventListener('click', function () { decide(false, false); });
    accept.addEventListener('click', function () { decide(true, true); });

    btns.append(prefs, save, reject, accept);
    el.append(body, opts, btns);
    document.body.appendChild(el);
  }

  /* ── the way back ─────────────────────────────────────────────────────── */

  /* Consent has to be as easy to withdraw as it was to give, so every page
     gets a permanent way back to this. Added to the footer if there is one,
     and the API is exposed either way. */
  function addFooterLink() {
    var host = document.querySelector('.ft-legal, .ft-copy');
    if (!host || document.querySelector('.ccb-manage')) return;
    var a = document.createElement('button');
    a.type = 'button';
    a.className = 'ccb-manage';
    a.textContent = t('cc.manage');
    a.addEventListener('click', function () { open(read()); });
    host.parentNode.insertBefore(a, host.nextSibling);
  }

  window.DRP_CONSENT = {
    get: read,
    open: function () { open(read()); },
    set: decide,
  };

  /* ── boot ─────────────────────────────────────────────────────────────── */

  function boot() {
    /* Nothing to consent to, nothing to ask.
     *
     * The head snippet is only written when markets.js carries a container
     * ID, and it is what defines gtag. So its absence means no tag manager,
     * no analytics, no ads -- and a banner asking permission for none of that
     * would be worse than no banner: it trains people to dismiss a question
     * that did not need asking, and it is the kind of consent theatre the law
     * was written against. The banner appears the moment an ID is pasted in. */
    if (typeof window.gtag !== 'function') return;

    var stored = read();
    // The head snippet already replayed a stored choice into Consent Mode;
    // this repeats it only so the dataLayer event fires on every page too.
    if (stored) apply(stored); else open(null);
    addFooterLink();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
