
const GAME_VERSION = 'glasswell-city-so-far-donny-start-2026-05-25';
const ROOT = 'assets/maps/dust9/glasswell/';

const CITY_START = {
  character: 'Donny',
  pageId: 'GLASSWELL_C3',
  spawnId: 'donny_city_start'
};

const PAGES = {
  GLASSWELL_C2: {
    id:'GLASSWELL_C2', label:'C2 — Civic Admin Street', root:ROOT+'c2/',
    base:'layers/GLASSWELL_C2_base.png', fg:'layers/GLASSWELL_C2_foreground_overlay.png', mask:'masks/GLASSWELL_C2_collision_mask.png',
    page:'data/GLASSWELL_C2_page.json', depth:'data/GLASSWELL_C2_depth_zones.json', transitions:'data/GLASSWELL_C2_transitions.json', spawns:'data/GLASSWELL_C2_spawn_points.json'
  },
  GLASSWELL_C3: {
    id:'GLASSWELL_C3', label:'C3 — Main Civic Gate', root:ROOT+'c3/',
    base:'layers/GLASSWELL_C3_base.png', fg:'layers/GLASSWELL_C3_foreground_overlay.png', mask:'masks/GLASSWELL_C3_collision_mask.png',
    page:'data/GLASSWELL_C3_page.json', depth:'data/GLASSWELL_C3_depth_zones.json', transitions:'data/GLASSWELL_C3_transitions.json', spawns:'data/GLASSWELL_C3_spawn_points.json'
  },
  GLASSWELL_C4: {
    id:'GLASSWELL_C4', label:'C4 — Transit Vendor Square', root:ROOT+'c4/',
    base:'layers/GLASSWELL_C4_base.png', fg:'layers/GLASSWELL_C4_foreground_overlay.png', mask:'masks/GLASSWELL_C4_collision_mask.png',
    page:'data/GLASSWELL_C4_page.json', depth:'data/GLASSWELL_C4_depth_zones.json', transitions:'data/GLASSWELL_C4_transitions.json', spawns:'data/GLASSWELL_C4_spawn_points.json'
  },
  GLASSWELL_D3: {
    id:'GLASSWELL_D3', label:'D3 — Red Concord Checkpoint', root:ROOT+'d3/',
    base:'layers/GLASSWELL_D3_base.png', fg:'layers/GLASSWELL_D3_foreground_overlay.png', mask:'masks/GLASSWELL_D3_collision_mask.png',
    page:'data/GLASSWELL_D3_page.json', depth:'data/GLASSWELL_D3_depth_zones.json', transitions:'data/GLASSWELL_D3_transitions.json', spawns:'data/GLASSWELL_D3_spawn_points.json'
  }
};

function key(pageId, type){ return `${pageId}_${type}`; }
function spawnList(data){ return data?.spawns || data?.spawnPoints || []; }
function targetOf(t){ return t.to || t.targetPage; }
function pointInRect(r,x,y){ return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h; }

class TitleScene extends Phaser.Scene {
  constructor(){ super('TitleScene'); }
  create(){
    const w=this.scale.width,h=this.scale.height;
    this.cameras.main.setBackgroundColor('#050607');

    const g=this.add.graphics();
    g.fillStyle(0x050607,1).fillRect(0,0,w,h);
    g.fillStyle(0x111719,1).fillRect(0,h*.54,w,h*.46);
    g.lineStyle(1,0x67dce8,.12);
    for(let i=0;i<28;i++) g.strokeLineShape(new Phaser.Geom.Line(0,h*.55+i*11,w,h*.48+i*17));

    for(let i=0;i<100;i++){
      g.fillStyle(Phaser.Math.RND.pick([0x67dce8,0x7e1b1b,0xd2a24e]), Phaser.Math.FloatBetween(.04,.16));
      g.fillRect(Phaser.Math.Between(0,w), Phaser.Math.Between(0,h), Phaser.Math.Between(1,3), 1);
    }

    this.add.text(w/2,58,'COSMIC FEEDBACK',{fontFamily:'Arial Black, Impact, sans-serif',fontSize:'32px',color:'#e8e1cf'}).setOrigin(.5);
    this.add.text(w/2,108,'GLASSWELL CITY START',{fontFamily:'Arial Black, Impact, sans-serif',fontSize:'42px',color:'#9ff4ff'}).setOrigin(.5).setShadow(0,0,'#67dce8',8,true,true);
    this.add.text(w/2,154,'DONNY IN THE CITY',{fontFamily:'Arial Black, sans-serif',fontSize:'24px',color:'#d9b46a'}).setOrigin(.5);
    this.add.text(w/2,205,'C2 ↔ C3 ↔ C4 / C3 ↔ D3',{fontFamily:'Arial Black, sans-serif',fontSize:'17px',color:'#b9c0b6'}).setOrigin(.5);

    this.add.text(w/2,302,[
      'WASD / arrows = move Donny',
      'Walk into route triggers = page transition',
      'E / A = interact with current route trigger',
      'F / X = debug zones',
      'C / Y = collision mask preview',
      'ESC = title'
    ].join('\n'),{fontFamily:'Courier New, monospace',fontSize:'17px',color:'#d5c7a3',align:'center',lineSpacing:7}).setOrigin(.5);

    const start=this.add.text(w/2,h-72,'TAP / CLICK / ENTER TO START',{fontFamily:'Arial Black, sans-serif',fontSize:'20px',color:'#fff',backgroundColor:'#511818',padding:{x:18,y:10}}).setOrigin(.5);
    this.tweens.add({targets:start,alpha:.45,duration:650,yoyo:true,repeat:-1});

    const go=()=>this.scene.start('MapScene',{pageId:CITY_START.pageId,spawnId:CITY_START.spawnId,character:CITY_START.character});
    this.input.once('pointerdown',go);
    this.input.keyboard.once('keydown-ENTER',go);
    this.input.keyboard.once('keydown-SPACE',go);
  }
}

class MapScene extends Phaser.Scene {
  constructor(){
    super('MapScene');
    this.speed=190;
    this.debugVisible=false;
    this.maskVisible=false;
    this.transitionCooldownUntil=0;
    this.characterName='Donny';
  }

  init(data){
    this.startPageId=data?.pageId || CITY_START.pageId;
    this.startSpawnId=data?.spawnId || CITY_START.spawnId;
    this.startExplicitSpawn=data?.spawn || null;
    this.characterName=data?.character || CITY_START.character;
  }

  preload(){
    Object.values(PAGES).forEach(p=>{
      this.load.image(key(p.id,'base'), p.root+p.base+'?v='+GAME_VERSION);
      this.load.image(key(p.id,'fg'), p.root+p.fg+'?v='+GAME_VERSION);
      this.load.image(key(p.id,'mask'), p.root+p.mask+'?v='+GAME_VERSION);
      this.load.json(key(p.id,'page'), p.root+p.page+'?v='+GAME_VERSION);
      this.load.json(key(p.id,'depth'), p.root+p.depth+'?v='+GAME_VERSION);
      this.load.json(key(p.id,'transitions'), p.root+p.transitions+'?v='+GAME_VERSION);
      this.load.json(key(p.id,'spawns'), p.root+p.spawns+'?v='+GAME_VERSION);
    });
  }

  create(){
    this.makeDonnyTexture();
    this.createInput();
    this.createHud();
    this.loadPage(this.startPageId, this.startSpawnId, this.startExplicitSpawn);
  }

  makeDonnyTexture(){
    const g=this.add.graphics();
    g.fillStyle(0x000000,.35).fillEllipse(25,56,34,10);
    g.fillStyle(0x060606,1).fillRect(15,42,7,16).fillRect(29,42,7,16);
    g.fillStyle(0x111111,1).fillRect(12,56,12,5).fillRect(28,56,12,5);
    g.fillStyle(0x171717,1).fillRoundedRect(13,30,24,17,4);
    g.fillStyle(0x0a0a0c,1).fillRoundedRect(10,16,30,24,5);
    g.lineStyle(2,0x2f3338,1).strokeRoundedRect(10,16,30,24,5);
    g.fillStyle(0x1e2428,1).fillTriangle(16,17,25,32,11,32);
    g.fillTriangle(34,17,25,32,39,32);
    g.fillStyle(0x2b1b12,1).fillRoundedRect(16,6,18,14,5);
    g.fillStyle(0x15110f,1).fillRoundedRect(14,4,22,8,4);
    g.fillStyle(0x9ff4ff,1).fillRect(19,12,3,2).fillRect(29,12,3,2);
    g.lineStyle(3,0x2b2b2b,1).lineBetween(42,14,42,50);
    g.lineStyle(2,0x7a7a72,1).lineBetween(39,14,47,14);
    g.lineStyle(2,0x2b2b2b,1).lineBetween(37,51,47,51);
    g.fillStyle(0x7e1b1b,1).fillRect(10,26,3,6).fillRect(37,26,3,6);
    g.generateTexture('donny_player', 54, 66);
    g.destroy();
  }

  clearPage(){
    [this.baseLayer,this.foregroundLayer,this.maskLayer,this.debugG].forEach(o=>{if(o)o.destroy();});
  }

  loadPage(pageId, spawnId='default_start', explicitSpawn=null){
    if(!PAGES[pageId]){
      this.message(`Page not built: ${pageId}`);
      return;
    }

    this.clearPage();
    this.pageId=pageId;
    this.cfg=PAGES[pageId];
    this.pageData=this.cache.json.get(key(pageId,'page'));
    this.depthData=this.cache.json.get(key(pageId,'depth'));
    this.transitionsData=this.cache.json.get(key(pageId,'transitions'));
    this.spawnsData=this.cache.json.get(key(pageId,'spawns'));

    const baseImage=this.textures.get(key(pageId,'base')).getSourceImage();
    this.mapW=this.pageData?.canvas?.width || baseImage.width;
    this.mapH=this.pageData?.canvas?.height || baseImage.height;

    this.baseLayer=this.add.image(0,0,key(pageId,'base')).setOrigin(0,0).setScale(1).setDepth(0);
    this.maskLayer=this.add.image(0,0,key(pageId,'mask')).setOrigin(0,0).setScale(1).setDepth(8000).setAlpha(.32).setVisible(this.maskVisible);
    this.prepareMask(pageId);

    const spawn=explicitSpawn || this.findSpawn(spawnId) || this.findSpawn(this.pageData?.defaultSpawn) || this.findSpawn(this.spawnsData?.defaultSpawn) || this.findSpawn('default_start') || {x:this.mapW/2,y:this.mapH/2};

    if(!this.player){
      this.player=this.add.sprite(spawn.x, spawn.y, 'donny_player');
      this.player.footOffsetY=24;
    } else {
      this.player.setTexture('donny_player').setPosition(spawn.x, spawn.y);
    }

    this.player.setDepth(this.player.y+1000);
    this.foregroundLayer=this.add.image(0,0,key(pageId,'fg')).setOrigin(0,0).setScale(1).setDepth(9000);

    this.cameras.main.setBounds(0,0,this.mapW,this.mapH);
    this.physics.world.setBounds(0,0,this.mapW,this.mapH);
    this.cameras.main.startFollow(this.player,true,.11,.11);
    this.cameras.main.setZoom(1);

    this.drawDebug();
    this.updateHud();
    this.transitionCooldownUntil=this.time.now+550;
    this.message(`${this.characterName} entered ${this.cfg.label}`);
  }

  prepareMask(pageId){
    const img=this.textures.get(key(pageId,'mask')).getSourceImage();
    this.maskCanvas=document.createElement('canvas');
    this.maskCanvas.width=img.width;
    this.maskCanvas.height=img.height;
    const ctx=this.maskCanvas.getContext('2d',{willReadFrequently:true});
    ctx.drawImage(img,0,0);
    this.maskCtx=ctx;
  }

  findSpawn(id){
    if(!id)return null;
    return spawnList(this.spawnsData).find(s=>s.id===id);
  }

  isWalkable(x,y){
    x=Math.floor(Phaser.Math.Clamp(x,0,this.mapW-1));
    y=Math.floor(Phaser.Math.Clamp(y,0,this.mapH-1));
    const p=this.maskCtx.getImageData(x,y,1,1).data;
    return p[0]>=220 && p[1]>=220 && p[2]>=220;
  }

  createInput(){
    this.cursors=this.input.keyboard.createCursorKeys();
    this.keys=this.input.keyboard.addKeys({
      W:Phaser.Input.Keyboard.KeyCodes.W,A:Phaser.Input.Keyboard.KeyCodes.A,S:Phaser.Input.Keyboard.KeyCodes.S,D:Phaser.Input.Keyboard.KeyCodes.D,
      E:Phaser.Input.Keyboard.KeyCodes.E,F:Phaser.Input.Keyboard.KeyCodes.F,C:Phaser.Input.Keyboard.KeyCodes.C,ESC:Phaser.Input.Keyboard.KeyCodes.ESC
    });
    this.input.keyboard.on('keydown-E',()=>this.interact());
    this.input.keyboard.on('keydown-F',()=>this.toggleDebug());
    this.input.keyboard.on('keydown-C',()=>this.toggleMask());
    this.input.keyboard.on('keydown-ESC',()=>this.scene.start('TitleScene'));
    this.touch=new Phaser.Math.Vector2(0,0);
    this.touchActive=false;
    this.createTouch();
  }

  createTouch(){
    const sx=88,sy=this.scale.height-86;
    this.stick={x:sx,y:sy,radius:52};
    const cont=this.add.container(sx,sy).setScrollFactor(0).setDepth(20000);
    const base=this.add.circle(0,0,52,0x111111,.45).setStrokeStyle(2,0xffffff,.35);
    this.knob=this.add.circle(0,0,20,0xffffff,.22).setStrokeStyle(2,0x67dce8,.7);
    cont.add([base,this.knob]);

    const button=(x,y,label,fn)=>{
      const c=this.add.circle(x,y,29,0x111111,.55).setStrokeStyle(2,0xffffff,.35).setScrollFactor(0).setDepth(20000).setInteractive();
      this.add.text(x,y,label,{fontFamily:'Arial Black',fontSize:'16px',color:'#fff'}).setOrigin(.5).setScrollFactor(0).setDepth(20001);
      c.on('pointerdown',fn);
    };

    button(this.scale.width-128,this.scale.height-108,'A',()=>this.interact());
    button(this.scale.width-70,this.scale.height-74,'B',()=>this.message('B reserved'));
    button(this.scale.width-128,this.scale.height-42,'Y',()=>this.toggleMask());
    button(this.scale.width-186,this.scale.height-74,'X',()=>this.toggleDebug());

    this.input.on('pointerdown',p=>{
      if(Phaser.Math.Distance.Between(p.x,p.y,this.stick.x,this.stick.y)<=86){
        this.touchActive=true;
        this.updateStick(p);
      }
    });
    this.input.on('pointermove',p=>{if(this.touchActive)this.updateStick(p);});
    this.input.on('pointerup',()=>{this.touchActive=false;this.touch.set(0,0);this.knob.setPosition(0,0);});
  }

  updateStick(p){
    const v=new Phaser.Math.Vector2(p.x-this.stick.x,p.y-this.stick.y);
    if(v.length()>this.stick.radius)v.setLength(this.stick.radius);
    this.knob.setPosition(v.x,v.y);
    this.touch.set(v.x/this.stick.radius,v.y/this.stick.radius);
    if(this.touch.length()<.16)this.touch.set(0,0);
  }

  createHud(){
    this.add.rectangle(0,0,this.scale.width,38,0x000000,.70).setOrigin(0).setScrollFactor(0).setDepth(19000);
    this.hudTitle=this.add.text(10,8,'',{fontFamily:'Arial Black, sans-serif',fontSize:'13px',color:'#d7faff'}).setScrollFactor(0).setDepth(19001);
    this.hudChar=this.add.text(this.scale.width-10,8,'DONNY',{fontFamily:'Arial Black, sans-serif',fontSize:'13px',color:'#d9b46a'}).setOrigin(1,0).setScrollFactor(0).setDepth(19001);
    this.prompt=this.add.text(10,this.scale.height-34,'',{fontFamily:'Arial, sans-serif',fontSize:'14px',color:'#f0e5be',backgroundColor:'rgba(0,0,0,0.62)',padding:{x:8,y:6}}).setScrollFactor(0).setDepth(19001);
    this.toast=this.add.text(this.scale.width/2,58,'',{fontFamily:'Arial, sans-serif',fontSize:'16px',color:'#fff',backgroundColor:'rgba(70,20,20,0.74)',padding:{x:12,y:8}}).setOrigin(.5).setScrollFactor(0).setDepth(19002).setAlpha(0);
  }

  updateHud(){
    this.hudTitle.setText(`${this.cfg.label} | ${this.mapW}x${this.mapH} | F debug | C mask`);
    this.hudChar.setText(`${this.characterName.toUpperCase()}  HP 100`);
  }

  message(txt){
    this.toast.setText(txt).setAlpha(1);
    this.tweens.killTweensOf(this.toast);
    this.tweens.add({targets:this.toast,alpha:0,duration:650,delay:2200});
  }

  drawDebug(){
    if(this.debugG)this.debugG.destroy();
    this.debugG=this.add.graphics().setDepth(8900).setVisible(this.debugVisible);
    const g=this.debugG;

    for(const z of this.depthData?.zones || []){
      if(z.type==='rect'){
        g.fillStyle(0xb06dff,.10).fillRect(z.x,z.y,z.w,z.h);
        g.lineStyle(2,0xb06dff,.8).strokeRect(z.x,z.y,z.w,z.h);
      } else if(z.type==='polygon'){
        const pts=z.points.map(p=>new Phaser.Geom.Point(p.x,p.y));
        g.fillStyle(0xb06dff,.08).fillPoints(pts,true);
        g.lineStyle(2,0xb06dff,.65).strokePoints(pts,true);
      }
    }

    for(const t of this.transitionsData?.transitions || []){
      const r=t.trigger;
      const col=t.disabled?0xbb3333:0x48f5ff;
      g.fillStyle(col,.14).fillRect(r.x,r.y,r.w,r.h);
      g.lineStyle(3,col,.92).strokeRect(r.x,r.y,r.w,r.h);
    }
  }

  toggleDebug(){
    this.debugVisible=!this.debugVisible;
    if(this.debugG)this.debugG.setVisible(this.debugVisible);
    this.message(`Debug zones ${this.debugVisible?'on':'off'}`);
  }

  toggleMask(){
    this.maskVisible=!this.maskVisible;
    if(this.maskLayer)this.maskLayer.setVisible(this.maskVisible);
    this.message(`Collision mask ${this.maskVisible?'on':'off'}`);
  }

  currentTransition(){
    const x=this.player.x;
    const y=this.player.y+(this.player.footOffsetY||0);
    return (this.transitionsData?.transitions || []).find(t=>pointInRect(t.trigger,x,y));
  }

  interact(){
    const t=this.currentTransition();
    if(t)this.handleTransition(t);
    else this.message('No route trigger here.');
  }

  handleTransition(t){
    if(this.time.now<this.transitionCooldownUntil)return;
    const target=targetOf(t);

    if(t.disabled || !PAGES[target]){
      this.message(t.message || `${target} is not built yet.`);
      this.transitionCooldownUntil=this.time.now+700;
      return;
    }

    const spawnObj=t.spawnOnTarget || {};
    const spawnId=spawnObj.spawnId || t.targetSpawn || 'default_start';
    const explicitSpawn=(typeof spawnObj.x==='number' && typeof spawnObj.y==='number') ? spawnObj : null;

    this.cameras.main.fadeOut(180,0,0,0);
    this.time.delayedCall(190,()=>{
      this.loadPage(target, spawnId, explicitSpawn);
      this.cameras.main.fadeIn(220,0,0,0);
    });
  }

  update(time,delta){
    if(!this.player || !this.maskCtx)return;

    let vx=0,vy=0;
    if(this.cursors.left.isDown || this.keys.A.isDown)vx--;
    if(this.cursors.right.isDown || this.keys.D.isDown)vx++;
    if(this.cursors.up.isDown || this.keys.W.isDown)vy--;
    if(this.cursors.down.isDown || this.keys.S.isDown)vy++;

    vx+=this.touch.x;
    vy+=this.touch.y;

    const len=Math.hypot(vx,vy);
    if(len>1){vx/=len;vy/=len;}

    const step=this.speed*delta/1000;
    const nx=this.player.x+vx*step;
    const ny=this.player.y+vy*step;
    const foot=this.player.footOffsetY || 0;

    if(this.isWalkable(nx,this.player.y+foot))this.player.x=Phaser.Math.Clamp(nx,0,this.mapW);
    if(this.isWalkable(this.player.x,ny+foot))this.player.y=Phaser.Math.Clamp(ny,0,this.mapH);

    this.player.setDepth(this.player.y+1000);

    const t=this.currentTransition();
    if(t){
      this.prompt.setText(`${t.disabled?'Blocked route':'Route'}: ${t.label || targetOf(t)}${t.disabled?' — not built yet':''}`);
      if(!t.disabled && this.time.now>this.transitionCooldownUntil)this.handleTransition(t);
    } else {
      this.prompt.setText('');
    }
  }
}

new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: 960,
  height: 540,
  backgroundColor: '#000',
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  physics: { default: 'arcade', arcade: { gravity: {y:0}, debug:false } },
  scene: [TitleScene, MapScene]
});
