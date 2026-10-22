'use strict';
// Skills, battle effects, encounters, bosses, and combat balance.
// Party skill identities. Battle-only ailments and stolen purses never enter a checkpoint.
const SKILLS={
 shadowSlash:{hero:'Shadow',level:2,cost:4,kind:'physical',power:1.30,en:'Shadow Slash',ar:'شق الظل',desc:['A blade formed from Shadow’s own shadow. Physical attack ×1.30.','نصل من ظل شادو نفسه. الهجوم الجسدي ×1.30.']},
 umbralSeal:{hero:'Shadow',level:4,cost:6,kind:'seal',en:'Umbral Seal',ar:'ختم الظل',desc:['Binds one enemy’s special skills for 2 enemy phases; bosses resist after 1. Basic attacks remain possible.','يقيد مهارات عدو واحد الخاصة لمرحلتين للعدو؛ يقاوم الزعماء بعد مرحلة واحدة. يبقى الهجوم العادي ممكنًا.']},
 shadeSiphon:{hero:'Shadow',level:6,cost:8,kind:'physical',power:1.15,drain:.35,en:'Siphoning Shade',ar:'ظل مستنزف',desc:['Physical attack ×1.15; Shadow heals for 35% of the health actually removed.','الهجوم الجسدي ×1.15؛ يستعيد شادو صحة تعادل 35% من الصحة التي سلبها فعلًا.']},
 eclipseBlade:{hero:'Shadow',level:10,cost:16,kind:'physical',power:1.80,pierce:.25,en:'Eclipse Blade',ar:'نصل الكسوف',desc:['A concentrated shadow blade. Physical attack ×1.80, ignoring 25% of target defense.','نصل ظل مكثف. الهجوم الجسدي ×1.80 ويتجاهل 25% من دفاع الهدف.']},
 analysis:{hero:'Astro',level:1,cost:6,kind:'analyze',chance:.50,en:'Enemy Analysis',ar:'تحليل العدو',desc:['Astro spends 6 mana on calculations with a 50% chance to reveal the target’s exact health and activate its health bar. Deals no damage.','يصرف أسترو 6 مانا لإجراء حسابات، مع فرصة نجاح 50٪ لكشف صحة الهدف الدقيقة وتفعيل شريط صحته. لا تسبب ضررًا.']},
 starbolt:{hero:'Astro',level:1,cost:5,kind:'magic',power:1.10,en:'Star Bolt',ar:'سهم نجمي',desc:['A focused star projectile. Magic ×1.10 against one enemy.','مقذوف نجمي مركز. السحر ×1.10 ضد عدو واحد.']},
 shield:{hero:'Astro',level:3,cost:6,kind:'shield',en:'Orbit Shield',ar:'درع مداري',desc:['Reduces incoming party damage by 25% for the current and next complete rounds, regardless of hit count.','يخفف ضرر الفريق الوارد 25% للجولة الحالية والجولة التالية كاملتين، مهما كان عدد الضربات.']},
 flare:{hero:'Astro',level:5,cost:12,kind:'magic',power:1.10*1.25,all:true,en:'Astral Flare',ar:'وهج نجمي',desc:['Hits every enemy at 1.25× Star Bolt power.','يصيب جميع الأعداء بقوة تعادل 1.25 ضعف السهم النجمي.']},
 starMend:{hero:'Astro',level:7,cost:9,kind:'heal',en:'Starlight Mend',ar:'شفاء النجوم',desc:['Heals the living companion with the lowest health percentage by Magic ×1.50. Does not revive.','يشفي الرفيق الحي صاحب أقل نسبة صحة بمقدار السحر ×1.50. لا يحيي الساقطين.']},
 gravityWell:{hero:'Astro',level:8,cost:13,kind:'magic',power:1.20,weaken:true,duration:1050,en:'Gravity Well',ar:'بئر الجاذبية',desc:['A crushing singularity hits one enemy at Magic ×1.20, then reduces its attack by 25% for two enemy phases (15% on bosses). Refreshes without stacking.','يضرب تفرد ساحق عدوًا واحدًا بقوة السحر ×1.20، ثم يخفض هجومه 25% لمرحلتين للعدو (15% للزعماء). يُجدد الأثر دون تراكم.']},
 constellationSeal:{hero:'Astro',level:9,cost:14,kind:'seal',all:true,en:'Constellation Seal',ar:'ختم الكوكبة',desc:['Seals every enemy’s special skills for 2 enemy phases; bosses resist after 1. Basic attacks remain possible.','يختم مهارات جميع الأعداء الخاصة لمرحلتين للعدو؛ يقاوم الزعماء بعد مرحلة واحدة. يبقى الهجوم العادي ممكنًا.']},
 galaxyWrath:{hero:'Astro',level:10,cost:24,kind:'magic',power:1.90,pierce:.20,all:true,cosmic:true,duration:1200,en:'Galaxy’s Wrath',ar:'غضب المجرّات',desc:['Astro draws on a spiral galaxy, raining stars on every enemy. Magic ×1.90; ignores 20% of defense. Costs 24 mana.','يستمد أسترو قوته من مجرّة حلزونية، فتمطر النجوم على جميع الأعداء. السحر ×1.90؛ يتجاهل 20% من الدفاع. يستهلك 24 مانا.']},
 pilfer:{hero:'Venom',level:1,cost:3,kind:'steal',en:'Pilfer',ar:'سرقة',desc:['No damage. Steals a small purse once per enemy (75% chance; 55% on bosses). Added only to victory gold; lost on defeat or escape.','بلا ضرر. يسرق مبلغًا صغيرًا مرة واحدة من كل عدو (فرصة 75%؛ 55% للزعماء). يُضاف لذهب النصر فقط ويضيع بالخسارة أو الهرب.']},
 toxicFang:{hero:'Venom',level:3,cost:5,kind:'physical',power:1.05,poison:3,en:'Toxic Fang',ar:'ناب سام',desc:['Physical attack ×1.05, then poison for 3 enemy turns: 18% of Venom’s attack each turn.','الهجوم الجسدي ×1.05، ثم سم لثلاثة أدوار للعدو: 18% من هجوم فينوم كل دور.']},
 sabotage:{hero:'Venom',level:7,cost:7,kind:'sabotage',en:'Sabotage',ar:'تخريب',desc:['No damage. Reduces defense by 30% (15% on bosses) for the current and next rounds. Refreshes without stacking.','بلا ضرر. يخفض الدفاع 30% (15% للزعماء) للجولة الحالية والتالية. يُجدد الأثر دون تراكم.']},
};
const skillPrevious={chooseCommand,battleCommandList,battleGold,drawBattle,renderTargets,showStats,navigateBattle,chapterScene,encounterRegion,startEncounter,beginJourney,restAtCamp,restoreCheckpoint,validCheckpoint,loseEncounter,draw,drawMarchInterior,blocked,update,updatePrompt,interact,chapterObjective,talkMarchNpc,easternMarket,buyMarketItem};
function heroSkillEntries(h){return Object.entries(SKILLS).filter(([,s])=>s.hero===h?.name)}
knownSpells=function(h){return heroSkillEntries(h).filter(([,s])=>h.level>=s.level).map(([id,s])=>[s.en+' · '+s.cost+' AP',id,s.ar+' · '+s.cost+' طاقة']).concat([['← BACK','back','رجوع →']])};
battleCommandList=function(){const list=skillPrevious.battleCommandList();if(state.battleMenu==='magic'&&!state.battle?.kind)return list.filter(row=>['analysis','starbolt','shield','flare','back'].includes(row[1]));return state.battleMenu==='main'?list.map(row=>row[1]==='magic'?['SKILLS','magic','مهارات']:row):list};
function skillDescription(s){return tr(...s.desc)}
function skillBoss(e,b=state.battle){return b.kind==='boss'&&b.enemies[0]===e}
function expireEnemyEffects(b){b.enemies.forEach(e=>{if(e.sabotaged&&b.round>e.sabotaged.expiresRound){e.defense=e.sabotaged.original;e.sabotaged=null}})}
const skillBeginRound=beginPartyRound;
beginPartyRound=function(){expireEnemyEffects(state.battle);skillBeginRound()};
battleGold=function(enemies){return skillPrevious.battleGold(enemies)+enemies.reduce((sum,e)=>sum+(e.stolenGold||0),0)};
offensivePower=function(h,action){const s=SKILLS[action],stats=heroStats(h);return s?.power?stats[s.kind==='magic'?'magic':'attack']*s.power:stats.attack};
function skillFx(id,targets=[],allies=[]){const b=state.battle;b.skillFx={id,start:battleNow(),duration:SKILLS[id]?.duration||860,actor:b.kind?b.actor:0,targets,allies}}
function skillSound(s,id){
 if(!audio.ctx||audio.ctx.state!=='running')return;
 const play=(notes,type='triangle',length=.18,gap=.07,volume=.27)=>notes.forEach((f,i)=>tone(f,length,type,volume,audio.sfxGain,i*gap));
 switch(id){
  case'shadowSlash':play([78,156,311],'sawtooth',.12,.05,.32);break;
  case'umbralSeal':play([110,103.83,73.42],'sine',.36,.10,.34);break;
  case'shadeSiphon':play([82.4,98,123.47,164.81],'triangle',.23,.11,.32);break;
  case'eclipseBlade':tone(49,.70,'sine',.38,audio.sfxGain);play([392,196,98],'sawtooth',.20,.14,.26);break;
  case'starbolt':play([659.25,987.77],'triangle',.16,.07,.33);break;
  case'shield':play([261.63,329.63,392,523.25],'sine',.48,.06,.25);break;
  case'flare':play([293.66,440,880,1174.66],'triangle',.18,.045,.31);tone(146.83,.36,'square',.13,audio.sfxGain,.22);break;
  case'starMend':play([523.25,659.25,783.99,1046.5],'sine',.38,.12,.26);break;
  case'gravityWell':play([196,146.83,98,49],'sine',.38,.13,.35);tone(58.27,.7,'triangle',.28,audio.sfxGain,.18);break;
  case'constellationSeal':play([440,554.37,659.25,880,1108.73],'sine',.23,.10,.26);break;
  case'galaxyWrath':tone(65.4,.9,'sine',.30,audio.sfxGain);play([196,293.66,392,587.33,784,1174.66],'triangle',.28,.075,.22);tone(98,.40,'triangle',.28,audio.sfxGain,.58);tone(1568,.28,'sine',.18,audio.sfxGain,.62);break;
  case'analysis':play([523.25,659.25,783.99],'sine',.12,.10,.22);break;
  case'pilfer':play([660,880,1320],'sine',.11,.09,.36);break;
  case'toxicFang':play([233,174,116],'square',.10,.06,.24);tone(73.42,.36,'triangle',.29,audio.sfxGain,.20);break;
  case'sabotage':play([164.81,155.56,82.4],'sawtooth',.12,.14,.24);break;
 }
}
chooseCommand=function(action){
 const b=state.battle;if(!b||b.busy||state.mode!=='battle')return;if(b.keyboardTarget){const prior=b.keyboardTarget;b.keyboardTarget=null;setBattleMessage(prior.message)}const h=b.kind?activeHero():state.party[0],s=SKILLS[action];
 if(action==='magic'){if(knownSpells(h).length<=1){setBattleMessage(tr(h.name+' has not learned a skill yet. First skill: LV 2.','لم يتعلم '+HERO_AR[h.name]+' مهارة بعد. المهارة الأولى: المستوى 2.'));return}state.battleMenu='magic';state.selected=0;battleSfx('menu');renderCommands();return}
 if(!s){skillPrevious.chooseCommand(action);return}
 if(s.hero!==h.name||h.level<s.level){setBattleMessage(tr('This skill is unavailable to this companion at this level.','هذه المهارة غير متاحة لهذا الرفيق في مستواه الحالي.'));return}
 if(!b.kind){
  if(action==='analysis'){
   prepareEnemyKnowledge(b);if(b.healthKnowledge[0]){setBattleMessage(tr('Atrox’s health is already known.','صحة أتروكس معروفة بالفعل.'));return}if(b.ap<s.cost){setBattleMessage(tr('Not enough mana.','لا توجد مانا كافية.'));return}
   b.ap-=s.cost;b.busy=true;state.battleMenu='main';state.selected=0;skillSound(s,action);const success=Math.random()<s.chance;
   if(success)revealEnemyHealth({name:'Atrox'},0,b);skillFx(action,[0]);setBattleMessage(success?tr('Astro’s calculations succeed · Atrox HP: '+Math.max(0,b.enemyHP)+' / 800.','نجحت حسابات أسترو · صحة أتروكس: '+Math.max(0,b.enemyHP)+' / 800.'):tr('Astro’s calculations fail. Atrox’s health remains unknown.','فشلت حسابات أسترو. تبقى صحة أتروكس مجهولة.'));renderCommands();updateStats();battleDelay(enemyTurn,950);return
  }
  if(['starbolt','shield','flare'].includes(action)){skillPrevious.chooseCommand(action);if(b.busy)skillFx(action,[0],action==='shield'?[0]:[])}return
 }
 if(h.ap<s.cost){setBattleMessage(tr('Not enough mana.','لا توجد مانا كافية.'));return}
 const e=b.enemies[state.target],targets=s.all?b.enemies.filter(e=>e.hp>0):e?.hp>0?[e]:[];
 let healTarget=null;
 if(s.kind==='heal'){healTarget=state.party.filter(p=>p.hp>0&&p.hp<heroStats(p).hp).sort((a,c)=>a.hp/heroStats(a).hp-c.hp/heroStats(c).hp)[0];if(!healTarget){setBattleMessage(tr('No living companion needs healing.','لا يحتاج أي رفيق حي إلى الشفاء.'));return}}
 if(!['heal','shield'].includes(s.kind)&&!targets.length)return;
 if(s.kind==='steal'&&(e.stolen||skillPrevious.battleGold([e])<=0)){setBattleMessage(tr(e.stolen?'This enemy’s purse was already stolen. Choose another action.':'This enemy carries no gold.',e.stolen?'سُرقت نقود هذا العدو بالفعل. اختر أمرًا آخر.':'لا يحمل هذا العدو ذهبًا.'));return}
 if(s.kind==='analyze'&&b.healthKnowledge?.[state.target]){setBattleMessage(tr('This enemy’s health is already known. Choose another action.','صحة هذا العدو معروفة بالفعل. اختر حركة أخرى.'));return}
 h.ap-=s.cost;b.busy=true;state.battleMenu='main';state.selected=0;let detail='',allies=[];skillSound(s,action);
 if(s.kind==='shield'){b.teamShield={expiresRound:b.round+1};allies=state.party.map((p,i)=>p.hp>0?i:-1).filter(i=>i>=0);detail=tr('25% less damage for two complete rounds.','ضرر أقل 25% لجولتين كاملتين.')}
 else if(s.kind==='heal'){const before=healTarget.hp;healTarget.hp=Math.min(heroStats(healTarget).hp,before+Math.floor(heroStats(h).magic*1.5));allies=[state.party.indexOf(healTarget)];detail=tr(healTarget.name+' +'+(healTarget.hp-before)+' HP.',HERO_AR[healTarget.name]+' +'+(healTarget.hp-before)+' صحة.')}
 else if(s.kind==='seal'){targets.forEach(t=>t.sealed={turns:skillBoss(t)?1:2});detail=tr('Special skills sealed; basic attacks remain possible. Bosses resist after one enemy phase.','خُتمت المهارات الخاصة؛ يبقى الهجوم العادي ممكنًا. يقاوم الزعماء بعد مرحلة واحدة للعدو.')}
 else if(s.kind==='sabotage'){const original=e.sabotaged?.original??e.defense;e.sabotaged={original,expiresRound:b.round+1};e.defense=Math.floor(original*(skillBoss(e)?.85:.70));detail=tr('Defense '+original+' → '+e.defense+' for two rounds.','الدفاع '+original+' ← '+e.defense+' لجولتين.')}
 else if(s.kind==='steal'){if(Math.random()<(skillBoss(e)?.55:.75)){const base=skillPrevious.battleGold([e]);e.stolen=true;e.stolenGold=Math.min(base,Math.min(skillBoss(e)?12:3,Math.max(1,Math.floor(base*.20))));detail=tr('Stole '+e.stolenGold+' gold. Held until victory; no damage dealt.','سُرقت '+e.stolenGold+' عملات. تُحفظ حتى النصر؛ لم يحدث ضرر.')}else detail=tr('The enemy protects its purse. Theft failed; no damage dealt.','يحمي العدو نقوده. فشلت السرقة؛ لم يحدث ضرر.')}
 else if(s.kind==='analyze'){if(Math.random()<s.chance){revealEnemyHealth(e,state.target,b);detail=tr('Calculations succeed · '+e.name+' HP: '+Math.max(0,e.hp)+' / '+e.maxHP+'.','نجحت الحسابات · صحة '+e.ar+': '+Math.max(0,e.hp)+' / '+e.maxHP+'.')}else detail=tr('The calculations fail. The enemy’s health remains unknown.','فشلت الحسابات. تبقى صحة العدو مجهولة.')}
 else{
  const stats=heroStats(h),results=targets.map(t=>{const power=(s.kind==='magic'?stats.magic:stats.attack)*s.power,hit=rollDamage(power,t.defense*(1-(s.pierce||0))),removed=Math.min(t.hp,hit.amount);t.hp=Math.max(0,t.hp-hit.amount);if(s.poison&&t.hp>0)t.poison={turns:s.poison,damage:Math.max(1,Math.floor(stats.attack*.18))};if(s.weaken&&t.hp>0){const original=t.gravity?.original??t.attack;t.gravity={original,turns:2};t.attack=Math.floor(original*(skillBoss(t)?.85:.75))}return{t,hit,removed}});
  if(s.drain){const before=h.hp;h.hp=Math.min(stats.hp,h.hp+Math.floor(results.reduce((n,r)=>n+r.removed,0)*s.drain));allies=[b.actor];detail=tr(' · Shadow restores '+(h.hp-before)+' HP.',' · يستعيد شادو '+(h.hp-before)+' صحة.')}
  detail=results.map(r=>tr(r.t.name,r.t.ar)+': '+r.hit.amount+(r.hit.critical?tr(' CRIT',' حرجة'):'')+(s.poison&&r.t.hp>0?tr(' + poison',' + سم'):'')+(s.weaken&&r.t.hp>0?tr(' + ATK down',' + خفض الهجوم'):'')).join(' · ')+detail;
  if(results.some(r=>r.hit.critical))criticalImpact();b.enemyShake=true;battleDelay(()=>{b.enemyShake=false},360);
 }
 skillFx(action,['heal','shield'].includes(s.kind)?[]:targets.map(t=>b.enemies.indexOf(t)),allies);if(s.kind==='steal')b.skillFx.failed=!e.stolen;setBattleMessage(tr(h.name,HERO_AR[h.name])+' · '+tr(s.en,s.ar)+' — '+detail);renderCommands();updateStats();battleDelay(afterHeroAction,(s.duration||860)+60)
};
// A stable enemy queue prevents a poison defeat from skipping the following soldier.
partyEnemyPhase=function(index){
 const b=state.battle;if(!b||state.mode!=='battle')return;if(index===0){b.busy=true;b.enemyQueue=b.enemies.filter(e=>e.hp>0).sort((a,c)=>c.speed-a.speed)}const queue=b.enemyQueue||[];
 if(b.enemies.every(e=>e.hp<=0)){winEncounter();return}if(state.party.every(h=>h.hp<=0)){loseEncounter();return}if(index>=queue.length){b.round++;beginPartyRound();return}
 const e=queue[index];if(e.hp<=0){partyEnemyPhase(index+1);return}
 if(e.poison?.turns>0){const d=Math.min(e.hp,e.poison.damage);e.hp-=d;e.poison.turns--;setBattleMessage(tr(e.name+' suffers '+d+' poison damage.',e.ar+' يتلقى '+d+' ضرر سم.'));skillFx('poisonTick',[b.enemies.indexOf(e)]);battleSfx('magic');renderCommands();updateStats();battleDelay(()=>enemyAct(e,index),550)}else enemyAct(e,index)
};
function enemyAct(e,index){
 const b=state.battle;if(!b||state.mode!=='battle')return;if(e.hp<=0){partyEnemyPhase(index+1);return}const alive=state.party.filter(h=>h.hp>0);if(!alive.length){loseEncounter();return}
 const sealed=e.sealed?.turns>0;if(sealed)e.sealed.turns--;else e.aiTurn=(e.aiTurn||0)+1;
 const pick=()=>alive[Math.floor(Math.random()*alive.length)],hits=[],strike=(h,power)=>{const hit=rollDamage(power,heroStats(h).defense);let damage=shieldedDamage(b,hit.amount);if(h.guarding)damage=Math.max(1,Math.floor(damage*.5));h.hp=Math.max(0,h.hp-damage);hits.push({h,damage,critical:hit.critical})};let en='',ar='',harmless=false;
 if(sealed){strike(pick(),e.attack);en=e.name+' is sealed and uses a basic attack.';ar=e.ar+' تحت الختم ويستخدم هجومًا عاديًا.'}
 else if(e.name==='Ironback'){if(e.aiTurn%3===1){en='Ironback lowers its head. A crushing charge is coming!';ar='يخفض الظهر الحديدي رأسه. اندفاع ساحق قادم!';harmless=true}else{const charge=e.aiTurn%3===2;strike(pick(),e.attack*(charge?1.6:1));en=charge?'Ironback uses Crushing Charge.':'Ironback lashes out.';ar=charge?'يستخدم الظهر الحديدي الاندفاع الساحق.':'يضرب الظهر الحديدي.'}}
 else if(e.name==='Glasswing'){if(e.aiTurn%3===1){en='Glasswing spreads its wings. Light gathers across the arena.';ar='يفرد الجناح الزجاجي جناحيه. يتجمع الضوء في أرجاء المدرّج.';harmless=true}else if(e.aiTurn%3===2){alive.forEach(h=>strike(h,e.attack*.95));en='Glasswing uses Shard Rain on the whole party.';ar='يستخدم الجناح الزجاجي مطر الشظايا على الفريق كله.'}else{const h=pick();strike(h,e.attack*.85);h.ap=Math.max(0,h.ap-6);en='Glasswing uses Dusk Siphon and drains 6 mana.';ar='يستخدم الجناح الزجاجي استنزاف الغسق ويسلب 6 مانا.'}}
 else if(e.name==='The Abomination'){const phase=e.aiTurn%4;if(phase===1){en='The Abomination draws power into the shard on its chest. Brace for the roar!';ar='يجمع المسخ القوة في شظية صدره. استعدوا للزئير!';harmless=true}else if(phase===2){alive.forEach(h=>strike(h,e.attack*1.3));en='The Abomination uses Shattering Roar on everyone.';ar='يستخدم المسخ الزئير المحطم على الجميع.'}else if(phase===3){strike(pick(),e.attack*1.05);const survivors=alive.filter(h=>h.hp>0);if(survivors.length)strike(survivors[Math.floor(Math.random()*survivors.length)],e.attack*1.05);en='The Abomination uses Twin Rend.';ar='يستخدم المسخ التمزيق المزدوج.'}else{e.hp=Math.min(e.maxHP,e.hp+90);if(!e.echoSummoned){e.echoSummoned=true;b.enemies.push(makeEnemy('Shard Echo','صدى الشظية',90,20,9,'#a794c4',0,8,0))}en='The shard restores 90 health and casts a hostile echo.';ar='تستعيد الشظية 90 صحة وتلقي صدى عدائيًا.';harmless=true}}
 else if(e.name==='Commander Varek'&&e.aiTurn%3===0){strike(pick(),e.attack*1.35);en='Varek uses Commanding Slash.';ar='يستخدم فاريك القطع الآمر.'}
 else if(e.name==='Captain Darius'&&e.aiTurn%3===0){alive.forEach(h=>strike(h,e.attack*.85));en='Darius orders a Sweeping Assault on the party.';ar='يأمر داريوس بهجوم كاسح على الفريق.'}
 else if(e.name==='Venom'&&e.aiTurn%3===0){strike(pick(),e.attack*1.45);en='Venom slips behind the line and uses Backstab.';ar='يتسلل فينوم خلف الصف ويستخدم طعنة غادرة.'}
 else if(e.name==='Ash Scorpion'&&e.aiTurn%3===0){const h=pick();strike(h,e.attack*1.25);h.ap=Math.max(0,h.ap-5);en='Ash Scorpion uses Acid Sting: 5 mana drained.';ar='يستخدم عقرب الرماد اللسعة الحمضية: سُلبت 5 مانا.'}
 else if(e.name==='Dusk Harpy'&&e.aiTurn%3===0){alive.forEach(h=>strike(h,e.attack*.65));en='Dusk Harpy uses Razor Feathers on everyone.';ar='تستخدم هاربي الغسق الريش القاطع على الجميع.'}
 else if(e.name==='Shard Sentinel'){if(e.aiTurn%3===1){en='The Sentinel’s crystal core lights up. Its next strike will be heavy.';ar='يضيء قلب الحارس البلوري. ستكون ضربته التالية ثقيلة.';harmless=true}else{strike(pick(),e.attack*(e.aiTurn%3===2?1.35:1));en='Shard Sentinel uses Crystal Hammer.';ar='يستخدم حارس الشظايا المطرقة البلورية.'}}
 else if(e.name==='Ironhide Ogre'&&e.aiTurn%3===0){alive.forEach(h=>strike(h,e.attack*.80));en='Ironhide Ogre smashes the ground beneath the party.';ar='يحطم غول الجلد الحديدي الأرض تحت الفريق.'}
 else if(e.name==='Shard Echo'){const h=pick();strike(h,e.attack);h.ap=Math.max(0,h.ap-3);en='The echo claws at health and mana.';ar='يمزق الصدى الصحة والمانا.'}
 else{strike(pick(),e.attack);en=e.name+' attacks.';ar=e.ar+' يهاجم.'}
 if(hits.some(h=>h.critical))criticalImpact();if(!harmless){battleSfx('enemy');flash('#d75b63')}else battleSfx('magic');setBattleMessage(tr(en,ar)+(hits.length?' '+hits.map(h=>tr(h.h.name,HERO_AR[h.h.name])+': '+h.damage+(h.critical?tr(' CRIT',' حرجة'):'')).join(' · '):''));if(e.gravity&&--e.gravity.turns<=0){e.attack=e.gravity.original;e.gravity=null}renderCommands();updateStats();if(state.party.every(h=>h.hp<=0)){battleDelay(loseEncounter,800);return}battleDelay(()=>partyEnemyPhase(index+1),harmless?1000:800)
}
renderTargets=function(){skillPrevious.renderTargets();const b=state.battle,panel=$('enemy-targets');if(!b?.kind||!panel)return;const living=b.enemies.filter(e=>e.hp>0);panel.children&&Array.from(panel.children).forEach((button,i)=>{const e=living[i],labels=[];if(e.poison?.turns>0)labels.push(tr('Poison '+e.poison.turns,'سم '+e.poison.turns));if(e.sealed?.turns>0)labels.push(tr('Seal '+e.sealed.turns,'ختم '+e.sealed.turns));if(e.gravity)labels.push(tr('ATK ↓ '+e.gravity.turns,'هجوم ↓ '+e.gravity.turns));if(e.sabotaged)labels.push(tr('DEF ↓','دفاع ↓'));if(e.stolenGold)labels.push('+'+e.stolenGold+' '+tr('loot','غنيمة'));if(labels.length){const line=document.createElement('small');line.className='enemy-effects';line.textContent=labels.join(' · ');button.appendChild(line)}})};
navigateBattle=function(key){if(state.battle?.keyboardTarget){const living=state.battle.enemies.map((e,i)=>e.hp>0?i:-1).filter(i=>i>=0),delta=['ArrowUp','ArrowLeft'].includes(key)?-1:1;if(living.length)state.target=living[(living.indexOf(state.target)+delta+living.length)%living.length];battleSfx('menu');renderTargets();return}if(state.battleMenu!=='magic'){skillPrevious.navigateBattle(key);return}const list=battleCommandList(),horizontal=state.lang==='ar'?-1:1,delta={ArrowUp:-2,ArrowDown:2,ArrowLeft:-horizontal,ArrowRight:horizontal}[key]||0;state.selected=(state.selected+delta+list.length)%list.length;battleSfx('menu');renderCommands()};
showStats=function(){skillPrevious.showStats()};
// Pixel effects drawn on the battlefield; no downloaded assets or audio required.
function enemyBattlePoint(b,i){return(b.kind==='boss'?[[139,106],[50,152],[107,184],[52,222]]:[[104,127],[130,210]])[i]||[139,106]}
function heroBattlePoint(i){return[394,state.party.length===3?104+i*54:139+i*62]}
function fxStar(x,y,r,color,rotation=0){ctx.save();ctx.translate(x,y);ctx.rotate(rotation);ctx.fillStyle=color;ctx.beginPath();for(let i=0;i<8;i++){const a=i*Math.PI/4,rr=i%2?r*.28:r;if(i===0)ctx.moveTo(Math.cos(a)*rr,Math.sin(a)*rr);else ctx.lineTo(Math.cos(a)*rr,Math.sin(a)*rr)}ctx.closePath();ctx.fill();ctx.restore()}
function drawGalaxyWrath(b,f,t,origin,fade){
 // A small, deterministic spiral and starfall: no images, downloads or random combat rolls.
 rect(0,0,512,288,'#10102e94');
 for(let k=0;k<28;k++){const x=(k*83+37)%512,y=(k*47+19)%230;fxStar(x,y,1.5+Math.sin(t*9+k)*.8,k%3?'#b6cfff':'#ffe6bc',t+k)}
 const gx=191,gy=85,spread=Math.min(1,t*3),collapse=Math.max(0,(t-.62)/.38);
 ctx.save();ctx.translate(gx,gy);ctx.rotate(-.28+t*.45);ctx.scale(1,.53);
 for(let arm=0;arm<3;arm++)for(let k=0;k<24;k++){
  const radius=(8+k*2.8)*spread*(1-collapse*.25),angle=k*.20+arm*Math.PI*2/3+t*5,x=Math.cos(angle)*radius,y=Math.sin(angle)*radius;
  ctx.globalAlpha=Math.min(1,fade*1.5)*(1-k/34);
  rect(x-4,y-3,8,6,arm%2?'#8061c866':'#547ed566');
  fxStar(x,y,1.4+(1-k/24)*1.7,k%3?'#c1dcff':'#ffe8c3',angle)
 }
 ctx.restore();ctx.globalAlpha=Math.min(1,fade*1.5);
 fxStar(gx,gy,10+fade*8,'#f2f6ff',-t*2);fxStar(gx,gy,5+fade*3,'#c8d4ff',t);
 if(t<.42){const q=Math.min(1,t/.35);for(let k=0;k<6;k++){const z=Math.max(0,q-k*.09);fxStar(origin[0]+(gx-origin[0])*z,origin[1]-20+(gy-origin[1]+20)*z,5-k*.45,'#c4dcff',t*4)}}
 const fall=Math.max(0,Math.min(1,(t-.25)/.5));
 if(fall>0)f.targets.forEach((i,j)=>{
  const [x,baseY]=enemyBattlePoint(b,i),y=baseY-16,impact=Math.max(0,Math.min(1,(t-.53)/.3));
  for(let k=0;k<4;k++){const q=Math.max(0,Math.min(1,fall*1.3-k*.09)),sx=gx+(k-1.5)*13,ex=x+(k-1.5)*8,cy=gy+(y-gy)*q,cx=sx+(ex-sx)*q;
   ctx.strokeStyle=k%2?'#94baff':'#e6dbff';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(cx-(ex-sx)*.13,cy-(y-gy)*.13-12);ctx.lineTo(cx,cy);ctx.stroke();fxStar(cx,cy,5+k*.3,k%2?'#d3e7ff':'#ffeabf',t*5+j)
  }
  if(impact>0){ctx.strokeStyle='#a1c8ff';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(x,y,8+impact*31,7+impact*23,0,0,Math.PI*2);ctx.stroke();fxStar(x,y,8+Math.sin(impact*Math.PI)*16,'#edf2ff',t*3);for(let k=0;k<6;k++){const a=k*Math.PI/3+j;fxStar(x+Math.cos(a)*impact*35,y+Math.sin(a)*impact*27,3,'#d5bbff',a+t)}}
 })
}
function drawSkillEffects(){
 const b=state.battle,f=b?.skillFx;if(!f)return;
 const t=(battleNow()-f.start)/f.duration;if(t<0||t>1){b.skillFx=null;return}
 const origin=heroBattlePoint(f.actor),fade=Math.sin(t*Math.PI),tau=Math.PI*2;
 const line=(points,color,width=2)=>{ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke()};
 const ring=(x,y,rx,ry,color,width=2,rotation=0)=>{ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();ctx.ellipse(x,y,rx,ry,rotation,0,tau);ctx.stroke()};
 const blob=(x,y,r,color)=>{ctx.fillStyle=color;ctx.beginPath();ctx.arc(x,y,r,0,tau);ctx.fill()};
 const shadowPath=(x,y)=>{ctx.strokeStyle='#090a19';ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(origin[0],origin[1]+9);ctx.bezierCurveTo(origin[0]-70,origin[1]+32,x+60,y+40,x,y+22);ctx.stroke();ring(x,y+23,26,9,'#7e52b6')};
 ctx.save();ctx.globalAlpha=Math.min(1,fade*1.5);
 if(f.id==='galaxyWrath'){drawGalaxyWrath(b,f,t,origin,fade);ctx.restore();return}
 if(f.id==='flare')rect(0,0,512,288,'#541c1227');
 if(f.id==='eclipseBlade'){rect(0,0,512,288,'#08081a77');blob(230,51,24+fade*9,'#ecbc63');blob(236,46,25+fade*9,'#090a19');ring(230,51,33+fade*5,33+fade*5,'#b293e4',1)}
 if(f.id==='constellationSeal'){
  const vertices=[[58,38],[154,28],[209,90],[155,166],[47,174],[22,97]];
  line([...vertices,vertices[0]],'#66bcdf',2);line([vertices[0],vertices[3],vertices[1],vertices[4],vertices[2],vertices[5],vertices[0]],'#719ac7',1);
  vertices.forEach(([x,y],i)=>fxStar(x,y,4+fade*3,'#d6faff',t+i));
 }
 f.targets.forEach((i,j)=>{
  const [x,baseY]=b.kind?enemyBattlePoint(b,i):[117,170],y=baseY-14;
  switch(f.id){
   case'shadowSlash':{
    shadowPath(x,y);const q=Math.min(1,t*1.8);
    ctx.fillStyle='#0a0b21';ctx.beginPath();ctx.moveTo(x-35,y+28);ctx.quadraticCurveTo(x-3,y-36,x+35,y-23);ctx.quadraticCurveTo(x+2,y-9,x-35,y+28);ctx.fill();
    line([[x-29+q*9,y+25],[x+27,y-26]],'#bf98ee',3);break
   }
   case'umbralSeal':{
    shadowPath(x,y);ring(x,y,26,20,'#8655b7',2);
    for(let k=0;k<3;k++){const yy=y-17+k*16;line([[x-29,yy-7],[x-16,yy],[x+15,yy],[x+28,yy+7]],'#251330',6);for(let n=0;n<5;n++)ring(x-19+n*10,yy,6,3,'#b287d5',1)}
    rect(x-8,y-7,16,15,'#291c40');ring(x,y-9,6,9,'#d4b3fa',2);rect(x-1,y-1,2,6,'#e3c6fb');break
   }
   case'shadeSiphon':{
    shadowPath(x,y);for(let k=0;k<8;k++){const q=Math.max(0,Math.min(1,t*1.7-k*.07));const xx=x+(origin[0]-x)*q,yy=y+(origin[1]-y)*q-Math.sin(q*Math.PI)*32;blob(xx,yy,4,'#7d3c8c');blob(xx-1,yy-1,2,'#dfa4b8')}
    ring(x,y,14+fade*7,23,'#a74c8c',2);break
   }
   case'eclipseBlade':{
    shadowPath(x,y);const height=18+Math.min(1,t*2)*51;
    ctx.fillStyle='#08071d';ctx.beginPath();ctx.moveTo(x,y+29);ctx.lineTo(x-11,y-10);ctx.lineTo(x,y-height);ctx.lineTo(x+11,y-10);ctx.closePath();ctx.fill();line([[x,y+29],[x,y-height]],'#ddd1fa',3);
    if(t>.5){ring(x,y+23,10+fade*31,5+fade*12,'#c79fe8',3);for(let k=0;k<5;k++)line([[x,y],[x+Math.cos(k*tau/5)*30*fade,y+Math.sin(k*tau/5)*38*fade]],'#8c69a9',2)}break
   }
   case'starbolt':{
    for(let k=0;k<7;k++){const q=Math.max(0,Math.min(1,t*1.7-k*.055));fxStar(origin[0]+(x-origin[0])*q,origin[1]-16+(y-origin[1]+16)*q,8-k*.6,k%2?'#a8beff':'#fff1b7',t*2)}break
   }
   case'flare':{
    const q=Math.min(1,t*1.4);blob(x,y,4+fade*13,'#fff0b9');ring(x,y,9+q*38,9+q*38,'#f1a552',3);
    for(let k=0;k<10;k++){const a=k*tau/10+j,inner=8+q*13,outer=18+q*35;line([[x+Math.cos(a)*inner,y+Math.sin(a)*inner],[x+Math.cos(a)*outer,y+Math.sin(a)*outer]],k%2?'#fff5b5':'#fa8560',3)}break
   }
   case'gravityWell':{
    ctx.fillStyle='#090918';ctx.beginPath();ctx.ellipse(x,y,12+fade*13,15+fade*17,0,0,tau);ctx.fill();ring(x,y,26+fade*8,9+fade*3,'#bb82e8',3,-.35);ring(x,y,29,14,'#6c4da6',1,.35);
    for(let k=0;k<12;k++){const q=(t*.8+k/12)%1,a=k*2.4+t*7,r=43*(1-q);blob(x+Math.cos(a)*r,y+Math.sin(a)*r*.8,1+q*2,k%2?'#ab81d7':'#d1bdeb')}
    for(let k=0;k<3;k++){const yy=y-20+k*18+Math.sin(t*8)*3;line([[x-34,yy-8],[x-29,yy],[x-24,yy-8]],'#d399f0',2);line([[x+24,yy-8],[x+29,yy],[x+34,yy-8]],'#d399f0',2)}break
   }
   case'constellationSeal':{
    ring(x,y,24,24,'#8ce9ef',2);const pts=Array.from({length:5},(_,k)=>[x+Math.cos(-Math.PI/2+k*tau/5)*21,y+Math.sin(-Math.PI/2+k*tau/5)*21]);line([pts[0],pts[2],pts[4],pts[1],pts[3],pts[0]],'#d8feff',2);pts.forEach(([px,py])=>fxStar(px,py,3,'#e4fcff'));break
   }
   case'pilfer':{
    rect(x-11,y-6,22,17,'#946535');rect(x-5,y-10,10,5,'#d8b46f');ring(x,y-9,7,5,'#f1d68b',1);
    if(f.failed){line([[x-15,y-15],[x+15,y+15]],'#ee8b81',3);line([[x+15,y-15],[x-15,y+15]],'#ee8b81',3)}
    else for(let k=0;k<6;k++){const q=Math.max(0,Math.min(1,t*1.7-k*.08)),cx=x+(origin[0]-x)*q,cy=y+(origin[1]-y)*q-Math.sin(q*Math.PI)*45;blob(cx,cy,4,'#e9ad38');ring(cx,cy,3,3,'#fff0a1',1)}break
   }
   case'toxicFang':{
    line([[x-24,y-20],[x-4,y+22]],'#e3f4b9',4);line([[x+24,y-20],[x+4,y+22]],'#b8de6a',4);
    for(let k=0;k<8;k++){const q=(t+k*.12)%1;blob(x+Math.sin(k*3)*18,y+14-q*42,2+(1-q)*3,k%2?'#96d846':'#426928')}
    blob(x,y+5,6,'#91bc36');break
   }
   case'sabotage':{
    const split=fade*6;line([[x-split,y-24],[x-21-split,y-15],[x-14-split,y+15],[x-split,y+25]],'#d4d3b7',3);line([[x+split,y-24],[x+21+split,y-15],[x+14+split,y+15],[x+split,y+25]],'#a2ad90',3);
    line([[x+1,y-24],[x-5,y-10],[x+4,y-1],[x-4,y+11],[x+1,y+25]],'#ed9156',3);for(let k=0;k<5;k++)rect(x+(k%2?1:-1)*(11+fade*18),y-12+k*9+fade*8,3,3,'#c2c4a7');break
   }
   case'poisonTick':for(let k=0;k<7;k++){const q=(t+k*.14)%1;blob(x+Math.sin(k*3)*19,y+19-q*45,2+(1-q)*3,k%2?'#97d84c':'#496c2d')}break;
  }
 });
 f.allies.forEach(i=>{
  const [x,baseY]=heroBattlePoint(i),y=baseY-15;
  if(f.id==='shield'){
   ring(x,y,28,33,'#7199d1',2);for(let k=0;k<3;k++){const a=t*5+k*tau/3;ring(x,y,29,10,'#9dc4f3',1,a);fxStar(x+Math.cos(a)*29,y+Math.sin(a)*25,4,'#fff1bd')}
   const points=Array.from({length:6},(_,k)=>[x+Math.cos(k*tau/6)*22,y+Math.sin(k*tau/6)*26]);line([...points,points[0]],'#e1f4ff',2)
  }else if(f.id==='starMend'){
   ring(x,y+25,25,8,'#87ead1',2);for(let k=0;k<8;k++){const yy=y+30-((t+k*.12)%1)*58,xx=x+Math.sin(k*4)*18;rect(xx-1,yy-4,2,8,'#baffd8');rect(xx-4,yy-1,8,2,'#baffd8')}line([[x-12,y+2],[x-4,y+7],[x+13,y-12]],'#e4ffe3',3)
  }else if(f.id==='shadeSiphon'){ring(x,y,21+fade*6,29,'#bd769f',2);for(let k=0;k<4;k++)blob(x+Math.cos(t*5+k)*22,y+Math.sin(t*5+k)*24,3,'#d599b6')}
 });ctx.restore()
}
drawBattle=function(){skillPrevious.drawBattle();drawSkillEffects()};
// A supervised yard lets captives train without abandoning the arena plot.
function setupTrainingYard(x=76,y=232){state.scene='trainingYard';state.entities=partySprites(x,y);state.entities.push(entity('Yard Warden',91,162,colors.Soldier,{yardTalk:true}));state.encounterDistance=0;state.nextEncounter=nextEncounterDistance();state.trail=[]}
chapterScene=()=>state.scene==='trainingYard'||skillPrevious.chapterScene();
encounterRegion=function(){return state.scene==='trainingYard'?'east':skillPrevious.encounterRegion()};
easternMarket=function(){return state.scene==='trainingYard'||skillPrevious.easternMarket()};
function trainingPoint(){const p=state.player,near=(x,y,r)=>Math.hypot(p.x-x,p.y-y)<r;if(state.scene==='holding'&&near(57,237,25))return'yard';if(state.scene==='trainingYard'){if(near(53,242,25))return'cells';if(near(102,113,27))return'rest';if(near(91,162,32))return'warden'}return null}
function arenaTrainingObjective(){ui.objective.textContent=tr('TRAINING YARD · FARM / REST / RETURN TO THE CELLS','ساحة التدريب · تدربوا / استريحوا / عودوا لغرف الاحتجاز')}
chapterObjective=function(){if(state.scene==='trainingYard'){arenaTrainingObjective();return}skillPrevious.chapterObjective();if(state.scene==='holding')ui.objective.textContent+=' · '+tr('WEST DOOR: TRAINING','الباب الغربي: التدريب')};
blocked=function(x,y){if(state.scene!=='trainingYard')return skillPrevious.blocked(x,y);return x<20||x>492||y<36||y>269||footHitsRect(x,y,64,56,81,39)||footHitsRect(x,y,296,77,44,40)||footHitsRect(x,y,366,184,45,36)||actorsBlockFeet(x,y)};
updatePrompt=function(){if(!['trainingYard','holding'].includes(state.scene)){skillPrevious.updatePrompt();return}const point=trainingPoint();if(!point){skillPrevious.updatePrompt();return}ui.prompt.classList.remove('hidden');ui.prompt.textContent={yard:tr('A  Training yard','A  ساحة التدريب'),cells:tr('A  Return to holding cells','A  عودوا لغرف الاحتجاز'),rest:tr('A  Rest and save training','A  استريحوا واحفظوا التدريب'),warden:tr('A  Training supplies / equipment','A  مؤن التدريب / تجهيزات')}[point]};
interact=function(){if(state.mode!=='map'||!trainingPoint()){skillPrevious.interact();return}const point=trainingPoint();if(point==='yard'){setupTrainingYard();resumeChapterMap();startMusic('village')}else if(point==='cells'){setupHolding();state.player.x=79;state.player.y=237;resumeChapterMap()}else if(point==='rest')restForArena();else if(point==='warden')talkYardWarden()};
async function talkYardWarden(){const token=state.session;await say([D('Yard Warden','The western door stays open for training. The creatures in this fenced yard return, and the camp beds cost nothing. Rest there to save your progress before another exhibition.','يبقى الباب الغربي مفتوحًا للتدريب. تعود مخلوقات هذه الساحة المسوّرة، وأسرّة المخيم مجانية. استريحوا هناك لحفظ تقدمكم قبل العرض التالي.')]);if(token!==state.session)return;const choice=await storyChoice('Prepare for the next exhibition','استعدوا للعرض التالي',[['Buy remedies','شراء أدوية','supplies'],['Weapons and armor','أسلحة وتجهيزات','gear'],['Return to training','العودة للتدريب','back']]);if(token!==state.session)return;if(choice==='back')resumeChapterMap();else openMarket(choice)}
talkMarchNpc=async function(npc){if(npc.marchTalk==='arenaKeeper'){await sayAndResume([D('Arena Keeper','The southern door leads to the exhibition. The western door opens onto the training yard. Hunt there, buy equipment from the warden, then use the beds to recover and save.','يقود الباب الجنوبي إلى العرض، ويفتح الباب الغربي على ساحة التدريب. اصطادوا هناك واشتروا التجهيزات من الحارس، ثم استخدموا الأسرّة للتعافي والحفظ.')]);return}await skillPrevious.talkMarchNpc(npc)};
update=function(){const p=state.player,scene=state.scene,x=p?.x,y=p?.y;skillPrevious.update();if(scene==='trainingYard'&&state.mode==='map'&&p){const d=Math.hypot(p.x-x,p.y-y);state.encounterDistance+=d;if(d>0&&!trainingPoint()&&state.encounterDistance>=state.nextEncounter)startEncounter('random')}};
function drawTrainingYard(){for(let y=0;y<288;y+=16)for(let x=0;x<512;x+=16)tileNoise(x,y,'#3d5143','#506349');rect(14,24,484,10,'#6f6965');rect(14,24,9,255,'#6f6965');rect(489,24,9,255,'#6f6965');rect(14,270,484,10,'#6f6965');for(let x=20;x<493;x+=26)rect(x,17,13,14,'#9a9284');rect(27,234,29,26,'#182132');rect(42,244,15,5,'#d4c39c');rect(64,56,81,39,'#908b73');rect(72,68,65,20,'#6f84a0');rect(78,56,29,8,'#c9c4aa');rect(31,49,119,155,'#bfb38b12');for(const [x,y]of[[318,105],[390,211]]){rect(x-17,y-30,34,38,'#64635b');rect(x-11,y-29,25,10,'#8b8e79')}for(let x=204;x<483;x+=30)rect(x,247,6,4,'#8d9075');state.entities.slice().sort((a,b)=>a.y-b.y).forEach(drawSprite);ctx.fillStyle='#e6d6ab';ctx.font='8px monospace';ctx.textAlign='left';ctx.fillText(tr('CAMP / SAVE','مخيم / حفظ'),62,44);ctx.fillText(tr('HUNTING GROUND','ساحة الصيد'),297,47);ctx.fillText(tr('CELLS','الزنازين'),28,226)}
drawMarchInterior=function(){skillPrevious.drawMarchInterior();if(state.scene==='holding'){rect(42,223,14,28,'#14202b');rect(48,231,11,5,'#d2c296');ctx.fillStyle='#eadbb4';ctx.font='8px monospace';ctx.textAlign='left';ctx.fillText(tr('TRAIN','تدريب'),61,226)}};
draw=function(){if(state.scene!=='trainingYard'){skillPrevious.draw();return}state.time=performance.now();if(['battle','battleBusy'].includes(state.mode)||(state.mode==='stats'&&state.statsReturn==='battle'))drawBattle();else drawTrainingYard();requestAnimationFrame(draw)};
// First boss now has a persistent safe camp, matching the later automatic checkpoints.
validCheckpoint=function(s){return skillPrevious.validCheckpoint(s)||(s?.id==='mistwood_camp'&&skillPrevious.validCheckpoint({...s,id:'after_checkpoint'}))};
function setupMistwoodCamp(){state.scene='forest';state.entities=partySprites(110,243);state.entities.push(entity('Scout',133,212,'#879568',{talk:true}));state.player=find('Shadow');state.trail=[];state.encounterDistance=0;state.nextEncounter=nextEncounterDistance();journeyObjective()}
restoreCheckpoint=function(){const saved=state.devTesting?developmentCheckpoint:(checkpoint||readStoredCheckpoint());if(saved?.id!=='mistwood_camp')return skillPrevious.restoreCheckpoint();if(!validCheckpoint(saved))return false;abortCurrentFlow();state.party=copy(saved.party);state.gold=saved.gold;state.herbs=saved.herbs;state.blueHerbs=saved.blueHerbs||0;state.inventory=copy(saved.inventory||{});state.scoutMet=saved.scoutMet;state.chestOpened=saved.chestOpened;Object.assign(state,chapterFlags(),saved.flags);state.journey=true;state.burning=false;state.level=state.party.find(h=>h.name==='Astro').level;ensureEquipment();healParty();setupMistwoodCamp();$('stats-button').classList.add('available');returnToJourney();startMusic('village');return true};
beginJourney=async function(){const token=state.session;await skillPrevious.beginJourney();if(token===state.session&&state.mode==='map'&&!state.postCheckpoint)saveCheckpoint('mistwood_camp')};
restAtCamp=async function(){const token=state.session;await skillPrevious.restAtCamp();if(token===state.session&&state.mode==='map'&&!state.postCheckpoint)saveCheckpoint('mistwood_camp')};
startEncounter=function(kind){if(kind==='boss'&&!state.postCheckpoint)saveCheckpoint('mistwood_camp');skillPrevious.startEncounter(kind)};
loseEncounter=async function(){const b=state.battle,saved=state.devTesting?developmentCheckpoint:(checkpoint||readStoredCheckpoint());if(b?.kind==='boss'&&validCheckpoint(saved)){const token=state.session;state.mode='cutscene';ui.battle.classList.add('hidden');$('enemy-targets')?.remove();startMusic('village');await say([D('Astro','We return to our last checkpoint. We can leave, train, gather supplies, and try again. Any stolen purse is lost with this attempt.','نعود إلى آخر نقطة حفظ. يمكننا الانسحاب والتدرب وجمع المؤن ثم المحاولة مجددًا. تضيع النقود المسروقة مع هذه المحاولة.')]);if(token===state.session)restoreCheckpoint();return}await skillPrevious.loseEncounter()};
buyMarketItem=function(id){const gold=state.gold,night=state.scene==='bellInn'&&state.nightRested&&!state.beastDefeated;skillPrevious.buyMarketItem(id);if(id==='sleep'&&night&&state.gold===gold-20)saveCheckpoint('before_abomination')};
const trainingDevPrevious=developmentJump;
DEV_STAGES.find(group=>group.points.some(([id])=>id==='arena1')).points.splice(1,0,['trainingYard','Arena / training yard','المدرّج / ساحة التدريب']);
developmentJump=function(stage){if(stage!=='trainingYard'){trainingDevPrevious(stage);return}trainingDevPrevious('arena1');setupTrainingYard();resumeChapterMap();startMusic('village')};

// One input contract: arrows move, Z confirms, X cancels or sprints while held.
const RUN_MULTIPLIER=1.9;
let bButtonPointer=null,bButtonHeld=false;
function sprinting(){return state.mode==='map'&&(bButtonHeld||state.keys.x)}
function pressA(){
 if(state.mode==='battle'&&state.battle?.auto){stopAutoBattle();return}
 if(state.mode==='battle'&&state.battle&&!state.battle.busy){
  const b=state.battle;if(b.keyboardTarget){const action=b.keyboardTarget.action;b.keyboardTarget=null;chooseCommand(action);return}
  const row=battleCommandList()[state.selected];if(!row)return;const action=row[1],skill=SKILLS[action],single=action==='attack'||skill&&!skill.all&&!['heal','shield'].includes(skill.kind),living=b.enemies?.map((e,i)=>e.hp>0?i:-1).filter(i=>i>=0)||[];
  if(b.kind&&single&&living.length>1){const hero=activeHero();if(skill&&(hero.level<skill.level||hero.ap<skill.cost)){chooseCommand(action);return}if(!living.includes(state.target))state.target=living[0];b.keyboardTarget={action,message:ui.message.textContent};setBattleMessage(tr('Choose an enemy · arrows · Z confirm · X back','اختر عدوًا · الأسهم · Z للتأكيد · X للرجوع'));renderTargets();return}
  if(b.kind&&single&&living.length===1)state.target=living[0];chooseCommand(action);return
 }
 if(['map','dialogue','choice'].includes(state.mode)){const wasMap=state.mode==='map';interact();if(wasMap&&state.mode!=='map'){clearMovement();clearBButton()}}
}
function pressB(){
 if(state.mode==='battle'&&state.battle?.auto){stopAutoBattle();return}
 if(state.mode==='battle'&&state.battle?.keyboardTarget&&!state.battle.busy){const previous=state.battle.keyboardTarget;state.battle.keyboardTarget=null;setBattleMessage(previous.message);renderCommands();return}
 if(state.mode==='stats'){closeStats();return}
 if(state.mode==='shop'){closeScoutShop();return}
 if(state.mode==='market'){closeMarket();return}
 if(state.mode==='dev'){closeDev();return}
 if(state.mode==='battle'&&state.battleMenu!=='main'&&!state.battle?.busy){chooseCommand('back');return}
 // Narrative choices are consequential. B never selects one on the player's behalf.
 if(state.mode==='choice'&&!state.choiceLocked){const cancel=state.choiceOptions.findIndex(o=>['later','back'].includes(o.value));if(cancel>=0)resolveChoice(cancel)}
}
function clearBButton(){const id=bButtonPointer;bButtonPointer=null;bButtonHeld=false;$('back-button').classList.remove('held');if(id!==null)try{$('back-button').releasePointerCapture?.(id)}catch(_){}}
function syncGameButtons(){const hidden=['title','end','cutscene','battle','battleBusy','dialogue','choice','devAuth'].includes(state.mode);$('game-buttons').classList.toggle('hidden',hidden);$('game-buttons').classList.toggle('raised-controls',['dialogue','choice'].includes(state.mode));$('game-buttons').classList.toggle('menu-controls',['stats','shop','market','dev','battle'].includes(state.mode));$('game-buttons').classList.toggle('battle-controls',state.mode==='battle');$('action-button').disabled=state.mode==='battle'&&!!state.battle?.busy;$('back-button').disabled=state.mode==='battle'&&!!state.battle?.busy;if(state.mode!=='map'){bButtonHeld=false;state.keys.x=false;$('back-button').classList.remove('held')}$('action-button').title=tr('A · Z · interact / confirm','A · Z · تفاعل / تأكيد');$('back-button').title=tr('B · X · hold to sprint / back','B · X · اضغط باستمرار للجري / رجوع')}
const controlPrevious={update,applyLanguage,reset,clearMovement,updatePrompt,interact,newSceneInteraction,marchInteraction,nearbyEntrance,drawOutdoorLayers};
function outdoorPortals(){
 if(state.scene==='village')return ELARIS_HOMES.map((b,i)=>({...b,id:'home',entrance:villageEntrances[i+1]})).concat([{x:192,y:35,w:130,h:86,door:{x:257},id:'shrine',entrance:villageEntrances[0]}]);
 if(state.scene==='town')return TOWN_BUILDINGS;
 if(state.scene==='bellhaven')return [...BELL_BUILDINGS,...BELL_HOMES];
 return[]
}
function inPortal(p,b){const x=b.door?.x??b.x+b.w/2,bottom=b.y+b.h;return !!p&&Math.abs(p.x-x)<25&&p.y>=bottom-20&&p.y<=bottom+34}
function currentPortal(){return outdoorPortals().find(b=>inPortal(state.player,b))||null}
nearbyEntrance=function(){if(state.scene!=='village')return controlPrevious.nearbyEntrance();const b=currentPortal();return b?.entrance||null};
newSceneInteraction=function(){if(state.scene==='town'){const b=currentPortal();if(b&&state.townRaidCleared)return{type:'building',id:b.id,en:'A  Enter '+b.label,ar:'A  ادخل '+({forge:'الحداد',manor:'منزل الزعيم',inn:'النزل',apothecary:'متجر الأعشاب'}[b.id])}}return controlPrevious.newSceneInteraction()};
marchInteraction=function(){if(state.scene==='bellhaven'){const b=currentPortal();if(b){if(BELL_HOMES.includes(b))return{type:'lockedHome',en:'A  Try door',ar:'A  جرّب الباب'};return{type:b.id==='arena'?'arenaDoor':'marchBuilding',id:b.id,en:'A  '+b.label[0],ar:'A  '+b.label[1]}}}return controlPrevious.marchInteraction()};
drawOutdoorLayers=function(buildings,paintBuilding,extra=[]){const portals=outdoorPortals(),layers=[...buildings.map(b=>({depth:b.y+b.h,paint:()=>paintBuilding(b)})),...state.entities.filter(e=>e.visible).map(e=>{const doorway=portals.find(b=>inPortal(e,b)&&Math.abs(e.x-(b.door?.x??b.x+b.w/2))<12&&e.y<=b.y+b.h);return{depth:doorway?doorway.y+doorway.h+.5:e.y+9,paint:()=>drawSprite(e)}}),...extra];layers.sort((a,b)=>a.depth-b.depth).forEach(layer=>layer.paint())};
updatePrompt=function(){controlPrevious.updatePrompt();if(state.mode!=='map')return;const b=currentPortal();if(!b)return;ui.prompt.classList.remove('hidden');ui.prompt.textContent=tr(b.id==='shrine'?'A  Enter shrine':b.entrance||BELL_HOMES.includes(b)?'A  Try door':'A  Enter building',b.id==='shrine'?'A  ادخل المزار':b.entrance||BELL_HOMES.includes(b)?'A  جرّب الباب':'A  ادخل المبنى')};
interact=function(){if(state.mode==='map'){const b=currentPortal();if(b&&state.player.y<=b.y+b.h+9){if(state.scene==='village'){if(b.id==='shrine')enterShrine();else showLockedDoor();return}if(state.scene==='town'&&state.townRaidCleared){enterTownBuilding(b.id);return}if(state.scene==='bellhaven'&&b.id!=='arena'){if(BELL_HOMES.includes(b))sayAndResume(missionLines(bellNight()?'The door is barred. Its occupants have gone to bed.':'A family lives here. Their door is locked.',bellNight()?'الباب موصد. ذهب سكانه إلى النوم.':'تسكن عائلة هنا. بابها مقفل.','Narrator'));else enterMarchBuilding(b.id);return}}}controlPrevious.interact()};
update=function(){syncChamberMusic();controlPrevious.update();syncGameButtons()};
applyLanguage=function(){controlPrevious.applyLanguage();$('controls-help').textContent=tr('Move: arrows · A: Z · B: X (hold while moving to sprint) · Battle menus / targets: arrows · Mouse / touch available','الحركة: الأسهم · A: زر Z · B: زر X (اضغط أثناء الحركة للجري) · قوائم القتال / الأهداف: الأسهم · الماوس / اللمس متاحان');syncGameButtons()};
reset=function(){clearBButton();controlPrevious.reset();syncGameButtons()};
clearMovement=function(){clearBButton();controlPrevious.clearMovement()};
$('back-button').addEventListener('pointerdown',e=>{if(bButtonPointer!==null||(e.pointerType==='mouse'&&e.button!==0))return;e.preventDefault();bButtonPointer=e.pointerId;try{$('back-button').setPointerCapture?.(e.pointerId)}catch(_){}if(state.mode==='map'){bButtonHeld=true;$('back-button').classList.add('held')}else pressB()});
function releaseB(e){if(e.pointerId===bButtonPointer){if(e.cancelable)e.preventDefault();clearBButton()}}
for(const type of ['pointerup','pointercancel','lostpointercapture'])$('back-button').addEventListener(type,releaseB);
document.addEventListener('pointerup',releaseB);document.addEventListener('pointercancel',releaseB);
$('back-button').addEventListener('click',e=>{e.preventDefault();if(e.detail===0)pressB()});

// Fixed regional progression: farming makes the party stronger, never the enemy.
const ENCOUNTER_COUNTS=[1,1,2,2,2,3,3,4];
const REGION_ENEMIES={
 forest:[
  ['Mist Wolf','ذئب ضبابي',50,13,3,'#8f9aa4',13,10,1,3],
  ['Hollow Wisp','طيف أجوف',58,15,2,'#a38bc2',16,8,1,2],
  ['Briar Crawler','زاحف الشوك',48,12,5,'#689253',12,5,1,3],
  ['Gloom Bat','خفاش العتمة',42,14,2,'#89809e',11,13,1,2]],
 pass:[
  ['Quarry Wolf','ذئب المحجر',90,21,7,'#9b9a88',24,14,2,4],
  ['Stone Beetle','خنفساء الحجر',115,22,11,'#89927c',28,8,2,4],
  ['Pass Wisp','طيف الممر',106,24,7,'#aa95b9',29,12,2,4],
  ['Ridge Viper','أفعى المرتفع',85,25,6,'#a59862',25,16,2,4]],
 west:[
  ['Road Bandit','قاطع طريق',140,30,12,'#91755f',36,17,3,5],
  ['Marsh Wisp','طيف المستنقع',132,29,9,'#9b8db8',34,13,3,5],
  ['Ridge Boar','خنزير التلال',170,32,13,'#95816b',40,10,4,6],
  ['Bog Lizard','سحلية المستنقع',145,28,12,'#648c74',35,15,3,5]],
 east:[
  ['Ash Scorpion','عقرب الرماد',230,53,22,'#b69b79',54,23,4,7],
  ['Shard Sentinel','حارس الشظايا',320,60,30,'#8f9fbd',66,17,5,8],
  ['Dusk Harpy','هاربي الغسق',215,56,19,'#ad8aaf',58,28,5,7],
  ['Ironhide Ogre','غول الجلد الحديدي',350,66,28,'#82977b',70,14,6,9]]
};
regionalEnemies=function(region=encounterRegion()){const templates=REGION_ENEMIES[region]||REGION_ENEMIES.forest,count=ENCOUNTER_COUNTS[randomInt(0,ENCOUNTER_COUNTS.length-1)],groupFactor=count===4?.80:count===3?.90:1;return Array.from({length:count},()=>{const[name,ar,hp,attack,defense,color,xp,speed,goldMin,goldMax]=templates[randomInt(0,templates.length-1)],variation=.92+Math.random()*.16,e=makeEnemy(name,ar,Math.round(hp*variation*groupFactor),Math.round(attack*variation*groupFactor),defense,color,Math.round(xp*variation*groupFactor),speed,0);return Object.assign(e,{region,goldMin,goldMax})})};
const BOSS_TUNING={
 'Commander Varek':{hp:480,attack:40,defense:18,speed:15,xp:135,goldMin:22,goldMax:28},
 'Captain Darius':{hp:800,attack:55,defense:25,speed:19,xp:185,goldMin:34,goldMax:42},
 'Venom':{hp:1200,attack:72,defense:32,speed:28,xp:210,goldMin:25,goldMax:35},
 'Ironback':{hp:1650,attack:85,defense:38,speed:22,xp:280,goldMin:50,goldMax:65},
 'Glasswing':{hp:2500,attack:109,defense:46,speed:30,xp:370,goldMin:75,goldMax:90},
 'The Abomination':{hp:3600,attack:145,defense:56,speed:34,xp:600,goldMin:120,goldMax:145}
};
const balancePrevious={startEncounter,startChapterBattle,startMarchBattle,makeEnemy,chooseCommand,drawBody,showStats};
function tuneBossBattle(){const b=state.battle;if(b?.kind!=='boss')return;b.enemies.forEach(e=>{let tuning=BOSS_TUNING[e.name];if(/^Soldier \d$/.test(e.name))tuning={hp:100,attack:26,defense:11,speed:10,xp:24,goldMin:3,goldMax:5};if(e.name.startsWith('Dawn Soldier'))tuning={hp:180,attack:35,defense:17,speed:14,xp:36,goldMin:5,goldMax:7};if(tuning)Object.assign(e,tuning,{hp:tuning.hp,maxHP:tuning.hp})});renderCommands();updateStats()}
startEncounter=function(kind){balancePrevious.startEncounter(kind);tuneBossBattle()};
startChapterBattle=function(kind){balancePrevious.startChapterBattle(kind);tuneBossBattle()};
startMarchBattle=function(kind){balancePrevious.startMarchBattle(kind);tuneBossBattle()};
makeEnemy=function(...args){const e=balancePrevious.makeEnemy(...args);if(e.name==='Shard Echo')Object.assign(e,{hp:260,maxHP:260,attack:70,defense:30,xp:0,gold:0});return e};
// Focus supplies limited mana and guard, never free unlimited health recovery.
chooseCommand=function(action){const b=state.battle;if(b?.keyboardTarget&&!b.busy&&state.mode==='battle'){const previous=b.keyboardTarget;b.keyboardTarget=null;setBattleMessage(previous.message)}if(action!=='special'||!b?.kind){balancePrevious.chooseCommand(action);return}if(b.busy||state.mode!=='battle')return;const h=activeHero();if(h.name!=='Astro')return;const before=h.ap;h.ap=Math.min(heroStats(h).ap,h.ap+8+Math.floor(heroStats(h).magic*.10));h.guarding=true;b.busy=true;state.battleMenu='main';battleSfx('shield');setBattleMessage(tr('Astro focuses: +'+(h.ap-before)+' mana. Guarding this round; no health restored.','يركز أسترو: +'+(h.ap-before)+' مانا. يحتمي هذه الجولة؛ لا يستعيد صحة.'));renderCommands();updateStats();battleDelay(afterHeroAction,800)};
showStats=function(){balancePrevious.showStats()};
function battleEnemyPositions(b){if(b.kind==='boss')return[[139,106],[50,152],[107,184],[52,222]];return b.enemies.length===1?[[119,156]]:b.enemies.length===2?[[104,127],[130,210]]:b.enemies.length===3?[[115,106],[60,175],[139,226]]:[[119,98],[52,153],[136,182],[61,231]]}
enemyBattlePoint=function(b,i){return battleEnemyPositions(b)[i]||[119,156]};
drawBody=function(x,y,e){
 const special=['Ash Scorpion','Shard Sentinel','Dusk Harpy','Ironhide Ogre','Gloom Bat','Stone Beetle','Ridge Viper','Ridge Boar','Bog Lizard'];if(!special.includes(e.name)){balancePrevious.drawBody(x,y,e);return}ctx.save();ctx.translate(x,y);
 if(e.name==='Ash Scorpion'){rect(-17,-8,34,15,'#927b59');rect(-13,-14,27,12,e.color);for(let k=0;k<3;k++){line(-12+k*9,-2,-23+k*12,11,'#c9b085',2);line(-12+k*9,-4,-24+k*12,-16,'#c9b085',2)}line(12,-9,25,-22,'#c8a981',3);line(25,-22,20,-36,'#c8a981',3);rect(16,-39,9,7,'#d9cfc0');rect(-28,-18,10,10,'#ac8f65');rect(-29,2,11,10,'#ac8f65');rect(-18,-9,3,3,'#ed806a')}
 else if(e.name==='Shard Sentinel'){rect(-12,-32,24,36,'#687d9b');rect(-19,-21,8,22,'#90a7c4');rect(12,-21,8,22,'#90a7c4');rect(-9,4,7,15,'#596881');rect(3,4,7,15,'#596881');rect(-9,-43,18,12,'#9caec2');rect(-7,-40,14,4,'#283650');ctx.fillStyle='#d4b5fb';ctx.beginPath();ctx.moveTo(0,-26);ctx.lineTo(7,-17);ctx.lineTo(0,-7);ctx.lineTo(-7,-17);ctx.closePath();ctx.fill();line(-20,-22,-23,-38,'#d1c5e9',3);line(20,-22,23,-38,'#d1c5e9',3)}
 else if(e.name==='Dusk Harpy'||e.name==='Gloom Bat'){const bat=e.name==='Gloom Bat',wing=Math.sin(state.time/150)*3;ctx.fillStyle=bat?'#696178':'#957095';ctx.beginPath();ctx.moveTo(-4,-21);ctx.lineTo(-34,-36-wing);ctx.lineTo(-27,-9);ctx.lineTo(-16,-16);ctx.lineTo(-5,-4);ctx.fill();ctx.beginPath();ctx.moveTo(4,-21);ctx.lineTo(34,-36-wing);ctx.lineTo(27,-9);ctx.lineTo(16,-16);ctx.lineTo(5,-4);ctx.fill();rect(-7,-27,14,27,e.color);rect(-6,-34,12,10,bat?'#92859e':'#d0aa98');rect(-5,-31,3,3,'#f4db8a');rect(2,-31,3,3,'#f4db8a');if(!bat){line(-4,0,-9,13,'#b5a46c',2);line(4,0,9,13,'#b5a46c',2)}}
 else if(e.name==='Ironhide Ogre'){rect(-18,-30,36,43,'#64785e');rect(-29,-27,12,33,'#849478');rect(18,-27,12,33,'#849478');rect(-12,-44,25,18,'#a0aa86');rect(-11,-34,4,7,'#e3d9bd');rect(8,-34,4,7,'#e3d9bd');rect(-12,-25,25,9,'#706b65');rect(-14,11,10,15,'#424d43');rect(5,11,10,15,'#424d43');line(29,-10,32,23,'#796953',4);rect(22,15,18,15,'#a09585')}
 else if(e.name==='Stone Beetle'){ctx.fillStyle=e.color;ctx.beginPath();ctx.ellipse(0,-8,19,14,0,0,Math.PI*2);ctx.fill();line(0,-20,0,6,'#555f55',3);for(let k=0;k<3;k++){line(-13,-14+k*9,-24,-19+k*14,'#bec6a0',2);line(13,-14+k*9,24,-19+k*14,'#bec6a0',2)}rect(-9,-26,18,8,'#738170');rect(-7,-25,3,2,'#e0c38c');rect(4,-25,3,2,'#e0c38c')}
 else if(e.name==='Ridge Viper'){ctx.strokeStyle=e.color;ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(20,7);ctx.bezierCurveTo(-32,20,14,-13,-14,-12);ctx.bezierCurveTo(-36,-12,-7,-26,-7,-33);ctx.stroke();rect(-13,-39,14,11,'#c1b685');rect(-11,-37,3,2,'#4d4832');line(-13,-34,-22,-30,'#dd8b7a',1)}
 else{const lizard=e.name==='Bog Lizard';rect(-18,-12,36,20,e.color);rect(-30,-15,17,17,lizard?'#73977d':'#a58d75');for(const xx of [-12,10])rect(xx,7,6,11,'#4b5141');rect(-31,-12,3,3,'#ead79b');if(lizard){line(15,1,35,11,'#769880',5);for(let k=0;k<4;k++)rect(-9+k*7,-17,4,7,'#b1ba87')}else{rect(-34,-2,5,9,'#e6d4ac');rect(-27,-2,5,9,'#e6d4ac');rect(-7,-18,19,8,'#796655')}}ctx.restore()
};

