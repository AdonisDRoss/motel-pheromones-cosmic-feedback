
(function(){
"use strict";
function chunk(){try{return typeof loopChunk==="function"?loopChunk():0}catch(e){return 0}}
class TransitionManager{
  constructor(scene){this.scene=scene;}
  saveVehicle(){
    const s=this.scene;
    try{
      if(!s.vehicleMode||!s.vehicle)return;
      localStorage.setItem("cf_v115_vehicle",JSON.stringify({active:true,stolen:!!s.vehicle.stolen,key:(s.vehicle.texture&&s.vehicle.texture.key)||"donny_car",speed:Math.round(s.vehicleSpeed||0),heading:Math.round(s.vehicleHeading??((s.vehicle.angle||0)-180)),chunk:chunk(),t:Date.now()}));
    }catch(e){}
  }
  patchGo(){
    const s=this.scene;
    if(s.__v115GoPatched||typeof s.goHighwayLoop!=="function")return;
    s.__v115GoPatched=true;
    const old=s.goHighwayLoop;
    s.goHighwayLoop=function(step){ if(s.v115Transition)s.v115Transition.saveVehicle(); return old.call(s,step); };
  }
}
window.CFHighwayTransitionManager=TransitionManager;
})();
