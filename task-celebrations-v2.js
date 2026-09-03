(() => {
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  let last = -1;
  let audio = null;
  let master = null;
  let runId = 0;

  const clamp = (v,a,b)=>Math.max(a,Math.min(b,v));
  const rand = (a,b)=>a+Math.random()*(b-a);

  function audioReady(){
    try{
      if(!audio){
        const AC=window.AudioContext||window.webkitAudioContext;
        if(!AC)return null;
        audio=new AC();
        master=audio.createGain();
        master.gain.value=.17;
        master.connect(audio.destination);
      }
      if(audio.state==='suspended') audio.resume().catch(()=>{});
      return audio;
    }catch{return null;}
  }

  function tone(freq,at=0,dur=.12,type='sine',gain=.08,end=null){
    const ctx=audioReady(); if(!ctx||!master)return;
    const t=ctx.currentTime+at, o=ctx.createOscillator(), g=ctx.createGain();
    o.type=type; o.frequency.setValueAtTime(Math.max(30,freq),t);
    if(end) o.frequency.exponentialRampToValueAtTime(Math.max(30,end),t+dur);
    g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(gain,t+.02); g.gain.exponentialRampToValueAtTime(.0001,t+dur);
    o.connect(g); g.connect(master); o.start(t); o.stop(t+dur+.04);
  }

  function noise(at=0,dur=.15,gain=.05,hp=900){
    const ctx=audioReady(); if(!ctx||!master)return;
    const n=Math.max(1,Math.floor(ctx.sampleRate*dur));
    const b=ctx.createBuffer(1,n,ctx.sampleRate), d=b.getChannelData(0);
    for(let i=0;i<n;i++) d[i]=(Math.random()*2-1)*(1-i/n);
    const s=ctx.createBufferSource(), f=ctx.createBiquadFilter(), g=ctx.createGain();
    f.type='highpass'; f.frequency.value=hp; g.gain.setValueAtTime(gain,ctx.currentTime+at); g.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+at+dur);
    s.buffer=b; s.connect(f); f.connect(g); g.connect(master); s.start(ctx.currentTime+at);
  }

  const sfx=[
    ()=>{tone(523,0,.12);tone(659,.08,.13);tone(784,.17,.18);tone(1047,.3,.24,'sine',.06)},
    ()=>{noise(0,.25,.05,1200);tone(180,0,.3,'sawtooth',.04,760);tone(880,.29,.15,'triangle',.08);tone(1320,.4,.18,'sine',.05)},
    ()=>{tone(110,0,.22,'sine',.12,70);tone(440,.08,.18,'triangle',.07);tone(660,.18,.2,'triangle',.07);tone(880,.3,.22,'sine',.06)},
    ()=>{[988,1319,1175,1568,1760].forEach((f,i)=>tone(f,i*.075,.11,'sine',.045));tone(659,.1,.4,'triangle',.035)},
    ()=>{noise(0,.09,.08,650);tone(330,0,.1,'square',.04);tone(660,.07,.11,'triangle',.065);tone(990,.15,.13,'sine',.06);noise(.18,.13,.035,1800)},
    ()=>{tone(220,0,.42,'sine',.07,880);tone(880,.27,.18,'triangle',.065);tone(1320,.4,.2,'sine',.05)},
    ()=>{tone(196,0,.13,'square',.035);tone(392,.08,.13,'square',.045);tone(784,.16,.13,'triangle',.06);noise(.22,.12,.03,1500)},
    ()=>{noise(0,.16,.05,1400);tone(1047,.05,.12,'sine',.055);tone(1397,.14,.14,'sine',.05);tone(2093,.24,.2,'sine',.04)},
    ()=>{tone(90,0,.38,'sine',.1,55);tone(360,.13,.28,'sine',.055,720);tone(1080,.38,.2,'triangle',.055)},
    ()=>{tone(262,0,.1,'triangle',.05);tone(330,.065,.1,'triangle',.05);tone(392,.13,.11,'triangle',.055);tone(523,.21,.15,'sine',.06);tone(784,.34,.22,'sine',.05)}
  ];

  const palettes=[
    ['#8ea2ff','#70e1c8','#ffffff','#ffd58f'],['#70e1c8','#9fe8ff','#ffffff','#8ea2ff'],['#8ea2ff','#b8c5ff','#70e1c8','#ffffff'],['#ffe09c','#ffffff','#8ea2ff','#70e1c8'],['#ff9fca','#8ea2ff','#70e1c8','#ffd58f'],
    ['#8ffff0','#6e8cff','#ffffff','#9de3ff'],['#ff7edb','#8ea2ff','#ffffff','#70e1c8'],['#ffe79c','#ffb36d','#ffffff','#8ea2ff'],['#70e1c8','#4ab4ff','#ffffff','#b7ffec'],['#c6a7ff','#8ea2ff','#ffffff','#ffd58f']
  ];

  function styles(){
    if(document.getElementById('celebrationV2Styles'))return;
    const s=document.createElement('style'); s.id='celebrationV2Styles';
    s.textContent=`
      .celebration-v2{position:fixed;inset:0;z-index:99999;pointer-events:none;overflow:hidden;opacity:1;transition:opacity .22s ease}
      .celebration-v2.out{opacity:0}.celebration-v2 canvas{position:absolute;inset:0;width:100%;height:100%;display:block}
      .celebration-badge-v2{position:absolute;left:50%;top:44%;transform:translate(-50%,-50%);min-width:min(76vw,300px);padding:15px 22px;text-align:center;border-radius:22px;background:linear-gradient(180deg,rgba(18,25,48,.91),rgba(7,12,28,.86));border:1px solid rgba(255,255,255,.22);box-shadow:0 24px 80px rgba(0,0,0,.45),0 0 60px rgba(142,162,255,.22);backdrop-filter:blur(18px);animation:cbadge .6s cubic-bezier(.16,.9,.2,1) both}
      .celebration-badge-v2 small{display:block;color:#b9c6ff;font-size:.66rem;font-weight:950;letter-spacing:.16em;text-transform:uppercase}.celebration-badge-v2 b{display:block;margin-top:5px;font-size:clamp(1.5rem,7vw,2.2rem);line-height:1;color:#fff}.celebration-badge-v2 span{display:block;margin-top:8px;color:#ffe0ad;font-weight:950}
      @keyframes cbadge{0%{opacity:0;transform:translate(-50%,-42%) scale(.72);filter:blur(5px)}68%{opacity:1;transform:translate(-50%,-51%) scale(1.045);filter:blur(0)}100%{transform:translate(-50%,-50%) scale(1)}}
      @media(max-width:450px){.celebration-badge-v2{top:42%;padding:13px 18px;border-radius:18px}}@media(prefers-reduced-motion:reduce){.celebration-badge-v2{animation:none}}
    `;
    document.head.appendChild(s);
  }

  function layer(xp){
    styles(); const el=document.createElement('div'); el.className='celebration-v2';
    el.innerHTML='<canvas></canvas><div class="celebration-badge-v2"><small>Task Complete</small><b>Geschafft</b><span></span></div>';
    el.querySelector('span').textContent=xp||'+XP'; document.body.appendChild(el); return el;
  }

  function canvasSetup(c){
    const dpr=clamp(devicePixelRatio||1,1,2), w=innerWidth, h=innerHeight;
    c.width=Math.round(w*dpr); c.height=Math.round(h*dpr); c.style.width=w+'px'; c.style.height=h+'px';
    const ctx=c.getContext('2d',{alpha:true}); ctx.setTransform(dpr,0,0,dpr,0,0); return {ctx,w,h};
  }

  function drawStar(ctx,x,y,r,color,a=1){ctx.save();ctx.translate(x,y);ctx.globalAlpha=a;ctx.fillStyle=color;ctx.beginPath();for(let i=0;i<10;i++){const rr=i%2? r*.42:r,ang=-Math.PI/2+i*Math.PI/5;ctx.lineTo(Math.cos(ang)*rr,Math.sin(ang)*rr)}ctx.closePath();ctx.fill();ctx.restore()}

  function visual(index,el,duration){
    const {ctx,w,h}=canvasSetup(el.querySelector('canvas')), colors=palettes[index], cx=w*.5, cy=h*(w<450?.42:.44), start=performance.now();
    const count=reduced?16:(w<480?56:92), p=[];
    for(let i=0;i<count;i++){const a=rand(0,Math.PI*2), sp=rand(100,520);p.push({a,sp,s:rand(2,8),seed:Math.random(),rot:rand(0,6.28),spin:rand(-8,8),c:colors[i%colors.length],vx:Math.cos(a)*sp,vy:Math.sin(a)*sp});}

    function frame(now){
      const t=clamp((now-start)/duration,0,1);ctx.clearRect(0,0,w,h);ctx.save();ctx.globalCompositeOperation='lighter';

      if(index===0){
        for(let i=0;i<20;i++){const a=i/20*Math.PI*2,r1=68,r2=90+t*Math.min(w,h)*.5;ctx.globalAlpha=(1-t)*.45;ctx.strokeStyle=colors[i%4];ctx.lineWidth=i%4===0?4:1.3;ctx.beginPath();ctx.moveTo(cx+Math.cos(a)*r1,cy+Math.sin(a)*r1);ctx.lineTo(cx+Math.cos(a)*r2,cy+Math.sin(a)*r2);ctx.stroke()}
        p.forEach(q=>{ctx.save();ctx.translate(cx+q.vx*t,cy+q.vy*t);ctx.rotate(q.rot+q.spin*t);ctx.globalAlpha=1-t;ctx.fillStyle=q.c;ctx.beginPath();ctx.moveTo(-q.s*1.5,q.s);ctx.lineTo(0,-q.s*2);ctx.lineTo(q.s*1.5,q.s);ctx.closePath();ctx.fill();ctx.restore()});
      }else if(index===1){
        p.forEach((q,i)=>{const ph=(t*1.35+q.seed)%1,x=-80+ph*(w+180),y=h*(.1+q.seed*.8),len=35+q.s*14,g=ctx.createLinearGradient(x-len,y+len*.25,x,y);g.addColorStop(0,'rgba(255,255,255,0)');g.addColorStop(1,q.c);ctx.globalAlpha=1-t*.55;ctx.strokeStyle=g;ctx.lineWidth=Math.max(1,q.s*.45);ctx.beginPath();ctx.moveTo(x-len,y+len*.25);ctx.lineTo(x,y);ctx.stroke()});
      }else if(index===2){
        for(let i=0;i<6;i++){const lt=clamp(t*1.6-i*.1,0,1);ctx.globalAlpha=(1-lt)*.65;ctx.strokeStyle=colors[i%4];ctx.lineWidth=5-i*.5;ctx.beginPath();ctx.arc(cx,cy,34+lt*Math.min(w,h)*.53,0,Math.PI*2);ctx.stroke()}
      }else if(index===3){
        p.forEach((q,i)=>{const ph=(t*(.7+q.seed*.6)+q.seed)%1,x=(q.seed*w*1.4+i*19)%(w+80)-40,y=-60+ph*(h+140);drawStar(ctx,x,y,q.s*.9,'#fff',Math.sin(Math.PI*ph)*.9)});
      }else if(index===4){
        p.forEach((q,i)=>{const tt=t*1.2,x=cx+q.vx*tt*.7,y=cy+q.vy*tt*.48+520*tt*tt;ctx.save();ctx.translate(x,y);ctx.rotate(q.rot+q.spin*t);ctx.globalAlpha=Math.max(0,1-t);ctx.fillStyle=q.c;i%3?ctx.fillRect(-q.s*.7,-q.s*1.8,q.s*1.4,q.s*3.6):(ctx.beginPath(),ctx.arc(0,0,q.s*.7,0,6.28),ctx.fill());ctx.restore()});
      }else if(index===5){
        // AURORA WAVE
        for(let band=0;band<5;band++){ctx.beginPath();for(let x=-30;x<=w+30;x+=14){const y=cy+(band-2)*28+Math.sin(x*.014+t*9+band)*30*(1-t*.45);x===-30?ctx.moveTo(x,y):ctx.lineTo(x,y)}ctx.globalAlpha=(1-t)*(.34-band*.035);ctx.strokeStyle=colors[band%4];ctx.lineWidth=16-band*2;ctx.shadowBlur=22;ctx.shadowColor=colors[band%4];ctx.stroke()}ctx.shadowBlur=0;
      }else if(index===6){
        // HEX PORTAL
        for(let ring=0;ring<7;ring++){const lt=clamp(t*1.45-ring*.065,0,1),r=42+lt*(85+ring*32);ctx.globalAlpha=(1-lt)*.6;ctx.strokeStyle=colors[ring%4];ctx.lineWidth=3;ctx.beginPath();for(let k=0;k<6;k++){const a=k*Math.PI/3+t*(ring%2?1:-1),x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r;k?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.closePath();ctx.stroke()}
      }else if(index===7){
        // GOLD COIN CASCADE
        p.forEach((q,i)=>{const ph=(t*.92+q.seed)%1,x=(q.seed*w+i*31)%(w+60)-30,y=-50+ph*(h+120),r=4+q.s*.7;ctx.save();ctx.translate(x,y);ctx.scale(.28+Math.abs(Math.sin(t*10+i))* .72,1);ctx.globalAlpha=Math.sin(Math.PI*ph)*.9;ctx.fillStyle=i%3?'#ffd66b':'#fff3b4';ctx.beginPath();ctx.arc(0,0,r,0,6.28);ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=1;ctx.stroke();ctx.restore()});
      }else if(index===8){
        // WATER RIPPLE BLOOM
        const g=ctx.createRadialGradient(cx,cy,0,cx,cy,Math.min(w,h)*.55);g.addColorStop(0,'rgba(112,225,200,.16)');g.addColorStop(1,'rgba(70,160,255,0)');ctx.globalAlpha=1-t*.7;ctx.fillStyle=g;ctx.fillRect(0,0,w,h);for(let i=0;i<8;i++){const lt=clamp(t*1.35-i*.075,0,1),r=20+lt*Math.min(w,h)*(.14+i*.035);ctx.globalAlpha=(1-lt)*.5;ctx.strokeStyle=colors[i%4];ctx.lineWidth=2.5;ctx.beginPath();ctx.ellipse(cx,cy,r,r*.36,0,0,6.28);ctx.stroke()}
      }else{
        // CONSTELLATION CONNECT
        const pts=p.slice(0,reduced?10:24).map((q,i)=>({x:w*(.08+q.seed*.84),y:h*(.1+((q.seed*7+i*.17)%1)*.78),s:q.s,c:q.c}));
        ctx.globalAlpha=(1-t)*.6;for(let i=0;i<pts.length-1;i++){const a=pts[i],b=pts[(i+3)%pts.length];ctx.strokeStyle=colors[i%4];ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke()}pts.forEach((q,i)=>drawStar(ctx,q.x,q.y,3+q.s*.35,i%4===0?'#fff':q.c,(1-t)*.9));
      }

      ctx.restore(); if(t<1&&el.isConnected)requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  function pick(){let n=Math.floor(Math.random()*10);if(n===last)n=(n+1+Math.floor(Math.random()*9))%10;last=n;return n;}

  function celebrate(xp){
    const id=++runId,index=pick(),duration=reduced?850:1900,el=layer(xp);visual(index,el,duration);try{sfx[index]()}catch{}
    if(navigator.vibrate&&!reduced){try{navigator.vibrate(index===2||index===6?[16,34,22]:[10,38,16])}catch{}}
    setTimeout(()=>{if(id!==runId||!el.isConnected)return;el.classList.add('out');setTimeout(()=>el.remove(),240)},duration-180);
  }

  document.addEventListener('click',e=>{
    const b=e.target.closest?.('#completeTaskBtn'); if(!b||b.disabled||b.classList.contains('hidden'))return;
    audioReady(); const xp=document.getElementById('taskXpPreview')?.textContent?.trim()||'+XP'; setTimeout(()=>celebrate(xp),0);
  },true);
})();