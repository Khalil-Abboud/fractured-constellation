'use strict';
const startupImages = [
 "buildings/arena.png",
 "buildings/herb-store.png",
 "buildings/house-burned.png",
 "buildings/house.png",
 "buildings/house2-burned.png",
 "buildings/house2.png",
 "buildings/inn.png",
 "buildings/mayor-manor.png",
 "buildings/mayor2.png",
 "buildings/shrine.png",
 "buildings/tree.png",
 "buildings/weapon-forge.png",
 "characters/astro-action.png",
 "characters/astro-fallen.png",
 "characters/astro-idle.png",
 "characters/astro-ready.png",
 "characters/atrox-action.png",
 "characters/atrox-idle.png",
 "characters/atrox-ready.png",
 "characters/map/astro-down.png",
 "characters/map/astro-left.png",
 "characters/map/astro-right.png",
 "characters/map/astro-up.png",
 "characters/map/michou-down.png",
 "characters/map/michou-left.png",
 "characters/map/michou-right.png",
 "characters/map/michou-up.png",
 "characters/map/shadow-down.png",
 "characters/map/shadow-left.png",
 "characters/map/shadow-right.png",
 "characters/map/shadow-up.png",
 "characters/map/venom-down.png",
 "characters/map/venom-left.png",
 "characters/map/venom-right.png",
 "characters/map/venom-up.png",
 "characters/michou-action.png",
 "characters/michou-fallen.png",
 "characters/michou-idle.png",
 "characters/michou-ready.png",
 "characters/overworld/abomination.png",
 "characters/overworld/archer.png",
 "characters/overworld/astro.png",
 "characters/overworld/atrox.png",
 "characters/overworld/bandit.png",
 "characters/overworld/captain.png",
 "characters/overworld/child.png",
 "characters/overworld/darius.png",
 "characters/overworld/elder.png",
 "characters/overworld/mayor.png",
 "characters/overworld/michou.png",
 "characters/overworld/raymond.png",
 "characters/overworld/scout.png",
 "characters/overworld/shadow.png",
 "characters/overworld/smith.png",
 "characters/overworld/soldier.png",
 "characters/overworld/townsman.png",
 "characters/overworld/townswoman.png",
 "characters/overworld/varek.png",
 "characters/overworld/venom.png",
 "characters/shadow-action.png",
 "characters/shadow-fallen.png",
 "characters/shadow-idle.png",
 "characters/shadow-ready.png",
 "characters/venom-action.png",
 "characters/venom-fallen.png",
 "characters/venom-idle.png",
 "characters/venom-ready.png",
 "effects/arrow.png",
 "effects/chains.png",
 "effects/comet.png",
 "effects/constellation.png",
 "effects/crescent.png",
 "effects/eclipse.png",
 "effects/fangs.png",
 "effects/fracture.png",
 "effects/galaxy.png",
 "effects/mend.png",
 "effects/nova.png",
 "effects/purse.png",
 "effects/reticle.png",
 "effects/singularity.png",
 "effects/ward.png",
 "effects/wisp.png",
 "enemies/ash-scorpion-attack.png",
 "enemies/ash-scorpion.png",
 "enemies/bog-lizard-attack.png",
 "enemies/bog-lizard.png",
 "enemies/briar-crawler-attack.png",
 "enemies/briar-crawler.png",
 "enemies/captain-darius-attack.png",
 "enemies/captain-darius.png",
 "enemies/commander-varek-attack.png",
 "enemies/commander-varek.png",
 "enemies/dawn-soldier-attack.png",
 "enemies/dawn-soldier.png",
 "enemies/dusk-harpy-attack.png",
 "enemies/dusk-harpy.png",
 "enemies/glasswing-attack.png",
 "enemies/glasswing.png",
 "enemies/gloom-bat-attack.png",
 "enemies/gloom-bat.png",
 "enemies/hollow-wisp-attack.png",
 "enemies/hollow-wisp.png",
 "enemies/ironback-attack.png",
 "enemies/ironback.png",
 "enemies/ironhide-ogre-attack.png",
 "enemies/ironhide-ogre.png",
 "enemies/marsh-wisp-attack.png",
 "enemies/marsh-wisp.png",
 "enemies/mist-wolf-attack.png",
 "enemies/mist-wolf.png",
 "enemies/pass-wisp-attack.png",
 "enemies/pass-wisp.png",
 "enemies/quarry-wolf-attack.png",
 "enemies/quarry-wolf.png",
 "enemies/ridge-boar-attack.png",
 "enemies/ridge-boar.png",
 "enemies/ridge-viper-attack.png",
 "enemies/ridge-viper.png",
 "enemies/road-bandit-attack.png",
 "enemies/road-bandit.png",
 "enemies/shard-echo-attack.png",
 "enemies/shard-echo.png",
 "enemies/shard-sentinel-attack.png",
 "enemies/shard-sentinel.png",
 "enemies/stone-beetle-attack.png",
 "enemies/stone-beetle.png",
 "enemies/the-abomination-attack.png",
 "enemies/the-abomination.png",
 "items/armor.png",
 "items/azure.png",
 "items/blue.png",
 "items/boots.png",
 "items/bow.png",
 "items/chart.png",
 "items/dagger.png",
 "items/dawnleaf.png",
 "items/gloves.png",
 "items/gold-coins.png",
 "items/helmet.png",
 "items/herb.png",
 "items/sleep.png",
 "items/staff.png",
 "items/sword.png",
 "items/vital.png",
 "items/wallet.png",
 "portraits/astro-stats.png",
 "portraits/michou-stats.png",
 "portraits/shadow-stats.png",
 "portraits/venom-stats.png",
 "scenery/arena.webp",
 "scenery/army-gate.webp",
 "scenery/bellhaven-harbor.webp",
 "scenery/bellhaven-night.webp",
 "scenery/citadel-square.webp",
 "scenery/eastern-road.webp",
 "scenery/forge-room.webp",
 "scenery/grey-pass.webp",
 "scenery/inn-room.webp",
 "scenery/island-fortress.webp",
 "scenery/manor-night.webp",
 "scenery/manor.webp",
 "scenery/mistwood.webp",
 "scenery/ocean.webp",
 "scenery/raid.webp",
 "scenery/shop-room.webp",
 "scenery/shrine.webp",
 "scenery/stone-hall.webp",
 "scenery/throne.webp",
 "scenery/valdorn-arrival.png",
 "scenery/western-road.webp",
 "scenery/yard.webp",
 "terrain/boards.webp",
 "terrain/dirt.webp",
 "terrain/meadow.webp",
 "terrain/pavers.webp",
 "terrain/room-wall.webp",
 "terrain/scree.webp",
 "terrain/sea.webp",
 "terrain/shore.webp",
 "terrain/water.webp",
 "world/anvil.png",
 "world/arch.png",
 "world/banner.png",
 "world/bed.png",
 "world/boulders.png",
 "world/campfire.png",
 "world/capital.png",
 "world/cell-gate.png",
 "world/cell-side.png",
 "world/checkpoint.png",
 "world/chest-open.png",
 "world/chest.png",
 "world/child.png",
 "world/council-chart.png",
 "world/crates.png",
 "world/dock.png",
 "world/doorway.png",
 "world/elder.png",
 "world/ferns.png",
 "world/furnace.png",
 "world/herb-shelf.png",
 "world/lantern.png",
 "world/log.png",
 "world/mayor.png",
 "world/mountains.png",
 "world/oathbound.png",
 "world/observatory.png",
 "world/raymond.png",
 "world/scout.png",
 "world/smith.png",
 "world/telescope.png",
 "world/townsman.png",
 "world/townswoman.png",
 "world/writing-desk.png"
];
const startupThemes=['boss-battle','harbor','hearth','inn-rest','mist','pursuit','shadows','skirmish','starlight','trail','vigil','voyage'];
const startupScreen=document.getElementById('startup-loading');
const startupGame=document.getElementById('game');
const startupProgress=document.getElementById('startup-progress');
const startupStatus=document.getElementById('startup-status');
const startupRetry=document.getElementById('startup-retry');
const startupArabic=state.lang==='ar';
startupScreen.dir=startupArabic?'rtl':'ltr';
startupRetry.textContent=startupArabic?'إعادة المحاولة':'Retry';
startupProgress.setAttribute('aria-label',startupArabic?'تقدّم تحميل اللعبة':'Game loading progress');

async function preloadStartupImage(path){
 const image=visualImage(path);
 try{
  await image.decode();
 }catch(error){
  visualImages.delete(path);
  throw error;
 }
}

let startupTasks=[
 ...startupImages.map(path=>()=>preloadStartupImage(path)),
 ...startupThemes.map(key=>()=>preloadGameTheme(key)),
 ()=>document.fonts.load('16px "Dialogue Pixel"')
];
const startupTotal=startupTasks.length;
function updateStartupProgress(loaded){
 const percent=Math.floor(loaded*100/startupTotal);
 startupProgress.value=percent;
 startupStatus.textContent=startupArabic?'جارٍ تحميل اللعبة... '+percent+'٪':'Loading game assets... '+percent+'%';
}
async function loadStartupAssets(){
 startupRetry.hidden=true;
 let next=0,loaded=startupTotal-startupTasks.length;
 const failed=[];
 updateStartupProgress(loaded);
 async function worker(){
  while(next<startupTasks.length){
   const task=startupTasks[next++];
   try{
    await task();
    updateStartupProgress(++loaded);
   }catch(error){
    failed.push(task);
    console.warn('Game asset could not load',error);
   }
  }
 }
 await Promise.all(Array.from({length:6},worker));
 startupTasks=failed;
 if(failed.length){
  startupStatus.textContent=startupArabic?'تعذّر تحميل بعض الملفات. تحقق من الاتصال وأعد المحاولة.':'Some game files could not load. Check your connection and retry.';
  startupRetry.hidden=false;
  startupRetry.focus();
  return;
 }
 startupGame.inert=false;
 startupScreen.hidden=true;
}
document.addEventListener('keydown',event=>{
 if(!startupScreen.hidden&&event.target!==startupRetry)event.stopImmediatePropagation();
},true);
startupRetry.addEventListener('click',loadStartupAssets);
void loadStartupAssets();
