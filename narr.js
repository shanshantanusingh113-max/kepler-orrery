/* Solar System Lab — narration player: nav button + caption dock (shared by all lab pages) */
(function(){
"use strict";
const NARR={hi:{src:"intro-hi.mp3",lang:"hi",caps:[[1.6, 2.65, "ऊपर देखिए।", "Look up."], [3.65, 8.6, "आप जो भी ग्रह देख रहे हैं, वो आज ठीक उसी जगह है, जहाँ वो असल में है।", "Every planet you see is exactly where it really is today."], [9.0, 10.33, "ये कोई ड्रॉइंग नहीं है।", "This is not a drawing."], [10.63, 11.88, "ये असली गणित है।", "This is real maths."], [12.88, 14.65, "ये है, सोलर सिस्टम लैब।", "This is Solar System Lab."], [15.45, 20.04, "आठों ग्रह, केप्लर के नियमों से, आपके ब्राउज़र में, हर पल लाइव चलते हैं।", "All eight planets run live in your browser, every moment, from Kepler's laws."], [20.74, 22.53, "और ये तो सिर्फ़ शुरुआत है।", "And this is only the beginning."], [23.38, 26.14, "मंगल ग्रह की सतह पर, नए गड्ढे खोजिए।", "Find new craters on the surface of Mars."], [26.59, 31.85, "धूल भरी आँधियों और बर्फ़ीली रातों में, रोवर को परखिए, धरती छोड़ने से पहले ही।", "Test a rover through dust storms and icy nights, before it even leaves Earth."], [32.3, 36.92, "वो जगह ढूँढिए, जहाँ उतरना सुरक्षित भी हो, और नई खोज भी हो सके।", "Find the place where landing is safe, and new discoveries are possible."], [37.42, 42.55, "और जब डेटा आपको चौंकाए, तो पता कीजिए, कि ये सच में नई खोज है, या सिर्फ़ एक गड़बड़।", "And when the data surprises you, find out whether it's a real discovery, or just a glitch."], [43.4, 44.9, "कुछ इंस्टॉल नहीं करना।", "Nothing to install."], [45.15, 46.2, "कोई अकाउंट नहीं।", "No account."], [46.5, 49.46, "बस पूरा सौरमंडल, और उसे समझने के टूल्स।", "Just the whole solar system, and the tools to understand it."], [50.46, 51.72, "सोलर सिस्टम लैब।", "Solar System Lab."], [52.27, 54.67, "पूरा सौरमंडल, गणित की ताक़त से।", "The whole solar system, powered by maths."]]},en:{src:"intro-en.mp3",lang:"en",caps:[[1.6, 2.09, "Look up.", ""], [3.09, 5.96, "Every planet you see is exactly where it is today.", ""], [6.31, 7.03, "Not drawn.", ""], [7.33, 7.99, "Computed.", ""], [8.99, 10.45, "This is Solar System Lab.", ""], [11.25, 16.63, "Eight worlds, solved from Kepler's laws, live in your browser, on every single frame.", ""], [17.28, 18.91, "And this is only the beginning.", ""], [19.76, 22.33, "Hunt for new craters on the surface of Mars.", ""], [22.78, 26.85, "Put a rover through dust storms and frozen nights, before it ever leaves Earth.", ""], [27.3, 30.45, "Find the landing site where safety and discovery meet.", ""], [30.95, 35.8, "And when the data surprises you, find out if it is a real discovery, or just a glitch.", ""], [36.65, 38.1, "No installs.", ""], [38.35, 39.14, "No accounts.", ""], [39.44, 42.17, "Just the solar system, and the tools to question it.", ""], [43.17, 44.41, "Solar System Lab.", ""], [44.96, 46.66, "The solar system, computed.", ""]]}};

function mount(){
  const nav=document.querySelector('.nav'); if(!nav||document.getElementById('listenBtn')) return;
  nav.insertAdjacentHTML('beforeend','<button class="navlisten" id="listenBtn" type="button" aria-pressed="false" aria-label="हिन्दी में सुनिए, listen to a 58 second introduction to Solar System Lab"><span class="wave" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span><span class="lt"><b id="listenTxt">सुनिए</b><small id="listenSub">58s</small></span><span class="prog" aria-hidden="true"><i></i></span></button>');
  document.body.insertAdjacentHTML('beforeend','<section class="narr" id="narr" hidden tabindex="-1" aria-label="Project narration player">\n  <div class="narr-main">\n    <button class="np" id="narrPlay" type="button" aria-label="Pause"><svg class="ring" viewBox="0 0 52 52" aria-hidden="true"><circle cx="26" cy="26" r="24" stroke="rgba(242,176,74,.18)"/><circle class="arc" cx="26" cy="26" r="24" stroke="#ffd68a" stroke-linecap="round" stroke-dasharray="150.8" stroke-dashoffset="150.8"/></svg><span class="core"></span><svg class="ico" viewBox="0 0 16 16" aria-hidden="true"><path id="npIco" d="M4 2h3v12H4zM9 2h3v12H9z"/></svg></button>\n    <div class="narr-cap"><p class="narr-line" id="narrLine" lang="hi" aria-live="polite"></p><p class="narr-sub" id="narrSub"></p></div>\n    <div class="narr-side">\n      <div class="seg" id="langSeg" role="group" aria-label="Narration language"><button data-l="hi" aria-pressed="true">हिन्दी</button><button data-l="en" aria-pressed="false">English</button></div>\n      <div class="row1">\n        <button class="ib2" id="narrPrev" type="button" aria-label="Previous sentence"><svg viewBox="0 0 16 16"><path d="M3 2h2v12H3zM14 2v12L6 8z"/></svg></button>\n        <button class="ib2" id="narrNext" type="button" aria-label="Next sentence"><svg viewBox="0 0 16 16"><path d="M11 2h2v12h-2zM2 2v12l8-6z"/></svg></button>\n        <button class="ib2" id="narrClose" type="button" aria-label="Close player"><svg viewBox="0 0 16 16"><path d="M3.5 2.1 8 6.6l4.5-4.5 1.4 1.4L9.4 8l4.5 4.5-1.4 1.4L8 9.4l-4.5 4.5-1.4-1.4L6.6 8 2.1 3.5z"/></svg></button>\n      </div>\n    </div>\n  </div>\n  <canvas class="narr-viz" id="narrViz" aria-hidden="true"></canvas>\n  <div class="narr-seek"><span id="narrCur">0:00</span><div class="seek" id="seek" role="slider" tabindex="0" aria-label="Seek" aria-valuemin="0" aria-valuemax="58" aria-valuenow="0"><div class="track"></div><div class="fill" id="seekFill"></div><div id="seekTicks"></div><div class="knob" id="seekKnob"></div><div class="hov" id="seekHov">0:00</div></div><span id="narrDur">0:58</span></div>\n  <p class="narr-keys">Space play/pause · ← → previous/next sentence · Esc close</p>\n</section>\n<audio id="narrAudio" preload="metadata"></audio>');
  const $=id=>document.getElementById(id);
(function(){
  const au=$('narrAudio'), btn=$('listenBtn'), box=$('narr'), line=$('narrLine'), sub=$('narrSub');
  const PLAY='M4.5 2.5v11l9-5.5z', PAUSE='M4 2h3v12H4zM9 2h3v12H9z';
  const arcs=[btn.querySelector('.prog i'),box.querySelector('.np .arc')];
  let lang='hi', idx=-1, words=[], prevSpeed=null, actx=null, an=null, freq=null, silentFrames=0, raf=null;
  const fmt=t=>{ t=Math.max(0,t||0); return Math.floor(t/60)+':'+String(Math.floor(t%60)).padStart(2,'0'); };
  const caps=()=>NARR[lang].caps, dur=()=>au.duration||caps()[caps().length-1][1]+3;
  function buildTicks(){ const T=$('seekTicks'); T.innerHTML=caps().map(c=>`<i class="tick" style="left:${(c[0]/dur()*100).toFixed(2)}%"></i>`).join(''); $('narrDur').textContent=fmt(dur()); $('seek').setAttribute('aria-valuemax',Math.round(dur())); }
  function load(l){ const was=!au.paused&&!au.ended; au.pause(); lang=l; au.src=NARR[l].src; line.lang=NARR[l].lang; idx=-1; line.innerHTML=''; sub.textContent='';
    [...$('langSeg').children].forEach(b=>b.setAttribute('aria-pressed',b.dataset.l===l));
    $('listenTxt').textContent=l==='hi'?'सुनिए':'Listen'; $('listenSub').textContent=l==='hi'?'58s':'50s';
    buildTicks(); render(); if(was) play(); }
  au.addEventListener('loadedmetadata',buildTicks);
  function cinematic(on){ if(typeof window.__narrCinematic==='function') window.__narrCinematic(on); }
  function setIcons(playing){ btn.setAttribute('aria-label',playing?'Pause narration':'हिन्दी में सुनिए, listen to a 58 second introduction to Solar System Lab'); $('npIco').setAttribute('d',playing?PAUSE:PLAY); $('narrPlay').setAttribute('aria-label',playing?'Pause':'Play'); btn.setAttribute('aria-pressed',playing); }
  function initAudioGraph(){ if(actx) return; try{ actx=new (window.AudioContext||window.webkitAudioContext)(); const src=actx.createMediaElementSource(au); an=actx.createAnalyser(); an.fftSize=256; an.smoothingTimeConstant=.78; src.connect(an); an.connect(actx.destination); freq=new Uint8Array(an.frequencyBinCount); }catch(e){ actx=null; an=null; } }
  function play(){ box.hidden=false; initAudioGraph(); if(actx&&actx.state==='suspended') actx.resume();
    if(au.ended) au.currentTime=0;
    const p=au.play(); if(p&&p.catch) p.catch(()=>{ sub.textContent='The browser blocked audio. Press play again.'; setIcons(false); });
    setIcons(true); cinematic(true); loop(); }
  function pause(){ au.pause(); setIcons(false); cinematic(false); }
  function close(){ pause(); box.hidden=true; }
  btn.onclick=()=>{ if(au.paused||au.ended) play(); else pause(); };
  $('narrPlay').onclick=btn.onclick;
  $('narrClose').onclick=close;
  $('langSeg').querySelectorAll('button').forEach(b=>b.onclick=()=>load(b.dataset.l));
  const jump=d=>{ const c=caps(), t=au.currentTime; let k=-1; for(let i=0;i<c.length;i++) if(t>=c[i][0]-.05) k=i; let n=d<0?(t-(c[k]?c[k][0]:0)>1.2?k:k-1):k+1; n=Math.max(0,Math.min(c.length-1,n)); au.currentTime=c[n][0]; if(au.paused) play(); else render(); };
  $('narrPrev').onclick=()=>jump(-1); $('narrNext').onclick=()=>jump(1);
  box.addEventListener('keydown',e=>{ if(e.target.closest('.seg')&&e.key!=='Escape') return;
    if(e.key===' '||e.key==='k'){ e.preventDefault(); btn.onclick(); } else if(e.key==='ArrowLeft'){ e.preventDefault(); jump(-1); } else if(e.key==='ArrowRight'){ e.preventDefault(); jump(1); } else if(e.key==='Escape'){ close(); btn.focus(); } });
  // seek bar
  const seek=$('seek'), at=e=>{ const r=seek.getBoundingClientRect(); return Math.max(0,Math.min(1,(e.clientX-r.left)/r.width)); };
  let drag=false;
  seek.addEventListener('pointerdown',e=>{ drag=true; seek.setPointerCapture(e.pointerId); au.currentTime=at(e)*dur(); render(); });
  seek.addEventListener('pointermove',e=>{ const f=at(e); $('seekHov').style.left=(f*100)+'%'; $('seekHov').textContent=fmt(f*dur()); if(drag){ au.currentTime=f*dur(); render(); } });
  seek.addEventListener('pointerup',()=>{ drag=false; });
  seek.addEventListener('keydown',e=>{ if(e.key==='ArrowLeft'||e.key==='ArrowRight'){ e.preventDefault(); e.stopPropagation(); au.currentTime=Math.max(0,Math.min(dur(),au.currentTime+(e.key==='ArrowLeft'?-5:5))); render(); } });
  // captions with word-by-word highlight
  function setLine(k){ idx=k; const c=caps()[k]; if(!c){ line.innerHTML=''; sub.textContent=''; words=[]; return; }
    const parts=c[2].split(/(\s+)/), lens=parts.map(p=>/^\s+$/.test(p)?0:Math.max(1,p.replace(/[,।.]/g,'').length)), tot=lens.reduce((a,b)=>a+b,0)||1;
    let acc=0; words=[]; line.innerHTML='';
    parts.forEach((p,i)=>{ if(lens[i]===0){ line.appendChild(document.createTextNode(p)); return; } const sp=document.createElement('span'); sp.className='w'; sp.textContent=p; line.appendChild(sp);
      words.push({el:sp,t:c[0]+(c[1]-c[0])*acc/tot}); acc+=lens[i]; });
    sub.textContent=c[3]||''; }
  function render(){ const t=au.currentTime, c=caps(), D=dur();
    let k=-1; for(let i=0;i<c.length;i++) if(t>=c[i][0]-.08) k=i;
    if(k!==idx) setLine(k);
    words.forEach((w,i)=>{ const on=t>=w.t-.02, nx=words[i+1]; w.el.classList.toggle('on',on); w.el.classList.toggle('now',on&&(!nx||t<nx.t)&&k>=0&&t<=c[k][1]+.15); });
    const f=Math.min(1,t/D); $('seekFill').style.width=(f*100)+'%'; $('seekKnob').style.left=(f*100)+'%'; $('narrCur').textContent=fmt(t); seek.setAttribute('aria-valuenow',Math.round(t));
    arcs[0].style.width=(f*100).toFixed(2)+'%'; arcs[1].style.strokeDashoffset=(150.8*(1-f)).toFixed(1);
    if(!au.paused) $('listenSub').textContent=fmt(t); }
  // visualizer
  const cv=$('narrViz'), g=cv.getContext('2d');
  function drawViz(){ const d=Math.min(2,devicePixelRatio||1), W=Math.round(cv.clientWidth*d), H=Math.round(cv.clientHeight*d); if(cv.width!==W||cv.height!==H){ cv.width=W; cv.height=H; }
    g.clearRect(0,0,W,H); const N=Math.max(24,Math.floor(W/(7*d))), bw=W/N;
    let real=false; if(an&&!au.paused){ an.getByteFrequencyData(freq); let sum=0; for(const v of freq) sum+=v; if(sum>0){ real=true; silentFrames=0; } else silentFrames++; }
    const t=au.currentTime, c=caps(), speaking=c.some(x=>t>=x[0]&&t<=x[1])&&!au.paused, now=performance.now()/1000;
    const cs=getComputedStyle(document.documentElement), lo=cs.getPropertyValue('--sun-lo').trim()||'#c9832a', hi=cs.getPropertyValue('--sun-hi').trim()||'#ffd68a'; const grd=g.createLinearGradient(0,0,W,0); grd.addColorStop(0,lo); grd.addColorStop(.5,hi); grd.addColorStop(1,lo); g.fillStyle=grd;
    for(let i=0;i<N;i++){ const m=Math.abs(i-(N-1)/2)/((N-1)/2); let v;
      if(real){ const bin=Math.floor(2+m*freq.length*.5); v=Math.min(1,freq[bin]/255*1.15); }
      else v=au.paused?.04:(speaking?(.25+.55*Math.abs(Math.sin(now*9+i*.7)*Math.sin(now*3.3+i*.31))):.06)*(1-m*.6);
      const h=Math.max(2*d,v*H*.95), x=i*bw+bw*.2; g.globalAlpha=.35+.65*v; g.fillRect(x,(H-h)/2,bw*.6,h); }
    g.globalAlpha=1;
    let lv=.08; if(real){ let s2=0; for(let i=2;i<40;i++) s2+=freq[i]; lv=Math.min(1,s2/38/170); } else if(speaking) lv=.35+.4*Math.abs(Math.sin(now*8)); btn.style.setProperty('--lv',lv.toFixed(3)); }
  function loop(){ cancelAnimationFrame(raf); const step=()=>{ render(); drawViz(); if(!au.paused&&!box.hidden) raf=requestAnimationFrame(step); }; raf=requestAnimationFrame(step); }
  au.addEventListener('pause',()=>{ render(); drawViz(); });
  au.addEventListener('ended',()=>{ setIcons(false); cinematic(false); $('listenSub').textContent='↻'; $('npIco').setAttribute('d','M8 2.5a5.5 5.5 0 1 1-5.2 3.7l1.5.5A4 4 0 1 0 8 4v2L4.8 3.3 8 .5z'); $('narrPlay').setAttribute('aria-label','Replay'); });
  const forceEn=document.body.dataset.narrLang==='en';
  if(forceEn){ const hb=$('langSeg').querySelector('[data-l="hi"]'); if(hb) hb.remove(); }
  load(forceEn?'en':'hi');
})();
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',mount); else mount();
})();
