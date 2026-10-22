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
 if(!b)return false;prepareEnemyKnowledge(b);const key=enemyKnowledgeKey(enemy),enemies=b.kind?b.enemies:[enemy];
 enemies.forEach((candidate,i)=>{if(enemyKnowledgeKey(candidate)===key)b.healthKnowledge[i]=true});
 const known=state.devTesting?testKnownEnemies:knownEnemies;known.add(key);
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
function statsPageSize(){const box=$('viewport').getBoundingClientRect();return box.width<600&&box.height>box.width?1:2}
function statsBar(label,value,max,kind){
 const percent=Math.max(0,Math.min(100,value/Math.max(1,max)*100));
 return '<div class="party-resource"><span>'+label+'</span><div class="party-track"><i class="'+kind+'" style="width:'+percent+'%"></i></div><b dir="ltr">'+value+' / '+max+'</b></div>'
}
function renderPartyStats(message=''){
 ensureEquipment();ensureInventory();state.statsTarget=Math.max(0,Math.min(state.party.length-1,state.statsTarget||0));
 const size=statsPageSize(),pages=Math.max(1,Math.ceil(state.party.length/size));
 state.statsPage=Math.max(0,Math.min(pages-1,state.statsPage||0));
 const first=state.statsPage*size;
 const icons={weapon:'⚔',armor:'♜',helmet:'♟',boots:'♧',gloves:'✦'};
 const sheets=state.party.slice(first,first+size).map((h,offset)=>{
  const index=first+offset,stats=heroStats(h);
  const slotHTML=slot=>{const gear=GEAR[h.equipment?.[slot]],label=tr(...SLOT_LABELS[slot]),name=gear?tr(gear.en,gear.ar):tr('Empty','فارغ');return '<div class="party-gear '+(gear?'equipped':'empty')+'" title="'+statsEscape(label+': '+name)+'"><span class="gear-symbol" aria-hidden="true">'+icons[slot]+'</span><span><small>'+label+'</small><b>'+statsEscape(name)+'</b></span></div>'};
  const skills=heroSkillEntries(h).filter(([,skill])=>h.level>=skill.level).map(([id,skill])=>'<button type="button" class="party-skill" data-skill="'+id+'">'+statsEscape(tr(skill.en,skill.ar))+' <small>'+skill.cost+' '+tr('AP','طاقة')+'</small></button>').join('');
  return '<section class="party-sheet'+(index===state.statsTarget?' selected':'')+'" data-party-index="'+index+'"><div class="party-hero-top"><div class="party-face battle-portrait portrait-'+h.name.toLowerCase()+'" role="img" aria-label="'+statsEscape(tr(h.name,HERO_AR[h.name]||h.name))+'"></div><div class="party-vitals"><div class="party-hero-heading"><button class="party-select" type="button" data-select-hero="'+index+'">'+statsEscape(tr(h.name,HERO_AR[h.name]||h.name))+'</button><span>'+tr('LV','مستوى')+' '+h.level+'</span></div>'+statsBar(tr('HP','صحة'),h.hp,stats.hp,'health')+statsBar(tr('AP','طاقة'),h.ap,stats.ap,'mana')+statsBar(tr('EXP','خبرة'),h.xp,h.level*20,'experience')+'</div></div><div class="party-card-body"><dl class="party-numbers">'+[['attack','Attack','الهجوم'],['defense','Defense','الدفاع'],['magic','Magic','السحر'],['speed','Speed','السرعة']].map(([key,en,ar])=>'<dt>'+tr(en,ar)+'</dt><dd>'+stats[key]+'</dd>').join('')+'</dl><div class="party-equipment"><h3>'+tr('Equipment','التجهيزات')+'</h3>'+slotHTML('weapon')+'<div class="party-armor">'+['armor','helmet','boots','gloves'].map(slotHTML).join('')+'</div></div></div><div class="party-skills hidden"><h3>'+tr('Skills · hover or tap for details','المهارات · مرر أو انقر للشرح')+'</h3><div class="party-skill-list">'+(skills||'<p>'+tr('No skills learned yet','لم تُكتسب مهارات بعد')+'</p>')+'</div></div><button class="party-details" type="button" aria-expanded="false">'+tr('Skills & details','المهارات والتفاصيل')+'</button></section>'
 }).join('');
 $('stats-title').textContent=tr('PARTY','الفريق');$('stats-close').textContent=tr('✕ Close','✕ إغلاق');
 $('stats-gold').textContent='◈ '+state.gold+' '+tr('Gold','ذهب');
 $('stats-content').innerHTML='<div class="party-sheets" data-count="'+Math.min(size,state.party.length-first)+'">'+sheets+'</div><section class="party-herbs"><div class="party-herbs-heading"><h3>'+tr('HERBS','الأعشاب')+'</h3><label for="stats-remedy-target">'+tr('Use on','استخدم على')+'</label><select id="stats-remedy-target">'+state.party.map((h,i)=>'<option value="'+i+'"'+(i===state.statsTarget?' selected':'')+'>'+statsEscape(tr(h.name,HERO_AR[h.name]||h.name))+'</option>').join('')+'</select></div><div id="stats-remedy-list"></div></section><div class="party-footer"><span id="stats-remedy-message" role="status"></span><div class="party-pages">'+(pages>1?'<button id="party-page-prev" type="button" aria-label="'+tr('Previous companions','الرفاق السابقون')+'"'+(state.statsPage===0?' disabled':'')+'>‹</button><span>'+(state.statsPage+1)+' / '+pages+'</span><button id="party-page-next" type="button" aria-label="'+tr('Next companions','الرفاق التاليون')+'"'+(state.statsPage===pages-1?' disabled':'')+'>›</button>':'')+'</div><span class="party-key-hint">'+(state.statsReturn==='battle'?tr('One item = one turn','غرض واحد = دور واحد'):tr('Esc · Close','Esc · إغلاق'))+'</span></div>';
 const select=$('stats-remedy-target');select.addEventListener('change',()=>{state.statsTarget=Number(select.value);state.statsPage=Math.floor(state.statsTarget/size);renderPartyStats()});
 $('stats-content').querySelectorAll('[data-select-hero]').forEach(button=>button.addEventListener('click',()=>{state.statsTarget=Number(button.dataset.selectHero);renderPartyStats()}));
 $('stats-content').querySelectorAll('.party-details').forEach(button=>button.addEventListener('click',()=>{const sheet=button.closest('.party-sheet'),expanded=button.getAttribute('aria-expanded')!=='true';button.setAttribute('aria-expanded',String(expanded));sheet.querySelector('.party-card-body').classList.toggle('hidden',expanded);sheet.querySelector('.party-skills').classList.toggle('hidden',!expanded);button.textContent=expanded?tr('← Statistics & equipment','← الإحصائيات والتجهيزات'):tr('Skills & details','المهارات والتفاصيل')}));
 if(pages>1){$('party-page-prev').addEventListener('click',()=>{state.statsPage--;renderPartyStats()});$('party-page-next').addEventListener('click',()=>{state.statsPage++;renderPartyStats()})}
 $('stats-remedy-message').textContent=message;renderStatsRemedyList();bindSkillTooltips($('stats-content'));
}

function renderStatsRemedyList(){
 const list=$('stats-remedy-list');list.replaceChildren();
 Object.entries(REMEDIES).forEach(([id,item])=>{
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
 if(state.battle?.auto)stopAutoBattle();state.statsReturn=state.mode;state.mode='stats';state.keys={};state.statsTarget=0;state.statsPage=0;renderPartyStats();$('stats-screen').classList.remove('hidden');$('stats-close').focus?.();
};
applyLanguage=function(){battleStatsPrevious.applyLanguage();if(state.mode==='stats')renderPartyStats()};


$('stats-screen').addEventListener('click',e=>{if(e.target===$('stats-screen'))closeStats()});
window.addEventListener('resize',()=>{if(state.mode==='stats')renderPartyStats()});
// The exploration prompt is also a real mouse/touch button, anchored above the nearby person or door.
const contextPromptPrevious=updatePrompt;
function contextPromptAnchor(){
 const p=state.player;if(!p)return null;
 let anchor=p,nearest=Infinity;
 const partyNames=new Set((state.party||[]).map(hero=>hero.name));
 for(const actor of state.entities||[]){
  if(actor===p||actor.visible===false||partyNames.has(actor.name))continue;
  const distance=Math.hypot(actor.x-p.x,actor.y-p.y);
  if(distance<48&&distance<nearest){anchor=actor;nearest=distance}
 }
 if(typeof currentPortal==='function'){
  const portal=currentPortal();
  if(portal){
   const door=portal.door||{};
   anchor={x:Number.isFinite(door.x)?door.x:portal.x+portal.w/2,y:Number.isFinite(door.y)?door.y:portal.y+portal.h}
  }
 }
 return anchor
}
function syncContextPrompt(){
 const prompt=ui.prompt,active=state.mode==='map'&&state.player&&!prompt.classList.contains('hidden');
 prompt.classList.toggle('context-action',!!active);
 if(!active){prompt.removeAttribute('role');prompt.removeAttribute('tabindex');return}
 const anchor=contextPromptAnchor()||state.player;
 const scrolling=['world','bellhaven','sacrifice'].includes(state.scene),camera=scrolling?(state.camera||{x:0,y:0}):{x:0,y:0};
 const x=Math.max(68,Math.min(444,anchor.x-(camera.x||0)));
 const y=Math.max(44,Math.min(266,anchor.y-(camera.y||0)-20));
 prompt.style.left=x/512*100+'%';prompt.style.top=y/288*100+'%';
 prompt.setAttribute('role','button');prompt.tabIndex=0;
 const label=prompt.textContent.replace(/^A\s+/,'');
 prompt.setAttribute('aria-label',tr('Activate: '+label,'تنفيذ: '+label))
}
updatePrompt=function(){contextPromptPrevious();syncContextPrompt()};
function activateContextPrompt(e){
 if(state.mode!=='map'||ui.prompt.classList.contains('hidden'))return;
 e.preventDefault();e.stopPropagation();ui.prompt.classList.add('hidden');pressA()
}
ui.prompt.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse'||e.button===0)e.stopPropagation()});
ui.prompt.addEventListener('click',activateContextPrompt);
ui.prompt.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){activateContextPrompt(e)}});


// Keep the continue prompt consistent with the selected language and input controls.
const pixelDialogueLanguagePrevious=applyLanguage;
applyLanguage=function(){pixelDialogueLanguagePrevious();ui.continue.textContent=tr('CLICK / Z / ENTER','انقر أو اضغط Z / Enter')};

$('action-button').addEventListener('pointerdown',beginActionPress);$('action-button').addEventListener('click',e=>{if(consumeActionClick(e))return;if(e.detail===0)pressA()});$('dialogue-box').addEventListener('click',e=>{if(!consumeActionClick(e))advanceDialogue()});$('new-game').addEventListener('click',startGame);$('again').addEventListener('click',reset);$('restart').addEventListener('click',reset);$('music-toggle').addEventListener('click',openMusicSettings);document.querySelectorAll('.language-button').forEach(b=>b.addEventListener('click',()=>{if(state.mode!=='title')return;state.lang=b.dataset.lang;applyLanguage()}));$('fullscreen').addEventListener('click',async()=>{try{if(!document.fullscreenElement)await $('game').requestFullscreen();else await document.exitFullscreen()}catch(_){}});document.addEventListener('pointerdown',()=>{if(audio.ctx&&audio.ctx.state!=='running')audio.ctx.resume().catch(()=>{})},{passive:true});document.addEventListener('visibilitychange',()=>{if(!document.hidden&&audio.ctx&&audio.on)audio.ctx.resume().catch(()=>{})});reset();draw();update();

