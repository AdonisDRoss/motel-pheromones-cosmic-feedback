
(function(){
"use strict";
function depth(){try{return DEPTH.CHARACTER_BASE+300}catch(e){return 2600}}
function labelDepth(){try{return DEPTH.LABEL+120}catch(e){return 5100}}
function toast(t){try{if(typeof showToast==="function")showToast(t)}catch(e){}}
function setModeText(t){try{if(typeof setMode==="function")setMode(t)}catch(e){}}
function carAngle(heading){return heading+180}
class VehicleManager{
  constructor(scene, traffic, npc){this.scene=scene;this.traffic=traffic;this.npc=npc;this.pulled=[];}
  makePulledDriver(car){
    const scene=this.scene;
    const label=(car&&car.kind?car.kind:"Car")+" Driver";
    let n;
    if(this.npc && this.npc.npcs){
      // small marker matching NPC manager style
      n=scene.add.container(car.x+42,car.y+28).setDepth(depth());
      n.add([scene.add.ellipse(0,13,24,8,0x000000,.35),scene.add.rectangle(0,8,10,16,0x1f2734,.96),scene.add.rectangle(0,-5,14,20,0xffb36b,.98),scene.add.circle(0,-21,7,0xc98b5c,.98)]);
      n.label=scene.add.text(n.x,n.y-43,label,{fontFamily:"monospace",fontSize:"8px",color:"#e8fbff",backgroundColor:"rgba(0,0,0,.70)",padding:{x:4,y:2}}).setOrigin(.5).setDepth(labelDepth());
    }else return;
    n.fleeLife=2600;n.fleeVX=(car.x<scene.mapW*.5?-1:1)*(1.3+Math.random()*.7);n.fleeVY=(Math.random()>.5?1:-1)*(.8+Math.random()*.5);
    this.pulled.push(n);
  }
  updatePulled(delta){
    const scene=this.scene,d=Math.max(.8,Math.min(2,(delta||16)/16.666));
    this.pulled=this.pulled.filter(n=>{
      n.x+=n.fleeVX*d;n.y+=n.fleeVY*d;n.fleeLife-=delta||16;
      if(n.label)n.label.setPosition(n.x,n.y-43);
      if(n.fleeLife<=0||n.x<-80||n.y<-80||n.x>scene.mapW+80||n.y>scene.mapH+80){try{if(n.label)n.label.destroy();n.destroy()}catch(e){}return false}
      return true;
    });
  }
  carjack(){
    const scene=this.scene, car=this.traffic.nearestJackable();
    if(!car)return false;
    const key=(car.texture&&car.texture.key)||"donny_car",x=car.x,y=car.y,ang=car.angle||0;
    try{if(car.nameLabel)car.nameLabel.destroy()}catch(e){}
    this.makePulledDriver(car);
    this.traffic.removeCar(car);
    const pc=scene.add.image(x,y,key).setDepth(depth()).setOrigin(.5,.5).setScale(.90);
    pc.isPlayerVehicle=true;pc.stolen=true;pc.jacked=true;pc.kind="Stolen Vehicle";pc.angle=ang;
    if(scene.vehicle&&scene.vehicle!==pc){try{scene.vehicle.setVisible(true);scene.vehicle.setAlpha(.55)}catch(e){}}
    scene.vehicle=pc;scene.playerVehicle=pc;scene.vehicleMode=true;scene.vehicleSpeed=0;scene.vehicleHeading=ang-180;pc.angle=carAngle(scene.vehicleHeading);
    if(scene.player){scene.player.setVisible(false);scene.player.setPosition(pc.x,pc.y);if(scene.player.body)scene.player.body.enable=false;}
    if(scene.vehicleLabel)scene.vehicleLabel.setText("STOLEN VEHICLE\nX EXIT").setPosition(pc.x,pc.y-58).setVisible(true);
    else scene.vehicleLabel=scene.add.text(pc.x,pc.y-58,"STOLEN VEHICLE\nX EXIT",{fontFamily:"monospace",fontSize:"8px",color:"#9eefff",backgroundColor:"rgba(0,0,0,.55)",padding:{x:4,y:2},align:"center"}).setOrigin(.5).setDepth(labelDepth());
    if(scene.cameras&&scene.cameras.main)scene.cameras.main.startFollow(scene.vehicle,true,.12,.12,0,0);
    setModeText("IN CAR");
    try{if(scene.addWanted)scene.addWanted(2.2,"carjacking")}catch(e){}
    try{if(scene.v116Civic)scene.v116Civic.addHeat(2.4,"carjacking")}catch(e){}
    toast("CARJACKED\nv115 player-only car");
    return true;
  }
}
window.CFHighwayVehicleManager=VehicleManager;
window.CFHighwayCarAngle=carAngle;
})();
