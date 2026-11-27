'use strict';
// Each local script registers one encoded score. This also works when index.html
// is opened directly from disk, where fetching audio with XHR can be blocked.
const themeJobs=new Map(),themePayloads=new Map(),themeCache=new Map();
function registerGameTheme(key,encoded,loopSeconds){
 const entry={encoded,loopSeconds};
 themePayloads.set(key,entry);
 themeJobs.get(key)?.resolve(entry);
}
function preloadGameTheme(key){
 if(themePayloads.has(key))return Promise.resolve(themePayloads.get(key));
 if(themeJobs.has(key))return themeJobs.get(key).promise;
 const script=document.createElement('script'),job={};
 job.promise=new Promise((resolve,reject)=>Object.assign(job,{resolve,reject}));
 themeJobs.set(key,job);
 script.src='assets/audio/themes/'+key+'.js?v=finale-voyage-2';
 script.onerror=()=>job.reject(new Error('Cannot load '+key));
 script.onload=()=>{if(!themePayloads.has(key))job.reject(new Error('Missing score '+key))};
 document.head.append(script);
 job.promise.then(clean,clean);
 function clean(){themeJobs.delete(key);script.remove()}
 return job.promise;
}
function loadGameTheme(key){
 if(!themeCache.has(key)){
  const job=preloadGameTheme(key).then(async ({encoded,loopSeconds})=>{
   const bytes=Uint8Array.from(atob(encoded),c=>c.charCodeAt(0));
   return {buffer:await audio.ctx.decodeAudioData(bytes.buffer),loopSeconds};
  });
  themeCache.set(key,job);
  if(themeCache.size>3)themeCache.delete(themeCache.keys().next().value);
  job.catch(()=>{if(themeCache.get(key)===job)themeCache.delete(key)});
 }
 return themeCache.get(key);
}
const scoreDirector={
 requested:null,key:null,serial:0,active:null,nextCheck:0,
 session:null,scene:null,dialogueCue:null,positions:new Map()
};
const originalScore={start:startMusic,stop:stopMusic,update,syncTempo:syncMusicTempo,say};
function syncScoreScene(){
 const score=scoreDirector;
 if(score.session!==state.session){
  score.session=state.session;score.positions.clear();score.scene=null;score.key=null;score.serial++;
 }
 if(score.scene!==state.scene){
  score.scene=state.scene;score.dialogueCue=null;
 }
}
// A story cue belongs to the scene. Closing a dialogue, making a choice,
// or skipping text must not undo the cue or reopen its audio source.
say=function(lines){
 syncScoreScene();
 const speakers=new Set(lines.map(line=>line.speaker));
 if(state.scene==='manor'&&speakers.has('Venom'))scoreDirector.dialogueCue='pursuit';
 if(state.scene==='village'){
  if(speakers.has('Shadow')&&speakers.has('Astro'))scoreDirector.dialogueCue='shadows';
  else if(speakers.has('Elder Aziz'))scoreDirector.dialogueCue='vigil';
 }
 return originalScore.say(lines);
};
function isRecurringBattle(b){
 return b?.kind==='random'||b?.scenario==='world';
}
function battleTheme(b){
 return isRecurringBattle(b)?'skirmish':'boss-battle';
}
function contextualTheme(request){
 const b=state.battle,scene=state.scene;
 if(state.mode==='cutscene'&&state.innRestSession===state.session)return 'inn-rest';
 // Victory dialogue is still part of a recurring encounter until the map returns.
 if(isRecurringBattle(b)&&state.mode!=='map')return battleTheme(b);
 if(state.mode==='battle'||state.mode==='battleBusy'||(state.mode==='stats'&&state.statsReturn==='battle')||request==='battle'&&!b&&state.mode==='cutscene'){
  return battleTheme(b);
 }
 if(['throne','raymond_private','finale_council'].includes(scene))return 'sanctum';
 if(scene==='village'&&state.burning&&request==='tension')return 'pursuit';
 if(['finale_voyage','finale_gate','finale_fortress'].includes(scene)||scene==='rally'&&state.finalePlaying)return 'voyage';
 if(scoreDirector.dialogueCue)return scoreDirector.dialogueCue;
 if(scene==='harbor')return 'harbor';
 if(scene==='sacrifice'||state.nightActive)return 'vigil';
 if(request==='tension'||request==='panic')return 'pursuit';
 if(scene==='shrine')return 'starlight';
 if(scene==='forest')return 'mist';
 if(['rally','world','pass','trainingYard'].includes(scene))return 'trail';
 // Town buildings share the outdoor exploration track across doorways.
 return 'hearth';
}
function themePosition(active,now){
 const elapsed=(now-active.startedAt)*active.rate+active.offset;
 const length=active.source.loopEnd-active.source.loopStart;
 return elapsed%length;
}
function fadeGameTheme(){
 const active=scoreDirector.active;if(!active)return;
 scoreDirector.active=null;
 const {key,source,gain,session}=active,now=audio.ctx.currentTime;
 if(session===state.session)scoreDirector.positions.set(key,themePosition(active,now));
 if(gain.gain.cancelAndHoldAtTime)gain.gain.cancelAndHoldAtTime(now);
 else{
  const level=gain.gain.value;
  gain.gain.cancelScheduledValues(now);gain.gain.setValueAtTime(level,now);
 }
 gain.gain.linearRampToValueAtTime(0,now+.65);source.stop(now+.67);
}
async function reconcileScore(){
 const d=scoreDirector;
 if(!d.requested||!audio.on||state.mode==='title')return;
 syncScoreScene();
 const key=contextualTheme(d.requested);
 const isBattle=key==='skirmish'||key==='boss-battle';
 const encounter=isBattle?state.battle:null;
 if(key===d.key&&encounter===d.encounter)return;
 const serial=++d.serial,session=state.session;d.key=key;d.encounter=encounter;
 if(d.active?.key===key&&d.active.session===session&&d.active.encounter===encounter)return;
 try{
  if(!await unlockAudio()||serial!==d.serial){if(serial===d.serial)d.key=null;return}
  const entry=key==='sanctum'?{buffer:await decodeFinaleAudio('sanctum',audio.ctx)}:await loadGameTheme(key);
  if(serial!==d.serial||!audio.on||session!==state.session)return;
  if(!entry.buffer)throw Error('Cannot decode '+key);
  if(contextualTheme(d.requested)!==key||(isBattle&&state.battle!==encounter)){d.key=null;return reconcileScore()}
  originalScore.stop();fadeGameTheme();
  const ac=audio.ctx,now=ac.currentTime,source=ac.createBufferSource(),gain=ac.createGain();
  source.buffer=entry.buffer;source.loop=key!=='inn-rest';
  // The original throne recording uses its original trim and level.
  source.loopStart=entry.loopSeconds?Math.min(.0345,Math.max(0,source.buffer.duration-entry.loopSeconds)):0;
  source.loopEnd=entry.loopSeconds?Math.min(source.buffer.duration,entry.loopSeconds+source.loopStart):source.buffer.duration;
  const offset=isBattle||key==='inn-rest'||key==='voyage'?0:(d.positions.get(key)||0)%(source.loopEnd-source.loopStart);
  source.playbackRate.value=musicTempoRate;gain.gain.setValueAtTime(0,now);
  gain.gain.linearRampToValueAtTime(key==='sanctum'?1.12:.83,now+.65);
  source.connect(gain);gain.connect(audio.musicGain);source.onended=()=>{source.disconnect();gain.disconnect()};
  source.start(now,source.loopStart+offset);
  d.active={key,encounter,source,gain,session,offset,startedAt:now,rate:musicTempoRate};
 }catch(err){
  if(serial!==d.serial||session!==state.session)return;
  console.warn('Soundtrack unavailable',key,err);fadeGameTheme();
  await originalScore.start(key==='sanctum'?'sanctum':d.requested);
 }
}
startMusic=function(mode){scoreDirector.requested=mode;audio.mode=mode;return reconcileScore()};
stopMusic=function(){scoreDirector.requested=null;scoreDirector.key=null;scoreDirector.serial++;fadeGameTheme();originalScore.stop()};
syncMusicTempo=function(rate){
 if(rate===musicTempoRate)return;
 originalScore.syncTempo(rate);
 const active=scoreDirector.active;if(!active)return;
 const now=audio.ctx.currentTime;
 active.offset=themePosition(active,now);active.startedAt=now;active.rate=rate;
 active.source.playbackRate.setValueAtTime(rate,now);
};
let stepActor=null,stepDistance=0;
function mapFootstep(){
 const p=state.player;if(state.mode!=='map'||!p||!audio.on||audio.ctx?.state!=='running'){stepActor=null;return}
 if(p!==stepActor){stepActor=p;stepDistance=p.walkDistance||0;return}
 if((p.walkDistance||0)-stepDistance<16)return;
 stepDistance=p.walkDistance;
 const stone=['town','bellhaven','harbor','shrine','pass'].includes(state.scene);
 impactNoise(.045,stone?.067:.042,stone?940:460);tone(stone?92:73,.055,'sine',.043,audio.sfxGain);
}
update=function(){
 originalScore.update();mapFootstep();
 const now=performance.now();if(now<scoreDirector.nextCheck)return;
 scoreDirector.nextCheck=now+180;void reconcileScore();
};
function cueNotes(notes,gap,length,instrument,level){
 if(!audio.on||audio.ctx?.state!=='running')return;
 notes.forEach((hz,i)=>tone(hz,length,instrument,level,audio.sfxGain,i*gap));
}
function tradeChime(sale){cueNotes(sale?[988,740,880]:[660,880,1109],.055,.14,'sine',.14)}
const originalVictory=winEncounter,originalDefeat=loseEncounter;
winEncounter=function(){cueNotes([392,494,587,784],.095,.34,'triangle',.23);return originalVictory()};
loseEncounter=function(){cueNotes([220,196,165,110],.18,.51,'triangle',.17);return originalDefeat()};
