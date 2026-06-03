
(function(){
"use strict";
function hi(){try{return AREA==="highway"||AREA==="highway_loop"}catch(e){return false}}
function toast(t){try{if(typeof showToast==="function")showToast(t)}catch(e){}}
function labelDepth(){try{return DEPTH.LABEL+160}catch(e){return 5200}}
function carDepth(){try{return DEPTH.CHARACTER_BASE+260}catch(e){return 2600}}
function visualAngle(heading){return heading+180}
function trafficKey(scene){
  if(scene.emsTrafficTextureKeys && scene.emsTrafficTextureKeys.length>1) return scene.emsTrafficTextureKeys[1];
  if(scene.trafficTextureKeys && scene.trafficTextureKeys.length) return scene.trafficTextureKeys[0];
  return "donny_car";
}
class CivicPatrolManager{
  constructor(scene,traffic){
    this.scene=scene; this.traffic=traffic;
    this.heat=Number(localStorage.getItem("cf_v116_heat")||"0");
    this.level=Number(localStorage.getItem("cf_v116_wanted")||"0");
    this.units=[]; this.spawnCooldown=0; this.decayTimer=0;
    this.hud=this.makeHud();
  }
  makeHud(){
    let el=document.getElementById("civicWantedHud");
    if(!el){
      el=document.createElement("div");
      el.id="civicWantedHud";
      el.style.cssText="position:fixed;left:calc(env(safe-area-inset-left) + 6px);top:calc(env(safe-area-inset-top) + 128px);z-index:24;padding:4px 6px;border:1px solid rgba(255,80,80,.45);background:rgba(20,2,2,.55);color:#ffb3b3;font:8px monospace;pointer-events:none;text-shadow:0 0 4px #f00;";
      document.body.appendChild(el);
    }
    return el;
  }
  save(){
    localStorage.setItem("cf_v116_heat",String(this.heat));
    localStorage.setItem("cf_v116_wanted",String(this.level));
  }
  addHeat(amount,reason="crime"){
    this.heat=Math.max(0,this.heat+amount);
    const old=this.level;
    this.level=Phaser.Math.Clamp(Math.floor(this.heat/2),0,5);
    this.save();
    if(this.level>old){
      toast(`CIVIC PATROL ALERT\nWANTED ${this.level}: ${reason}`);
      this.spawnUnit(true);
    }
  }
  hudUpdate(){
    if(!this.hud)return;
    const stars="★".repeat(this.level)+"☆".repeat(5-this.level);
    this.hud.innerHTML=`<span style="color:#ff7777">CIVIC PATROL</span><br>WANTED ${stars}`;
  }
  ensure(){
    if(!hi())return;
    this.hudUpdate();
    if(this.level>0 && this.units.length<Math.min(this.level,3)) this.spawnUnit(false);
  }
  spawnUnit(force=false){
    if(!hi())return;
    if(!force && this.spawnCooldown>0)return;
    const scene=this.scene;
    const target=scene.vehicleMode&&scene.vehicle?scene.vehicle:scene.player;
    if(!target)return;
    const key=trafficKey(scene);
    const y=Phaser.Math.Clamp(target.y+(target.y<scene.mapH*.5?260:-260),60,scene.mapH-60);
    const x=Phaser.Math.Clamp(target.x+(Math.random()>.5?90:-90),60,scene.mapW-60);
    const car=scene.add.image(x,y,key).setDepth(carDepth()).setScale(.92).setOrigin(.5,.5);
    car.kind="Civic Patrol"; car.heading=target.y<scene.mapH*.5?90:-90; car.speed=0; car.isCivicChaser=true;
    car.label=scene.add.text(x,y-70,"CIVIC PATROL",{fontFamily:"monospace",fontSize:"8px",color:"#ffb3b3",backgroundColor:"rgba(0,0,0,.70)",padding:{x:4,y:2}}).setOrigin(.5).setDepth(labelDepth());
    this.units.push(car); this.spawnCooldown=1800;
    try{
      if(scene.cache.audio.exists("veh_civic_blip")) scene.sound.play("veh_civic_blip",{volume:.38});
      else if(scene.cache.audio.exists("veh_police")) scene.sound.play("veh_police",{volume:.25});
    }catch(e){}
  }
  update(delta){
    if(!hi())return;
    this.spawnCooldown=Math.max(0,this.spawnCooldown-(delta||16));
    this.decayTimer+=(delta||16);
    this.hudUpdate();
    const scene=this.scene;
    const target=scene.vehicleMode&&scene.vehicle?scene.vehicle:scene.player;
    if(!target)return;
    if(this.level>0 && this.units.length<Math.min(this.level,3) && this.spawnCooldown<=0) this.spawnUnit(false);
    let near=false;
    this.units=this.units.filter(unit=>{
      if(!unit)return false;
      const dx=target.x-unit.x, dy=target.y-unit.y;
      const dist=Math.hypot(dx,dy)||1;
      if(dist<360) near=true;
      const want=Phaser.Math.RadToDeg(Math.atan2(dy,dx));
      let diff=Phaser.Math.Angle.ShortestBetween(unit.heading,want);
      unit.heading+=diff*.055;
      unit.speed=Phaser.Math.Clamp((unit.speed||0)+(delta||16)*.012,0,250+this.level*16);
      const rad=Phaser.Math.DegToRad(unit.heading);
      unit.x+=Math.cos(rad)*unit.speed*((delta||16)/1000);
      unit.y+=Math.sin(rad)*unit.speed*((delta||16)/1000);
      unit.angle=visualAngle(unit.heading);
      if(unit.label)unit.label.setPosition(unit.x,unit.y-70);
      if(scene.vehicleMode&&scene.vehicle&&Phaser.Math.Distance.Between(scene.vehicle.x,scene.vehicle.y,unit.x,unit.y)<88){
        const d=Phaser.Math.Distance.Between(scene.vehicle.x,scene.vehicle.y,unit.x,unit.y)||1;
        scene.vehicle.x+=(scene.vehicle.x-unit.x)/d*12;
        scene.vehicle.y+=(scene.vehicle.y-unit.y)/d*12;
        scene.vehicleSpeed=(scene.vehicleSpeed||0)*.72;
        this.addHeat(.15,"ramming patrol");
        try{if(scene.cache.audio.exists("veh_crash"))scene.sound.play("veh_crash",{volume:.32})}catch(e){}
      }
      if(unit.x<-240||unit.y<-240||unit.x>scene.mapW+240||unit.y>scene.mapH+240){
        if(unit.label)unit.label.destroy();
        unit.destroy();
        return false;
      }
      return true;
    });
    if(this.level>0 && this.decayTimer>2500){
      this.decayTimer=0;
      if(!near){
        this.heat=Math.max(0,this.heat-.35);
        this.level=Phaser.Math.Clamp(Math.floor(this.heat/2),0,5);
        this.save();
      }
    }
    if(scene.vehicleMode&&scene.vehicle&&Math.abs(scene.vehicleSpeed||0)>260&&Math.random()<.004){
      this.addHeat(.08,"reckless driving");
    }
  }
}
window.CFHighwayCivicPatrolManager=CivicPatrolManager;
})();
