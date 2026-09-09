/* DRP BuildLab -- market locale and live currency.
 *
 * The market comes from the URL: /gb/prijzen is the United Kingdom, English,
 * priced in pounds, for anyone who opens that link. Language and currency are
 * both properties of the market (assets/markets.js), which is why the UK and
 * the US can share a language at different currencies.
 *
 * One endpoint feeds this: /api/rates (EUR rates, cached an hour at the
 * edge). If it is unreachable, prices stay in EUR -- the currency invoicing
 * happens in anyway -- rather than showing a figure from a stale rate.
 *
 * Prices live inside translated sentences ("...kost EUR29 per maand..."), not
 * in dedicated elements, so conversion works over text nodes. Every node it
 * touches is snapshotted first and restored before each re-run, because the
 * language switcher re-renders some text and leaves the rest -- converting a
 * converted price is the one failure mode that would be invisible and wrong.
 */
(function () {
  'use strict';

  /* Formatting locale per language. en uses en-US so USD renders as "$578"
   * rather than en-GB's "US$578"; the rest match the market whose
   * currency they carry. */
  var LOCALES = {
    nl: 'nl-BE', en: 'en-US', fr: 'fr-BE', es: 'es-ES',
    de: 'de-DE', id: 'id-ID', ja: 'ja-JP', pt: 'pt-BR',
    it: 'it-IT', pl: 'pl-PL',
  };

  /* Any of these between digit groups is a thousands separator. No price
   * on the site carries decimals, so there is nothing to disambiguate:
   * "8.320", "8,320" and "8 320" all mean 8320. This replaced a
   * per-language table that had to guess which separator each translation
   * used -- it guessed wrong for German, Indonesian and Japanese, which
   * all came back from DeepL with English-style commas, and silently
   * produced wrong prices. Requiring exactly three digits after the
   * separator keeps a sentence-ending "€98." from being read as one. */
  var SEP_CLASS = '.,\u00a0\u202f ';
  var SEP_RE = /[.,\u00a0\u202f ]/g;

  /* The market is stated by the URL -- /gb/prijzen is the United Kingdom,
   * in English, priced in pounds, for whoever opens it. Reading it from the
   * page rather than geo-detecting per request is what makes a shared link
   * mean the same thing to the person who receives it.
   *
   * __DRP_MARKET__ is written into each generated page; the path is parsed
   * as a fallback so a hand-edited or proxied page still resolves. */
  function resolveMarket() {
    var M = window.DRP_MARKETS || {};
    var fromPage = window.__DRP_MARKET__;
    if (fromPage && M[fromPage]) return fromPage;
    var seg = (location.pathname.split('/')[1] || '').toLowerCase();
    if (M[seg]) return seg;
    return M.__default || 'be';
  }

  var state = { market: null, lang: null, rates: null, stale: false, geo: null };

  // Exposed for app.js (which reads currency when painting figures) and for
  // the test suites. Dropped accidentally in the move to markets.
  window.DRP_LOCALE = state;

  /* Derived, never stored. Currency used to be read from /api/geo into a
   * field that a language change did not touch, which left Dutch copy priced
   * in rupiah for anyone whose IP resolved to Indonesia. Deriving it makes
   * that state unreachable. */
  Object.defineProperty(state, 'currency', {
    enumerable: true,
    get: function () {
      var M = window.DRP_MARKETS || {};
      var m = M[state.market];
      var c = (m && m.currency) || 'EUR';

      /* The fallback market is every country that has no market of its own --
       * roughly 180 of them, all reading English and, until now, all reading
       * euro even though the rate feed quotes their currency.
       *
       * There is no URL segment to carry a currency for them, so it comes
       * from the visitor instead. This is the one page where that is right:
       * every other market states its currency in the URL and keeps it, which
       * is what makes a shared link mean the same thing to whoever opens it.
       * Here there is nothing to be inconsistent with.
       *
       * The page stays English and stays /ie/ either way; only the indicative
       * figure follows the reader. Invoicing is in euro regardless, which
       * cur.note says on the page. */
      if (state.market === M.__fallback && state.geo && state.geo.currency) {
        c = state.geo.currency;
      }

      // A currency the rate feed does not quote is not one we can price in.
      if (c !== 'EUR' && (!state.rates || !state.rates[c])) return 'EUR';
      return c;
    },
  });

  var snap = new WeakMap();

  function get(url) {
    return fetch(url, { credentials: 'omit' }).then(function (r) {
      if (!r.ok) throw new Error(r.status);
      return r.json();
    });
  }

  /* ── price conversion ─────────────────────────────────────────────── */

  var NUM = '[0-9]{1,3}(?:[' + SEP_CLASS + '][0-9]{3})+|[0-9]+';

  function amountPattern() {
    // Symbol before (nl/en/de/id/ja) or after (fr/es) the figure.
    return new RegExp('(€\\s*)(' + NUM + ')|(' + NUM + ')(\\s*€)', 'g');
  }

  /* A range that carries one symbol for both ends -- "800–2 500 €", which is
   * how French and Spanish write it and where repeating the sign on each
   * figure would be wrong typography.
   *
   * amountPattern only ever saw the end that touched the symbol, so the other
   * end stayed in euro: /ch/ printed "800–2 350 CHF" and /mx/ "800–$49,500",
   * an unconverted low end beside a converted high one. Nothing looked broken
   * -- the number was still there -- while every competitor's cheap end was
   * understated by whatever the day's rate happened to be. */
  function rangePattern() {
    return new RegExp(
      '(' + NUM + ')(\\s*[-–—]\\s*)(' + NUM + ')(\\s*€)', 'g');
  }

  function parseAmount(raw) {
    var n = parseInt(String(raw).replace(SEP_RE, ''), 10);
    return isNaN(n) ? null : n;
  }

  /* The low end of such a range: converted, but bare. The source wrote one
   * symbol for both ends, so only the end that carried it gets one back. */
  function plainAmount(value, lang) {
    try {
      return new Intl.NumberFormat(fmtLocale(lang)).format(value);
    } catch (e) {
      return String(value);
    }
  }

  /* Every euro figure in a plain string, converted. Ranges go first: once one
   * is rewritten it carries the target currency, so the single-amount pass
   * finds nothing left to do in it. */
  function convertText(text, cur, rate, lang) {
    var out = String(text).replace(rangePattern(), function (m, a, dash, b) {
      var lo = parseAmount(a), hi = parseAmount(b);
      if (lo === null || hi === null) return m;
      return plainAmount(Math.round(lo * rate), lang) + dash
        + format(Math.round(hi * rate), cur, lang);
    });
    return out.replace(amountPattern(), function (m, pre, a, b) {
      var v = parseAmount(a || b);
      return v === null ? m : format(Math.round(v * rate), cur, lang);
    });
  }

  /* Region-qualify the formatting locale with the visitor's own country, so
   * a currency renders the way it does where they are: a US visitor sees
   * "$541", not en-GB's "US$541". Intl falls back sensibly for combinations
   * that are not real locales (en-JP resolves to English with yen). */
  function fmtLocale(lang) {
    /* Qualified with the market, not just the language: en-SG renders SGD as
       "S$735" and en-CA renders CAD as "CA$802", where a bare en-US would
       print "SGD 735". The market is exactly the region half of a locale tag,
       which is what makes this correct rather than a guess. */
    var base = LOCALES[lang] || LOCALES.nl;
    if (!state.market) return base;
    /* On the fallback market the region comes from the visitor rather than
     * the URL, so rupees render the way they do in India (en-IN) instead of
     * the way Ireland would render a foreign currency. */
    var M = window.DRP_MARKETS || {};
    var region = (state.market === M.__fallback && state.geo && state.geo.country)
      ? state.geo.country : state.market;
    var tag = lang + '-' + region.toUpperCase();
    try {
      return Intl.NumberFormat.supportedLocalesOf(tag).length ? tag : base;
    } catch (e) { return base; }
  }

  function format(value, currency, lang) {
    try {
      return new Intl.NumberFormat(fmtLocale(lang), {
        style: 'currency', currency: currency,
        minimumFractionDigits: 0, maximumFractionDigits: 0,
      }).format(value);
    } catch (e) {
      // Unknown ISO code, or a currency this runtime cannot format.
      return currency + ' ' + Math.round(value).toLocaleString();
    }
  }

  /* `all` visits every text node, not only the ones still carrying a euro
   * sign.
   *
   * The euro filter is right for finding amounts to convert, and wrong for
   * putting the originals back: once a node has been converted it says
   * "R$ 2.951" and the filter can no longer see it. That did not matter while
   * every page began in euro, because the restore pass had nothing to do on
   * the first run. With a bootstrap rate the first run converts, and the
   * second pass -- the one carrying the live rate -- found nothing to restore
   * and so nothing to re-convert. The bootstrap silently became final. */
  function walk(root, fn, all) {
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        var p = n.parentNode;
        if (!p) return NodeFilter.FILTER_REJECT;
        var tag = p.nodeName;
        if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'NOSCRIPT') return NodeFilter.FILTER_REJECT;
        if (p.closest && p.closest('[data-no-currency]')) return NodeFilter.FILTER_REJECT;
        if (all) return NodeFilter.FILTER_ACCEPT;
        return n.nodeValue && n.nodeValue.indexOf('€') !== -1
          ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      },
    });
    var n, list = [];
    while ((n = w.nextNode())) list.push(n);
    list.forEach(fn);
  }

  function convert() {
    var lang = document.documentElement.lang || 'nl';
    var cur = state.currency;
    var rate = cur === 'EUR' ? 1 : (state.rates && state.rates[cur]);

    // Restore originals first: the language switcher rewrites some nodes from
    // source and leaves others untouched, so without this a second pass would
    // convert an already-converted figure. Every text node, not just the ones
    // still showing euro -- an already-converted one is exactly what needs
    // putting back.
    walk(document.body, function (node) {
      if (snap.has(node)) node.nodeValue = snap.get(node);
    }, true);

    if (!rate || cur === 'EUR') { note(null); return; }

    walk(document.body, function (node) {
      var original = node.nodeValue;
      var out = convertText(original, cur, rate, lang);
      if (out !== original) {
        if (!snap.has(node)) snap.set(node, original);
        node.nodeValue = out;
      }
    });
    splitFigures(cur, rate, lang);
    recount();
    note(cur);
    fitTable();
  }

  /* Figures that wrap the currency symbol in its own tag for styling --
   * "<sup>&euro;</sup>499" on the pricing card -- put the symbol and the
   * digits in separate text nodes, so the walk above cannot see an amount.
   * Converted whole instead, from a snapshot of the original markup. */
  var snapHTML = new WeakMap();
  function splitFigures(cur, rate, lang) {
    var els = document.querySelectorAll('.pprice');
    Array.prototype.forEach.call(els, function (el) {
      if (!snapHTML.has(el)) snapHTML.set(el, el.innerHTML);
      var original = snapHTML.get(el);
      el.innerHTML = (cur === 'EUR' || !rate) ? original : state.money(original);
    });
  }

  /* Counters that have already finished animating keep whatever they counted
   * to, which is a euro figure if the rates landed after they ran. Rewrite
   * those to the converted total; ones that have not run yet will pick the
   * rate up when they do. */
  function recount() {
    var els = document.querySelectorAll('[data-count][data-counted]');
    Array.prototype.forEach.call(els, function (el) {
      var raw = parseInt(el.dataset.count, 10);
      if (isNaN(raw) || (el.dataset.prefix || '').indexOf('€') === -1) return;
      el.textContent = state.formatAmount(state.convertAmount(raw))
        || ((el.dataset.prefix || '') + raw + (el.dataset.suffix || ''));
    });
  }

  /* The comparison table's columns are fr-proportional and sized for euro
   * figures. A converted price can be three times longer, which clipped the
   * cells rather than widening them. Measure what each column actually needs
   * and, only if the total exceeds the space available, pin every row to the
   * same explicit template and let the table scroll -- identical templates
   * are what keep the columns lined up once fr no longer applies. */
  function fitTable() {
    var tbl = document.querySelector('.ctbl');
    if (!tbl) return;
    tbl.classList.remove('scrolls');
    tbl.style.removeProperty('--c1');
    tbl.style.removeProperty('--c2');
    tbl.style.removeProperty('--c3');

    var rows = tbl.querySelectorAll('.chd, .crow');
    if (!rows.length) return;

    /* Engage only when the normal wrapping layout actually cuts something
     * off. Euro figures wrap onto two lines and fit fine at 320px -- forcing
     * a scroll for them would undo the narrow-screen work that made the
     * table fit in the first place. Long converted prices cannot wrap small
     * enough, and those are the ones that need the scroll. */
    var clippedNow = false;
    Array.prototype.forEach.call(rows, function (row) {
      Array.prototype.forEach.call(row.children, function (cell) {
        if (getComputedStyle(cell).display === 'none') return;
        if (cell.scrollWidth > cell.clientWidth + 1) clippedNow = true;
      });
    });
    if (!clippedNow) return;

    tbl.classList.add('measuring');
    var need = [], rng = document.createRange();
    Array.prototype.forEach.call(rows, function (row) {
      var i = 0;
      Array.prototype.forEach.call(row.children, function (cell) {
        var cs = getComputedStyle(cell);
        if (cs.display === 'none') return;
        // Measured with a Range over the cell's own contents rather than via
        // scrollWidth: these cells are flex containers, where scrollWidth
        // reported a few pixels under the real text width and left the
        // column short enough to still clip. A Range measures the text
        // itself, independently of the box it is currently squeezed into.
        rng.selectNodeContents(cell);
        var text = rng.getBoundingClientRect().width;
        var box = (parseFloat(cs.paddingLeft) || 0) + (parseFloat(cs.paddingRight) || 0)
                + (parseFloat(cs.borderLeftWidth) || 0) + (parseFloat(cs.borderRightWidth) || 0);
        need[i] = Math.max(need[i] || 0, Math.ceil(text + box) + 2);
        i++;
      });
    });
    tbl.classList.remove('measuring');

    if (!need.length) return;

    var apply = function () {
      need.forEach(function (w, i) { tbl.style.setProperty('--c' + (i + 1), w + 'px'); });
    };
    apply();
    tbl.classList.add('scrolls');

    /* Measuring inline content inside a flex cell is not exact -- both
     * scrollWidth and a Range come up a few pixels short depending on the
     * engine. So rather than trust the measurement, look at what actually
     * clipped once applied and widen those columns by the shortfall. Two
     * passes settle it; the loop exits as soon as nothing is cut off. */
    for (var pass = 0; pass < 3; pass++) {
      var extra = [], clipped = false;
      Array.prototype.forEach.call(rows, function (row) {
        var i = 0;
        Array.prototype.forEach.call(row.children, function (cell) {
          if (getComputedStyle(cell).display === 'none') return;
          var over = cell.scrollWidth - cell.clientWidth;
          if (over > 0) { extra[i] = Math.max(extra[i] || 0, over + 1); clipped = true; }
          i++;
        });
      });
      if (!clipped) break;
      need = need.map(function (w, i) { return w + (extra[i] || 0); });
      apply();
    }
  }

  /* A converted figure is indicative: the invoice is issued in EUR under
   * Belgian VAT, and the rate moves. Saying so sits next to the prices
   * rather than in a footer nobody reads. */
  function note(cur) {
    var hosts = document.querySelectorAll('.pgrid, .opp-box, .ctbl');
    Array.prototype.forEach.call(hosts, function (host) {
      var el = host.parentNode.querySelector(':scope > .cur-note');
      if (!cur) { if (el) el.remove(); return; }
      if (!el) {
        el = document.createElement('p');
        el.className = 'cur-note';
        host.parentNode.insertBefore(el, host.nextSibling);
      }
      var t = window.DRP_T && window.DRP_T('cur.note');
      el.textContent = (t || 'Prices shown in {cur} are converted from euro at today’s rate and are indicative. Invoicing is in EUR.')
        .replace('{cur}', cur) + (state.stale ? '' : '');
    });
  }

  /* Converts a short HTML fragment such as the zoom-section statistics.
   *
   * Those mark the currency symbol up in its own <span> for the blue accent
   * -- "<span>&euro;</span>0" in Dutch, "0<span> &euro;</span>" in French --
   * which splits the symbol from the digits into two separate text nodes.
   * The text-node walk above can never see an amount in that shape, so these
   * are converted from the element's text as a whole and the symbol is put
   * back inside its span, on whichever side it started.
   *
   * Exposed because the zoom stats are also rewritten on scroll, straight
   * from the translation strings; app.js runs the value through this on the
   * way in, so a converted figure is never overwritten with a euro one. */
  state.money = function (html) {
    var cur = state.currency;
    var rate = cur === 'EUR' ? 1 : (state.rates && state.rates[cur]);
    if (!rate || cur === 'EUR' || !html) return html;

    var lang = document.documentElement.lang || 'nl';
    // Any single wrapping tag, not just <span>: the pricing card marks the
    // symbol up as <sup>, the zoom statistics as <span>.
    var leadTag = String(html).match(/^<([a-zA-Z]+)>[^<]*<\/[a-zA-Z]+>/);
    var trailTag = String(html).match(/<([a-zA-Z]+)>[^<]*<\/[a-zA-Z]+>$/);
    var text = String(html).replace(/<[^>]*>/g, '');

    var out = convertText(text, cur, rate, lang);
    if (out === text) return html;          // nothing to convert, e.g. "100%"

    var m2, tag;
    if (leadTag && (m2 = out.match(/^([^0-9]+)([0-9].*)$/))) {
      tag = leadTag[1];
      return '<' + tag + '>' + m2[1] + '</' + tag + '>' + m2[2];
    }
    if (trailTag && (m2 = out.match(/^(.*[0-9])([^0-9]+)$/))) {
      tag = trailTag[1];
      return m2[1] + '<' + tag + '>' + m2[2] + '</' + tag + '>';
    }
    return out;
  };

  /* The animated statistics count towards a number and rebuild their own
   * text each frame, so they need the figure and the formatter separately
   * rather than a finished string. formatAmount returns null for euro, which
   * tells the caller to keep its own prefix+digits formatting. */
  state.convertAmount = function (n) {
    var cur = state.currency;
    var rate = cur === 'EUR' ? 1 : (state.rates && state.rates[cur]);
    return (!rate || cur === 'EUR') ? n : Math.round(n * rate);
  };
  state.formatAmount = function (n) {
    var cur = state.currency;
    if (cur === 'EUR' || !state.rates || !state.rates[cur]) return null;
    return format(n, cur, document.documentElement.lang || 'nl');
  };

  document.addEventListener('drp:langapplied', convert);

  /* The column measurement above is only as good as the font in use when it
   * runs, and the webfont arrives after first paint -- measuring in the
   * fallback face gave columns a few pixels too narrow, which is exactly how
   * wide the clipping was. Re-fit once the real font is in, and again on
   * resize or orientation change. */
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { fitTable(); });
  }
  var refit;
  addEventListener('resize', function () {
    clearTimeout(refit);
    refit = setTimeout(fitTable, 150);
  }, { passive: true });

  /* ── boot ─────────────────────────────────────────────────────────── */

  state.market = resolveMarket();
  var M = window.DRP_MARKETS || {};
  state.lang = (M[state.market] && M[state.market].lang) || null;

  /* A rate to start from, written into assets/rates.boot.js at build time.
   *
   * Without it every non-euro market painted "€499" and sat there for over a
   * second -- 2.9s on a slow connection -- because conversion could not begin
   * until /api/rates came back. A visitor in São Paulo read a euro price for
   * the first second of every pageview.
   *
   * This is a starting value, never the answer: the live rate is still
   * fetched below and re-converts the page when it lands. So nothing here
   * fixes a rate in place -- it only stops the first paint being wrong.
   *
   * Absent during prerendering, where the build deliberately starves the page
   * of rates so that euro, not a frozen conversion, is what gets committed. */
  if (window.__DRP_RATES__) {
    state.rates = window.__DRP_RATES__;
    state.stale = true;
  }

  /* Convert from here rather than waiting to be asked.
   *
   * Conversion used to happen only on the drp:langapplied event, which
   * app.js fires at the end of applyLang -- and applyLang returns early when
   * its language block is missing. So if assets/i18n.<lang>.js failed to
   * load, the page kept the prerendered copy and every price stayed in euro:
   * a Brazilian visitor reading €499 because an unrelated file did not
   * arrive. Prices do not depend on the translations, so they should not
   * depend on the translations loading. */
  convert();

  /* Who is asking -- but only on the market that has to ask.
   *
   * Twenty of the twenty-one markets state their currency in the URL and need
   * nothing from geo. The fallback serves every country without a market of
   * its own, so it is the only page where the visitor's own currency is not
   * already known, and the only one that spends a request finding out.
   *
   * Netlify resolves the country at the edge from the connecting IP; the IP
   * never reaches the page and the response is no-store, because a cached
   * country is somebody else's location. */
  if (state.market === (window.DRP_MARKETS || {}).__fallback) {
    get('/api/geo')
      .then(function (g) { if (g && g.currency) { state.geo = g; convert(); } })
      .catch(function () { /* stays euro, which is what it was anyway */ });
  }

  /* Rates. Netlify's _redirects handles the other place geo matters --
   * choosing where to send a bare "/" -- so for every market but the fallback
   * this is the only request the page makes. */
  window.DRP_LOCALE_READY = get('/api/rates')
    .then(function (rt) {
      if (rt && rt.rates) { state.rates = rt.rates; state.stale = !!rt.stale; }
      // Same reason as above: re-convert on the live rate without waiting for
      // app.js to tell us to, so a missing translation file cannot leave a
      // market priced in euro.
      convert();
      return state;
    })
    .catch(function () { return state; });
})();
