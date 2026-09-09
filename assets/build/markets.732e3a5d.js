/* The markets the site is published for.
 *
 * A market is a URL segment, a language and a currency -- the same three
 * things nike.com/gb/ and nike.com/mx/ carry. Language and currency are
 * separate properties of a market, not derived from each other, which is the
 * whole point: the UK and the US both read English at different currencies,
 * and Mexico and Spain both read Spanish at different currencies. Binding
 * currency to language instead would have collapsed all of that to one
 * currency per language.
 *
 * `lang` must exist in TRANSLATIONS. `currency` must be quoted by the rate
 * feed, or prices quietly fall back to EUR, which is the currency invoicing
 * happens in anyway.
 *
 * Loaded by the page (for the client) and by tools/build-locales.js (to
 * generate the directories), so it has to work in both a browser and Node.
 */
(function (root, factory) {
  var MARKETS = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = MARKETS;
  else root.DRP_MARKETS = MARKETS;
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /* `cities`, `areas` and `languages` feed the ProfessionalService schema:
   * areaServed and contactPoint.
   *
   * Only Belgium declares them. The studio is in Belgium and genuinely works
   * across those cities, so naming them there is true and earns the local
   * search it gets. Everywhere else the work is remote, and a city list would
   * assert a local presence that does not exist -- so every other market
   * declares its country and stops. Serving a country remotely is a claim the
   * studio can stand behind; serving its cities is not.
   *
   * All three are optional. Without them a market gets its country alone, no
   * administrative areas, and its own language plus English. */
  return {
    //        language   currency  the market's own name (also the picker label)
    be: { lang: 'nl', currency: 'EUR', name: 'België',        region: 'Europe',
          areas: ['Vlaanderen', 'Wallonië'],
          languages: ['Dutch', 'English', 'French'],
          cities: ['Brussel', 'Antwerpen', 'Gent', 'Leuven', 'Mechelen', 'Hasselt', 'Brugge', 'Kortrijk', 'Namen', 'Luik'] },
    nl: { lang: 'nl', currency: 'EUR', name: 'Nederland',     region: 'Europe' },
    fr: { lang: 'fr', currency: 'EUR', name: 'France',        region: 'Europe' },
    lu: { lang: 'fr', currency: 'EUR', name: 'Luxembourg',    region: 'Europe' },
    ch: { lang: 'fr', currency: 'CHF', name: 'Suisse',        region: 'Europe' },
    de: { lang: 'de', currency: 'EUR', name: 'Deutschland',   region: 'Europe' },
    at: { lang: 'de', currency: 'EUR', name: 'Österreich',    region: 'Europe' },
    es: { lang: 'es', currency: 'EUR', name: 'España',        region: 'Europe' },
    gb: { lang: 'en', currency: 'GBP', name: 'United Kingdom', region: 'Europe' },
    ie: { lang: 'en', currency: 'EUR', name: 'Ireland',       region: 'Europe' },
    it: { lang: 'it', currency: 'EUR', name: 'Italia',        region: 'Europe' },
    pl: { lang: 'pl', currency: 'PLN', name: 'Polska',        region: 'Europe' },

    us: { lang: 'en', currency: 'USD', name: 'United States', region: 'Americas' },
    ca: { lang: 'en', currency: 'CAD', name: 'Canada',        region: 'Americas' },
    mx: { lang: 'es', currency: 'MXN', name: 'México',        region: 'Americas' },
    cl: { lang: 'es', currency: 'CLP', name: 'Chile',         region: 'Americas' },
    br: { lang: 'pt', currency: 'BRL', name: 'Brasil',        region: 'Americas' },

    id: { lang: 'id', currency: 'IDR', name: 'Indonesia',     region: 'Asia Pacific' },
    jp: { lang: 'ja', currency: 'JPY', name: '日本',           region: 'Asia Pacific' },
    sg: { lang: 'en', currency: 'SGD', name: 'Singapore',     region: 'Asia Pacific' },
    au: { lang: 'en', currency: 'AUD', name: 'Australia',     region: 'Asia Pacific' },

    /* Google Tag Manager container. Empty means GTM never loads at all --
     * no script, no request, nothing. Paste the GTM-XXXXXXX here and it goes
     * live on the next build; that is the only edit needed.
     *
     * It lives here because this is already the file both the browser and
     * the generator read, and because a tracking container belongs where
     * somebody looking for it would think to look. */
    __gtm: 'GTM-T5V7GG6G',

    /* Languages whose script the body face does not cover.
     *
     * Declared here because both sides need it: build-locales.js writes the
     * stylesheet link and the font rule into each generated page, and app.js
     * reads the same table at runtime. It used to live only in app.js, which
     * meant /jp/ downloaded Noto Sans JP on every visit and then rendered
     * Japanese in the browser's fallback anyway -- prerender baked the <link>
     * into the page but stripped the inline font-family that used it, so the
     * font arrived and was never applied. With JS off it never applied at all.
     *
     * Adding a script means adding a line here, nothing else. */
    __webfonts: {
      ja: {
        family: 'Noto Sans JP',
        href: 'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;600;800&display=swap',
      },
    },

    /* The market served when geo says nothing useful, and the one every
     * pre-existing URL redirects into. Belgium, because that is where the
     * business is and Dutch is the language the copy was written in. */
    __default: 'be',

    /* Where a visitor whose country has no market of its own is sent, and
       what x-default advertises. Deliberately not __default: the home
       market is Dutch, and Dutch is the wrong first impression for the
       ~180 countries not listed above. Ireland is English and prices in
       euro, which is the currency the studio actually quotes -- /gb/ would
       be English too but would misprice every non-UK visitor in sterling. */
    __fallback: 'ie',
  };
}));
