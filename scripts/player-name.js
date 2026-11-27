'use strict';

function playerNamedText(text){
 if(!state.playerName||typeof text!=='string')return text;
 return text.replace(/\b(?:Shadow|SHADOW)\b(?! Slash)|شادو/gu,()=>state.playerName);
}

function nameKey(name){
 return name.normalize('NFKD').replace(/\p{M}|ـ/gu,'').replace(/[أإآٱ]/g,'ا')
  .replace(/ى/g,'ي').replace(/ة/g,'ه').replace(/\s+/gu,'').toLowerCase();
}
function reservedPlayerNames(){
 const names=new Set();
 for(const [english,arabic] of Object.entries({...AR_SPEAKER,...speakerArabic,...HERO_AR})){
  if(english==='Shadow')continue;
  for(const label of [english,arabic]){
   names.add(nameKey(label));
   names.add(nameKey(label.split(' ').pop()));
  }
 }
 for(const alias of ['استرو','أسترو','اتروكس','آتروكس','ترمه','اوتروكس','أورين','رايمند','رايموند','روان','Legionnaire','Varek','فاريك']){
  names.add(nameKey(alias));
 }
 return names;
}
function playerNameIssue(name,lang){
 const valid=lang==='ar'
  ? /^(?:\p{L}\p{M}*)+(?: (?:\p{L}\p{M}*)+)*$/u.test(name)&&[...name].every(c=>c===' '||/\p{Script_Extensions=Arabic}/u.test(c))
  : /^[a-z]+(?: [a-z]+)*$/i.test(name);
 if(!valid||name.includes('ـ'))return 'script';
 if(reservedPlayerNames().has(nameKey(name)))return 'reserved';
 return '';
}
function promptPlayerName(){
 if(state.mode!=='title'||$('player-name-dialog').open)return;
 const dialog=$('player-name-dialog'),input=$('player-name-input');
 const ar=state.lang==='ar';
 dialog.dir=ar?'rtl':'ltr';
 $('player-name-label').textContent=tr('Choose your name','اختر اسمك');
 $('player-name-help').textContent=tr('Enter your name in English.','اكتب اسمك بالحروف العربية.');
 $('player-name-confirm').textContent=tr('Start game','ابدأ اللعبة');
 $('player-name-cancel').textContent=tr('Back','رجوع');
 const error=$('player-name-error');
 error.textContent='';input.value='';input.removeAttribute('aria-invalid');
 input.oninput=()=>{error.textContent='';input.removeAttribute('aria-invalid')};
 $('player-name-cancel').onclick=()=>dialog.close();
 $('player-name-form').onsubmit=event=>{
  event.preventDefault();
  const name=input.value.trim().replace(/ +/g,' ').normalize('NFC');
  const issue=playerNameIssue(name,state.lang);
  if(issue){
   error.textContent=issue==='reserved'?tr('A character already uses that name.','هذا الاسم مستخدم لشخصية في اللعبة.'):tr('Use English letters and spaces only.','استخدم الحروف العربية والمسافات فقط.');
   input.setAttribute('aria-invalid','true');input.focus();return;
  }
  state.playerName=name;dialog.close();startGame();
 };
 dialog.showModal();input.focus();
}
