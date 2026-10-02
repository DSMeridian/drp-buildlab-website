/* DRP BuildLab — behaviour. Shared by every page; edit here, not per page. */
/* ══════════════════════════════════════════
   LOADER  (A11) + HERO ENTRANCE (A12)
   DOMContentLoaded, ~400ms, once per session.
══════════════════════════════════════════ */
/* The translations are a separate file per language, so they can fail to
   load on their own. A bare reference to TRANSLATIONS is then a
   ReferenceError, and it stops the rest of this script -- taking the
   reveals, the marquee, the mobile menu and the market picker with it. That
   turned one missing asset into a page that looked broken rather than a
   page that was merely untranslated. Read through here instead. */
const LANGS = () => (typeof TRANSLATIONS === 'undefined' ? {} : TRANSLATIONS);

const loaderEl = document.getElementById('loader');
let heroRevealed = false;

function revealHero(){
  if(heroRevealed) return;
  heroRevealed = true;
  document.querySelectorAll('.hl-i').forEach(el => el.classList.add('in'));
  triggerWordReveals();
}
function store(key, val){
  try{ if(val === undefined) return sessionStorage.getItem(key); sessionStorage.setItem(key, val); }
  catch(e){ return null; }
}

if(store('drp-seen')){
  // Repeat visit inside the same session — no loader at all.
  if(loaderEl) loaderEl.remove();
  revealHero();
} else {
  store('drp-seen','1');
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      if(loaderEl) loaderEl.classList.add('gone');
      revealHero();
    }, 400);
  });
}

/* ══════════════════════════════════════════
   NAV + SCROLL PROGRESS
══════════════════════════════════════════ */
const nav  = document.getElementById('nav');
const prog = document.getElementById('sprog');
window.addEventListener('scroll', ()=>{
  nav.classList.toggle('s', window.scrollY>50);
  const p = window.scrollY/(document.body.scrollHeight-window.innerHeight)*100;
  prog.style.width = p+'%';
},{passive:true});

/* ══════════════════════════════════════════
   MOBILE NAV — overlay, focus trap, Escape  (A4)
══════════════════════════════════════════ */
const navTog = document.getElementById('navTog');
const navOv  = document.getElementById('navOverlay');
let navLastFocus = null;

function navIsOpen(){ return navOv && navOv.classList.contains('on'); }
function openNav(){
  if(!navOv) return;
  navLastFocus = document.activeElement;
  navOv.classList.add('on');
  navTog.setAttribute('aria-expanded','true');
  document.body.classList.add('nav-open');
  const first = navOv.querySelector('a');
  if(first) setTimeout(()=>first.focus(), 60);
}
function closeNav(returnFocus){
  if(!navOv) return;
  navOv.classList.remove('on');
  navTog.setAttribute('aria-expanded','false');
  document.body.classList.remove('nav-open');
  if(returnFocus !== false && navLastFocus && navLastFocus.focus) navLastFocus.focus();
}
if(navTog && navOv){
  navTog.addEventListener('click', ()=>{ navIsOpen() ? closeNav() : openNav(); });
  const navX = document.getElementById('navClose');
  if(navX) navX.addEventListener('click', ()=>closeNav());
  // anchors close the overlay so the jump is visible
  navOv.addEventListener('click', e=>{ if(e.target.closest('a')) closeNav(false); });
  document.addEventListener('keydown', e=>{
    if(!navIsOpen()) return;
    if(e.key === 'Escape'){ e.preventDefault(); closeNav(); return; }
    if(e.key !== 'Tab') return;
    const f = [navTog].concat(navX ? [navX] : []).concat(Array.prototype.slice.call(navOv.querySelectorAll('a')));
    const i = f.indexOf(document.activeElement);
    if(e.shiftKey){ if(i <= 0){ e.preventDefault(); f[f.length-1].focus(); } }
    else if(i === f.length-1){ e.preventDefault(); f[0].focus(); }
  });
  window.addEventListener('resize', ()=>{ if(window.innerWidth > 980 && navIsOpen()) closeNav(false); });
}

/* ══════════════════════════════════════════
   CURRENT PAGE — mark the nav link for the page we are on
══════════════════════════════════════════ */
const thisPage = document.body.dataset.page || 'home';
document.querySelectorAll('[data-nav]').forEach(a=>{
  a.classList.toggle('active', a.dataset.nav === thisPage);
});

/* ══════════════════════════════════════════
   REVEAL ON SCROLL
══════════════════════════════════════════ */
const rvIO = new IntersectionObserver(entries=>{
  entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('vv'); rvIO.unobserve(e.target); }});
},{threshold:.07,rootMargin:'0px 0px -40px 0px'});
document.querySelectorAll('.rv').forEach(el=>rvIO.observe(el));

/* ══════════════════════════════════════════
   WORD REVEAL on .sh headings
══════════════════════════════════════════ */
function triggerWordReveals(){
  document.querySelectorAll('.sh').forEach(el=>{
    // Already processed?
    if(el.dataset.wr) return;
    el.dataset.wr='1';
    // Split HTML preserving <br> and <em>
    const html = el.innerHTML;
    const parts = html.split(/(<br\s*\/?>|<em>[\s\S]*?<\/em>)/gi);
    el.innerHTML = parts.map(p=>{
      if(/^<br/i.test(p)) return p;
      if(/^<em/i.test(p)){
        // wrap inner words of em
        const inner = p.replace(/<em>([\s\S]*?)<\/em>/i,(_,t)=>{
          return '<em>'+wrapWords(t)+'</em>';
        });
        return inner;
      }
      return wrapWords(p);
    }).join('');
    // Observe
    const wIO = new IntersectionObserver(entries=>{
      entries.forEach(e=>{
        if(!e.isIntersecting) return;
        e.target.querySelectorAll('.wr').forEach((w,i)=>{
          setTimeout(()=>w.classList.add('in'), i*60);
        });
        wIO.unobserve(e.target);
      });
    },{threshold:.18});
    wIO.observe(el);
  });
}
/* A figure and the currency symbol beside it count as one word here.
 *
 * French and Spanish write "0 €" with a space between them. Splitting on
 * whitespace put the digits and the symbol into separate text nodes, and the
 * converter matches an amount inside a single node -- so /ch/, /mx/ and /cl/
 * kept a stray euro sign in one heading while every other figure on the page
 * converted. Symbol-first languages were never affected: "€0" has no space
 * and was already one token.
 *
 * The pattern sits inside the function on purpose: wrapWords runs from
 * revealHero at the top of this file, and a module-level const further down
 * is still in its temporal dead zone at that point -- which threw
 * "Cannot access 'WORD' before initialization" and took the rest of app.js
 * with it on twenty of twenty-one markets. */
function wrapWords(str){
  return str.replace(/\d[\d.,   ]*\s?[€$£]|[^\s]+/g,
    w=>`<span class="wr-w"><span class="wr">${w}</span></span>`);
}
// Re-run after DOM ready for below-fold headings
document.addEventListener('DOMContentLoaded', triggerWordReveals);

/* ══════════════════════════════════════════
   HERO — scale down slightly on scroll
══════════════════════════════════════════ */
const heroH1 = document.getElementById('heroH1');
const hlogomark = document.getElementById('hlogomark');
window.addEventListener('scroll',()=>{
  const y = window.scrollY;
  const vh = window.innerHeight;
  const p = Math.min(y/vh,1);
  if(heroH1){
    heroH1.style.transform = `scale(${1 + p*0.06}) translateY(${p * -30}px)`;
    heroH1.style.opacity   = 1 - p*1.4;
  }
  if(hlogomark){
    hlogomark.style.transform = `translateY(calc(-50% + ${y*0.2}px))`;
    hlogomark.style.opacity = 1 - p*2;
  }
},{passive:true});

/* ══════════════════════════════════════════
   ANNOTATION RAIL — the folio in the left gutter
══════════════════════════════════════════ */
/* A second plane, moving at about a tenth of the page's speed.
 *
 * The strip holds every section label in document order and translates so
 * that a label sits exactly on the playhead for the whole time you are in
 * that section. Labels are spaced evenly and the translation between two of
 * them is linear, so the strip runs faster through a long section than a
 * short one -- the rail's speed is telling you how much of this section is
 * left, which is the thing a slow plane is for.
 *
 * Even spacing rather than true document positions, which is what this did
 * first. Sections cluster in the middle of a page -- on the home page the
 * hero, the marquee and the pinned statistic take the first 37% with no
 * section in them -- so a faithful map squeezed all four labels into a third
 * of the rail and they overlapped into one unreadable column, with 03 buried
 * under the tail of 02. Position is even; only the timing follows the
 * document, and the timing is the part that has to be true.
 *
 * Labels are read from the .stag elements themselves rather than from new
 * translation keys. Those tags are the section headings, they are already
 * translated into all ten languages, and reading them means a rail label can
 * never drift from the heading it names. It also means this works on any
 * page, in any language, with nothing to configure -- and does not appear at
 * all on /contact, which has no .stag and needs no folio.
 *
 * Positions come from the offsetTop chain, not getBoundingClientRect: every
 * .stag sits inside a .rv, which is translated 32px down until it reveals,
 * so measuring the rendered box would place each label a section-reveal out
 * of true. offsetTop is layout position and ignores transforms.
 *
 * Nothing here is interactive and it is aria-hidden. The nav navigates; this
 * says where you are. Adding a second menu that reads out the same headings
 * to a screen reader would be noise, not access.
 */
(function annotationRail(){
  if(!window.matchMedia) return;
  const wide  = window.matchMedia('(min-width:1280px)');
  const still = window.matchMedia('(prefers-reduced-motion: reduce)');
  /* All of it is movement; with the movement gone there is nothing left worth
     showing, so it is never built rather than built and frozen. */
  if(still.matches || !wide.matches) return;

  const tags = Array.prototype.slice.call(document.querySelectorAll('.stag'));
  if(tags.length < 2) return;

  function div(cls){ const d=document.createElement('div'); d.className=cls; return d; }

  const rail  = div('arail');
  rail.setAttribute('aria-hidden','true');
  const strip = div('arail-strip');
  const items = div('arail-items');

  const entries = tags.map(function(tag,i){
    const el = div('arail-i');
    const n  = document.createElement('i');
    n.textContent = ('0'+(i+1)).slice(-2);
    const b  = document.createElement('b');
    b.textContent = tag.textContent.trim();
    el.appendChild(n); el.appendChild(b);
    items.appendChild(el);
    return { el:el, src:tag, b:b, at:0, y:0 };
  });

  strip.appendChild(items);
  rail.appendChild(div('arail-line'));
  rail.appendChild(strip);
  rail.appendChild(div('arail-mark'));   // last, so the playhead sits on top
  document.body.appendChild(rail);

  function docTop(el){
    let y = 0, n = el;
    while(n){ y += n.offsetTop; n = n.offsetParent; }
    return y;
  }

  let gap = 0, head = 0, docMax = 1, start = 0, stop = Infinity, active = -1, ready = false;
  let darkAt = [], markY = 0, onDark = null;

  function measure(){
    const railH = rail.clientHeight;
    if(!railH){ ready = false; return; }            // hidden below 1280px
    const vh = window.innerHeight;
    docMax = Math.max(1, document.documentElement.scrollHeight - vh);

    /* Spacing is set by the longest label actually rendered, not by a guess:
       Polish sets 'Najczestciej zadawane pytania' 223px long where Japanese
       sets three glyphs in 54px, and a fixed gap either overlaps the one or
       strands the other. */
    let tallest = 0;
    entries.forEach(function(en){ tallest = Math.max(tallest, en.el.offsetHeight); });
    gap  = Math.max(120, tallest + 26);
    head = railH * 0.6;

    entries.forEach(function(en,i){
      en.y = head + i*gap;
      en.el.style.top = en.y.toFixed(1) + 'px';
      en.at = Math.min(1, Math.max(0, (docTop(en.src) - vh*0.4) / docMax));
    });

    /* The floor matters as much as the lead-in. On /prijzen and /over-ons the
       first section tag is only ~550px down, so a fixed lead-in put start at a
       negative scroll position and the rail was already lit at the top of the
       page -- over the page header, which is the one screen it should stay out
       of. Whichever is later wins: past the first screen, and near the first
       thing it can name. */
    start = Math.max(vh*0.6, docTop(entries[0].src) - vh*0.5);
    /* Visible until the closing pitch. The hero and the pinned statistic each
       own their screen -- the statistic has its own corner labels and does not
       want a second set beside them -- and the footer is dark, where a hairline
       in --line is invisible anyway. */
    const tail = document.querySelector('.ctastrip') || document.querySelector('footer');
    stop = tail ? docTop(tail) - vh*0.55 : Infinity;

    /* Where the dark sections start and end, in document coordinates, so the
       rail can invert while one is behind it -- its labels are drawn in ink
       and vanish against near-black. Measured here rather than hit-tested per
       frame: elementFromPoint on every scroll costs a layout flush.

       The pinned figures are the exception worth naming: .dark sits on the
       sticky child, which is one screen tall, while the dark is on screen for
       the whole 220vh section it is pinned inside. The section is the range. */
    darkAt = Array.prototype.map.call(document.querySelectorAll('.dark'), function(el){
      const top = docTop(el);
      return [top, top + el.offsetHeight];
    });
    markY = rail.getBoundingClientRect().top + head;   // playhead, in the viewport
    ready = true;
  }

  /* Where the strip has to sit for the right label to be on the playhead.
     Piecewise-linear through the section anchors, with a lead in and out so
     the plane is already moving before the first label and after the last. */
  function stripY(s){
    const n = entries.length;
    const edge = gap * 0.6;
    let target;
    if(s <= entries[0].at){
      const span = entries[0].at;
      const f = span ? s/span : 1;
      target = entries[0].y - edge*(1-f);
    } else if(s >= entries[n-1].at){
      const span = 1 - entries[n-1].at;
      const f = span ? (s - entries[n-1].at)/span : 0;
      target = entries[n-1].y + edge*f;
    } else {
      let i = 0;
      while(i < n-2 && s > entries[i+1].at) i++;
      const span = entries[i+1].at - entries[i].at;
      const f = span ? (s - entries[i].at)/span : 0;
      target = entries[i].y + f*(entries[i+1].y - entries[i].y);
    }
    return head - target;
  }

  let queued = false;
  function paint(){
    queued = false;
    if(!ready) return;
    const y = window.scrollY;
    const s = Math.min(1, Math.max(0, y / docMax));
    items.style.transform = 'translateY(' + stripY(s).toFixed(2) + 'px)';

    let idx = 0;
    for(let i=0;i<entries.length;i++) if(s >= entries[i].at) idx = i;
    if(idx !== active){
      if(entries[active]) entries[active].el.classList.remove('on');
      entries[idx].el.classList.add('on');
      active = idx;
    }
    rail.classList.toggle('on', y > start && y < stop);

    const mark = y + markY;
    let dark = false;
    for(let i=0;i<darkAt.length;i++) if(mark >= darkAt[i][0] && mark <= darkAt[i][1]){ dark = true; break; }
    if(dark !== onDark){ rail.classList.toggle('on-dark', dark); onDark = dark; }
  }
  let pending;
  function remeasure(){
    clearTimeout(pending);
    pending = setTimeout(function(){ measure(); paint(); }, 120);
  }

  window.addEventListener('scroll', function(){
    if(!queued){ queued = true; requestAnimationFrame(paint); }
  }, {passive:true});
  window.addEventListener('resize', remeasure);
  window.addEventListener('load', remeasure);
  /* A language change rewrites the tags and reflows the page, so both the
     text and every mapped position have to be read again. */
  document.addEventListener('drp:langapplied', function(){
    entries.forEach(function(en){ en.b.textContent = en.src.textContent.trim(); });
    remeasure();
  });

  measure(); paint();
})();

/* ══════════════════════════════════════════
   MAGNETIC BUTTONS
══════════════════════════════════════════ */
document.querySelectorAll('.mag').forEach(el=>{
  el.addEventListener('mousemove', e=>{
    const r = el.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width/2);
    const dy = e.clientY - (r.top  + r.height/2);
    el.style.transform = `translate(${dx*.18}px,${dy*.22}px)`;
  });
  el.addEventListener('mouseleave',()=>{ el.style.transform=''; });
});

/* ══════════════════════════════════════════
   NUMBER COUNTERS
══════════════════════════════════════════ */
const cntIO = new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(!e.isIntersecting) return;
    const el = e.target;
    const raw = parseInt(el.dataset.count)||0;
    const prefix = el.dataset.prefix||'';
    const suffix = el.dataset.suffix||'';
    if(raw===0){ cntIO.unobserve(el); return; }
    /* A euro counter counts towards the converted figure and is written with
       the visitor's own grouping and symbol placement, not prefix+digits --
       "Rp 10.258.941", not "€10258941". formatAmount returns null for euro
       visitors, which keeps the original behaviour. */
    const L = window.DRP_LOCALE;
    const isMoney = prefix.indexOf('€') !== -1;
    const target = (isMoney && L && L.convertAmount) ? L.convertAmount(raw) : raw;
    const paint = n => (isMoney && L && L.formatAmount && L.formatAmount(n))
      || (prefix+n+suffix);
    let start=null;
    const run=ts=>{
      if(!start) start=ts;
      const p=Math.min((ts-start)/1300,1);
      const ease=1-Math.pow(1-p,3);
      el.textContent = paint(Math.round(ease*target));
      // Marks it as settled so a later rate change can correct the total.
      if(p>=1) el.dataset.counted='1';
      if(p<1) requestAnimationFrame(run);
    };
    requestAnimationFrame(run);
    cntIO.unobserve(el);
  });
},{threshold:.5});
document.querySelectorAll('[data-count]').forEach(el=>cntIO.observe(el));

/* ══════════════════════════════════════════
   CONTACT FORM — Netlify Forms (AJAX submit)
   Submissions arrive at info@drpbuildlab.com
══════════════════════════════════════════ */
/* The conversion signal, for whatever the tag manager wants to do with it.
 *
 * Fired on the 2xx and nowhere else. There is no thank-you page to trigger on
 * -- the success panel replaces the form in place -- and GTM's built-in form
 * trigger fires on the attempt, which would have counted every failed send as
 * a lead.
 *
 * No field values travel. The form carries a first name, a surname, a company,
 * an email, a phone number and a free-text message; putting any of that in a
 * dataLayer push would turn an analytics tool into a processor of personal
 * data, with a lawful basis nobody has thought about. What goes is which of
 * six fixed options was chosen, plus the market and language, none of which
 * identifies anybody.
 *
 * As a slug rather than the option's own text: the labels are translated, so
 * the raw value would report one choice under ten different names and the
 * report would be useless across twenty-one markets. The index is stable
 * because f.sel has the same order in every language. */
const DEMO_SERVICE = ['none','starter','custom','update','extras','undecided'];

/* The partner application's signal. Same rule as pushDemoRequest below it:
 * nothing that identifies anybody. A name, an email and a profile URL are all
 * on that form and none of them travel -- what goes is which channel and
 * which audience bracket was picked, by index, because the labels are
 * translated and the raw text would report one choice under two names. */
const PARTNER_CHANNEL = ['none','instagram','tiktok','youtube','linkedin','newsletter','offline','other'];

function pushPartnerRequest(){
  const ch = document.getElementById('pa-kanaal');
  const reach = document.getElementById('pa-bereik');
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: 'partner_request',
    partner_channel: PARTNER_CHANNEL[ch ? ch.selectedIndex : -1] || 'unknown',
    partner_reach: reach && reach.selectedIndex > 0 ? reach.selectedIndex : 0,
    demo_market: window.__DRP_MARKET__ || '',
    demo_language: document.documentElement.lang || '',
  });
}

function pushDemoRequest(){
  const sel = document.getElementById('f-pakket');
  const i = sel ? sel.selectedIndex : -1;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: 'demo_request',
    demo_service: DEMO_SERVICE[i] || 'unknown',
    demo_market: window.__DRP_MARKET__ || '',
    demo_language: document.documentElement.lang || '',
  });
}

/* Post a Netlify form over fetch and swap in the success panel, or put the
 * error box up and give the button back. Two forms use this now -- the demo
 * request on /contact and the partner application on /partner-worden -- and
 * the behaviour has to be the same for both: a form that silently succeeded
 * on a 500 would lose a lead on one page and a partner on the other. */
function wireAjaxForm(o){
  const form = document.getElementById(o.form);
  if(!form) return;
  const errBox = document.getElementById(o.err);
  const submitBtn = document.getElementById(o.btn);
  form.addEventListener('submit', function(e){
    e.preventDefault();
    if(errBox) errBox.classList.remove('on');
    if(submitBtn) submitBtn.disabled = true;
    const data = new FormData(form);
    /* Post to this page's own path, not '/'. The root carries 34 forced
       geo redirects (302!, one per market), and a 302 on a POST turns it
       into a GET -- the submission is lost, and the 2xx that comes back
       says nothing about whether it was ever recorded. The form's own
       page has no redirect on it. */
    fetch(location.pathname, {method:'POST', headers:{'Content-Type':'application/x-www-form-urlencoded'},
      body: new URLSearchParams(data).toString()
    })
    .then(res=>{
      // fetch resolves on 404/500 too — only 2xx counts as delivered
      if(!res.ok) throw new Error('HTTP '+res.status);
      form.style.display = 'none';
      const succ = document.getElementById(o.succ);
      if(succ) succ.classList.add('on');
      if(o.sent) o.sent();
    })
    .catch(()=>{
      if(submitBtn) submitBtn.disabled = false;
      if(errBox){
        errBox.classList.add('on');
        errBox.scrollIntoView({block:'nearest', behavior:'smooth'});
      }
    });
  });
}

/* Business or private person on the quote form. The company fields show
 * only for a business, and are disabled rather than just hidden otherwise:
 * a disabled field is left out of FormData, so a company name typed before
 * switching to "private" does not reach the client zone as a business. */
(function wireClientKind(){
  const form = document.getElementById('formWrap');
  const biz = document.getElementById('fBiz');
  if(!form || !biz) return;
  const sync = () => {
    const picked = form.querySelector('input[name="klanttype"]:checked');
    const isBiz = !!picked && picked.value === 'bedrijf';
    biz.hidden = !isBiz;
    biz.querySelectorAll('input').forEach(i => { i.disabled = !isBiz; });
  };
  form.querySelectorAll('input[name="klanttype"]').forEach(r => r.addEventListener('change', sync));
  sync();
})();

wireAjaxForm({form:'formWrap', err:'ferr', succ:'succ', btn:'fSubmitBtn', sent:pushDemoRequest});
wireAjaxForm({form:'partnerForm', err:'paErr', succ:'paSucc', btn:'paSubmitBtn', sent:pushPartnerRequest});


function qs(sel){return document.querySelector(sel)}
function qsa(sel){return document.querySelectorAll(sel)}

function resetSh(el){
  if(!el) return;
  delete el.dataset.wr;
  el.querySelectorAll('.wr-w').forEach(w=>{
    const inner=w.querySelector('.wr');
    const frag=document.createDocumentFragment();
    if(inner) inner.childNodes.forEach(n=>frag.appendChild(n.cloneNode(true)));
    w.replaceWith(frag);
  });
}

/* Plus Jakarta Sans ships latin/latin-ext/vietnamese/cyrillic-ext only, so a
   language needing other glyphs would silently fall back to a system font --
   wrong weights, wrong metrics, broken typography.

   The table lives in markets.js because the generator needs it too:
   build-locales.js writes the stylesheet link and the font rule straight
   into each generated page, so the first paint is already correct. This is
   the runtime path for a page that was not generated, and the belt-and-braces
   for a language change that never happens now the picker navigates. */
const WEBFONTS=(window.DRP_MARKETS&&window.DRP_MARKETS.__webfonts)||{};
const webfontsLoaded=new Set();
function ensureWebFont(lang){
  const wf=WEBFONTS[lang];
  if(!wf){
    // Switching back to nl/en/fr/es/de/id after a language that needed an
    // extra font: clear the inline override rather than leaving Noto set.
    document.body.style.removeProperty('font-family');
    return;
  }
  if(!webfontsLoaded.has(lang)){
    webfontsLoaded.add(lang);
    // The generated page already declares this link. Adding a second one
    // would re-request the same stylesheet on every market that needs it.
    if(!document.querySelector('link[rel="stylesheet"][href="'+wf.href+'"]')){
      const link=document.createElement('link');
      link.rel='stylesheet';
      link.href=wf.href;
      document.head.appendChild(link);
    }
  }
  document.body.style.setProperty('font-family',
    "'Plus Jakarta Sans','"+wf.family+"',sans-serif");
}

function applyLang(lang,persist){
  const t=LANGS()[lang]; if(!t) return;
  document.documentElement.lang=lang;
  /* dir follows lang. The generated page already carries it; this is for a
     page that swaps language in place, where a dir="rtl" left behind after
     leaving Arabic would mirror a Latin layout. Removed rather than set to
     "ltr", so left-to-right pages stay exactly as they were. */
  if(((window.DRP_MARKETS&&window.DRP_MARKETS.__rtl)||[]).includes(lang)) document.documentElement.setAttribute('dir','rtl');
  else document.documentElement.removeAttribute('dir');
  ensureWebFont(lang);
  const pg=document.body.dataset.page||'home';
  document.title=t['meta.title.'+pg]||t['meta.title'];
  const md=qs('meta[name="description"]');
  if(md) md.setAttribute('content',t['meta.desc.'+pg]||t['meta.desc']);
  const ld=qs('.ld-name'); if(ld) ld.textContent=t['loader'];
  const NAVKEYS={home:'nav.home',about:'nav.about',pricing:'nav.pricing',contact:'nav.contact',cta:'nav.cta',partner:'nav.partner'};
  qsa('[data-nav]').forEach(el=>{ const k=NAVKEYS[el.dataset.nav]; if(k&&t[k]) el.textContent=t[k]; });
  /* The menu's group headings. "Volg ons" is the social section's own key, so
     only the word "Menu" needed adding. */
  const GROUPKEYS={menu:'nav.menu',social:'soc.tag'};
  qsa('[data-navgroup]').forEach(el=>{ const k=GROUPKEYS[el.dataset.navgroup]; if(k&&t[k]) el.textContent=t[k]; });
  const ph=qs('.phero');
  if(ph){
    const phh=ph.querySelector('.phero-h1'); if(phh&&t['phero.'+pg+'.h']){resetSh(phh);phh.innerHTML=t['phero.'+pg+'.h'];}
    const ps=ph.querySelector('.phero-sub'); if(ps&&t['phero.'+pg+'.sub']) ps.innerHTML=t['phero.'+pg+'.sub'];
  }
  const cta=qs('.ctastrip');
  if(cta){
    const ch2=cta.querySelector('.sh'); if(ch2){resetSh(ch2);ch2.innerHTML=t['cta.h'];}
    const cs2=cta.querySelector('.ssub'); if(cs2) cs2.textContent=t['cta.sub'];
    const cb=cta.querySelector('.btn'); if(cb) cb.textContent=t['cta.btn'];
  }
  /* Same copy as the closing strip: it is the same offer, four screens
     earlier, and reusing the key means no eleventh translation to review. */
  const oact=qs('.opp-act'); if(oact) oact.textContent=t['cta.btn'];
  const h1=document.getElementById('heroH1');
  if(h1){
    /* Newlines between the lines: each .hl is its own block, so they change
       nothing on screen, but without them the three lines run together as one
       word for anything reading the text -- "We take careof youronline". */
    h1.innerHTML=`<span class="hl"><span class="hl-i">${t['hero.l1']}</span></span>\n<span class="hl"><span class="hl-i d1">${t['hero.l2']}</span></span>\n<span class="hl"><span class="hl-i d2">${t['hero.l3']}</span></span>`;
    // only animate once the loader is out of the way (A12)
    if(heroRevealed) h1.querySelectorAll('.hl-i').forEach(el=>el.classList.add('in'));
  }
  const hb=qsa('.hero-acts .btn'); if(hb[0]) hb[0].textContent=t['hero.cta1']; if(hb[1]) hb[1].textContent=t['hero.cta2'];
  const sh=qs('.shint span'); if(sh) sh.textContent=t['hero.scroll'];
  /* The same five claims, now the ticked row under the headline -- and,
     since the editorial rebuild reached the inner pages, under the three
     page headers as well. Filled by class rather than by the hero's id:
     it is one object fed by one key, on whichever pages carry it. */
  if(t['mq']){
    const row=t['mq'].map(i=>`<li>${i}</li>`).join('');
    qsa('.trust').forEach(el=>{el.innerHTML=row;});
  }
  /* ── The partner programme ────────────────────────────────────────────
     Published in Dutch and English only, so every key below is absent in the
     other ten languages and every lookup is guarded. A market that does not
     have the page never loads it, but a reader can still switch language on
     a market that has two -- and when the string is missing the page keeps
     the words it was prerendered with rather than emptying itself. */
  const pah=document.getElementById('partner-how');
  if(pah){
    const pt=pah.querySelector('.stag'); if(pt&&t['pa.how.tag']) pt.textContent=t['pa.how.tag'];
    const ph2=pah.querySelector('.sh'); if(ph2&&t['pa.how.h2']){resetSh(ph2);ph2.innerHTML=t['pa.how.h2'];}
    const ps2=pah.querySelector('.ssub'); if(ps2&&t['pa.how.sub']) ps2.textContent=t['pa.how.sub'];
    const pr=pah.querySelectorAll('.srow');
    (t['pa.how.steps']||[]).forEach((st,i)=>{
      if(!pr[i]) return;
      const a=pr[i].querySelector('.stitle'); if(a) a.textContent=st.t;
      const b=pr[i].querySelector('.stxt');   if(b) b.textContent=st.b;
      const c=pr[i].querySelector('.stime');  if(c) c.textContent=st.d;
    });
  }
  const pat=document.getElementById('partner-terms');
  if(pat){
    const tt=pat.querySelector('.stag'); if(tt&&t['pa.terms.tag']) tt.textContent=t['pa.terms.tag'];
    const th=pat.querySelector('.sh'); if(th&&t['pa.terms.h2']){resetSh(th);th.innerHTML=t['pa.terms.h2'];}
    const tr=pat.querySelectorAll('.term');
    (t['pa.terms.rows']||[]).forEach((row,i)=>{
      if(!tr[i]) return;
      const n=tr[i].querySelector('.term-n'); if(n) n.textContent=row[0];
      const v=tr[i].querySelector('.term-v'); if(v) v.textContent=row[1];
    });
  }
  const paa=document.getElementById('partner-apply');
  if(paa){
    const at2=paa.querySelector('.stag'); if(at2&&t['pa.apply.tag']) at2.textContent=t['pa.apply.tag'];
    const ah2=paa.querySelector('.sh'); if(ah2&&t['pa.apply.h2']){resetSh(ah2);ah2.innerHTML=t['pa.apply.h2'];}
    const al=paa.querySelector('.ct-lede'); if(al&&t['pa.apply.sub']) al.textContent=t['pa.apply.sub'];
    /* The two notes beside the form, label over value. */
    const lbl=paa.querySelectorAll('.ci-lbl'), val=paa.querySelectorAll('.ci-val');
    (t['pa.apply.notes']||[]).forEach((n,i)=>{
      if(lbl[i]) lbl[i].textContent=n[0];
      /* The first carries a mailto; only the second is plain text. */
      if(val[i]&&!val[i].querySelector('a')) val[i].textContent=n[1];
    });
    /* The form. Labels by id, so reordering the fields cannot silently
       re-label them the way an index would. */
    const F={'pa-vnaam':'pa.f.first','pa-anaam':'pa.f.last','pa-email':'pa.f.email',
             'pa-kanaal':'pa.f.channel','pa-profiel':'pa.f.profile','pa-bereik':'pa.f.reach',
             'pa-code':'pa.f.code','pa-bericht':'pa.f.msg'};
    Object.keys(F).forEach(id=>{
      const k=t[F[id]]; if(!k) return;
      const l=paa.querySelector('label[for="'+id+'"]'); if(l) l.textContent=k;
    });
    const P={'pa-vnaam':'pa.p.first','pa-anaam':'pa.p.last','pa-email':'pa.p.email',
             'pa-profiel':'pa.p.profile','pa-code':'pa.p.code','pa-bericht':'pa.p.msg'};
    Object.keys(P).forEach(id=>{
      const k=t[P[id]]; if(!k) return;
      const el=document.getElementById(id); if(el) el.placeholder=k;
    });
    const chan=document.getElementById('pa-kanaal');
    if(chan&&t['pa.sel.channel']) t['pa.sel.channel'].forEach((o,i)=>{ if(chan.options[i]) chan.options[i].textContent=o; });
    const reach=document.getElementById('pa-bereik');
    if(reach&&t['pa.sel.reach']) t['pa.sel.reach'].forEach((o,i)=>{ if(reach.options[i]) reach.options[i].textContent=o; });
    const pc=document.getElementById('paConsentLbl'); if(pc&&t['pa.f.consent']) pc.textContent=t['pa.f.consent'];
    const pb=document.getElementById('paSubmitBtn'); if(pb&&t['pa.f.submit']) pb.textContent=t['pa.f.submit'];
    const pet=document.getElementById('paErrT'); if(pet&&t['pa.err.h']) pet.textContent=t['pa.err.h'];
    const peb=document.getElementById('paErrB'); if(peb&&t['pa.err.p']) peb.innerHTML=t['pa.err.p'];
    const psh=paa.querySelector('.succ h3'); if(psh&&t['pa.succ.h']) psh.textContent=t['pa.succ.h'];
    const psp=paa.querySelector('.succ p');  if(psp&&t['pa.succ.p']) psp.textContent=t['pa.succ.p'];
  }
  const paf=document.getElementById('partner-faq');
  if(paf){
    const ft2=paf.querySelector('.stag'); if(ft2&&t['pa.faq.tag']) ft2.textContent=t['pa.faq.tag'];
    const fh2=paf.querySelector('.sh'); if(fh2&&t['pa.faq.h2']){resetSh(fh2);fh2.innerHTML=t['pa.faq.h2'];}
    const fd2=paf.querySelectorAll('details');
    (t['pa.faq.items']||[]).forEach((item,i)=>{
      if(!fd2[i]) return;
      const sm=fd2[i].querySelector('summary'); if(sm) sm.textContent=item.q;
      const ap=fd2[i].querySelector('p');       if(ap) ap.innerHTML=item.a;
    });
  }

  /* ── The referred visitor's note on the quote form ─────────────────────
     Shown only when there is a code AND this language has the string. The
     field beside it is filled by referral.js regardless, so a market without
     the copy still attributes the referral -- it just does not announce it.
     Hidden again on a language switch that has no string, or the reader
     would be left with a sentence in the wrong language.

     The note still earns its place now that the field is visible: the field
     shows a code, this says what the code does. */
  /* Built as nodes rather than by concatenating the code into innerHTML.
     The code is still the validated one from referral.js, so the old string
     version was not exploitable -- but it was only not exploitable because
     of a regex in a different file, and the value originates in a query
     string. Anyone loosening that pattern would have turned a copy change
     into stored XSS with nothing here to warn them. textContent cannot be
     talked into parsing markup, so the guarantee now lives at the sink. */
  const rnote=document.getElementById('refNote');
  if(rnote){
    const rcode=window.__DRP_REF__;
    if(rcode&&t['ref.applied']){
      const parts=t['ref.applied'].split('{code}');
      rnote.textContent='';
      parts.forEach((part,i)=>{
        if(i){ const b=document.createElement('strong'); b.textContent=rcode; rnote.appendChild(b); }
        /* The copy around the code is ours, from i18n.js, and carries inline
           markup in some languages -- so it is still parsed as HTML. Only the
           code is treated as text, because only the code comes from outside. */
        if(part){ const span=document.createElement('span'); span.innerHTML=part; rnote.appendChild(span); }
      });
      rnote.hidden=false;
    }else{
      rnote.hidden=true;
    }
  }
  const how=document.getElementById('hoe-het-werkt');
  if(how){
    const ht=how.querySelector('.stag'); if(ht) ht.textContent=t['how.tag'];
    const hh=how.querySelector('.sh'); if(hh){resetSh(hh);hh.innerHTML=t['how.h2'];}
    const hsu=how.querySelector('.ssub'); if(hsu) hsu.textContent=t['how.sub'];
    const sr=how.querySelectorAll('.srow');
    t['how.steps'].forEach((s,i)=>{ if(!sr[i]) return; const ti=sr[i].querySelector('.stitle');if(ti)ti.textContent=s.t; const tx=sr[i].querySelector('.stxt');if(tx)tx.textContent=s.b; const td=sr[i].querySelector('.stime');if(td)td.textContent=s.d; });
  }
  const ab=document.getElementById('over-ons');
  if(ab){
    const alt=ab.querySelector('.ab-logo-tag'); if(alt) alt.textContent=t['ab.logotag'];
    const aq=ab.querySelector('.ab-quote'); if(aq) aq.innerHTML=t['ab.quote'];
    const as=ab.querySelector('.ab-sig'); if(as) as.textContent=t['ab.sig'];
    const an=ab.querySelectorAll('.abn-l'); t['ab.nums'].forEach((l,i)=>{ if(an[i]) an[i].textContent=l; });
    const at=ab.querySelector('.stag'); if(at) at.textContent=t['ab.tag'];
    const ah=ab.querySelector('.sh'); if(ah){resetSh(ah);ah.innerHTML=t['ab.h2'];}
    const ap=ab.querySelectorAll('.ab-right > p'); if(ap[0]) ap[0].innerHTML=t['ab.p1']; if(ap[1]) ap[1].innerHTML=t['ab.p2'];
    const pl=ab.querySelectorAll('.pillar'); t['ab.pillars'].forEach((p,i)=>{ if(!pl[i]) return; const pt=pl[i].querySelector('.ptitle');if(pt)pt.textContent=p.t; const pb=pl[i].querySelector('.pbody');if(pb)pb.textContent=p.b; });
  }
  /* ── The team ─────────────────────────────────────────────────────────
     Every lookup is guarded, the way the partner programme's are: the four
     entries are placeholders and were written in Dutch and English only, so
     on the other ten languages the section keeps the words it was
     prerendered with rather than emptying itself. The names are not
     translated on purpose -- a person's name is the same in every market. */
  const tmw=document.getElementById('team');
  if(tmw){
    const tt=tmw.querySelector('.stag'); if(tt&&t['team.tag']) tt.textContent=t['team.tag'];
    const th=tmw.querySelector('.sh'); if(th&&t['team.h2']){resetSh(th);th.innerHTML=t['team.h2'];}
    const ts=tmw.querySelector('.ssub'); if(ts&&t['team.sub']) ts.textContent=t['team.sub'];
    const tc=tmw.querySelectorAll('.tm');
    (t['team.members']||[]).forEach((p,i)=>{
      if(!tc[i]) return;
      const r=tc[i].querySelector('.tm-role'); if(r) r.innerHTML=p.r;
      const b=tc[i].querySelector('.tm-body'); if(b) b.innerHTML=p.b;
    });
  }
  const wy=document.getElementById('waarom');
  if(wy){
    const wt=wy.querySelector('.stag'); if(wt) wt.textContent=t['why.tag'];
    const wh=wy.querySelector('.sh'); if(wh){resetSh(wh);wh.textContent=t['why.h2'];}
    const ws=wy.querySelector('.ssub'); if(ws) ws.textContent=t['why.sub'];
    const wc=wy.querySelectorAll('.wcard'); t['why.cards'].forEach((c,i)=>{ if(!wc[i]) return; const wtt=wc[i].querySelector('.wtitle');if(wtt)wtt.textContent=c.t; const wb=wc[i].querySelector('.wbody');if(wb)wb.textContent=c.b; });
  }
  qsa('.opt-title').forEach((el,i)=>{ const p=t['opp.pts'][i]; if(p) el.textContent=p.t; });
  qsa('.opt-body').forEach((el,i)=>{ const p=t['opp.pts'][i]; if(p) el.textContent=p.b; });
  qsa('.stag').forEach(tag=>{
    const sec=tag.closest('section');
    if(!sec||!sec.querySelector('.opt')) return;
    tag.textContent=t['opp.tag'];
    const oh=sec.querySelector('.sh'); if(oh){resetSh(oh);oh.innerHTML=t['opp.h2'];}
    const os=sec.querySelector('.ssub'); if(os) os.innerHTML=t['opp.sub'];
    const bt=sec.querySelector('.opp-box>div'); if(bt) bt.textContent=t['opp.boxtitle'];
    const or=sec.querySelectorAll('.orow'); t['opp.rows'].forEach((r,i)=>{ if(!or[i]) return; const ol=or[i].querySelector('.olbl');if(ol)ol.textContent=r[0]; const ov=or[i].querySelector('.oval');if(ov)ov.textContent=r[1]; });
    const otl=sec.querySelector('.otlbl'); if(otl) otl.textContent=t['opp.totlbl'];
    const otv=sec.querySelector('.otval'); if(otv) otv.textContent=t['opp.totval'];
    const on=sec.querySelector('.onote'); if(on) on.innerHTML=t['opp.note'];
  });
  const ct=qs('.ctbl');
  if(ct){
    const cs=ct.closest('section');
    if(cs){ const cst=cs.querySelector('.stag');if(cst)cst.textContent=t['comp.tag']; const csh=cs.querySelector('.sh');if(csh){resetSh(csh);csh.innerHTML=t['comp.h2'];} const css=cs.querySelector('.ssub');if(css)css.innerHTML=t['comp.sub']; }
    const cc=ct.querySelectorAll('.chc'); t['comp.cols'].forEach((c,i)=>{ if(cc[i]) cc[i].textContent=c; });
    const cr=ct.querySelectorAll('.crow');
    t['comp.rows'].forEach((r,i)=>{ if(!cr[i]) return; const cells=cr[i].querySelectorAll('.cc'); const nm=cells[0]&&cells[0].querySelector('.cnm'); if(nm){const bdg=nm.querySelector('.cbdg'); nm.childNodes[0].textContent=r.n; if(bdg)bdg.textContent=t['comp.us'];} if(cells[1]){const cp=cells[1].querySelector('.cp');if(cp)cp.textContent=r.p;} if(cells[2]){const cp=cells[2].querySelector('.cp');if(cp)cp.textContent=r.m; const cx=cells[2].querySelector('.cx');if(cx)cx.textContent=r.m;} });
    const cn=qs('.cnote'); if(cn) cn.innerHTML=t['comp.note'];
  }
  const ad=qs('.addon');
  if(ad){
    const at=ad.querySelector('.addon-tag');if(at)at.textContent=t['addon.tag'];
    const an=ad.querySelector('.addon-n');if(an)an.textContent=t['addon.n'];
    const ab=ad.querySelector('.addon-b');if(ab)ab.textContent=t['addon.b'];
    const ao=ad.querySelector('.addon-or');if(ao)ao.textContent=t['addon.or'];
    const ap=ad.querySelectorAll('.addon-p');
    if(ap[0])ap[0].innerHTML=t['addon.pm'];
    if(ap[1])ap[1].innerHTML=t['addon.py'];
  }
  const sv=document.getElementById('diensten');
  if(sv){
    const st=sv.querySelector('.stag');if(st)st.textContent=t['srv.tag'];
    const ssh=sv.querySelector('.sh');if(ssh){resetSh(ssh);ssh.innerHTML=t['srv.h2'];}
    const ss=sv.querySelector('.ssub');if(ss)ss.innerHTML=t['srv.sub'];
    const pl=sv.querySelectorAll('.plan');
    if(pl[0]){const p=pl[0]; const pb=p.querySelector('.pbadge');if(pb)pb.textContent=t['p1.badge']; const pn=p.querySelector('.pname');if(pn)pn.textContent=t['p1.name']; const pp=p.querySelector('.pperiod');if(pp)pp.textContent=t['p1.period']; const pd=p.querySelector('p');if(pd)pd.innerHTML=t['p1.desc']; const pf=p.querySelectorAll('.pfeats li');t['p1.feats'].forEach((f,i)=>{if(pf[i])pf[i].textContent=f;}); const pbt=p.querySelector('.pbtn');if(pbt)pbt.textContent=t['p1.btn'];}
    if(pl[1]){const p=pl[1]; const pn=p.querySelector('.pname');if(pn)pn.textContent=t['p2.name']; const ppr=p.querySelector('.pprice');if(ppr)ppr.innerHTML=t['p2.price']; const pp=p.querySelector('.pperiod');if(pp)pp.textContent=t['p2.period']; const pd=p.querySelector('p');if(pd)pd.innerHTML=t['p2.desc']; const pf=p.querySelectorAll('.pfeats li');t['p2.feats'].forEach((f,i)=>{if(pf[i])pf[i].textContent=f;}); const pbt=p.querySelector('.pbtn');if(pbt)pbt.textContent=t['p2.btn'];}
    const sps=sv.querySelectorAll('p.ssub'); if(sps[1]) sps[1].innerHTML=t['srv.how'];
    const ets=sv.querySelectorAll('.stag'); if(ets[1]) ets[1].textContent=t['ex.tag'];
    const ehs=sv.querySelectorAll('.sh'); if(ehs[1]){resetSh(ehs[1]);ehs[1].innerHTML=t['ex.h3'];}
    const ess=sv.querySelectorAll('.ssub'); if(ess[2]) ess[2].textContent=t['ex.sub'];
    const ei=sv.querySelectorAll('.ex'); t['ex.items'].forEach((item,i)=>{ if(!ei[i]) return; const en=ei[i].querySelector('.ex-n');if(en)en.textContent=item.n; const ep=ei[i].querySelector('.ex-p');if(ep)ep.textContent=item.p; });
  }
  const fq=document.getElementById('faq');
  if(fq){
    const ft=fq.querySelector('.stag');if(ft)ft.textContent=t['faq.tag'];
    const fh=fq.querySelector('.sh');if(fh){resetSh(fh);fh.innerHTML=t['faq.h2'];}
    const fd=fq.querySelectorAll('details'); t['faq.items'].forEach((item,i)=>{ if(!fd[i]) return; const sm=fd[i].querySelector('summary');if(sm)sm.textContent=item.q; const ap=fd[i].querySelector('p');if(ap)ap.innerHTML=item.a; });
  }
  const so=qs('.soc-sec');
  if(so){
    const it=so.querySelector('.stag');if(it)it.textContent=t['soc.tag'];
    const ih=so.querySelector('.sh');if(ih){resetSh(ih);ih.innerHTML=t['soc.h2'];}
    const ip=so.querySelectorAll('.soc-text'); if(ip[0])ip[0].textContent=t['soc.p1']; if(ip[1])ip[1].textContent=t['soc.p2'];
    /* The three button labels are network names, the same word in every
       language, so they carry no translation key. */
  }
  const ptn=document.getElementById('partners');
  if(ptn){
    const pnt=ptn.querySelector('.stag');if(pnt)pnt.textContent=t['prt.tag'];
    const pnh=ptn.querySelector('.sh');if(pnh){resetSh(pnh);pnh.innerHTML=t['prt.h2'];}
    const pnb=ptn.querySelectorAll('.prt-b'); (t['prt.b']||[]).forEach((b,i)=>{if(pnb[i])pnb[i].textContent=b;});
    /* Partner names and taglines are printed on the images in the partners'
       own words, so they stay as they are in every language. */
  }
  const cn=document.getElementById('contact');
  if(cn){
    const ct2=cn.querySelector('.stag');if(ct2)ct2.textContent=t['ct.tag'];
    const ch=cn.querySelector('.sh');if(ch){resetSh(ch);ch.innerHTML=t['ct.h2'];}
    const cl=cn.querySelector('.ct-lede');if(cl)cl.textContent=t['ct.lede'];
    const ci=cn.querySelectorAll('.ci-lbl'); t['ct.lbls'].forEach((l,i)=>{if(ci[i])ci[i].textContent=l;});
    /* Positional, so a label added later carries data-i18n-own and is
       filled by its own key below instead of shifting every one after it. */
    const fl=cn.querySelectorAll('.field label:not([data-i18n-own])'); t['f.labels'].forEach((l,i)=>{if(fl[i])fl[i].textContent=l;});
    [['fKindLbl','f.kind'],['fKindBiz','f.kind.biz'],['fKindPriv','f.kind.priv'],['fKboLbl','f.kbo']].forEach(([id,k])=>{
      const el=document.getElementById(id); if(el&&t[k]) el.textContent=t[k];
    });
    const fk=document.getElementById('f-kbo');if(fk&&t['f.kbo.ph'])fk.placeholder=t['f.kbo.ph'];
    const ph=t['f.phs'];
    const fv=document.getElementById('f-vnaam');if(fv)fv.placeholder=ph[0];
    const fa=document.getElementById('f-anaam');if(fa)fa.placeholder=ph[1];
    const fb=document.getElementById('f-bedrijf');if(fb)fb.placeholder=ph[2];
    const ft2=document.getElementById('f-tel');if(ft2)ft2.placeholder=ph[3];
    const fe=document.getElementById('f-email');if(fe)fe.placeholder=ph[4];
    const fm=document.getElementById('f-bericht');if(fm)fm.placeholder=ph[5];
    /* The partner code's placeholder is ph[6] rather than its position in the
       form, because f.phs is indexed explicitly here and the select has none.
       Its label comes from f.labels like every other field -- that array is
       positional and does include an entry for it, at index 6. */
    const fr2=document.getElementById('f-ref');if(fr2)fr2.placeholder=ph[6];
    const fsl=document.getElementById('f-pakket');
    if(fsl){ const op=fsl.querySelectorAll('option'); t['f.sel'].forEach((o,i)=>{if(op[i])op[i].textContent=o;}); }
    const fcl=document.getElementById('fConsentLbl');if(fcl)fcl.textContent=t['f.consent'];
    const fet=document.getElementById('ferrT');if(fet)fet.textContent=t['f.err.h'];
    const feb=document.getElementById('ferrB');if(feb)feb.innerHTML=t['f.err.p'];
    const fsb=document.getElementById('fSubmitBtn');if(fsb)fsb.textContent=t['f.btn'];
    const sh2=cn.querySelector('.succ h3');if(sh2)sh2.textContent=t['f.succ.h'];
    const sp=cn.querySelector('.succ p');if(sp)sp.textContent=t['f.succ.p'];
  }
  const footer=qs('footer');
  if(footer){
    const ftag=footer.querySelector('.ft-tag');if(ftag)ftag.textContent=t['ft.tag'];
    const fcols=footer.querySelectorAll('.ft-col');
    if(fcols[0]){ const h4=fcols[0].querySelector('h4');if(h4)h4.textContent=t['ft.nav'][0]; const as=fcols[0].querySelectorAll('a'); [1,2,3,4].forEach((k,i)=>{if(as[i])as[i].textContent=t['ft.nav'][k];}); }
    if(fcols[1]){ const h4=fcols[1].querySelector('h4');if(h4)h4.textContent=t['ft.ct']; }
    const fc=footer.querySelector('.ft-copy');if(fc)fc.textContent=t['ft.copy'];
    const ff=footer.querySelector('.ft-follow');if(ff)ff.textContent=t['ft.ig'];
  }
  const wa=qs('.wa-float');if(wa)wa.setAttribute('aria-label',t['wa']);
  const sc=qs('#scta');
  if(sc){
    const sx=sc.querySelector('.scta-txt');if(sx)sx.textContent=t['sticky.txt'];
    const sb=sc.querySelector('.scta-btn');if(sb)sb.textContent=t['sticky.btn'];
  }
  qsa('.lang-btn').forEach(btn=>{
    const on=btn.dataset.lang===lang;
    btn.classList.toggle('active',on);
    btn.setAttribute('aria-pressed',on?'true':'false');
    // The switcher now scrolls on narrow screens (seven languages do not fit
    // in a hamburger-width row) -- without this, picking a language near the
    // end could scroll it out of view again on the next repaint.
    if(on) btn.scrollIntoView({inline:'nearest',block:'nearest'});
  });
  triggerWordReveals();
  if(persist) localStorage.setItem('drp-lang',lang);
  document.dispatchEvent(new CustomEvent('drp:langapplied',{detail:{lang}}));
}

/* Read the active language's strings from outside this file (locale.js). */
window.DRP_T=function(key){
  const L=LANGS(); const t=L[document.documentElement.lang]||L.nl;
  return t&&t[key];
};

/* Sticky mobile CTA: in once the hero has scrolled by, out again over the
   closing CTA and the contact form, where it would only repeat an action
   already on screen. */
(function stickyCta(){
  const bar=document.getElementById('scta');
  if(!bar) return;
  const hero=document.querySelector('.hero');
  const end=document.querySelector('.ctastrip,#contact,.ft');
  let queued=false;
  function update(){
    queued=false;
    const past=window.scrollY>(hero?hero.offsetHeight*0.8:600);
    let covered=false;
    if(end){const r=end.getBoundingClientRect();covered=r.top<window.innerHeight;}
    const on=past&&!covered;
    bar.classList.toggle('on',on);
    document.body.classList.toggle('scta-on',on);
  }
  addEventListener('scroll',()=>{if(!queued){queued=true;requestAnimationFrame(update);}},{passive:true});
  addEventListener('resize',update,{passive:true});
  update();
})();

/* Market picker. Navigates rather than swapping text in place: the URL
   states the market, so changing market means going to that market's copy of
   the page you are on. Swapping text would leave /gb/ showing Dutch at pound
   prices, with the URL and the content disagreeing. */
const marketSel=document.getElementById('marketSel');
if(marketSel){
  marketSel.addEventListener('change',()=>{
    const country=marketSel.value;
    const route=marketSel.dataset.route||'/';
    /* The picker lists countries. It keeps the reader's language when the
       next country is published in it -- German on /ch/de/ goes to /at/ or
       /lu/de/, not to the French default -- and otherwise lands on that
       country's own default language. */
    const M=window.DRP_MARKETS||{};
    const same=country+'-'+document.documentElement.lang;
    const code=M[same]?same:country;
    // route is '' for the home page, so normalise to a trailing slash
    location.href='/'+code.split('-').join('/')+(route==='/'?'/':route);
  });
}

/* ══════════════════════════════════════════
   LANGUAGE OFFER — suggest, never switch
══════════════════════════════════════════ */
/* The market decides the language, and the market comes from the URL. That is
   right for a shared link and for a crawler, but it leaves a French-speaking
   Belgian reading Dutch on /be/ with nothing telling them there is a French
   version one click away.

   So: if the browser asks for a language the site has, and this market does
   not serve it, offer it. Offer only -- the URL is never changed on the
   visitor's behalf, because the URL is what they were promised. The bar is
   written in the language being offered, since the reader is by definition
   not reading this one well. */
(function languageOffer(){
  const M = window.DRP_MARKETS || {};
  const here = document.documentElement.lang;
  const codes = Object.keys(M).filter(k => !k.startsWith('__'));
  if (!codes.length || !here) return;

  const remember = (v) => { try {
    return v === undefined ? localStorage.getItem('drp-langbar')
                           : localStorage.setItem('drp-langbar', v);
  } catch(e){ return null; } };
  if (remember()) return;                       // dismissed before, stay quiet

  // What the browser actually asks for, in order, reduced to a bare language.
  const wanted = (navigator.languages || [navigator.language || ''])
    .map(t => String(t).toLowerCase().split('-')[0]);
  const langs = new Set(codes.map(c => M[c].lang));
  const want = wanted.find(l => langs.has(l) && l !== here);
  if (!want) return;                            // already the best we have

  /* Which market to send them to. Prefer one that keeps the price in the
     currency they are already seeing -- a French speaker on /be/ should land
     on a euro market, not be repriced because they changed language. */
  const market = window.__DRP_MARKET__ || '';
  const country = market.split('-')[0];
  const cur = (M[market] || {}).currency;
  const opts = codes.filter(c => M[c].lang === want);
  /* This country in that language first -- a German browser on /ch/ belongs
     on /ch/de/, same franc prices -- then another market at the same
     currency, then any market in that language at all. */
  const target = opts.find(c => c.split('-')[0] === country)
    || opts.find(c => M[c].currency === cur) || opts[0];
  if (!target) return;

  /* Not from LANGS(): a page carries only its own language, so the French
     string is not on /be/. assets/lang-offer.js carries these two strings in
     every language for exactly this. */
  const t = (window.__DRP_LANG_OFFER__ || {})[want];
  if (!t || !t.o) return;

  const route = (document.getElementById('marketSel') || {}).dataset?.route || '/';
  const bar = document.createElement('div');
  bar.className = 'lang-offer';
  bar.setAttribute('lang', want);
  /* Its own direction, whatever the page is: an Arabic offer on a Latin page
     and an English one on an Arabic page both need the bidi isolation, or the
     sentence and its close button land at the wrong ends of the bar. */
  bar.setAttribute('dir', (M.__rtl || []).includes(want) ? 'rtl' : 'ltr');
  const a = document.createElement('a');
  a.href = '/' + target.split('-').join('/') + (route === '/' ? '/' : route);
  a.textContent = t.o;
  const x = document.createElement('button');
  x.type = 'button';
  x.className = 'lang-offer-x';
  x.setAttribute('aria-label', t.d || 'Dismiss');
  x.textContent = '×';
  x.addEventListener('click', () => { remember('1'); bar.remove(); });
  bar.append(a, x);
  document.body.appendChild(bar);
})();

/* Precedence: an explicit click always wins, then the country the edge
   resolved, then the browser's own preference, then Dutch. A visitor who
   has chosen a language is never overridden by where they happen to be. */
function pickLang(marketLang){
  /* The market in the URL wins outright. /jp/prijzen is the Japanese page --
   * a stored preference from an earlier visit to /be/ must not turn it back
   * into Dutch, because the URL is what the visitor and any crawler were
   * promised. Browser language is only consulted if the market somehow
   * resolved to nothing. */
  if(marketLang&&LANGS()[marketLang]) return marketLang;
  const saved=localStorage.getItem('drp-lang');
  if(saved&&LANGS()[saved]) return saved;
  const br=(navigator.language||navigator.userLanguage||'nl').toLowerCase();
  return Object.keys(LANGS()).find(l=>br.startsWith(l))||'nl';
}

(function initLang(){
  // The market is known synchronously from the page, so the first paint is
  // already the right language -- there is no geo round-trip to wait for.
  const L=window.DRP_LOCALE||{};
  applyLang(pickLang(L.lang),false);

  if(window.DRP_LOCALE_READY) window.DRP_LOCALE_READY.then(st=>{
    const want=pickLang(st&&st.lang);
    if(want!==document.documentElement.lang) applyLang(want,false);
    // Same language, but rates have landed since the first pass: re-run the
    // currency conversion that listens on this event.
    else document.dispatchEvent(new CustomEvent('drp:langapplied',{detail:{lang:want}}));
  });
})();

/* ══════════════════════════════════════════
   DEPTH — cards lean towards the pointer

   The rotation is written to custom properties and the transform itself
   lives in 38-depth.css, behind a (hover:hover) and (pointer:fine) query.
   That split is deliberate: the class can be baked into the prerendered
   HTML and still do nothing on a phone, where a stuck :hover would leave a
   card frozen mid-lean after a tap.

   One pointermove listener per card, coalesced into an animation frame --
   the event fires far more often than the screen refreshes, and setting a
   custom property is a style invalidation each time.
══════════════════════════════════════════ */
(function pointerTilt(){
  if(!window.matchMedia) return;
  if(!window.matchMedia('(hover:hover) and (pointer:fine)').matches) return;
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const MAX = 6;   // degrees at the corner
  document.querySelectorAll('.wcard,.plan,.prt,.opp-box').forEach(function(el){
    el.classList.add('tilt');
    let queued = false, px = 0, py = 0;

    el.addEventListener('pointermove', function(e){
      const b = el.getBoundingClientRect();
      px = (e.clientX - b.left) / b.width;
      py = (e.clientY - b.top) / b.height;
      if(queued) return;
      queued = true;
      requestAnimationFrame(function(){
        queued = false;
        el.style.setProperty('--rx', ((px - .5) * MAX * 2).toFixed(2) + 'deg');
        el.style.setProperty('--ry', ((.5 - py) * MAX * 2).toFixed(2) + 'deg');
        el.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
        el.style.setProperty('--my', (py * 100).toFixed(1) + '%');
        el.classList.add('on');
      });
    });

    el.addEventListener('pointerleave', function(){
      el.classList.remove('on');
      el.style.setProperty('--rx','0deg');
      el.style.setProperty('--ry','0deg');
    });
  });
})();
