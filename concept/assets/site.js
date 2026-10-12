document.documentElement.classList.add('js');
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* header: solid once scrolled, hides on the way down, back on the way up */
const hdr = $('#hdr'); let lastY = scrollY;
addEventListener('scroll', () => {
  const y = scrollY;
  hdr.classList.toggle('solid', y > 40);
  hdr.classList.toggle('hide', y > 400 && y > lastY && !document.body.classList.contains('menu-open'));
  lastY = y;
}, { passive: true });

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
