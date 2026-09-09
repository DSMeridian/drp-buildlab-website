# Testing the market localisation

Every page lives under a market: `/be/prijzen`, `/gb/prijzen`, `/jp/prijzen`.
A market carries **both** a language and a currency, which is what lets
`/gb/` and `/us/` share English at different prices — the same structure
nike.com/gb/ and nike.com/mx/ use.

The market is stated by the URL, so a link means the same thing to whoever
opens it. Someone in Jakarta opening `/gb/prijzen` sees the British page in
pounds, because that is what the link says.

---

## Start here

```powershell
python tools/serve.py
```

Then open <http://127.0.0.1:8000/be/> and change the segment: `/gb/`,
`/jp/`, `/mx/`, `/id/`. No flags needed — the URL is the whole input.

A bare `/` redirects to a market. Locally `--cc` picks which one, standing
in for the `Country` rules Netlify uses in production:

```powershell
python tools/serve.py --cc=GB     #  /  ->  /gb/
python tools/serve.py --cc=JP     #  /  ->  /jp/
python tools/serve.py             #  /  ->  /be/   (the default market)
```

---

## The markets

| URL | Market | Language | Currency |
|---|---|---|---|
| `/be/` | België | nl | EUR |
| `/nl/` | Nederland | nl | EUR |
| `/fr/` | France | fr | EUR |
| `/lu/` | Luxembourg | fr | EUR |
| `/ch/` | Suisse | fr | CHF |
| `/de/` | Deutschland | de | EUR |
| `/at/` | Österreich | de | EUR |
| `/es/` | España | es | EUR |
| `/gb/` | United Kingdom | en | GBP |
| `/ie/` | Ireland | en | EUR |
| `/us/` | United States | en | USD |
| `/ca/` | Canada | en | CAD |
| `/mx/` | México | es | MXN |
| `/id/` | Indonesia | id | IDR |
| `/jp/` | 日本 | ja | JPY |
| `/sg/` | Singapore | en | SGD |
| `/au/` | Australia | en | AUD |

17 markets, 7 languages,
10 currencies.

Languages shared across markets at different currencies: **nl** in `/be/`, `/nl/`; **fr** in `/fr/`, `/lu/`, `/ch/`; **de** in `/de/`, `/at/`; **es** in `/es/`, `/mx/`; **en** in `/gb/`, `/ie/`, `/us/`, `/ca/`, `/sg/`, `/au/`.

That sharing is the reason for the market model. Binding currency to language
instead would force every English market onto one currency, and the UK would
be priced in dollars.

Defined in `assets/markets.js`, read by both the page and the generator.

---

## What to check

1. **The URL alone decides.** Open `/gb/` from anywhere and it is English in
   pounds. Nothing about the visitor's location changes a market page — geo
   is consulted once, only to decide where a bare `/` lands.
2. **Same language, different currency.** `/gb/` and `/us/` are both
   English; one shows £429 and the other $578. If they ever show the same
   currency, the market model has broken.
3. **The canonical points at itself.** `/jp/prijzen` must canonicalise to
   `/jp/prijzen`, not to the source page. Each market page also carries
   hreflang alternates for all 17 markets plus x-default.
4. **Internal links keep the market.** Clicking through `/jp/` must stay in
   `/jp/` — a nav link that drops the segment silently returns the visitor
   to the default market.
5. **Prices convert everywhere**, not just the headline: pricing cards, the
   comparison table, the cost-calculation box, FAQ answers, the sticky mobile
   bar, and the scroll-zoom statistics. That last one re-renders as you
   scroll past it, so a currency bug there only shows up once you scroll.

---

## Regenerating the market pages

The pages under each market directory are generated and committed — there is
no build step on Netlify, deliberately, because a build command is one more
thing that can fail on deploy.

```powershell
npm run build
```

Two stages: `build-locales.js` writes the structure, `prerender.js` bakes the
translated text into the HTML. Stage one overwrites stage two, so run them in
that order -- `npm run build` does.

Run it after changing a page in `src/`, changing a translation, or adding a
market to `assets/markets.js`.

### Checking the prerender worked

The point of prerendering is what a crawler sees, so test with JavaScript
off (DevTools -> Settings -> Debugger -> Disable JavaScript, then reload):

- `/jp/` should still show Japanese copy, `/de/` German, `/mx/` Spanish.
  If a page falls back to Dutch with JS disabled, prerendering did not run
  for it.
- Prices **should** still read EUR with JS off. They are converted
  client-side on purpose, so a static file never holds a stale exchange
  rate.

Adding a market is one line in `assets/markets.js` plus a rerun:

```js
pt: { lang: 'en', currency: 'BRL', name: 'Brasil', region: 'Americas' },
```

Then add its `Country` rule to `_redirects` (or rerun the redirect
generator) so a bare `/` from that country lands there.

---

## The market picker

The nav carries a market picker -- a native `<select>` grouped by region,
each option labelled with its currency ("United Kingdom — GBP").

It **navigates**; it does not swap text in place. Choosing Japan on
`/gb/prijzen` takes you to `/jp/prijzen` -- the same page, that market's
copy. A toggle that swapped text would have left `/gb/` showing Dutch copy
at pound prices, with the URL and the content disagreeing.

Worth checking:

- It keeps you on the page you were on, rather than dropping you at the home
  page of the new market. `/be/prijzen` goes to `/gb/prijzen`, not `/gb/`.
- The current market is already selected on load. That is rendered
  server-side into each generated page, so it is correct before any JS runs.
- A native select rather than a row of codes: 17 markets do not fit a nav
  bar, and the OS picker is better on a phone than anything custom. The old
  row of seven language buttons pushed the hamburger off screen at 320px.

The old language toggle is gone. It applied a language to the page you were
already on, which cannot work once the URL states the market -- and a
language stored from an earlier visit used to override the market, so
`/jp/` could come back in Dutch.

---

## Currency comes from the market, not the IP

`/api/geo` is no longer requested by the page at all. Currency and language
both come from the market in the URL, so there is one fewer request per
pageview and no per-visitor data reaches the client.

`/api/rates` is still fetched — EUR rates, cached an hour at the edge. If it
is unreachable, prices stay in EUR, which is the currency invoicing happens
in anyway, rather than showing a figure derived from a stale rate.

| To simulate | How | Expected |
|---|---|---|
| Rate feed down | DevTools → Network → block `/api/rates` | Prices stay in **EUR** in every market |
| Currency not quoted | a market whose currency the feed omits | Falls back to EUR, no broken figure |
| Offline | disconnect | Page still renders, EUR prices |

---

## Old URLs

Everything that existed before the market structure 301s into the default
market:

```
/prijzen      ->  /be/prijzen
/over-ons     ->  /be/over-ons
/contact      ->  /be/contact
/             ->  /<your market>/     302, varies by visitor
```

The root redirect is a **302** on purpose: its destination depends on who is
asking, and a 301 would be cached and then served to the wrong country.

---

## `netlify dev` is still authoritative

`serve.py` mimics the market routing and stubs `/api/rates`, but knows
nothing about `_headers` or the `Country` conditions in `_redirects`.

```powershell
netlify dev
```

That runs the real edge functions and the real redirect rules, including the
geo routing for `/`. If the two disagree, Netlify is right.
