#!/usr/bin/env python3
"""Local preview server for the DRP BuildLab site.

Run from the repository root:

    python tools/serve.py            # http://127.0.0.1:8000
    python tools/serve.py 9000       # pick another port

Every page lives under a market -- /be/prijzen, /gb/prijzen, /jp/prijzen --
and a market carries both a language and a currency (assets/markets.js).
This server resolves those directories the way Netlify does, and sends a
bare "/" to a market the way the Country rules in _redirects do.

Plain `python -m http.server` is not enough: it would 301 /gb/prijzen to a
trailing slash, which Netlify does not add and which would not match the
page's own canonical.

`netlify dev` is the authoritative preview: it reads _redirects and _headers
directly and runs the real edge functions, so it is the only way to check
cache headers, the apex redirect or live exchange rates. This script is the
zero-install fallback -- it mimics the market routing, serves the 404 page,
and stubs /api/rates so prices convert offline. It knows nothing about
either config file. If the two disagree, Netlify is right.
"""
import json
import os
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

# The site root is the parent: this script lives in tools/.
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

USAGE = """DRP BuildLab preview server

  python tools/serve.py [port] [--cc=XX] [--lock] [--draft]

  port        port to listen on (default 8000)
  --cc=XX     which market a bare "/" redirects to, standing in for the
              Country rules Netlify uses in production. Every other URL
              states its own market, so this only affects "/".
  --lock      clear any stored language on load. Rarely needed now that the
              market in the URL is authoritative.
  --draft     also serve machine translations from assets/i18n.draft.js,
              with a CJK/Arabic font so they render. Only meaningful while a
              language is still in draft; nothing is currently.

Flags rather than environment variables, because the syntax for setting
those differs per shell -- `DRP_CC=ID python tools/serve.py` is bash and
fails in PowerShell. DRP_CC and DRP_LOCK_GEO still work; a flag wins.

  python tools/serve.py                 /  ->  /be/   (the default market)
  python tools/serve.py --cc=GB         /  ->  /gb/   English, GBP
  python tools/serve.py --cc=JP         /  ->  /jp/   Japanese, JPY
"""


def _args(argv):
    port = 8000
    cc = os.environ.get('DRP_CC', 'BE')
    lock = os.environ.get('DRP_LOCK_GEO', '') not in ('', '0', 'false', 'no')
    draft = os.environ.get('DRP_DRAFT', '') not in ('', '0', 'false', 'no')
    for a in argv[1:]:
        if a in ('-h', '--help'):
            print(USAGE)
            raise SystemExit(0)
        if a.isdigit():
            port = int(a)
        elif a.startswith('--cc='):
            cc = a.split('=', 1)[1]
        elif a in ('--lock', '--lock-geo'):
            lock = True
        elif a == '--draft':
            draft = True
        else:
            print('unknown argument: %s' % a)
            print('')
            print(USAGE)
            raise SystemExit(2)
    return port, cc.upper(), lock, draft


PORT, _CC_ARG, _LOCK_ARG, _DRAFT_ARG = _args(sys.argv)

# Stand-ins for the two Netlify edge functions, so the country/currency
# feature can be exercised without deploying. Set DRP_CC to pretend to be
# somewhere else:  DRP_CC=ID python serve.py
#
# The country tables are read out of the edge function itself rather than
# copied, so this stub cannot drift from what production actually returns.
# If that parse ever fails it degrades to a handful of countries -- enough
# to keep the preview working, and obvious in the startup banner.
#
# Rates are a fixed table, not a live fetch, so the preview server still
# works offline. The figures only need to be plausible for checking that
# conversion and formatting behave. `netlify dev` runs the real functions.
import re as _re


def _load_geo_tables():
    with open(os.path.join(ROOT, 'netlify', 'edge-functions', 'geo.js'),
              encoding='utf-8') as fh:
        src = fh.read()

    # LANG_COUNTRIES = { nl: [...], fr: [...], ... } -- one block per
    # language, each holding its own bracketed country list. Matched by
    # brace depth rather than a fixed set of names, so a new language block
    # in geo.js needs no matching change here.
    m = _re.search(r'const LANG_COUNTRIES = \{(.*?)\n\};', src, _re.S)
    langs = {}
    if m:
        for lm in _re.finditer(r'(\w+):\s*\[(.*?)\]', m.group(1), _re.S):
            langs[lm.group(1)] = set(_re.findall(r"'([A-Z]{2})'", lm.group(2)))

    m = _re.search(r'const CURRENCY = \{(.*?)\};', src, _re.S)
    cur = dict(_re.findall(r"([A-Z]{2}):\s*'([A-Z]{3})'", m.group(1))) if m else {}
    return langs, cur


try:
    _LANGS, _CURRENCY = _load_geo_tables()
    if not _LANGS:
        raise ValueError('LANG_COUNTRIES not found or empty')
    _TABLES = 'from geo.js (%d languages, %d currencies)' % (len(_LANGS), len(_CURRENCY))
except Exception as exc:                                  # noqa: BLE001
    _LANGS = {'nl': {'BE', 'NL'}, 'fr': {'FR'}, 'es': {'ES'}}
    _CURRENCY = {'US': 'USD', 'GB': 'GBP', 'JP': 'JPY', 'ID': 'IDR'}
    _TABLES = 'BUILT-IN FALLBACK (geo.js parse failed: %s)' % exc

FAKE_CC = _CC_ARG

# The market table, read from assets/markets.js rather than duplicated, so a
# market added there is immediately reachable here too.
MARKETS = {}
MARKET_DEFAULT = 'be'
try:
    with open(os.path.join(ROOT, 'assets', 'markets.js'), encoding='utf-8') as fh:
        _m = fh.read()
    for _code, _lang, _cur in _re.findall(
            r"(\w{2}):\s*\{\s*lang:\s*'(\w+)',\s*currency:\s*'(\w+)'", _m):
        MARKETS[_code] = {'lang': _lang, 'currency': _cur}
    _d = _re.search(r"__default:\s*'(\w+)'", _m)
    if _d:
        MARKET_DEFAULT = _d.group(1)
except Exception as _exc:                                 # noqa: BLE001
    pass


def _market_for(cc):
    """Which market a bare '/' should land on, mirroring the Country rules."""
    return cc.lower() if cc.lower() in MARKETS else MARKET_DEFAULT

# --lock (or DRP_LOCK_GEO=1) makes the country the only thing that decides the language,
# for testing. A stored language beats detection by design -- that is what
# stops a visitor's own choice being overridden by where they are -- but it
# also means one click on the switcher pins the language and the country stub
# appears to do nothing ever after. This hides the switcher and clears the
# stored preference on every load, so DRP_CC is the only input. Dev server
# only; the deployed site is untouched.
LOCK_GEO = _LOCK_ARG
DRAFT = _DRAFT_ARG

# Countries whose own language exists only as a draft, not yet in geo.js.
# id/de/ja are no longer here -- they are real languages now, resolved from
# _LANGS like any other. This map is what lets a reviewer see, say, Korean
# for KR before Korean is promoted; once it is, the KR line moves out of
# here and into LANG_COUNTRIES in geo.js.
DRAFT_CC = {
    'CN': 'zh', 'TW': 'zh', 'HK': 'zh', 'KR': 'ko',
    'TH': 'th', 'VN': 'vi', 'IN': 'hi', 'IL': 'he', 'SA': 'ar', 'AE': 'ar',
    'EG': 'ar', 'QA': 'ar', 'KW': 'ar', 'JO': 'ar',
    'IT': 'it', 'BR': 'pt', 'PT': 'pt', 'PL': 'pl', 'TR': 'tr', 'RU': 'ru',
    'UA': 'uk', 'SE': 'sv', 'NO': 'nb', 'DK': 'da', 'FI': 'fi', 'GR': 'el',
    'CZ': 'cs', 'RO': 'ro', 'HU': 'hu',
}
RTL = ('ar', 'he', 'fa', 'ur')

DRAFT_PATH = os.path.join(ROOT, 'assets', 'i18n.draft.js')
DRAFT_LANGS = []
if DRAFT and os.path.isfile(DRAFT_PATH):
    with open(DRAFT_PATH, encoding='utf-8') as fh:
        _draft_src = fh.read()
    # Top-level keys of TRANSLATIONS_DRAFT, i.e. the languages available.
    _body = _draft_src.split('TRANSLATIONS_DRAFT =', 1)[-1]
    DRAFT_LANGS = _re.findall(r'^ "([a-z-]{2,7})": \{', _body, _re.M)


def _lang_for(cc):
    # Draft preview only kicks in for a language geo.js does not already
    # have live -- once id/de/ja moved into LANG_COUNTRIES, the loop below
    # finds them before this ever gets consulted.
    if DRAFT and DRAFT_CC.get(cc) in DRAFT_LANGS:
        return DRAFT_CC[cc]
    for lang, countries in _LANGS.items():
        if cc in countries:
            return lang
    return 'en' if cc else None


# Enough spread to cover the interesting cases: strong and weak units, and
# the zero-decimal ones where a converted price runs to seven figures.
FAKE_RATES = {
    'USD': 1.1583, 'GBP': 0.8589, 'CHF': 0.9422, 'CAD': 1.6067,
    'AUD': 1.6185, 'NZD': 1.9822, 'JPY': 184.0, 'CNY': 7.7967,
    'INR': 110.0, 'IDR': 20559.0, 'VND': 29999.0, 'KRW': 1579.0,
    'BRL': 5.9521, 'MXN': 19.68, 'ZAR': 18.61, 'TRY': 56.0,
    'SEK': 11.16, 'NOK': 10.8, 'DKK': 7.4751, 'PLN': 4.3299,
    'CZK': 24.19, 'AED': 4.2538, 'SGD': 1.4734, 'HKD': 9.0842,
    'THB': 38.47, 'PHP': 72.44, 'NGN': 1560.0, 'KES': 150.0,
    'ARS': 1751.0, 'CLP': 1084.0, 'COP': 3662.0, 'MAD': 10.82,
    'EGP': 59.14, 'PKR': 321.0, 'BDT': 142.0, 'TWD': 36.78,
    'SAR': 4.3435, 'QAR': 4.2161,
}

class PrettyURLHandler(SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=ROOT, **kw)

    def _json(self, payload):
        body = json.dumps(payload).encode('utf-8')
        self.send_response(200)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        if self.command != 'HEAD':
            self.wfile.write(body)

    def _send_i18n_with_drafts(self, route):
        """The market's own payload, with its draft translations folded in.

        This used to intercept /assets/i18n.js and merge every draft language
        at once. No page has loaded that file since the payload was split per
        language, and the split files are now content-hashed on top of that,
        so the old interception had quietly stopped matching anything and
        --draft silently showed the reviewed copy instead of the draft.

        The route is /assets/build/i18n.<lang>.<hash>.js, so the language to
        merge is in the filename, and only that one is merged -- a page
        carries one language and assigning the others over it would do
        nothing but grow the file.

        Still merged here rather than by adding a <script> to every page, so
        no markup changes are needed and production cannot accidentally ship
        a reference to an unreviewed file.
        """
        name = route.rsplit('/', 1)[-1]              # i18n.nl.9be55902.js
        parts = name.split('.')
        lang = parts[1] if len(parts) > 3 else ''
        path = os.path.join(ROOT, 'assets', 'build', name)
        if not os.path.isfile(path):
            return self.send_error(404)
        with open(path, encoding='utf-8') as fh:
            merged = fh.read()
        if lang in DRAFT_LANGS:
            with open(DRAFT_PATH, encoding='utf-8') as fh:
                draft = fh.read()
            key = '"%s"' % lang
            merged += ('\n\n/* --draft: machine translations merged by serve.py */\n'
                       + draft
                       + '\nif (TRANSLATIONS_DRAFT[%s]) '
                         'Object.assign(TRANSLATIONS[%s], TRANSLATIONS_DRAFT[%s]);\n'
                       % (key, key, key))
        body = merged.encode('utf-8')
        self.send_response(200)
        self.send_header('Content-Type', 'text/javascript; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        if self.command != 'HEAD':
            self.wfile.write(body)

    def _inject_for(self):
        """The dev-only <head> additions, per flag."""
        bits = []

        if LOCK_GEO:
            # Cleared at parse time, before the deferred scripts read either
            # key, so a stored language cannot outrank the country.
            bits.append('<style>#langSw{display:none!important}</style>')
            bits.append('<script>try{localStorage.removeItem("drp-lang");'
                        'localStorage.removeItem("drp-geo");}catch(e){}</script>')

        if DRAFT:
            # Appended to the stack, not replacing it: Latin text keeps the
            # brand face and only CJK/Arabic glyphs come from Noto. Google
            # serves these in unicode-range subsets, so a Latin-only page
            # downloads none of it.
            bits.append(
                '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?'
                'family=Noto+Sans+JP:wght@400;600;800&'
                'family=Noto+Sans+SC:wght@400;600;800&'
                'family=Noto+Sans+KR:wght@400;600;800&'
                'family=Noto+Sans+Arabic:wght@400;600;800&'
                'family=Noto+Sans+Hebrew:wght@400;600;800&'
                'family=Noto+Sans+Thai:wght@400;600;800&'
                'family=Noto+Sans+Devanagari:wght@400;600;800&display=swap">')
            bits.append(
                "<style>body{font-family:'Plus Jakarta Sans','Noto Sans JP',"
                "'Noto Sans SC','Noto Sans KR','Noto Sans Arabic',"
                "'Noto Sans Hebrew','Noto Sans Thai','Noto Sans Devanagari',"
                "sans-serif}</style>")
            # Right-to-left drafts need the document direction flipped. The
            # language is set by app.js after the scripts run, so watch for it
            # rather than guessing here.
            bits.append(
                '<script>(function(){var R=%s;'
                'function sync(){var l=document.documentElement.lang;'
                'document.documentElement.dir=R.indexOf(l)>-1?"rtl":"ltr";}'
                'new MutationObserver(sync).observe(document.documentElement,'
                '{attributes:true,attributeFilter:["lang"]});'
                'document.addEventListener("DOMContentLoaded",sync);})();</script>'
                % json.dumps(list(RTL)))

        if LOCK_GEO or DRAFT:
            label = '%s -> %s / %s' % (FAKE_CC, _lang_for(FAKE_CC),
                                       _CURRENCY.get(FAKE_CC, 'EUR'))
            if DRAFT and _lang_for(FAKE_CC) in DRAFT_LANGS:
                label += ' (DRAFT translation)'
            bits.append(
                '<style>body::after{content:"DEV: %s";'
                'position:fixed;left:0;bottom:0;z-index:9999;'
                'background:#1a1f36;color:#fff;font:600 10px/1 system-ui;'
                'padding:5px 8px;letter-spacing:.08em;pointer-events:none}</style>'
                % label)

        return ''.join(bits)

    def _send_html_locked(self, full):
        with open(full, 'rb') as fh:
            body = fh.read()
        inject = self._inject_for().encode('utf-8')
        body = body.replace(b'</head>', inject + b'</head>', 1)
        self.send_response(200)
        self.send_header('Content-Type', 'text/html; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        if self.command != 'HEAD':
            self.wfile.write(body)

    def do_GET(self):
        route = self.path.split('?')[0]
        # Production's _redirects sends "/" to a market based on Country.
        # Same here, so the pre-market source page is unreachable in both.
        if route == '/' and MARKETS:
            target = '/%s/' % _market_for(FAKE_CC)
            self.send_response(302)
            self.send_header('Location', target)
            self.send_header('Content-Length', '0')
            self.end_headers()
            return
        if route == '/api/geo':
            return self._json({
                'country': FAKE_CC,
                'region': None,
                'lang': _lang_for(FAKE_CC),
                'currency': _CURRENCY.get(FAKE_CC, 'EUR'),
            })
        if route == '/api/rates':
            return self._json({'base': 'EUR', 'rates': FAKE_RATES,
                               'updated': None, 'stale': True})
        if (DRAFT and DRAFT_LANGS
                and route.startswith('/assets/build/i18n.')
                and route.endswith('.js')):
            return self._send_i18n_with_drafts(route)
        if LOCK_GEO or DRAFT:
            full = self.translate_path(self.path)
            if full.endswith('.html') and os.path.isfile(full):
                return self._send_html_locked(full)
        if self.command == 'HEAD':
            return super().do_HEAD()
        return super().do_GET()

    # Routed through do_GET so HEAD sees the same stubs and the same injected
    # body length; the handlers above all skip writing a body for HEAD.
    def do_HEAD(self):
        return self.do_GET()

    def translate_path(self, path):
        full = super().translate_path(path)
        if os.path.splitext(full)[1]:
            return full
        # /prijzen -> prijzen/index.html, the way Netlify's pretty URLs do it.
        # Resolved here rather than left to http.server's directory handling,
        # which would 301 to /prijzen/ first -- a trailing slash Netlify does
        # not add, and which would not match the page's own canonical URL.
        index = os.path.join(full, 'index.html')
        if os.path.isfile(index):
            return index
        # Any page still sitting flat at the root.
        if os.path.isfile(full + '.html'):
            return full + '.html'
        return full

    def send_error(self, code, message=None, explain=None):
        # Serve the real 404 page so it can be checked locally too
        if code == 404 and os.path.isfile(os.path.join(ROOT, '404.html')):
            body = open(os.path.join(ROOT, '404.html'), 'rb').read()
            self.send_response(404)
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            self.send_header('Content-Length', str(len(body)))
            self.end_headers()
            if self.command != 'HEAD':
                self.wfile.write(body)
            return
        super().send_error(code, message, explain)

    def end_headers(self):
        # No caching while developing, so edits show up on reload
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()

    def log_message(self, fmt, *args):
        sys.stderr.write('  %s\n' % (fmt % args))


if __name__ == '__main__':
    print('DRP BuildLab preview  ->  http://127.0.0.1:%d' % PORT)
    print('  /            -> /%s/  (market for --cc=%s)' % (_market_for(FAKE_CC), FAKE_CC))
    print('  /<market>/   %d markets: %s'
          % (len(MARKETS), ' '.join(sorted(MARKETS)) or '(markets.js not parsed)'))
    print('  /over-ons    about us')
    print('  /prijzen     pricing')
    print('  /contact     contact')
    print('  /api/geo     %s -> lang=%s currency=%s   [tables %s]'
          % (FAKE_CC, _lang_for(FAKE_CC), _CURRENCY.get(FAKE_CC, 'EUR'), _TABLES))
    print('  /api/rates   fixed snapshot, %d currencies' % len(FAKE_RATES))
    print('               set DRP_CC to test elsewhere, e.g. DRP_CC=JP')
    if DRAFT:
        print('  DRAFT        %s   (preview only, production never loads these)'
              % (', '.join(DRAFT_LANGS) or 'none found in assets/i18n.draft.js'))
    if LOCK_GEO:
        print('  GEO LOCK     on - switcher hidden, stored language cleared')
    else:
        print('               add --lock to hide the switcher so only the country decides')
    print('Ctrl+C to stop.\n')
    try:
        ThreadingHTTPServer(('127.0.0.1', PORT), PrettyURLHandler).serve_forever()
    except KeyboardInterrupt:
        print('\nstopped')
