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
 b.damageNumbers??=[];b.damageNumbers.push({side:'hero',contact:'enemy',index,amount,critical,start:now,duration:1000});
 const hp=b.kind?state.party[index].hp:b.hp;
 startHealthTransition(b,'hero-'+index,hp,amount);soundBattleContact('enemy',critical);
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
 const key=enemyArtKey(enemy.name);
 const frame=key?enemyFrame(key):heroBattleArt[enemy.name]?.idle;
 const icon=document.createElement('img');icon.className='enemy-emblem';icon.alt='';
 icon.style.objectFit='contain';if(frame)icon.src=frame.src;
 return icon;
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
  const action=button.dataset.action;
  if(SKILLS[action] && state.battleMenu==='magic'){
   const art=document.createElement('img');art.className='skill-motif';
   art.alt='';art.src=effectFrames[effectMotifs[action]].src;button.prepend(art);return;
  }
  if(!icons[action])return;
  const label=document.createElement('span');label.textContent=button.textContent.replace(/^▶\s*/, '');
  const icon=document.createElement('span');icon.className='command-icon';icon.textContent=icons[action];icon.setAttribute('aria-hidden','true');button.replaceChildren(icon,label);
 });
 const playback=$('battle-playback');if(playback.parentElement!==$('command-window'))$('command-window').appendChild(playback);
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
function showBattleHealing(index,amount){
 if(amount<=0)return;
 const battle=state.battle;
 battle.damageNumbers??=[];
 battle.damageNumbers.push({side:'hero',index,amount,healing:true,start:combatClock(),duration:1000});
}
drawDamageNumbers=function(b){
 const now=state.time,positions=b.kind?battleEnemyPositions(b):[[160,142]];b.damageNumbers=(b.damageNumbers||[]).filter(item=>now-item.start<item.duration);cinematicDamage.replaceChildren();
 b.damageNumbers.forEach(item=>{paintBattleContact(b,item,now);const p=item.side==='hero'?(b.kind?heroBattlePoint(item.index):[385,196]):positions[item.index]||positions[0],t=Math.max(0,(now-item.start)/item.duration),label=document.createElement('div');label.className='damage-pop'+(item.healing?' healing':item.critical?' critical':'');label.style.left=p[0]/512*100+'%';label.style.top=(p[1]-35-t*22)/288*100+'%';label.style.opacity=Math.min(1,(1-t)*2);const scale=t<.15?.65+t*4:t<.3?1.25-(t-.15)*1.67:1;label.style.transform='translate(-50%,-80%) scale('+scale+')';if(item.critical){const caption=document.createElement('small');caption.textContent=tr('CRITICAL!','ضربة حرجة!');label.appendChild(caption)}const number=document.createElement('strong');number.textContent=item.healing?'+'+item.amount:item.amount;label.appendChild(number);cinematicDamage.appendChild(label)})
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
