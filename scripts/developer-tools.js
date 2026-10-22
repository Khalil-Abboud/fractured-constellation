'use strict';
// Password-protected development tools and input protection.
// Development destinations alter story flags, never earned character progression.
let developmentRoster={};
function developmentHeroes(names){return names.map(name=>developmentRoster[name]?copy(developmentRoster[name]):newHero(name))}
const stableLevelJump=developmentJump,stableLevelReset=reset;
developmentJump=function(stage){if(!DEV_STAGES.some(group=>group.points.some(([id])=>id===stage)))return;for(const h of state.party||[])developmentRoster[h.name]=copy(h);stableLevelJump(stage)};
reset=function(){developmentRoster={};stableLevelReset()};

const campStockPrevious=stockedGearIds,campLanguagePrevious=applyLanguage,campShopPrevious=openScoutShop;
stockedGearIds=function(){return state.scene==='forest'?campStockPrevious().filter(id=>GEAR[id].price<=35):campStockPrevious()};
applyLanguage=function(){campLanguagePrevious();$('scout-blue').textContent=tr('Blue herb · 25 gold','عشبة زرقاء · 25 ذهبًا');$('scout-gear').textContent=tr('Camp weapons and armor','أسلحة ودروع المعسكر')};
openScoutShop=function(){campShopPrevious();$('scout-blue').disabled=state.gold<25};
$('scout-blue').addEventListener('click',()=>{if(state.mode!=='shop')return;if(state.gold<25){$('shop-message').textContent=tr('Not enough gold.','لا يوجد ذهب كافٍ.');return}state.gold-=25;state.blueHerbs++;battleSfx('shield');openScoutShop();$('shop-message').textContent=tr('A blue herb was added to the shared pack. Restores 30 mana.','أُضيفت عشبة زرقاء إلى حقيبة الفريق. تستعيد 30 مانا.')});
$('scout-gear').addEventListener('click',()=>{if(state.mode!=='shop')return;closeScoutShop();openMarket('gear');$('market-title').textContent=tr('Scout · Camp equipment','الكشاف · تجهيزات المعسكر')});
$('stats-button').addEventListener('click',showStats);$('stats-close').addEventListener('click',closeStats);
// Use physical keys so Z/X/F work with Arabic, Russian and Caps Lock layouts.
function gameControlKey(e){
 const physical={KeyZ:'z',KeyX:'x',KeyF:'f'}[e.code];
 return physical||(typeof e.key==='string'?(e.key.length===1?e.key.toLowerCase():e.key):'');
}
function editingGameInput(e){return ['INPUT','SELECT','TEXTAREA'].includes(e.target?.tagName)||!!e.target?.isContentEditable}
document.addEventListener('keydown',e=>{if(editingGameInput(e)||e.ctrlKey||e.altKey||e.metaKey)return;const k=gameControlKey(e);if(k==='f'&&state.mode==='battle'){e.preventDefault();holdBattleFastKey();return}if(state.mode==='battle'&&state.battle?.auto&&['z','x','Escape','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(k)){e.preventDefault();stopAutoBattle();return}if(k==='x'||k==='Escape'){e.preventDefault();if(k==='x'&&state.mode==='map')state.keys.x=true;if(!e.repeat)pressB();return}if(['stats','shop','market','dev'].includes(state.mode))return;if(k==='z'){e.preventDefault();if(!e.repeat)pressA();return}if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(k)){e.preventDefault();if(state.mode==='map')state.keys[k]=true;else if(state.mode==='battle'&&!state.battle?.busy)navigateBattle(k);else if(state.mode==='choice'&&!state.choiceLocked&&state.choiceOptions.length){const delta=['ArrowUp','ArrowLeft'].includes(k)?-1:1;state.choiceSelected=(state.choiceSelected+delta+state.choiceOptions.length)%state.choiceOptions.length;renderDialogueChoices()}}});document.addEventListener('keyup',e=>{const k=gameControlKey(e);state.keys[k]=false;if(k==='f')releaseBattleFastKey()});
const joystick={pointerId:null,x:0,y:0};
function movementVector(){if(joystick.pointerId!==null)return{x:joystick.x,y:joystick.y};let x=(state.keys.ArrowRight||state.keys.d?1:0)-(state.keys.ArrowLeft||state.keys.a?1:0),y=(state.keys.ArrowDown||state.keys.s?1:0)-(state.keys.ArrowUp||state.keys.w?1:0);const length=Math.hypot(x,y);return length?{x:x/length,y:y/length}:{x:0,y:0}}
function resetJoystick(){const id=joystick.pointerId;joystick.pointerId=null;joystick.x=0;joystick.y=0;$('joystick-knob').style.transform='translate(-50%,-50%)';$('joystick').classList.remove('active');if(id!==null)try{$('joystick').releasePointerCapture?.(id)}catch(_){}}
function moveJoystick(e){if(e.pointerId!==joystick.pointerId)return;if(state.mode!=='map'){resetJoystick();return}if(e.cancelable)e.preventDefault();const box=$('joystick').getBoundingClientRect(),radius=box.width*.32,dx=e.clientX-(box.left+box.width/2),dy=e.clientY-(box.top+box.height/2),distance=Math.hypot(dx,dy),travel=Math.min(radius,distance),nx=distance?dx/distance:0,ny=distance?dy/distance:0,strength=Math.max(0,(travel/radius-.12)/.88);joystick.x=nx*strength;joystick.y=ny*strength;$('joystick-knob').style.transform='translate(-50%,-50%) translate('+nx*travel+'px,'+ny*travel+'px)'}
$('joystick').addEventListener('pointerdown',e=>{if(state.mode!=='map'||joystick.pointerId!==null||(e.pointerType==='mouse'&&e.button!==0))return;e.preventDefault();window.getSelection?.()?.removeAllRanges();joystick.pointerId=e.pointerId;$('joystick').classList.add('active');try{$('joystick').setPointerCapture?.(e.pointerId)}catch(_){}moveJoystick(e)});
$('joystick').addEventListener('pointermove',moveJoystick);
function endJoystick(e){if(e.pointerId!==joystick.pointerId)return;if(e.cancelable)e.preventDefault();resetJoystick()}
for(const event of ['pointerup','pointercancel','lostpointercapture'])$('joystick').addEventListener(event,endJoystick);
document.addEventListener('pointerup',endJoystick);document.addEventListener('pointercancel',endJoystick);
for(const event of ['contextmenu','selectstart','dragstart'])$('game').addEventListener(event,e=>e.preventDefault());
function clearMovement(){state.keys={};resetJoystick()}
window.addEventListener?.('blur',clearMovement);document.addEventListener('visibilitychange',()=>{if(document.hidden)clearMovement()});
// This gate keeps development shortcuts out of normal play; it is checked at every opening.
const DEV_PASSWORD_HASH='028f9ee74e7e2480326ecd1f51a75195a6a77f72546c524680d36ffec0550f65';
async function devPasswordHash(value){
 const data=new TextEncoder().encode(value),digest=await crypto.subtle.digest('SHA-256',data);
 return [...new Uint8Array(digest)].map(byte=>byte.toString(16).padStart(2,'0')).join('')
}
const devAccessPrevious={openDev,pressB,applyLanguage,reset,abortCurrentFlow};
function translateDevAccess(){
 $('dev-button').textContent='⚙';$('dev-button').title=tr('Development tools','أدوات التطوير');$('dev-button').setAttribute?.('aria-label',tr('Development tools','أدوات التطوير'));
 $('dev-auth-title').textContent=tr('Prove you’re Khalil','أثبت أنك خليل');$('dev-password-label').textContent=tr('Password','كلمة المرور');$('dev-auth-confirm').textContent=tr('Unlock','فتح');$('dev-auth-cancel').textContent=tr('Cancel','إلغاء');
 $('dev-password').placeholder=tr('Enter password','أدخل كلمة المرور');
 if($('dev-auth-error').textContent)$('dev-auth-error').textContent=tr('Incorrect password. Try again.','كلمة المرور غير صحيحة. حاول مجددًا.')
}
openDev=function(){
 if(['cutscene','dev','devAuth'].includes(state.mode)||state.battle?.busy)return;
 if(state.battle?.auto)stopAutoBattle();
 state.devAuthReturn=state.mode;state.mode='devAuth';clearMovement();clearBButton();
 $('dev-password').value='';$('dev-auth-error').textContent='';translateDevAccess();$('dev-auth-screen').classList.remove('hidden');$('dev-password').focus?.()
};
function closeDevAccess(){
 $('dev-auth-screen').classList.add('hidden');$('dev-password').value='';$('dev-auth-error').textContent='';
 if(state.mode==='devAuth')state.mode=state.devAuthReturn;state.devAuthReturn=null;state.keys={};$('dev-button').focus?.()
}
async function submitDevPassword(){
 if(state.mode!=='devAuth')return;
 const normalized=String($('dev-password').value||'').trim().replace(/[٠-٩]/g,n=>String(n.charCodeAt(0)-1632)).replace(/[۰-۹]/g,n=>String(n.charCodeAt(0)-1776));
 if(await devPasswordHash(normalized)!==DEV_PASSWORD_HASH){$('dev-auth-error').textContent=tr('Incorrect password. Try again.','كلمة المرور غير صحيحة. حاول مجددًا.');$('dev-password').value='';$('dev-password').focus?.();return}
 closeDevAccess();devAccessPrevious.openDev();$('skip-text').disabled=state.devReturn!=='dialogue';$('dev-close').focus?.()
}
pressB=function(){if(state.mode==='devAuth'){closeDevAccess();return}devAccessPrevious.pressB()};
applyLanguage=function(){devAccessPrevious.applyLanguage();translateDevAccess()};
reset=function(){devAccessPrevious.reset();$('dev-auth-screen').classList.add('hidden');$('dev-password').value='';$('dev-auth-error').textContent='';state.devAuthReturn=null;translateDevAccess()};
abortCurrentFlow=function(){$('dev-auth-screen').classList.add('hidden');state.devAuthReturn=null;devAccessPrevious.abortCurrentFlow()};
$('dev-auth-form').addEventListener('submit',e=>{e.preventDefault();submitDevPassword()});
$('dev-auth-cancel').addEventListener('click',closeDevAccess);
$('dev-password').addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation?.();closeDevAccess()}});

// One physical press of A is one action, even if its controls disappear under the finger.
const actionPresses=new Map();
let lastActionPress=null;
function actionPointerKey(e){return e.pointerId??'compatibility'}
function beginActionPress(e){
 if(e.pointerType==='mouse'&&e.button!==0)return;
 if(e.cancelable)e.preventDefault();
 const key=actionPointerKey(e),record={key,session:state.session,releasedAt:null};
 actionPresses.set(key,record);lastActionPress=record;
 // The game remains visible when the A button hides; its release must not hit the dialogue.
 try{$('game').setPointerCapture?.(e.pointerId)}catch(_){}
 pressA()
}
function endActionPress(e){
 const key=actionPointerKey(e),record=actionPresses.get(key);if(!record)return;
 if(e.type==='pointercancel'){actionPresses.delete(key);if(lastActionPress===record)lastActionPress=null}
 else record.releasedAt=performance.now();
 try{$('game').releasePointerCapture?.(e.pointerId)}catch(_){}
}
function consumeActionClick(e){
 const record=e.pointerId!==undefined?actionPresses.get(actionPointerKey(e)):lastActionPress;
 if(!record||record.session!==state.session)return false;
 // A fresh pointerdown clears the previous release, so a deliberate second tap is never delayed.
 if(record.releasedAt!==null&&performance.now()-record.releasedAt>600){actionPresses.delete(record.key);if(lastActionPress===record)lastActionPress=null;return false}
 actionPresses.delete(record.key);if(lastActionPress===record)lastActionPress=null;
 e.preventDefault?.();e.stopImmediatePropagation?.();e.stopPropagation?.();return true
}
document.addEventListener('pointerdown',e=>{
 for(const [id,press]of actionPresses)if(press.session!==state.session||press.releasedAt!==null&&performance.now()-press.releasedAt>600)actionPresses.delete(id);
 const key=actionPointerKey(e),record=actionPresses.get(key);
 if(record&&record.releasedAt!==null){actionPresses.delete(key);if(lastActionPress===record)lastActionPress=null}
 // Older touch browsers emit MouseEvent clicks with no pointerId.
 if(lastActionPress&&lastActionPress.releasedAt!==null)lastActionPress=null
},true);
document.addEventListener('pointerup',endActionPress,true);
document.addEventListener('pointercancel',endActionPress,true);
document.addEventListener('click',consumeActionClick,true);
document.addEventListener('keydown',()=>{lastActionPress=null},true);
window.addEventListener?.('blur',()=>{actionPresses.clear();lastActionPress=null});

// Scale desktop menus from their play area; phone layouts retain their sizing.
(()=>{
 const game=$('game'),viewport=$('viewport');
 function resizeReadableUI(){
  const bounds=viewport.getBoundingClientRect();
  const desktop=bounds.width>=900&&bounds.height>=480;
  const scale=desktop?Math.max(1,Math.min(2.25,bounds.width/800,bounds.height/450)):1;
  game.classList.toggle('desktop-ui',desktop);
  game.style.setProperty?.('--ui-unit',scale.toFixed(4)+'px');
 }
 if(typeof ResizeObserver!=='undefined'){
  const observer=new ResizeObserver(resizeReadableUI);observer.observe(viewport);
 }
 window.addEventListener?.('resize',resizeReadableUI);
 document.addEventListener('fullscreenchange',resizeReadableUI);
 resizeReadableUI();
})();
