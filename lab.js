/* Solar System Lab — shared helpers */
(function(){
"use strict";
const Lab={};
Lab.$=id=>document.getElementById(id);
Lab.clamp=(x,a,b)=>x<a?a:x>b?b:x;

/* seeded RNG (mulberry32) */
Lab.rng=function(seed){
  let a=(seed>>>0)||1;
  return function(){ a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; };
};
Lab.gauss=function(r){ let u=0,v=0; while(u===0)u=r(); while(v===0)v=r(); return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v); };

/* fractal value noise on [0,1]^2, returns 0..1 */
Lab.noise=function(seed,octaves,base){
  octaves=octaves||5; base=base||4;
  const r=Lab.rng(seed), octs=[];
  for(let o=0;o<octaves;o++){ const g=(base<<o)+1, a=new Float32Array(g*g); for(let i=0;i<a.length;i++) a[i]=r(); octs.push([g,a]); }
  const sm=t=>t*t*(3-2*t);
  return function(u,v){
    let s=0,amp=.5,norm=0;
    for(let o=0;o<octs.length;o++){
      const g=octs[o][0], a=octs[o][1], x=u*(g-1), y=v*(g-1);
      let xi=Math.floor(x), yi=Math.floor(y); if(xi>=g-1)xi=g-2; if(yi>=g-1)yi=g-2; if(xi<0)xi=0; if(yi<0)yi=0;
      const xf=sm(x-xi), yf=sm(y-yi);
      const p=a[yi*g+xi], q=a[yi*g+xi+1], c=a[(yi+1)*g+xi], d=a[(yi+1)*g+xi+1];
      s+=amp*(p+(q-p)*xf+(c-p)*yf+(p-q-c+d)*xf*yf); norm+=amp; amp*=.5;
    }
    return s/norm;
  };
};

/* load an uploaded image file */
Lab.loadImage=function(file){
  return new Promise((res,rej)=>{
    const url=URL.createObjectURL(file), img=new Image();
    img.onload=()=>{ res(img); };
    img.onerror=()=>rej(new Error('This file could not be read as an image. Use PNG, JPEG or WebP.'));
    img.src=url;
  });
};
/* draw image into a grayscale Float32Array fitting maxSide; returns {w,h,data,scale} where scale = original px per working px */
Lab.toGray=function(img,maxSide,fixedW,fixedH){
  let w,h;
  if(fixedW){ w=fixedW; h=fixedH; }
  else { const s=Math.min(1,maxSide/Math.max(img.naturalWidth,img.naturalHeight)); w=Math.max(8,Math.round(img.naturalWidth*s)); h=Math.max(8,Math.round(img.naturalHeight*s)); }
  const cv=document.createElement('canvas'); cv.width=w; cv.height=h;
  const ctx=cv.getContext('2d'); ctx.drawImage(img,0,0,w,h);
  const d=ctx.getImageData(0,0,w,h).data, out=new Float32Array(w*h);
  for(let i=0;i<w*h;i++) out[i]=(0.299*d[i*4]+0.587*d[i*4+1]+0.114*d[i*4+2])/255;
  return {w,h,data:out,scale:img.naturalWidth/w};
};

/* robust statistics */
Lab.median=function(arr){ const a=Float32Array.from(arr).sort(); const n=a.length; return n? (n%2?a[(n-1)/2]:(a[n/2-1]+a[n/2])/2) : 0; };
Lab.mad=function(arr,med){ const d=new Float32Array(arr.length); for(let i=0;i<arr.length;i++) d[i]=Math.abs(arr[i]-med); return Lab.median(d); };
Lab.mean=a=>{ let s=0; for(let i=0;i<a.length;i++) s+=a[i]; return a.length?s/a.length:0; };
Lab.std=(a,m)=>{ if(m===undefined)m=Lab.mean(a); let s=0; for(let i=0;i<a.length;i++) s+=(a[i]-m)*(a[i]-m); return a.length>1?Math.sqrt(s/(a.length-1)):0; };

Lab.fmt=(x,d)=>Number.isFinite(x)?x.toFixed(d===undefined?2:d):'—';
Lab.pct=(x,d)=>Number.isFinite(x)?(x*100).toFixed(d===undefined?0:d)+'%':'—';
Lab.esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

/* let the browser paint between heavy steps */
Lab.tick=()=>new Promise(r=>setTimeout(r,0));


/* ---------- ephemeris (JPL approximate Keplerian elements, 1800–2050) ---------- */
Lab.J2000=2451545;
Lab.jdNow=()=>Date.now()/86400000+2440587.5;
Lab.jdToDate=j=>new Date((j-2440587.5)*86400000);
Lab.PLANETS=[
 {name:'Mercury',color:'#b8ab9c',el:[0.38709927,0.00000037,0.20563593,0.00001906,7.00497902,-0.00594749,252.25032350,149472.67411175,77.45779628,0.16047689,48.33076593,-0.12534081]},
 {name:'Venus',color:'#e3c48e',el:[0.72333566,0.00000390,0.00677672,-0.00004107,3.39467605,-0.00078890,181.97909950,58517.81538729,131.60246718,0.00268329,76.67984255,-0.27769418]},
 {name:'Earth',color:'#6fa8ff',el:[1.00000261,0.00000562,0.01671123,-0.00004392,-0.00001531,-0.01294668,100.46457166,35999.37244981,102.93768193,0.32327364,0,0]},
 {name:'Mars',color:'#e0784a',el:[1.52371034,0.00001847,0.09339410,0.00007882,1.84969142,-0.00813131,-4.55343205,19140.30268499,-23.94362959,0.44441088,49.55953891,-0.29257343]},
 {name:'Jupiter',color:'#d8b48c',el:[5.20288700,-0.00011607,0.04838624,-0.00013253,1.30439695,-0.00183714,34.39644051,3034.74612775,14.72847983,0.21252668,100.47390909,0.20469106]},
 {name:'Saturn',color:'#e6cf98',el:[9.53667594,-0.00125060,0.05386179,-0.00050991,2.48599187,0.00193609,49.95424423,1222.49362201,92.59887831,-0.41897216,113.66242448,-0.28867794]},
 {name:'Uranus',color:'#9fdde6',el:[19.18916464,-0.00196176,0.04725744,-0.00004397,0.77263783,-0.00242939,313.23810451,428.48202785,170.95427630,0.40805281,74.01692503,0.04240589]},
 {name:'Neptune',color:'#5b86e6',el:[30.06992276,0.00026291,0.00859048,0.00005105,1.77004347,0.00035372,-55.12002969,218.45945325,44.96476227,-0.32241464,131.78422574,-0.00508664]}
];
Lab.kepler=function(p,jd,Eover){
  const D=Math.PI/180, T=(jd-Lab.J2000)/36525, k=p.el;
  const a=k[0]+k[1]*T, e=k[2]+k[3]*T, I=(k[4]+k[5]*T)*D, L=k[6]+k[7]*T, vp=k[8]+k[9]*T, Om=(k[10]+k[11]*T)*D;
  let M=((L-vp)%360+540)%360-180; M*=D;
  let E=Eover;
  if(E===undefined){ E=M+e*Math.sin(M); for(let i=0;i<30;i++){ const dE=(E-e*Math.sin(E)-M)/(1-e*Math.cos(E)); E-=dE; if(Math.abs(dE)<1e-12) break; } }
  const w=vp*D-Om, xp=a*(Math.cos(E)-e), yp=a*Math.sqrt(1-e*e)*Math.sin(E);
  const cw=Math.cos(w),sw=Math.sin(w),cO=Math.cos(Om),sO=Math.sin(Om),cI=Math.cos(I),sI=Math.sin(I);
  const x=(cw*cO-sw*sO*cI)*xp+(-sw*cO-cw*sO*cI)*yp, y=(cw*sO+sw*cO*cI)*xp+(-sw*sO+cw*cO*cI)*yp, z=(sw*sI)*xp+(cw*sI)*yp;
  return {x,y,z,r:Math.hypot(x,y,z),a,e,M,E};
};
/* geocentric ecliptic longitude (radians) */
Lab.geoLon=function(p,jd){ const P=Lab.kepler(p,jd), E=Lab.kepler(Lab.PLANETS[2],jd); return Math.atan2(P.y-E.y,P.x-E.x); };
Lab.isRetro=function(p,jd){ let d=Lab.geoLon(p,jd+.5)-Lab.geoLon(p,jd-.5); d=(d+3*Math.PI)%(2*Math.PI)-Math.PI; return d<0; };

/* ---------- previous / next tool links on tool pages ---------- */
Lab.TOOLS=[['orrery.html','Kepler Orrery'],['anomaly.html','Anomaly Hunter'],['mission.html','Mission Survival'],['landing.html','Landing Sites'],['discovery.html','Discovery Engine']];
document.addEventListener('DOMContentLoaded',()=>{
  const cur=document.querySelector('.nav a.tab[aria-current="page"]'), wrap=document.querySelector('main.wrap');
  if(!cur||!wrap) return;
  const i=Lab.TOOLS.findIndex(t=>t[0]===cur.getAttribute('href')); if(i<0) return;
  const prev=Lab.TOOLS[i-1], next=Lab.TOOLS[i+1];
  const el=document.createElement('nav'); el.className='pager'; el.setAttribute('aria-label','More tools');
  el.innerHTML=(prev?`<a href="${prev[0]}" class="prev"><small>Previous</small>${prev[1]}</a>`:'<span></span>')+(next?`<a href="${next[0]}" class="next"><small>Next tool</small>${next[1]}</a>`:`<a href="index.html" class="next"><small>Back to</small>Lab home</a>`);
  const foot=wrap.querySelector('.foot'); foot?wrap.insertBefore(el,foot):wrap.appendChild(el);
});

window.Lab=Lab;
})();
