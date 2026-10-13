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

/* contact page: company fields only for businesses */
$$('input[name="clienttype"]').forEach(r => r.addEventListener('change', () => {
  const biz = $('input[name="clienttype"]:checked').value === 'business';
  $$('.biz-only').forEach(el => { el.hidden = !biz; });
}));

/* forms: this is a concept, so nothing is sent */
$$('form[data-concept]').forEach(f => f.addEventListener('submit', e => {
  e.preventDefault();
  const ok = $('.ok', f);
  const bad = $$('[required]', f).find(i => (i.type === 'checkbox' ? !i.checked : !i.value.trim()) || !i.checkValidity());
  if (bad) {
    const name = (f.querySelector(`label[for="${bad.id}"]`)?.textContent || 'this field').replace(/\s*\(.*\)\s*/, '').trim();
    ok.textContent = bad.type === 'email' ? 'Please enter a valid email address so we can reach you.' : bad.type === 'checkbox' ? 'Please tick the box so we may contact you about this request.' : `Please fill in: ${name}.`;
    ok.classList.add('show'); bad.focus(); return;
  }
  ok.textContent = f.dataset.concept;
  ok.classList.add('show');
}));

/* showreel: expands with scroll, loads when near, plays only in view */
const reelBox = $('#reelBox'), vid = $('#reelVid'), reelBtn = $('#reelBtn');
if (reelBox && vid) {
  let userPaused = reduce, loaded = false, inView = false;
  const setBtn = () => { const paused = vid.paused; reelBtn.textContent = paused ? 'Play' : 'Pause'; reelBtn.setAttribute('aria-pressed', paused); };
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
