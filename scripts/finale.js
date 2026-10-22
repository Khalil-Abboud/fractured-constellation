'use strict';
// Finale scenes, music score logic, and Part I ending.
// Original offline scores, with distinct public resolve, private fear, and marching drums.
const FINALE_SCORES={
 voyage:[146.83,196,220,293.66,261.63,220,196,174.61,146.83,174.61,220,293.66,349.23,293.66,261.63,220,196,220,261.63,349.23,329.63,293.66,220,196,174.61,196,220,261.63,293.66,220,196,146.83],
 finale:[146.83,146.83,220,293.66,261.63,220,196,220,174.61,174.61,261.63,349.23,329.63,293.66,261.63,220,196,220,293.66,392,349.23,329.63,293.66,261.63,220,261.63,293.66,349.23,329.63,293.66,220,146.83],
 panic:[73.42,77.78,73.42,69.30,82.41,77.78,73.42,65.41,73.42,87.31,82.41,77.78,69.30,73.42,65.41,61.74]
};
function scoreNoise(duration,freq,volume,destination,delay=0){if(!audio.ctx||!destination||!audio.ctx.createBiquadFilter)return;const ac=audio.ctx,buffer=ac.createBuffer(1,Math.ceil(ac.sampleRate*duration),ac.sampleRate),data=buffer.getChannelData(0);let seed=317;for(let i=0;i<data.length;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;data[i]=(seed/4294967296*2-1)}const source=ac.createBufferSource(),filter=ac.createBiquadFilter(),gain=ac.createGain(),now=ac.currentTime+delay;source.buffer=buffer;filter.type='bandpass';filter.frequency.value=freq;filter.Q.value=.6;gain.gain.setValueAtTime(.0001,now);gain.gain.exponentialRampToValueAtTime(volume,now+.06);gain.gain.exponentialRampToValueAtTime(.0001,now+duration);source.connect(filter);filter.connect(gain);gain.connect(destination);source.start(now);source.stop(now+duration+.02)}
function legionRoar(){state.legionPulseAt=performance.now();if(!audio.ctx||audio.ctx.state!=='running')return;scoreNoise(1.45,650,.28,audio.sfxGain);scoreNoise(1.15,1500,.13,audio.sfxGain,.12);for(const[f,i]of[98,110,123.47,146.83,164.81,196].map((f,i)=>[f,i])){tone(f,1.20,'sawtooth',.065,audio.sfxGain,i*.035);tone(f*2,.9,'triangle',.055,audio.sfxGain,.14+i*.025)}tone(57,.35,'sine',.34,audio.sfxGain)}
const scorePrevious={musicStep,startMusic,chapterObjective,drawArmyGate};
musicStep=function(){const mode=audio.mode;if(!['voyage','finale','panic','legion','sanctum'].includes(mode)){scorePrevious.musicStep();return}if(!audio.on||!audio.ctx||audio.ctx.state!=='running')return;if(mode==='sanctum'){const note=[146.83,155.56,146.83,138.59,130.81,116.54,138.59,110][Math.floor(audio.step++/4)%8];tone(note,2.2,'triangle',.38,audio.musicGain);tone(note*1.5,2.0,'sine',.26,audio.musicGain);tone(note*2,1.9,'triangle',.18,audio.musicGain);if(audio.step%4===1)tone(note*4,2.1,'sine',.24,audio.musicGain);return}const score=FINALE_SCORES[mode==='legion'?'finale':mode],step=audio.step++,i=step%score.length,note=score[i];if(mode==='panic'){tone(note,.64,'triangle',.48,audio.musicGain);tone(note*2,.52,'triangle',.24,audio.musicGain);tone(note*4,.58,'triangle',.18,audio.musicGain);if(i%2===0)tone(note/2,.8,'triangle',.28,audio.musicGain);if(i%4===2){tone(note*4,.8,'sine',.19,audio.musicGain,.12);tone(note*4*1.02,.8,'sine',.12,audio.musicGain,.12)}if(i%4===0){tone(48,.13,'sine',.46,audio.musicGain);tone(96,.12,'triangle',.22,audio.musicGain);tone(48,.12,'sine',.30,audio.musicGain,.17)}return}tone(note,.30,'triangle',.26,audio.musicGain);tone(note*2,.19,'square',.09,audio.musicGain,.03);if(i%2===0){tone(note/2,.43,'triangle',.17,audio.musicGain);tone(55,.15,'sine',.33,audio.musicGain);tone(92,.08,'triangle',.11,audio.musicGain)}else scoreNoise(.13,1800,.11,audio.musicGain);if(i%4===0){tone(note*1.5,.70,'triangle',.12,audio.musicGain);tone(note*2,.65,'sine',.10,audio.musicGain)}if(mode==='legion'&&step>0&&step%16===0)legionRoar()};
startMusic=async function(mode){if(!['voyage','finale','panic','legion','sanctum'].includes(mode)){await scorePrevious.startMusic(mode);return}audio.mode=mode;audio.step=0;audio.generation++;const generation=audio.generation;if(audio.timer)clearInterval(audio.timer);audio.timer=null;if(!audio.on)return;const ready=await unlockAudio();if(!ready||generation!==audio.generation||!audio.on)return;musicStep();audio.timer=setInterval(musicStep,mode==='sanctum'?650:mode==='panic'?330:mode==='voyage'?245:215)};
finalePause=async function(token,ms=1500){await sleep(ms);return token===state.session};
async function armyDialogue(lines,token){for(const line of lines){if(!await finalePause(token,1400))return false;if(line.speaker==='Legion')legionRoar();await say([line]);if(token!==state.session)return false}return finalePause(token,1800)}
chapterObjective=function(){scorePrevious.chapterObjective();if(state.finalePlaying)ui.objective.textContent=tr('VALDORN · A CITY HOLDS ITS BREATH','فالدور · مدينة تحبس أنفاسها')};
playPartOneFinale=async function(){
 if(state.finalePlaying)return;const token=state.session;state.finalePlaying=true;clearMovement();clearBButton();ui.end.classList.add('hidden');saveCheckpoint('harbor_ready');stopMusic();audio.epicOffset=0;
 // Private fear and military orders precede the voyage. The epic score then never breaks.
 await fadeScene('raymond_private');if(token!==state.session)return;setFinaleScene('raymond_private',[entity('Raymond',272,147,colors.Raymond),entity('Messenger',179,146,'#84949c')]);startMusic('sanctum');
 await say([D('Messenger','Bellhaven has opened the prisons, commander. Malrec is alive. His ledgers are being copied.','فتحت بيلهافن السجون يا قائدي. مالريك حي. ويجري نسخ سجلاته.'),D('Messenger','The marked swordsman and his companions are preparing a ship. Bellhaven’s soldiers mean to escort them to Valdorn.','يجهّز المبارز ذو العلامة ورفاقه سفينة. وينوي جنود بيلهافن مرافقتهم إلى فالدور.'),D('Raymond','Who else has read your report?','من قرأ تقريرك غيري؟'),D('Messenger','Only the harbor watch. I came directly to you.','حرس الميناء فقط. جئت إليك مباشرة.'),D('Raymond','Keep it that way. Send for Atrox. Tell the square we are strengthening the watch. Nothing more.','فليبقَ الأمر كذلك. استدعِ أتروكس. أخبر أهل الساحة أننا نعزز الحراسة. لا أكثر.')]);if(token!==state.session)return;await moveTo(find('Messenger'),478,172,3.1);if(token!==state.session)return;state.entities=[find('Raymond')];if(!await finalePause(token,1200))return;
 await say([
 D('Raymond','He kept the ledgers. I told him to burn the names after each transfer.','احتفظ بالسجلات. أمرته أن يحرق الأسماء بعد كل عملية نقل.'),
 D('Raymond','I fed them when the old families shut their gates. Now a few strangers will show them my seal, and everything I built will be judged by the names beneath it.','أطعمتهم حين أغلقت العائلات القديمة بواباتها. والآن سيريهم بضعة غرباء ختمي، وسيُحكم على كل ما بنيته من خلال الأسماء التي تحته.'),
 D('Raymond','They needed me. They still need me. Gratitude should not be so easily undone.','احتاجوا إليّ. وما زالوا يحتاجونني. لا ينبغي أن يزول الامتنان بهذه السهولة.'),
 D('Raymond','My lord... the shrines, the fragments, every life you asked for. I surrendered them all.','يا سيدي... المزارات، والشظايا، وكل حياة طلبتها. سلّمتها لك جميعًا.'),
 D('Raymond','You said the marked one would come when the lock began to fail. He is coming. I do not know whether to welcome him or fear him.','قلت إن ذا العلامة سيأتي حين يبدأ القفل بالانهيار. إنه قادم. لا أعرف إن كان عليّ أن أرحب به أم أخاف منه.'),
 D('Raymond','I thought obedience would free me from doubt. Yet every night I fear I have misunderstood you.','ظننت أن الطاعة ستحررني من الشك. ومع ذلك أخاف كل ليلة أنني أسأت فهمك.')
 ]);if(token!==state.session)return;await moveTo(find('Raymond'),256,122,1.3);if(token!==state.session)return;find('Raymond').dir='up';if(!await finalePause(token,1000))return;
 await say([
 D('Raymond','Was Bellhaven meant to fall? Or did I fail you?','هل كان سقوط بيلهافن مقصودًا؟ أم أنني خذلتك؟'),
 D('Raymond','No. I remember your words. I was awake. I know I was awake.','لا. أتذكر كلماتك. كنت مستيقظًا. أعرف أنني كنت مستيقظًا.'),
 D('Narrator','The candles guttered. Nothing moved upon the empty throne.','اضطرب لهب الشموع. لم يتحرك شيء فوق العرش الخالي.'),
 D('Raymond','If I turn him away, I lose the key. If I let him in, he brings those names into my city.','إن أبعدته خسرت المفتاح. وإن سمحت له بالدخول جلب تلك الأسماء إلى مدينتي.'),
 D('Raymond','Outside these walls they call me their protector. I can order men to face death. Why can I not make myself stand beside them?','خارج هذه الجدران يسمونني حاميهم. أستطيع أن آمر الرجال بمواجهة الموت. فلماذا أعجز عن إجبار نفسي على الوقوف إلى جانبهم؟'),
 D('Raymond','I built their hope around my face. If they see fear in it, what will be left of me?','بنيت أملهم حول صورتي. إن رأوا الخوف فيها، فماذا سيبقى مني؟'),
 D('Raymond','You need not explain, my lord. Tell me what you require, and I will obey.','لست مضطرًا إلى التفسير يا سيدي. قل لي ما تطلبه، وسأطيع.'),
 D('Raymond','Take the city. Take their praise. I can surrender everything, if I can still believe you have a place for me.','خذ المدينة. خذ مديحهم. أستطيع أن أتنازل عن كل شيء، إن استطعت أن أظل مؤمنًا بأن لي مكانًا عندك.')
 ]);if(token!==state.session)return;if(!await finalePause(token,1800))return;
 await say([
 D('Raymond','They still believe in me. When I enter the square, they must see certainty. Atrox can hold the gates. He must.','ما زالوا يؤمنون بي. حين أدخل الساحة، يجب أن يروا اليقين. يستطيع أتروكس الدفاع عن البوابات. يجب أن يستطيع.'),
 D('Raymond','The marked one will be brought alive, as you commanded. If this ruin is your will, I will call it purpose.','سيُحضر ذو العلامة حيًا، كما أمرت. إن كان هذا الخراب مشيئتك، فسأسميه غاية.')
 ]);if(token!==state.session)return;
 await fadeScene('finale_council');if(token!==state.session)return;setFinaleScene('finale_council',[entity('Raymond',281,132,colors.Raymond),entity('Atrox',161,142,colors.Atrox)]);startMusic('sanctum');
 await say([D('Raymond','Atrox. Reinforce the harbor chains and every city gate. Double the citadel watch. The marked swordsman must reach me alive.','أتروكس. عزز سلاسل الميناء وكل بوابة للمدينة. ضاعف حراسة القلعة. يجب أن يصلني المبارز ذو العلامة حيًا.'),D('Atrox','The report describes one ship. Are we expecting another force behind it?','يصف التقرير سفينة واحدة. هل نتوقع قوة أخرى خلفها؟'),D('Raymond','We are expecting people who have turned a city against us. I will not gamble with Valdorn.','نتوقع أشخاصًا قلبوا مدينة علينا. لن أخاطر بفالدور.'),D('Atrox','Then I take the outer gate. My soldiers will hold the line. No fighting in the civilian streets.','إذًا أتولى البوابة الخارجية. سيصمد جنودي. لن يكون هناك قتال في شوارع المدنيين.'),D('Raymond','Agreed. I will speak to the square. They need to see that their protectors stand together.','اتفقنا. سأخاطب أهل الساحة. يجب أن يروا حماتهم واقفين معًا.')]);if(token!==state.session)return;await moveTo(find('Raymond'),478,172,2.2);if(token!==state.session)return;state.entities=[find('Atrox')];if(!await finalePause(token,1500))return;
 await say([D('Atrox','(To himself) All this... for a handful of children? I have seen him hear of entire armies with less fear.','(في نفسه) كل هذا... من أجل مجموعة أطفال؟ رأيته يسمع عن جيوش كاملة بخوف أقل.'),D('Atrox','Alive. Always that same order. What is the mark to him?','حيًا. الأمر نفسه في كل مرة. ماذا تعني له تلك العلامة؟'),D('Atrox','My oath is to this city. Until I know the truth, its people stay behind my shields.','قسمي لهذه المدينة. حتى أعرف الحقيقة، سيبقى أهلها خلف دروعي.')]);if(token!==state.session)return;if(!await finalePause(token,1400))return;
 await fadeScene('finale_voyage');if(token!==state.session)return;setFinaleScene('finale_voyage');startMusic('voyage');if(!await finalePause(token,1800))return;
 const voyageLines=[D('Captain Rook','Cast off! Take the reef passage. The Oathbound sails for Valdorn.','فكوا الحبال! اسلكوا ممر الشعاب. تبحر سفينة العهد نحو فالدور.'),D('Sergeant Sera','Bellhaven’s banner flies with you. We have buried enough people under the Brotherhood of Dawn’s protection.','تبحر معكم راية بيلهافن. دفنّا ما يكفي من الناس تحت حماية أخوية الفجر.'),D('Venom','Six nights. Hold on a little longer, sister.','ست ليالٍ. اصمدي قليلًا بعد يا أختي.')];if(state.michouState==='joined')voyageLines.push(D('Michou','Malrec taught me to shoot for his applause. At Valdorn, every arrow will answer to me.','علّمني مالريك أن أرمي من أجل تصفيقه. في فالدور، سيطيع كل سهم اختياري أنا.'));voyageLines.push(D('Astro','An entire citadel. Statistically alarming. Still... we have witnesses, a ledger, and a swordsman whose shadow has rather strong objections to tyranny.','قلعة كاملة. هذا مقلق إحصائيًا. ومع ذلك... لدينا شهود وسجل ومبارز لدى ظله اعتراضات قوية على الطغيان.'),D('Shadow','We bring them home. All of them.','سنعيدهم إلى بيوتهم. جميعًا.'));await say(voyageLines);if(token!==state.session)return;if(!await finalePause(token,1800))return;
 await fadeScene('rally');if(token!==state.session)return;const crowd=Array.from({length:42},(_,i)=>entity('Citizen '+i,80+(i%9)*43,153+Math.floor(i/9)*23,['#698090','#917254','#7c8e68','#9b788b'][i%4])).filter(e=>Math.hypot(e.x-256,e.y-187)>32);setFinaleScene('rally',[entity('Raymond',256,105,colors.Raymond),...crowd]);startMusic('finale');if(!await finalePause(token,1500))return;
 await say([D('Raymond','People of Valdorn! We tore down the old families’ gates together. No fear from across the sea will take our city from us.','يا أهل فالدور! هدمنا معًا بوابات العائلات القديمة. لن ينتزع خوف قادم من وراء البحر مدينتنا منا.'),D('Raymond','The Brotherhood of Dawn was born from your hunger for bread, freedom, and dignity. Tonight, it stands guard over your homes.','وُلدت أخوية الفجر من توقكم إلى الخبز والحرية والكرامة. الليلة تقف حارسة على بيوتكم.'),D('Raymond','Keep the lamps burning. Share your bread. Let no family spend this night alone. Our soldiers hold the gates; we hold each other.','أبقوا المصابيح مضاءة. اقتسموا خبزكم. لا تتركوا عائلة تقضي هذه الليلة وحدها. يحمي جنودنا البوابات، ونحمي نحن بعضنا.'),D('Citizen','One people! One dawn! No more chains!','شعب واحد! فجر واحد! لا قيود بعد اليوم!'),D('Raymond','I stood with you when we had nothing but our voices. I stand with you now. Valdorn will see the morning.','وقفت معكم حين لم نملك إلا أصواتنا. وأقف معكم الآن. ستشهد فالدور الصباح.')]);if(token!==state.session)return;if(!await finalePause(token,1600))return;
 await fadeScene('finale_gate');if(token!==state.session)return;setFinaleScene('finale_gate');startMusic('legion');legionRoar();if(!await finalePause(token,2200))return;
 if(!await armyDialogue([D('Atrox','Shields to the front. Archers on the walls. Keep the harbor road clear for the wounded.','الدروع إلى المقدمة. الرماة على الأسوار. أبقوا طريق الميناء مفتوحًا للجرحى.'),D('Legion Captain','Every shield in place. The Iron Legion stands ready!','كل درع في مكانه. الفيلق الحديدي جاهز!'),D('Legion','No more chains! No one left behind! For Valdorn!','لا قيود بعد اليوم! لن نترك أحدًا خلفنا! من أجل فالدور!'),D('Atrox','Stand with me. Whatever comes through the sea, it meets us here.','قفوا معي. أيًا يكن القادم عبر البحر، سيواجهنا هنا.')],token))return;
 await fadeScene('finale_fortress');if(token!==state.session)return;setFinaleScene('finale_fortress');startMusic('finale');if(!await finalePause(token,2000))return;
 await say([D('Captain Rook','Valdorn by dawn. Hold fast!','نصل فالدور عند الفجر. اثبتوا!'),D('Astro','They have closed every gate.','أغلقوا كل البوابات.'),D('Shadow','Then we open one.','إذًا نفتح إحداها.')]);if(token!==state.session)return;if(!await finalePause(token,2400))return;state.partOneComplete=true;state.finalePlaying=false;saveCheckpoint('part_one_complete');showPartOneEnd()
};


// Original 64-second score and voiced crowd cry are embedded as MP3, never fetched.
const FINALE_AUDIO=globalThis.RPG_AUDIO;
const renderedAudioPrevious={startMusic,stopMusic,musicStep,legionRoar,unlockAudio};
let decodedFinaleContext=null,decodedFinale={},finaleDecodeJobs={};
function decodeFinaleAudio(name,context=audio.ctx){
 if(!context?.decodeAudioData)return Promise.resolve(null);
 if(decodedFinaleContext!==context){decodedFinaleContext=context;decodedFinale={};finaleDecodeJobs={}}
 if(decodedFinale[name])return Promise.resolve(decodedFinale[name]);
 if(finaleDecodeJobs[name])return finaleDecodeJobs[name];
 finaleDecodeJobs[name]=(async()=>{try{const raw=atob(FINALE_AUDIO[name]),bytes=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)bytes[i]=raw.charCodeAt(i);const buffer=await context.decodeAudioData(bytes.buffer);if(decodedFinaleContext===context)decodedFinale[name]=buffer;return buffer}catch(_){return null}})();
 return finaleDecodeJobs[name]
}
unlockAudio=async function(){const ready=await renderedAudioPrevious.unlockAudio();if(ready&&audio.ctx?.decodeAudioData){decodeFinaleAudio('score');decodeFinaleAudio('shout');decodeFinaleAudio('sanctum')}return ready};
function stopRenderedScore(){
 const source=audio.scoreSource,gain=audio.scoreGain;if(!source)return;
 const now=audio.ctx.currentTime;if(audio.scoreTrack==='score')audio.epicOffset=((audio.scoreOffset||0)+now-(audio.scoreStartedAt??now))%source.buffer.duration;audio.scoreSource=null;audio.scoreTrack=null;audio.scoreGain=null;
 try{gain.gain.cancelScheduledValues?.(now);gain.gain.setValueAtTime(Math.max(.0001,gain.gain.value),now);gain.gain.exponentialRampToValueAtTime(.0001,now+.12);source.stop(now+.14)}catch(_){try{source.stop()}catch(_){}}
 source.onended=()=>{source.disconnect?.();gain.disconnect?.()}
}
stopMusic=function(){stopRenderedScore();renderedAudioPrevious.stopMusic()};
musicStep=function(){if(audio.scoreSource&&['voyage','finale','legion','sanctum'].includes(audio.mode)){if(!audio.on||audio.ctx?.state!=='running')return;const step=audio.step++;if(audio.mode==='legion'&&step>0&&step%32===0)legionRoar();return}renderedAudioPrevious.musicStep()};
startMusic=async function(mode){
 const epic=['voyage','finale','legion'].includes(mode),track=epic?'score':mode==='sanctum'?'sanctum':null;
 if(!track){stopRenderedScore();if(mode!=='panic')audio.epicOffset=0;await renderedAudioPrevious.startMusic(mode);return}
 // Public finale scenes share a single running source, without a restart or crossfade.
 if(audio.scoreSource&&audio.scoreTrack===track&&audio.on&&audio.ctx?.state==='running'){audio.mode=mode;return}
 stopRenderedScore();audio.mode=mode;audio.step=0;audio.generation++;const generation=audio.generation;
 if(audio.timer)clearInterval(audio.timer);audio.timer=null;if(!audio.on)return;
 const ready=await unlockAudio(),context=audio.ctx;if(!ready||generation!==audio.generation||!audio.on)return;
 const buffer=await decodeFinaleAudio(track,context);if(generation!==audio.generation||context!==audio.ctx||!audio.on)return;
 if(!buffer){await renderedAudioPrevious.startMusic(mode);return}
 const source=context.createBufferSource(),gain=context.createGain(),now=context.currentTime;
 source.buffer=buffer;source.loop=true;source.loopStart=0;source.loopEnd=buffer.duration;
 gain.gain.setValueAtTime(.0001,now);gain.gain.exponentialRampToValueAtTime(track==='sanctum'?1.12:.90,now+.10);
 source.connect(gain);gain.connect(audio.musicGain);audio.scoreSource=source;audio.scoreTrack=track;audio.scoreGain=gain;audio.scoreStartedAt=now;audio.scoreOffset=epic?(audio.epicOffset||0)%buffer.duration:0;
 source.start(now,audio.scoreOffset);audio.timer=setInterval(musicStep,400)
};
function playLegionShout(buffer,context){
 if(!buffer||context!==audio.ctx||context.state!=='running')return;
 const source=context.createBufferSource(),gain=context.createGain();source.buffer=buffer;gain.gain.value=.95;source.connect(gain);gain.connect(audio.sfxGain);source.start(context.currentTime);source.onended=()=>{source.disconnect?.();gain.disconnect?.()}
}
legionRoar=function(){
 state.legionPulseAt=performance.now();const context=audio.ctx;if(!context||context.state!=='running')return;
 if(decodedFinaleContext===context&&decodedFinale.shout){playLegionShout(decodedFinale.shout,context);return}
 if(!context.decodeAudioData){renderedAudioPrevious.legionRoar();return}
 const token=state.session;decodeFinaleAudio('shout',context).then(buffer=>{if(token!==state.session||state.scene!=='finale_gate')return;if(buffer)playLegionShout(buffer,context);else renderedAudioPrevious.legionRoar()})
};

