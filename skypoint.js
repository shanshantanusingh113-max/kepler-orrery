/* Solar System Lab — "point your phone at the sky": a live sky finder driven by the phone's compass and tilt.
   Needs lab.js and sky-engine.js. Works without sensors too: drag to look around. */
(function(){
"use strict";
const D=Math.PI/180, T=(en,hi)=>window.App?App.t(en,hi):en;
// bright stars, J2000 RA/Dec in degrees (Hipparcos), Hindi names where traditional ones exist
const STARS=[
 ['Sirius','व्याध',101.287,-16.716,-1.46],['Canopus','अगस्त्य',95.988,-52.696,-0.74],['Arcturus','स्वाति',213.915,19.182,-0.05],['Vega','अभिजित',279.234,38.784,0.03],
 ['Capella','ब्रह्महृदय',79.172,45.998,0.08],['Rigel','',78.634,-8.202,0.13],['Procyon','',114.825,5.225,0.34],['Betelgeuse','आर्द्रा',88.793,7.407,0.5],
 ['Altair','श्रवण',297.696,8.868,0.77],['Aldebaran','रोहिणी',68.980,16.509,0.85],['Antares','ज्येष्ठा',247.352,-26.432,0.96],['Spica','चित्रा',201.298,-11.161,0.97],
 ['Pollux','पुनर्वसु',116.329,28.026,1.14],['Fomalhaut','',344.413,-29.622,1.16],['Deneb','',310.358,45.280,1.25],['Regulus','मघा',152.093,11.967,1.35],
 ['Acrux','',186.650,-63.099,0.77],['Polaris','ध्रुव तारा',37.955,89.264,1.98]
];
const COL={Sun:'#ffcf6a',Moon:'#ece9df',Mercury:'#b8ab9c',Venus:'#f1d9a6',Mars:'#e0784a',Jupiter:'#e3c29a',Saturn:'#e9d39f',Uranus:'#9fdde6',Neptune:'#6d93ec'};

let el=null, cv=null, g=null, raf=0, view={az:180,alt:30}, sensor=false, target=null, objs=[], lastCalc=0, city=null, smooth=null;

function compute(){
  const now=Date.now(), jd=Sky.jd(now), out=[];
  const s=Sky.sun(jd); out.push({n:'Sun',hi:'सूर्य',...Sky.altazOf(s.v,jd,city.lat,city.lon),r:9,kind:'sun'});
  const m=Sky.moonTopo(jd,city.lat,city.lon); out.push({n:'Moon',hi:'चंद्रमा',...Sky.altazOf(m.v,jd,city.lat,city.lon),r:8,kind:'moon'});
  Lab.PLANETS.filter(p=>p.name!=='Earth').forEach(p=>{ const q=Sky.planet(p,jd); const mag=Sky.mag(p.name,q.r,q.R,q.dist); out.push({n:p.name,hi:Sky.HI[p.name],...Sky.altazOf(q.v,jd,city.lat,city.lon),mag,r:Math.max(3,6-mag),kind:'planet'}); });
  STARS.forEach(st=>{ const v=[Math.cos(st[3]*D)*Math.cos(st[2]*D),Math.cos(st[3]*D)*Math.sin(st[2]*D),Math.sin(st[3]*D)]; const q=Sky.radec(v); const a=Sky.altaz(q.ra,q.dec,jd,city.lat,city.lon); out.push({n:st[0],hi:st[1],...a,mag:st[4],r:Math.max(1.5,3.4-st[4]*.9),kind:'star'}); });
  objs=out; lastCalc=now;
}

/* device orientation → where the back camera points (azimuth from north, altitude) */
function pointing(alpha,beta,gamma){
  const a=alpha*D, b=beta*D, c=gamma*D, sA=Math.sin(a), cA=Math.cos(a), sB=Math.sin(b), cB=Math.cos(b), sG=Math.sin(c), cG=Math.cos(c);
  const dx=-(cG*sA*sB+cA*sG), dy=-(sA*sG-cA*cG*sB), dz=-cB*cG;              // −Z of the device in East-North-Up
  let az=Math.atan2(dx,dy)/D; az=(az+360)%360;
  return {az, alt:Math.asin(Math.max(-1,Math.min(1,dz)))/D};
}
window.__skyPointing=pointing;
function onOrient(e){
  let alpha=e.alpha;
  if(typeof e.webkitCompassHeading==='number') alpha=360-e.webkitCompassHeading;     // iOS: true compass
  else if(!e.absolute&&e.type!=='deviceorientationabsolute') return;                  // need a compass-referenced heading
  if(alpha==null||e.beta==null) return;
  sensor=true;
  const p=pointing(alpha,e.beta,e.gamma||0);
  if(!smooth) smooth=p; else { let d=((p.az-smooth.az+540)%360)-180; smooth={az:(smooth.az+d*0.25+360)%360,alt:smooth.alt+(p.alt-smooth.alt)*0.25}; }
  view={...smooth};
}

/* projection: gnomonic-ish view centred on the pointing direction */
function project(az,alt,W,H,fov){
  const a0=view.az*D, h0=view.alt*D, a=az*D, h=alt*D;
  const x=Math.cos(h)*Math.sin(a-a0), y=Math.cos(h0)*Math.sin(h)-Math.sin(h0)*Math.cos(h)*Math.cos(a-a0), z=Math.sin(h0)*Math.sin(h)+Math.cos(h0)*Math.cos(h)*Math.cos(a-a0);
  if(z<=0.05) return null;
  const f=(W/2)/Math.tan(fov/2*D);
  return [W/2+f*x/z, H/2-f*y/z];
}
function draw(){
  raf=requestAnimationFrame(draw);
  if(Date.now()-lastCalc>15000) compute();
  const d=Math.min(2,devicePixelRatio||1), W=cv.clientWidth, H=cv.clientHeight;
  if(cv.width!==Math.round(W*d)){ cv.width=Math.round(W*d); cv.height=Math.round(H*d); }
  g.setTransform(d,0,0,d,0,0);
  const fov=W>H?70:55;
  const sky=g.createLinearGradient(0,0,0,H); sky.addColorStop(0,'#03050c'); sky.addColorStop(1,'#0b1430'); g.fillStyle=sky; g.fillRect(0,0,W,H);
  // altitude grid and horizon
  g.lineWidth=1;
  for(let alt=-30;alt<=80;alt+=10){ g.strokeStyle=alt===0?'rgba(255,148,71,.75)':'rgba(150,168,210,.12)'; g.lineWidth=alt===0?2:1; g.beginPath(); let on=false; for(let az=0;az<=360;az+=2){ const p=project(az,alt,W,H,fov); if(p){ on?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]); on=true; } else on=false; } g.stroke(); }
  // ground
  const pts=[]; for(let az=0;az<=360;az+=3){ const p=project(az,0,W,H,fov); if(p) pts.push(p); }
  // compass labels
  g.font='600 15px "IBM Plex Sans",sans-serif'; g.textAlign='center';
  [['N','उत्तर',0],['NE','उ-पू',45],['E','पूर्व',90],['SE','द-पू',135],['S','दक्षिण',180],['SW','द-प',225],['W','पश्चिम',270],['NW','उ-प',315]].forEach(([en,hi,az])=>{ const p=project(az,0,W,H,fov); if(p){ g.fillStyle='#ff9447'; g.fillText(window.App&&App.hi()?hi:en,p[0],p[1]+20); } });
  // objects
  objs.forEach(o=>{ const p=project(o.az,o.alt,W,H,fov); if(!p) return; const below=o.alt<0;
    g.globalAlpha=below?0.35:1;
    if(o.kind==='star'){ g.fillStyle='#e6ecff'; g.beginPath(); g.arc(p[0],p[1],o.r,0,7); g.fill(); g.fillStyle='rgba(200,210,235,.8)'; g.font='500 12px "IBM Plex Sans",sans-serif'; g.fillText(window.App&&App.hi()&&o.hi?o.hi:o.n,p[0],p[1]-o.r-5); }
    else { const col=COL[o.n]||'#fff', gl=g.createRadialGradient(p[0],p[1],0,p[0],p[1],o.r*4); gl.addColorStop(0,col); gl.addColorStop(1,'rgba(0,0,0,0)'); g.fillStyle=gl; g.beginPath(); g.arc(p[0],p[1],o.r*4,0,7); g.fill();
      g.fillStyle=col; g.beginPath(); g.arc(p[0],p[1],o.r,0,7); g.fill();
      g.fillStyle='#fff'; g.font='600 14px "Noto Sans Devanagari","IBM Plex Sans",sans-serif'; g.fillText(`${o.hi} · ${o.n}${below?' '+T('(below horizon)','(क्षितिज के नीचे)'):''}`,p[0],p[1]-o.r-9); }
    g.globalAlpha=1; });
  // centre reticle
  g.strokeStyle='rgba(255,255,255,.6)'; g.lineWidth=1.5; g.beginPath(); g.arc(W/2,H/2,18,0,7); g.moveTo(W/2-30,H/2); g.lineTo(W/2-22,H/2); g.moveTo(W/2+22,H/2); g.lineTo(W/2+30,H/2); g.moveTo(W/2,H/2-30); g.lineTo(W/2,H/2-22); g.moveTo(W/2,H/2+22); g.lineTo(W/2,H/2+30); g.stroke();
  // guide arrow to the chosen target
  let guide='';
  if(target){ const o=objs.find(x=>x.n===target); if(o){ const p=project(o.az,o.alt,W,H,fov); let dAz=((o.az-view.az+540)%360)-180, dAlt=o.alt-view.alt;
    const onScreen=p&&p[0]>20&&p[0]<W-20&&p[1]>20&&p[1]<H-20;
    if(Math.abs(dAz)<4&&Math.abs(dAlt)<4) guide=T(`You are pointing at ${o.n}!`,`आप ${o.hi} की ओर देख रहे हैं!`);
    else { guide=(Math.abs(dAz)>=4?(dAz>0?T(`Turn right ${Math.round(dAz)}°`,`दाएँ ${Math.round(dAz)}° घूमिए`):T(`Turn left ${Math.round(-dAz)}°`,`बाएँ ${Math.round(-dAz)}° घूमिए`)):'')+(Math.abs(dAlt)>=4?(guide?'':'')+(Math.abs(dAz)>=4?' · ':'')+(dAlt>0?T(`tilt up ${Math.round(dAlt)}°`,`ऊपर ${Math.round(dAlt)}° उठाइए`):T(`tilt down ${Math.round(-dAlt)}°`,`नीचे ${Math.round(-dAlt)}° झुकाइए`)):'');
      if(!onScreen){ const ang=Math.atan2(-dAlt,dAz), R=Math.min(W,H)/2-46, ax=W/2+R*Math.cos(ang), ay=H/2+R*Math.sin(ang);
        g.save(); g.translate(ax,ay); g.rotate(ang); g.fillStyle='#ff9447'; g.beginPath(); g.moveTo(22,0); g.lineTo(-10,-14); g.lineTo(-4,0); g.lineTo(-10,14); g.closePath(); g.fill(); g.restore(); } }
    if(o.alt<0) guide+=' · '+T('it is below the horizon now','अभी क्षितिज के नीचे है'); } }
  el.querySelector('.sp-read').textContent=`${T('Pointing','दिशा')} ${Math.round(view.az)}° ${Sky.dir(view.az)[window.App&&App.hi()?'hi':'en']} · ${T('height','ऊँचाई')} ${Math.round(view.alt)}°`+(sensor?'':' · '+T('drag to look around','घुमाने के लिए खींचिए'));
  el.querySelector('.sp-guide').textContent=guide;
}

function open(){
  city=Sky.savedCity();
  if(!el){
    el=document.createElement('div'); el.className='skypoint'; el.setAttribute('role','dialog'); el.setAttribute('aria-label',T('Point your phone at the sky','फ़ोन को आसमान की ओर कीजिए'));
    el.innerHTML=`<canvas></canvas><div class="sp-top"><button class="sp-x" aria-label="Close">✕</button><div><b>${T('Point your phone at the sky','फ़ोन को आसमान की ओर कीजिए')}</b><span class="sp-read"></span></div></div>
      <div class="sp-guide" aria-live="polite"></div><div class="sp-chips"></div><p class="sp-msg"></p>`;
    document.body.appendChild(el); cv=el.querySelector('canvas'); g=cv.getContext('2d');
    el.querySelector('.sp-x').onclick=close;
    let drag=null; cv.addEventListener('pointerdown',e=>{ drag=[e.clientX,e.clientY,view.az,view.alt]; cv.setPointerCapture(e.pointerId); });
    cv.addEventListener('pointermove',e=>{ if(!drag||sensor) return; view.az=(drag[2]-(e.clientX-drag[0])*0.15+360)%360; view.alt=Math.max(-20,Math.min(89,drag[3]+(e.clientY-drag[1])*0.15)); });
    cv.addEventListener('pointerup',()=>drag=null);
    document.addEventListener('keydown',e=>{ if(e.key==='Escape'&&el&&!el.hidden) close(); });
  }
  compute();
  const vis=objs.filter(o=>o.kind!=='star'&&o.n!=='Sun').sort((a,b)=>b.alt-a.alt);
  el.querySelector('.sp-chips').innerHTML=vis.map(o=>`<button data-n="${o.n}" class="${o.alt>0?'up':''}">${o.hi} · ${o.n}</button>`).join('');
  el.querySelectorAll('.sp-chips button').forEach(b=>b.onclick=()=>{ target=target===b.dataset.n?null:b.dataset.n; el.querySelectorAll('.sp-chips button').forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.n===target))); });
  el.hidden=false; document.documentElement.style.overflow='hidden';
  const msg=el.querySelector('.sp-msg');
  const start=()=>{ addEventListener('deviceorientationabsolute',onOrient,true); addEventListener('deviceorientation',onOrient,true);
    setTimeout(()=>{ if(!sensor) msg.textContent=T('No compass found on this device, so drag the sky to look around. On a phone, allow motion access and hold it upright.','इस डिवाइस में कंपास नहीं मिला, आसमान को उँगली से खींचकर घुमाइए।'); else msg.textContent=T('Hold the phone upright, away from metal. Wave it in a figure-8 if directions look off.','फ़ोन सीधा पकड़िए, धातु से दूर। दिशा गलत लगे तो फ़ोन को 8 के आकार में घुमाइए।'); },1500); };
  if(typeof DeviceOrientationEvent!=='undefined'&&typeof DeviceOrientationEvent.requestPermission==='function'){
    DeviceOrientationEvent.requestPermission().then(r=>{ if(r==='granted') start(); else msg.textContent=T('Motion access was not allowed. Drag the sky to look around instead.','मोशन की अनुमति नहीं मिली। उँगली से खींचकर देखिए।'); }).catch(()=>start());
  } else start();
  cancelAnimationFrame(raf); draw();
}
function close(){ if(!el) return; el.hidden=true; document.documentElement.style.overflow=''; cancelAnimationFrame(raf); removeEventListener('deviceorientationabsolute',onOrient,true); removeEventListener('deviceorientation',onOrient,true); sensor=false; smooth=null; }
window.SkyPoint={open,close,setView:(az,alt)=>{ view={az,alt}; },state:()=>({view,sensor,target,objs})};

const css=document.createElement('style');
css.textContent=`.skypoint{position:fixed;inset:0;z-index:90;background:#03050c;touch-action:none}
.skypoint[hidden]{display:none}
.skypoint canvas{position:absolute;inset:0;width:100%;height:100%}
.skypoint .sp-top{position:absolute;left:0;right:0;top:0;display:flex;gap:12px;align-items:center;padding:calc(12px + env(safe-area-inset-top,0px)) 16px 12px;background:linear-gradient(180deg,rgba(3,5,12,.9),rgba(3,5,12,0))}
.skypoint .sp-top b{display:block;font-size:15px;color:#e6e9f2}
.skypoint .sp-read{display:block;font:500 12px/1.4 "IBM Plex Mono",monospace;color:#8a94ae}
.skypoint .sp-x{width:40px;height:40px;border-radius:10px;border:1px solid rgba(150,168,210,.3);background:rgba(10,15,27,.8);color:#e6e9f2;font-size:18px;cursor:pointer;flex:none}
.skypoint .sp-guide{position:absolute;left:50%;top:calc(50% + 48px);transform:translateX(-50%);font:600 16px/1.3 "Noto Sans Devanagari","IBM Plex Sans",sans-serif;color:#ff9447;text-align:center;text-shadow:0 2px 10px #000;width:90%}
.skypoint .sp-chips{position:absolute;left:0;right:0;bottom:calc(34px + env(safe-area-inset-bottom,0px));display:flex;gap:8px;overflow-x:auto;padding:0 16px;scrollbar-width:none}
.skypoint .sp-chips button{flex:none;border-radius:999px;border:1px solid rgba(150,168,210,.3);background:rgba(10,15,27,.85);color:#8a94ae;padding:9px 13px;font:500 13px/1 "Noto Sans Devanagari","IBM Plex Sans",sans-serif;cursor:pointer}
.skypoint .sp-chips button.up{color:#e6e9f2}
.skypoint .sp-chips button[aria-pressed="true"]{border-color:#ff9447;color:#ff9447}
.skypoint .sp-msg{position:absolute;left:16px;right:16px;bottom:calc(6px + env(safe-area-inset-bottom,0px));margin:0;font:400 11.5px/1.3 "IBM Plex Sans",sans-serif;color:#8a94ae;text-align:center}`;
document.head.appendChild(css);
})();
