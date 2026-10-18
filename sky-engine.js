/* Solar System Lab — Tonight's sky engine (needs lab.js for planet elements)
   Planets: JPL Keplerian elements, precessed to date, light-time corrected.
   Moon: Schlyter's low-precision theory with the main perturbation terms (≈ 2′).
   Accuracy: rise/set within ~2 minutes for planets, a few minutes for the Moon. */
(function(){
"use strict";
const D2R=Math.PI/180, R2D=180/Math.PI;
const Sky={};
const norm=a=>((a%360)+360)%360;

Sky.jd=ms=>ms/86400000+2440587.5;
Sky.ms=jd=>(jd-2440587.5)*86400000;

/* ecliptic (J2000) → ecliptic of date: rotate by general precession in longitude */
function precess(v,jd){ const T=(jd-2451545)/36525, p=(1.396971*T+0.0003086*T*T)*D2R, c=Math.cos(p), s=Math.sin(p); return [v[0]*c-v[1]*s, v[0]*s+v[1]*c, v[2]]; }
function toEq(v,jd){ const T=(jd-2451545)/36525, e=(23.439291-0.0130042*T)*D2R, c=Math.cos(e), s=Math.sin(e); return [v[0], v[1]*c-v[2]*s, v[1]*s+v[2]*c]; }
function radec(v){ return {ra:Math.atan2(v[1],v[0]), dec:Math.atan2(v[2],Math.hypot(v[0],v[1]))}; }
function gmst(jd){ return norm(280.46061837+360.98564736629*(jd-2451545))*D2R; }
Sky.altaz=function(ra,dec,jd,lat,lon){
  const H=gmst(jd)+lon*D2R-ra, f=lat*D2R;
  const alt=Math.asin(Math.sin(f)*Math.sin(dec)+Math.cos(f)*Math.cos(dec)*Math.cos(H));
  const az=Math.atan2(-Math.sin(H)*Math.cos(dec),Math.cos(f)*Math.sin(dec)-Math.sin(f)*Math.cos(dec)*Math.cos(H));
  return {alt:alt*R2D, az:norm(az*R2D)};
};
const EARTH=()=>Lab.PLANETS[2];

/* geocentric ecliptic-of-date vectors */
Sky.sun=function(jd){ const e=Lab.kepler(EARTH(),jd); const v=precess([-e.x,-e.y,-e.z],jd); return {v,dist:e.r}; };
Sky.planet=function(p,jd){
  const e=Lab.kepler(EARTH(),jd); let P=Lab.kepler(p,jd);
  let d=Math.hypot(P.x-e.x,P.y-e.y,P.z-e.z); P=Lab.kepler(p,jd-d*0.0057755);   // light-time
  const v=precess([P.x-e.x,P.y-e.y,P.z-e.z],jd); d=Math.hypot(v[0],v[1],v[2]);
  return {v,dist:d,r:P.r,R:e.r};
};
Sky.moon=function(jd){
  const d=jd-2451543.5;
  const N=(125.1228-0.0529538083*d)*D2R, i=5.1454*D2R, w=(318.0634+0.1643573223*d)*D2R, a=60.2666, e=0.0549;
  const M=norm(115.3654+13.0649929509*d)*D2R;
  let E=M+e*Math.sin(M)*(1+e*Math.cos(M)); for(let k=0;k<6;k++) E-=(E-e*Math.sin(E)-M)/(1-e*Math.cos(E));
  const xv=a*(Math.cos(E)-e), yv=a*Math.sqrt(1-e*e)*Math.sin(E), v=Math.atan2(yv,xv); let r=Math.hypot(xv,yv);
  const xh=r*(Math.cos(N)*Math.cos(v+w)-Math.sin(N)*Math.sin(v+w)*Math.cos(i)), yh=r*(Math.sin(N)*Math.cos(v+w)+Math.cos(N)*Math.sin(v+w)*Math.cos(i)), zh=r*Math.sin(v+w)*Math.sin(i);
  let lon=Math.atan2(yh,xh)*R2D, lat=Math.atan2(zh,Math.hypot(xh,yh))*R2D;
  const Ms=norm(356.0470+0.9856002585*d)*D2R, ws=282.9404+4.70935e-5*d, Ls=norm(Ms*R2D+ws)*D2R, Lm=norm((N+w+M)*R2D)*D2R, Dm=Lm-Ls, F=Lm-N, Mm=M;
  const s=Math.sin, c=Math.cos;
  lon+=-1.274*s(Mm-2*Dm)+0.658*s(2*Dm)-0.186*s(Ms)-0.059*s(2*Mm-2*Dm)-0.057*s(Mm-2*Dm+Ms)+0.053*s(Mm+2*Dm)+0.046*s(2*Dm-Ms)+0.041*s(Mm-Ms)-0.035*s(Dm)-0.031*s(Mm+Ms)-0.015*s(2*F-2*Dm)+0.011*s(Mm-4*Dm);
  lat+=-0.173*s(F-2*Dm)-0.055*s(Mm-F-2*Dm)-0.046*s(Mm+F-2*Dm)+0.033*s(F+2*Dm)+0.017*s(2*Mm+F);
  r+=-0.58*c(Mm-2*Dm)-0.46*c(2*Dm);
  const L=lon*D2R, B=lat*D2R;
  return {v:[r*Math.cos(B)*Math.cos(L),r*Math.cos(B)*Math.sin(L),r*Math.sin(B)],dist:r,lon:norm(lon),lat};   // Earth radii, ecliptic of date
};
Sky.lonOf=v=>norm(Math.atan2(v[1],v[0])*R2D);
Sky.sep=(a,b)=>{ const d=(a[0]*b[0]+a[1]*b[1]+a[2]*b[2])/(Math.hypot(...a)*Math.hypot(...b)); return Math.acos(Math.max(-1,Math.min(1,d)))*R2D; };

/* apparent magnitude (Astronomical Almanac style approximations) */
Sky.mag=function(name,r,R,d){
  const i=Math.acos(Math.max(-1,Math.min(1,(r*r+d*d-R*R)/(2*r*d))))*R2D, L=5*Math.log10(r*d);
  switch(name){
    case 'Mercury': return -0.42+L+0.0380*i-0.000273*i*i+0.000002*i*i*i;
    case 'Venus': return -4.40+L+0.0009*i+0.000239*i*i-0.00000065*i*i*i;
    case 'Mars': return -1.52+L+0.016*i;
    case 'Jupiter': return -9.40+L+0.005*i;
    case 'Saturn': return -8.88+L+0.044*i;
    case 'Uranus': return -7.19+L;
    case 'Neptune': return -6.87+L;
  }
  return 99;
};

/* constellation along the ecliptic (IAU boundaries, approximate, ecliptic longitude of date) */
const ZOD=[[351.6,'Pisces','मीन'],[29.1,'Aries','मेष'],[53.5,'Taurus','वृषभ'],[90.4,'Gemini','मिथुन'],[118.3,'Cancer','कर्क'],[138.2,'Leo','सिंह'],[174.2,'Virgo','कन्या'],[218.0,'Libra','तुला'],[241.1,'Scorpius','वृश्चिक'],[248.0,'Ophiuchus','सर्पधारी'],[266.3,'Sagittarius','धनु'],[299.7,'Capricornus','मकर'],[327.6,'Aquarius','कुंभ']];
Sky.constellation=function(lon){ let best=ZOD[0]; for(const z of ZOD){ if(z[0]<=lon) best=z; } if(lon<29.1) best=ZOD[0]; if(lon>=351.6) best=ZOD[0]; return {en:best[1],hi:best[2]}; };

const DIR_EN=['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'];
const DIR_HI=['उत्तर','उत्तर','उत्तर-पूर्व','पूर्व','पूर्व','पूर्व','दक्षिण-पूर्व','दक्षिण','दक्षिण','दक्षिण','दक्षिण-पश्चिम','पश्चिम','पश्चिम','पश्चिम','उत्तर-पश्चिम','उत्तर'];
Sky.dir=az=>{ const k=Math.round(norm(az)/22.5)%16; return {en:DIR_EN[k],hi:DIR_HI[k]}; };

/* one night: from local noon of the chosen date to the next local noon */
Sky.night=function(city,noonMs,stepMin){
  stepMin=stepMin||4; const N=Math.round(24*60/stepMin)+1, out={times:[],sun:[],moon:[],planets:{}};
  const bodies=Lab.PLANETS.filter(p=>p.name!=='Earth');
  bodies.forEach(p=>out.planets[p.name]=[]);
  for(let k=0;k<N;k++){
    const ms=noonMs+k*stepMin*60000, jd=Sky.jd(ms); out.times.push(ms);
    const s=Sky.sun(jd), sq=radec(toEq(s.v,jd)), sa=Sky.altaz(sq.ra,sq.dec,jd,city.lat,city.lon); out.sun.push({...sa,v:s.v});
    const m=Sky.moon(jd), mq=radec(toEq(m.v,jd)); const ma=Sky.altaz(mq.ra,mq.dec,jd,city.lat,city.lon);
    const par=Math.asin(Math.cos(ma.alt*D2R)/m.dist)*R2D;            // topocentric parallax in altitude
    out.moon.push({alt:ma.alt-par,az:ma.az,v:m.v,dist:m.dist});
    bodies.forEach(p=>{ const g=Sky.planet(p,jd), q=radec(toEq(g.v,jd)), a=Sky.altaz(q.ra,q.dec,jd,city.lat,city.lon); out.planets[p.name].push({...a,g}); });
  }
  return out;
};
/* times when a series crosses a threshold */
Sky.crossings=function(times,series,h){
  const ev=[]; for(let k=1;k<series.length;k++){ const a=series[k-1]-h, b=series[k]-h; if((a<0)!==(b<0)){ const f=a/(a-b); ev.push({ms:times[k-1]+(times[k]-times[k-1])*f, rising:b>0}); } }
  return ev;
};
/* ecliptic line for the sky chart */
Sky.ecliptic=function(jd,lat,lon){ const pts=[]; for(let L=0;L<=360;L+=4){ const v=[Math.cos(L*D2R),Math.sin(L*D2R),0], q=radec(toEq(v,jd)); pts.push(Sky.altaz(q.ra,q.dec,jd,lat,lon)); } return pts; };

window.Sky=Sky;
})();
