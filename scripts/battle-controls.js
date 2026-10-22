'use strict';
// Automatic battle, fast playback, defeat recovery, and combat controls.
// AUTO issues ordinary attacks through the same turn resolver used by manual play.
const BATTLE_FAST_RATE=3;
let battleFastKey=false;
let musicTempoRate=1;
let battleFastPointer=null,battleFastBattle=null;
const battleTimeline={battle:null,session:null,last:0,time:0};
function battlePlaybackRate(){return state.mode==='battle'&&state.battle&&(battleFastPointer!==null||battleFastKey)&&battleFastBattle===state.battle?BATTLE_FAST_RATE:1}
function battleNow(){
 const real=performance.now(),b=state.battle;
 if(battleTimeline.battle!==b||battleTimeline.session!==state.session){Object.assign(battleTimeline,{battle:b,session:state.session,last:real,time:real})}
 else{battleTimeline.time+=Math.max(0,real-battleTimeline.last)*battlePlaybackRate();battleTimeline.last=real}
 return battleTimeline.time
}
// Poll the remaining game time, so pressing or releasing Fast affects a delay already underway.
battleDelay=function(callback,ms){
 const battle=state.battle,token=state.session,due=battleNow()+Math.max(0,ms);
 function step(){
  if(token!==state.session||state.battle!==battle||state.mode==='title')return;
  const left=due-battleNow();if(left<=.01){callback();return}
  setTimeout(step,Math.min(32,left/battlePlaybackRate()))
 }
 setTimeout(step,Math.min(32,Math.max(0,ms)/battlePlaybackRate()))
};
function syncMusicTempo(rate){
 if(rate===musicTempoRate)return;musicTempoRate=rate;
 if(audio.scoreSource?.playbackRate)audio.scoreSource.playbackRate.setValueAtTime?.(rate,audio.ctx.currentTime);
 if(audio.timer){clearInterval(audio.timer);const base=audio.mode==='battle'?230:audio.mode==='tension'?340:audio.scoreSource?400:audio.mode==='village'?470:audio.mode==='sanctum'?650:audio.mode==='panic'?350:300;audio.timer=setInterval(musicStep,base/rate)}
}
function holdBattleFastKey(){
 if(state.mode!=='battle'||!state.battle||battleFastKey)return;battleNow();battleFastKey=true;battleFastBattle=state.battle;syncBattlePlayback()
}
function releaseBattleFastKey(){
 if(!battleFastKey)return;battleNow();battleFastKey=false;if(battleFastPointer===null)battleFastBattle=null;syncBattlePlayback()
}
function releaseBattleFast(){
 battleNow();const id=battleFastPointer;battleFastPointer=null;battleFastKey=false;battleFastBattle=null;
 const button=$('battle-fast');button.classList.remove('held');
 if(id!==null)try{button.releasePointerCapture?.(id)}catch(_){}
 syncBattlePlayback()
}
function syncBattlePlayback(){
 const b=state.battle,active=state.mode==='battle'&&!!b,fast=active&&(battleFastPointer!==null||battleFastKey)&&battleFastBattle===b;
 $('battle-fast').classList.toggle('held',!!fast);$('battle-playback').classList.toggle('hidden',!active);$('battle-auto-status').classList.toggle('hidden',!active||!b.auto);
 const status=tr('AUTO · ATTACKS ONLY','تلقائي · هجوم فقط');if($('battle-auto-status').textContent!==status)$('battle-auto-status').textContent=status;
 $('battle-auto-status').title=tr('Z / X / arrows or click empty space to stop.','Z / X / الأسهم أو النقر على مساحة فارغة للإيقاف.');
 const speedLabel=fast?'⏩ ×3':tr('HOLD ⏩ ×3','اضغط مطولًا ×3');if($('battle-fast').textContent!==speedLabel)$('battle-fast').textContent=speedLabel;
 $('battle-fast').title=tr('Hold the button or F: battle ×3, music ×2. Release for normal speed.','اضغط مطولًا على الزر أو F: القتال ×3 والموسيقى ×2. ارفع إصبعك للسرعة العادية.');
 $('battle-fast').setAttribute?.('aria-label',tr('Hold the button or F for three times battle speed','اضغط باستمرار على الزر أو F لتسريع القتال ثلاث مرات'));
 $('battle-fast').setAttribute?.('aria-pressed',String(!!fast));syncMusicTempo(fast?2:1)
}
function stopAutoBattle(refresh=true){
 const b=state.battle;if(b){b.auto=false;b.autoWait=false;b.autoEpoch=(b.autoEpoch||0)+1;b.keyboardTarget=null;state.battleMenu='main';state.selected=0}
 releaseBattleFast();if(refresh&&state.mode==='battle'&&b)renderCommands()
}
function clearBattlePlayback(){stopAutoBattle(false)}
function scheduleAutoAttack(){
 const b=state.battle;if(state.mode!=='battle'||!b?.auto||b.busy||b.autoWait)return;
 const epoch=b.autoEpoch;b.autoWait=true;
 battleDelay(()=>{
  if(b.autoEpoch!==epoch)return;b.autoWait=false;
  if(!b.auto||b.busy||state.mode!=='battle')return;
  if(b.kind){
   if(b.enemies.every(e=>e.hp<=0)){winEncounter();return}
   if(state.party.every(h=>h.hp<=0)){loseEncounter();return}
   if(!b.enemies[state.target]||b.enemies[state.target].hp<=0)state.target=b.enemies.findIndex(e=>e.hp>0)
  }
  b.autoExecuting=true;try{chooseCommand('attack')}finally{b.autoExecuting=false}
 },140)
}
const playbackPrevious={chooseCommand,renderCommands,drawBattle,applyLanguage,update,winEncounter,loseEncounter,finishBattle,abortCurrentFlow,reset,showStats,openDev};
chooseCommand=function(action){
 const b=state.battle;if(!b||state.mode!=='battle')return;
 if(action==='auto'){
  if(b.auto){stopAutoBattle();return}if(b.busy)return;
  b.auto=true;b.autoEpoch=(b.autoEpoch||0)+1;b.autoWait=false;b.keyboardTarget=null;state.battleMenu='main';state.selected=4;battleSfx('menu');renderCommands();return
 }
 if(b.auto&&!b.autoExecuting)stopAutoBattle(false);
 playbackPrevious.chooseCommand(action)
};
renderCommands=function(){
 const b=state.battle;if(b?.auto)state.selected=4;playbackPrevious.renderCommands();if(!b)return;
 for(const button of Array.from(ui.commands.children)){
  const auto=button.dataset.action==='auto';button.classList.toggle('auto-active',!!b.auto&&auto);
  if(b.auto)button.disabled=!auto;
  if(auto){button.title=tr('Normal attacks for the entire party until battle ends. Z / X / arrows or tap empty space to stop.','هجمات عادية لكل الفريق حتى تنتهي المعركة. Z / X / الأسهم أو النقر على مساحة فارغة للإيقاف.');button.setAttribute?.('aria-pressed',String(!!b.auto))}
 }
 syncBattlePlayback();scheduleAutoAttack()
};
drawBattle=function(){const real=state.time;state.time=battleNow();try{playbackPrevious.drawBattle()}finally{state.time=real}};
applyLanguage=function(){playbackPrevious.applyLanguage();syncBattlePlayback()};
update=function(){playbackPrevious.update();syncBattlePlayback()};
winEncounter=async function(){clearBattlePlayback();await playbackPrevious.winEncounter()};
loseEncounter=async function(){clearBattlePlayback();await playbackPrevious.loseEncounter()};
finishBattle=async function(){clearBattlePlayback();await playbackPrevious.finishBattle()};
abortCurrentFlow=function(){clearBattlePlayback();playbackPrevious.abortCurrentFlow()};
reset=function(){clearBattlePlayback();playbackPrevious.reset();syncBattlePlayback()};
showStats=function(){if(state.battle?.auto)stopAutoBattle();playbackPrevious.showStats()};
openDev=function(){if(state.battle?.auto)stopAutoBattle();playbackPrevious.openDev()};
$('battle-fast').addEventListener('pointerdown',e=>{
 if(state.mode!=='battle'||!state.battle||battleFastPointer!==null||(e.pointerType==='mouse'&&e.button!==0))return;
 if(e.cancelable)e.preventDefault();battleNow();battleFastPointer=e.pointerId;battleFastBattle=state.battle;
 try{$('battle-fast').setPointerCapture?.(e.pointerId)}catch(_){}
 $('battle-fast').classList.add('held');syncBattlePlayback()
});
function endBattleFast(e){if(e.pointerId!==battleFastPointer)return;if(e.cancelable)e.preventDefault();battleNow();battleFastPointer=null;if(!battleFastKey)battleFastBattle=null;syncBattlePlayback()}
for(const type of ['pointerup','pointercancel','lostpointercapture'])$('battle-fast').addEventListener(type,endBattleFast);
$('battle-fast').addEventListener('click',e=>e.preventDefault());
document.addEventListener('pointerup',endBattleFast);document.addEventListener('pointercancel',endBattleFast);
function battleButtonTarget(target){
 if(target?.closest)return !!target.closest('button,input,select,textarea,a,[role="button"]');
 for(let node=target;node;node=node.parentElement||node.parentNode||node.parent){if(['BUTTON','INPUT','SELECT','TEXTAREA','A'].includes(String(node.tagName||node.tag||'').toUpperCase()))return true}
 return false
}
function cancelAutoFromEmptySpace(e){if(state.mode==='battle'&&state.battle?.auto&&!battleButtonTarget(e.target))stopAutoBattle()}
document.addEventListener('pointerdown',cancelAutoFromEmptySpace);document.addEventListener('click',cancelAutoFromEmptySpace);
window.addEventListener?.('blur',clearBattlePlayback);document.addEventListener('visibilitychange',()=>{if(document.hidden)clearBattlePlayback()});
