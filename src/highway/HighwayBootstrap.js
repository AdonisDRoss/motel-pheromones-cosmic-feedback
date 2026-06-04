
(function(){
"use strict";
const scripts=[
 "src/highway/NPCManager.js?v=117c",
 "src/highway/TrafficManager.js?v=117c",
 "src/highway/VehicleManager.js?v=117c",
 "src/highway/TransitionManager.js?v=117c",
 "src/highway/CivicPatrolManager.js?v=117c"
];
function loadScript(src){
 return new Promise((resolve,reject)=>{const s=document.createElement("script");s.src=src;s.onload=resolve;s.onerror=reject;document.body.appendChild(s);});
}
function hi(){try{return AREA==="highway"||AREA==="highway_loop"}catch(e){return false}}
function toast(t){try{if(typeof showToast==="function")showToast(t)}catch(e){}}
function patchScene(scene){
 if(!scene||scene.__v115Patched||!scene.add||!scene.events)return;
 scene.__v115Patched=true;
 scene.v115Npc=new window.CFHighwayNPCManager(scene);
 scene.v115Traffic=new window.CFHighwayTrafficManager(scene);
 scene.v115Vehicle=new window.CFHighwayVehicleManager(scene,scene.v115Traffic,scene.v115Npc);
 scene.v115Transition=new window.CFHighwayTransitionManager(scene);
 scene.v116Civic=new window.CFHighwayCivicPatrolManager(scene,scene.v115Traffic);
 scene.v115Transition.patchGo();

 // Override old highway hooks with the clean managers.
 scene.spawnVisibleCivilians=function(){this.v115Npc.spawn(true)};
 scene.updateVisibleCivilians=function(dt){this.v115Npc.update(dt)};
 scene.ensureNpcsForCurrentScreen=function(){this.v115Npc.spawn(false)};
 scene.tryCarjack=function(){return this.v115Vehicle.carjack()};
 scene.spawnPulledDriver=function(car){this.v115Vehicle.makePulledDriver(car)};
 scene.updatePulledDrivers=function(dt){this.v115Vehicle.updatePulled(dt)};

 scene.events.on("update",(time,delta)=>{
   if(!hi())return;
   scene.v115Npc.spawn(false);
   scene.v115Npc.update(delta);
   scene.v115Vehicle.updatePulled(delta);
   scene.v115Traffic.stabilize();
   if(scene.v116Civic) scene.v116Civic.update(delta);
 });
 scene.time.delayedCall(250,()=>{if(hi()){scene.v115Npc.spawn(true);scene.v115Traffic.stabilize(); if(scene.v116Civic) scene.v116Civic.ensure();}});
 scene.time.addEvent({delay:1000,loop:true,callback:()=>{if(hi()){scene.v115Npc.spawn(false);scene.v115Traffic.stabilize();}}});
 toast("v115 modular highway active");
}
function scan(){
 try{if(!window.game||!game.scene||!game.scene.scenes)return;game.scene.scenes.forEach(patchScene)}catch(e){}
}
Promise.all(scripts.map(loadScript)).then(()=>{
 window.CFHighwayV115={scan,version:"v115_modular_highway"};
 const t=setInterval(scan,300);
 window.addEventListener("load",scan);
 setTimeout(scan,1000);
 setTimeout(()=>clearInterval(t),15000);
}).catch(e=>console.error("Highway v115 module load failed",e));
})();
