'use strict';
// Enemy knowledge, responsive UI, statistics, joystick, buttons, and startup.
// Encounter knowledge is frozen for a whole battle, then used on later encounters.
const ENEMY_KNOWLEDGE_KEY='fractured_enemy_knowledge_v1';
let knownEnemies=new Set(),testKnownEnemies=new Set();
try{const saved=JSON.parse(localStorage.getItem(ENEMY_KNOWLEDGE_KEY)||'[]');if(Array.isArray(saved))knownEnemies=new Set(saved.filter(x=>typeof x==='string'))}catch(_){}
function enemyKnowledgeKey(enemy){return enemy.name.replace(/\s+(?:[A-D]|\d+)$/,'').trim()}
function prepareEnemyKnowledge(b){
 if(b.healthKnowledge)return;
 const enemies=b.kind?b.enemies:[{name:'Atrox'}],known=state.devTesting?testKnownEnemies:knownEnemies;
 b.healthKnowledge=enemies.map(e=>known.has(enemyKnowledgeKey(e)));
 enemies.forEach(e=>known.add(enemyKnowledgeKey(e)));
 if(!state.devTesting)try{localStorage.setItem(ENEMY_KNOWLEDGE_KEY,JSON.stringify([...known]))}catch(_){}
}
function revealEnemyHealth(enemy,index,b=state.battle){
 if(!b)return false;prepareEnemyKnowledge(b);b.healthKnowledge[index]=true;
 const known=state.devTesting?testKnownEnemies:knownEnemies;known.add(enemyKnowledgeKey(enemy));
 if(!state.devTesting)try{localStorage.setItem(ENEMY_KNOWLEDGE_KEY,JSON.stringify([...known]))}catch(_){}
 return true
}
function enemyStatusLabels(e){
 const labels=[];
 if(e.poison?.turns>0)labels.push(tr('Poison '+e.poison.turns,'سم '+e.poison.turns));
 if(e.sealed?.turns>0)labels.push(tr('Seal '+e.sealed.turns,'ختم '+e.sealed.turns));
 if(e.gravity)labels.push(tr('ATK ↓ '+e.gravity.turns,'هجوم ↓ '+e.gravity.turns));
 if(e.sabotaged)labels.push(tr('DEF ↓','دفاع ↓'));
 if(e.stolenGold)labels.push('+'+e.stolenGold+' '+tr('loot','غنيمة'));
 return labels;
}
function positionEnemyCards(panel){
 const area=panel.getBoundingClientRect(),drawing=document.querySelector('canvas').getBoundingClientRect(),cards=[...panel.children];
 cards.forEach(card=>{const i=Number(card.dataset.enemy),b=state.battle,pos=b.kind?enemyBattlePoint(b,i):[160,142],r=card.getBoundingClientRect();card.style.left=Math.max(r.width/2+3,Math.min(area.width-r.width/2-3,drawing.left-area.left+pos[0]/512*drawing.width))+'px';card.style.top=Math.max(r.height+2,drawing.top-area.top+(pos[1]-(b.kind?50:62))/288*drawing.height)+'px'});
 // Small screens need a few pixels of separation between neighbouring labels.
 for(let pass=0;pass<cards.length;pass++)for(let i=cards.length-1;i>0;i--)for(let j=i-1;j>=0;j--){
  const later=cards[i].getBoundingClientRect(),earlier=cards[j].getBoundingClientRect();
  if(earlier.left<later.right+2&&earlier.right>later.left-2&&earlier.bottom>later.top-2&&earlier.top<later.bottom+2){const desired=later.top-area.top-2;cards[j].style.top=Math.max(earlier.height+2,desired)+'px'}
 }
}
renderTargets=function(){
 const b=state.battle;if(!b){$('enemy-targets')?.remove();return}
 let panel=$('enemy-targets');if(!panel){panel=document.createElement('div');panel.id='enemy-targets';ui.battle.appendChild(panel)}
 panel.className='floating-enemies';panel.replaceChildren();prepareEnemyKnowledge(b);
 const enemies=b.kind?b.enemies:[{name:'Atrox',ar:'أتروكس',hp:b.enemyHP,maxHP:800}];
 if(b.kind&&(!enemies[state.target]||enemies[state.target].hp<=0))state.target=enemies.findIndex(e=>e.hp>0);
 enemies.forEach((enemy,i)=>{
  if(enemy.hp<=0)return;
  const known=b.healthKnowledge[i],pos=b.kind?enemyBattlePoint(b,i):[160,142];
  const button=document.createElement('button');button.type='button';button.className='enemy-target'+(i===(state.target||0)?' selected':'');button.dataset.enemy=String(i);button.disabled=b.busy;
  button.style.left=(pos[0]/512*100)+'%';button.style.top=((pos[1]-(b.kind?50:62))/288*100)+'%';
  const name=document.createElement('strong');name.className='enemy-card-name';name.textContent=tr(enemy.name,enemy.ar);button.appendChild(name);
  const meter=document.createElement('div');meter.className='enemy-hp-track';
  const fill=document.createElement('span');fill.className='enemy-hp-fill';fill.style.width=(known?Math.max(0,Math.min(100,enemy.hp/enemy.maxHP*100)):100)+'%';fill.classList.toggle('unknown',!known);meter.appendChild(fill);
  const value=document.createElement('span');value.className='enemy-hp-value';value.textContent=known?Math.max(0,enemy.hp)+' / '+enemy.maxHP:'?';meter.appendChild(value);button.appendChild(meter);
  button.title=tr(enemy.name,enemy.ar)+' · '+(known?tr('Health','الصحة')+' '+value.textContent:tr('First encounter · health unknown','المواجهة الأولى · الصحة مجهولة'));
  button.setAttribute?.('aria-label',button.title);
  const labels=enemyStatusLabels(enemy);if(labels.length){const effects=document.createElement('small');effects.className='enemy-effects';effects.textContent=labels.join(' · ');effects.title=effects.textContent;button.appendChild(effects)}
  button.addEventListener('click',()=>{if(b.busy||state.battle!==b)return;state.target=i;battleSfx('menu');renderTargets()});panel.appendChild(button);
 });positionEnemyCards(panel)
};
if(typeof ResizeObserver!=='undefined'){const enemyCardResize=new ResizeObserver(()=>{const panel=$('enemy-targets');if(panel&&state.battle&&state.mode==='battle')positionEnemyCards(panel)});enemyCardResize.observe(document.querySelector('canvas'));enemyCardResize.observe($('viewport'))}
const battleStatsPrevious={updateStats,beginPartyRound,partyEnemyPhase,startGame,developmentJump,applyLanguage};
updateStats=function(){battleStatsPrevious.updateStats();if(state.battle&&!state.battle.kind)renderTargets();if(state.battle?.enemyActing)document.querySelectorAll('.party-card.active').forEach(card=>card.classList.remove('active'))};
beginPartyRound=function(){if(state.battle)state.battle.enemyActing=false;battleStatsPrevious.beginPartyRound()};
partyEnemyPhase=function(index){if(state.battle)state.battle.enemyActing=true;battleStatsPrevious.partyEnemyPhase(index);if(state.battle?.enemyActing)document.querySelectorAll('.party-card.active').forEach(card=>card.classList.remove('active'))};
startGame=async function(){knownEnemies.clear();testKnownEnemies.clear();try{localStorage.removeItem(ENEMY_KNOWLEDGE_KEY)}catch(_){}await battleStatsPrevious.startGame()};
developmentJump=function(stage){testKnownEnemies.clear();battleStatsPrevious.developmentJump(stage)};

// Skill help is available in battle and in the compact statistics list.
const skillTooltipRenderPrevious=renderCommands;
function skillTooltip(){let tip=$('skill-tooltip');if(!tip){tip=document.createElement('div');tip.id='skill-tooltip';tip.className='hidden';tip.setAttribute('role','tooltip');$('game').appendChild(tip)}return tip}
function hideSkillTooltip(){skillTooltip().classList.add('hidden')}
function showSkillTooltip(element){const s=SKILLS[element.dataset.skill];if(!s)return;const tip=skillTooltip();tip.textContent=tr(s.en,s.ar)+' — '+skillDescription(s);tip.classList.remove('hidden')}
function bindSkillTooltips(root){
 root.querySelectorAll?.('[data-skill]').forEach(element=>{const s=SKILLS[element.dataset.skill];if(!s)return;element.title=skillDescription(s);element.setAttribute?.('aria-describedby','skill-tooltip');element.addEventListener('mouseenter',()=>showSkillTooltip(element));element.addEventListener('mouseleave',hideSkillTooltip);element.addEventListener('focus',()=>showSkillTooltip(element));element.addEventListener('blur',hideSkillTooltip)})
}
renderCommands=function(){hideSkillTooltip();skillTooltipRenderPrevious();Array.from(ui.commands.children).forEach(button=>{if(SKILLS[button.dataset.action])button.dataset.skill=button.dataset.action});bindSkillTooltips(ui.commands)};

// Essential statistics, optional equipment/skills, and a shared medicine bag.
function statsEscape(value){return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function statsRemedyTargets(item,index=state.statsTarget||0){return item.all?state.party:[state.party[index]].filter(Boolean)}
function canUseStatsRemedy(id){
 const item=REMEDIES[id];if(!item||remedyCount(id)<=0)return false;
 return statsRemedyTargets(item).some(h=>(item.resource==='hp'||h.hp>0)&&h[item.resource]<heroStats(h)[item.resource]);
}
function renderPartyStats(message=''){
 ensureEquipment();ensureInventory();state.statsTarget=Math.max(0,Math.min(state.party.length-1,state.statsTarget||0));
 const labels=[['hp','HP','الصحة'],['ap','Mana','المانا'],['attack','Attack','الهجوم'],['defense','Defense','الدفاع'],['magic','Magic','السحر'],['speed','Speed','السرعة']];
 const sheets=state.party.map(h=>{
  const stats=heroStats(h),values={...stats,hp:h.hp+' / '+stats.hp,ap:h.ap+' / '+stats.ap};
  const equipment=Object.entries(SLOT_LABELS).map(([slot,[en,ar]])=>{const g=GEAR[h.equipment?.[slot]];return '<li>'+statsEscape(tr(en,ar))+': '+statsEscape(g?tr(g.en,g.ar):tr('None','لا يوجد'))+'</li>'}).join('');
  const skills=heroSkillEntries(h).filter(([,s])=>h.level>=s.level).map(([id,s])=>'<li tabindex="0" data-skill="'+id+'">'+statsEscape(tr(s.en,s.ar))+' <span dir="ltr">· '+s.cost+' MP</span></li>').join('');
  return '<section class="stats-sheet"><h3 dir="ltr">'+statsEscape(h.name)+' <small>LV '+h.level+'</small></h3><p class="stats-exp">'+tr('EXP','الخبرة')+' <span dir="ltr">'+h.xp+' / '+h.level*20+'</span></p><dl>'+labels.map(([id,en,ar])=>'<dt>'+tr(en,ar)+'</dt><dd>'+values[id]+'</dd>').join('')+'</dl><details class="stats-fold"><summary>'+tr('Equipment','التجهيزات')+'</summary><ul>'+equipment+'</ul></details><details class="stats-fold"><summary>'+tr('Skills','المهارات')+'</summary><ul>'+(skills||'<li>'+tr('No skills learned yet.','لم تُكتسب مهارات بعد.')+'</li>')+'</ul></details></section>';
 }).join('');
 $('stats-title').textContent=tr('Party & items','الفريق والأغراض');$('stats-close').textContent=tr('Close','إغلاق');
 $('stats-content').innerHTML='<div class="team-wallet">'+tr('Party gold','ذهب الفريق')+': <strong>'+state.gold+'</strong></div><div class="stats-grid">'+sheets+'</div><section class="stats-medicine"><h3>'+tr('Medicine bag','حقيبة الأدوية')+'</h3><label for="stats-remedy-target">'+tr('Use on','استخدم على')+'</label> <select id="stats-remedy-target">'+state.party.map((h,i)=>'<option value="'+i+'"'+(i===state.statsTarget?' selected':'')+'>'+statsEscape(h.name)+'</option>').join('')+'</select><div id="stats-remedy-list"></div><p id="stats-remedy-message" role="status"></p>'+(state.statsReturn==='battle'?'<p class="stats-item-note">'+tr('Using an item consumes the acting companion’s turn.','استخدام غرض يستهلك دور الرفيق الذي يلعب الآن.')+'</p>':'')+'</section>';
 const select=$('stats-remedy-target');select.addEventListener('change',()=>{state.statsTarget=Number(select.value);renderStatsRemedyList()});
 $('stats-remedy-message').textContent=message;renderStatsRemedyList();bindSkillTooltips($('stats-content'));
}
function renderStatsRemedyList(){
 const list=$('stats-remedy-list');list.replaceChildren();
 Object.entries(REMEDIES).filter(([id])=>['herb','blue'].includes(id)||remedyCount(id)>0).forEach(([id,item])=>{
  const button=document.createElement('button');button.type='button';button.className='stats-remedy';button.dataset.item=id;button.disabled=!canUseStatsRemedy(id);
  const name=document.createElement('strong');name.textContent=tr(item.en,item.ar)+' ×'+remedyCount(id);button.appendChild(name);
  const effect=document.createElement('span');effect.textContent='+'+item.heal+' '+tr(item.resource==='hp'?'HP':'MP',item.resource==='hp'?'صحة':'مانا')+(item.all?tr(' · All companions',' · كل الرفاق'):'');button.appendChild(effect);
  button.addEventListener('click',()=>useStatsRemedy(id));list.appendChild(button);
 })
}
function useStatsRemedy(id){
 if(state.mode!=='stats'||!canUseStatsRemedy(id))return false;
 const inBattle=state.statsReturn==='battle',b=state.battle;if(inBattle&&(!b?.kind||b.busy))return false;
 const item=REMEDIES[id],targets=statsRemedyTargets(item).filter(h=>item.resource==='hp'||h.hp>0);
 const recovered=targets.map(h=>{const before=h[item.resource];h[item.resource]=Math.min(heroStats(h)[item.resource],before+item.heal);return h.name+' +'+(h[item.resource]-before)+' '+tr(item.resource==='hp'?'HP':'MP',item.resource==='hp'?'صحة':'مانا')});
 setRemedyCount(id,remedyCount(id)-1);battleSfx('shield');const message=tr(item.en,item.ar)+' · '+recovered.join(' · ');
 if(inBattle){$('stats-screen').classList.add('hidden');state.mode='battle';state.battleMenu='main';b.keyboardTarget=null;b.busy=true;setBattleMessage(message);renderCommands();updateStats();battleDelay(afterHeroAction,800)}
 else renderPartyStats(message);
 return true;
}
showStats=function(){
 if(!['map','battle','end'].includes(state.mode)||(state.mode==='battle'&&(!state.battle?.kind||state.battle.busy)))return;
 if(state.battle?.auto)stopAutoBattle();state.statsReturn=state.mode;state.mode='stats';state.keys={};state.statsTarget=0;renderPartyStats();$('stats-screen').classList.remove('hidden');
};
applyLanguage=function(){battleStatsPrevious.applyLanguage();if(state.mode==='stats')renderPartyStats()};

$('action-button').addEventListener('pointerdown',beginActionPress);$('action-button').addEventListener('click',e=>{if(consumeActionClick(e))return;if(e.detail===0)pressA()});$('dialogue-box').addEventListener('click',e=>{if(!consumeActionClick(e))advanceDialogue()});$('new-game').addEventListener('click',startGame);$('again').addEventListener('click',reset);$('restart').addEventListener('click',reset);$('music-toggle').addEventListener('click',openMusicSettings);document.querySelectorAll('.language-button').forEach(b=>b.addEventListener('click',()=>{if(state.mode!=='title')return;state.lang=b.dataset.lang;applyLanguage()}));$('fullscreen').addEventListener('click',async()=>{try{if(!document.fullscreenElement)await $('game').requestFullscreen();else await document.exitFullscreen()}catch(_){}});document.addEventListener('pointerdown',()=>{if(audio.ctx&&audio.ctx.state!=='running')audio.ctx.resume().catch(()=>{})},{passive:true});document.addEventListener('visibilitychange',()=>{if(!document.hidden&&audio.ctx&&audio.on)audio.ctx.resume().catch(()=>{})});reset();draw();update();

