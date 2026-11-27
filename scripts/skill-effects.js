'use strict';
// Effect geometry is in the game's logical battlefield coordinates. Time follows
// the combat clock, so casting, impacts and afterimages accelerate together.
const IMPACT_PHASE=.42;
const effectMotifs={
 shadowSlash:'crescent',umbralSeal:'chains',shadeSiphon:'wisp',eclipseBlade:'eclipse',
 starbolt:'comet',flare:'nova',gravityWell:'singularity',galaxyWrath:'galaxy',
 shield:'ward',starMend:'mend',constellationSeal:'constellation',analysis:'reticle',
 pilfer:'purse',sabotage:'fracture',toxicFang:'fangs',poisonTick:'fangs',
 piercingShot:'arrow',pinningShot:'arrow',arrowRain:'arrow'
};
const effectFrames=Object.fromEntries([...new Set(Object.values(effectMotifs))].map(key=>
 [key,visualImage('effects/'+key+'.png')]
));
const effectInk={Shadow:'#c39cff',Astro:'#a2dbff',Venom:'#aadb69',Michou:'#ffe29a'};
function fxUnit(n){return Math.min(1,Math.max(0,n))}
function effectStamp(key,x,y,size,angle=0,opacity=1) {
 const image=effectFrames[key];
 if(!imageReady(image)||size<=0||opacity<=0)return;
 const scale=size/Math.max(image.width,image.height);
 ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.globalAlpha*=fxUnit(opacity);
 ctx.drawImage(image,-image.width*scale/2,-image.height*scale/2,image.width*scale,image.height*scale);ctx.restore();
}
function effectHalo(x,y,r,color,opacity){
 if(r<=0||opacity<=0)return;
 const glow=ctx.createRadialGradient(x,y,0,x,y,r);
 glow.addColorStop(0,color);glow.addColorStop(1,color+'00');
 ctx.save();ctx.globalAlpha*=fxUnit(opacity);ctx.fillStyle=glow;ctx.fillRect(x-r,y-r,2*r,2*r);ctx.restore();
}
function impactSparks(x,y,q,color,n=8,r=27){
 if(q<=0||q>=1)return;
 ctx.save();ctx.globalAlpha*=1-q;
 for(let k=0;k<n;k++){
  const a=k*2.39996+.3,len=r*Math.sqrt(q)*(.54+.46*((k*7)%11)/10);
  fxStar(x+Math.cos(a)*len,y+Math.sin(a)*len*.8,1+(1-q)*(k%3+1),color,a);
 }
 ctx.restore();
}
function flyingStamp(key,from,to,q,size,arc=0,opacity=1) {
 const dx=to[0]-from[0],dy=to[1]-from[1];
 const x=from[0]+dx*q,y=from[1]+dy*q-Math.sin(q*Math.PI)*arc;
 effectStamp(key,x,y,size,Math.atan2(dy-Math.cos(q*Math.PI)*Math.PI*arc,dx),opacity);
}
function effectTrail(key,from,to,q,size,arc){
 for(let n=3;n>=0;n--){
  const u=q-n*.047;
  if(u>=0&&u<=1)flyingStamp(key,from,to,u,size*(1-n*.12),arc,n?(.26/n):1);
 }
}
function castGather(p,t,tint){
 const q=fxUnit(t/.27);
 if(q>=1)return;
 effectHalo(...p,9+q*11,tint,.48*Math.sin(Math.PI*q));
 for(let k=0;k<5;k++){
  const a=k*Math.PI*2/5+q,r=(1-q)*16+2;
  fxStar(p[0]+Math.cos(a)*r,p[1]+Math.sin(a)*r,1+q*1.8,tint,a);
 }
}
function effectTargetPoint(b,i){
 if(!b.kind)return [160,141];
 const [x,y]=enemyBattlePoint(b,i);
 return [x,y+9-enemyArtHeight(b.enemies[i])*.52];
}
function effectHeroPoint(b,i){
 const [x,y]=b.kind?heroBattlePoint(i):[385,196];
 return [x,y-13];
}
function drawOrbitWard(name,x,y,clock){
 const height=heroBattleHeights[name].idle,ry=height*.50+2,rx=ry*.67;
 const phase=clock*.00078,cy=y+13-ry;
 ctx.save();ctx.translate(x,cy);
 const glass=ctx.createRadialGradient(-rx*.24,-ry*.26,0,0,0,ry);
 glass.addColorStop(0,'#b9eaff03');glass.addColorStop(.52,'#76b5fc0b');glass.addColorStop(1,'#6db1ff42');
 ctx.fillStyle=glass;ctx.beginPath();ctx.ellipse(0,0,rx,ry,0,0,Math.PI*2);ctx.fill();
 ctx.strokeStyle='#8fd0ec73';ctx.lineWidth=.72;ctx.stroke();
 for(let n=0;n<3;n++){
  const angle=phase+n*2*Math.PI/3;
  ctx.strokeStyle=n===0?'#e2f8ffbd':'#b7bbef91';ctx.lineWidth=1;
  ctx.beginPath();ctx.ellipse(0,0,rx,ry,0,angle-.39,angle+.24);ctx.stroke();
  fxStar(Math.cos(angle)*rx,Math.sin(angle)*ry,n===0?2.1:1.4,'#e9f8ff',angle);
 }
 // A small six-sided aegis rides the forward face of the orbit.
 const sealX=-rx*.75,sealY=ry*.13,sealR=ry*.22;
 ctx.beginPath();ctx.moveTo(sealX,sealY-sealR);
 ctx.lineTo(sealX+sealR*.76,sealY-sealR*.55);ctx.lineTo(sealX+sealR*.65,sealY+sealR*.35);
 ctx.quadraticCurveTo(sealX+sealR*.42,sealY+sealR*.83,sealX,sealY+sealR);
 ctx.quadraticCurveTo(sealX-sealR*.42,sealY+sealR*.83,sealX-sealR*.65,sealY+sealR*.35);
 ctx.lineTo(sealX-sealR*.76,sealY-sealR*.55);ctx.closePath();ctx.fillStyle='#355281b5';ctx.fill();
 ctx.strokeStyle='#cee6ffe0';ctx.lineWidth=.8;ctx.stroke();fxStar(sealX,sealY,sealR*.54,'#ffde94',0);
 ctx.strokeStyle='#c8e5ff66';ctx.lineWidth=.65;ctx.beginPath();ctx.ellipse(0,ry*.28,rx*1.07,ry*.19,-.27,.18,2.9);ctx.stroke();
 ctx.restore();
}
function drawShadowCurrent(id,source,target,t){
 const reach=fxUnit((t-.025)/.39),strength=Math.sin(Math.PI*t);
 const sx=source[0]+8,sy=source[1]+23,tx=target[0],ty=target[1]+15;
 const ex=sx+(tx-sx)*reach,ey=sy+(ty-sy)*reach,hit=fxUnit((t-IMPACT_PHASE)/(1-IMPACT_PHASE));
 ctx.save();ctx.globalAlpha*=Math.min(1,strength*2.6);
 const endWidth=id==='eclipseBlade'?25:13;
 for(let k=-1;k<=1;k++){
  const bend=k*7+Math.sin(t*11+k)*3;
  ctx.fillStyle=k===0?'#1b102ae8':'#372142c9';
  ctx.beginPath();ctx.moveTo(sx,sy);
  ctx.bezierCurveTo(sx+(ex-sx)*.21,sy+bend+9,ex-(ex-sx)*.32,ey-bend,ex,ey);
  ctx.bezierCurveTo(ex-(ex-sx)*.25,ey-bend+4,sx+(ex-sx)*.27,sy+bend+12,sx,sy);ctx.fill();
 }
 ctx.fillStyle='#190e22e0';ctx.beginPath();ctx.ellipse(ex,ey,endWidth*(.25+.75*reach),3.8,0,0,Math.PI*2);ctx.fill();
 if(reach>.65){
  const rise=Math.sin(Math.PI*fxUnit((t-.26)/.74));
  for(let k=-1;k<=1;k++){
   const foot=tx+k*endWidth*.63,top=ty-(id==='eclipseBlade'?55: id==='umbralSeal'?39:24)*rise;
   const hook=id==='umbralSeal'?-k*15:id==='eclipseBlade'?-21:9;
   ctx.beginPath();ctx.moveTo(foot-4,ty);ctx.quadraticCurveTo(foot+k*13,top+12,foot+hook,top);
   ctx.quadraticCurveTo(foot+hook*.25,top+13,foot+4,ty);ctx.closePath();ctx.fillStyle='#22102eea';ctx.fill();ctx.lineWidth=.7;ctx.strokeStyle='#9b66bfaf';ctx.stroke();
  }
 }
 if(id==='shadeSiphon'&&hit>0){
  for(let k=0;k<4;k++){
   const p=fxUnit(hit*1.34-k*.105),x=tx+(sx-tx)*p,y=ty+(sy-ty)*p-19*Math.sin(Math.PI*p);
   effectHalo(x,y,4,'#ac6cd2',strength);ctx.fillStyle='#291035';ctx.beginPath();ctx.ellipse(x,y,3.8,2.1,-.2,0,Math.PI*2);ctx.fill();
  }
 }
 ctx.restore();
}
function paintTargetSkill(f,i,source,target,t,ink){
 const [x,y]=target, travel=fxUnit((t-.09)/(IMPACT_PHASE-.09));
 const hit=fxUnit((t-IMPACT_PHASE)/(1-IMPACT_PHASE)), bloom=Math.sin(hit*Math.PI);
 const pulse=Math.sin(t*Math.PI),stamp=effectMotifs[f.id];
 if(['shadowSlash','umbralSeal','shadeSiphon','eclipseBlade'].includes(f.id))drawShadowCurrent(f.id,source,target,t);
 switch(f.id){
 case 'shadowSlash':
 case 'eclipseBlade':{
  const eclipse=f.id==='eclipseBlade';
  if(eclipse)effectStamp('eclipse',x,y-26,38+20*pulse,t*.35,pulse*.87);
  
  if(hit>0){
   effectStamp('crescent',x-9+hit*19,y+8-hit*16,(eclipse?84:63)*(1-.15*hit),-.75+hit*.65,1-hit*.8);
   impactSparks(x,y,hit,eclipse?'#a076c7':'#8d67ad');
  }break;
 }
 case 'umbralSeal':
 case 'constellationSeal':
 case 'analysis':{
  const scan=f.id==='analysis';
  effectHalo(x,y,32,ink,pulse*.32);
  effectStamp(stamp,x,y,(scan?49:59)*(.67+.33*travel),scan?t*.8:f.id==='umbralSeal'?-.19*(1-travel):.25*t,pulse);
  if(scan){const sy=y-15+30*t;ctx.fillStyle=f.failed?'#efae85':'#c4fff7';ctx.fillRect(x-13,sy,26,.9);}
  else impactSparks(x,y,hit,ink,6,20);
  break;
 }
 case 'shadeSiphon':
  effectStamp('crescent',x,y,48,-.65,pulse*(1-hit));
  if(hit>0)effectTrail('wisp',target,source,hit,26,24);
  effectHalo(...source,17,'#ed91cd',bloom*.65);break;
 case 'starbolt':
 case 'piercingShot':
 case 'pinningShot':{
  const pin=f.id==='pinningShot';
  if(t<=IMPACT_PHASE)effectTrail(stamp,source,target,travel,f.id==='starbolt'?43:36,pin?15:5);
  if(hit>0){
   if(pin)flyingStamp('arrow',[x+30,y-15],target,1,34,0,1-hit);
   else if(f.id==='piercingShot')flyingStamp('arrow',target,[x-29,y+4],hit,36,0,1-hit);
   else effectStamp('nova',x,y,19+hit*32,hit*.28,(1-hit)*.9);
   impactSparks(x,y,hit,ink);
  }break;
 }
 case 'arrowRain':
  for(let n=0;n<5;n++){
   const u=(t-.06*n)/IMPACT_PHASE;
   const end=[x+(n-2)*6,y+(n%2)*4];
   if(u>=0&&u<=1)flyingStamp('arrow',[end[0]+39,end[1]-82],end,u,29);
   if(u>1)impactSparks(...end,fxUnit((u-1)*1.2),ink,4,13);
  }break;
 case 'flare':
  effectHalo(x,y,25+23*pulse,'#ffa45e',pulse*.53);
  effectStamp('nova',x,y,13+75*(t<IMPACT_PHASE?travel*.55:.55+hit*.45),t*.48,pulse);
  impactSparks(x,y,hit,'#ffeab8',12,36);break;
 case 'gravityWell':
  effectStamp('singularity',x,y,22+56*pulse,-.17+t*.38,pulse);
  for(let n=0;n<8;n++){const u=(t*1.4+n/8)%1,a=n*2.4+t*5,r=40*(1-u);
   fxStar(x+Math.cos(a)*r,y+Math.sin(a)*r*.65,1+u,'#cfb1f5',a);}
  break;
 case 'galaxyWrath':{
  const galaxy=[218,71];
  for(let n=0;n<3;n++){const u=(t-.12-n*.08)/.32;
   if(u>=0&&u<=1)flyingStamp('comet',galaxy,[x+(n-1)*7,y+n*2],u,35,7);}
  effectStamp('nova',x,y,21+hit*53,hit*.6,bloom);impactSparks(x,y,hit,'#d5e5ff',10,33);break;
 }
 case 'pilfer':
  effectStamp('purse',x,y,22+9*pulse,-.15+pulse*.3,pulse*(1-hit*.6));
  if(!f.failed && hit>0){
   for(let n=0;n<4;n++){const u=fxUnit(hit*1.45-n*.14);
    const cx=x+(source[0]-x)*u,cy=y+(source[1]-y)*u-Math.sin(u*Math.PI)*24;
    effectHalo(cx,cy,6,'#ffd778',.65);fxStar(cx,cy,3,'#ffe6ac',t*4);}
  }else if(f.failed)impactSparks(x,y,hit,'#db8a76',5,15);
  break;
 case 'sabotage':
  effectStamp('fracture',x,y,31+19*travel,(1-travel)*.24,pulse);impactSparks(x,y,hit,'#ffa96b');break;
 case 'toxicFang':
 case 'poisonTick':{
  if(f.id==='toxicFang')effectStamp('fangs',x,y-8+10*travel,30+19*travel,-.16,pulse);
  for(let n=0;n<7;n++){const u=(t+n/7)%1;
   effectHalo(x+Math.sin(n*2.4+t*2)*14,y+14-u*37,2+4*(1-u),'#a5e972',pulse*(1-u));}
  break;
 }
 }
}
// Contact effects share the damage event's target and combat clock.
const impactStyles={
 blade:{color:'#ffdf92',pitch:360,end:105,noise:2300},
 shadow:{color:'#ba89ff',pitch:190,end:48,noise:860},
 star:{color:'#96eaff',pitch:920,end:410,noise:2600},
 fang:{color:'#c8ee73',pitch:470,end:155,noise:3400},
 arrow:{color:'#ffd28a',pitch:690,end:85,noise:1850},
 enemy:{color:'#ffad89',pitch:165,end:55,noise:1400}
};
function impactStyle(hero,skill){
 if(skill==='poisonTick'||skill==='toxicFang')return 'fang';
 if(hero==='Shadow')return skill?'shadow':'blade';
 return ({Astro:'star',Venom:'fang',Michou:'arrow'})[hero]||'blade';
}
function soundBattleContact(style,critical){
 const ac=audio.ctx;
 if(!audio.on||ac?.state!=='running')return;
 const voice=impactStyles[style],now=ac.currentTime;
 const osc=ac.createOscillator(),gain=ac.createGain();
 const length=critical?.23:.15;
 osc.type=style==='shadow'?'sawtooth':'triangle';
 osc.frequency.setValueAtTime(voice.pitch,now);
 osc.frequency.exponentialRampToValueAtTime(voice.end,now+length);
 gain.gain.setValueAtTime(.001,now);
 gain.gain.exponentialRampToValueAtTime(.23,now+.007);
 gain.gain.exponentialRampToValueAtTime(.001,now+length);
 osc.connect(gain);gain.connect(audio.sfxGain);
 osc.onended=()=>{osc.disconnect();gain.disconnect()};
 osc.start(now);osc.stop(now+length);
 impactNoise(style==='arrow'?.045:.075,.22,voice.noise);
}
function paintBattleContact(b,hit,now){
 const t=(now-hit.start)/(hit.critical?360:270);
 if(!hit.contact||t<0||t>=1)return;
 const [x,y]=hit.side==='hero'?effectHeroPoint(b,hit.index):effectTargetPoint(b,hit.index);
 const color=impactStyles[hit.contact].color,r=hit.critical?28:20;
 ctx.save();ctx.translate(x,y);ctx.globalAlpha*=1-t;
 effectHalo(0,0,r*(1+t),color,.60);
 if(hit.contact==='star'){
  fxStar(0,0,r*(1-t)+2,'#eeffff',t*.5);
 }else{
  ctx.rotate(hit.contact==='arrow'?-.2:hit.contact==='fang'?.7:-.72);
  const reach=r*(.65+t),width=4*(1-t);
  ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(-reach,0);ctx.lineTo(0,-width);
  ctx.lineTo(reach,0);ctx.lineTo(0,width);ctx.closePath();ctx.fill();
  if(hit.contact==='fang')ctx.fillRect(-reach*.5,5,reach,1.6);
 }
 impactSparks(0,0,t,color,hit.critical?12:7,r+6);
 ctx.restore();
}
function paintSkillFrame(b,f,t){
 if(!imageReady(effectFrames[effectMotifs[f.id]]))return false;
 const ink=effectInk[SKILLS[f.id]?.hero]||'#96de79';
 const origin=effectHeroPoint(b,f.actor),source=[origin[0]-10,origin[1]-1];
 const pulse=Math.sin(t*Math.PI);
 ctx.save();ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
 if(f.id!=='poisonTick'&&SKILLS[f.id]?.hero!=='Shadow')castGather(source,t,ink);
 if(f.id==='galaxyWrath'){
  effectHalo(218,71,67,'#6464c1',pulse*.52);
  effectStamp('galaxy',218,71,38+pulse*81,-.25+t*.8,pulse);
 }
 for(const i of f.targets)paintTargetSkill(f,i,source,effectTargetPoint(b,i),t,ink);
 for(const i of f.allies){
  const [x,y]=effectHeroPoint(b,i);
  if(f.id==='shield'){
   ctx.save();ctx.globalAlpha*=pulse;ctx.strokeStyle='#c9f6ff';ctx.lineWidth=1.4;
   ctx.beginPath();ctx.ellipse(x,y,18+t*4,27+t*5,0,-Math.PI/2,-Math.PI/2+Math.PI*2*fxUnit(t/.55));ctx.stroke();ctx.restore();
   effectHalo(x,y,31,'#84cbff',pulse*.35);effectStamp('ward',x,y,49+10*pulse,0,pulse);
  }else if(f.id==='starMend'){
   ctx.save();ctx.globalAlpha*=pulse;ctx.fillStyle='#c2ffc8';
   for(let n=0;n<3;n++){
    const px=x+(n-1)*11,py=y+13-((t+n/3)%1)*29;
    ctx.fillRect(px-3,py-1,6,2);ctx.fillRect(px-1,py-3,2,6);
   }
   ctx.restore();
   effectStamp('mend',x,y+9-t*14,41+14*pulse,0,pulse);
   impactSparks(x,y-5,t,'#e8ffcd',7,22);
  }
 }
 ctx.restore();return true;
}
