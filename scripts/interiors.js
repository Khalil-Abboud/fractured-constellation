'use strict';
// Furniture dimensions are the trimmed sprite's display dimensions. The footprint
// starts at the depth of the back feet and ends at the same baseline used to draw it.
function furnishing(key,x,base,width,height,depth){
 return {key,x,base,width,height,depth};
}
const bedAt=(x,y)=>furnishing('bed',x,y,35,62,51);
const deskAt=(x,y)=>furnishing('writing-desk',x,y,65,34,16);
const shelfAt=(x,y)=>furnishing('herb-shelf',x,y,42,49,13);
const forgeAt=(x,y)=>furnishing('furnace',x,y,41,53,26);
const anvilAt=(x,y)=>furnishing('anvil',x,y,34,35,19);
const manorChest=furnishing('chest',100,134,35,26,15);
const roomFurniture={
 foyer:[manorChest,shelfAt(410,103)],guest:[bedAt(178,145),bedAt(313,145)],study:[shelfAt(136,85),deskAt(359,92)],cell:[],
 inn:[deskAt(222,97),bedAt(312,221)],apothecary:[shelfAt(211,86),shelfAt(302,86),deskAt(256,101)],
 forge:[anvilAt(177,158),forgeAt(331,111)],bellInn:[deskAt(223,98),bedAt(325,205)],
 bellShop:[shelfAt(205,85),shelfAt(309,85),deskAt(256,97)],bellForge:[anvilAt(206,192),forgeAt(319,189)],
 michouHouse:[bedAt(325,205),deskAt(198,91)],bellHall:[deskAt(363,79)],
 holding:[bedAt(110,115),deskAt(405,89)]
};
function roomPlan(){
 const key=state.scene==='manor'?(state.manorRoom||'foyer'):state.scene;
 const left=state.scene==='manor'?64:['bellHall','holding'].includes(key)?38:130;
 const cell=key==='cell'?{x:408,y:208}:key==='bellHall'&&state.beastDefeated?{x:376,y:208}:null;
 return {key,left,right:512-left,north:76,props:roomFurniture[key],cell};
}
function nearGuestBed(p){
 return roomFurniture.guest.some(b=>Math.hypot(Math.max(0,Math.abs(p.x-b.x)-b.width/2),Math.max(0,b.base-b.depth-(p.y+7),p.y+7-b.base))<21);
}
function roomBlocksFeet(x,y){
 const r=roomPlan();
 if(x-4<r.left+5||x+4>r.right-5||y+5<r.north||y+9>282)return true;
 if(r.cell&&footHitsRect(x,y,r.cell.x-32,r.cell.y-18,64,42))return true;
 return r.props.some(p=>footHitsRect(x,y,p.x-p.width/2,p.base-p.depth,p.width,p.depth))||actorsBlockFeet(x,y);
}
function wovenRunner(x,top,width,bottom){
 ctx.save();ctx.translate(x-width/2,top);
 const h=bottom-top;
 ctx.fillStyle='#432c2b';ctx.fillRect(0,0,width,h);
 ctx.fillStyle='#803e3a';ctx.fillRect(1,1,width-2,h-2);
 for(const edge of [3,width-4]){
  ctx.fillStyle='#bc9365';ctx.fillRect(edge,1,1,h-2);
  for(let y=6;y<h-3;y+=7){ctx.fillStyle='#cb9b667d';ctx.fillRect(edge-1,y,3,2)}
 }
 ctx.strokeStyle='#d59c724f';ctx.lineWidth=1;
 for(let y=16;y<h-7;y+=23){
  const m=width/2;ctx.beginPath();ctx.moveTo(m,y-5);ctx.lineTo(m+6,y);ctx.lineTo(m,y+5);ctx.lineTo(m-6,y);ctx.closePath();ctx.stroke();
 }
 ctx.restore();
}
function drawRoomExit(x,y){
 const plank=ctx.createLinearGradient(0,y-8,0,y+8);
 plank.addColorStop(0,'#35271f');plank.addColorStop(1,'#101117');ctx.fillStyle=plank;ctx.fillRect(x-17,y-8,34,17);
 for(let i=0;i<3;i++)line(x-16,y-6+i*5,x+16,y-6+i*5,'#9d7954',1.2);
}
function roomLabel(title,x,y){
 ctx.save();ctx.font=state.lang==='ar'?'bold 7.5px Tahoma':'bold 7px monospace';ctx.textAlign='center';ctx.lineWidth=2.6;
 ctx.strokeStyle='#291d16';ctx.strokeText(title,x,y);ctx.fillStyle='#fff0c4';ctx.fillText(title,x,y);ctx.restore();
}
function drawRoomCell(cell,items){
 const {x,y}=cell;
 groundMaterial('pavers',x-31,y-18,62,42,'#524c49');
 items.push({base:y-18,draw:()=>paintArt('world/cell-gate.png',x-28,y-43,56,25)});
 for(const edge of [-1,1])items.push({base:y+22,draw:()=>{
  ctx.save();ctx.translate(x+edge*32,y+24);ctx.scale(-edge,1);
  paintArt('world/cell-side.png',0,-66,7,66);ctx.restore();
 }});
 items.push({base:y+24,draw:()=>paintArt('world/cell-gate.png',x-32,y-5,64,29)});
}
function drawFurnishedRoom(){
 const r=roomPlan(),w=r.right-r.left;
 rect(0,0,512,288,'#10111b');groundMaterial(['holding','cell','bellHall'].includes(r.key)?'pavers':'boards',r.left,74,w,214,'#785741');
 ctx.save();ctx.beginPath();ctx.rect(r.left,22,w,r.north-22);ctx.clip();
 for(let x=r.left;x<r.right;x+=162)paintArt('terrain/room-wall.webp',x,22,162,54);
 ctx.restore();
 for(const x of [r.left,r.right-5]){rect(x,76,5,212,'#432e25');rect(x+1,76,1,212,'#937456')}
 const shade=ctx.createLinearGradient(0,75,0,90);shade.addColorStop(0,'#2a17174a');shade.addColorStop(1,'#2a171700');ctx.fillStyle=shade;ctx.fillRect(r.left+5,75,w-10,15);
 if(['foyer','study','bellHall'].includes(r.key))wovenRunner(256,77,r.key==='bellHall'?60:44,264);
 if(r.key==='guest'||r.key==='michouHouse')wovenRunner(256,108,37,211);
 for(const x of [r.left+18,r.right-18])paintProp('lantern',x,67,8,15);
 if(r.key==='foyer')for(const d of MANOR_DOORS){
  paintArt('world/doorway.png',d.x-18,r.north-38,36,38);roomLabel(tr(...d.label),d.x,34);
 }
 if(r.key==='holding'){paintArt('world/doorway.png',r.left,201,28,34);roomLabel(tr('Yard','الساحة'),r.left+16,199)}
 drawRoomExit(256,276);
 const items=r.props.map(p=>({base:p.base,draw:()=>{
  if(p===manorChest&&state.manorChestOpened&&paintProp('chest-open',p.x,p.base,p.width,36))return;
  paintArt('world/'+p.key+'.png',p.x-p.width/2,p.base-p.height,p.width,p.height);
 }}));
 if(r.cell)drawRoomCell(r.cell,items);
 for(const e of state.entities)items.push({base:e.y+8,draw:()=>drawSprite(e)});
 items.sort((a,b)=>a.base-b.base).forEach(i=>i.draw());
 if(state.scene==='manor'&&state.nightActive)rect(0,0,512,288,'#141d382c');
}
