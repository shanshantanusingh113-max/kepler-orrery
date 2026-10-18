/* Solar System Lab — shared three.js space effects (requires THREE r128 global) */
(function(){
"use strict";
const Space={};
const TAU=Math.PI*2;

/* ---------- small utils ---------- */
function rng(seed){ let s=(seed*2654435761)>>>0||1; return ()=>{ s^=s<<13; s>>>=0; s^=s>>>17; s^=s<<5; s>>>=0; return s/4294967296; }; }
Space.rng=rng;
function noise(seed){ // periodic in u
  const r=rng(seed), octs=[];
  for(let o=0;o<5;o++){ const gw=4<<o, gh=(2<<o)+1, g=new Float32Array(gw*gh); for(let i=0;i<g.length;i++) g[i]=r(); octs.push([gw,gh,g]); }
  const sm=t=>t*t*(3-2*t);
  return (u,v)=>{ let s=0,amp=.5,norm=0;
    for(const [gw,gh,g] of octs){ const x=u*gw,y=v*(gh-1),xi=Math.floor(x),yi=Math.min(Math.floor(y),gh-2),xf=sm(x-xi),yf=sm(y-yi),x0=((xi%gw)+gw)%gw,x1=(x0+1)%gw;
      const a=g[yi*gw+x0],b=g[yi*gw+x1],c=g[(yi+1)*gw+x0],d=g[(yi+1)*gw+x1]; s+=amp*(a+(b-a)*xf+(c-a)*yf+(a-b-c+d)*xf*yf); norm+=amp; amp*=.5; }
    return s/norm; };
}
function ramp(st,t){ t=Math.max(0,Math.min(1,t))*(st.length-1); const i=Math.min(Math.floor(t),st.length-2),f=t-i,a=st[i],b=st[i+1]; return [a[0]+(b[0]-a[0])*f,a[1]+(b[1]-a[1])*f,a[2]+(b[2]-a[2])*f]; }
const mix=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];

/* ---------- planet look ---------- */
Space.LOOK={
  Mercury:{size:.7,tilt:.03,rotH:1407.6,tex:{kind:'rock',seed:11,c:[[70,66,62],[128,120,112],[176,166,154],[214,204,192]]}},
  Venus:{size:1.2,tilt:177.4,rotH:5832.5,tex:{kind:'gas',seed:23,freq:3,turb:2.2,c:[[196,150,92],[228,196,140],[244,222,178]]}},
  Earth:{size:1.3,tilt:23.44,rotH:23.93,tex:{kind:'earth',seed:37},atmo:'#6fa8ff'},
  Mars:{size:.9,tilt:25.19,rotH:24.62,tex:{kind:'rock',seed:41,c:[[92,38,22],[150,66,36],[196,104,60],[226,156,110]]},atmo:'#e0784a'},
  Jupiter:{size:3.6,tilt:3.13,rotH:9.93,tex:{kind:'gas',seed:53,freq:13,turb:1.1,c:[[140,98,70],[204,166,126],[236,220,196],[176,120,84],[226,200,170]]}},
  Saturn:{size:3.0,tilt:26.73,rotH:10.66,ring:true,tex:{kind:'gas',seed:61,freq:16,turb:.5,c:[[176,146,98],[220,196,148],[238,222,182],[200,170,120]]}},
  Uranus:{size:2.0,tilt:97.77,rotH:17.24,tex:{kind:'gas',seed:71,freq:5,turb:.3,c:[[140,200,212],[168,222,228],[150,210,220]]},atmo:'#9fdde6'},
  Neptune:{size:1.95,tilt:28.32,rotH:16.11,tex:{kind:'gas',seed:83,freq:7,turb:.9,c:[[38,62,150],[62,100,200],[90,130,220],[44,74,170]]},atmo:'#5b86e6'}
};
Space.planetTexture=function(spec,W,H){
  W=W||512; H=H||256;
  const cv=document.createElement('canvas'); cv.width=W; cv.height=H;
  const ctx=cv.getContext('2d'), img=ctx.createImageData(W,H), D=img.data, n=noise(spec.seed), n2=noise(spec.seed*7+3);
  for(let y=0;y<H;y++) for(let x=0;x<W;x++){
    const u=x/W,v=y/H; let c;
    if(spec.kind==='rock'){ const t=n(u,v),d=n2(u,v); c=ramp(spec.c,(t-.28)/.44); if(d>.62) c=mix(c,[c[0]*.6,c[1]*.6,c[2]*.6],Math.min(1,(d-.62)*4)); }
    else if(spec.kind==='gas'){ const w=n(u,v), b=v*spec.freq+(w-.5)*spec.turb, s=(Math.sin(b*TAU)+1)/2; c=ramp(spec.c,s*.82+n2(u,v)*.18); }
    else { const lat=Math.abs(v-.5)*2, h=n(u,v);
      if(lat>.8+(h-.5)*.25) c=[232,238,244]; else if(h>.53) c=ramp([[58,104,48],[104,126,64],[164,142,96]],(n2(u,v)-.3)/.45+lat*.25); else c=ramp([[8,26,78],[24,72,138]],(h-.25)/.28);
      const cl=n2((u+.37)%1,v*.8+.1); if(cl>.58) c=mix(c,[245,247,250],Math.min(.85,(cl-.58)*2.6)); }
    const i=(y*W+x)*4; D[i]=c[0]; D[i+1]=c[1]; D[i+2]=c[2]; D[i+3]=255;
  }
  ctx.putImageData(img,0,0); const t=new THREE.CanvasTexture(cv); t.anisotropy=4; return t;
};
Space.glowTexture=function(stops){
  const s=256, cv=document.createElement('canvas'); cv.width=cv.height=s; const g=cv.getContext('2d'), gr=g.createRadialGradient(s/2,s/2,0,s/2,s/2,s/2);
  (stops||[[0,'rgba(255,220,150,1)'],[.2,'rgba(255,170,70,.55)'],[.5,'rgba(255,120,40,.12)'],[1,'rgba(255,100,30,0)']]).forEach(([o,c])=>gr.addColorStop(o,c));
  g.fillStyle=gr; g.fillRect(0,0,s,s); return new THREE.CanvasTexture(cv);
};
function rayTexture(){
  const s=512, cv=document.createElement('canvas'); cv.width=cv.height=s; const g=cv.getContext('2d'), r=rng(77);
  g.translate(s/2,s/2); g.globalCompositeOperation='lighter';
  for(let i=0;i<48;i++){ const a=r()*TAU, len=s*(.22+r()*.28), w=.012+r()*.03;
    const gr=g.createLinearGradient(0,0,Math.cos(a)*len,Math.sin(a)*len); gr.addColorStop(0,'rgba(255,200,120,.35)'); gr.addColorStop(1,'rgba(255,140,60,0)');
    g.fillStyle=gr; g.beginPath(); g.moveTo(0,0); g.lineTo(Math.cos(a-w)*len,Math.sin(a-w)*len); g.lineTo(Math.cos(a+w)*len,Math.sin(a+w)*len); g.closePath(); g.fill(); }
  return new THREE.CanvasTexture(cv);
}
function ringTexture(){
  const W=512, cv=document.createElement('canvas'); cv.width=W; cv.height=4; const g=cv.getContext('2d'), r=rng(99);
  for(let x=0;x<W;x++){ const t=x/W; let a=.35+.25*Math.sin(t*40+r()*.6)+.25*r(); if(t>.58&&t<.63) a*=.12; a*=Math.min(1,t*6)*Math.min(1,(1-t)*5);
    const c=ramp([[150,128,98],[214,196,160],[236,222,190],[180,160,128]],t); g.fillStyle=`rgba(${c[0]|0},${c[1]|0},${c[2]|0},${Math.max(0,Math.min(1,a)).toFixed(3)})`; g.fillRect(x,0,1,4); }
  return new THREE.CanvasTexture(cv);
}

/* ---------- animated sun ---------- */
const NOISE_GLSL=`
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0); const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy)); vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz); vec3 l=1.0-g; vec3 i1=min(g.xyz,l.zxy); vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx; vec3 x2=x0-i2+C.yyy; vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857; vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z); vec4 x_=floor(j*ns.z); vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy; vec4 y=y_*ns.x+ns.yyyy; vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy); vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0; vec4 s1=floor(b1)*2.0+1.0; vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy; vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x); vec3 p1=vec3(a0.zw,h.y); vec3 p2=vec3(a1.xy,h.z); vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x; p1*=norm.y; p2*=norm.z; p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0); m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}`;
Space.makeSun=function(radius){
  const grp=new THREE.Group();
  const mat=new THREE.ShaderMaterial({
    uniforms:{uTime:{value:0}},
    vertexShader:`varying vec3 vPos; varying vec3 vN; varying vec3 vView;
      void main(){ vPos=position; vN=normalize(normalMatrix*normal); vec4 mv=modelViewMatrix*vec4(position,1.0); vView=normalize(-mv.xyz); gl_Position=projectionMatrix*mv; }`,
    fragmentShader:NOISE_GLSL+`
      uniform float uTime; varying vec3 vPos; varying vec3 vN; varying vec3 vView;
      void main(){
        vec3 p=normalize(vPos)*2.2;
        float n=snoise(p+vec3(uTime*.05,uTime*.03,0.0))*.55+snoise(p*2.7-vec3(0.0,uTime*.08,uTime*.04))*.3+snoise(p*7.0+uTime*.12)*.15;
        float cells=smoothstep(-.2,.7,n);
        vec3 deep=vec3(.95,.36,.05), mid=vec3(1.0,.62,.16), hot=vec3(1.0,.9,.62);
        vec3 col=mix(deep,mid,cells); col=mix(col,hot,smoothstep(.55,1.0,cells));
        float mu=clamp(dot(vN,vView),0.0,1.0);
        col*=.55+.6*pow(mu,.45);
        col+=vec3(1.0,.55,.15)*pow(1.0-mu,2.5)*.6;
        gl_FragColor=vec4(col,1.0);
      }`
  });
  const mesh=new THREE.Mesh(new THREE.SphereGeometry(radius,64,48),mat); grp.add(mesh);
  const glow=new THREE.Sprite(new THREE.SpriteMaterial({map:Space.glowTexture(),blending:THREE.AdditiveBlending,depthWrite:false,transparent:true}));
  glow.scale.set(radius*8.5,radius*8.5,1); grp.add(glow);
  const rays=new THREE.Sprite(new THREE.SpriteMaterial({map:rayTexture(),blending:THREE.AdditiveBlending,depthWrite:false,transparent:true,opacity:.55}));
  rays.scale.set(radius*11,radius*11,1); grp.add(rays);
  const halo=new THREE.Sprite(new THREE.SpriteMaterial({map:Space.glowTexture([[0,'rgba(255,160,80,.0)'],[.25,'rgba(255,150,70,.16)'],[.6,'rgba(255,110,40,.05)'],[1,'rgba(255,90,30,0)']]),blending:THREE.AdditiveBlending,depthWrite:false,transparent:true}));
  halo.scale.set(radius*22,radius*22,1); grp.add(halo);
  grp.userData.update=t=>{ mat.uniforms.uTime.value=t; rays.material.rotation=t*.02; const k=1+.04*Math.sin(t*1.3)+.02*Math.sin(t*3.1); glow.scale.set(radius*8.5*k,radius*8.5*k,1); rays.material.opacity=.45+.12*Math.sin(t*.7); };
  grp.userData.mesh=mesh;
  return grp;
};

/* ---------- twinkling starfield ---------- */
Space.makeStars=function(count,R){
  const r=rng(5), pos=new Float32Array(count*3), col=new Float32Array(count*3), size=new Float32Array(count), ph=new Float32Array(count);
  for(let i=0;i<count;i++){
    const band=i<count*.45; let u=r()*2-1, th=r()*TAU;
    if(band){ u=(r()-.5)*.28*(r()+.2); }
    const s=Math.sqrt(1-u*u); let x=s*Math.cos(th), y=u, z=s*Math.sin(th);
    // tilt the galactic band
    const yy=y*Math.cos(1.05)-z*Math.sin(1.05), zz=y*Math.sin(1.05)+z*Math.cos(1.05);
    pos.set([x*R,yy*R,zz*R],i*3);
    const t=r(), b=.5+r()*.5; col.set(t<.12?[b,b*.82,b*.66]:t<.28?[b*.78,b*.86,b]:[b,b,b*.98],i*3);
    size[i]=(band?1.1:1.4)+Math.pow(r(),6)*3.2; ph[i]=r()*TAU;
  }
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.BufferAttribute(pos,3)); g.setAttribute('color',new THREE.BufferAttribute(col,3));
  g.setAttribute('aSize',new THREE.BufferAttribute(size,1)); g.setAttribute('aPh',new THREE.BufferAttribute(ph,1));
  const mat=new THREE.ShaderMaterial({uniforms:{uTime:{value:0},uPR:{value:Math.min(2,window.devicePixelRatio||1)}},transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,vertexColors:true,
    vertexShader:`attribute float aSize; attribute float aPh; uniform float uTime; uniform float uPR; varying vec3 vC; varying float vA;
      void main(){ vC=color; float tw=.65+.35*sin(uTime*(1.2+fract(aPh)*2.5)+aPh*7.0); vA=tw; gl_PointSize=aSize*uPR*(.8+.4*tw); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
    fragmentShader:`varying vec3 vC; varying float vA; void main(){ float d=length(gl_PointCoord-.5); float a=smoothstep(.5,.0,d); gl_FragColor=vec4(vC,a*vA); }`});
  const pts=new THREE.Points(g,mat); pts.frustumCulled=false;
  pts.userData.update=t=>{ mat.uniforms.uTime.value=t; };
  return pts;
};
/* soft nebula sprites far away */
Space.makeNebula=function(R){
  const grp=new THREE.Group(), r=rng(13);
  const cols=[['80,110,200','.10'],['150,90,170','.07'],['200,120,80','.05'],['60,150,170','.06']];
  for(let i=0;i<5;i++){ const c=cols[i%cols.length];
    const tex=Space.glowTexture([[0,`rgba(${c[0]},${c[1]})`],[.5,`rgba(${c[0]},${(c[1]*.35).toFixed(3)})`],[1,`rgba(${c[0]},0)`]]);
    const s=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,blending:THREE.AdditiveBlending,depthWrite:false,transparent:true}));
    const th=r()*TAU, u=(r()-.5)*.6; s.position.set(Math.cos(th)*R,u*R,Math.sin(th)*R); const k=R*(.6+r()*.7); s.scale.set(k,k*(.5+r()*.5),1); grp.add(s); }
  return grp;
};

/* ---------- asteroid belt (orbits computed on the GPU) ---------- */
Space.makeBelt=function(count){
  const r=rng(31), aR=new Float32Array(count), aTh=new Float32Array(count), aY=new Float32Array(count), aS=new Float32Array(count), pos=new Float32Array(count*3);
  for(let i=0;i<count;i++){
    let R=2.15+r()*1.15; // Kirkwood-ish gaps
    if(Math.abs(R-2.5)<.03||Math.abs(R-2.82)<.03||Math.abs(R-2.95)<.02) R+=.05;
    aR[i]=R; aTh[i]=r()*TAU; aY[i]=(r()-.5)*(r()<.85?.8:2.6); aS[i]=.8+Math.pow(r(),3)*2.2;
  }
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.BufferAttribute(pos,3)); g.setAttribute('aR',new THREE.BufferAttribute(aR,1)); g.setAttribute('aTh',new THREE.BufferAttribute(aTh,1)); g.setAttribute('aY',new THREE.BufferAttribute(aY,1)); g.setAttribute('aS',new THREE.BufferAttribute(aS,1));
  const mat=new THREE.ShaderMaterial({uniforms:{uDays:{value:0},uTrue:{value:0},uPR:{value:Math.min(2,window.devicePixelRatio||1)}},transparent:true,depthWrite:false,
    vertexShader:`attribute float aR; attribute float aTh; attribute float aY; attribute float aS; uniform float uDays; uniform float uTrue; uniform float uPR; varying float vD;
      void main(){ float ang=aTh+uDays*0.0172021*pow(aR,-1.5); float rs=mix(12.0+24.0*pow(aR,0.6),aR*36.0,uTrue);
        vec3 p=vec3(cos(ang)*rs,aY*(1.0+uTrue*1.5),-sin(ang)*rs); vec4 mv=modelViewMatrix*vec4(p,1.0); vD=-mv.z;
        gl_PointSize=clamp(aS*uPR*260.0/vD,1.0,4.0*uPR); gl_Position=projectionMatrix*mv; }`,
    fragmentShader:`varying float vD; void main(){ float d=length(gl_PointCoord-.5); if(d>.5) discard; gl_FragColor=vec4(.78,.72,.64,.55*smoothstep(.5,.15,d)); }`});
  const pts=new THREE.Points(g,mat); pts.frustumCulled=false;
  pts.userData.update=(days,isTrue)=>{ mat.uniforms.uDays.value=days; mat.uniforms.uTrue.value=isTrue?1:0; };
  return pts;
};

/* ---------- planet mesh with tilt, spin, rings, atmosphere ---------- */
Space.makePlanet=function(name){
  const L=Space.LOOK[name], root=new THREE.Object3D(), tilt=new THREE.Object3D();
  tilt.rotation.z=L.tilt*Math.PI/180; root.add(tilt);
  const mesh=new THREE.Mesh(new THREE.SphereGeometry(L.size,48,32),new THREE.MeshStandardMaterial({map:Space.planetTexture(L.tex),roughness:.95,metalness:0}));
  tilt.add(mesh);
  if(L.atmo){ const a=new THREE.Sprite(new THREE.SpriteMaterial({map:Space.glowTexture([[0,'rgba(255,255,255,0)'],[.42,'rgba(255,255,255,0)'],[.5,hexA(L.atmo,.55)],[.62,hexA(L.atmo,.14)],[1,hexA(L.atmo,0)]]),blending:THREE.AdditiveBlending,depthWrite:false,transparent:true}));
    a.scale.set(L.size*4,L.size*4,1); root.add(a); }
  if(L.ring){ const ri=L.size*1.25, ro=L.size*2.35, rg=new THREE.RingGeometry(ri,ro,160,1), P=rg.attributes.position, U=rg.attributes.uv, v=new THREE.Vector3();
    for(let i=0;i<P.count;i++){ v.fromBufferAttribute(P,i); U.setXY(i,(v.length()-ri)/(ro-ri),.5); }
    const ring=new THREE.Mesh(rg,new THREE.MeshBasicMaterial({map:ringTexture(),transparent:true,side:THREE.DoubleSide,depthWrite:false,opacity:.92})); ring.rotation.x=-Math.PI/2; tilt.add(ring); }
  root.userData={mesh,look:L};
  return root;
};
function hexA(h,a){ const n=parseInt(h.slice(1),16); return `rgba(${n>>16&255},${n>>8&255},${n&255},${a})`; }
Space.hexA=hexA;

/* ---------- fading trail ---------- */
Space.makeTrail=function(color,n){
  const pos=new Float32Array(n*3), col=new Float32Array(n*3), c=new THREE.Color(color);
  for(let i=0;i<n;i++){ const k=Math.pow(i/(n-1),1.6); col.set([c.r*k,c.g*k,c.b*k],i*3); }
  const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(pos,3)); g.setAttribute('color',new THREE.BufferAttribute(col,3));
  const line=new THREE.Line(g,new THREE.LineBasicMaterial({vertexColors:true,transparent:true,opacity:.95,blending:THREE.AdditiveBlending,depthWrite:false})); line.frustumCulled=false;
  line.userData.set=(arr)=>{ for(let i=0;i<n;i++){ const v=arr[Math.min(i,arr.length-1)]; pos[i*3]=v.x; pos[i*3+1]=v.y; pos[i*3+2]=v.z; } g.attributes.position.needsUpdate=true; };
  return line;
};

/* ---------- comet with an anti-sunward tail ---------- */
Space.makeComet=function(toScene){
  const grp=new THREE.Group(), N=260;
  const head=new THREE.Sprite(new THREE.SpriteMaterial({map:Space.glowTexture([[0,'rgba(235,245,255,1)'],[.18,'rgba(170,210,255,.7)'],[.5,'rgba(120,170,255,.12)'],[1,'rgba(100,150,255,0)']]),blending:THREE.AdditiveBlending,depthWrite:false,transparent:true}));
  head.scale.set(3,3,1); grp.add(head);
  const pos=new Float32Array(N*3), seed=new Float32Array(N), g=new THREE.BufferGeometry(), r=rng(3);
  for(let i=0;i<N;i++) seed[i]=r();
  g.setAttribute('position',new THREE.BufferAttribute(pos,3)); g.setAttribute('aSeed',new THREE.BufferAttribute(seed,1));
  const mat=new THREE.ShaderMaterial({uniforms:{uPR:{value:Math.min(2,window.devicePixelRatio||1)},uFade:{value:1}},transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
    vertexShader:`attribute float aSeed; uniform float uPR; varying float vS; void main(){ vS=aSeed; vec4 mv=modelViewMatrix*vec4(position,1.0); gl_PointSize=clamp((2.5-aSeed*1.6)*uPR*180.0/-mv.z,1.0,6.0*uPR); gl_Position=projectionMatrix*mv; }`,
    fragmentShader:`varying float vS; uniform float uFade; void main(){ float d=length(gl_PointCoord-.5); if(d>.5) discard; gl_FragColor=vec4(mix(vec3(.85,.93,1.0),vec3(.45,.65,1.0),vS),(1.0-vS)*.55*uFade*smoothstep(.5,.0,d)); }`});
  const tail=new THREE.Points(g,mat); tail.frustumCulled=false; grp.add(tail);
  // orbital elements, re-rolled for each pass
  let el=null; const R=rng(101);
  function roll(jd){ el={a:7+R()*5,e:.94+R()*.04,i:(10+R()*50)*Math.PI/180,w:R()*TAU,O:R()*TAU,tp:jd+28+R()*20}; }
  function state(jd){
    const n=0.0172021*Math.pow(el.a,-1.5); let M=n*(jd-el.tp); M=((M+Math.PI)%TAU+TAU)%TAU-Math.PI;
    let E=Math.abs(M)<.3?M+el.e*Math.sin(M):M+Math.sign(M)*el.e; for(let k=0;k<60;k++){ const d=(E-el.e*Math.sin(E)-M)/(1-el.e*Math.cos(E)); E-=d; if(Math.abs(d)<1e-10) break; }
    const xp=el.a*(Math.cos(E)-el.e), yp=el.a*Math.sqrt(1-el.e*el.e)*Math.sin(E);
    const cw=Math.cos(el.w),sw=Math.sin(el.w),cO=Math.cos(el.O),sO=Math.sin(el.O),cI=Math.cos(el.i),sI=Math.sin(el.i);
    return [(cw*cO-sw*sO*cI)*xp+(-sw*cO-cw*sO*cI)*yp,(cw*sO+sw*cO*cI)*xp+(-sw*sO+cw*cO*cI)*yp,(sw*sI)*xp+(cw*sI)*yp];
  }
  const v=new THREE.Vector3(), dir=new THREE.Vector3();
  grp.userData.update=(jd)=>{
    if(!el) roll(jd);
    let p=state(jd), rr=Math.hypot(p[0],p[1],p[2]);
    if(rr>6.5&&jd>el.tp){ roll(jd); p=state(jd); rr=Math.hypot(p[0],p[1],p[2]); }
    toScene(p,v); head.position.copy(v);
    const act=Math.max(0,Math.min(1,(5-rr)/3.5));       // activity rises as it nears the Sun
    head.material.opacity=.25+.75*act; head.scale.setScalar(2.2+3.5*act); mat.uniforms.uFade.value=act;
    dir.copy(v).normalize(); const len=(4+38*act)*(1+1/Math.max(.3,rr));
    for(let i=0;i<N;i++){ const s=seed[i], d=len*Math.pow(s,.8);
      pos[i*3]=v.x+dir.x*d+(r()-.5)*s*2.2; pos[i*3+1]=v.y+dir.y*d+(r()-.5)*s*2.2; pos[i*3+2]=v.z+dir.z*d+(r()-.5)*s*2.2; }
    g.attributes.position.needsUpdate=true;
    return {pos:v,r:rr,active:act};
  };
  return grp;
};

window.Space=Space;
})();
