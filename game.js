(() => {
  'use strict';
  const canvas=document.getElementById('gameCanvas'),ctx=canvas.getContext('2d');
  const scoreEl=document.getElementById('score'),livesEl=document.getElementById('lives'),levelEl=document.getElementById('level');
  const overlay=document.getElementById('overlay'),overlayIcon=document.getElementById('overlayIcon'),overlayTitle=document.getElementById('overlayTitle'),overlayText=document.getElementById('overlayText');
  const startBtn=document.getElementById('startBtn'),restartBtn=document.getElementById('restartBtn');

  const keys={}; let running=false,last=0,score=0,lives=3,level=1,spawnTimer=0,shootTimer=0;
  const player={x:430,y:520,w:42,h:52,speed:330};
  let bullets=[],enemies=[],stars=[];

  function reset(){
    running=false; score=0;lives=3;level=1;bullets=[];enemies=[];spawnTimer=0;shootTimer=0;
    player.x=canvas.width/2-player.w/2;player.y=canvas.height-75;
    scoreEl.textContent=score;livesEl.textContent=lives;levelEl.textContent=level;
    stars=Array.from({length:150},()=>({x:Math.random()*canvas.width,y:Math.random()*canvas.height,s:Math.random()*2+1,v:20+Math.random()*70}));
    showOverlay('🚀','جاهز للمعركة؟','دمر سفن الأعداء ولا تدعها تصطدم بك.','ابدأ اللعبة',start);
  }
  function showOverlay(icon,title,text,button,onClick){overlayIcon.textContent=icon;overlayTitle.textContent=title;overlayText.textContent=text;startBtn.textContent=button;startBtn.onclick=onClick;overlay.classList.add('show')}
  function start(){running=true;overlay.classList.remove('show');last=performance.now();requestAnimationFrame(loop)}
  function fire(){if(shootTimer>0)return;bullets.push({x:player.x+player.w/2-3,y:player.y-12,w:6,h:16,v:560});shootTimer=.18}
  function spawnEnemy(){const size=34+Math.random()*20;enemies.push({x:20+Math.random()*(canvas.width-size-40),y:-size,w:size,h:size,v:95+level*19+Math.random()*55,hp:1})}
  function collide(a,b){return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y}
  function hitPlayer(enemy){enemies.splice(enemies.indexOf(enemy),1);lives--;livesEl.textContent=lives;if(lives<=0)gameOver()}
  function gameOver(){running=false;showOverlay('💥','انتهت اللعبة','نتيجتك: '+score,'العب من جديد',()=>{reset();start()})}
  function update(dt){
    shootTimer=Math.max(0,shootTimer-dt);
    const left=keys.ArrowLeft||keys.a,right=keys.ArrowRight||keys.d,up=keys.ArrowUp||keys.w,down=keys.ArrowDown||keys.s;
    if(left)player.x-=player.speed*dt;if(right)player.x+=player.speed*dt;if(up)player.y-=player.speed*dt;if(down)player.y+=player.speed*dt;if(keys[' '])fire();
    player.x=Math.max(0,Math.min(canvas.width-player.w,player.x));player.y=Math.max(0,Math.min(canvas.height-player.h,player.y));

    spawnTimer-=dt;if(spawnTimer<=0){spawnEnemy();spawnTimer=Math.max(.28,1.05-level*.055)}
    stars.forEach(s=>{s.y+=s.v*dt;if(s.y>canvas.height){s.y=0;s.x=Math.random()*canvas.width}});
    bullets.forEach(b=>b.y-=b.v*dt);bullets=bullets.filter(b=>b.y+b.h>0);

    for(let i=enemies.length-1;i>=0;i--){
      const e=enemies[i];e.y+=e.v*dt;
      if(collide(player,e)){hitPlayer(e);continue}
      if(e.y>canvas.height){enemies.splice(i,1);lives--;livesEl.textContent=lives;if(lives<=0){gameOver();return}continue}
      for(let j=bullets.length-1;j>=0;j--){
        if(collide(bullets[j],e)){bullets.splice(j,1);enemies.splice(i,1);score+=10;scoreEl.textContent=score;level=1+Math.floor(score/120);levelEl.textContent=level;break}
      }
    }
  }
  function draw(){
    const g=ctx.createLinearGradient(0,0,0,canvas.height);g.addColorStop(0,'#05091b');g.addColorStop(1,'#02040a');ctx.fillStyle=g;ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle='#fff';stars.forEach(s=>{ctx.globalAlpha=.35+s.s*.2;ctx.fillRect(s.x,s.y,s.s,s.s)});ctx.globalAlpha=1;
    bullets.forEach(b=>{ctx.fillStyle='#65f5ff';ctx.shadowColor='#65f5ff';ctx.shadowBlur=12;ctx.fillRect(b.x,b.y,b.w,b.h);ctx.shadowBlur=0});
    enemies.forEach(e=>{ctx.fillStyle='#ff5f6d';ctx.shadowColor='#ff3f58';ctx.shadowBlur=16;ctx.beginPath();ctx.moveTo(e.x+e.w/2,e.y+e.h);ctx.lineTo(e.x,e.y);ctx.lineTo(e.x+e.w,e.y);ctx.closePath();ctx.fill();ctx.shadowBlur=0});
    ctx.fillStyle='#44dff0';ctx.shadowColor='#44dff0';ctx.shadowBlur=18;ctx.beginPath();ctx.moveTo(player.x+player.w/2,player.y);ctx.lineTo(player.x,player.y+player.h);ctx.lineTo(player.x+player.w/2,player.y+player.h-12);ctx.lineTo(player.x+player.w,player.y+player.h);ctx.closePath();ctx.fill();ctx.shadowBlur=0;
  }
  function loop(now){if(!running)return;const dt=Math.min((now-last)/1000,.033);last=now;update(dt);draw();requestAnimationFrame(loop)}
  document.addEventListener('keydown',e=>{if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key))e.preventDefault();keys[e.key.toLowerCase()]=true;keys[e.key]=true});
  document.addEventListener('keyup',e=>{keys[e.key.toLowerCase()]=false;keys[e.key]=false});
  document.querySelectorAll('[data-control]').forEach(btn=>{const c=btn.dataset.control;const map={left:'ArrowLeft',right:'ArrowRight',up:'ArrowUp',down:'ArrowDown'};if(c==='fire'){btn.addEventListener('pointerdown',fire);return}btn.addEventListener('pointerdown',()=>keys[map[c]]=true);['pointerup','pointercancel','pointerleave'].forEach(ev=>btn.addEventListener(ev,()=>keys[map[c]]=false))});
  restartBtn.addEventListener('click',reset);reset();draw();
})();