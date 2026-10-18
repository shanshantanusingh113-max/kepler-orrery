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

window.Lab=Lab;
})();
