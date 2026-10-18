/* Solar System Lab — app shell shared by every page:
   one navigation list, the Research menu, the हिंदी/EN switch, offline install (PWA). */
(function(){
"use strict";
const NAV=[
  ['index.html','Home'],
  ['sky.html',"Tonight's Sky"],
  ['events.html','Sky Events'],
  ['iss.html','ISS Tracker'],
  ['orrery.html','Orrery'],
  ['marswalk.html','Marswalk'],
  ['you.html','You on Planets'],
  ['quiz.html','Quiz'],
  ['research',[['anomaly.html','Anomaly Hunter'],['mission.html','Mission Survival'],['landing.html','Landing Sites'],['discovery.html','Discovery Engine']],'Research']
];
const App=window.App={NAV};
const here=(()=>{ let f=location.pathname.split('/').pop()||'index.html'; if(f==='home.html'||f==='kepler-orrery.html') f='index.html'; return f; })();
App.here=here;

/* ---------- language ---------- */
App.lang=(()=>{ try{ const q=new URLSearchParams(location.search).get('lang'); if(q==='hi'||q==='en'){ localStorage.setItem('lab-lang',q); return q; } return localStorage.getItem('lab-lang')||'en'; }catch(e){ return 'en'; } })();
App.hi=()=>App.lang==='hi';
App.t=(en,hi)=>App.lang==='hi'&&hi?hi:en;      // for page scripts that build text
const loadI18n=()=>new Promise(res=>{ if(window.LabI18n) return res(); const s=document.createElement('script'); s.src='i18n.js'; s.onload=res; s.onerror=res; document.head.appendChild(s); });
App.setLang=function(l){
  try{ localStorage.setItem('lab-lang',l); }catch(e){}
  location.reload();
};
if(App.lang==='hi'){ document.documentElement.lang='hi'; document.documentElement.classList.add('lang-hi'); }

/* ---------- navigation ---------- */
function buildNav(){
  const navIn=document.querySelector('.nav .nav-in'); if(!navIn) return;
  const mark=navIn.querySelector('.mark');
  navIn.querySelectorAll('a.tab').forEach(a=>a.remove());
  let html='';
  for(const n of NAV){
    if(n[0]==='research'){
      const active=n[1].some(x=>x[0]===here), cur=n[1].find(x=>x[0]===here);
      html+=`<a class="tab tab-more" href="#research" role="button" aria-haspopup="true" aria-expanded="false" data-label="${n[2]}"${active?' aria-current="page"':''}>${cur?cur[1]:n[2]} <span class="caret" aria-hidden="true">▾</span></a>`;
    } else html+=`<a class="tab" href="${n[0]}"${n[0]===here?' aria-current="page"':''}>${n[1]}</a>`;
  }
  (mark||navIn).insertAdjacentHTML(mark?'afterend':'afterbegin',html);
  // research menu
  const btn=navIn.querySelector('.tab-more'), group=NAV.find(n=>n[0]==='research')[1];
  const menu=document.createElement('div'); menu.className='navmenu'; menu.hidden=true; menu.setAttribute('role','menu');
  menu.innerHTML=group.map(g=>`<a role="menuitem" href="${g[0]}"${g[0]===here?' aria-current="page"':''}>${g[1]}</a>`).join('');
  document.body.appendChild(menu);
  const place=()=>{ const r=btn.getBoundingClientRect(); menu.style.top=(r.bottom+6)+'px'; menu.style.left=Math.max(8,Math.min(innerWidth-menu.offsetWidth-8,r.left))+'px'; };
  const close=()=>{ menu.hidden=true; btn.setAttribute('aria-expanded','false'); };
  btn.addEventListener('click',e=>{ e.preventDefault(); if(menu.hidden){ menu.hidden=false; place(); btn.setAttribute('aria-expanded','true'); menu.querySelector('a').focus({preventScroll:true}); } else close(); });
  document.addEventListener('click',e=>{ if(!menu.hidden&&!menu.contains(e.target)&&e.target!==btn&&!btn.contains(e.target)) close(); });
  document.addEventListener('keydown',e=>{ if(e.key==='Escape'&&!menu.hidden){ close(); btn.focus(); } });
  addEventListener('resize',()=>{ if(!menu.hidden) place(); }); navIn.addEventListener('scroll',()=>{ if(!menu.hidden) place(); },{passive:true});
  // keep the current tab visible on narrow screens
  const cur=navIn.querySelector('[aria-current="page"]'); if(cur) requestAnimationFrame(()=>{ if(cur.offsetLeft+cur.offsetWidth>navIn.clientWidth) navIn.scrollLeft=cur.offsetLeft-navIn.clientWidth/2+cur.offsetWidth/2; });
}

function addLangSwitch(){
  const nav=document.querySelector('.nav')||document.querySelector('nav.lab'); if(!nav||document.getElementById('langBtn')) return;
  const b=document.createElement('button'); b.id='langBtn'; b.className='navlang'; b.type='button';
  b.innerHTML=App.lang==='hi'?'<b>EN</b><span>English</span>':'<b lang="hi">हिं</b><span lang="hi">हिंदी</span>';
  b.setAttribute('aria-label',App.lang==='hi'?'Switch to English':'हिंदी में देखें, switch to Hindi');
  b.onclick=()=>App.setLang(App.lang==='hi'?'en':'hi');
  nav.appendChild(b);
}

/* ---------- install / offline ---------- */
let deferred=null;
function addInstall(){
  const nav=document.querySelector('.nav')||document.querySelector('nav.lab'); if(!nav||document.getElementById('installBtn')) return;
  const b=document.createElement('button'); b.id='installBtn'; b.className='navinstall'; b.type='button'; b.hidden=true;
  b.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12m0 0l-5-5m5 5l5-5M4 19h16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg><span>'+App.t('Install app','ऐप इंस्टॉल करें')+'</span>';
  b.onclick=async()=>{ if(deferred){ deferred.prompt(); const r=await deferred.userChoice.catch(()=>null); deferred=null; b.hidden=true; } else if(isIOS()){ toast(App.t('On iPhone: tap Share, then “Add to Home Screen”.','iPhone पर: Share दबाएँ, फिर “Add to Home Screen” चुनें।')); } };
  const lang=document.getElementById('langBtn'); lang?nav.insertBefore(b,lang):nav.appendChild(b);
  const standalone=matchMedia('(display-mode: standalone)').matches||navigator.standalone;
  if(!standalone&&isIOS()) b.hidden=false;
}
const isIOS=()=>/iphone|ipad|ipod/i.test(navigator.userAgent)&&!window.MSStream;
function toast(msg){ let t=document.getElementById('labToast'); if(!t){ t=document.createElement('div'); t.id='labToast'; t.className='labtoast'; t.setAttribute('role','status'); document.body.appendChild(t); } t.textContent=msg; t.classList.add('on'); clearTimeout(t._h); t._h=setTimeout(()=>t.classList.remove('on'),5200); }
App.toast=toast;
addEventListener('beforeinstallprompt',e=>{ e.preventDefault(); deferred=e; const b=document.getElementById('installBtn'); if(b) b.hidden=false; });
addEventListener('appinstalled',()=>{ const b=document.getElementById('installBtn'); if(b) b.hidden=true; toast(App.t('Installed. Solar System Lab now opens like an app.','इंस्टॉल हो गया। अब यह ऐप की तरह खुलेगा।')); });
if('serviceWorker' in navigator&&(location.protocol==='https:'||location.hostname==='localhost'||location.hostname==='127.0.0.1')&&!/claude\.ai|claudeusercontent/.test(location.hostname)){
  addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
}

/* ---------- start ---------- */
document.addEventListener('DOMContentLoaded',()=>{
  buildNav();
  setTimeout(()=>{ addLangSwitch(); addInstall(); },0);
  if(App.lang==='hi') loadI18n().then(()=>window.LabI18n&&window.LabI18n.run());
});
})();
