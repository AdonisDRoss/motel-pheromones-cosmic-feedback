
const GAME_VERSION='glasswell-fixed-now-rect-collision-2026-05-25';
const ROOT='assets/maps/dust9/glasswell/';
window.GLASSWELL_TOUCH=window.GLASSWELL_TOUCH||{x:0,y:0,active:false};

const PAGES={
  GLASSWELL_C2:{id:'GLASSWELL_C2',label:'C2 — Civic Admin Street',root:ROOT+'c2/',base:'layers/GLASSWELL_C2_base.png',fg:'layers/GLASSWELL_C2_foreground_overlay.png'},
  GLASSWELL_C3:{id:'GLASSWELL_C3',label:'C3 — Main Civic Gate',root:ROOT+'c3/',base:'layers/GLASSWELL_C3_base.png',fg:'layers/GLASSWELL_C3_foreground_overlay.png'},
  GLASSWELL_C4:{id:'GLASSWELL_C4',label:'C4 — Transit Vendor Square',root:ROOT+'c4/',base:'layers/GLASSWELL_C4_base.png',fg:'layers/GLASSWELL_C4_foreground_overlay.png'},
  GLASSWELL_D3:{id:'GLASSWELL_D3',label:'D3 — Red Concord Checkpoint',root:ROOT+'d3/',base:'layers/GLASSWELL_D3_base.png',fg:'layers/GLASSWELL_D3_foreground_overlay.png'}
};
function k(id,t){return id+'_'+t}
function nrect(x,y,w,h){return{x,y,w,h}}
function rectHit(r,x,y){return x>=r.x&&x<=r.x+r.w&&y>=r.y&&y<=r.y+r.h}
function pct(w,h,a,b,c,d){return{x:a*w,y:b*h,w:c*w,h:d*h}}
function buildPageData(id,w,h){
  const data={blocks:[],routes:[],spawns:{}};
  if(id==='GLASSWELL_C3'){
    data.spawns={donny_city_start:{x:w*.50,y:h*.55},north_entry_from_C2:{x:w*.50,y:h*.19},south_entry_from_C4:{x:w*.50,y:h*.815},east_entry_from_D3:{x:w*.875,y:h*.50},west_entry_from_B3:{x:w*.11,y:h*.50}};
    data.routes=[
      {id:'c3_to_c2',to:'GLASSWELL_C2',r:pct(w,h,.38,0,.24,.12),spawn:'south_entry_from_C3'},
      {id:'c3_to_c4',to:'GLASSWELL_C4',r:pct(w,h,.38,.88,.24,.12),spawn:'north_entry_from_C3'},
      {id:'c3_to_d3',to:'GLASSWELL_D3',r:pct(w,h,.92,.38,.08,.24),spawn:'west_entry_from_C3'}
    ];
    data.blocks=[
      pct(w,h,0,0,.25,.18),pct(w,h,.75,0,.25,.18),
      pct(w,h,0,.08,.17,.34),pct(w,h,.83,.08,.17,.34),
      pct(w,h,0,.62,.24,.38),pct(w,h,.76,.62,.24,.38),
      pct(w,h,.22,.20,.10,.18),pct(w,h,.68,.20,.10,.18),
      pct(w,h,.18,.72,.14,.18),pct(w,h,.68,.72,.14,.18)
    ];
  } else if(id==='GLASSWELL_C2'){
    data.spawns={south_entry_from_C3:{x:w*.50,y:h*.85}};
    data.routes=[
      {id:'c2_to_c3',to:'GLASSWELL_C3',r:pct(w,h,.39,.91,.22,.09),spawn:'north_entry_from_C2'},
      {id:'c2_to_c1',msg:'C1 reserved',r:pct(w,h,.41,0,.18,.09)}
    ];
    data.blocks=[
      pct(w,h,0,0,.08,1),pct(w,h,.92,0,.08,1),
      pct(w,h,0,0,.39,.18),pct(w,h,.61,0,.39,.18),
      pct(w,h,0,.88,.36,.12),pct(w,h,.64,.88,.36,.12),
      pct(w,h,.08,.18,.20,.14),pct(w,h,.72,.18,.20,.14),
      pct(w,h,.08,.58,.20,.30),pct(w,h,.72,.58,.20,.30),
      pct(w,h,.34,.28,.08,.15),pct(w,h,.58,.28,.08,.15),
      pct(w,h,.34,.64,.08,.16),pct(w,h,.58,.64,.08,.16)
    ];
  } else if(id==='GLASSWELL_C4'){
    data.spawns={north_entry_from_C3:{x:w*.50,y:h*.16},west_entry_from_B4:{x:w*.10,y:h*.50},east_entry_from_D4:{x:w*.90,y:h*.50}};
    data.routes=[
      {id:'c4_to_c3',to:'GLASSWELL_C3',r:pct(w,h,.43,0,.14,.10),spawn:'south_entry_from_C4'},
      {id:'c4_to_c5',msg:'C5 reserved',r:pct(w,h,.43,.91,.14,.09)},
      {id:'c4_to_b4',msg:'B4 reserved for next integration',r:pct(w,h,0,.38,.08,.24)},
      {id:'c4_to_d4',msg:'D4 reserved for next integration',r:pct(w,h,.92,.38,.08,.24)}
    ];
    data.blocks=[
      pct(w,h,0,0,.05,1),pct(w,h,.95,0,.05,1),
      pct(w,h,0,0,.20,.22),pct(w,h,.80,0,.20,.22),
      pct(w,h,0,.78,.30,.22),pct(w,h,.70,.78,.30,.22),
      pct(w,h,.20,0,.22,.16),pct(w,h,.58,0,.22,.16),
      pct(w,h,.42,.38,.16,.17),
      pct(w,h,.30,.20,.14,.09),pct(w,h,.56,.20,.14,.09),
      pct(w,h,.19,.34,.12,.12),pct(w,h,.69,.34,.12,.12),
      pct(w,h,.20,.56,.13,.12),pct(w,h,.67,.56,.13,.12)
    ];
  } else if(id==='GLASSWELL_D3'){
    data.spawns={west_entry_from_C3:{x:w*.11,y:h*.50}};
    data.routes=[
      {id:'d3_to_c3',to:'GLASSWELL_C3',r:pct(w,h,0,.38,.08,.24),spawn:'east_entry_from_D3'},
      {id:'d3_to_e3',msg:'E3 reserved',r:pct(w,h,.92,.38,.08,.24)}
    ];
    data.blocks=[
      pct(w,h,0,0,.07,1),pct(w,h,.93,0,.07,1),
      pct(w,h,0,0,1,.13),pct(w,h,0,.87,1,.13),
      pct(w,h,.15,.18,.22,.22),pct(w,h,.63,.18,.22,.22),
      pct(w,h,.15,.60,.22,.22),pct(w,h,.63,.60,.22,.22),
      pct(w,h,.43,.28,.14,.12),pct(w,h,.43,.60,.14,.12),
      pct(w,h,.28,.42,.10,.16),pct(w,h,.62,.42,.10,.16)
    ];
  }
  return data;
}

function setupControls(){
  if(window.GLASSWELL_CONTROLS_READY)return;
  window.GLASSWELL_CONTROLS_READY=true;
  const touch=window.GLASSWELL_TOUCH, knob=document.getElementById('stickKnob'), label=document.getElementById('moveLabel');
  let active=null, center=null; const max=52;
  const prevent=e=>{if(e&&e.cancelable)e.preventDefault()};
  const getCenter=()=>{const el=document.getElementById('stickBase');const r=el.getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2}};
  const set=(x,y)=>{center=center||getCenter();let dx=x-center.x,dy=y-center.y;const len=Math.hypot(dx,dy);if(len>max){dx=dx/len*max;dy=dy/len*max}touch.x=Math.abs(dx/max)<.08?0:dx/max;touch.y=Math.abs(dy/max)<.08?0:dy/max;touch.active=true;if(knob)knob.style.transform=`translate(${dx}px,${dy}px)`;if(label)label.textContent='MOVE ON'};
  const stop=()=>{active=null;center=null;touch.x=0;touch.y=0;touch.active=false;if(knob)knob.style.transform='translate(0,0)';if(label)label.textContent='MOVE'};
  document.addEventListener('touchstart',e=>{for(const t of e.changedTouches){if(t.clientX<innerWidth*.50){active=t.identifier;center=getCenter();set(t.clientX,t.clientY);prevent(e);break}}},{capture:true,passive:false});
  document.addEventListener('touchmove',e=>{if(active===null)return;for(const t of e.touches){if(t.identifier===active){set(t.clientX,t.clientY);prevent(e);break}}},{capture:true,passive:false});
  document.addEventListener('touchend',e=>{for(const t of e.changedTouches){if(t.identifier===active){stop();prevent(e);break}}},{capture:true,passive:false});
  document.addEventListener('touchcancel',e=>{stop();prevent(e)},{capture:true,passive:false});
  document.addEventListener('pointerdown',e=>{if(e.target.closest&&e.target.closest('.touchBtn,#btnStart'))return;if(e.clientX<innerWidth*.50){active=e.pointerId;center=getCenter();set(e.clientX,e.clientY);prevent(e)}},{capture:true,passive:false});
  document.addEventListener('pointermove',e=>{if(e.pointerId===active){set(e.clientX,e.clientY);prevent(e)}},{capture:true,passive:false});
  document.addEventListener('pointerup',e=>{if(e.pointerId===active){stop();prevent(e)}},{capture:true,passive:false});
}
function bindButtons(scene){
  const bind=(id,fn)=>{const el=document.getElementById(id);if(!el||el.dataset.bound)return;el.dataset.bound='1';['pointerdown','touchstart'].forEach(ev=>el.addEventListener(ev,e=>{if(e.cancelable)e.preventDefault();fn()}, {passive:false}))};
  bind('btnA',()=>scene.interact()); bind('btnB',()=>scene.message('B reserved')); bind('btnX',()=>scene.toggleDebug()); bind('btnY',()=>scene.toggleCollision()); bind('btnStart',()=>scene.scene.start('TitleScene'));
}

class TitleScene extends Phaser.Scene{
  constructor(){super('TitleScene')}
  create(){
    this.cameras.main.setBackgroundColor('#050607'); const w=this.scale.width,h=this.scale.height;
    this.add.text(w/2,76,'COSMIC FEEDBACK',{fontFamily:'Arial Black',fontSize:'32px',color:'#e8e1cf'}).setOrigin(.5);
    this.add.text(w/2,130,'GLASSWELL CITY START',{fontFamily:'Arial Black',fontSize:'40px',color:'#9ff4ff'}).setOrigin(.5).setShadow(0,0,'#67dce8',8,true,true);
    this.add.text(w/2,178,'DONNY IN THE CITY',{fontFamily:'Arial Black',fontSize:'24px',color:'#d9b46a'}).setOrigin(.5);
    this.add.text(w/2,282,'Tap / Enter to start\nLeft side drag = move\nY = collision boxes | X = route debug',{fontFamily:'Courier New',fontSize:'18px',color:'#d5c7a3',align:'center',lineSpacing:8}).setOrigin(.5);
    const go=()=>this.scene.start('MapScene',{pageId:'GLASSWELL_C3',spawn:'donny_city_start'});
    this.input.once('pointerdown',go); this.input.keyboard.once('keydown-ENTER',go); this.input.keyboard.once('keydown-SPACE',go);
  }
}
class MapScene extends Phaser.Scene{
  constructor(){super('MapScene');this.speed=210;this.debug=false;this.collisionVisible=false;this.cool=0}
  init(d){this.startId=d?.pageId||'GLASSWELL_C3';this.startSpawn=d?.spawn||'donny_city_start'}
  preload(){Object.values(PAGES).forEach(p=>{this.load.image(k(p.id,'base'),p.root+p.base+'?v='+GAME_VERSION);this.load.image(k(p.id,'fg'),p.root+p.fg+'?v='+GAME_VERSION)})}
  create(){setupControls();bindButtons(this);this.makePlayer();this.keys=this.input.keyboard.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT,E,X,Y,ESC');this.input.keyboard.on('keydown-E',()=>this.interact());this.input.keyboard.on('keydown-X',()=>this.toggleDebug());this.input.keyboard.on('keydown-Y',()=>this.toggleCollision());this.input.keyboard.on('keydown-ESC',()=>this.scene.start('TitleScene'));this.makeHud();this.loadPage(this.startId,this.startSpawn)}
  makePlayer(){const g=this.add.graphics();g.fillStyle(0,0.35).fillEllipse(27,60,36,10);g.fillStyle(0x111111).fillRect(16,42,8,18).fillRect(31,42,8,18);g.fillStyle(0x09090b).fillRoundedRect(11,18,34,25,6);g.lineStyle(2,0x2f3338).strokeRoundedRect(11,18,34,25,6);g.fillStyle(0x2b1b12).fillRoundedRect(17,7,20,15,5);g.fillStyle(0x9ff4ff).fillRect(21,13,3,2).fillRect(31,13,3,2);g.lineStyle(3,0x2b2b2b).lineBetween(47,16,47,54);g.generateTexture('donny_player',58,70);g.destroy()}
  makeHud(){this.hud=this.add.text(10,8,'',{fontFamily:'Arial Black',fontSize:'13px',color:'#d7faff',backgroundColor:'rgba(0,0,0,.55)',padding:{x:8,y:5}}).setScrollFactor(0).setDepth(20000);this.prompt=this.add.text(10,this.scale.height-36,'',{fontFamily:'Arial',fontSize:'14px',color:'#f0e5be',backgroundColor:'rgba(0,0,0,.62)',padding:{x:8,y:6}}).setScrollFactor(0).setDepth(20000)}
  loadPage(id,spawnId){this.children.list.filter(o=>o.mapObj).forEach(o=>o.destroy());this.pageId=id;this.cfg=PAGES[id];const img=this.textures.get(k(id,'base')).getSourceImage();this.mapW=img.width;this.mapH=img.height;this.data=buildPageData(id,this.mapW,this.mapH);this.add.image(0,0,k(id,'base')).setOrigin(0).setDepth(0).setData('mapObj',true);if(!this.player)this.player=this.add.sprite(0,0,'donny_player');const sp=this.data.spawns[spawnId]||this.data.spawns.donny_city_start||Object.values(this.data.spawns)[0]||{x:this.mapW/2,y:this.mapH/2};this.player.setPosition(sp.x,sp.y).setDepth(sp.y+1000);this.add.image(0,0,k(id,'fg')).setOrigin(0).setDepth(9000).setData('mapObj',true);this.cameras.main.setBounds(0,0,this.mapW,this.mapH);this.cameras.main.startFollow(this.player,true,.12,.12);this.drawDebug();this.cool=this.time.now+500;this.message(this.cfg.label)}
  blocked(x,y){if(x<18||y<18||x>this.mapW-18||y>this.mapH-18)return true;return this.data.blocks.some(r=>rectHit(r,x,y))}
  moveTry(nx,ny){const footY=28, half=10;const samples=[[0,footY],[-half,footY],[half,footY],[0,footY+7]];return samples.every(([ox,oy])=>!this.blocked(nx+ox,ny+oy))}
  drawDebug(){if(this.g)this.g.destroy();this.g=this.add.graphics().setDepth(12000).setData('mapObj',true);this.g.setVisible(this.debug||this.collisionVisible);if(this.collisionVisible){this.g.fillStyle(0xff0000,.24);this.data.blocks.forEach(r=>this.g.fillRect(r.x,r.y,r.w,r.h))}if(this.debug){this.g.lineStyle(3,0x48f5ff,.9);this.data.routes.forEach(t=>this.g.strokeRect(t.r.x,t.r.y,t.r.w,t.r.h))}}
  toggleDebug(){this.debug=!this.debug;this.drawDebug();this.message(`Route debug ${this.debug?'on':'off'}`)}
  toggleCollision(){this.collisionVisible=!this.collisionVisible;this.drawDebug();this.message(`Collision boxes ${this.collisionVisible?'on':'off'}`)}
  message(t){this.prompt.setText(t);this.time.delayedCall(1800,()=>{if(this.prompt.text===t)this.prompt.setText('')})}
  currentRoute(){const x=this.player.x,y=this.player.y+28;return this.data.routes.find(t=>rectHit(t.r,x,y))}
  interact(){const t=this.currentRoute();if(t)this.route(t);else this.message('No route here')}
  route(t){if(this.time.now<this.cool)return;if(t.msg){this.message(t.msg);this.cool=this.time.now+600;return}this.cameras.main.fadeOut(120,0,0,0);this.time.delayedCall(130,()=>{this.loadPage(t.to,t.spawn);this.cameras.main.fadeIn(160,0,0,0)})}
  update(_,delta){if(!this.player)return;const d=window.GLASSWELL_TOUCH||{x:0,y:0};let vx=d.x,vy=d.y;if(this.keys.LEFT.isDown||this.keys.A.isDown)vx--;if(this.keys.RIGHT.isDown||this.keys.D.isDown)vx++;if(this.keys.UP.isDown||this.keys.W.isDown)vy--;if(this.keys.DOWN.isDown||this.keys.S.isDown)vy++;const len=Math.hypot(vx,vy);if(len>1){vx/=len;vy/=len}const step=this.speed*delta/1000;let nx=this.player.x+vx*step,ny=this.player.y+vy*step;if(this.moveTry(nx,this.player.y))this.player.x=Phaser.Math.Clamp(nx,0,this.mapW);if(this.moveTry(this.player.x,ny))this.player.y=Phaser.Math.Clamp(ny,0,this.mapH);this.player.setDepth(this.player.y+1000);this.hud.setText(`${this.cfg.label} | Donny | ${Math.round(this.player.x)},${Math.round(this.player.y)}`);const t=this.currentRoute();if(t){this.prompt.setText(t.msg||`Route: ${t.to}`);if(!t.msg)this.route(t)}}
}
new Phaser.Game({type:Phaser.AUTO,parent:'game',width:960,height:540,backgroundColor:'#000',scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},scene:[TitleScene,MapScene]});
