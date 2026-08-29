/* DRP BuildLab — behaviour. Shared by every page; edit here, not per page. */
/* ══════════════════════════════════════════
   LOADER  (A11) + HERO ENTRANCE (A12)
   DOMContentLoaded, ~400ms, once per session.
══════════════════════════════════════════ */
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
   CURSOR — smooth lag ring
══════════════════════════════════════════ */
const cdot  = document.getElementById('cdot');
const cring = document.getElementById('cring');
let mx=0,my=0,rx=0,ry=0;
document.addEventListener('mousemove', e => { mx=e.clientX; my=e.clientY; });
(function loop(){
  cdot.style.cssText  = `left:${mx}px;top:${my}px`;
  rx += (mx-rx)*.1; ry += (my-ry)*.1;
  cring.style.cssText = `left:${rx}px;top:${ry}px`;
  requestAnimationFrame(loop);
})();
document.querySelectorAll('a,button,.wcard,.srow,.plan,.ex,.crow,.mag').forEach(el=>{
  el.addEventListener('mouseenter',()=>document.body.classList.add('ch'));
  el.addEventListener('mouseleave',()=>document.body.classList.remove('ch'));
});
document.querySelectorAll('input,textarea,select').forEach(el=>{
  el.addEventListener('mouseenter',()=>document.body.classList.add('ct'));
  el.addEventListener('mouseleave',()=>document.body.classList.remove('ct'));
});

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
  // anchors close the overlay so the jump is visible
  navOv.addEventListener('click', e=>{ if(e.target.closest('a')) closeNav(false); });
  document.addEventListener('keydown', e=>{
    if(!navIsOpen()) return;
    if(e.key === 'Escape'){ e.preventDefault(); closeNav(); return; }
    if(e.key !== 'Tab') return;
    const f = [navTog].concat(Array.prototype.slice.call(navOv.querySelectorAll('a')));
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
function wrapWords(str){
  return str.replace(/([^\s]+)/g, w=>`<span class="wr-w"><span class="wr">${w}</span></span>`);
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
   MOUSE PARALLAX on hero background shapes
══════════════════════════════════════════ */
const hbg   = document.querySelector('.hero-bg-glow');
const hgrid = document.querySelector('.hero-grid');
const heroEl = document.querySelector('.hero');
if(heroEl) heroEl.addEventListener('mousemove', e=>{
  const cx=window.innerWidth/2, cy=window.innerHeight/2;
  const dx=(e.clientX-cx)/cx, dy=(e.clientY-cy)/cy;
  if(hbg)   hbg.style.transform   = `translate(${dx*18}px,${dy*18}px)`;
  if(hgrid) hgrid.style.transform = `translate(${dx*-8}px,${dy*-8}px)`;
  if(hlogomark) hlogomark.style.transform = `translateY(-50%) translate(${dx*10}px,${dy*10}px)`;
});

/* ══════════════════════════════════════════
   ZOOM SECTION — pinned, scale driven by scroll
   Stats cycle: €0 → €499 → 100%
══════════════════════════════════════════ */
const zoomSec     = document.getElementById('zoomSec');
const zoomInner   = document.getElementById('zoomInner');
const zoomNum     = document.getElementById('zoomNum');
const zoomLbl     = document.getElementById('zoomLbl');
const zoomTag     = document.getElementById('zoomTag');
const zoomCounter = document.getElementById('zoomCounter');
const zdots       = [document.getElementById('zd0'),document.getElementById('zd1'),document.getElementById('zd2')];

const zStats = [
  {num:'<span>€</span>0',    lbl:'Kost van uw demo en eerste voorstel', tag:'Geen drempel'},
  {num:'€499',               lbl:'Beginnerspakket — website op maat voor starters', tag:'Eerlijke prijs'},
  {num:'100<span>%</span>',  lbl:'Websites volledig op maat — prijs volgens werk', tag:'Op maat'},
];
let lastIdx = -1;

if(zoomSec) window.addEventListener('scroll',()=>{
  const secTop  = zoomSec.offsetTop;
  const secH    = zoomSec.offsetHeight;
  const scrolled = window.scrollY - secTop;
  const p = Math.max(0, Math.min(1, scrolled / (secH - window.innerHeight)));

  // Scale from 0.55 → 1 over first third, hold, then fade out
  let scale, opacity;
  if(p < .45){
    scale   = 0.55 + p/0.45 * 0.45;
    opacity = p/0.2;
  } else if(p < .85){
    scale   = 1;
    opacity = 1;
  } else {
    scale   = 1 + (p-.85)/.15 * 0.06;
    opacity = 1 - (p-.85)/.15;
  }

  zoomInner.style.transform = `scale(${Math.min(scale,1.06)})`;
  zoomInner.style.opacity   = Math.max(0,Math.min(1,opacity));

  // Cycle stats at 0%, 33%, 66%
  const idx = Math.min(2, Math.floor(p * 3));
  if(idx !== lastIdx){
    lastIdx = idx;
    const s = zStats[idx];
    zoomNum.innerHTML = s.num;
    zoomLbl.textContent = s.lbl;
    zoomTag.textContent = s.tag;
    if(zoomCounter) zoomCounter.textContent = `0${idx+1} / 03`;
    zdots.forEach((d,i)=>{
      d.classList.toggle('a', i===idx);
    });
  }
},{passive:true});

/* ══════════════════════════════════════════
   VELOCITY MARQUEE (scroll-speed-reactive)
══════════════════════════════════════════ */
const mq = document.getElementById('mqTrack');
let mqX = 0, lastScrollY = 0, velocity = 0;
const baseSpeed = 0.38; // px per frame at rest
if(mq){
  (function mqLoop(){
    velocity *= 0.92;
    mqX -= baseSpeed + velocity * 3;
    const w = mq.scrollWidth / 2;
    if(Math.abs(mqX) >= w) mqX = 0;
    mq.style.transform = `translateX(${mqX}px)`;
    requestAnimationFrame(mqLoop);
  })();
  window.addEventListener('scroll',()=>{
    const delta = window.scrollY - lastScrollY;
    velocity = Math.max(-6, Math.min(6, delta * 0.12));
    lastScrollY = window.scrollY;
  },{passive:true});
}

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
    const target = parseInt(el.dataset.count)||0;
    const prefix = el.dataset.prefix||'';
    const suffix = el.dataset.suffix||'';
    if(target===0){ cntIO.unobserve(el); return; }
    let start=null;
    const run=ts=>{
      if(!start) start=ts;
      const p=Math.min((ts-start)/1300,1);
      const ease=1-Math.pow(1-p,3);
      el.textContent = prefix+Math.round(ease*target)+suffix;
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
const demoForm = document.getElementById('formWrap');
if(demoForm){
  const ferrBox = document.getElementById('ferr');
  const submitBtn = document.getElementById('fSubmitBtn');
  demoForm.addEventListener('submit', function(e){
    e.preventDefault();
    if(ferrBox) ferrBox.classList.remove('on');
    if(submitBtn) submitBtn.disabled = true;
    const data = new FormData(demoForm);
    fetch('/', {method:'POST', headers:{'Content-Type':'application/x-www-form-urlencoded'},
      body: new URLSearchParams(data).toString()
    })
    .then(res=>{
      // fetch resolves on 404/500 too — only 2xx counts as delivered
      if(!res.ok) throw new Error('HTTP '+res.status);
      demoForm.style.display = 'none';
      document.getElementById('succ').classList.add('on');
    })
    .catch(()=>{
      if(submitBtn) submitBtn.disabled = false;
      if(ferrBox){
        ferrBox.classList.add('on');
        ferrBox.scrollIntoView({block:'nearest', behavior:'smooth'});
      }
    });
  });
}


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

function applyLang(lang){
  const t=TRANSLATIONS[lang]; if(!t) return;
  document.documentElement.lang=lang;
  const pg=document.body.dataset.page||'home';
  document.title=t['meta.title.'+pg]||t['meta.title'];
  const md=qs('meta[name="description"]');
  if(md) md.setAttribute('content',t['meta.desc.'+pg]||t['meta.desc']);
  const ld=qs('.ld-name'); if(ld) ld.textContent=t['loader'];
  const NAVKEYS={home:'nav.home',about:'nav.about',pricing:'nav.pricing',contact:'nav.contact',cta:'nav.cta'};
  qsa('[data-nav]').forEach(el=>{ const k=NAVKEYS[el.dataset.nav]; if(k&&t[k]) el.textContent=t[k]; });
  const he=qs('.hero-eye'); if(he) he.textContent=t['hero.eye'];
  const ph=qs('.phero');
  if(ph){
    const pe=ph.querySelector('.phero-eye'); if(pe&&t['phero.'+pg+'.eye']) pe.textContent=t['phero.'+pg+'.eye'];
    const phh=ph.querySelector('.phero-h1'); if(phh&&t['phero.'+pg+'.h']){resetSh(phh);phh.innerHTML=t['phero.'+pg+'.h'];}
    const ps=ph.querySelector('.phero-sub'); if(ps&&t['phero.'+pg+'.sub']) ps.innerHTML=t['phero.'+pg+'.sub'];
  }
  const cta=qs('.ctastrip');
  if(cta){
    const ch2=cta.querySelector('.sh'); if(ch2){resetSh(ch2);ch2.innerHTML=t['cta.h'];}
    const cs2=cta.querySelector('.ssub'); if(cs2) cs2.textContent=t['cta.sub'];
    const cb=cta.querySelector('.btn'); if(cb) cb.textContent=t['cta.btn'];
  }
  const h1=document.getElementById('heroH1');
  if(h1){
    h1.innerHTML=`<span class="hl"><span class="hl-i">${t['hero.l1']}</span></span><span class="hl"><span class="hl-i d1">${t['hero.l2']}</span></span><span class="hl"><span class="hl-i d2">${t['hero.l3']}</span></span>`;
    // only animate once the loader is out of the way (A12)
    if(heroRevealed) h1.querySelectorAll('.hl-i').forEach(el=>el.classList.add('in'));
  }
  const hs=qs('.hero-sub'); if(hs) hs.innerHTML=t['hero.sub'];
  const hb=qsa('.hero-acts .btn'); if(hb[0]) hb[0].textContent=t['hero.cta1']; if(hb[1]) hb[1].textContent=t['hero.cta2'];
  const sh=qs('.shint span'); if(sh) sh.textContent=t['hero.scroll'];
  const mq=document.getElementById('mqTrack');
  if(mq){ const it=t['mq']; mq.innerHTML=[...it,...it].map(i=>`<div class="mq-item">${i} <span class="mqdot"></span></div>`).join(''); }
  const zbl=qs('.zoom-corner-bl'); if(zbl) zbl.textContent=t['zoom.bl'];
  const zbr=qs('.zoom-corner-br'); if(zbr) zbr.textContent=t['zoom.br'];
  const nzs=t['zs'];
  [0,1,2].forEach(i=>{ zStats[i]={num:nzs[i].num,lbl:nzs[i].lbl,tag:nzs[i].tag}; });
  const ci=Math.max(0,lastIdx);
  if(zoomLbl) zoomLbl.textContent=zStats[ci].lbl;
  if(zoomTag) zoomTag.textContent=zStats[ci].tag;
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
  const cn=document.getElementById('contact');
  if(cn){
    const ct2=cn.querySelector('.stag');if(ct2)ct2.textContent=t['ct.tag'];
    const ch=cn.querySelector('.sh');if(ch){resetSh(ch);ch.innerHTML=t['ct.h2'];}
    const cl=cn.querySelector('.ct-lede');if(cl)cl.textContent=t['ct.lede'];
    const ci=cn.querySelectorAll('.ci-lbl'); t['ct.lbls'].forEach((l,i)=>{if(ci[i])ci[i].textContent=l;});
    const fl=cn.querySelectorAll('.field label'); t['f.labels'].forEach((l,i)=>{if(fl[i])fl[i].textContent=l;});
    const ph=t['f.phs'];
    const fv=document.getElementById('f-vnaam');if(fv)fv.placeholder=ph[0];
    const fa=document.getElementById('f-anaam');if(fa)fa.placeholder=ph[1];
    const fb=document.getElementById('f-bedrijf');if(fb)fb.placeholder=ph[2];
    const ft2=document.getElementById('f-tel');if(ft2)ft2.placeholder=ph[3];
    const fe=document.getElementById('f-email');if(fe)fe.placeholder=ph[4];
    const fm=document.getElementById('f-bericht');if(fm)fm.placeholder=ph[5];
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
  qsa('.lang-btn').forEach(btn=>{
    const on=btn.dataset.lang===lang;
    btn.classList.toggle('active',on);
    btn.setAttribute('aria-pressed',on?'true':'false');
  });
  triggerWordReveals();
  localStorage.setItem('drp-lang',lang);
}

const langSwEl=document.getElementById('langSw');
if(langSwEl) langSwEl.addEventListener('click',e=>{
  const btn=e.target.closest('.lang-btn');
  if(btn) applyLang(btn.dataset.lang);
});

(function initLang(){
  const saved=localStorage.getItem('drp-lang');
  if(saved&&TRANSLATIONS[saved]){applyLang(saved);return;}
  const br=(navigator.language||navigator.userLanguage||'nl').toLowerCase();
  const detected=['en','fr','es'].find(l=>br.startsWith(l));
  applyLang(detected||'nl');
})();
