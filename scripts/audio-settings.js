'use strict';
// Global game volume settings for music and sound effects.
// One master level for all music and effects, including dialogue and the legion shout.
const MUSIC_SETTINGS_KEY='fractured_music_preferences_v1';
let musicVolume=100;
try{
 const saved=JSON.parse(localStorage.getItem(MUSIC_SETTINGS_KEY)||'null');
 if(saved&&Number.isFinite(saved.volume))musicVolume=Math.max(0,Math.min(100,saved.volume));
 if(saved&&typeof saved.muted==='boolean')audio.on=!saved.muted;
}catch(_){}
function saveMusicSettings(){try{localStorage.setItem(MUSIC_SETTINGS_KEY,JSON.stringify({volume:musicVolume,muted:!audio.on}))}catch(_){}}
function syncMusicVolume(){
 const gain=audio.masterGain?.gain;if(!gain)return;
 const level=audio.on?musicVolume/100:0;
 gain.cancelScheduledValues?.(audio.ctx.currentTime);
 if(gain.setTargetAtTime)gain.setTargetAtTime(level,audio.ctx.currentTime,.035);
 else gain.value=level;
}
function renderMusicSettings(){
 $('music-toggle').textContent=audio.on?tr('Sound: '+Math.round(musicVolume)+'%','الصوت: '+Math.round(musicVolume)+'٪'):tr('Sound: Muted','الصوت: مكتوم');
 $('music-toggle').title=tr('Adjust game volume','ضبط صوت اللعبة');
 $('music-settings-title').textContent=tr('Game volume','صوت اللعبة');
 $('music-volume-label').textContent=tr('Volume','مستوى الصوت');
 $('music-volume-value').textContent=Math.round(musicVolume)+tr('%','٪');
 $('music-volume').value=String(musicVolume);
 $('music-volume').setAttribute?.('aria-valuetext',Math.round(musicVolume)+tr(' percent',' بالمئة'));
 $('music-mute').textContent=audio.on?tr('Mute sound','كتم الصوت'):tr('Unmute sound','تشغيل الصوت');
 $('music-mute').setAttribute?.('aria-pressed',String(!audio.on));
 $('music-settings-close').setAttribute?.('aria-label',tr('Close sound settings','إغلاق إعدادات الصوت'));
}
function setMusicVolume(value){
 const number=Number(value);if(!Number.isFinite(number))return;
 musicVolume=Math.max(0,Math.min(100,number));syncMusicVolume();saveMusicSettings();renderMusicSettings();
}
function closeMusicSettings(){
 $('music-panel').classList.add('hidden');$('music-toggle').setAttribute?.('aria-expanded','false');
}
function openMusicSettings(){
 if(!$('music-panel').classList.contains('hidden')){closeMusicSettings();return}
 state.keys={};resetJoystick();renderMusicSettings();$('music-panel').style.top=(($('topbar').offsetHeight||50)+8)+'px';$('music-panel').classList.remove('hidden');
 $('music-toggle').setAttribute?.('aria-expanded','true');$('music-volume').focus?.();
}
const musicVolumePrevious={initAudio,toggleMusic,applyLanguage,reset,abortCurrentFlow};
initAudio=function(){const context=musicVolumePrevious.initAudio();syncMusicVolume();return context};
toggleMusic=async function(){await musicVolumePrevious.toggleMusic();syncMusicVolume();saveMusicSettings();renderMusicSettings()};
applyLanguage=function(){musicVolumePrevious.applyLanguage();renderMusicSettings()};
reset=function(){closeMusicSettings();musicVolumePrevious.reset();syncMusicVolume();renderMusicSettings()};
abortCurrentFlow=function(){closeMusicSettings();musicVolumePrevious.abortCurrentFlow()};
$('music-volume').addEventListener('input',e=>setMusicVolume(e.target.value));
$('music-mute').addEventListener('click',()=>toggleMusic());
$('music-settings-close').addEventListener('click',closeMusicSettings);
$('music-panel').addEventListener('keydown',e=>{
 e.stopPropagation();
 if(['Escape','x','z'].includes(gameControlKey(e))){e.preventDefault();closeMusicSettings();$('music-toggle').focus?.()}
});
document.addEventListener('pointerdown',e=>{
 if(!$('music-panel').classList.contains('hidden')&&!e.target?.closest?.('#music-panel, #music-toggle'))closeMusicSettings();
});
