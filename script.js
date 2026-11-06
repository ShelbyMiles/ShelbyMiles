(() => {
  'use strict';
  const sections = ['welcome','letter','final'];
  const openHeart = document.getElementById('heartButton');
  const againButton = document.getElementById('againButton');
  const answerButtons = document.querySelectorAll('[data-answer]');
  const finalMessage = document.getElementById('finalMessage');
  const canvas = document.getElementById('fireworks');
  const ctx = canvas.getContext('2d');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let current = 'welcome', particles = [], animationId = 0, lastBurst = 0, lastFrame = 0;
  function show(id) {
    current = id;
    for (const name of sections) {
      const el = document.getElementById(name);
      el.hidden = name !== id;
      el.classList.toggle('active', name === id);
    }
    window.scrollTo({top:0,behavior:'instant'});
    if (id === 'final') beginFireworks(); else stopFireworks();
  }
  openHeart.addEventListener('click', () => show('letter'));
  answerButtons.forEach(button => button.addEventListener('click', () => {
    finalMessage.textContent = button.dataset.answer === 'kiss'
      ? 'Тогда лови тысячу поцелуев, моя красотка! 💋❤️'
      : 'Спасибо, что подарила мне ещё одну улыбку. Я очень тебя ценю! ❤️';
    show('final');
  }));
  againButton.addEventListener('click', () => show('welcome'));
  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth, h = window.innerHeight;
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
    ctx.setTransform(dpr,0,0,dpr,0,0);
  }
  window.addEventListener('resize', resize, {passive:true});
  function burst(x,y,scale=1) {
    const colors = ['#ff5e83','#ffb4c6','#ffe2a8','#fff6e8','#ec335d'];
    const count = Math.round(58 * scale);
    for (let i=0;i<count;i++) {
      const angle=Math.PI*2*i/count, speed=(1.4+Math.random()*2.9)*scale;
      particles.push({x,y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,
        life:1,decay:.008+Math.random()*.009,color:colors[Math.floor(Math.random()*colors.length)],
        radius:1+Math.random()*1.8});
    }
    if(particles.length>420) particles.splice(0,particles.length-420);
  }
  function frame(t) {
    if(current !== 'final') return;
    const w=window.innerWidth,h=window.innerHeight;
    const dt=Math.min((t-lastFrame)/16.67 || 1,2.2); lastFrame=t;
    ctx.clearRect(0,0,w,h);
    if(t-lastBurst>570) {
      burst(w*(.12+Math.random()*.76),h*(.07+Math.random()*.42),Math.min(1.15,w/460+.23));
      lastBurst=t;
    }
    particles=particles.filter(p=>p.life>0);
    for(const p of particles) {
      p.x+=p.vx*dt; p.y+=p.vy*dt; p.vy+=.025*dt;p.vx*=.992;p.life-=p.decay*dt;
      ctx.globalAlpha=Math.max(0,p.life);
      ctx.fillStyle=p.color;ctx.shadowColor=p.color;ctx.shadowBlur=12;
      ctx.beginPath();ctx.arc(p.x,p.y,p.radius,0,Math.PI*2);ctx.fill();
    }
    ctx.globalAlpha=1;ctx.shadowBlur=0;
    animationId=requestAnimationFrame(frame);
  }
  function beginFireworks() {
    if(!ctx)return;
    resize();
    if(reduced.matches) {
      for(let i=0;i<5;i++)burst(window.innerWidth*(.17+i*.16),window.innerHeight*.23,1);
      for(const p of particles){ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x,p.y,2,0,Math.PI*2);ctx.fill();}
      return;
    }
    lastFrame=performance.now();lastBurst=0;
    animationId=requestAnimationFrame(frame);
  }
  function stopFireworks(){cancelAnimationFrame(animationId);particles=[];if(ctx)ctx.clearRect(0,0,canvas.width,canvas.height);}
  document.addEventListener('visibilitychange',()=> {
    if(document.hidden)cancelAnimationFrame(animationId);
    else if(current==='final'&&!reduced.matches){lastFrame=performance.now();animationId=requestAnimationFrame(frame);}
  });
})();