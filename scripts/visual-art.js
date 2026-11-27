'use strict';
// Asset paths are relative to index.html so the game also works directly from disk.
const visualImages = new Map();
function visualImage(path) {
 if (!visualImages.has(path)) {
  const image = new Image();
  image.src = 'assets/' + path;
  visualImages.set(path, image);
 }
 return visualImages.get(path);
}
function imageReady(image) { return image && image.complete && image.naturalWidth > 0; }
function paintArt(path, x, y, w, h) {
 const image = visualImage(path);
 if (!imageReady(image)) return false;
 ctx.drawImage(image, x, y, w, h);
 return true;
}
function paintScene(key, x=0, y=0, w=512, h=288) {
 return paintArt('scenery/' + key + '.webp', x, y, w, h);
}
function roomScenery(scene) {
 if(['inn','bellInn','michouHouse'].includes(scene))return 'inn-room';
 if(['forge','bellForge'].includes(scene))return 'forge-room';
 if(['apothecary','bellShop'].includes(scene))return 'shop-room';
 return 'stone-hall';
}
function paintProp(key, x, bottom, width, height) {
 const image = visualImage('world/' + key + '.png');
 if (!imageReady(image)) return false;
 const scale = Math.min(width/image.width, height/image.height);
 ctx.drawImage(image, x-image.width*scale/2, bottom-image.height*scale, image.width*scale, image.height*scale);
 return true;
}
const groundPatterns = new Map();
function materialPattern(key) {
 const image=visualImage('terrain/'+key+'.webp');
 if(!imageReady(image)) return null;
 if(!groundPatterns.has(key)){
  const pattern=ctx.createPattern(image,'repeat');
  pattern.setTransform(new DOMMatrix().scale(64/image.width,64/image.height));
  groundPatterns.set(key,pattern);
 }
 return groundPatterns.get(key);
}
function groundMaterial(key,x,y,w,h,color) {
 ctx.fillStyle=color;
 ctx.fillRect(x,y,w,h);
 const pattern=materialPattern(key);
 if(!pattern)return;
 ctx.save();
 ctx.globalAlpha *= key === 'meadow' ? .42 : .79;
 ctx.fillStyle = pattern;
 ctx.fillRect(x,y,w,h);
 ctx.restore();
}
const enemyKeys = new Set(["mist-wolf","hollow-wisp","briar-crawler","gloom-bat","quarry-wolf","stone-beetle","pass-wisp","ridge-viper","road-bandit","marsh-wisp","ridge-boar","bog-lizard","ash-scorpion","shard-sentinel","dusk-harpy","ironhide-ogre","ironback","glasswing","the-abomination","shard-echo","commander-varek","captain-darius","dawn-soldier"]);
function enemyArtKey(name) {
 const legacy = {'Commander TMRH':'commander-varek','The Beast':'the-abomination','Road Wolf':'quarry-wolf','Stone Crawler':'briar-crawler','Ash Hound':'mist-wolf','Shard Wisp':'shard-echo','Gate Stalker':'road-bandit'};
 if (legacy[name]) return legacy[name];
 if (/^(Dawn )?Soldier(?: [A-D0-9]+)?$/.test(name)) return 'dawn-soldier';
 const key = name.toLowerCase().replaceAll(' ','-');
 return enemyKeys.has(key) ? key : null;
}
function enemyFrame(key, attack=false) {
 return visualImage('enemies/' + key + (attack ? '-attack' : '') + '.png');
}
function enemyArtHeight(enemy) {
 if (['Ironback','Glasswing','The Beast'].includes(enemy.name)) return 69;
 return /Wisp|Crawler|Bat|Viper|Beetle|Echo/.test(enemy.name) ? 40 : 49;
}
function paintBattleEnemy(enemy, index) {
 const key = enemyArtKey(enemy.name);
 if (!key) return false;
 const now = state.time, remaining = (enemy.attackPoseUntil || 0)-now;
 const strike = remaining>0 ? Math.sin(Math.min(1,remaining/480)*Math.PI) : 0;
 const airborne = /wisp|bat|harpy|glasswing|echo/.test(key);
 const idle = Math.sin(now/(airborne?245:420)+index*1.9);
 const ready = enemy.attackPoseReady;
 const attack = enemyFrame(key,true);
 let frame = remaining>95 ? attack : enemyFrame(key);
 if (!imageReady(frame)) frame = enemyFrame(key);
 if (!imageReady(frame)) return false;
 const boss = enemyArtHeight(enemy)>60;
 const scale = Math.min((boss?97:67)/frame.width, enemyArtHeight(enemy)/frame.height);
 const w = frame.width*scale, h = frame.height*scale;
 ctx.save();
 ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
 ctx.fillStyle = '#11152345';
 ctx.beginPath();ctx.ellipse(0,10,w*.32,3,0,0,Math.PI*2);ctx.fill();
 ctx.translate(ready?-3:10*strike,10+(airborne?-5+idle*2:0)-strike*2);
 ctx.rotate(ready?-.07:strike*.07);
 ctx.scale(1+(ready?.035:0),ready?.94:1+idle*.012);
 ctx.drawImage(frame,-w/2,-h,w,h);
 ctx.restore();
 return true;
}
// Keep the back row's feet on the ground, including in four-enemy formations.
function paintBattlefield(b) {
 const image=visualImage('scenery/'+battleScenery(b)+'.webp');
 if (!imageReady(image)) return false;
 if (!state.battle) { ctx.drawImage(image,0,0,512,288); return true; }
 const horizon=Math.round(image.height*.54), backRow=79;
 ctx.drawImage(image,0,0,image.width,horizon,0,0,512,backRow);
 ctx.drawImage(image,0,horizon,image.width,image.height-horizon,0,backRow,512,288-backRow);
 return true;
}
function battleScenery(b) {
 if (!b.kind && !b.scenario) return 'raid';
 if (/^arena/.test(b.scenario)) return 'arena';
 if (b.scenario==='abomination') return 'bellhaven-night';
 if (b.scenario==='townRaid') return 'raid';
 if (b.scenario==='venom') return 'manor-night';
 if (b.enemies?.some(e=>e.name==='Commander TMRH')) return 'grey-pass';
 const region = b.enemies?.[0]?.region || encounterRegion();
 return {forest:'mistwood',pass:'grey-pass',west:'western-road',east:'eastern-road'}[region] || 'mistwood';
}
// Each atlas has registered feet at (80,140) in a 160px cell; 128px of body
// height is one map unit of scale. Animation and direction share this pivot.
const mapHeights = {
 shadow:30, astro:32, venom:29, michou:30, atrox:38, soldier:30,
 raymond:30, elder:28, townsman:28, townswoman:28, smith:30, scout:28,
 archer:30, captain:30, mayor:29, child:20, varek:33, darius:33, bandit:28, abomination:43
};
const mapWalkers = new Set(['shadow','astro','michou','venom']);
const mapSheets = Object.fromEntries(Object.keys(mapHeights).map(
 key => [key,visualImage('characters/overworld/'+key+'.png')]
));
function mapRole(e) {
 if (e.mapRole) return e.mapRole;
 const name=e.name, key=name.toLowerCase();
 if (mapHeights[key]) return key;
 if (name==='The Beast') return 'abomination';
 if (name==='Commander TMRH') return 'varek';
 if (name==='Captain Rook') return 'captain';
 if (name==='Captain Darius') return 'darius';
 if (/Guard|Soldier|Legionnaire|Officer|Sergeant|Warden|Archer/.test(name)) return 'soldier';
 if (/Raider|Bandit/.test(name)) return 'bandit';
 if (/Elder|Old Keeper/.test(name)) return 'elder';
 if (/Smith/.test(name)) return 'smith';
 if (/Mayor|Steward/.test(name)) return 'mayor';
 if (/Scout|Courier|Messenger|Rook/.test(name)) return 'scout';
 if (/Lysa|Elin|Sela|Iris|Mira|Nella|Nia|Edda|Tamsin/.test(name)) return 'townswoman';
 return 'townsman';
}
function facingDirection(dx,dy,current='down') {
 const ax=Math.abs(dx), ay=Math.abs(dy);
 if(ax+ay<.001) return current;
 const horizontal=ax===ay ? current==='left'||current==='right' : ax>ay;
 return horizontal ? (dx<0?'left':'right') : (dy<0?'up':'down');
}
function faceActor(actor,target) {
 if(actor && target && !actor.down) actor.dir=facingDirection(target.x-actor.x,target.y-actor.y,actor.dir);
}
function faceConversation(actor,target) { faceActor(actor,target); faceActor(target,actor); if(actor&&target)dialoguePair=[actor,target]; }
function moveMapActor(actor,x,y) {
 const dx=x-actor.x,dy=y-actor.y,travel=Math.hypot(dx,dy);
 if(travel<.001) return;
 actor.dir=facingDirection(dx,dy,actor.dir);
 actor.walkDistance=(actor.walkDistance||0)+travel;
 actor.walkUntil=performance.now()+95;
 actor.x=x;actor.y=y;
}
// The NPC sheets contain one pose per direction. These joints mark the
// boundary between the boots in the front, back and profile artwork.
const npcBootSplit={
 abomination:[80,80,81],archer:[80,80,80],atrox:[66,68,69],
 bandit:[80,80,81],captain:[79,79,80],child:[80,81,80],
 darius:[78,85,82],elder:[84,74,76],mayor:[80,80,80],
 raymond:[80,80,87],scout:[79,81,80],smith:[82,75,80],
 soldier:[97,62,62],townsman:[80,80,80],townswoman:[81,80,81],
 varek:[79,80,81]
};
function drawNpcWalk(sheet,role,direction,distance,unit){
 const sx=direction*160,split=npcBootSplit[role][direction];
 const joint=role==='townswoman'||role==='raymond'||role==='elder'?128:121;
 const step=Math.sin(distance*Math.PI/16);
 const legHeight=160-joint;
 ctx.translate(0,-Math.abs(step)*1.6*unit);
 ctx.drawImage(sheet,sx,0,160,joint,-80*unit,-140*unit,160*unit,joint*unit);
 for(const [start,width,stride] of [[0,split,step],[split,160-split,-step]]){
  const lift=Math.max(0,stride)*(direction===2?.39:.49);
  const swing=direction===2?stride*.59:stride*.09;
  ctx.save();
  ctx.translate((start-80)*unit,(joint-140)*unit);
  ctx.transform(1,0,swing,1-lift,0,0);
  ctx.drawImage(sheet,sx+start,joint,width,legHeight,0,0,width*unit,legHeight*unit);
  ctx.restore();
 }
}
function paintMapFigure(x,y,e) {
 const role=mapRole(e),sheet=mapSheets[role];
 if(!imageReady(sheet))return false;
 const walker=mapWalkers.has(role),moving=!e.down && e.walkUntil>performance.now();
 const phase=moving?Math.floor(e.walkDistance/8)%4:0;
 const row=({down:0,up:1,right:2,left:2})[e.dir]??0;
 const frame=walker?[0,1,0,2][phase]:row;
 const height=mapHeights[role]*(e.mapScale??(state.scene==='world'?.78:1));
 const unit=height/128;
 ctx.save();
 ctx.translate(x,y+8);
 if(e.down){ctx.rotate(-Math.PI/2);ctx.translate(0,height*.48);}
 if(e.dir==='left')ctx.scale(-1,1);
 // Lean with the weapon and armor while keeping the feet planted.
 if(e.paradeLean)ctx.transform(1,0,e.paradeLean,1,0,0);
 ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
 if(moving&&!walker)drawNpcWalk(sheet,role,row,e.walkDistance,unit);
 else ctx.drawImage(sheet,frame*160,walker?row*160:0,160,160,-80*unit,-140*unit,160*unit,160*unit);
 ctx.restore();
 if(e.carrying){
  const side=e.dir==='left'?-1:1;
  ctx.fillStyle='#251936';ctx.strokeStyle='#bc9bdd';ctx.lineWidth=1;
  ctx.beginPath();ctx.arc(x+side*height*.23,y+8-height*.45,3.5,0,Math.PI*2);ctx.fill();ctx.stroke();
 }
 if(e===state.player&&!e.down){
  ctx.fillStyle='#f3d375';ctx.beginPath();ctx.moveTo(x-3,y-height+2);ctx.lineTo(x+3,y-height+2);ctx.lineTo(x,y-height+6);ctx.fill();
 }
 return true;
}
