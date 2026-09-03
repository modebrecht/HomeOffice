(() => {
  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  let lastCelebration = -1;
  let audioCtx = null;
  let master = null;
  let activeRun = 0;

  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const rand = (min, max) => min + Math.random() * (max - min);

  function injectStyles() {
    if (document.getElementById('taskCelebrationStyles')) return;
    const style = document.createElement('style');
    style.id = 'taskCelebrationStyles';
    style.textContent = `
      .task-celebration-layer{
        position:fixed;inset:0;z-index:99999;pointer-events:none;overflow:hidden;
        opacity:1;transition:opacity .22s ease;
      }
      .task-celebration-layer.is-leaving{opacity:0}
      .task-celebration-canvas{position:absolute;inset:0;width:100%;height:100%;display:block}
      .task-celebration-badge{
        position:absolute;left:50%;top:45%;transform:translate(-50%,-50%) scale(.8);
        min-width:min(78vw,300px);padding:16px 22px;border-radius:22px;text-align:center;
        background:linear-gradient(180deg,rgba(18,25,48,.88),rgba(8,13,29,.84));
        border:1px solid rgba(255,255,255,.22);box-shadow:0 24px 80px rgba(0,0,0,.42),0 0 50px rgba(142,162,255,.2);
        backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);
        animation:taskCelebrationBadgeIn .58s cubic-bezier(.16,.9,.2,1) forwards;
      }
      .task-celebration-kicker{font-size:.68rem;font-weight:950;letter-spacing:.17em;text-transform:uppercase;color:#b9c6ff}
      .task-celebration-title{margin-top:5px;font-size:clamp(1.45rem,7vw,2.2rem);line-height:1;font-weight:1000;letter-spacing:-.045em;color:#fff;text-shadow:0 4px 22px rgba(0,0,0,.35)}
      .task-celebration-xp{margin-top:8px;font-size:1rem;font-weight:950;color:#ffe0ad}
      @keyframes taskCelebrationBadgeIn{
        0%{opacity:0;transform:translate(-50%,-43%) scale(.72);filter:blur(5px)}
        65%{opacity:1;transform:translate(-50%,-51%) scale(1.045);filter:blur(0)}
        100%{opacity:1;transform:translate(-50%,-50%) scale(1)}
      }
      @media(max-width:450px){
        .task-celebration-badge{top:43%;min-width:70vw;padding:13px 18px;border-radius:19px}
      }
      @media(prefers-reduced-motion:reduce){
        .task-celebration-badge{animation:taskCelebrationBadgeReduced .18s ease-out forwards}
        @keyframes taskCelebrationBadgeReduced{from{opacity:0}to{opacity:1;transform:translate(-50%,-50%)}}
      }
    `;
    document.head.appendChild(style);
  }

  function ensureAudio() {
    try {
      if (!audioCtx) {
        const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextCtor) return null;
        audioCtx = new AudioContextCtor();
        master = audioCtx.createGain();
        master.gain.value = 0.18;
        master.connect(audioCtx.destination);
      }
      if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});
      return audioCtx;
    } catch {
      return null;
    }
  }

  function tone(freq, at = 0, duration = .12, type = 'sine', gain = .12, endFreq = null) {
    const ctx = ensureAudio();
    if (!ctx || !master) return;
    const start = ctx.currentTime + at;
    const osc = ctx.createOscillator();
    const amp = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(Math.max(30, freq), start);
    if (endFreq) osc.frequency.exponentialRampToValueAtTime(Math.max(30, endFreq), start + duration);
    amp.gain.setValueAtTime(.0001, start);
    amp.gain.exponentialRampToValueAtTime(Math.max(.0001, gain), start + Math.min(.025, duration * .2));
    amp.gain.exponentialRampToValueAtTime(.0001, start + duration);
    osc.connect(amp);
    amp.connect(master);
    osc.start(start);
    osc.stop(start + duration + .03);
  }

  function noise(at = 0, duration = .16, gain = .07, highpass = 900) {
    const ctx = ensureAudio();
    if (!ctx || !master) return;
    const length = Math.max(1, Math.floor(ctx.sampleRate * duration));
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / length);
    const source = ctx.createBufferSource();
    const filter = ctx.createBiquadFilter();
    const amp = ctx.createGain();
    filter.type = 'highpass';
    filter.frequency.value = highpass;
    amp.gain.setValueAtTime(gain, ctx.currentTime + at);
    amp.gain.exponentialRampToValueAtTime(.0001, ctx.currentTime + at + duration);
    source.buffer = buffer;
    source.connect(filter); filter.connect(amp); amp.connect(master);
    source.start(ctx.currentTime + at);
  }

  const sfx = [
    () => { tone(523,.00,.12,'sine',.11); tone(659,.09,.12,'sine',.10); tone(784,.18,.20,'sine',.12); tone(1047,.31,.28,'sine',.075); },
    () => { noise(.00,.28,.06,1200); tone(180,.00,.30,'sawtooth',.045,760); tone(880,.29,.16,'triangle',.10); tone(1320,.39,.19,'sine',.065); },
    () => { tone(115,.00,.22,'sine',.15,72); tone(440,.08,.20,'triangle',.08); tone(660,.19,.20,'triangle',.08); tone(880,.30,.24,'sine',.075); },
    () => { [0,.07,.14,.23,.32].forEach((t,i)=>tone([988,1319,1175,1568,1760][i],t,.11,'sine',.055)); tone(659,.10,.42,'triangle',.045); },
    () => { noise(.00,.09,.095,650); tone(330,.00,.10,'square',.05); tone(660,.07,.11,'triangle',.08); tone(990,.15,.13,'sine',.075); noise(.18,.14,.04,1800); }
  ];

  function makeLayer(xpText) {
    injectStyles();
    const layer = document.createElement('div');
    layer.className = 'task-celebration-layer';
    layer.innerHTML = `
      <canvas class="task-celebration-canvas"></canvas>
      <div class="task-celebration-badge">
        <div class="task-celebration-kicker">Task Complete</div>
        <div class="task-celebration-title">Geschafft</div>
        <div class="task-celebration-xp"></div>
      </div>`;
    layer.querySelector('.task-celebration-xp').textContent = xpText || '+XP';
    document.body.appendChild(layer);
    return layer;
  }

  function setupCanvas(canvas) {
    const dpr = clamp(window.devicePixelRatio || 1, 1, 2);
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    const ctx = canvas.getContext('2d', { alpha: true });
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx, w, h, dpr };
  }

  function palette(index) {
    return [
      ['#8ea2ff','#70e1c8','#ffffff','#ffd58f'],
      ['#70e1c8','#9fe8ff','#ffffff','#8ea2ff'],
      ['#8ea2ff','#b8c5ff','#70e1c8','#ffffff'],
      ['#ffe09c','#ffffff','#8ea2ff','#70e1c8'],
      ['#ff9fca','#8ea2ff','#70e1c8','#ffd58f']
    ][index];
  }

  function runVisual(index, layer, duration) {
    const canvas = layer.querySelector('canvas');
    const { ctx, w, h } = setupCanvas(canvas);
    const colors = palette(index);
    const cx = w * .5;
    const cy = h * (w < 450 ? .43 : .45);
    const start = performance.now();
    const particles = [];

    const count = reduceMotion ? 18 : (w < 480 ? 58 : 90);
    for (let i = 0; i < count; i++) {
      const a = rand(0, Math.PI * 2);
      const speed = rand(120, 520);
      particles.push({
        a, speed, size: rand(2, 8), spin: rand(-8, 8), rot: rand(0, Math.PI * 2),
        color: colors[i % colors.length], seed: Math.random(), x: cx, y: cy,
        vx: Math.cos(a) * speed, vy: Math.sin(a) * speed, life: rand(.7, 1)
      });
    }

    function frame(now) {
      const t = clamp((now - start) / duration, 0, 1);
      ctx.clearRect(0, 0, w, h);
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';

      if (index === 0) {
        // PRISM BURST: crisp radial rays + faceted shards.
        const rayP = Math.sin(Math.min(1, t * 2.1) * Math.PI / 2);
        for (let i = 0; i < 18; i++) {
          const a = (i / 18) * Math.PI * 2 + .12;
          const inner = 76 + rayP * 18;
          const outer = 95 + rayP * Math.min(w, h) * .55;
          ctx.strokeStyle = colors[i % colors.length];
          ctx.globalAlpha = (1 - t) * .42;
          ctx.lineWidth = i % 3 === 0 ? 4 : 1.5;
          ctx.beginPath(); ctx.moveTo(cx + Math.cos(a)*inner, cy + Math.sin(a)*inner); ctx.lineTo(cx + Math.cos(a)*outer, cy + Math.sin(a)*outer); ctx.stroke();
        }
        particles.forEach(p => {
          const tt = t * p.life;
          const x = cx + p.vx * tt;
          const y = cy + p.vy * tt;
          ctx.save(); ctx.translate(x,y); ctx.rotate(p.rot + p.spin*t); ctx.globalAlpha = (1-t)*.95;
          ctx.fillStyle = p.color; ctx.beginPath(); ctx.moveTo(-p.size*1.5,p.size); ctx.lineTo(0,-p.size*2.1); ctx.lineTo(p.size*1.4,p.size); ctx.closePath(); ctx.fill(); ctx.restore();
        });
      } else if (index === 1) {
        // XP COMET: diagonal speed streaks and a bright comet sweep.
        ctx.globalAlpha = 1 - t * .55;
        particles.forEach((p, i) => {
          const phase = (t * 1.35 + p.seed) % 1;
          const x = -80 + phase * (w + 180);
          const y = h * (.12 + p.seed * .76) + Math.sin(p.seed*20) * 26;
          const len = 40 + p.size * 13;
          const grad = ctx.createLinearGradient(x-len,y+len*.32,x,y);
          grad.addColorStop(0,'rgba(255,255,255,0)'); grad.addColorStop(1,p.color);
          ctx.strokeStyle = grad; ctx.lineWidth = Math.max(1,p.size*.5); ctx.beginPath(); ctx.moveTo(x-len,y+len*.28); ctx.lineTo(x,y); ctx.stroke();
        });
        const cp = Math.min(1, t * 1.35);
        const cometX = -120 + cp * (w + 240);
        const cometY = cy + 90 - cp * 180;
        const g = ctx.createRadialGradient(cometX,cometY,0,cometX,cometY,44);
        g.addColorStop(0,'#fff'); g.addColorStop(.2,colors[0]); g.addColorStop(1,'rgba(112,225,200,0)');
        ctx.globalAlpha = Math.sin(Math.PI*cp); ctx.fillStyle=g; ctx.beginPath();ctx.arc(cometX,cometY,46,0,Math.PI*2);ctx.fill();
      } else if (index === 2) {
        // ENERGY RINGS: layered shockwaves with a central flash.
        for (let i = 0; i < 5; i++) {
          const local = clamp(t * 1.55 - i * .11, 0, 1);
          if (!local) continue;
          const r = 36 + local * Math.min(w,h) * .52;
          ctx.globalAlpha = (1-local) * .65;
          ctx.strokeStyle = colors[i % colors.length];
          ctx.lineWidth = 5 - i * .55;
          ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.stroke();
        }
        const flash = Math.max(0, 1 - t * 3.8);
        const g = ctx.createRadialGradient(cx,cy,0,cx,cy,180);
        g.addColorStop(0,`rgba(255,255,255,${flash})`); g.addColorStop(.35,`rgba(142,162,255,${flash*.45})`); g.addColorStop(1,'rgba(142,162,255,0)');
        ctx.globalAlpha=1;ctx.fillStyle=g;ctx.fillRect(cx-180,cy-180,360,360);
        particles.slice(0,Math.floor(count*.6)).forEach(p=>{
          const r=70+t*p.speed*.58;const x=cx+Math.cos(p.a)*r;const y=cy+Math.sin(p.a)*r;
          ctx.globalAlpha=(1-t)*.75;ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(x,y,p.size*.45,0,Math.PI*2);ctx.fill();
        });
      } else if (index === 3) {
        // STAR SHOWER: falling stars, sparkles and soft trails.
        particles.forEach((p,i)=>{
          const phase = (t * (.75 + p.seed*.55) + p.seed) % 1;
          const x = (p.seed * w * 1.3 + i * 23) % (w + 80) - 40;
          const y = -60 + phase * (h + 140);
          const s = p.size * .85;
          ctx.globalAlpha = Math.sin(Math.PI*phase) * .85;
          ctx.strokeStyle=p.color;ctx.lineWidth=Math.max(1,s*.35);
          ctx.beginPath();ctx.moveTo(x,y-30-s*2);ctx.lineTo(x,y+2);ctx.stroke();
          ctx.fillStyle='#fff';ctx.beginPath();ctx.moveTo(x,y-s*1.7);ctx.lineTo(x+s*.45,y-s*.35);ctx.lineTo(x+s*1.7,y);ctx.lineTo(x+s*.45,y+s*.35);ctx.lineTo(x,y+s*1.7);ctx.lineTo(x-s*.45,y+s*.35);ctx.lineTo(x-s*1.7,y);ctx.lineTo(x-s*.45,y-s*.35);ctx.closePath();ctx.fill();
        });
      } else {
        // NEON CONFETTI: gravity-driven ribbons + circular pops.
        particles.forEach((p,i)=>{
          const tt=t*1.22;
          const x = cx + p.vx * tt * .72;
          const y = cy + p.vy * tt * .52 + 540 * tt * tt;
          ctx.save();ctx.translate(x,y);ctx.rotate(p.rot+p.spin*t);
          ctx.globalAlpha = Math.max(0,1-t*.95);ctx.fillStyle=p.color;
          if(i%3===0){ctx.beginPath();ctx.arc(0,0,p.size*.65,0,Math.PI*2);ctx.fill();}
          else ctx.fillRect(-p.size*.7,-p.size*1.8,p.size*1.4,p.size*3.6);
          ctx.restore();
        });
      }

      ctx.restore();
      if (t < 1 && layer.isConnected) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  function chooseCelebration() {
    let next = Math.floor(Math.random() * 5);
    if (next === lastCelebration) next = (next + 1 + Math.floor(Math.random() * 4)) % 5;
    lastCelebration = next;
    return next;
  }

  function celebrate(xpText) {
    const run = ++activeRun;
    const index = chooseCelebration();
    const duration = reduceMotion ? 850 : 1850;
    const layer = makeLayer(xpText);
    runVisual(index, layer, duration);
    try { sfx[index](); } catch {}
    if (navigator.vibrate && !reduceMotion) {
      try { navigator.vibrate(index === 2 ? [18,38,25] : [12,45,18]); } catch {}
    }
    window.setTimeout(() => {
      if (run !== activeRun || !layer.isConnected) return;
      layer.classList.add('is-leaving');
      window.setTimeout(() => layer.remove(), 240);
    }, duration - 180);
  }

  // Capture the XP before app.js clears the active task. Prime audio while still
  // inside the user gesture so mobile browsers allow the generated SFX.
  document.addEventListener('click', event => {
    const button = event.target.closest?.('#completeTaskBtn');
    if (!button || button.disabled || button.classList.contains('hidden')) return;
    ensureAudio();
    const xpText = document.getElementById('taskXpPreview')?.textContent?.trim() || '+XP';
    window.setTimeout(() => celebrate(xpText), 0);
  }, true);
})();
