
(function(){
"use strict";
function trafficAngle(dir){return dir<0?0:180}
class TrafficManager{
  constructor(scene){this.scene=scene;}
  stabilize(){
    const scene=this.scene;
    if(!scene.trafficCars)return;
    scene.trafficCars=scene.trafficCars.filter(c=>c && !c.isPlayerVehicle && !c.stolen && c!==scene.vehicle);
    scene.trafficCars.forEach(car=>{
      if(car.trafficLane&&typeof car.trafficLane.dir==="number")car.angle=trafficAngle(car.trafficLane.dir);
    });
  }
  nearestJackable(){
    const scene=this.scene;
    if(!scene.trafficCars||scene.vehicleMode)return null;
    const px=scene.player?scene.player.x:0, py=scene.player?scene.player.y:0;
    let best=null, bestD=9999;
    scene.trafficCars.forEach(car=>{
      if(!car||car.stolen||car.isPlayerVehicle||!car.visible)return;
      const d=Phaser.Math.Distance.Between(px,py,car.x,car.y);
      if(d<bestD){best=car;bestD=d;}
    });
    return bestD<100?best:null;
  }
  removeCar(car){
    const scene=this.scene;
    scene.trafficCars=(scene.trafficCars||[]).filter(c=>c!==car);
    try{car.destroy()}catch(e){try{car.setVisible(false)}catch(_){}}
  }
}
window.CFHighwayTrafficManager=TrafficManager;
window.CFHighwayTrafficAngle=trafficAngle;
})();
