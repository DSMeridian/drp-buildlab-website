document.documentElement.classList.add('js');
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* header: solid once scrolled, hides on the way down, back on the way up */
/* Hidden while reading down the page, back the moment you scroll up,
   reach the top edge with the mouse, or tab into it. Small jitters from
   trackpads and momentum scrolling are ignored. */
const hdr = $('#hdr'); let lastY = scrollY, ticking = false;
const setHidden = h => hdr.classList.toggle('hide', h && !document.body.classList.contains('menu-open') && !hdr.contains(document.activeElement));
function onHdrScroll() {
  const y = Math.max(0, scrollY), d = y - lastY;
  hdr.classList.toggle('solid', y > 40);
  if (y < 160) setHidden(false);
  else if (d > 6) setHidden(true);
  else if (d < -6) setHidden(false);
  if (Math.abs(d) > 6 || y < 160) lastY = y;
  ticking = false;
}
addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onHdrScroll); } }, { passive: true });
addEventListener('pointermove', e => { if (e.pointerType === 'mouse' && e.clientY < 72) setHidden(false); }, { passive: true });
hdr.addEventListener('focusin', () => setHidden(false));
onHdrScroll();

/* mobile menu */
const menu = $('#menu'), burger = $('#burger');
const setMenu = open => {
  menu.classList.toggle('open', open); burger.setAttribute('aria-expanded', open);
  document.body.classList.toggle('menu-open', open);
  (open ? $('#menuX') : burger).focus();
};
burger.addEventListener('click', () => setMenu(true));
$('#menuX').addEventListener('click', () => setMenu(false));
addEventListener('keydown', e => { if (e.key === 'Escape' && menu.classList.contains('open')) setMenu(false); });

/* language menu closes on outside click */
addEventListener('click', e => $$('.lang[open]').forEach(d => { if (!d.contains(e.target)) d.open = false; }));

/* reveals: transform only, so nothing is ever hidden */
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
$$('.rv').forEach(el => io.observe(el));

/* home: hero mockup grows into place; statement lights up word by word */
const stage = $('#stage'), stageIn = $('#stageIn'), stmt = $('#stmt');
let words = [];
if (stmt) {
  const hl = new Set((stmt.dataset.hl || '').split('|'));
  stmt.innerHTML = stmt.textContent.trim().split(/\s+/).map(w => `<span class="w${hl.has(w) ? ' hl' : ''}">${w}</span>`).join(' ');
  words = $$('.w', stmt);
}
function onScroll() {
  const vh = innerHeight;
  if (stage && !reduce) {
    const p = Math.min(1, Math.max(0, (vh - stage.getBoundingClientRect().top) / (vh * 0.9)));
    stageIn.style.setProperty('--s', (0.9 + p * 0.1).toFixed(4));
  }
  if (words.length) {
    const r = stmt.getBoundingClientRect();
    const q = reduce ? 1 : Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height + vh * 0.35)));
    const n = Math.round(q * words.length);
    words.forEach((w, i) => w.classList.toggle('on', i < n));
  }
}
addEventListener('scroll', onScroll, { passive: true }); addEventListener('resize', onScroll); onScroll();

/* project mockups: how far the screenshot scrolls on hover */
function sizeShots() {
  $$('.case-media').forEach(m => {
    const s = $('.screen', m), p = $('.pscreen', m);
    if (s) m.style.setProperty('--sh', s.clientHeight + 'px');
    if (p) m.style.setProperty('--ph', p.clientHeight + 'px');
  });
}
addEventListener('resize', sizeShots); addEventListener('load', sizeShots); sizeShots();

/* "View" cursor over projects */
const cur = $('#cur');
if (cur && matchMedia('(hover:hover)').matches && !reduce) {
  addEventListener('pointermove', e => { cur.style.setProperty('--x', e.clientX + 'px'); cur.style.setProperty('--y', e.clientY + 'px'); }, { passive: true });
  $$('.case-media').forEach(m => {
    m.addEventListener('pointerenter', () => cur.classList.add('on'));
    m.addEventListener('pointerleave', () => cur.classList.remove('on'));
  });
}

/* strings the scripts show, translated with the page (#ui in every page) */
const ui = k => ($(`#ui [data-k="${k}"]`) || {}).textContent || '';

/* quote form: company fields only for a business, and disabled otherwise so
   a company typed before switching to "private" is not submitted */
(() => {
  const radios = $$('input[name="klanttype"]');
  if (!radios.length) return;
  const sync = () => {
    const biz = ($('input[name="klanttype"]:checked') || {}).value === 'bedrijf';
    $$('.biz-only').forEach(el => { el.hidden = !biz; $$('input', el).forEach(i => { i.disabled = !biz; }); });
  };
  radios.forEach(r => r.addEventListener('change', sync)); sync();
})();

/* Netlify forms over fetch, as on the previous site: post to this page's own
   path (the root carries forced geo redirects, and a 302 turns a POST into a
   GET), and only a 2xx counts as sent. The analytics event carries which
   option was picked, the market and the language; never what was typed.
   Netlify knows these forms from __forms.html (Dutch labels for the
   dashboard), so the visible ones carry no data-netlify: found by data-event. */
const DEMO_SERVICE = ['none', 'starter', 'custom', 'update', 'extras', 'undecided'];
const PARTNER_CHANNEL = ['none', 'instagram', 'tiktok', 'youtube', 'linkedin', 'newsletter', 'offline', 'other'];
function track(f) {
  const base = { demo_market: window.__DRP_MARKET__ || '', demo_language: document.documentElement.lang || '' };
  let ev;
  if (f.dataset.event === 'partner_request') {
    const ch = $('select[name="kanaal"]', f), reach = $('select[name="bereik"]', f);
    ev = { event: 'partner_request', partner_channel: PARTNER_CHANNEL[ch ? ch.selectedIndex : -1] || 'unknown', partner_reach: reach && reach.selectedIndex > 0 ? reach.selectedIndex : 0, ...base };
  } else {
    const sel = $('select[name="dienst"]', f), chip = $('input[name="dienst"]:checked', f);
    ev = { event: 'demo_request', demo_service: sel ? (DEMO_SERVICE[sel.selectedIndex] || 'unknown') : (chip ? chip.dataset.slug : 'unknown'), demo_form: f.id, ...base };
  }
  window.dataLayer = window.dataLayer || []; window.dataLayer.push(ev);
}
$$('form[data-event]').forEach(f => f.addEventListener('submit', e => {
  e.preventDefault();
  const msg = $('.ok', f), btn = $('button[type="submit"]', f);
  const bad = $$('[required]', f).find(i => !i.disabled && ((i.type === 'checkbox' ? !i.checked : !String(i.value).trim()) || !i.checkValidity()));
  if (bad) {
    const name = (f.querySelector(`label[for="${bad.id}"]`)?.childNodes[0]?.textContent || '').trim();
    msg.textContent = bad.type === 'email' ? ui('email') : bad.type === 'checkbox' ? ui('tick') : `${ui('fill')} ${name}`;
    msg.classList.add('show'); bad.focus(); return;
  }
  btn.disabled = true; msg.classList.remove('show');
  /* The same body also goes to /api/form, which emails it through Resend:
     Netlify's spam filter files real enquiries under Spam without a word, so
     its notification can't be the only one. Either one arriving counts as
     sent. The id stays with this filled-in form, so a retry is not emailed twice. */
  const body = new URLSearchParams(new FormData(f));
  f.dataset.sid = f.dataset.sid || (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2));
  const post = (url, b) => fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: b.toString() })
    .then(res => { if (!res.ok) throw new Error('HTTP ' + res.status); });
  const mail = new URLSearchParams(body); mail.set('submission-id', f.dataset.sid);
  Promise.any([post(location.pathname, body), post('/api/form', mail)])
    .then(() => {
      track(f);
      const done = document.createElement('p'); done.className = 'ok show sent'; done.setAttribute('role', 'status'); done.textContent = ui(f.dataset.sent || 'sent');
      $$(':scope > *:not(h3)', f).forEach(el => { el.hidden = true; }); f.append(done); done.focus?.();
    })
    .catch(() => { btn.disabled = false; msg.textContent = ui('failed'); msg.classList.add('show'); });
}));

/* prices: written in euro, shown in the market's own currency when it has
   another one, from the same /api/rates the previous site used */
(() => {
  const cur = document.documentElement.dataset.currency, els = $$('.money[data-eur]');
  const opts = $$('option').filter(o => /€\s?(499|29)/.test(o.textContent));
  if ((!els.length && !opts.length) || !cur || cur === 'EUR') return;
  fetch('/api/rates').then(r => r.json()).then(d => {
    const rate = d && d.rates && d.rates[cur]; if (!rate) return;
    const fmt = new Intl.NumberFormat(document.documentElement.lang, { style: 'currency', currency: cur, maximumFractionDigits: 0 });
    els.forEach(el => { el.textContent = fmt.format(Math.round(+el.dataset.eur * rate)); el.title = '€' + el.dataset.eur; });
    /* dropdown options cannot hold a .money element, so their text is converted in place */
    opts.forEach(o => { o.textContent = o.textContent.replace(/€\s?(499|29)/g, (m, n) => fmt.format(Math.round(+n * rate))); });
  }).catch(() => {});
})();

/* showreel: expands with scroll, loads when near, plays only in view */
const reelBox = $('#reelBox'), vid = $('#reelVid'), reelBtn = $('#reelBtn');
if (reelBox && vid) {
  let userPaused = reduce, loaded = false, inView = false;
  const setBtn = () => { const paused = vid.paused; reelBtn.textContent = paused ? (ui('play') || 'Play') : (ui('pause') || 'Pause'); reelBtn.setAttribute('aria-pressed', paused); };
  const load = () => {
    if (loaded) return; loaded = true;
    /* 1080p60 on larger screens, 720p60 on phones; AV1 where the browser
       decodes it (a third smaller), H.264 everywhere else and as a fallback */
    const size = innerWidth < 900 ? '720' : '1080', base = vid.dataset.base + '-' + size;
    const av1 = vid.canPlayType('video/mp4; codecs="av01.0.09M.08"') === 'probably';
    vid.src = base + (av1 ? '-av1.mp4' : '.mp4');
    if (av1) vid.addEventListener('error', () => { vid.src = base + '.mp4'; if (!userPaused) play(); }, { once: true });
  };
  const play = () => { load(); const pr = vid.play(); if (pr) pr.catch(() => {}); };
  vid.addEventListener('play', setBtn); vid.addEventListener('pause', setBtn);
  reelBtn.addEventListener('click', () => { if (vid.paused) { userPaused = false; play(); } else { userPaused = true; vid.pause(); } });
  new IntersectionObserver(es => es.forEach(e => {
    inView = e.isIntersecting;
    if (inView) { load(); if (!userPaused) play(); } else if (!vid.paused) vid.pause();
  }), { rootMargin: '200px 0px' }).observe(reelBox);
  setBtn();
  const grow = () => {
    if (reduce) return reelBox.style.setProperty('--p', 1);
    const r = reelBox.getBoundingClientRect(), vh = innerHeight;
    reelBox.style.setProperty('--p', Math.min(1, Math.max(0, (vh - r.top) / (vh * 0.85))).toFixed(4));
  };
  addEventListener('scroll', grow, { passive: true }); addEventListener('resize', grow); grow();
}

/* about: team tabs (click, arrow keys, and hover with a mouse) */
const tm = $('#tm');
if (tm) {
  const tabs = $$('[role="tab"]', tm);
  const select = (tab, focus) => {
    tabs.forEach(t => {
      const on = t === tab;
      t.setAttribute('aria-selected', on); t.tabIndex = on ? 0 : -1;
      $('#' + t.getAttribute('aria-controls')).classList.toggle('on', on);
    });
    if (focus) tab.focus();
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => select(t));
    t.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse' && t.getAttribute('aria-selected') !== 'true') select(t); });
    t.addEventListener('keydown', e => {
      const k = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
      if (k) { e.preventDefault(); select(tabs[(i + k + tabs.length) % tabs.length], true); }
      if (e.key === 'Home') { e.preventDefault(); select(tabs[0], true); }
      if (e.key === 'End') { e.preventDefault(); select(tabs[tabs.length - 1], true); }
    });
  });
}
