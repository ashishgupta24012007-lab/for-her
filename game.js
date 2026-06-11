'use strict';

/* ════════════════════════════════════════════════════════════════ */
/*  A Night at Hogwarts ✨ — Romantic Puzzle Adventure             */
/* ════════════════════════════════════════════════════════════════ */

// ── GAME STATE ────────────────────────────────────────────────────
const state = {
  playerName:  'stranger',
  house:       null,
  houseEmoji:  '🏰',
  giftEmoji:   '✨',
  currentScreen: 1,
};

/* ════════════════════════════════════════════════════════════════ */
/*  AMBIENT ROMANTIC MUSIC                                          */
/* ════════════════════════════════════════════════════════════════ */

const Music = (() => {
  let ctx = null, masterGain = null, playing = false;
  const MELODY = [
    {f:523.25,d:0.8,t:0}, {f:659.25,d:0.5,t:0.9}, {f:783.99,d:0.5,t:1.5}, {f:659.25,d:0.4,t:2.1},
    {f:783.99,d:0.9,t:2.6}, {f:880.00,d:0.5,t:3.6}, {f:1046.5,d:0.6,t:4.2}, {f:880.00,d:0.4,t:4.9},
    {f:783.99,d:0.8,t:5.4}, {f:659.25,d:0.5,t:6.3}, {f:523.25,d:0.5,t:6.9}, {f:392.00,d:0.4,t:7.5},
    {f:440.00,d:0.9,t:8.0}, {f:523.25,d:0.5,t:9.0}, {f:659.25,d:0.8,t:9.6}, {f:523.25,d:1.2,t:10.5},
  ];
  const PADS = [
    {f:130.81,t:0},{f:164.81,t:0},{f:196.00,t:0},
    {f:130.81,t:3},{f:146.83,t:3},{f:174.61,t:3},
    {f:130.81,t:6},{f:164.81,t:6},{f:196.00,t:6},
    {f:130.81,t:9},{f:146.83,t:9},{f:174.61,t:9},
  ];
  const LOOP = 12;

  function init() {
    if (ctx) return;
    try { ctx = new (window.AudioContext || window.webkitAudioContext)(); masterGain = ctx.createGain(); masterGain.gain.setValueAtTime(0, ctx.currentTime); masterGain.connect(ctx.destination); } catch(e){}
  }

  function pianoNote(freq, t, dur) {
    if (!ctx) return;
    const o = ctx.createOscillator(), oh = ctx.createOscillator(), g = ctx.createGain(), gh = ctx.createGain();
    o.type='triangle'; o.frequency.value=freq; oh.type='sine'; oh.frequency.value=freq*2; gh.gain.value=0.3;
    o.connect(g); oh.connect(gh); gh.connect(g); g.connect(masterGain);
    g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(0.12,t+0.015); g.gain.setValueAtTime(0.12,t+dur*0.3); g.gain.exponentialRampToValueAtTime(0.001,t+dur);
    o.start(t); o.stop(t+dur); oh.start(t); oh.stop(t+dur);
  }
  function padNote(freq, t) {
    if (!ctx) return;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type='sine'; o.frequency.value=freq; o.connect(g); g.connect(masterGain);
    g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(0.04,t+0.5); g.gain.setValueAtTime(0.04,t+2.3); g.gain.linearRampToValueAtTime(0,t+2.8);
    o.start(t); o.stop(t+2.8);
  }

  let loopTid = null;
  function scheduleLoop(base) {
    MELODY.forEach(n => pianoNote(n.f, base+n.t, n.d));
    PADS.forEach(p   => padNote(p.f,  base+p.t));
    loopTid = setTimeout(() => scheduleLoop(ctx.currentTime), (LOOP-1)*1000);
  }

  function start() {
    if (!ctx||playing) return; playing=true;
    masterGain.gain.cancelScheduledValues(ctx.currentTime);
    masterGain.gain.setValueAtTime(0,ctx.currentTime);
    masterGain.gain.linearRampToValueAtTime(0.85,ctx.currentTime+3.5);
    scheduleLoop(ctx.currentTime+0.1);
  }

  return { init, start };
})();

/* ════════════════════════════════════════════════════════════════ */
/*  SFX                                                            */
/* ════════════════════════════════════════════════════════════════ */

const SFX = (() => {
  let ctx = null;
  function init(c) { ctx = c; }
  function tone(f,type,dur,gain,delay=0) {
    if(!ctx) return;
    try {
      const o=ctx.createOscillator(),g=ctx.createGain();
      o.connect(g);g.connect(ctx.destination);
      o.type=type; o.frequency.value=f;
      const st=ctx.currentTime+delay;
      g.gain.setValueAtTime(0,st); g.gain.linearRampToValueAtTime(gain,st+0.01); g.gain.exponentialRampToValueAtTime(0.001,st+dur);
      o.start(st); o.stop(st+dur);
    } catch(e){}
  }
  function sparkle() { [523.25,659.25,783.99,1046.5].forEach((f,i)=>setTimeout(()=>tone(f,'sine',0.22,0.1),i*55)); }
  function whoosh() {
    if(!ctx) return;
    try {
      const buf=ctx.createBuffer(1,ctx.sampleRate*0.4,ctx.sampleRate),d=buf.getChannelData(0);
      for(let i=0;i<d.length;i++) d[i]=(Math.random()*2-1)*(1-i/d.length);
      const src=ctx.createBufferSource(),flt=ctx.createBiquadFilter(),g=ctx.createGain();
      src.buffer=buf; flt.type='bandpass'; flt.frequency.value=600;
      g.gain.setValueAtTime(0.15,ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.4);
      src.connect(flt);flt.connect(g);g.connect(ctx.destination);src.start();
    }catch(e){}
  }
  function chime() { [392,523.25,659.25,783.99,1046.5].forEach((f,i)=>setTimeout(()=>tone(f,'sine',0.5,0.09),i*90)); }
  function noteHit() { const ns=[523.25,587.33,659.25,698.46,783.99]; tone(ns[Math.floor(Math.random()*ns.length)],'sine',0.28,0.16); }
  function transition() { [261.63,329.63,392,523.25,659.25,783.99].forEach((f,i)=>setTimeout(()=>tone(f,'sine',0.3,0.07),i*70)); }
  function complete() { [261.63,329.63,392,523.25,659.25,783.99,1046.5].forEach((f,i)=>setTimeout(()=>tone(f,'sine',0.65,0.11),i*95)); }
  function heartSound() { tone(200,'sine',0.1,0.2); setTimeout(()=>tone(180,'sine',0.15,0.18),100); }
  function wrong() { tone(220,'sawtooth',0.25,0.08); }

  return { init, sparkle, whoosh, chime, noteHit, transition, complete, heartSound, wrong };
})();

// ── SHARED AUDIO CONTEXT ─────────────────────────────────────────
let audioReady = false;
let sharedCtx  = null;
function ensureAudio() {
  if (audioReady) return;
  audioReady = true;
  Music.init();
  try {
    sharedCtx = new (window.AudioContext||window.webkitAudioContext)();
    SFX.init(sharedCtx);
  } catch(e){}
  setTimeout(()=>Music.start(), 400);
}
document.addEventListener('click',   ensureAudio, { once: true });
document.addEventListener('keydown', ensureAudio, { once: true });

/* ════════════════════════════════════════════════════════════════ */
/*  STAR CANVAS                                                    */
/* ════════════════════════════════════════════════════════════════ */

function initStarCanvas() {
  const canvas = document.getElementById('starsCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const resize = () => { canvas.width=window.innerWidth; canvas.height=window.innerHeight; };
  resize(); window.addEventListener('resize', resize);

  const stars = Array.from({length:220},()=>({
    x:Math.random()*window.innerWidth, y:Math.random()*window.innerHeight,
    r:Math.random()*1.4+0.3, phase:Math.random()*Math.PI*2, speed:Math.random()*0.006+0.002,
    warm:Math.random()>0.6,
  }));
  const shooters = [];
  function addShooter() {
    shooters.push({ x:Math.random()*canvas.width*0.7, y:Math.random()*canvas.height*0.45, vx:3.5+Math.random()*4, vy:1+Math.random()*2, life:1, len:90+Math.random()*130 });
    setTimeout(addShooter, 5000+Math.random()*9000);
  }
  setTimeout(addShooter,3000);

  const dust = Array.from({length:40},()=>({ x:Math.random()*window.innerWidth, y:Math.random()*window.innerHeight, vx:(Math.random()-.5)*0.35, vy:-(Math.random()*0.4+0.08), r:Math.random()*2.2+0.8, alpha:Math.random()*0.5+0.15, hue:30+Math.random()*30 }));

  function animate() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    stars.forEach(s=>{
      s.phase+=s.speed;
      const a=0.3+0.7*Math.abs(Math.sin(s.phase));
      ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
      ctx.fillStyle=s.warm?`rgba(255,240,200,${a})`:`rgba(220,230,255,${a*0.7})`; ctx.fill();
    });
    for(let i=shooters.length-1;i>=0;i--){
      const ss=shooters[i]; ss.life-=0.018; ss.x+=ss.vx; ss.y+=ss.vy;
      if(ss.life<=0){shooters.splice(i,1);continue;}
      const gr=ctx.createLinearGradient(ss.x,ss.y,ss.x-ss.len*ss.vx/5,ss.y-ss.len*ss.vy/5);
      gr.addColorStop(0,`rgba(255,240,210,${ss.life})`); gr.addColorStop(0.5,`rgba(255,180,130,${ss.life*0.5})`); gr.addColorStop(1,'transparent');
      ctx.beginPath(); ctx.moveTo(ss.x,ss.y); ctx.lineTo(ss.x-ss.len*ss.vx/5,ss.y-ss.len*ss.vy/5);
      ctx.strokeStyle=gr; ctx.lineWidth=2; ctx.stroke();
    }
    dust.forEach(p=>{
      p.x+=p.vx; p.y+=p.vy;
      if(p.y<-20){p.y=canvas.height+20;p.x=Math.random()*canvas.width;}
      if(p.x<-20)p.x=canvas.width+20;
      if(p.x>canvas.width+20)p.x=-20;
      const g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r*3);
      g.addColorStop(0,`hsla(${p.hue},80%,70%,1)`); g.addColorStop(1,'transparent');
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r*3,0,Math.PI*2); ctx.fillStyle=g; ctx.globalAlpha=p.alpha*0.55; ctx.fill(); ctx.globalAlpha=1;
    });
    requestAnimationFrame(animate);
  }
  animate();
}

/* ════════════════════════════════════════════════════════════════ */
/*  AMBIENT EFFECTS                                                */
/* ════════════════════════════════════════════════════════════════ */

function initFireflies() {
  const c = document.getElementById('fireflies-container'); if(!c) return;
  for(let i=0;i<28;i++){
    const ff=document.createElement('div'); ff.className='firefly';
    ff.style.cssText=`left:${Math.random()*100}%;top:${Math.random()*100}%;--dur:${5+Math.random()*7}s;--del:${Math.random()*10}s;--dx:${(Math.random()-.5)*90}px;--dy:${-(Math.random()*70+20)}px;--dx2:${(Math.random()-.5)*70}px;--dy2:${-(Math.random()*110+45)}px;`;
    c.appendChild(ff);
  }
}

function initFloatingHearts() {
  const c = document.getElementById('hearts-container'); if(!c) return;
  const hts=['💕','💖','💗','💓','🌹','✨','💫','🌸'];
  for(let i=0;i<18;i++){
    const h=document.createElement('div'); h.className='float-heart';
    h.textContent=hts[Math.floor(Math.random()*hts.length)];
    h.style.cssText=`left:${Math.random()*100}%;bottom:-8%;--size:${0.7+Math.random()*1.2}rem;--dur:${9+Math.random()*10}s;--del:${Math.random()*15}s;--rot:${(Math.random()-.5)*40}deg;--rot2:${(Math.random()-.5)*30}deg;`;
    c.appendChild(h);
  }
}

function initGlobalPetals() {
  const c = document.getElementById('petals-container'); if(!c) return;
  const pts=['🌸','🌺','🌷','🌹','💮'];
  for(let i=0;i<14;i++){
    const p=document.createElement('div'); p.className='global-petal';
    p.textContent=pts[Math.floor(Math.random()*pts.length)];
    p.style.cssText=`left:${Math.random()*100}%;top:-5%;--size:${0.8+Math.random()*0.7}rem;--dur:${12+Math.random()*10}s;--del:${Math.random()*18}s;--sway:${(Math.random()-.5)*120}px;--spin:${Math.random()*360}deg;`;
    c.appendChild(p);
  }
}

/* ════════════════════════════════════════════════════════════════ */
/*  PARTICLES                                                      */
/* ════════════════════════════════════════════════════════════════ */

function spawnSparks(x, y, count=8, color='#f5c842') {
  for(let i=0;i<count;i++){
    const s=document.createElement('div'); s.className='spark-particle';
    const angle=(i/count)*Math.PI*2+Math.random()*0.6, dist=28+Math.random()*55, size=3+Math.random()*5;
    s.style.cssText=`left:${x}px;top:${y}px;width:${size}px;height:${size}px;background:${color};box-shadow:0 0 ${size*2}px ${color};--sdx:${Math.cos(angle)*dist}px;--sdy:${Math.sin(angle)*dist-22}px;--sd:${0.5+Math.random()*0.55}s;`;
    document.body.appendChild(s); s.addEventListener('animationend',()=>s.remove());
  }
}

function spawnHeartBurst(x, y) {
  ['💕','💖','💗','💓','✨'].forEach((h,i) => {
    const el=document.createElement('div'); el.className='heart-burst'; el.textContent=h;
    const angle=(i/5)*Math.PI*2+Math.random(), dist=40+Math.random()*60;
    el.style.cssText=`left:${x}px;top:${y}px;--bx:${Math.cos(angle)*dist}px;--by:${Math.sin(angle)*dist-40}px;--sd:${0.7+Math.random()*0.5}s;`;
    document.body.appendChild(el); el.addEventListener('animationend',()=>el.remove());
  });
}

/* ════════════════════════════════════════════════════════════════ */
/*  SCREEN TRANSITIONS                                             */
/* ════════════════════════════════════════════════════════════════ */

function goToScreen(num) {
  const cur = document.querySelector('.screen.active');
  const target = document.getElementById(`screen-${num}`);
  if (!target) return;
  SFX.transition();
  const sh = document.createElement('div'); sh.className='transition-shimmer'; document.body.appendChild(sh);
  sh.addEventListener('animationend',()=>sh.remove());
  if (cur) { cur.classList.add('exit'); setTimeout(()=>{cur.classList.remove('active','exit');cur.hidden=true;},1000); }
  setTimeout(()=>{
    target.hidden=false;
    requestAnimationFrame(()=>requestAnimationFrame(()=>{
      target.classList.add('active'); state.currentScreen=num; onEnter(num);
    }));
  }, 500);
}

function onEnter(n) {
  if (n===3) initMemoryGame();
  if (n===4) initWordPuzzle();
  if (n===5) initMaze();
  if (n===6) initSpell();
  if (n===7) initEnding();
}

/* ════════════════════════════════════════════════════════════════ */
/*  SCREEN 1 · LETTER                                              */
/* ════════════════════════════════════════════════════════════════ */

function initScreen1() {
  const envelope    = document.getElementById('envelope');
  const openBtn     = document.getElementById('open-envelope-btn');
  const wrapper     = document.getElementById('envelope-wrapper');
  const letterEl    = document.getElementById('letter-content');
  const acceptBtn   = document.getElementById('accept-btn');
  const nameInput   = document.getElementById('player-name');
  const nameDisplay = document.getElementById('letter-name-display');

  nameInput?.addEventListener('input', ()=>{ if(nameDisplay) nameDisplay.textContent=nameInput.value.trim()||'stranger'; });

  openBtn?.addEventListener('click', e => {
    ensureAudio(); SFX.whoosh();
    spawnSparks(e.clientX,e.clientY,12,'#ffadc5'); spawnHeartBurst(e.clientX,e.clientY);
    envelope?.classList.add('opened'); openBtn.style.opacity='0'; openBtn.style.pointerEvents='none';
    setTimeout(()=>{ wrapper?.classList.add('hidden'); letterEl?.classList.remove('hidden'); SFX.chime(); }, 900);
  });

  acceptBtn?.addEventListener('click', e => {
    const name = nameInput?.value.trim();
    if (!name) { nameInput?.focus(); return; }
    state.playerName = name; SFX.sparkle();
    spawnSparks(e.clientX,e.clientY,18,'#f5c842'); spawnHeartBurst(e.clientX,e.clientY);
    setTimeout(()=>goToScreen(2), 350);
  });
}

/* ════════════════════════════════════════════════════════════════ */
/*  SCREEN 2 · HOUSE                                               */
/* ════════════════════════════════════════════════════════════════ */

function initScreen2() {
  const cards   = document.querySelectorAll('.house-card');
  const msgBox  = document.getElementById('house-message');
  const msgText = document.getElementById('house-message-text');
  let nextBtn   = null;

  cards.forEach(card => {
    card.addEventListener('mouseenter', ()=>SFX.sparkle());
    card.addEventListener('click', e => {
      cards.forEach(c=>{ c.classList.remove('selected'); c.setAttribute('aria-checked','false'); });
      card.classList.add('selected'); card.setAttribute('aria-checked','true');
      state.house      = card.dataset.house;
      state.houseEmoji = card.querySelector('.house-animal')?.textContent || '🏰';
      state.giftEmoji  = card.dataset.gift || '✨'; // auto-assign gift

      SFX.whoosh();
      spawnSparks(e.clientX,e.clientY,14,card.dataset.color2||'#f5c842'); spawnHeartBurst(e.clientX,e.clientY);
      if(msgText) msgText.textContent = card.dataset.message;
      msgBox?.classList.remove('hidden');

      if(!nextBtn) {
        nextBtn = document.createElement('button');
        nextBtn.className='scroll-btn glow-btn'; nextBtn.textContent='Begin the Puzzles! 🃏'; nextBtn.style.marginTop='1.2rem';
        nextBtn.addEventListener('click', ev=>{ spawnSparks(ev.clientX,ev.clientY,10,'#f5c842'); setTimeout(()=>goToScreen(3),300); });
        msgBox?.after(nextBtn);
      }
    });
  });
}

/* ════════════════════════════════════════════════════════════════ */
/*  SCREEN 3 · MEMORY CARD GAME — PUZZLE 1                        */
/* ════════════════════════════════════════════════════════════════ */

function initMemoryGame() {
  const SYMBOLS = ['🌹','💖','🌙','✨','🦋','🌸','💫','🕯️'];
  const deck = [...SYMBOLS, ...SYMBOLS].sort(()=>Math.random()-0.5);

  const grid    = document.getElementById('memory-grid');
  const counter = document.getElementById('memory-pairs');
  const doneEl  = document.getElementById('memory-complete');

  if (!grid) return;
  grid.innerHTML = '';

  let flipped=[], matched=0, locked=false;

  deck.forEach((sym, i) => {
    const card = document.createElement('div');
    card.className='mem-card'; card.dataset.sym=sym; card.dataset.idx=i;
    card.setAttribute('role','gridcell'); card.setAttribute('aria-label','Hidden magical card');
    card.setAttribute('tabindex','0');
    card.innerHTML=`<div class="mem-inner"><div class="mem-front"></div><div class="mem-back">${sym}</div></div>`;

    const flip = e => {
      if (locked||card.classList.contains('flipped')||card.classList.contains('matched')) return;
      card.classList.add('flipped'); card.setAttribute('aria-label',sym);
      SFX.heartSound(); spawnSparks(e.clientX||card.getBoundingClientRect().left+30,e.clientY||card.getBoundingClientRect().top+30,5,'#ffadc5');
      flipped.push(card);

      if (flipped.length===2) {
        locked=true;
        const [a,b]=flipped;
        if (a.dataset.sym===b.dataset.sym) {
          // MATCH
          setTimeout(()=>{
            a.classList.add('matched'); b.classList.add('matched');
            SFX.chime(); matched++;
            const rA=a.getBoundingClientRect(), rB=b.getBoundingClientRect();
            spawnSparks(rA.left+rA.width/2,rA.top+rA.height/2,8,'#f5c842');
            spawnHeartBurst(rB.left+rB.width/2,rB.top+rB.height/2);
            if(counter) counter.textContent=`${matched} / 8 pairs found`;
            flipped=[]; locked=false;
            if(matched===8) setTimeout(finishMemory, 700);
          }, 250);
        } else {
          // NO MATCH — flash wrong and flip back
          setTimeout(()=>{
            SFX.wrong();
            a.classList.add('wrong-shake'); b.classList.add('wrong-shake');
            setTimeout(()=>{
              a.classList.remove('flipped','wrong-shake'); a.setAttribute('aria-label','Hidden magical card');
              b.classList.remove('flipped','wrong-shake'); b.setAttribute('aria-label','Hidden magical card');
              flipped=[]; locked=false;
            }, 500);
          }, 700);
        }
      }
    };

    card.addEventListener('click', flip);
    card.addEventListener('keydown', e=>{ if(e.key==='Enter'||e.key===' '){e.preventDefault();flip(e);} });
    grid.appendChild(card);
  });

  if(counter) counter.textContent='0 / 8 pairs found';

  function finishMemory() {
    SFX.complete();
    for(let i=0;i<6;i++) setTimeout(()=>{
      spawnSparks(window.innerWidth*(0.2+Math.random()*0.6),window.innerHeight*0.4,10,'#ffadc5');
      spawnHeartBurst(window.innerWidth*(0.2+Math.random()*0.6),window.innerHeight*0.3);
    }, i*220);
    doneEl?.classList.remove('hidden');
  }

  document.getElementById('memory-next-btn')?.addEventListener('click', e=>{
    spawnSparks(e.clientX,e.clientY,10,'#f5c842');
    setTimeout(()=>goToScreen(4),300);
  });
}

/* ════════════════════════════════════════════════════════════════ */
/*  SCREEN 4 · WORD ORDER PUZZLE — PUZZLE 2                       */
/* ════════════════════════════════════════════════════════════════ */

function initWordPuzzle() {
  // Each sentence is an array of words in correct order
  const SENTENCES = [
    { words:['You','are','the','spell','I','never','knew'],   emoji:'🪄', label:'You are the spell I never knew 🪄' },
    { words:['Every','star','shines','a','little','more','tonight'], emoji:'✨', label:'Every star shines a little more tonight ✨' },
    { words:['And','it','is','all','because','of','you'],    emoji:'💕', label:'And it is all because of you 💕' },
  ];
  const completedLines = [];
  let sIdx=0, selected=[];

  const progressEl = document.getElementById('word-progress');
  const displayEl  = document.getElementById('word-display');
  const displayArea= displayEl?.parentElement;
  const gridEl     = document.getElementById('word-grid');
  const hintEl     = document.getElementById('word-hint');
  const doneEl     = document.getElementById('word-complete');
  const linesEl    = document.getElementById('letter-lines');

  function loadSentence() {
    if(!gridEl||!displayEl) return;
    const s = SENTENCES[sIdx];
    selected=[];
    displayEl.innerHTML='';
    displayArea?.classList.remove('sentence-done');
    if(progressEl) progressEl.textContent=`Sentence ${sIdx+1} of 3`;

    // Shuffle words
    const shuffled=[...s.words].sort(()=>Math.random()-0.5);
    gridEl.innerHTML='';
    shuffled.forEach(word=>{
      const btn=document.createElement('button');
      btn.className='word-tile'; btn.textContent=word;
      btn.addEventListener('click', ()=>onWordClick(btn, word, s));
      gridEl.appendChild(btn);
    });
    if(hintEl) hintEl.textContent='✨ Tap the words in the correct order';
  }

  function onWordClick(btn, word, sentence) {
    if(btn.disabled) return;
    const pos=selected.length;
    if(word===sentence.words[pos]) {
      // Correct word
      btn.disabled=true;
      selected.push(word);
      SFX.sparkle();
      const span=document.createElement('span'); span.className='word-placed'; span.textContent=word+(pos<sentence.words.length-1?' ':'');
      displayEl.appendChild(span);
      if(selected.length===sentence.words.length) sentenceComplete(sentence);
    } else {
      // Wrong — flash red, don't reset
      SFX.wrong();
      btn.classList.add('tile-wrong');
      btn.addEventListener('animationend',()=>btn.classList.remove('tile-wrong'),{once:true});
    }
  }

  function sentenceComplete(sentence) {
    SFX.chime();
    displayArea?.classList.add('sentence-done');
    completedLines.push(sentence.label);
    spawnHeartBurst(window.innerWidth/2, window.innerHeight*0.4);
    spawnSparks(window.innerWidth/2, window.innerHeight*0.4, 12, '#f5c842');

    if(sIdx<SENTENCES.length-1) {
      sIdx++;
      if(hintEl) hintEl.textContent='✨ Beautiful! Next sentence…';
      setTimeout(loadSentence, 1100);
    } else {
      setTimeout(showLetter, 900);
    }
  }

  function showLetter() {
    SFX.complete();
    doneEl?.classList.remove('hidden');
    if(linesEl) {
      linesEl.innerHTML='';
      completedLines.forEach((line, i)=>{
        const p=document.createElement('p'); p.className='letter-line';
        p.textContent=line; p.style.animationDelay=`${i*0.4}s`;
        linesEl.appendChild(p);
      });
    }
    for(let i=0;i<5;i++) setTimeout(()=>{
      spawnSparks(window.innerWidth*(0.2+Math.random()*0.6), window.innerHeight*(0.2+Math.random()*0.5),10,'#ffadc5');
      spawnHeartBurst(window.innerWidth*(0.2+Math.random()*0.6), window.innerHeight*0.4);
    }, i*250);
  }

  document.getElementById('word-next-btn')?.addEventListener('click', e=>{
    spawnSparks(e.clientX,e.clientY,10,'#f5c842');
    setTimeout(()=>goToScreen(5),300);
  });

  loadSentence();
}

/* ════════════════════════════════════════════════════════════════ */
/*  SCREEN 5 · ROSE GARDEN MAZE — PUZZLE 3                        */
/* ════════════════════════════════════════════════════════════════ */

function initMaze() {
  const canvas = document.getElementById('maze-canvas');
  const stepsEl = document.getElementById('maze-steps');
  const doneEl  = document.getElementById('maze-complete');
  if (!canvas) return;

  // Grid config
  const COLS=13, ROWS=9;
  const dpr=Math.min(window.devicePixelRatio||1, 2);
  const displayW=Math.min(450, window.innerWidth*0.9);
  const CELL=Math.floor(displayW/COLS);
  const W=COLS*CELL, H=ROWS*CELL;

  canvas.style.width=`${W}px`; canvas.style.height=`${H}px`;
  canvas.width=W*dpr; canvas.height=H*dpr;
  const ctx=canvas.getContext('2d'); ctx.scale(dpr,dpr);

  // Generate maze via recursive backtracking
  const cells=Array.from({length:ROWS},(_,r)=>Array.from({length:COLS},(_,c)=>({r,c,visited:false,walls:{N:true,S:true,E:true,W:true}})));
  function carve(r,c){
    cells[r][c].visited=true;
    [{dr:-1,dc:0,w:'N',ow:'S'},{dr:1,dc:0,w:'S',ow:'N'},{dr:0,dc:1,w:'E',ow:'W'},{dr:0,dc:-1,w:'W',ow:'E'}]
      .sort(()=>Math.random()-0.5)
      .forEach(({dr,dc,w,ow})=>{
        const nr=r+dr,nc=c+dc;
        if(nr>=0&&nr<ROWS&&nc>=0&&nc<COLS&&!cells[nr][nc].visited){
          cells[r][c].walls[w]=false; cells[nr][nc].walls[ow]=false; carve(nr,nc);
        }
      });
  }
  carve(0,0);
  // Ensure entrance/exit open
  cells[0][0].walls.N=false;
  cells[ROWS-1][COLS-1].walls.S=false;

  let player={r:0,c:0}, steps=0, done=false;
  const goal={r:ROWS-1,c:COLS-1};
  const trail=new Set(['0,0']);

  // Touch swipe support
  let touchStart=null;
  canvas.addEventListener('touchstart', e=>{e.preventDefault(); touchStart=e.touches[0];},{passive:false});
  canvas.addEventListener('touchend', e=>{
    e.preventDefault();
    if(!touchStart) return;
    const dx=e.changedTouches[0].clientX-touchStart.clientX;
    const dy=e.changedTouches[0].clientY-touchStart.clientY;
    if(Math.abs(dx)>Math.abs(dy)) move(0,dx>0?1:-1);
    else move(dy>0?1:-1,0);
    touchStart=null;
  },{passive:false});

  function draw() {
    ctx.clearRect(0,0,W,H);

    // Background
    const bg=ctx.createRadialGradient(W/2,H/2,0,W/2,H/2,Math.max(W,H)*0.7);
    bg.addColorStop(0,'rgba(20,5,30,0.95)'); bg.addColorStop(1,'rgba(4,6,20,0.98)');
    ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);

    // Trail glow
    trail.forEach(key=>{
      const [tr,tc]=key.split(',').map(Number);
      const tg=ctx.createRadialGradient(tc*CELL+CELL/2,tr*CELL+CELL/2,0,tc*CELL+CELL/2,tr*CELL+CELL/2,CELL*0.7);
      tg.addColorStop(0,'rgba(255,120,160,0.18)'); tg.addColorStop(1,'transparent');
      ctx.fillStyle=tg; ctx.fillRect(tc*CELL,tr*CELL,CELL,CELL);
    });

    // Goal glow
    const gg=ctx.createRadialGradient(goal.c*CELL+CELL/2,goal.r*CELL+CELL/2,0,goal.c*CELL+CELL/2,goal.r*CELL+CELL/2,CELL*1.2);
    gg.addColorStop(0,'rgba(194,24,91,0.3)'); gg.addColorStop(1,'transparent');
    ctx.fillStyle=gg; ctx.fillRect((goal.c-0.5)*CELL,(goal.r-0.5)*CELL,CELL*2,CELL*2);

    // Draw walls with rose-gold glow
    ctx.shadowColor='rgba(212,168,67,0.35)'; ctx.shadowBlur=3;
    ctx.strokeStyle='rgba(212,168,67,0.75)'; ctx.lineWidth=1.8; ctx.lineCap='round';
    cells.forEach(row=>row.forEach(cell=>{
      const x=cell.c*CELL, y=cell.r*CELL;
      ctx.beginPath();
      if(cell.walls.N){ctx.moveTo(x,y);ctx.lineTo(x+CELL,y);}
      if(cell.walls.S){ctx.moveTo(x,y+CELL);ctx.lineTo(x+CELL,y+CELL);}
      if(cell.walls.W){ctx.moveTo(x,y);ctx.lineTo(x,y+CELL);}
      if(cell.walls.E){ctx.moveTo(x+CELL,y);ctx.lineTo(x+CELL,y+CELL);}
      ctx.stroke();
    }));
    ctx.shadowBlur=0;

    // Goal emoji (rose)
    ctx.font=`${CELL*0.72}px serif`;
    ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.shadowColor='rgba(255,80,120,0.85)'; ctx.shadowBlur=12;
    ctx.fillText('🌹', goal.c*CELL+CELL/2, goal.r*CELL+CELL/2);
    ctx.shadowBlur=0;

    // Player emoji (heart)
    ctx.shadowColor='rgba(255,150,180,0.95)'; ctx.shadowBlur=16;
    ctx.fillText('💕', player.c*CELL+CELL/2, player.r*CELL+CELL/2);
    ctx.shadowBlur=0;
  }

  function move(dr, dc) {
    if(done) return;
    const nr=player.r+dr, nc=player.c+dc;
    if(nr<0||nr>=ROWS||nc<0||nc>=COLS) return;
    const wallDir=dr===-1?'N':dr===1?'S':dc===-1?'W':'E';
    if(cells[player.r][player.c].walls[wallDir]) return;
    player.r=nr; player.c=nc; steps++;
    trail.add(`${nr},${nc}`);
    if(stepsEl) stepsEl.textContent=`${steps} step${steps!==1?'s':''}`;
    SFX.noteHit();
    draw();
    if(nr===goal.r&&nc===goal.c) finish();
  }

  function finish() {
    done=true; SFX.complete();
    const r=canvas.getBoundingClientRect();
    spawnSparks(r.left+r.width-30, r.top+r.height-30, 16,'#ffadc5');
    spawnHeartBurst(r.left+r.width/2, r.top+r.height/2);
    for(let i=0;i<4;i++) setTimeout(()=>spawnSparks(window.innerWidth*(0.2+Math.random()*0.6), window.innerHeight*0.4, 10,'#f5c842'), i*200);
    setTimeout(()=>doneEl?.classList.remove('hidden'), 800);
    document.removeEventListener('keydown', keyHandler);
  }

  const keyHandler = e => {
    const map={'ArrowUp':[-1,0],'ArrowDown':[1,0],'ArrowLeft':[0,-1],'ArrowRight':[0,1],'w':[-1,0],'s':[1,0],'a':[0,-1],'d':[0,1]};
    const d=map[e.key]; if(d){e.preventDefault();move(...d);}
  };
  document.addEventListener('keydown', keyHandler);

  document.getElementById('maze-up')?.addEventListener('click',    ()=>move(-1,0));
  document.getElementById('maze-down')?.addEventListener('click',   ()=>move(1,0));
  document.getElementById('maze-left')?.addEventListener('click',   ()=>move(0,-1));
  document.getElementById('maze-right')?.addEventListener('click',  ()=>move(0,1));

  document.getElementById('maze-next-btn')?.addEventListener('click', e=>{
    document.removeEventListener('keydown', keyHandler);
    spawnSparks(e.clientX,e.clientY,12,'#f5c842');
    setTimeout(()=>goToScreen(6),300);
  });

  draw();
}

/* ════════════════════════════════════════════════════════════════ */
/*  SCREEN 6 · FINAL SPELL                                        */
/* ════════════════════════════════════════════════════════════════ */

function initSpell() {
  const SPELL   = 'AMORAVI';
  const charsEl = document.getElementById('spell-chars');
  const input   = document.getElementById('spell-input');
  const wand    = document.getElementById('wand');
  const doneEl  = document.getElementById('spell-complete');

  if(charsEl){
    charsEl.innerHTML='';
    SPELL.split('').forEach((ch,i)=>{
      const s=document.createElement('span'); s.className='spell-char'; s.id=`sc-${i}`; s.textContent=ch;
      charsEl.appendChild(s);
    });
  }

  let typed=0;
  input?.addEventListener('input',()=>{
    const val=input.value.toUpperCase().replace(/[^A-Z]/g,'');
    input.value=val;
    const n=Math.min(val.length,SPELL.length);
    let ok=true;
    for(let i=0;i<n;i++) if(val[i]!==SPELL[i]){ok=false;break;}
    if(!ok){ input.value=''; typed=0; for(let i=0;i<SPELL.length;i++) document.getElementById(`sc-${i}`)?.classList.remove('typed'); SFX.whoosh(); return; }
    typed=n;
    for(let i=0;i<SPELL.length;i++){
      const el=document.getElementById(`sc-${i}`); if(!el) continue;
      if(i<typed&&!el.classList.contains('typed')){
        el.classList.add('typed'); SFX.sparkle();
        const tip=document.getElementById('wand-tip');
        if(tip){const r=tip.getBoundingClientRect();spawnSparks(r.left+r.width/2,r.top+r.height/2,6,'#ffadc5');}
      } else if(i>=typed) el.classList.remove('typed');
    }
    wand?.classList.toggle('casting',typed>0);
    if(typed===SPELL.length){
      input.disabled=true; SFX.complete();
      setTimeout(()=>{
        const tip=document.getElementById('wand-tip');
        if(tip){const r=tip.getBoundingClientRect();spawnSparks(r.left,r.top,35,'#f5c842');spawnSparks(r.left,r.top,20,'#ffadc5');spawnHeartBurst(r.left,r.top);}
        doneEl?.classList.remove('hidden');
      },500);
    }
  });

  document.getElementById('spell-next-btn')?.addEventListener('click',e=>{
    spawnSparks(e.clientX,e.clientY,16,'#f5c842');spawnHeartBurst(e.clientX,e.clientY);
    setTimeout(()=>goToScreen(7),300);
  });

  setTimeout(()=>input?.focus(),400);
}

/* ════════════════════════════════════════════════════════════════ */
/*  SCREEN 7 · ENDING + "I LOVE YOU" REVEAL                      */
/* ════════════════════════════════════════════════════════════════ */

function initEnding() {
  const nameEl = document.getElementById('s7title');
  if(nameEl) nameEl.textContent=state.playerName;
  const houseEl=document.getElementById('ending-house-badge'); if(houseEl) houseEl.textContent=state.houseEmoji;
  const giftEl =document.getElementById('ending-gift-badge');  if(giftEl)  giftEl.textContent=state.giftEmoji;

  SFX.complete();
  setTimeout(()=>{
    for(let i=0;i<7;i++) setTimeout(()=>{
      spawnSparks(window.innerWidth*(0.15+Math.random()*0.7),window.innerHeight*(0.1+Math.random()*0.6),14,'#f5c842');
      spawnHeartBurst(window.innerWidth*(0.15+Math.random()*0.7),window.innerHeight*0.4);
    }, i*180);
  }, 900);

  // ── "I love you" typewriter ───────────────────────────────────
  const ILY_LINE = `I love you, ${state.playerName}. 🌹`;
  const ILY_PS   = `(Don't even try to act surprised — you just solved three magical puzzles,\ncast an ancient love spell,\nand found your way through an enchanted garden.\nAll for a rose.\nSo yes… I love you.\nProbably more than I have words for.\nMaybe even more than Dumbledore loves Sherbet Lemons. 🍋✨)`;

  function typewriter(el, text, speed, done) {
    let i=0; el.textContent='';
    const tick=()=>{ if(i<text.length){el.textContent+=text[i++];setTimeout(tick,speed+Math.random()*(speed*0.6));}else if(done) done(); };
    tick();
  }

  setTimeout(()=>{
    const reveal=document.getElementById('ily-reveal');
    const mainEl=document.getElementById('ily-main');
    const psEl  =document.getElementById('ily-ps');
    if(!reveal||!mainEl||!psEl) return;
    reveal.classList.remove('hidden'); SFX.chime();
    for(let i=0;i<5;i++) setTimeout(()=>spawnHeartBurst(window.innerWidth*(0.2+Math.random()*0.6),window.innerHeight*0.5),i*200);
    typewriter(mainEl, ILY_LINE, 68, ()=>{ SFX.complete(); setTimeout(()=>typewriter(psEl,ILY_PS,20),700); });
  }, 2800);

  // Share
  const shareBtn=document.getElementById('share-btn'), toast=document.getElementById('share-toast');
  shareBtn?.addEventListener('click', async e=>{
    SFX.sparkle(); spawnSparks(e.clientX,e.clientY,10,'#c084fc');
    const houseName=state.house?state.house[0].toUpperCase()+state.house.slice(1):'Hogwarts';
    const text=`✨ A Night at Hogwarts ✨\n\n${state.playerName} — Puzzle Master & True Hogwarts Romantic. 💛\nHouse: ${houseName} ${state.houseEmoji}\n\n🃏 Solved the memory puzzle\n💌 Reconstructed the love letter\n🌹 Found their way through the rose garden\n🪄 Cast the love spell: Amoravi\n\nPlay the romantic puzzle adventure!`;
    if(navigator.share){try{await navigator.share({title:'A Night at Hogwarts ✨',text});}catch{await navigator.clipboard.writeText(text).catch(()=>{});toast?.classList.remove('hidden');setTimeout(()=>toast?.classList.add('hidden'),3500);}}
    else{await navigator.clipboard.writeText(text).catch(()=>{});toast?.classList.remove('hidden');setTimeout(()=>toast?.classList.add('hidden'),3500);}
  });

  // Play again
  document.getElementById('play-again-btn')?.addEventListener('click', e=>{
    spawnSparks(e.clientX,e.clientY,12,'#f5c842');
    Object.assign(state,{playerName:'stranger',house:null,houseEmoji:'🏰',giftEmoji:'✨',currentScreen:1});
    document.querySelectorAll('.screen').forEach(s=>{s.classList.remove('active','exit');s.hidden=true;});
    const s1=document.getElementById('screen-1');
    if(s1){s1.hidden=false;setTimeout(()=>s1.classList.add('active'),60);}

    // Reset S1
    document.getElementById('envelope')?.classList.remove('opened');
    const ob=document.getElementById('open-envelope-btn'); if(ob){ob.style.opacity='';ob.style.pointerEvents='';}
    document.getElementById('letter-content')?.classList.add('hidden');
    document.getElementById('envelope-wrapper')?.classList.remove('hidden');
    const ni=document.getElementById('player-name'); if(ni) ni.value='';
    const nd=document.getElementById('letter-name-display'); if(nd) nd.textContent='stranger';

    // Reset S2
    document.querySelectorAll('.house-card').forEach(c=>{c.classList.remove('selected');c.setAttribute('aria-checked','false');});
    document.getElementById('house-message')?.classList.add('hidden');

    // Reset S3
    document.getElementById('memory-complete')?.classList.add('hidden');
    const mg=document.getElementById('memory-grid'); if(mg) mg.innerHTML='';
    const mc=document.getElementById('memory-pairs'); if(mc) mc.textContent='0 / 8 pairs found';

    // Reset S4
    document.getElementById('word-complete')?.classList.add('hidden');
    const wg=document.getElementById('word-grid'); if(wg) wg.innerHTML='';
    const wd=document.getElementById('word-display'); if(wd) wd.innerHTML='';
    const wp=document.getElementById('word-progress'); if(wp) wp.textContent='Sentence 1 of 3';

    // Reset S5
    document.getElementById('maze-complete')?.classList.add('hidden');
    const ms=document.getElementById('maze-steps'); if(ms) ms.textContent='0 steps';

    // Reset S6
    document.getElementById('spell-complete')?.classList.add('hidden');
    const si=document.getElementById('spell-input'); if(si){si.value='';si.disabled=false;}
    document.getElementById('spell-chars')?.replaceChildren();

    // Reset ILY
    const ily=document.getElementById('ily-reveal'); if(ily) ily.classList.add('hidden');
    const im=document.getElementById('ily-main'); if(im) im.textContent='';
    const ip=document.getElementById('ily-ps'); if(ip) ip.textContent='';
  });
}

/* ════════════════════════════════════════════════════════════════ */
/*  ROMANTIC CURSOR TRAIL                                          */
/* ════════════════════════════════════════════════════════════════ */

function initCursorTrail() {
  let last={x:0,y:0}, frame=0;
  document.addEventListener('mousemove', e=>{
    frame++;
    if(frame%4!==0) return;
    if(Math.hypot(e.clientX-last.x,e.clientY-last.y)<12) return;
    last={x:e.clientX,y:e.clientY};
    if(Math.random()<0.35){
      const sp=document.createElement('div'); sp.className='spark-particle';
      const size=2+Math.random()*3, a=Math.random()*Math.PI*2, d=4+Math.random()*12;
      const col=Math.random()>0.5?'rgba(245,200,66,0.6)':'rgba(255,173,197,0.7)';
      sp.style.cssText=`left:${e.clientX}px;top:${e.clientY}px;width:${size}px;height:${size}px;background:${col};box-shadow:0 0 ${size*2}px ${col};--sdx:${Math.cos(a)*d}px;--sdy:${Math.sin(a)*d-8}px;--sd:${0.35+Math.random()*0.3}s;`;
      document.body.appendChild(sp); sp.addEventListener('animationend',()=>sp.remove());
    }
  });
}

/* ════════════════════════════════════════════════════════════════ */
/*  BOOT                                                           */
/* ════════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', ()=>{
  initStarCanvas();
  initFireflies();
  initFloatingHearts();
  initGlobalPetals();
  initCursorTrail();
  initScreen1();
  initScreen2();

  const s1=document.getElementById('screen-1');
  if(s1){s1.hidden=false;setTimeout(()=>s1.classList.add('active'),120);}

  // Welcome sparkle
  setTimeout(()=>{
    for(let i=0;i<4;i++) setTimeout(()=>{
      spawnSparks(window.innerWidth*(0.2+Math.random()*0.6),window.innerHeight*(0.2+Math.random()*0.5),10,'#ffadc5');
      spawnHeartBurst(window.innerWidth*(0.2+Math.random()*0.6),window.innerHeight*0.4);
    }, i*300);
  }, 1200);
});
