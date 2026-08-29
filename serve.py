#!/usr/bin/env python3
"""Local preview server for the DRP BuildLab site.

Plain `python -m http.server` is not enough here: the nav links point at
extensionless URLs (/prijzen, /over-ons, /contact) which Netlify resolves to
the index.html inside the matching directory -- with no trailing-slash
redirect, unlike http.server. This mimics that, plus the 404 page, so local
navigation behaves like production.

    python serve.py            # http://127.0.0.1:8000
    python serve.py 9000       # pick another port

`netlify dev` is the authoritative preview: it reads _redirects and _headers
directly, so it is the only way to check cache headers, the apex redirect or
the legacy /diensten-style paths. This script is the zero-install fallback --
it only mimics pretty URLs and the 404 page, and knows nothing about either
config file. If the two ever disagree, Netlify is right.
"""
import os
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
ROOT = os.path.dirname(os.path.abspath(__file__))


class PrettyURLHandler(SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=ROOT, **kw)

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
    print('  /            home')
    print('  /over-ons    about us')
    print('  /prijzen     pricing')
    print('  /contact     contact')
    print('Ctrl+C to stop.\n')
    try:
        ThreadingHTTPServer(('127.0.0.1', PORT), PrettyURLHandler).serve_forever()
    except KeyboardInterrupt:
        print('\nstopped')
