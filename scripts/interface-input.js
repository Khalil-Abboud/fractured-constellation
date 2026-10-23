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
function battleHelp(element){
 const s=SKILLS[element.dataset.skill],item=REMEDIES[element.dataset.item],b=state.battle;
 if(!s&&!item)return null;
 const heroName=h=>h?tr(h.name,HERO_AR[h.name]||h.name):tr('No eligible companion','لا يوجد رفيق مناسب');
 let target;
 if(item){
  const eligible=item.resource==='ap'?state.party.filter(h=>h.hp>0):state.party;
  const h=eligible.slice().sort((a,c)=>a[item.resource]/heroStats(a)[item.resource]-c[item.resource]/heroStats(c)[item.resource])[0];
  target=item.all?tr('All companions, including fallen allies.','كل الرفاق، بمن فيهم الساقطون.'):!b?.kind?heroName(state.party[0]):tr('Automatically: ','تلقائيًا: ')+heroName(h)+tr(item.resource==='ap'?' (lowest AP percentage).':' (lowest HP percentage).',item.resource==='ap'?' (أقل نسبة طاقة).':' (أقل نسبة صحة).');
 }else if(s.kind==='shield')target=b?.kind?tr('All living companions.','كل الرفاق الأحياء.'):heroName(state.party[0]);
 else if(s.kind==='heal')target=heroName(state.party.filter(h=>h.hp>0&&h.hp<heroStats(h).hp).sort((a,c)=>a.hp/heroStats(a).hp-c.hp/heroStats(c).hp)[0])+tr(' (living ally with lowest HP percentage).',' (الرفيق الحي صاحب أقل نسبة صحة).');
 else target=s.all?tr('All living enemies.','كل الأعداء الأحياء.'):tr('Selected enemy','العدو المحدد');
 return {name:tr((s||item).en,(s||item).ar),description:s?skillDescription(s):remedyDetail(item),target:tr('Target: ','الهدف: ')+target};
}
function showSkillTooltip(element){
 const help=battleHelp(element);if(!help)return;const tip=skillTooltip();tip.replaceChildren();
 for(const [tag,key]of[['strong','name'],['span','description'],['span','target']]){const line=document.createElement(tag);line.textContent=help[key];tip.appendChild(line)}
 tip.classList.remove('hidden');
 const game=$('game').getBoundingClientRect(),rect=element.getBoundingClientRect(),scaleX=game.width/$('game').clientWidth||1,scaleY=game.height/$('game').clientHeight||1;
 const width=game.width/scaleX,height=game.height/scaleY,box=tip.getBoundingClientRect();
 tip.style.left=Math.max(8,Math.min((rect.left-game.left)/scaleX,width-box.width/scaleX-8))+'px';
 tip.style.top=Math.max(8,Math.min((rect.bottom-game.top)/scaleY+8,height-box.height/scaleY-8))+'px';
}
function bindSkillTooltips(root){
 root.querySelectorAll?.('[data-skill],[data-item]').forEach(element=>{if(!battleHelp(element))return;element.removeAttribute('title');element.setAttribute?.('aria-describedby','skill-tooltip');element.addEventListener('mouseenter',()=>showSkillTooltip(element));element.addEventListener('mouseleave',hideSkillTooltip);element.addEventListener('focus',()=>showSkillTooltip(element));element.addEventListener('blur',hideSkillTooltip)})
}
renderCommands=function(){hideSkillTooltip();skillTooltipRenderPrevious();Array.from(ui.commands.children).forEach(button=>{if(SKILLS[button.dataset.action])button.dataset.skill=button.dataset.action;if(REMEDIES[button.dataset.action])button.dataset.item=button.dataset.action});bindSkillTooltips(ui.commands)};

// Essential statistics, optional equipment/skills, and a shared medicine bag.
function statsEscape(value){return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function statsRemedyTargets(item,index=state.statsTarget||0){return item.all?state.party:[state.party[index]].filter(Boolean)}
function canUseStatsRemedy(id){
 const item=REMEDIES[id];if(!item||remedyCount(id)<=0)return false;
 return statsRemedyTargets(item).some(h=>(item.resource==='hp'||h.hp>0)&&h[item.resource]<heroStats(h)[item.resource]);
}

// Small code-drawn pixel icons keep inventory visuals sharp without external images.
function partyPixelIcon(kind,muted=false){
 const shapes={
 sword:'<path fill="#263344" d="M18 1h5v5h-2v3h-3v3h-3v3h-3v2h-2v-2H8v-2h2v-3h3V7h3V4h2z"/><path fill="#d8e8ed" d="M19 2h3v3h-2v3h-3v3h-3v3h-3v-3h2V8h3V5h3z"/><path fill="#819fb3" d="M20 5h2v1h-2v3h-3v3h-3v3h-3v-2h3v-3h3V7h3z"/><path fill="#e7bd54" d="M6 11h2v2h2v2h2v2h-2v2H8v-2H6v-2H4v-2h2z"/><path fill="#8e5a2f" d="M6 16h3v2H7v2H5v2H2v-3h2v-2h2z"/><path fill="#f5d875" d="M1 21h4v2H1z"/>',
 staff:'<path fill="#5b361d" d="M13 9h4v3h-2v3h-3v3H9v3H6v2H2v-4h3v-3h3v-3h3v-3h2z"/><path fill="#c28a44" d="M13 10h2v2h-2v3h-3v3H7v3H4v-2h2v-3h3v-3h3z"/><path fill="#e7bd55" d="M12 1h7v2h3v7h-3v3h-7v-2H9V4h3z"/><path fill="#584925" d="M13 3h5v2h2v4h-2v2h-5V9h-2V5h2z"/><path fill="#1c66b7" d="M14 3h4v2h2v4h-3v2h-4V8h-2V5h3z"/><path fill="#70d0f5" d="M14 3h3v2h-3v3h-2V5h2z"/>',
 dagger:'<path fill="#8ea8ba" d="M16 2h6v6h-3v3h-3v3h-3v3H9v-5h3V9h3V6h1z"/><path fill="#e5f1ed" d="M17 3h4v2h-3v3h-3v3h-3v3h-2v-2h3V9h3V6h1z"/><path fill="#e0b951" d="M7 12h2v2h2v2h3v2h-3v2H9v-2H7v-2H5v-2h2z"/><path fill="#875335" d="M7 17h3v2H7v3H3v-4h4z"/>',
 bow:'<path fill="#b88445" d="M6 1h5v2h4v3h3v4h2v5h-2v4h-3v3h-4v2H6v-3h5v-2h3v-4h2v-4h-2V7h-3V4H6z"/><path fill="#ead99c" d="M6 2h1v21H6z"/><path fill="#c3d3dc" d="M1 11h19v2H1zM18 8h2v2h3v3h-3v2h-2v-3h2v-1h-2z"/>',
 armor:'<path fill="#30465b" d="M8 2h8v2h4v2h3v6h-4v10H5V12H1V6h3V4h4z"/><path fill="#809db2" d="M8 3h3v4h3V3h2v2h4v2h2v4h-4v10H6V11H2V7h2V5h4z"/><path fill="#b4c4ca" d="M6 7h3v3h7V7h2v5h-2v2H8v-2H6z"/><path fill="#546d83" d="M8 14h8v2H8zM7 19h10v2H7z"/>',
 helmet:'<path fill="#30465b" d="M9 1h6v3h4v3h2v12h-5v4H8v-4H3V7h2V4h4z"/><path fill="#89a5b6" d="M10 3h4v3h4v3h2v9h-4v-8h-3v12h-2V10H8v8H4V9h2V6h4z"/><path fill="#b6c8ce" d="M11 3h2v17h-2zM6 9h4v2H6zM14 9h4v2h-4z"/>',
 boots:'<path fill="#30465b" d="M4 2h7v12h2v8H1v-7h3zM14 2h7v12h2v8H13v-7h1z"/><path fill="#819eae" d="M5 3h5v12h2v5H2v-4h3zM15 3h5v12h2v5h-8v-4h1z"/><path fill="#b5c6cc" d="M5 3h5v3H5zM15 3h5v3h-5z"/><path fill="#536e82" d="M2 19h10v2H2zM14 19h8v2h-8z"/>',
 gloves:'<path fill="#30465b" d="M3 10h3V4h3v4h1V2h3v6h1V3h3v6h1V5h3v9h-2v4h-2v5H7v-5H5v-3H3z"/><path fill="#87a2b3" d="M4 11h2v3h2V5h1v7h2V3h1v9h3V4h1v9h3V6h1v8h-2v4h-2v4H8v-5H6v-3H4z"/><path fill="#b4c5cb" d="M8 18h8v3H8z"/>',
 coin:'<path fill="#775022" d="M7 1h10v2h4v4h2v10h-2v4h-4v2H7v-2H3v-4H1V7h2V3h4z"/><path fill="#d49b35" d="M7 3h10v2h3v3h1v8h-2v3h-3v2H8v-2H5v-3H3V8h2V5h2z"/><path fill="#ffe39a" d="M8 4h8v2H8zM5 7h3v10H5zM8 18h8v2H8z"/><path fill="#f5c65e" d="M10 7h6v2h-3v7h-3z"/>'
 };
 let body=shapes[kind];
 if(!body){
 const palette={herb:['#4a8e2e','#a3d65a','#315c28'],blue:['#398ebc','#8be6ff','#244b8b'],vital:['#d2ddd4','#fff8d1','#6d9550'],azure:['#5b72d9','#8fe7ff','#44458c'],dawnleaf:['#daa131','#ffe17c','#936523']}[kind]||['#4a8e2e','#a3d65a','#315c28'];
 body='<path fill="'+palette[2]+'" d="M11 7h3v14h-3zM7 17h4v3H7zM14 13h5v3h-5z"/><path fill="'+palette[0]+'" d="M2 8h5v2h3v5H5v-2H2zM14 5h3V2h5v6h-2v3h-6zM3 18h5v-2h3v5H8v2H3zM15 16h4v2h3v4h-6zM8 1h4v3h2v5h-5V6H7V3h1z"/><path fill="'+palette[1]+'" d="M3 9h3v2H3zM17 3h4v2h-4zM9 2h2v4H9zM4 19h4v2H4zM17 18h3v2h-3z"/>';
 }
 return '<svg class="party-pixel-icon'+(muted?' muted':'')+'" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" shape-rendering="crispEdges">'+body+'</svg>'
}

function statsBar(label,value,max,kind){
 const percent=Math.max(0,Math.min(100,value/Math.max(1,max)*100));
 return '<div class="party-resource"><span>'+label+'</span><div class="party-track"><i class="'+kind+'" style="width:'+percent+'%"></i></div><b dir="ltr">'+value+' / '+max+'</b></div>'
}

function partyPortraitHTML(h){
 const name=tr(h.name,HERO_AR[h.name]||h.name);
 return '<span class="party-portrait-frame"><span class="party-face battle-portrait portrait-'+h.name.toLowerCase()+'" role="img" aria-label="'+statsEscape(name)+'"></span></span>'
}
function partyOverviewHTML(){
 const sheets=state.party.map((h,index)=>{
  const stats=heroStats(h),weapon=GEAR[h.equipment?.weapon];
  const gearTitle=slot=>{const g=GEAR[h.equipment?.[slot]];return tr(...SLOT_LABELS[slot])+': '+(g?tr(g.en,g.ar)+' · '+gearBonusText(g):tr('Empty','فارغ'))};
  const armor=['armor','helmet','boots','gloves'].map(slot=>'<button class="party-gear-slot'+(GEAR[h.equipment?.[slot]]?' equipped':' empty')+'" type="button" data-gear-hero="'+index+'" data-gear-slot="'+slot+'" title="'+statsEscape(gearTitle(slot))+'" aria-label="'+statsEscape(gearTitle(slot))+'">'+partyPixelIcon(slot,!GEAR[h.equipment?.[slot]])+'</button>').join('');
  return '<section class="party-sheet" data-party-index="'+index+'"><div class="party-hero-top"><div class="party-face-button" aria-label="'+statsEscape(tr(h.name,HERO_AR[h.name]||h.name))+'" role="img">'+partyPortraitHTML(h)+'</div><div class="party-vitals"><div class="party-hero-heading"><span class="party-select">'+statsEscape(tr(h.name,HERO_AR[h.name]||h.name))+'</span><span>'+tr('LV','مستوى')+' '+h.level+'</span></div>'+statsBar(tr('HP','صحة'),h.hp,stats.hp,'health')+statsBar(tr('AP','طاقة'),h.ap,stats.ap,'mana')+statsBar(tr('EXP','خبرة'),h.xp,h.level*20,'experience')+'</div></div>'+'<dl class="party-numbers">'+[['attack','Attack','الهجوم'],['defense','Defense','الدفاع'],['magic','Magic','السحر'],['speed','Speed','السرعة']].map(([key,en,ar])=>'<dt>'+tr(en,ar)+'</dt><dd>'+stats[key]+'</dd>').join('')+'</dl><div class="party-equipment"><h3>'+tr('EQUIPMENT','التجهيزات')+'</h3><button class="party-weapon" type="button" data-gear-hero="'+index+'" data-gear-slot="weapon" title="'+statsEscape(gearTitle('weapon'))+'">'+partyPixelIcon(weapon?.type||weaponTypes[h.name]||'sword',!weapon)+'<span>'+statsEscape(weapon?tr(weapon.en,weapon.ar):tr('Empty','فارغ'))+'</span></button><div class="party-armor">'+armor+'</div></div></section>'
 }).join('');
 return '<div class="party-sheets">'+sheets+'</div>'
}
function partySkillsHTML(){
 return '<div class="party-sheets party-skills-page">'+state.party.map(h=>{
  const learned=heroSkillEntries(h).filter(([,skill])=>h.level>=skill.level);
  return '<section class="party-sheet"><header class="party-skills-hero">'+partyPortraitHTML(h)+'<div><h3 class="party-section-name">'+statsEscape(tr(h.name,HERO_AR[h.name]||h.name))+'</h3><span>'+tr('LV','مستوى')+' '+h.level+'</span></div></header><div class="party-skill-descriptions">'+(learned.map(([,skill])=>'<article class="party-skill-description"><header><strong>'+statsEscape(tr(skill.en,skill.ar))+'</strong><span>'+skill.cost+' '+tr('AP','طاقة')+'</span></header><p>'+statsEscape(tr(...skill.desc))+'</p></article>').join('')||'<p>'+tr('No skills learned yet.','لم تُكتسب مهارات بعد.')+'</p>')+'</div></section>'
 }).join('')+'</div>'
}
function partyBagHTML(){
 const targets=state.party.map((h,i)=>{
  const stats=heroStats(h);
  return '<button type="button" class="party-bag-target'+(i===state.statsTarget?' selected':'')+'" data-select-hero="'+i+'" aria-pressed="'+(i===state.statsTarget)+'">'+partyPortraitHTML(h)+'<span><strong>'+statsEscape(tr(h.name,HERO_AR[h.name]||h.name))+'</strong><small dir="ltr">HP '+h.hp+'/'+stats.hp+' · AP '+h.ap+'/'+stats.ap+'</small></span></button>'
 }).join('');
 const gear=state.party.map(h=>{
  const owned=[...new Set(h.gearBag||[])].filter(id=>GEAR[id]);
  return '<section class="party-bag-gear"><h3>'+statsEscape(tr(h.name,HERO_AR[h.name]||h.name))+'</h3><div class="party-bag-gear-items">'+(owned.map(id=>{
   const g=GEAR[id],equipped=h.equipment?.[g.slot]===id;
   return '<div class="party-bag-item" title="'+statsEscape(gearBonusText(g))+'">'+partyPixelIcon(g.type||g.slot)+'<span>'+statsEscape(tr(g.en,g.ar))+(equipped?'<small>'+tr('Equipped','مجهّز')+'</small>':'')+'</span></div>'
  }).join('')||'<p>'+tr('No equipment in the bag.','لا توجد تجهيزات في الحقيبة.')+'</p>')+'</div></section>'
 }).join('');
 return '<section class="party-bag"><h3 class="party-section-name">'+tr('Use items on','استخدم الأغراض على')+'</h3><div class="party-bag-targets">'+targets+'</div><section class="party-herbs"><h3>'+tr('HERBS','الأعشاب')+'</h3><div id="stats-remedy-list"></div></section><p class="party-bag-note">'+tr('Select a companion, then an herb. Herbs that affect everyone are shared by the whole party.','اختر رفيقًا ثم عشبة. الأعشاب الجماعية تؤثر في الفريق كله.')+(state.statsReturn==='battle'?tr(' Using an item takes one turn.',' استخدام الغرض يستهلك دورًا.'):'')+'</p><h3 class="party-section-name">'+tr('Owned equipment','التجهيزات المملوكة')+'</h3><div class="party-bag-equipment">'+gear+'</div></section>'
}
function switchPartyTab(tab,focus=false){
 if(state.mode!=='stats'||!['overview','skills','bag'].includes(tab))return;
 state.statsTab=tab;renderPartyStats();$('stats-content').scrollTop=0;
 if(focus)$('party-tab-'+tab).focus?.()
}
function renderPartyStats(message=''){
 ensureEquipment();ensureInventory();state.statsTarget=Math.max(0,Math.min(state.party.length-1,state.statsTarget||0));
 if(!['overview','skills','bag'].includes(state.statsTab))state.statsTab='overview';
 $('stats-title').textContent=tr('PARTY','الفريق');
 $('stats-close').innerHTML='<kbd>ESC</kbd> '+tr('Close','إغلاق')+' <span aria-hidden="true">×</span>';
 $('party-tabs').setAttribute('aria-label',tr('Party pages','صفحات الفريق'));
 const tabs=[['overview','Overview','نظرة عامة'],['skills','Skills','مهارات'],['bag','Bag','حقيبة']];
 tabs.forEach(([id,en,ar])=>{const button=$('party-tab-'+id),active=state.statsTab===id;button.textContent=tr(en,ar);button.setAttribute('aria-selected',String(active));button.tabIndex=active?0:-1});
 $('stats-gold').innerHTML=partyPixelIcon('coin')+'<strong>'+state.gold+'</strong>';
 $('stats-gold').setAttribute('aria-label',tr('Gold: ','الذهب: ')+state.gold);
 const content=$('stats-content');content.setAttribute('aria-labelledby','party-tab-'+state.statsTab);content.dataset.partyTab=state.statsTab;content.dataset.partyCount=Math.min(4,state.party.length);content.style.setProperty('--party-columns',Math.max(1,Math.min(4,state.party.length)));
 content.innerHTML=(state.statsTab==='skills'?partySkillsHTML():state.statsTab==='bag'?partyBagHTML():partyOverviewHTML())+'<p id="stats-remedy-message" role="status"></p>';
 content.querySelectorAll('[data-select-hero]').forEach(button=>button.addEventListener('click',()=>{const scroll=content.scrollTop;state.statsTarget=Number(button.dataset.selectHero);renderPartyStats();content.scrollTop=scroll}));
 content.querySelectorAll('[data-gear-slot]').forEach(button=>button.addEventListener('click',()=>{$('stats-remedy-message').textContent=button.title}));
 $('stats-remedy-message').textContent=message;
 if(state.statsTab==='bag')renderStatsRemedyList()
}

function renderStatsRemedyList(){
 const list=$('stats-remedy-list');list.replaceChildren();
 const names={herb:['Healing','شفاء'],blue:['Blue','زرقاء'],vital:['Vital','حيوية'],azure:['Azure','لازورد'],dawnleaf:['Dawnleaf','ورقة الفجر']};
 Object.entries(REMEDIES).forEach(([id,item])=>{
  const button=document.createElement('button');button.type='button';button.className='stats-remedy'+(remedyCount(id)===0?' depleted':'');button.dataset.item=id;button.disabled=!canUseStatsRemedy(id);
  const detail=tr(item.en,item.ar)+' · +'+item.heal+' '+tr(item.resource==='hp'?'HP':'AP',item.resource==='hp'?'صحة':'طاقة')+(item.all?tr(' · Everyone',' · الجميع'):'');
  button.title=detail;button.setAttribute('aria-label',detail+' · '+remedyCount(id));
  button.innerHTML=partyPixelIcon(id)+'<span>'+tr(...(names[id]||[item.en,item.ar]))+'</span><strong>'+remedyCount(id)+'</strong><small class="party-remedy-effect">+'+item.heal+' '+tr(item.resource==='hp'?'HP':'AP',item.resource==='hp'?'صحة':'طاقة')+(item.all?tr(' · All',' · الجميع'):'')+'</small>';
  button.addEventListener('click',()=>useStatsRemedy(id));list.appendChild(button)
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
 if(state.battle?.auto)stopAutoBattle();state.statsReturn=state.mode;state.mode='stats';state.keys={};state.statsTarget=0;state.statsTab='overview';renderPartyStats();$('stats-screen').classList.remove('hidden');$('stats-close').focus?.();
};
applyLanguage=function(){battleStatsPrevious.applyLanguage();if(state.mode==='stats')renderPartyStats()};


for(const tab of ['overview','skills','bag'])$('party-tab-'+tab).addEventListener('click',()=>switchPartyTab(tab));
$('party-tabs').addEventListener('keydown',e=>{
 const order=['overview','skills','bag'];let index=order.indexOf(state.statsTab);
 if(e.key==='Home')index=0;else if(e.key==='End')index=2;
 else if(e.key==='ArrowRight')index=(index+(state.lang==='ar'?2:1))%3;
 else if(e.key==='ArrowLeft')index=(index+(state.lang==='ar'?1:2))%3;else return;
 e.preventDefault();switchPartyTab(order[index],true)
});
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

