/* ─────────────────────────────────────────────
   REFERRAL CAPTURE

   A marketing partner hands out a link with their code on it:

       https://drpbuildlab.com/?ref=LOTTE24

   This remembers the code and puts it on the demo request, so the quote that
   comes out of that request can carry the visitor's 10% and the partner's 5%.
   That is the whole job. Everything after the form submission -- issuing the
   code, discounting the quote, booking the commission when the invoice is
   paid, the partner's dashboard, the monthly payout -- happens in the client
   portal, which is a different application and not in this repository. What
   this file guarantees is that the attribution is not lost between the click
   and the request, which is the one part that has to live on the website.

   ── Why this is not behind the cookie banner ──
   The visitor followed a link whose entire purpose is a discount they are
   asking for. Storing the code is what delivers the thing they requested, so
   it sits with the strictly-necessary storage rather than with analytics or
   advertising -- it is first-party, it is read by nobody but this site, and
   it is never used to build a profile or follow anyone anywhere else. It is
   written even when the banner is dismissed, and consent.js is not consulted.
   If legal advice comes back the other way, the fix is a consent check at
   remember() and nothing else changes.

   ── Ninety days ──
   Long enough for the ordinary path -- see the post, sit on it, ask for a
   demo a month later -- and short enough that a partner is not still being
   paid for a click from last spring. The clock is not extended by later
   visits: the window runs from the click that carried the code.

   ── First code wins ──
   If a visitor arrives on a second partner's link while a code is still
   live, the first one is kept. Last-click would let a partner overwrite
   somebody else's referral by getting their link in front of a reader who
   was already sold, and first-click is the rule that cannot be gamed that
   way. It is stated on the partner page so nobody has to guess.
───────────────────────────────────────────── */
(function () {
  'use strict';

  var KEY = 'drp_ref';
  var DAYS = 90;
  var MAX_AGE = DAYS * 24 * 60 * 60 * 1000;

  /* Codes are chosen by us, not typed by the visitor, so the pattern can be
     strict. Anything else in the parameter is discarded rather than stored:
     the value reaches a form field and an invoice, and a query string is the
     most public input a page has. */
  var VALID = /^[A-Za-z0-9][A-Za-z0-9_-]{1,31}$/;

  function read() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return null;
      var v = JSON.parse(raw);
      if (!v || !v.code || !VALID.test(v.code)) return null;
      if (!v.ts || Date.now() - v.ts > MAX_AGE) {
        localStorage.removeItem(KEY);
        return null;
      }
      return v;
    } catch (e) {
      return null;   // private mode, or somebody put junk in the key
    }
  }

  function remember(code) {
    try {
      localStorage.setItem(KEY, JSON.stringify({ code: code, ts: Date.now() }));
    } catch (e) { /* private mode: the code lives for this page view only */ }
  }

  /* The code on the URL, if there is one and it is one of ours. */
  function fromUrl() {
    var m = /[?&]ref=([^&#]*)/.exec(location.search);
    if (!m) return null;
    var code = '';
    try { code = decodeURIComponent(m[1]); } catch (e) { return null; }
    return VALID.test(code) ? code : null;
  }

  var stored = read();
  var fresh = fromUrl();

  if (fresh && !stored) {
    remember(fresh);
    stored = read();
  }

  var code = stored ? stored.code : null;

  /* Published so app.js can decide whether to show the visitor that the
     discount is attached, and so anything added later has one place to ask. */
  window.__DRP_REF__ = code;

  if (!code) return;

  /* Onto the demo request. The field is in the markup on every market, empty
     unless this runs, so a market without the partner page still records a
     referral that started on somebody's link -- the programme is published in
     two languages, but a Dutch influencer's audience is not all in Belgium. */
  function fill() {
    var fields = document.querySelectorAll('input[name="ref"]');
    for (var i = 0; i < fields.length; i++) fields[i].value = code;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fill);
  } else {
    fill();
  }
})();
