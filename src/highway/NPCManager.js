
(function(){
"use strict";
const NPC = {};
function hi(){try{return AREA==="highway"||AREA==="highway_loop"}catch(e){return false}}
function chunk(){try{return typeof loopChunk==="function"?loopChunk():0}catch(e){return 0}}
function depth(){try{return DEPTH.CHARACTER_BASE+280}catch(e){return 2500}}
function labelDepth(){try{return DEPTH.LABEL+100}catch(e){return 5000}}
function toast(t){try{if(typeof showToast==="function")showToast(t)}catch(e){}}
function makeNpc(scene,x,y,label,color){
  const c=scene.add.container(x,y).setDepth(depth());
  c.add([
    scene.add.ellipse(0,13,24,8,0x000000,.35),
    scene.add.rectangle(0,8,10,16,0x1f2734,.96).setStrokeStyle(1,0x05070b,.9),
    scene.add.rectangle(0,-5,14,20,color,.98).setStrokeStyle(1,0x05070b,.9),
    scene.add.circle(0,-21,7,0xc98b5c,.98).setStrokeStyle(1,0x05070b,.9)
  ]);
  c.homeX=x; c.homeY=y;
  c.vx=(Math.random()>.5?1:-1)*(.16+Math.random()*.10);
  c.vy=(Math.random()>.5?1:-1)*(.10+Math.random()*.08);
  c.isHighwayNpc=true;
  c.label=scene.add.text(x,y-43,label,{fontFamily:"monospace",fontSize:"8px",color:"#e8fbff",backgroundColor:"rgba(0,0,0,.70)",padding:{x:4,y:2}}).setOrigin(.5).setDepth(labelDepth());
  return c;
}
function layout(scene){
  const c=chunk();
  const base=[[.12,.22],[.88,.24],[.13,.48],[.87,.52],[.16,.75],[.84,.78]];
  return base.map((p,i)=>({
    x:Phaser.Math.Clamp(scene.mapW*p[0]+(((c+i)%3)-1)*16,56,scene.mapW-56),
    y:Phaser.Math.Clamp(scene.mapH*p[1]+((c+i)%2?12:-12),56,scene.mapH-56)
  }));
}
class NPCManager{
  constructor(scene){this.scene=scene;this.npcs=[];this.key="";}
  clear(){
    this.npcs.forEach(n=>{try{if(n.label)n.label.destroy();n.destroy()}catch(e){}});
    this.npcs=[];
  }
  spawn(force=false){
    const scene=this.scene;
    if(!hi()) return;
    const key=`${AREA}:${chunk()}:${scene.mapW}x${scene.mapH}`;
    if(!force && this.key===key && this.npcs.length) return;
    this.clear();
    const labels=["Civilian","Mechanic","Water Carrier","Elderly","Civilian","Civilian"];
    const colors=[0x8bb6ff,0xa0a0a0,0x2f7cff,0xd8bd7a,0xd08cff,0x88d18a];
    layout(scene).forEach((pt,i)=>this.npcs.push(makeNpc(scene,pt.x,pt.y,labels[(i+chunk())%labels.length],colors[(i+chunk())%colors.length])));
    this.key=key;
    toast(`v115 NPCS\n${this.npcs.length} on chunk ${chunk()}`);
  }
  update(delta){
    const scene=this.scene;
    if(!hi()) return;
    if(!this.npcs.length || this.key!==`${AREA}:${chunk()}:${scene.mapW}x${scene.mapH}`){this.spawn(true);return;}
    const d=Math.max(.8,Math.min(2,(delta||16)/16.666));
    const car=scene.vehicleMode&&scene.vehicle?scene.vehicle:null;
    this.npcs.forEach(n=>{
      n.x+=n.vx*d; n.y+=n.vy*d;
      if(Math.abs(n.x-n.homeX)>36)n.vx*=-1;
      if(Math.abs(n.y-n.homeY)>28)n.vy*=-1;
      if(car){
        const dist=Phaser.Math.Distance.Between(car.x,car.y,n.x,n.y);
        if(dist<95){n.x+=(n.x-car.x)/(dist||1)*1.8;n.y+=(n.y-car.y)/(dist||1)*1.8;}
      }
      if(n.label)n.label.setPosition(n.x,n.y-43);
    });
  }
}
window.CFHighwayNPCManager=NPCManager;
})();
