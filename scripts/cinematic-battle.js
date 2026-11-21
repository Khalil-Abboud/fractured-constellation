'use strict';
// Cinematic HUD; health knowledge stays owned by the existing encounter rules.
const cinematicPrevious={renderCommands,renderTargets,drawDamageNumbers,triggerEnemyDamageFeedback};
const cinematicDamage=document.createElement('div');cinematicDamage.id='cinematic-damage';ui.battle.appendChild(cinematicDamage);
const healthTransitions=new WeakMap();
function startHealthTransition(b,key,current,damage){
 let transitions=healthTransitions.get(b);
 if(!transitions){transitions=new Map();healthTransitions.set(b,transitions)}
 const previous=transitions.get(key);
 transitions.set(key,{from:Math.max(previous?.displayed??current+damage,current+damage),to:current,start:combatClock(),displayed:current+damage});
}
function animatedHealth(b,key,current){
 const transition=healthTransitions.get(b)?.get(key);
 if(!transition)return {value:current,active:false};
 const progress=Math.min(1,Math.max(0,(combatClock()-transition.start)/700));
 transition.displayed=transition.from+(transition.to-transition.from)*progress;
 if(progress===1){healthTransitions.get(b).delete(key);return {value:current,active:false}}
 return {value:transition.displayed,active:true};
}
function triggerHeroDamageFeedback(index,amount,critical=false){
 const b=state.battle;if(!b||amount<=0)return;
 const now=combatClock();b.heroHits??={};b.heroHits[index]={start:now};
 b.damageNumbers??=[];b.damageNumbers.push({side:'hero',index,amount,critical,start:now,duration:1000});
 const hp=b.kind?state.party[index].hp:b.hp;
 startHealthTransition(b,'hero-'+index,hp,amount);battleSfx('hit');
}
const cinematicEnemyTurnPrevious=enemyTurn;
enemyTurn=function(){
 const b=state.battle,before=b?.hp;
 cinematicEnemyTurnPrevious();
 if(b&&!b.kind&&Number.isFinite(before)&&b.hp<before)triggerHeroDamageFeedback(0,before-b.hp,false);
};
positionEnemyCards=function(){};
const cinematicSoundPrevious=battleSfx;
battleSfx=function(kind){if(kind==='hit'&&audio.ctx?.state==='running'){impactNoise(.13,.65,1700);tone(95,.19,'triangle',.58,audio.sfxGain);tone(420,.055,'square',.22,audio.sfxGain)}cinematicSoundPrevious(kind)};
function cinematicEnemies(b){return b.kind?b.enemies:[{name:'Atrox',ar:'أتروكس',hp:b.enemyHP,maxHP:800}]}
function enemyPortrait(enemy) {
 const icon=document.createElement('canvas');icon.width=40;icon.height=40;icon.className='enemy-emblem';
 const brush=icon.getContext('2d');brush.fillStyle=enemy.color||'#ab91cf';
 if(/Wisp|Echo/.test(enemy.name)) {
  brush.beginPath();brush.arc(20,21,15,0,Math.PI*2);brush.fill();brush.fillStyle='#fff4be';brush.fillRect(12,16,4,4);brush.fillRect(24,16,4,4);
 } else if(/Hound|Wolf/.test(enemy.name)) {
  brush.fillStyle='#a68d80';brush.fillRect(11,17,24,15);brush.fillRect(5,11,14,16);brush.fillStyle='#697780';brush.fillRect(6,5,4,9);brush.fillRect(14,5,4,9);brush.fillRect(13,30,4,8);brush.fillRect(29,30,4,8);
 } else {
  brush.fillRect(11,15,18,17);brush.fillStyle='#d1aa8a';brush.fillRect(13,5,14,12);brush.fillStyle='#68768c';brush.fillRect(12,3,16,5);brush.fillStyle='#34364c';brush.fillRect(11,31,6,8);brush.fillRect(23,31,6,8);
 }return icon;
}
renderTargets=function(){
 const b=state.battle;if(!b)return;prepareEnemyKnowledge(b);let panel=$('enemy-targets');if(!panel){panel=document.createElement('div');panel.id='enemy-targets';ui.battle.appendChild(panel)}
 panel.className='cinematic-enemies';panel.replaceChildren();
 const enemies=cinematicEnemies(b);
 if(!enemies[state.target]?.hp)state.target=enemies.findIndex(enemy=>enemy.hp>0);
 const recent= b.cinematicFocusUntil>combatClock() && enemies[b.cinematicFocus]?.hp>0;
 const focus=recent?b.cinematicFocus:state.target;
 enemies.forEach((enemy,index)=>{
  if(enemy.hp<=0)return;
  const button=document.createElement('button');button.type='button';button.className='cinematic-enemy'+(index===focus?' primary':'');button.dataset.enemy=index;button.disabled=!!b.busy;
  button.appendChild(enemyPortrait(enemy));
  const content=document.createElement('span');content.className='enemy-content';
  const name=document.createElement('strong');name.textContent=tr(enemy.name,enemy.ar);content.appendChild(name);
  const healthLabel=document.createElement('span');healthLabel.className='enemy-health-label';healthLabel.textContent=tr('HP','صحة');content.appendChild(healthLabel);
  const value=document.createElement('span');value.className='cinematic-hp-value';value.textContent=b.healthKnowledge[index]?Math.max(0,enemy.hp)+' / '+enemy.maxHP:'?';content.appendChild(value);
  const track=document.createElement('span');track.className='cinematic-hp-track';const fill=document.createElement('span');fill.className='cinematic-hp-fill';fill.dataset.index=index;track.appendChild(fill);content.appendChild(track);
  button.appendChild(content);button.title=tr(enemy.name,enemy.ar);
  button.addEventListener('click',()=>{if(b.busy)return;state.target=index;b.cinematicFocusUntil=0;battleSfx('menu');renderTargets()});panel.appendChild(button);
 });
};
renderCommands=function(){
 cinematicPrevious.renderCommands();
 $('command-window').classList.remove('cinematic-wheel');ui.battle.classList.add('cinematic');
 const icons={attack:'⚔',magic:'✦',item:'♜',auto:'⟳',run:'➜',special:'◈'};
 document.querySelectorAll('#command-list .command').forEach(button=>{
  const action=button.dataset.action;if(!icons[action])return;
  const label=document.createElement('span');label.textContent=button.textContent.replace(/^▶\s*/, '');
  const icon=document.createElement('span');icon.className='command-icon';icon.textContent=icons[action];icon.setAttribute('aria-hidden','true');button.replaceChildren(icon,label);
 });
 const playback=$('battle-playback');$('command-window').appendChild(playback);
};
triggerEnemyDamageFeedback=function(entries,options){
 const b=state.battle;
 if(b&&entries.length){
  b.cinematicFocus=entries[0].index;b.cinematicFocusUntil=combatClock()+700;
  const enemies=cinematicEnemies(b);
  entries.forEach(hit=>startHealthTransition(b,'enemy-'+hit.index,enemies[hit.index]?.hp||0,hit.amount));
 }
 cinematicPrevious.triggerEnemyDamageFeedback(entries,options);renderTargets();
};
drawDamageNumbers=function(b){
 const now=state.time,positions=b.kind?battleEnemyPositions(b):[[160,142]];b.damageNumbers=(b.damageNumbers||[]).filter(item=>now-item.start<item.duration);cinematicDamage.replaceChildren();
 b.damageNumbers.forEach(item=>{const p=item.side==='hero'?(b.kind?heroBattlePoint(item.index):[385,196]):positions[item.index]||positions[0],t=Math.max(0,(now-item.start)/item.duration),label=document.createElement('div');label.className='damage-pop'+(item.critical?' critical':'');label.style.left=p[0]/512*100+'%';label.style.top=(p[1]-35-t*22)/288*100+'%';label.style.opacity=Math.min(1,(1-t)*2);const scale=t<.15?.65+t*4:t<.3?1.25-(t-.15)*1.67:1;label.style.transform='translate(-50%,-80%) scale('+scale+')';if(item.critical){const caption=document.createElement('small');caption.textContent=tr('CRITICAL!','ضربة حرجة!');label.appendChild(caption)}const number=document.createElement('strong');number.textContent=item.amount;label.appendChild(number);cinematicDamage.appendChild(label)})
};
function cinematicTick(){
 const b=state.battle;
 if(b&&!ui.battle.classList.contains('hidden')){
  const enemies=cinematicEnemies(b);
  document.querySelectorAll('.cinematic-hp-fill').forEach(fill=>{
   const index=+fill.dataset.index,enemy=enemies[index];if(!enemy)return;
   const health=animatedHealth(b,'enemy-'+index,enemy.hp),known=b.healthKnowledge?.[index];
   fill.style.width=(known?Math.max(0,health.value/enemy.maxHP*100):100)+'%';
   fill.classList.toggle('taking-damage',health.active&&!!known);
  });
  document.querySelectorAll('#status-window .party-card').forEach((card,index)=>{
   const hero=state.party[index];if(!hero)return;
   const current=b.kind?hero.hp:b.hp,health=animatedHealth(b,'hero-'+index,current),fill=card.querySelector('.hp');
   if(fill){fill.style.width=Math.max(0,health.value/heroStats(hero).hp*100)+'%';fill.classList.toggle('taking-damage',health.active)}
  });
 }
 requestAnimationFrame(cinematicTick)
}requestAnimationFrame(cinematicTick);
