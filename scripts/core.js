'use strict';
// Core state, translations, prologue, rendering, and original Elaris chapter.
const canvas=document.getElementById('canvas'),ctx=canvas.getContext('2d');
function loadBattleArt(path){const image=typeof Image==='undefined'?null:new Image();if(image)image.src=path;return image}
function loadHeroBattleArt(name){
 return Object.fromEntries((name==='atrox'?['idle','ready','action']:['idle','ready','action','fallen']).map(pose=>[pose,loadBattleArt(`assets/characters/${name}-${pose}.png`)]));
}
const heroBattleArt={Shadow:loadHeroBattleArt('shadow'),Astro:loadHeroBattleArt('astro'),Michou:loadHeroBattleArt('michou'),Venom:loadHeroBattleArt('venom'),Atrox:loadHeroBattleArt('atrox')};
const heroBattleHeights={Shadow:{idle:66,ready:61,action:58},Astro:{idle:64,ready:61,action:57},Michou:{idle:55,ready:55,action:55},Venom:{idle:56,ready:54,action:50},Atrox:{idle:86,ready:79,action:72}};

function battleHeroPose(b,actor,down){
 if(down)return 'idle';
 if(actor===b.actionPoseActor&&state.time<(b.actionPoseUntil||0))return 'action';
 return actor===(b.actor??0)&&!b.busy&&state.mode==='battle'?'ready':'idle';
}
function drawBattleHero(name,x,y,pose,down,facingRight=false){
 const fallen=down&&heroBattleArt[name]?.fallen;
 if(fallen&&imageReady(fallen)){
  const width=heroBattleHeights[name].idle*(name==='Shadow'?1.00:1.11),height=width*fallen.naturalHeight/fallen.naturalWidth;
  ctx.save();ctx.translate(x,y+13);if(facingRight)ctx.scale(-1,1);
  ctx.fillStyle='#1513243d';ctx.beginPath();ctx.ellipse(0,-2,width*.43,2.8,0,0,Math.PI*2);ctx.fill();
  ctx.drawImage(fallen,-width/2,-height,width,height);ctx.restore();return;
 }
 const image=heroBattleArt[name]?.[pose];
 ctx.save();
 ctx.translate(x,y);
 if(image?.complete&&image.naturalWidth){
  ctx.imageSmoothingEnabled=true;
  ctx.imageSmoothingQuality='high';
  const height=heroBattleHeights[name][pose],width=height*image.naturalWidth/image.naturalHeight;
  const actionOffset=name==='Astro'&&pose==='action'?-4:0;
  const artFacesRight=name==='Michou'||name==='Venom'||name==='Atrox';
  if(artFacesRight!==facingRight)ctx.scale(-1,1);
  ctx.drawImage(image,actionOffset-width/2,-height+(name==='Shadow'?16:12),width,height);
 }else{
  ctx.scale(1.6,1.6);
  drawBody(0,0,entity(name,0,0,colors[name],{down}));
 }
 ctx.restore();
}
// Draw the 512×288 game world on a denser canvas, while preserving every
// existing map coordinate and interaction zone for sharper fullscreen artwork.
const LOGICAL_WIDTH=512,LOGICAL_HEIGHT=288,RENDER_SCALE=2,BATTLE_RENDER_SCALE=4;
function beginRenderFrame(inBattle=false){
 const scale=inBattle?BATTLE_RENDER_SCALE:RENDER_SCALE;
 const width=LOGICAL_WIDTH*scale,height=LOGICAL_HEIGHT*scale;
 if(canvas.width!==width||canvas.height!==height){
  canvas.width=width;canvas.height=height;
  canvas.classList.toggle('high-res-battle',inBattle);
 }
 ctx.setTransform(scale,0,0,scale,0,0);
 ctx.imageSmoothingEnabled=false;
}
beginRenderFrame();
const $=id=>document.getElementById(id);
const ui={title:$('title-screen'),map:$('map-hud'),dialogue:$('dialogue'),speaker:$('speaker'),text:$('dialogue-text'),options:$('dialogue-options'),continue:$('continue'),prompt:$('prompt'),battle:$('battle-ui'),message:$('battle-message'),commands:$('command-list'),end:$('end-screen'),objective:$('objective'),fade:$('fade'),flash:$('flash')};
const colors={Astro:'#4f8edb',Shadow:'#332a5c',Atrox:'#a44747',Raymond:'#d2ae56',Aziz:'#8b684b',Soldier:'#70798d',Villager:'#5c9863'};
const state={mode:'title',scene:'village',entities:[],villageEntities:null,player:null,level:1,keys:{},burning:false,relic:false,time:0,dialogueResolve:null,choiceResolve:null,choiceOptions:[],choiceSelected:0,choiceLocked:false,choiceUnlockTimer:null,battle:null,battleMenu:'main',selected:0,lang:'en'};
const I18N={
  en:{kicker:'A classic top-down RPG prototype',title:'The Fractured<br>Constellation',chapter:'Chapter I · Ashes Beneath the Stars',newGame:'New Game',controls:'Move: arrows / WASD · Interact: click nearby action or Z · Sprint: hold Left Shift',restart:'Restart',fullscreen:'Fullscreen',musicOn:'Music: On',musicOff:'Music: Off',prototype:'PROTOTYPE · CHAPTER I',prologue:'PROLOGUE · THE FIRST KEY',talk:'ELARIS · ENTER THE SHRINE',shrine:'ELARIS SHRINE · TALK TO ELDER AZIZ',legion:'ELARIS · THE IRON LEGION',battle:'BATTLE · ASTRO VS ATROX',complete:'VERTICAL SLICE COMPLETE',prompt:'A  Talk to Elder Aziz',hp:'HP',ap:'AP',level:'LV.',astro:'ASTRO',endKicker:'Vertical slice complete',endTitle:'The Hunt Begins',endCopy:'Astro has lost his home. Shadow has found the first trace of his past. Atrox carries the stolen key toward Raymond—and something beyond the stars is listening.',again:'Play Again'},
  ar:{kicker:'نموذج أولي للعبة تقمّص أدوار كلاسيكية',title:'الكوكبة<br>المحطمة',chapter:'الفصل الأول · رماد تحت النجوم',newGame:'لعبة جديدة',controls:'الحركة: الأسهم أو WASD · التفاعل: انقر زر الفعل القريب أو Z · الجري: اضغط Shift اليسرى باستمرار',restart:'إعادة',fullscreen:'ملء الشاشة',musicOn:'الموسيقى: تعمل',musicOff:'الموسيقى: متوقفة',prototype:'نموذج أولي · الفصل الأول',prologue:'المقدمة · المفتاح الأول',talk:'إيلاريس · ادخل المزار',shrine:'مزار إيلاريس · تحدث مع العجوز عزيز',legion:'إيلاريس · الفيلق الحديدي',battle:'المعركة · أسترو ضد أتروكس',complete:'اكتملت النسخة التجريبية',prompt:'A  تحدث مع العجوز عزيز',hp:'الصحة',ap:'الطاقة',level:'المستوى',astro:'أسترو',endKicker:'اكتملت النسخة التجريبية',endTitle:'بدء المطاردة',endCopy:'خسر أسترو موطنه، وعثر شادو على أول أثر من ماضيه. يحمل أتروكس المفتاح المسروق نحو رايموند، وشيء ما خلف النجوم يصغي.',again:'العب مجددًا'}
};
const AR_SPEAKER={'Raymond':'رايموند','Atrox':'أتروكس','Narrator':'الراوي','Elder Aziz':'العجوز عزيز','Astro':'أسترو','Legion Soldier':'جندي الفيلق','Shadow':'شادو','Mira':'ميرا','Tomas':'توماس','Child':'طفل'};
const AR_TEXT={
  "Commander Atrox. The village of Elaris is hiding an object beneath its shrine.":"أيها القائد أتروكس، تخفي قرية إيلاريس شيئًا تحت مزارها.",
  "You want the object recovered. Why send a legion?":"تريد استعادة ذلك الشيء. لماذا ترسل فيلقًا كاملًا؟",
  "Because the villagers have protected it for generations. People mistake long possession for rightful ownership.":"لأن القرويين يحمونه منذ أجيال. يظن الناس أن امتلاك الشيء طويلًا يمنحهم الحق فيه.",
  "And if they resist?":"وماذا إن قاوموا؟",
  "Bring me what lies beneath the shrine. The rest is your judgment.":"أحضر لي ما يوجد تحت المزار. وما تبقى أتركه لتقديرك.",
  "Raymond turned toward an empty throne of black stone.":"استدار رايموند نحو عرش فارغ من الحجر الأسود.",
  "The lock is weakening, my lord. Tonight, we take the first key.":"القفل يضعف يا سيدي. الليلة سنأخذ المفتاح الأول.",
  "Astro. You have been staring through that lens since sunrise.":"أسترو، أنت تحدق عبر تلك العدسة منذ شروق الشمس.",
  "Incorrect. I stopped twice to recalibrate it and once because my left eye began producing duplicate stars.":"غير صحيح. توقفت مرتين لإعادة معايرتها، ومرة لأن عيني اليسرى بدأت ترى النجوم مزدوجة.",
  "Did you also stop to eat?":"وهل توقفت أيضًا لتأكل؟",
  "Half a pear at approximately noon. Nutritionally inadequate, but technically an affirmative answer.":"نصف حبة كمثرى عند الظهر تقريبًا. غير كافية غذائيًا، لكنها تقنيًا تجعل الإجابة نعم.",
  "And what did your technically nourished mind discover?":"وماذا اكتشف عقلك الذي تغذى تقنيًا؟",
  "The eastern star of the Crowned Constellation is gone. Not obscured. Not displaced. Gone.":"النجمة الشرقية من الكوكبة المتوجة اختفت. ليست محجوبة ولا تحركت من مكانها. لقد اختفت تمامًا.",
  "Then put away your instruments. There are some truths we survived by leaving buried.":"إذًا ضع أدواتك جانبًا. هناك حقائق نجونا فقط لأننا أبقيناها مدفونة.",
  "By decree of the Brotherhood of Dawn, Elaris will surrender the relic sealed beneath its shrine.":"بأمر من أخوية الفجر، ستسلّم إيلاريس الأثر المختوم تحت مزارها.",
  "There is no relic here.":"لا يوجد أي أثر هنا.",
  "Then you have nothing to lose by letting us search.":"إذًا لن تخسروا شيئًا إن سمحتم لنا بالتفتيش.",
  "Men who arrive with torches rarely care what they find.":"الرجال الذين يصلون حاملين المشاعل نادرًا ما يهتمون بما سيجدونه.",
  "Search every building. Break the shrine seal.":"فتشوا كل مبنى. حطموا ختم المزار.",
  "Doors splintered. Flames climbed the roofs as the legion closed around the shrine.":"تحطمت الأبواب وارتفعت النيران فوق الأسطح بينما أحاط الفيلق بالمزار.",
  "When Elder Aziz blocked the shrine steps, a legion blade struck him down.":"عندما وقف العجوز عزيز أمام درجات المزار، أسقطته ضربة من سيف أحد جنود الفيلق.",
  "Stop! The shrine predates the entire Brotherhood of Dawn. You have no idea what you are opening.":"توقفوا! هذا المزار أقدم من أخوية الفجر كله. أنتم لا تعرفون ما الذي تحاولون فتحه.",
  "Step aside, scholar.":"ابتعد عن الطريق أيها الباحث.",
  "What will Astro do?":"ماذا سيفعل أسترو؟",
  "No. Everyone I care about is behind me.":"لا. كل من أهتم بهم يقفون خلفي.",
  "I would strongly prefer to. Unfortunately, everyone I care about is behind me.":"كنت سأفضّل ذلك كثيرًا، لكن للأسف كل من أهتم بهم يقفون خلفي.",
  "Then show me what your stars taught you.":"إذًا أرني ما الذي علمتك إياه نجومك.",
  "Please. Take whatever you came for, but spare the villagers.":"أرجوك. خذ ما جئت من أجله، لكن اعفُ عن أهل القرية.",
  "You offer me what I already possess and call it a bargain.":"تعرض عليّ ما أصبح في حوزتي أصلًا وتسمي ذلك صفقة.",
  "Then consider it a request, not a bargain.":"إذًا اعتبره رجاءً، لا صفقة.",
  "Kneel, scholar, and watch how mercy looks from the ground.":"اركع أيها الباحث، وشاهد كيف تبدو الرحمة من على الأرض.",
  "Astro lowered himself before the legion. Atrox did not order a single torch extinguished.":"ركع أسترو أمام الفيلق، لكن أتروكس لم يأمر بإطفاء شعلة واحدة.",
  "You had courage. No judgment.":"كانت لديك الشجاعة، لكن لم يكن لديك حسن التقدير.",
  "I only needed... one clear shot.":"كنت أحتاج فقط... إلى ضربة واحدة واضحة.",
  "You had three. I allowed them.":"حصلت على ثلاث. أنا من سمح لك بها.",
  "The shrine doors broke. A soldier emerged carrying a crystal case. Inside it rested a fragment of lightless stone.":"تحطمت أبواب المزار، وخرج جندي يحمل صندوقًا بلوريًا. بداخله استقرت شظية من حجر بلا نور.",
  "We have what we came for. Leave the scholar.":"حصلنا على ما جئنا من أجله. اتركوا الباحث.",
  "He saw everything.":"لقد رأى كل شيء.",
  "A man who could not protect his own village is no threat to us.":"رجل لم يستطع حماية قريته لا يشكل أي تهديد لنا.",
  "Look at him. A coward who begs on his knees is no threat to us. Leave him here.":"انظروا إليه. جبان يتوسل على ركبتيه لن يشكل خطرًا علينا. اتركوه هنا.",
  "The door is locked. Whoever lives here has barred it from inside.":"الباب مقفل. يبدو أن من في الداخل أغلقه بإحكام.",
  "Elder Aziz is inside the shrine. He asked for you this morning.":"العجوز عزيز داخل المزار. لقد سأل عنك هذا الصباح.",
  "If you are looking for Elder Aziz, he is beside the shrine. He has been waiting for you.":"إن كنت تبحث عن العجوز عزيز، فهو بجانب المزار. كان ينتظرك.",
  "My chickens refuse to go near your telescope. I think they find it judgmental.":"دجاجاتي ترفض الاقتراب من منظارك. أظن أنها تشعر بأنه يحكم عليها.",
  "Astro, are stars really holes in the sky? Mira says I should stop asking.":"أسترو، هل النجوم ثقوب حقيقية في السماء؟ تقول ميرا إن عليّ التوقف عن السؤال.",
  "The north road has been too quiet today. Even the traders avoided it.":"الطريق الشمالي هادئ أكثر من اللازم اليوم. حتى التجار تجنبوه.",
  "A heavy crash rolled through the stone chamber. Dust fell from the ceiling.":"دوّى ارتطام عنيف في الحجرة الحجرية، وتساقط الغبار من السقف.",
  "That was not thunder.":"لم يكن ذلك رعدًا.",
  "Outside. Now.":"إلى الخارج. الآن.",
  "Astro and Elder Aziz reached the square only moments before armored figures appeared on the north road.":"وصل أسترو والعجوز عزيز إلى الساحة قبل لحظات فقط من ظهور رجال مدرعين على الطريق الشمالي.",
  "Do not move. I can calculate the safest way to—":"لا تتحرك. أستطيع حساب الطريقة الأكثر أمانًا لكي—",
  "Listen. The constellation was never a crown.":"اسمعني. لم تكن الكوكبة تاجًا قط.",
  "Save your strength. Please.":"احتفظ بقوتك، أرجوك.",
  "It was a lock. Find the missing star... before they find the door.":"لقد كانت قفلًا. اعثر على النجمة المفقودة... قبل أن يعثروا هم على الباب.",
  "Elder Aziz died before Astro could ask what the words meant.":"مات العجوز عزيز قبل أن يتمكن أسترو من سؤاله عن معنى كلماته.",
  "You are alive.":"أنت على قيد الحياة.",
  "An optimistic interpretation of the available evidence.":"هذا تفسير متفائل للأدلة المتاحة.",
  "Can you stand?":"هل تستطيع الوقوف؟",
  "Not according to any medically useful definition.":"ليس وفق أي تعريف طبي مفيد.",
  "Shadow pulled him up. For an instant, Astro saw the stranger’s shadow move before he did.":"ساعده شادو على الوقوف. وللحظة رأى أسترو ظل الغريب يتحرك قبله.",
  "Your shadow is temporally misaligned by almost half a second.":"ظلك غير متزامن معك زمنيًا بنحو نصف ثانية.",
  "You are bleeding.":"أنت تنزف.",
  "Both observations can be true.":"يمكن للملاحظتين أن تكونا صحيحتين.",
  "Who did this?":"من فعل هذا؟",
  "Atrox. Commander of the Iron Legion. He took something from beneath the shrine.":"أتروكس، قائد الفيلق الحديدي. أخذ شيئًا من تحت المزار.",
  "Black residue clung to Astro’s sleeve. The mark beneath Shadow’s coat answered with a cold pulse.":"علقت بقايا سوداء بكم أسترو، فردت العلامة تحت معطف شادو بنبضة باردة.",
  "Which road?":"أي طريق؟",
  "North. But that is an entire legion, and you are one unusually ominous man.":"إلى الشمال. لكن ذلك فيلق كامل، وأنت مجرد رجل واحد مريب بصورة غير معتادة.",
  "Then keep up.":"إذًا حاول أن تلحق بي.",
  "You do not even know my name.":"أنت لا تعرف حتى اسمي.",
  "Tell me while we walk.":"أخبرني ونحن نسير.",
  "High above the valley, Raymond opened his eyes before an empty throne.":"في مكان مرتفع فوق الوادي، فتح رايموند عينيه أمام عرش فارغ.",
  "The key is moving, my lord.":"المفتاح يتحرك يا سيدي.",
  "No voice answered him.":"لم يجبه أي صوت.",
  "Yes. Shadow will come to us.":"نعم. سيأتي شادو إلينا.",
  "He simply does not know why yet.":"هو فقط لا يعرف السبب بعد."
};
function tr(en,ar){return playerNamedText(state.lang==='ar'?ar:en)}function setObjective(key){ui.objective.textContent=I18N[state.lang][key]}

const audio={ctx:null,musicGain:null,sfxGain:null,masterGain:null,compressor:null,timer:null,on:true,mode:'village',step:0,generation:0};
function initAudio(){if(audio.ctx)return audio.ctx;const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return null;audio.ctx=new AC({latencyHint:'interactive'});audio.musicGain=audio.ctx.createGain();audio.sfxGain=audio.ctx.createGain();audio.masterGain=audio.ctx.createGain();audio.compressor=audio.ctx.createDynamicsCompressor();audio.musicGain.gain.value=1.35;audio.sfxGain.gain.value=1.3;audio.compressor.threshold.value=-12;audio.compressor.knee.value=16;audio.compressor.ratio.value=4;audio.compressor.attack.value=.003;audio.compressor.release.value=.22;audio.musicGain.connect(audio.compressor);audio.sfxGain.connect(audio.compressor);audio.compressor.connect(audio.masterGain);audio.masterGain.connect(audio.ctx.destination);return audio.ctx}
async function unlockAudio(){const context=initAudio();if(!context)return false;try{if(context.state!=='running')await context.resume();if(context.state==='running'){const buffer=context.createBuffer(1,1,context.sampleRate),source=context.createBufferSource();source.buffer=buffer;source.connect(audio.masterGain);source.start(0);return true}}catch(_){return false}return false}
function tone(freq,duration,type,volume,destination,delay=0){if(!audio.ctx||!destination)return;const tempo=destination===audio.musicGain?musicTempoRate:1;duration/=tempo;delay/=tempo;const now=audio.ctx.currentTime+delay,o=audio.ctx.createOscillator(),g=audio.ctx.createGain();o.type=type;o.frequency.value=freq;g.gain.setValueAtTime(.0001,now);g.gain.exponentialRampToValueAtTime(Math.max(.0002,volume),now+.015);g.gain.exponentialRampToValueAtTime(.0001,now+duration);o.connect(g);g.connect(destination);o.start(now);o.stop(now+duration+.03)}
function impactNoise(duration=.09,volume=.34,frequency=1250){if(!audio.ctx||!audio.sfxGain)return;const now=audio.ctx.currentTime,buffer=audio.ctx.createBuffer(1,Math.ceil(audio.ctx.sampleRate*duration),audio.ctx.sampleRate),data=buffer.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*(1-i/data.length);const source=audio.ctx.createBufferSource(),filter=audio.ctx.createBiquadFilter(),gain=audio.ctx.createGain();source.buffer=buffer;filter.type='bandpass';filter.frequency.value=frequency;filter.Q.value=.7;gain.gain.setValueAtTime(volume,now);gain.gain.exponentialRampToValueAtTime(.0001,now+duration);source.connect(filter);filter.connect(gain);gain.connect(audio.sfxGain);source.start(now);source.stop(now+duration+.02)}
function musicStep(){if(!audio.on||!audio.ctx||audio.ctx.state!=='running')return;const village=[220,277.18,329.63,277.18,246.94,293.66,369.99,293.66],tension=[110,123.47,116.54,146.83,110,138.59,123.47,103.83],battle=[146.83,174.61,196,174.61,146.83,220,196,174.61],notes=audio.mode==='battle'?battle:audio.mode==='tension'?tension:village,i=audio.step++%notes.length,type=audio.mode==='battle'?'square':audio.mode==='tension'?'sawtooth':'triangle',duration=audio.mode==='battle'?.2:audio.mode==='tension'?.3:.42,volume=audio.mode==='battle'?.28:audio.mode==='tension'?.22:.24;tone(notes[i],duration,type,volume,audio.musicGain);if(audio.mode==='village'&&i%4===0)tone(notes[i]/2,.7,'sine',.12,audio.musicGain);if(audio.mode==='tension'&&i%2===0)tone(notes[i]/2,.5,'square',.1,audio.musicGain);if(audio.mode==='battle'&&i%2===0)tone(notes[i]/2,.24,'sawtooth',.15,audio.musicGain)}
async function startMusic(mode){audio.mode=mode;audio.step=0;audio.generation++;const generation=audio.generation;if(audio.timer)clearInterval(audio.timer);audio.timer=null;if(!audio.on)return;const ready=await unlockAudio();if(!ready||generation!==audio.generation||!audio.on)return;musicStep();const interval=mode==='battle'?230:mode==='tension'?340:470;audio.timer=setInterval(musicStep,interval/musicTempoRate)}function stopMusic(){audio.generation++;if(audio.timer)clearInterval(audio.timer);audio.timer=null}
function fireSfx(){if(!audio.ctx||audio.ctx.state!=='running')return;tone(98,.7,'sawtooth',.48,audio.sfxGain);tone(73.42,.85,'square',.36,audio.sfxGain,.1);tone(196,.24,'sawtooth',.3,audio.sfxGain,.42)}
function battleSfx(kind){if(!audio.ctx||audio.ctx.state!=='running')return;if(kind==='attack'){tone(210,.11,'square',.42,audio.sfxGain);tone(105,.2,'sawtooth',.34,audio.sfxGain,.045)}else if(kind==='hit'){impactNoise(.095,.4,1150);tone(148,.09,'square',.48,audio.sfxGain);tone(72,.16,'sawtooth',.38,audio.sfxGain,.025)}else if(kind==='magic'){tone(392,.3,'sine',.34,audio.sfxGain);tone(783.99,.24,'square',.28,audio.sfxGain,.12)}else if(kind==='shield'){tone(329.63,.34,'sine',.3,audio.sfxGain);tone(493.88,.38,'sine',.26,audio.sfxGain,.08)}else if(kind==='enemy'){tone(82.41,.28,'square',.5,audio.sfxGain);tone(55,.36,'sawtooth',.4,audio.sfxGain,.04)}else if(kind==='defeat'){tone(98,.35,'sawtooth',.5,audio.sfxGain);tone(65.41,.7,'square',.42,audio.sfxGain,.18)}else tone(523.25,.1,'square',.28,audio.sfxGain)}
async function toggleMusic(){audio.on=!audio.on;if(audio.on){const ready=await unlockAudio();if(ready){tone(659.25,.1,'sine',.16,audio.sfxGain);startMusic(audio.mode||'village')}}else stopMusic();applyLanguage()}
function textBlip(index){if(!audio.ctx||audio.ctx.state!=='running'||index%2!==0)return;tone(180+(index%5)*12,.045,'square',.22,audio.sfxGain)}
function applyLanguage(){if(ui.speaker.dataset.character)ui.speaker.textContent=speakerLabel(ui.speaker.dataset.character);const t=I18N[state.lang];document.documentElement.dir=state.lang==='ar'?'rtl':'ltr';$('title-kicker').textContent=t.kicker;$('game-title').innerHTML=t.title;$('chapter-subtitle').textContent=t.chapter;$('new-game').textContent=t.newGame;$('controls-help').textContent=t.controls;$('restart').textContent=t.restart;$('fullscreen').textContent=t.fullscreen;$('music-toggle').textContent=audio.on?t.musicOn:t.musicOff;$('astro-status-name').textContent=t.astro;const hpLabel=$('hp-label'),apLabel=$('ap-label');if(hpLabel)hpLabel.textContent=t.hp;if(apLabel)apLabel.textContent=t.ap;$('level-label').textContent=t.level;$('end-kicker').textContent=t.endKicker;$('end-title').textContent=t.endTitle;$('end-copy').textContent=playerNamedText(t.endCopy);$('again').textContent=t.again;document.querySelectorAll('.language-button').forEach(b=>b.classList.toggle('selected',b.dataset.lang===state.lang));if(state.mode==='title')setObjective('prototype');if(state.mode==='battle'&&state.battle)renderCommands()}
function entity(name,x,y,color,extra={}){return{name,x,y,color,dir:'down',speed:1.2,visible:true,down:false,...extra}}function find(name){return state.entities.find(e=>e.name===name)}function sleep(ms){return new Promise(r=>setTimeout(r,ms))}function rect(x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h))}function line(x1,y1,x2,y2,c,w=1){ctx.strokeStyle=c;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke()}function tileNoise(x,y,base,alt){rect(x,y,16,16,base);if(((x+y)/16)%3===0){rect(x+3,y+5,2,2,alt);rect(x+11,y+12,2,1,alt)}}
// Muted natural grass palettes match the detailed buildings and trees. The
// deterministic flecks break up flat tiles without making the ground noisy.
const GRASS_PALETTES={
 elaris:['#608657','#52774b','#45683f','#7ba36a'],
 asterford:['#6a8e60','#5c8054','#4d7147','#84aa75'],
 bellhaven:['#71865b','#63784f','#536943','#8ca171'],
 world:['#648858','#56794d','#476b41','#80a371'],
 forest:['#466d49','#3b5f40','#305137','#5e8359'],
 hills:['#758b5a','#667d4f','#566e44','#8fa66e']
};
function grassTile(x,y,palette){groundMaterial("meadow",x,y,16,16,palette[0])}

function drawBody(x,y,e){if(paintMapFigure(x,y,e))return;rect(x-5,y-10,10,8,e.color);rect(x-6,y-7,12,11,e.color);rect(x-5,y-14,10,7,'#c99b7b');rect(x-4,y-15,8,3,e.name==='Raymond'?'#efe2b0':e.name==='Astro'?'#24375e':'#292331');rect(x-5,y+4,4,5,'#202331');rect(x+1,y+4,4,5,'#202331');if(e.name==='Atrox'){rect(x-9,y-7,3,12,'#aeb5c4');rect(x+6,y-7,3,12,'#aeb5c4')}if(e.carrying){ctx.fillStyle='#080711';ctx.beginPath();ctx.arc(x+9,y-6,4,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#a279c5';ctx.stroke()}if(e===state.player){ctx.fillStyle='#f0d579';ctx.beginPath();ctx.moveTo(x-4,y-20);ctx.lineTo(x+4,y-20);ctx.lineTo(x,y-16);ctx.fill()}}
function drawSprite(e){
 if(!e.visible)return;
 if(!paintMapFigure(e.x,e.y,e))drawBody(e.x,e.y,e);
}
// Black marble, an empty ceremonial throne, and the stolen star above the dais.
function drawCitadelChamber(actors=true){
 if(paintScene("throne")){if(actors)state.entities.slice().sort((a,b)=>a.y-b.y).forEach(drawSprite);return}
 rect(0,0,512,288,'#090c18');
 // Flagstones recede towards the raised throne; small inlays make the room readable.
 for(let y=96;y<288;y+=16)for(let x=26;x<486;x+=24){
  const offset=(Math.floor(y/16)%2)*12;
  rect(x+offset,y,23,15,(x/24+Math.floor(y/16))%3<1?'#252d3e':'#202737');
  line(x+offset+2,y+2,x+offset+20,y+2,'#343d4d',1);
 }
 rect(0,0,512,105,'#12172b');rect(20,18,472,5,'#6f6578');rect(20,24,472,2,'#aa926b');
 // A vaulted alcove frames the unoccupied seat.
 ctx.fillStyle='#050712';ctx.beginPath();ctx.moveTo(191,99);ctx.lineTo(191,51);ctx.bezierCurveTo(191,26,222,13,256,7);ctx.bezierCurveTo(290,13,321,26,321,51);ctx.lineTo(321,99);ctx.closePath();ctx.fill();
 ctx.strokeStyle='#736276';ctx.lineWidth=3;ctx.stroke();
 ctx.strokeStyle='#b49460';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(200,92);ctx.lineTo(200,51);ctx.bezierCurveTo(205,28,230,20,256,15);ctx.bezierCurveTo(282,20,307,28,312,51);ctx.lineTo(312,92);ctx.stroke();
 // A fractured eight-point star, not a visible master.
 ctx.save();ctx.translate(256,43);ctx.strokeStyle='#c3a477';ctx.lineWidth=1;
 ctx.beginPath();ctx.arc(0,0,14,0,Math.PI*2);ctx.stroke();
 for(let i=0;i<8;i++){const a=i*Math.PI/4;line(Math.cos(a)*6,Math.sin(a)*6,Math.cos(a)*11,Math.sin(a)*11,'#dcc294',1)}
 line(-3,-11,2,-2,'#75629a',2);line(2,1,-1,12,'#75629a',2);ctx.restore();
 // Broad stair treads, gilded edging, and the long ceremonial carpet.
 for(let i=0;i<4;i++){const x=185-i*10,y=101+i*7,w=142+i*20;rect(x,y,w,7,'#35384a');rect(x,y,w,1,'#a79778');rect(x+2,y+4,w-4,2,'#171d2c')}
 rect(211,126,90,162,'#4c1c35');rect(217,126,78,162,'#6a2943');rect(223,126,66,162,'#722e47');
 for(const x of [214,295]){rect(x,128,2,160,'#b29464');for(let y=132;y<284;y+=12){rect(x-2,y,6,3,'#c0a471');rect(x,y+3,2,3,'#c0a471')}}
 for(let y=169;y<288;y+=39){line(245,y,256,y-6,'#a85c64',1);line(256,y-6,267,y,'#a85c64',1);line(245,y,256,y+6,'#a85c64',1);line(256,y+6,267,y,'#a85c64',1)}
 // The high-backed throne remains emphatically empty.
 rect(232,62,48,40,'#080c17');rect(236,65,40,35,'#30253d');rect(240,68,32,29,'#231a31');
 for(const x of [230,278]){rect(x,61,4,44,'#a78656');rect(x-1,56,6,6,'#d3b97e');rect(x+1,64,1,37,'#e4c789')}
 rect(234,100,44,7,'#917153');rect(238,98,36,5,'#352038');rect(226,88,8,16,'#987955');rect(278,88,8,16,'#987955');
 rect(231,107,5,6,'#b39262');rect(276,107,5,6,'#b39262');
 // Narrow stained-glass lancets and projecting masonry columns.
 for(const x of [63,124,356,417]){
  rect(x,37,29,61,'#060b19');rect(x+3,42,23,49,'#24365a');rect(x+7,48,15,36,'#435079');
  line(x+14,39,x+14,93,'#b2a489',2);line(x+3,64,x+26,64,'#958f86',2);
  rect(x+9,53,5,8,'#af8963');rect(x+16,71,5,9,'#795d92');rect(x+8,82,13,4,'#517485');
  line(x-1,98,x+30,98,'#afa081',2);
 }
 for(const x of [29,101,166,331,396,467]){
  rect(x+5,41,12,137,'#060a14');rect(x,31,14,116,'#34384c');rect(x+2,34,4,110,'#606176');rect(x+10,34,3,110,'#252a3b');
  rect(x-3,29,20,6,'#989082');rect(x-1,35,16,3,'#626172');rect(x-4,147,22,7,'#a19884');rect(x-6,155,26,6,'#3a3f51');
 }
 // Revolution banners, wall lights, and a quieter corner for written orders.
 for(const x of [48,447]){
  line(x-10,104,x+10,104,'#b99a6b',2);rect(x-8,106,16,43,'#633044');rect(x-6,108,12,33,'#7e364c');
  ctx.fillStyle='#632c40';ctx.beginPath();ctx.moveTo(x-8,149);ctx.lineTo(x,155);ctx.lineTo(x+8,149);ctx.fill();
  line(x-4,123,x+4,123,'#dfbb75',1);line(x,117,x,129,'#dfbb75',1);
 }
 rect(378,209,71,23,'#161523');rect(382,206,66,20,'#4a3540');rect(386,209,57,12,'#6a4950');
 rect(390,207,20,9,'#b8ab88');line(392,210,406,210,'#74624f',1);line(392,213,404,213,'#74624f',1);
 for(let i=0;i<4;i++)rect(417+i*5,208,4,12,['#37485b','#755948','#4d4a5f','#887557'][i]);
 const candle=(x,y,phase)=>{
  const f=Math.floor(Math.sin(state.time/180+phase)*1.3);
  rect(x-4,y+6,9,3,'#a28657');rect(x-1,y-2,3,9,'#c6b794');rect(x-1,y-8+f,3,6,'#e7a05c');rect(x,y-7+f,1,4,'#fff0ac');
  for(let r=3;r>0;r--){ctx.fillStyle=['#ffcb6813','#ffcb6810','#ffcb6808'][r-1];ctx.beginPath();ctx.ellipse(x+1,y-4,9*r,6*r,0,0,Math.PI*2);ctx.fill()}
 };
 for(const [x,y]of[[181,90],[329,90],[73,188],[437,188],[177,240],[335,240]]){rect(x-2,y+5,5,21,'#66503d');rect(x-7,y+24,15,3,'#90785a');candle(x,y,x*.1)}
 // Fine gold floor runes echo the shard, never suggesting a visible deity.
 ctx.strokeStyle='#a88a6138';ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(256,153,48,13,0,0,Math.PI*2);ctx.stroke();
 for(let i=0;i<12;i++){const a=i*Math.PI/6;rect(256+Math.cos(a)*47,153+Math.sin(a)*13,2,2,'#b99b6855')}
 for(let i=0;i<12;i++){const x=52+(i*37)%412,y=39+((i*41+state.time/210)%137);rect(x,y,1,1,'#d4bd8866')}
 rect(0,0,19,288,'#04071299');rect(494,0,18,288,'#04071299');
 if(actors)state.entities.slice().sort((a,b)=>a.y-b.y).forEach(drawSprite)
}
function drawThrone(){drawCitadelChamber()}
function drawRaymondPrivate(){drawCitadelChamber()}

function house(x,y,w=76,h=56,burn=false){const image=EXTERIOR_ART[burn?'houseBurned':'house'];if(imageReady(image)){ctx.drawImage(image,x-8,y-19,w+16,h+21);return}rect(x,y,w,h,'#86694e');rect(x+5,y+8,w-10,h-8,'#a5855e');ctx.fillStyle='#4a3740';ctx.beginPath();ctx.moveTo(x-9,y+5);ctx.lineTo(x+w/2,y-25);ctx.lineTo(x+w+9,y+5);ctx.fill();rect(x+w/2-7,y+h-21,14,21,'#392d2c');rect(x+12,y+18,14,11,'#d1b36b');if(burn){const f=Math.floor(state.time/180)%2;ctx.fillStyle=f?'#f0a24d':'#c74e3e';ctx.beginPath();ctx.moveTo(x+12,y+2);ctx.lineTo(x+20,y-24-f*5);ctx.lineTo(x+29,y+4);ctx.fill();ctx.beginPath();ctx.moveTo(x+w-29,y+3);ctx.lineTo(x+w-19,y-18+f*4);ctx.lineTo(x+w-9,y+5);ctx.fill()}}
// Supplied exterior art is shared by each matching building type.  Doors retain
// their map coordinates while the collision footprint follows the larger facade.
const EXTERIOR_ART={
 houseBurned:loadBattleArt('assets/buildings/house-burned.png'),
 house2Burned:loadBattleArt('assets/buildings/house2-burned.png')
};
for(const[key,path]of Object.entries({house:'assets/buildings/house.png',house2:'assets/buildings/house2.png',herbs:'assets/buildings/herb-store.png',inn:'assets/buildings/inn.png',shrine:'assets/buildings/shrine.png',arena:'assets/buildings/arena.png',mayor:'assets/buildings/mayor-manor.png',mayor2:'assets/buildings/mayor2.png',tree:'assets/buildings/tree.png'})){
 const image=typeof Image==='undefined'?null:new Image();if(image)image.src=path;EXTERIOR_ART[key]=image;
}
// Exterior assets are deliberately larger than their old tile rectangles.  The
// rectangle is anchored at its base so a door never drifts when its facade grows.
const EXTERIOR_SCALE=1.22;
function exteriorArtRect(building){
 const art=building.art||{},baseW=art.w||building.w,baseH=art.h||Math.round(baseW*2/3),scale=art.scale??EXTERIOR_SCALE,w=Math.round(baseW*scale),h=Math.round(baseH*scale),baseX=art.x??(building.x+(building.w-baseW)/2),baseY=art.y??(building.y+building.h-baseH);
 return{x:Math.round(baseX-(w-baseW)/2),y:Math.round(baseY-(h-baseH)),w,h};
}
function drawExteriorBuilding(building,key,fallback){
 const image=EXTERIOR_ART[key],{x,y,w,h}=exteriorArtRect(building);
 if(!image||!image.complete||!image.naturalWidth){fallback?.();return}
 ctx.save();const smoothing=ctx.imageSmoothingEnabled;ctx.imageSmoothingEnabled=false;ctx.drawImage(image,x,y,w,h);ctx.imageSmoothingEnabled=smoothing;ctx.restore();
}
// Tree coordinates use the base of the trunk.  This keeps the visible crown and
// the collision footprint aligned, regardless of map scale.
function drawTreeSprite(x,y,size=48){
 const image=EXTERIOR_ART.tree;
 if(!image||!image.complete||!image.naturalWidth){rect(x-3,y-4,6,23,'#56453e');rect(x-16,y-35,32,29,'#163c36');rect(x-21,y-24,42,21,'#214e42');rect(x-12,y-34,24,7,'#30614b');return}
 const w=size*.72,h=size;
 ctx.save();const smoothing=ctx.imageSmoothingEnabled;ctx.imageSmoothingEnabled=false;ctx.drawImage(image,x-w/2,y-h,w,h);ctx.imageSmoothingEnabled=smoothing;ctx.restore();
}
// Sprites extend above the walking plane; only their lower quarter is solid.
function footHitsRect(x,y,bx,by,w,h){return x+4>bx&&x-4<bx+w&&y+9>by&&y+4<by+h}
function actorsBlockFeet(x,y){return state.entities.some(e=>e!==state.player&&!e.follower&&e.visible&&!e.down&&Math.abs(x-e.x)<10&&Math.abs(y-e.y)<7)}
function buildingBlocksFeet(x,y,b){const r=exteriorArtRect(b),wall={x:r.x+Math.round(r.w*.08),y:r.y+Math.round(r.h*.46),w:Math.round(r.w*.84),h:Math.round(r.h*.54)};return footHitsRect(x,y,wall.x,wall.y,wall.w,wall.h)}
// The door threshold is the facade's ground plane. Characters north of it pass
// behind the building; characters approaching from the street are drawn in front.
function buildingDepth(building){const r=exteriorArtRect(building),depthY=building.depthY,doorY=building.door?.y;return Number.isFinite(depthY)?depthY:Number.isFinite(doorY)?doorY-10:r.y+r.h-12}
function drawOutdoorLayers(buildings,paintBuilding,extra=[]){const layers=[...buildings.map(b=>({depth:buildingDepth(b),paint:()=>paintBuilding(b)})),...state.entities.filter(e=>e.visible).map(e=>({depth:e.y+9,paint:()=>drawSprite(e)})),...extra];layers.sort((a,b)=>a.depth-b.depth).forEach(layer=>layer.paint())}
// Normal homes use two alternating exterior designs.  Their artwork is a little
// larger than before, while their original door coordinates remain unchanged.
const ELARIS_HOMES=[
 {x:12,y:37,w:145,h:94,door:{x:63,y:128},artKey:'house',art:{x:8,y:34,w:150,h:97,scale:1}},
 {x:355,y:37,w:145,h:96,door:{x:433,y:130},artKey:'house2',art:{x:352,y:36,w:150,h:97,scale:1}},
 {x:10,y:151,w:150,h:107,door:{x:63,y:258},artKey:'house2',art:{x:7,y:151,w:154,h:107,scale:1}},
 {x:352,y:151,w:150,h:107,door:{x:432,y:258},artKey:'house',art:{x:351,y:151,w:154,h:107,scale:1}}
];
// The shrine artwork ends at y=107. Its old interaction point was y=141,
// which made a character standing on the visible steps sort behind the facade.
const ELARIS_SHRINE={x:192,y:18,w:130,h:89,door:{x:257,y:107},depthY:97,art:{x:180,y:4,w:154,h:103,scale:1.14}};
function drawElarisBuilding(building){
 const key=building===ELARIS_SHRINE?'shrine':building.artKey;
 drawExteriorBuilding(building,state.burning&&key!=='shrine'?key+'Burned':key,
  ()=>house(building.x,building.y,building.w,building.h,state.burning&&key!=='shrine'));
}
let elarisFireGlows;
function drawElarisFire(){
 if(!elarisFireGlows)elarisFireGlows=ELARIS_HOMES.map(({art})=>{
  const x=art.x+art.w/2,y=art.y+art.h*.43;
  const glow=ctx.createRadialGradient(x,y,4,x,y,82);
  glow.addColorStop(0,'#ff903540');glow.addColorStop(.45,'#e75a2b20');glow.addColorStop(1,'#e75a2b00');
  return {x,y,glow};
 });
 ctx.save();
 ctx.globalCompositeOperation='screen';
 rect(0,0,512,288,'#a5251033');
 ctx.restore();
 ctx.save();
 elarisFireGlows.forEach(({x,y,glow},i)=>{
  ctx.globalAlpha=.8+Math.sin(state.time/205+i*2)*.2;
  ctx.fillStyle=glow;ctx.fillRect(x-82,y-82,164,164);
  for(let j=0;j<9;j++){
   const rise=((state.time/30+j*11+i*23)%82)/82;
   ctx.globalAlpha=(1-rise)*.85;
   rect(x+(j*31%63)-31+Math.sin(rise*7+j)*9,y-rise*73,1+(j%3===0),1,j%3===0?'#ffda82':'#ff7839');
  }
 });
 ctx.restore();
}
function drawVillage(){groundMaterial('meadow',0,0,512,288,GRASS_PALETTES.elaris[0]);groundMaterial('dirt',212,0,88,288,'#887e69');groundMaterial('dirt',0,132,512,48,'#887e69');for(const [x,y] of [[12,119],[154,125],[355,129],[489,273]])paintProp('ferns',x,y,18,10);drawOutdoorLayers([...ELARIS_HOMES,ELARIS_SHRINE],drawElarisBuilding,[{depth:buildingDepth(ELARIS_SHRINE)-1,paint:()=>{paintProp('telescope',119,109,86,85)}}]);if(state.burning)drawElarisFire()}
function drawShrineEntranceWalls(){
 const wall=[[0,195],[15,195],[15,218],[42,238],[42,235],[63,235],[63,288],[0,288]];
 ctx.save();
 ctx.beginPath();
 for(const mirror of [false,true]){
  wall.forEach(([x,y],i)=>{
   const px=mirror?512-x:x;
   if(i===0)ctx.moveTo(px,y);else ctx.lineTo(px,y);
  });
  ctx.closePath();
 }
 ctx.clip();
 paintScene('shrine');
 ctx.restore();
}
function drawShrine(){if(paintScene("shrine")){state.entities.slice().sort((a,b)=>a.y-b.y).forEach(drawSprite);drawShrineEntranceWalls();return}rect(0,0,512,288,'#090b15');rect(26,14,460,274,'#3c4050');rect(38,28,436,260,'#686878');for(let y=38;y<276;y+=18)for(let x=46;x<470;x+=24){rect(x+(y%36?12:0),y,20,14,'#737382');rect(x+(y%36?12:0)+2,y+2,16,10,'#696977')}rect(26,14,460,18,'#272a38');rect(26,14,18,274,'#272a38');rect(468,14,18,274,'#272a38');for(const x of [74,422])for(const y of [68,148]){rect(x-10,y-18,20,44,'#343848');rect(x-14,y-20,28,8,'#555b70');rect(x-14,y+22,28,8,'#292d3c')}rect(190,38,132,58,'#303442');rect(202,46,108,45,'#4c5061');rect(239,54,34,28,'#171925');rect(248,59,16,16,'#9d86c7');ctx.strokeStyle='#a897cf';ctx.lineWidth=2;ctx.beginPath();ctx.arc(256,157,43,0,Math.PI*2);ctx.stroke();const stars=[[256,121],[290,145],[277,188],[234,188],[222,145]];ctx.fillStyle='#d2c5ec';stars.forEach(([x,y])=>{ctx.beginPath();ctx.arc(x,y,3,0,Math.PI*2);ctx.fill()});for(let i=0;i<stars.length;i++){const a=stars[i],b=stars[(i+2)%stars.length];line(a[0],a[1],b[0],b[1],'#8e80b5',1)}const flame=Math.floor(state.time/160)%2;for(const x of [132,380]){rect(x-3,87,6,20,'#5a4036');ctx.fillStyle=flame?'#f3b35b':'#d86d45';ctx.beginPath();ctx.moveTo(x-7,88);ctx.lineTo(x,72-flame*4);ctx.lineTo(x+7,88);ctx.fill()}rect(232,263,48,25,'#282b39');rect(240,270,32,18,'#121521');state.entities.slice().sort((a,b)=>a.y-b.y).forEach(drawSprite)}
function drawBattle(){drawEncounterBackdrop({});const b=state.battle,shake=b?.enemyShake?((Math.floor(state.time/40)%2)*4-2):0,ax=160+shake,ay=142;ctx.save();if(typeof enemyDamageFlash==='function'&&enemyDamageFlash(b,0))ctx.filter='brightness(4) saturate(0)';const pose=state.time<(b?.attackPoseUntil||0)?'action':b?.attackPoseReady?'ready':'idle';const atroxArt=heroBattleArt.Atrox[pose];if(atroxArt?.complete&&atroxArt.naturalWidth){drawBattleHero('Atrox',ax+(pose==='action'?12:0),ay+20,pose,false,true)}else{rect(ax-19,ay-34,38,35,'#7d333b');rect(ax-23,ay-24,46,40,'#5f2930');rect(ax-14,ay-51,28,20,'#a98268');rect(ax-17,ay-54,34,8,'#505766');rect(ax-30,ay-26,8,38,'#afb6c4');rect(ax+22,ay-26,8,38,'#afb6c4');rect(ax-12,ay+16,10,16,'#242936');rect(ax+3,ay+16,10,16,'#242936');}ctx.restore();const heroHit=b?.heroHits?.[0],heroAge=state.time-(heroHit?.start??-10000),heroImpact=heroAge>=0&&heroAge<480;ctx.save();if(heroImpact&&Math.floor(heroAge/65)%2===0)ctx.filter='brightness(4) saturate(0)';const down=b?.hp<=0,hx=385+(!down&&heroImpact?Math.sin(heroAge/16)*4:0),hy=196;drawBattleHero('Astro',hx,hy,b?battleHeroPose(b,0,down):'idle',down);ctx.restore();if(!down&&b?.teamShield)drawOrbitWard('Astro',hx,hy,state.time);if(b?.magic&&!b.skillFx){ctx.strokeStyle='#d7c3ff';ctx.lineWidth=2;for(let i=0;i<3;i++){ctx.beginPath();ctx.arc(ax,ay-10,29+i*7+Math.sin(state.time/90+i)*4,0,Math.PI*2);ctx.stroke()}}}
function draw(){state.time=performance.now();if(state.mode==='battle'||state.mode==='battleBusy'||(state.mode==='stats'&&state.statsReturn==='battle'))drawBattle();else if(state.scene==='throne')drawThrone();else if(state.scene==='shrine')drawShrine();else if(state.scene==='forest'||state.scene==='pass')drawJourneyMap();else drawVillage();requestAnimationFrame(draw)}
function shrineBlocksFeet(x,y){
 const feet=y+9;
 // The lower side walls angle inward before meeting the front wall.
 const wallInset=18+Math.min(38,Math.max(0,feet-211));
 const sideInset=feet>=239?67:wallInset;
 const backEdge=x<31||x>481?145:104;
 const frontEdge=Math.abs(x-256)<24?282:263;
 return x<sideInset||x>512-sideInset||y+5<backEdge||feet>frontEdge||
  footHitsRect(x,y,185,95,141,17)||
  [[75,101],[432,101]].some(([tx,ty])=>footHitsRect(x,y,tx-5,ty-5,10,11));
}
function blocked(x,y){const person=actorsBlockFeet(x,y);if(state.scene==='shrine')return shrineBlocksFeet(x,y)||person;if(x<12||x>500||y<18||y+9>282)return true;return person||ELARIS_HOMES.some(b=>buildingBlocksFeet(x,y,b))||buildingBlocksFeet(x,y,ELARIS_SHRINE)||footHitsRect(x,y,112,98,14,16)}
function update(){if(state.mode!=='map'&&joystick.pointerId!==null)resetJoystick();if(state.mode==='map'&&state.player){preparePartyFormation();const p=state.player,{x:dx,y:dy}=movementVector();let x=p.x,y=p.y;const step=1.55*(sprinting()?RUN_MULTIPLIER:1)*(state.frameScale??1),slices=Math.max(1,Math.ceil(step/1.55));for(let i=0;i<slices;i++){const nx=x+dx*step/slices,ny=y+dy*step/slices;if(!blocked(nx,y))x=nx;if(!blocked(x,ny))y=ny;}
 if(x!==p.x||y!==p.y)moveMapActor(p,x,y);else p.dir=facingDirection(dx,dy,p.dir);
 updatePrompt()}requestAnimationFrame(update)}
const villageEntrances=[{kind:'shrine',x:257,y:107},{kind:'home',x:63,y:128},{kind:'home',x:433,y:130},{kind:'home',x:63,y:258},{kind:'home',x:432,y:258}];
function nearbyTalker(){if(!state.player)return null;return state.entities.filter(e=>e!==state.player&&e.visible&&!e.down&&e.talk).sort((a,b)=>Math.hypot(state.player.x-a.x,state.player.y-a.y)-Math.hypot(state.player.x-b.x,state.player.y-b.y)).find(e=>Math.hypot(state.player.x-e.x,state.player.y-e.y)<36)||null}
function nearbyEntrance(){if(state.scene!=='village'||!state.player)return null;return villageEntrances.find(d=>Math.hypot(state.player.x-d.x,state.player.y-d.y)<31)||null}
function nearShrineExit(){return state.scene==='shrine'&&state.player&&Math.hypot(state.player.x-256,state.player.y-260)<32}
function updatePrompt(){const npc=nearbyTalker(),door=nearbyEntrance(),exit=nearShrineExit();ui.prompt.classList.toggle('hidden',!npc&&!door&&!exit);if(npc){const name=state.lang==='ar'?(AR_SPEAKER[npc.name]||npc.name):npc.name;ui.prompt.textContent=tr(`A  Talk to ${name}`,`A  تحدث مع ${name}`)}else if(exit)ui.prompt.textContent=tr('A  Exit shrine','A  اخرج من المزار');else if(door)ui.prompt.textContent=door.kind==='shrine'?tr('A  Enter shrine','A  ادخل المزار'):tr('A  Try door','A  جرّب الباب')}
function interact(){if(state.mode==='dialogue'){advanceDialogue();return}if(state.mode==='choice'){resolveChoice(state.choiceSelected);return}if(state.mode==='map'){const npc=nearbyTalker();if(npc){faceConversation(npc,state.player);if(npc.story)beginVillageStory();else talkToNpc(npc);return}if(nearShrineExit()){exitShrine();return}const door=nearbyEntrance();if(door){if(door.kind==='shrine')enterShrine();else showLockedDoor()}}}
async function talkToNpc(npc){state.mode='cutscene';ui.map.classList.add('hidden');await say(npc.talk);state.mode='map';ui.map.classList.remove('hidden');updatePrompt()}
async function showLockedDoor(){state.mode='cutscene';ui.map.classList.add('hidden');await say([{speaker:'Narrator',text:'The door is locked. Whoever lives here has barred it from inside.'}]);state.mode='map';ui.map.classList.remove('hidden');updatePrompt()}
async function enterShrine(){state.mode='cutscene';ui.map.classList.add('hidden');ui.fade.classList.add('on');await sleep(360);state.villageEntities=state.entities;state.player.x=256;state.player.y=244;state.player.dir='up';state.entities=[state.player,entity('Elder Aziz',256,111,colors.Aziz,{dir:'down',story:true,talk:true})];state.scene='shrine';ui.fade.classList.remove('on');await sleep(320);state.mode='map';ui.map.classList.remove('hidden');setObjective('shrine');updatePrompt()}
async function exitShrine(){if(!state.villageEntities)return;state.mode='cutscene';ui.map.classList.add('hidden');ui.fade.classList.add('on');await sleep(360);state.entities=state.villageEntities;state.villageEntities=null;state.player.x=257;state.player.y=150;state.player.dir='down';state.scene='village';ui.fade.classList.remove('on');await sleep(320);state.mode='map';ui.map.classList.remove('hidden');setObjective('talk');updatePrompt()}
let dialogueLines=[],dialogueIndex=0,typeTimer=null,typing=false,fullDialogueText='';
function say(lines){return new Promise(resolve=>{dialogueLines=lines;dialogueIndex=0;state.dialogueResolve=resolve;state.mode='dialogue';ui.map.classList.add('hidden');ui.options.classList.add('hidden');ui.continue.classList.remove('hidden');$('dialogue-skip').classList.remove('hidden');ui.dialogue.classList.remove('hidden');showDialogueLine()})}
const speakerArabic={
 "Shadow": "شادو",
 "Astro": "أسترو",
 "Venom": "فينوم",
 "Michou": "ميشو",
 "Atrox": "أتروكس",
 "Raymond": "رايموند",
 "Announcer": "المنادي",
 "Narrator": "الراوي",
 "TMRH": "تمره",
 "Commander TMRH": "القائد تمره",
 "Apothecary Lysa": "العطّارة ليسا",
 "Arena Guide": "دليل المدرّج",
 "Arena Keeper": "حارس المدرّج",
 "Bram": "برام",
 "Captain Darius": "النقيب داريوس",
 "Captain Rook": "القبطان روك",
 "Child": "طفل",
 "Citizen": "مواطن",
 "Dawn Officer": "ضابط الفجر",
 "Dawn Sergeant": "رقيب الفجر",
 "Dockhand Tamsin": "عاملة المرفأ تامسين",
 "Elder Aziz": "العجوز عزيز",
 "Freed Courier": "الرسول المحرر",
 "Gate Guard": "حارس البوابة",
 "Innkeeper Elin": "صاحبة النزل إيلين",
 "Innkeeper Sela": "صاحبة النزل سيلا",
 "Iris": "آيريس",
 "Ivo": "إيفو",
 "Legion": "الفيلق",
 "Legion Captain": "قائد الفيلق",
 "Legion Soldier": "جندي الفيلق",
 "Moha": "موحا",
 "Mason": "ماسون",
 "Mayor Rowan": "العمدة روان",
 "Messenger": "الرسول",
 "Mira": "ميرا",
 "Nella": "نيلا",
 "Nia": "نيا",
 "Night Guard": "حارس الليل",
 "Old Keeper": "الحارس القديم",
 "Quartermaster Edda": "أمينة المؤن إيدا",
 "Scout": "الكشّاف",
 "Sergeant Sera": "الرقيب سيرا",
 "Smith Garr": "الحداد غار",
 "Smith Oren": "الحداد عزيز",
 "Steward Moha": "الحاكم موحا",
 "Tomas": "توماس",
 "Town Guard": "حارس المدينة",
 "Yard Warden": "مشرف الساحة",
 "The Beast": "المسخ",
 "Soldier": "الجندي",
 "Archer": "الرامي",
 "Guard": "الحارس",
 "Party": "الفريق",
 "System": "النظام"
};
function speakerLabel(name){return tr(name,speakerArabic[name]||name)}
function dialogueActor(name){
 if(!name||name==='Narrator')return null;
 const roles={'Moha':'Steward Moha','Legion Soldier':'Legionnaire','Legion Captain':'Atrox','Announcer':'Arena Guide'};
 const matches=state.entities.filter(e=>e.visible&&!e.down);
 return matches.find(e=>e.name===name)||matches.find(e=>e.name===roles[name]||e.name.startsWith(name+' '))||null;
}
let dialoguePair=[];
function faceDialogueSpeaker(lines,index){
 const current=dialogueActor(lines[index].speaker);
 if(!current){if(!dialoguePair.some(e=>state.entities.includes(e)))dialoguePair=state.entities.filter(e=>e.visible&&(e===state.player||e.name==='Raymond'||e.name==='Atrox'));return}
 if(['rally','finale_gate','finale_voyage'].includes(state.scene)){dialoguePair=[current];return}
 const others=state.entities.filter(e=>e!==current&&e.visible&&!e.down);
 if(current.name==='Raymond'&&['raymond_private','throne','finale_council'].includes(state.scene)&&!others.length){
  faceActor(current,{x:256,y:55});dialoguePair=[current];return;
 }
 let other;
 for(let d=1;d<lines.length&&!other;d++)for(const n of [index- d,index+d]){
  const candidate=dialogueActor(lines[n]?.speaker);
  if(candidate&&candidate!==current){other=candidate;break}
 }
 const leader=state.entities.includes(state.player)?state.player:null;
 const nearest=others.slice().sort((a,b)=>Math.hypot(a.x-current.x,a.y-current.y)-Math.hypot(b.x-current.x,b.y-current.y))[0];
 other=other||(leader!==current&&leader)||dialoguePair.find(e=>others.includes(e))||nearest;
 if(other)faceConversation(current,other);
 dialoguePair=other?[current,other]:[current];
}
function showDialogueLine(){faceDialogueSpeaker(dialogueLines,dialogueIndex);const l=dialogueLines[dialogueIndex];ui.speaker.dataset.character=l.speaker;ui.speaker.textContent=speakerLabel(l.speaker);fullDialogueText=playerNamedText(state.lang==='ar'?(l.ar||AR_TEXT[l.text]||l.text):l.text);ui.text.textContent='';typing=true;let i=0;if(typeTimer)clearInterval(typeTimer);typeTimer=setInterval(()=>{if(i>=fullDialogueText.length){finishTyping();return}ui.text.textContent+=fullDialogueText[i];if(fullDialogueText[i].trim())textBlip(i);i++},state.finalePlaying&&!state.fastText?(state.scene==='finale_gate'?46:34):24)}
function finishTyping(){if(typeTimer)clearInterval(typeTimer);typeTimer=null;ui.text.textContent=fullDialogueText;typing=false}
function advanceDialogue(){if(state.mode!=='dialogue')return;if(typing){finishTyping();return}dialogueIndex++;if(dialogueIndex<dialogueLines.length){showDialogueLine();return}ui.dialogue.classList.add('hidden');const resolve=state.dialogueResolve;state.dialogueResolve=null;state.mode='cutscene';if(resolve)resolve()}
function askChoice({speaker,text,options}){return new Promise(resolve=>{state.choiceResolve=resolve;state.choiceOptions=options;state.choiceSelected=0;state.choiceLocked=true;state.mode='choice';faceDialogueSpeaker([{speaker}],0);ui.speaker.dataset.character=speaker;ui.speaker.textContent=speakerLabel(speaker);ui.text.textContent=playerNamedText(state.lang==='ar'?(AR_TEXT[text]||text):text);ui.continue.classList.add('hidden');$('dialogue-skip').classList.add('hidden');ui.options.classList.remove('hidden');ui.dialogue.classList.remove('hidden');renderDialogueChoices();if(state.choiceUnlockTimer)clearTimeout(state.choiceUnlockTimer);state.choiceUnlockTimer=setTimeout(()=>{state.choiceUnlockTimer=null;if(state.mode==='choice'||(state.mode==='dev'&&state.devReturn==='choice')||(state.mode==='devAuth'&&state.devAuthReturn==='choice')){state.choiceLocked=false;renderDialogueChoices()}},1000)})}
function renderDialogueChoices(){ui.options.replaceChildren();state.choiceOptions.forEach((option,i)=>{const button=document.createElement('button');button.type='button';button.className='dialogue-choice'+(i===state.choiceSelected?' selected':'');button.textContent=state.lang==='ar'?option.ar:option.label;button.disabled=state.choiceLocked;button.addEventListener('click',e=>{e.stopPropagation();resolveChoice(i)});ui.options.appendChild(button)})}
function resolveChoice(index){if(state.mode!=='choice'||state.choiceLocked)return;const option=state.choiceOptions[index];const resolve=state.choiceResolve;state.choiceResolve=null;state.choiceOptions=[];state.choiceLocked=false;ui.options.classList.add('hidden');ui.dialogue.classList.add('hidden');state.mode='cutscene';if(resolve)resolve(option.value)}
function flash(color='#fff'){ui.flash.style.background=color;ui.flash.classList.remove('hit','alarm');void ui.flash.offsetWidth;ui.flash.classList.add('hit')}function alarmFlash(){ui.flash.style.background='#b40018';ui.flash.classList.remove('hit','alarm');void ui.flash.offsetWidth;ui.flash.classList.add('alarm')}function moveTo(e,x,y,speed=1.5){
 const session=state.session;
 return new Promise(resolve=>{
  let last=performance.now();
  function step(now){
   if(session!==state.session)return;
   const dx=x-e.x,dy=y-e.y,distance=Math.hypot(dx,dy);
   const travel=speed*Math.min(3,Math.max(0,now-last)*.06);
   last=now;
   if(distance<=travel){moveMapActor(e,x,y);resolve();return;}
   moveMapActor(e,e.x+dx/distance*travel,e.y+dy/distance*travel);
   requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
 });
}
async function fadeScene(scene){ui.fade.classList.add('on');await sleep(360);state.scene=scene;if(['throne','raymond_private','finale_council'].includes(scene))startMusic('sanctum');else if(state.finalePlaying&&scene==='finale_voyage')startMusic('voyage');ui.fade.classList.remove('on');await sleep(320)}
async function startGame(){const token=state.session;await unlockAudio();if(token!==state.session)return;startMusic('sanctum');ui.title.classList.add('hidden');ui.end.classList.add('hidden');state.mode='cutscene';state.scene='throne';state.entities=[entity('Raymond',260,150,colors.Raymond),entity('Atrox',178,188,colors.Atrox)];setObjective('prologue');await say([{speaker:'Raymond',text:'Commander Atrox. The village of Elaris is hiding an object beneath its shrine.'},{speaker:'Atrox',text:'You want the object recovered. Why send a legion?'},{speaker:'Raymond',text:'Because the villagers have protected it for generations. People mistake long possession for rightful ownership.'},{speaker:'Atrox',text:'And if they resist?'},{speaker:'Raymond',text:'Bring me what lies beneath the shrine. The rest is your judgment.'}]);if(token!==state.session)return;await moveTo(find('Atrox'),503,188,2.8);if(token!==state.session)return;state.entities=state.entities.filter(e=>e.name!=='Atrox');await say([D('Raymond','The lock is weakening, my lord. Tonight, we take the first key.','القفل يضعف يا سيدي. الليلة سنأخذ المفتاح الأول.'),D('Raymond','They will call it my victory. You and I know I have only done what you required of me.','سيسمونها انتصاري. أنا وأنت نعرف أنني لم أفعل سوى ما طلبته مني.'),D('Raymond','If this is a trial, I will not fail you. Let your silence mean that I am still worthy.','إن كان هذا اختبارًا، فلن أخذلك. ليكن صمتك علامة على أنني ما زلت أهلًا لخدمتك.')]);if(token!==state.session)return;await fadeScene('village');if(token===state.session){setupVillage();startMusic('village')}}
function setupVillage(){state.burning=false;state.relic=false;state.villageEntities=null;state.entities=[entity('Astro',174,220,colors.Astro,{dir:'up'}),entity('Mira',348,155,'#a76576',{talk:[{speaker:'Mira',text:'Elder Aziz is inside the shrine. He asked for you this morning.'},{speaker:'Mira',text:'The north road has been too quiet today. Even the traders avoided it.'}]}),entity('Tomas',136,158,colors.Villager,{talk:[{speaker:'Tomas',text:'My chickens refuse to go near your telescope. I think they find it judgmental.'}]}),entity('Child',330,229,'#d09b4f',{talk:[{speaker:'Child',text:'Astro, are stars really holes in the sky? Mira says I should stop asking.'}]})];state.player=find('Astro');state.mode='map';ui.map.classList.remove('hidden');setObjective('talk')}
async function beginVillageStory(){state.mode='cutscene';ui.map.classList.add('hidden');await say([{speaker:'Elder Aziz',text:'Astro. You have been staring through that lens since sunrise.'},{speaker:'Astro',text:'Incorrect. I stopped twice to recalibrate it and once because my left eye began producing duplicate stars.'},{speaker:'Elder Aziz',text:'Did you also stop to eat?'},{speaker:'Astro',text:'Half a pear at approximately noon. Nutritionally inadequate, but technically an affirmative answer.'},{speaker:'Elder Aziz',text:'And what did your technically nourished mind discover?'},{speaker:'Astro',text:'The eastern star of the Crowned Constellation is gone. Not obscured. Not displaced. Gone.'},{speaker:'Elder Aziz',text:'Then put away your instruments. There are some truths we survived by leaving buried.'},{speaker:'Narrator',text:'A heavy crash rolled through the stone chamber. Dust fell from the ceiling.'},{speaker:'Astro',text:'That was not thunder.'},{speaker:'Elder Aziz',text:'Outside. Now.'}]);await leaveShrineForRaid()}
async function leaveShrineForRaid(){const elder=find('Elder Aziz');state.mode='cutscene';ui.fade.classList.add('on');await sleep(360);state.entities=state.villageEntities;state.villageEntities=null;state.player.x=270;state.player.y=188;state.player.dir='up';elder.x=237;elder.y=166;elder.dir='up';state.entities.push(elder);state.scene='village';ui.fade.classList.remove('on');await sleep(320);await say([{speaker:'Narrator',text:'Astro and Elder Aziz reached the square only moments before armored figures appeared on the north road.'}]);await sleep(500);runRaid()}
function elarisShrineSideLane(east){
 const shrine=exteriorArtRect(ELARIS_SHRINE);
 const home=exteriorArtRect(ELARIS_HOMES[east?1:0]);
 return Math.round(east?(shrine.x+shrine.w+home.x)/2:(home.x+home.w+shrine.x)/2);
}
async function enterElarisRaid(actor,x,y,speed){
 await moveTo(actor,actor.x,y,speed);
 await moveTo(actor,x,y,speed);
}
async function runRaid(){setObjective('legion');const villagers=['Mira','Tomas','Child'].map(find);await Promise.all(villagers.map((v,i)=>moveTo(v,i===1?28:484,230+i*10,2.4)));
 const west=elarisShrineSideLane(false),east=elarisShrineSideLane(true);
 const s1=entity('Soldier A',west,-32,colors.Soldier);
 const s2=entity('Soldier B',east,-32,colors.Soldier);
 const s3=entity('Soldier C',west,-32,colors.Soldier);
 const s4=entity('Soldier D',east,-32,colors.Soldier);
 state.entities.push(s3,s4);
 await Promise.all([enterElarisRaid(s3,198,124,2.25),enterElarisRaid(s4,309,124,2.25)]);
 s3.dir='down';s4.dir='down';
 state.entities.push(s1,s2);
 await Promise.all([enterElarisRaid(s1,192,174,2.45),enterElarisRaid(s2,317,174,2.45)]);
 s1.dir='down';s2.dir='down';
 await sleep(220);
 const atrox=entity('Atrox',east,-36,colors.Atrox);
 state.entities.push(atrox);
 await enterElarisRaid(atrox,267,149,2.25);
 for(const guard of [s1,s2,s3,s4])faceActor(guard,find('Elder Aziz'));await say([{speaker:'Atrox',text:'By decree of the Brotherhood of Dawn, Elaris will surrender the relic sealed beneath its shrine.'},{speaker:'Elder Aziz',text:'There is no relic here.'},{speaker:'Atrox',text:'Then you have nothing to lose by letting us search.'},{speaker:'Elder Aziz',text:'Men who arrive with torches rarely care what they find.'},{speaker:'Atrox',text:'Search every building. Break the shrine seal.'}]);state.burning=true;startMusic('tension');alarmFlash();fireSfx();await sleep(1000);s1.dir='left';s2.dir='right';await Promise.all([enterElarisRaid(s1,90,144,2),enterElarisRaid(s2,425,144,2)]);await say([{speaker:'Narrator',text:'Doors splintered. Flames climbed the roofs as the legion closed around the shrine.'}]);const elder=find('Elder Aziz');await moveTo(elder,242,126,1.3);await moveTo(s3,220,134,2);faceActor(s3,elder);flash('#d8d7e1');elder.down=true;await say([{speaker:'Narrator',text:'When Elder Aziz blocked the shrine steps, a legion blade struck him down.'}]);await moveTo(state.player,269,190,2.2);await say([{speaker:'Astro',text:'Stop! The shrine predates the entire Brotherhood of Dawn. You have no idea what you are opening.'},{speaker:'Atrox',text:'Step aside, scholar.'}]);const decision=await askChoice({speaker:'Astro',text:'What will Astro do?',options:[{label:'Fight',ar:'قاتل',value:'fight'},{label:'Beg for mercy',ar:'توسّل طلبًا للرحمة',value:'mercy'}]});if(decision==='fight'){await say([{speaker:'Astro',text:'No. Everyone I care about is behind me.'},{speaker:'Atrox',text:'Then show me what your stars taught you.'}]);startBattle()}else{await say([{speaker:'Astro',text:'Please. Take whatever you came for, but spare the villagers.'},{speaker:'Atrox',text:'You offer me what I already possess and call it a bargain.'},{speaker:'Astro',text:'Then consider it a request, not a bargain.'},{speaker:'Atrox',text:'Kneel, scholar, and watch how mercy looks from the ground.'},{speaker:'Narrator',text:'Astro lowered himself before the legion. Atrox did not order a single torch extinguished.'}]);state.player.down=true;continueAfterAtrox(false)}}
const mainCommands=[['ATTACK','attack','هجوم'],['GUTS','special','عزيمة'],['SPELL','magic','سحر'],['ITEM','item','أغراض'],['AUTO','auto','تلقائي'],['RUN','run','هروب']],magicCommands=[['STAR BOLT','starbolt','سهم نجمي'],['ORBIT SHIELD','shield','درع مداري'],['← BACK','back','رجوع →']];
function startBattle(){startMusic('battle');state.mode='battle';state.battle={hp:84,ap:36,enemyHP:800,turn:0,shield:false,defend:false,busy:false,heroLunge:0,enemyShake:false,magic:false};state.battleMenu='main';state.selected=0;ui.dialogue.classList.add('hidden');ui.map.classList.add('hidden');ui.battle.classList.remove('hidden');setObjective('battle');setBattleMessage(tr('Atrox blocks the burning shrine. Astro stands alone.','يقف أتروكس أمام المزار المحترق. أسترو يواجهه وحيدًا.'));renderCommands();updateStats()}
function setBattleMessage(t){ui.message.textContent=t}function renderCommands(){const list=state.battleMenu==='main'?mainCommands:magicCommands;ui.commands.classList.toggle('magic-menu',state.battleMenu==='magic');ui.commands.replaceChildren();list.forEach(([label,action,arLabel],i)=>{const b=document.createElement('button');b.type='button';b.className='command'+(i===state.selected?' selected':'');b.textContent=state.lang==='ar'?arLabel:label;b.dataset.action=action;b.disabled=state.battle.busy;b.addEventListener('click',()=>chooseCommand(action));ui.commands.appendChild(b)})}function updateStats(){const b=state.battle;$('level-text').textContent=state.level;$('hp-text').textContent=Math.max(0,b.hp);$('ap-text').textContent=b.ap;$('hp-meter').style.width=Math.max(0,b.hp/84*100)+'%';$('ap-meter').style.width=Math.max(0,b.ap/36*100)+'%'}
function chooseCommand(action){const b=state.battle;if(!b||b.busy)return;if(action==='magic'){battleSfx('menu');state.battleMenu='magic';state.selected=0;renderCommands();return}if(action==='back'){battleSfx('menu');state.battleMenu='main';state.selected=0;renderCommands();return}if(action==='item'){battleSfx('menu');setBattleMessage(tr('Astro opens his satchel. It contains six notebooks and no useful items.','يفتح أسترو حقيبته. بداخلها ستة دفاتر ولا يوجد أي غرض مفيد.'));return}if(action==='starbolt'&&b.ap<7){battleSfx('menu');setBattleMessage(tr('Not enough AP.','لا توجد طاقة كافية.'));return}if(action==='shield'&&b.ap<6){battleSfx('menu');setBattleMessage(tr('Not enough AP.','لا توجد طاقة كافية.'));return}b.busy=true;b.defend=false;state.battleMenu='main';renderCommands();let msg='';if(action==='attack'||action==='auto'){const dmg=action==='auto'?4:6+Math.floor(Math.random()*5);b.enemyHP-=dmg;b.heroLunge=-75;b.enemyShake=true;battleSfx('attack');flash('#fff0c2');msg=tr(`Astro attacks. ${dmg} damage. Atrox does not step back.`,`يهاجم أسترو ويسبب ${dmg} من الضرر. لا يتراجع أتروكس خطوة واحدة.`);setTimeout(()=>{b.heroLunge=0;b.enemyShake=false},300)}if(action==='starbolt'){b.ap-=7;const dmg=9+Math.floor(Math.random()*6);b.enemyHP-=dmg;b.magic=true;b.enemyShake=true;battleSfx('magic');flash('#bfa7ff');msg=tr(`Star Bolt strikes for ${dmg} damage. Atrox raises one arm and absorbs the impact.`,`يصيب السهم النجمي أتروكس ويسبب ${dmg} من الضرر. يرفع أتروكس ذراعًا واحدة ويمتص الصدمة.`);setTimeout(()=>{b.magic=false;b.enemyShake=false},450)}if(action==='shield'){b.ap-=6;b.shield=true;battleSfx('shield');msg=tr('Three pale stars form an Orbit Shield around Astro.','تتشكل ثلاث نجوم باهتة كدرع مداري حول أسترو.')}if(action==='special'){b.ap=Math.max(0,b.ap-4);battleSfx('menu');msg=tr('ANALYZE — ATROX · HP: unreadable · Resistance: overwhelming · Victory estimate: 0.4%.','تحليل — أتروكس · الصحة: غير قابلة للقراءة · المقاومة: ساحقة · احتمال النصر: 0.4%.')}if(action==='run'){battleSfx('menu');msg=tr('Astro searches for an escape. Atrox has already closed every path.','يبحث أسترو عن طريق للهرب، لكن أتروكس أغلق كل المسارات بالفعل.')}b.turn++;setBattleMessage(msg);updateStats();setTimeout(enemyTurn,950)}
function enemyTurn(){const b=state.battle;if(b.turn>=3){setBattleMessage(tr("Atrox uses COMMANDER'S VERDICT. Astro's spell breaks before it can form.",'يستخدم أتروكس حكم القائد. تتحطم تعويذة أسترو قبل أن تتشكل.'));battleSfx('defeat');flash('#e8ebff');b.hp=0;updateStats();setTimeout(finishBattle,1250);return}let dmg=b.turn===1?22:34,move=b.turn===1?'IRON DISCIPLINE':'SHIELD BREAKER',moveAr=b.turn===1?'الانضباط الحديدي':'محطم الدروع';if(b.shield)dmg=Math.ceil(dmg*.58);if(b.defend)dmg=Math.ceil(dmg*.5);b.shield=false;b.defend=false;b.hp=Math.max(1,b.hp-dmg);battleSfx('enemy');flash('#d75b63');setBattleMessage(tr(`Atrox uses ${move}. ${dmg} damage. “Is that all the stars gave you?”`,`يستخدم أتروكس ${moveAr} ويسبب ${dmg} من الضرر. «هل هذا كل ما منحَتك إياه النجوم؟»`));updateStats();b.busy=false;renderCommands()}
async function finishBattle(){startMusic('tension');ui.battle.classList.add('hidden');state.mode='cutscene';state.scene='village';state.player.down=true;const atrox=find('Atrox');atrox.x=270;atrox.y=178;await say([{speaker:'Atrox',text:'You had courage. No judgment.'},{speaker:'Astro',text:'I only needed... one clear shot.'},{speaker:'Atrox',text:'You had three. I allowed them.'}]);continueAfterAtrox(true)}
async function leaveElarisByNorthRoad(actor,exitY,speed,delay=0){
 const session=state.session;
 if(delay){await sleep(delay);if(session!==state.session)return;}
 const lane=elarisShrineSideLane(actor.name==='Shadow'||actor.name==='Astro'||actor.x>ELARIS_SHRINE.door.x);
 const roadY=Math.max(actor.y,126);
 await moveTo(actor,actor.x,roadY,speed);
 await moveTo(actor,lane,roadY,speed);
 await moveTo(actor,lane,exitY,speed);
}
async function continueAfterAtrox(fought){state.mode='cutscene';state.scene='village';state.relic=true;const carrier=find('Soldier B');carrier.x=280;carrier.y=116;carrier.carrying=true;const finalAtroxLine=fought?'A man who could not protect his own village is no threat to us.':'Look at him. A coward who begs on his knees is no threat to us. Leave him here.';await say([{speaker:'Narrator',text:'The shrine doors broke. A soldier emerged carrying a crystal case. Inside it rested a fragment of lightless stone.'},{speaker:'Atrox',text:'We have what we came for. Leave the scholar.'},{speaker:'Legion Soldier',text:'He saw everything.'},{speaker:'Atrox',text:finalAtroxLine}]);const troops=['Atrox','Soldier A','Soldier B','Soldier C','Soldier D'].map(find);
 const [commander,westGuard,relicGuard,westRank,eastRank]=troops;
 // The commander crosses the plaza below the standing guards and clears the lane first.
 await moveTo(commander,commander.x,150,2.2);
 await leaveElarisByNorthRoad(commander,-48,2.35);
 await Promise.all([leaveElarisByNorthRoad(westRank,-36,2.5),leaveElarisByNorthRoad(eastRank,-36,2.5)]);
 await Promise.all([leaveElarisByNorthRoad(westGuard,-36,2.5),leaveElarisByNorthRoad(relicGuard,-36,2.5)]);
 startMusic('village');const elder=find('Elder Aziz');state.player.down=false;await moveTo(state.player,238,146,1.2);state.player.down=true;await say([{speaker:'Astro',text:'Do not move. I can calculate the safest way to—'},{speaker:'Elder Aziz',text:'Listen. The constellation was never a crown.'},{speaker:'Astro',text:'Save your strength. Please.'},{speaker:'Elder Aziz',text:'It was a lock. Find the missing star... before they find the door.'},{speaker:'Narrator',text:'Elder Aziz died before Astro could ask what the words meant.'}]);elder.visible=false;state.player.down=false;state.player.x=224;state.player.y=162;const shadow=entity('Shadow',250,302,colors.Shadow,{dir:'up'});state.entities.push(shadow);await moveTo(shadow,250,196,1.45);await say([{speaker:'Shadow',text:'You are alive.'},{speaker:'Astro',text:'An optimistic interpretation of the available evidence.'},{speaker:'Shadow',text:'Can you stand?'},{speaker:'Astro',text:'Not according to any medically useful definition.'},{speaker:'Narrator',text:'Shadow pulled him up. For an instant, Astro saw the stranger’s shadow move before he did.'},{speaker:'Astro',text:'Your shadow is temporally misaligned by almost half a second.'},{speaker:'Shadow',text:'You are bleeding.'},{speaker:'Astro',text:'Both observations can be true.'},{speaker:'Shadow',text:'Who did this?'},{speaker:'Astro',text:'Atrox. Commander of the Iron Legion. He took something from beneath the shrine.'},{speaker:'Narrator',text:'Black residue clung to Astro’s sleeve. The mark beneath Shadow’s coat answered with a cold pulse.'},{speaker:'Shadow',text:'Which road?'},{speaker:'Astro',text:'North. But that is an entire legion, and you are one unusually ominous man.'},{speaker:'Shadow',text:'Then keep up.'},{speaker:'Astro',text:'You do not even know my name.'},{speaker:'Shadow',text:'Tell me while we walk.'}]);await Promise.all([leaveElarisByNorthRoad(shadow,-44,1.65),leaveElarisByNorthRoad(state.player,-16,1.6,350)]);await showRaymondEnding()}
async function showRaymondEnding(){await fadeScene('throne');state.entities=[entity('Raymond',260,150,colors.Raymond)];await say([{speaker:'Narrator',text:'High above the valley, Raymond opened his eyes before an empty throne.'},{speaker:'Raymond',text:'The key is moving, my lord.'},{speaker:'Narrator',text:'No voice answered him.'},{speaker:'Raymond',text:'Yes. Shadow will come to us.'},{speaker:'Raymond',text:'He simply does not know why yet.'}]);state.mode='end';ui.end.classList.remove('hidden');setObjective('complete')}
function reset(){state.playerName='';resetJoystick();stopMusic();if(typeTimer)clearInterval(typeTimer);if(state.choiceUnlockTimer)clearTimeout(state.choiceUnlockTimer);typing=false;state.mode='title';state.scene='village';state.entities=[];state.villageEntities=null;state.player=null;state.level=1;state.burning=false;state.relic=false;state.choiceResolve=null;state.choiceOptions=[];state.choiceLocked=false;state.choiceUnlockTimer=null;state.battle=null;ui.title.classList.remove('hidden');ui.map.classList.add('hidden');ui.dialogue.classList.add('hidden');ui.options.classList.add('hidden');ui.battle.classList.add('hidden');ui.end.classList.add('hidden');applyLanguage()}
function navigateBattle(key){const list=battleCommandList();if(state.battleMenu==='item'){const delta={ArrowUp:-2,ArrowDown:2,ArrowLeft:-1,ArrowRight:1}[key]||0;state.selected=(state.selected+delta+list.length)%list.length}else if(state.battleMenu!=='main'){if(key==='ArrowUp')state.selected=(state.selected-1+list.length)%list.length;if(key==='ArrowDown')state.selected=(state.selected+1)%list.length}else{if(key==='ArrowUp'&&state.selected<4)state.selected=(state.selected+3)%4;if(key==='ArrowDown'&&state.selected<4)state.selected=(state.selected+1)%4;if(key==='ArrowLeft')state.selected=state.selected===5?0:4;if(key==='ArrowRight')state.selected=state.selected===4?0:5}battleSfx('menu');renderCommands()}

