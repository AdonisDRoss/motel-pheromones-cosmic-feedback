
const CHUNK_W = 1536, CHUNK_H = 1152, WORLD_COLS = 5, WORLD_ROWS = 5;
const WORLD_W = CHUNK_W * WORLD_COLS, WORLD_H = CHUNK_H * WORLD_ROWS;
const CELLS = [
  ['A3','Dryline Outer Route',0,2], ['A4','Badlands Cut',0,3], ['A5','Badlands Drain Route',0,4],
  ['B3','Dryline Outer Road',1,2], ['B4','Black Road Cut',1,3], ['B5','Black Road Drains',1,4],
  ['C1','Civic Admin Core',2,0], ['C2','Civic Admin Street',2,1], ['C3','Main Civic Gate',2,2], ['C4','Transit Vendor Square',2,3], ['C5','Transit Drain Market',2,4],
  ['D1','Admin Rooftop Service',3,0], ['D2','Varric Service Alley',3,1], ['D3','Red Concord Checkpoint',3,2], ['D4','Vendor Backroute / Checkpoint Backlot',3,3], ['D5','Pressure Service Route',3,4],
  ['E1','Surveillance Roofs',4,0], ['E2','Debt Corridor',4,1], ['E3','Red Route Control',4,2], ['E4','Logistics Route',4,3], ['E5','Custody Convoy Yard',4,4]
].map(([id,title,col,row]) => ({ id,title,col,row }));
const CELL_BY_GRID = {};
for (const c of CELLS) CELL_BY_GRID[`${c.col},${c.row}`] = c;

const START_X = 2 * CHUNK_W + CHUNK_W / 2;
const START_Y = 2 * CHUNK_H + CHUNK_H / 2;

const VJOY = { active:false, pointerId:null, dx:0, dy:0 };

const DONNY_CANDIDATES = [
  'assets/sprites/player/donny/donny_idle.png',
  'assets/sprites/player/donny/donny_walk.png',
  'assets/sprites/player/donny/donny-master.png',
  'assets/sprites/player/donny/movement/donny_idle.png',
  'assets/sprites/player/donny/movement/donny_walk.png',
  'assets/sprites/player/donny/combat/movement/donny_idle.png',
  'assets/sprites/player/donny/combat/movement/donny_walk.png',
  'assets/sprites/donny/donny_idle.png',
  'assets/sprites/donny/donny_walk.png',
  'assets/player/donny/donny_idle.png',
  'assets/player/donny/donny_walk.png'
];

const VAN_SHEET = 'assets/vehicles/donny_astro_van/donny_astro_van_4frame_sheet_512x256.png';

function probeImage(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ ok:true, url, width:img.naturalWidth, height:img.naturalHeight });
    img.onerror = () => resolve({ ok:false, url });
    img.src = url + '?v=124';
  });
}

async function findDonnySprite() {
  for (const url of DONNY_CANDIDATES) {
    const result = await probeImage(url);
    if (result.ok) return result;
  }
  return null;
}

class BootScene extends Phaser.Scene {
  constructor() { super('BootScene'); }
  create() { this.scene.start('GlasswellCityTestScene', window.__DONNY_INFO__ || null); }
}

class GlasswellCityTestScene extends Phaser.Scene {
  constructor() {
    super('GlasswellCityTestScene');
    this.maskContexts = {};
    this.maskOverlays = [];
    this.labels = [];
    this.showMask = false;
    this.showLabels = true;
    this.inVan = false;
    this.pos = { x: START_X, y: START_Y };
    this.vanPos = { x: START_X + 130, y: START_Y + 80 };
    this.donnyInfo = null;
    this.facingAngle = 0;
  }

  init(data) {
    this.donnyInfo = data || null;
  }

  preload() {
    for (const c of CELLS) {
      const lower = c.id.toLowerCase();
      this.load.image(`base_${c.id}`, `assets/maps/dust9/glasswell/${lower}/layers/GLASSWELL_${c.id}_base.png`);
      this.load.image(`fg_${c.id}`, `assets/maps/dust9/glasswell/${lower}/layers/GLASSWELL_${c.id}_foreground_overlay.png`);
      this.load.image(`mask_${c.id}`, `assets/maps/dust9/glasswell/${lower}/masks/GLASSWELL_${c.id}_collision_mask.png`);
    }
    if (this.donnyInfo?.url) this.load.image('donnySource', this.donnyInfo.url + '?v=124');
    this.load.spritesheet('astroVan', VAN_SHEET, { frameWidth:128, frameHeight:256 });
  }

  create() {
    this.cameras.main.setBounds(0, 0, WORLD_W, WORLD_H);
    this.add.rectangle(WORLD_W/2, WORLD_H/2, WORLD_W, WORLD_H, 0x050607).setDepth(-10);

    for (const c of CELLS) {
      const x = c.col * CHUNK_W, y = c.row * CHUNK_H;
      this.add.image(x, y, `base_${c.id}`).setOrigin(0).setDepth(0);
      const maskOverlay = this.add.image(x, y, `mask_${c.id}`).setOrigin(0).setAlpha(0.28).setTint(0x00ff66).setDepth(85).setVisible(false);
      this.maskOverlays.push(maskOverlay);
      const label = this.add.text(x+18, y+18, `${c.id} — ${c.title}`, {
        fontFamily:'monospace', fontSize:'30px', color:'#f1efe4',
        backgroundColor:'rgba(0,0,0,.55)', padding:{x:8,y:5}
      }).setDepth(120);
      this.labels.push(label);
    }

    this.van = this.add.sprite(this.vanPos.x, this.vanPos.y, 'astroVan', 0).setDepth(55).setOrigin(0.5, 0.62);
    this.van.setScale(0.48);
    this.vanShadow = this.add.ellipse(this.vanPos.x, this.vanPos.y + 42, 70, 24, 0x000000, 0.35).setDepth(54);

    this.player = this.add.container(this.pos.x, this.pos.y).setDepth(60);
    this.buildDonnySprite();

    for (const c of CELLS) {
      this.add.image(c.col*CHUNK_W, c.row*CHUNK_H, `fg_${c.id}`).setOrigin(0).setDepth(100);
    }

    this.createMaskCanvases();

    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys({
      W:Phaser.Input.Keyboard.KeyCodes.W, A:Phaser.Input.Keyboard.KeyCodes.A, S:Phaser.Input.Keyboard.KeyCodes.S, D:Phaser.Input.Keyboard.KeyCodes.D,
      E:Phaser.Input.Keyboard.KeyCodes.E, M:Phaser.Input.Keyboard.KeyCodes.M, L:Phaser.Input.Keyboard.KeyCodes.L, R:Phaser.Input.Keyboard.KeyCodes.R,
      SHIFT:Phaser.Input.Keyboard.KeyCodes.SHIFT
    });

    this.hud = this.add.text(12,12,'',{
      fontFamily:'monospace', fontSize:'16px', color:'#fff', backgroundColor:'rgba(0,0,0,.55)', padding:{x:8,y:6}
    }).setScrollFactor(0).setDepth(200);

    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    this.cameras.main.setZoom(0.45);

    this.input.on('wheel', (_pointer,_objects,_dx,dy) => {
      this.cameras.main.setZoom(Phaser.Math.Clamp(this.cameras.main.zoom + (dy > 0 ? -0.05 : 0.05), 0.25, 1.1));
    });

    setupTouchControls(this);
  }

  buildDonnySprite() {
    if (this.textures.exists('donnySource')) {
      const src = this.textures.get('donnySource').getSourceImage();
      let key = 'donnySource';
      if (src.height > 0 && src.width > src.height * 1.5) {
        const frameSize = src.height;
        const canvasTex = this.textures.createCanvas('donnyCropped', frameSize, frameSize);
        canvasTex.getContext().drawImage(src, 0, 0, frameSize, frameSize, 0, 0, frameSize, frameSize);
        canvasTex.refresh();
        key = 'donnyCropped';
      } else if (src.width > 0 && src.height > src.width * 1.6) {
        const frameSize = src.width;
        const canvasTex = this.textures.createCanvas('donnyCropped', frameSize, frameSize);
        canvasTex.getContext().drawImage(src, 0, 0, frameSize, frameSize, 0, 0, frameSize, frameSize);
        canvasTex.refresh();
        key = 'donnyCropped';
      }
      this.donnySprite = this.add.image(0, -8, key).setOrigin(0.5, 1);
      const targetHeight = 46;
      this.donnySprite.setScale(targetHeight / this.donnySprite.displayHeight);
      this.shadow = this.add.ellipse(0, 6, 18, 8, 0x000000, 0.35);
      this.player.add([this.shadow, this.donnySprite]);
    } else {
      this.shadow = this.add.ellipse(0, 6, 18, 8, 0x000000, 0.35);
      this.warning = this.add.text(0, -10, 'DONNY\\nSPRITE\\nMISSING', {
        fontFamily:'monospace', fontSize:'12px', color:'#ff6b6b', align:'center',
        backgroundColor:'rgba(0,0,0,.65)', padding:{x:4,y:2}
      }).setOrigin(0.5, 1);
      this.player.add([this.shadow, this.warning]);
    }
  }

  createMaskCanvases() {
    for (const c of CELLS) {
      const image = this.textures.get(`mask_${c.id}`).getSourceImage();
      const canvas = document.createElement('canvas');
      canvas.width = CHUNK_W; canvas.height = CHUNK_H;
      const ctx = canvas.getContext('2d', { willReadFrequently:true });
      ctx.drawImage(image, 0, 0, CHUNK_W, CHUNK_H);
      this.maskContexts[c.id] = ctx;
    }
  }

  currentCellAt(x,y) {
    if (x < 0 || y < 0 || x >= WORLD_W || y >= WORLD_H) return null;
    return CELL_BY_GRID[`${Math.floor(x/CHUNK_W)},${Math.floor(y/CHUNK_H)}`] || null;
  }

  isWhiteAt(x,y) {
    const c = this.currentCellAt(x,y);
    if (!c) return false;
    const lx = Math.floor(x - c.col*CHUNK_W), ly = Math.floor(y - c.row*CHUNK_H);
    if (lx < 0 || ly < 0 || lx >= CHUNK_W || ly >= CHUNK_H) return false;
    const data = this.maskContexts[c.id].getImageData(lx, ly, 1, 1).data;
    return data[0] > 145;
  }

  canStandAt(x,y) {
    const r = this.inVan ? 34 : 12;
    const yFoot = y + (this.inVan ? 22 : 10);
    const points = [[x,yFoot],[x-r,yFoot],[x+r,yFoot],[x,yFoot-r],[x,yFoot+r],[x-r*.7,yFoot-r*.7],[x+r*.7,yFoot-r*.7],[x-r*.7,yFoot+r*.7],[x+r*.7,yFoot+r*.7]];
    return points.every(([px,py]) => this.isWhiteAt(px,py));
  }

  moveWithCollision(dx,dy) {
    const nx = this.pos.x + dx, ny = this.pos.y + dy;
    if (this.canStandAt(nx, this.pos.y)) this.pos.x = nx;
    if (this.canStandAt(this.pos.x, ny)) this.pos.y = ny;

    if (this.inVan) {
      this.vanPos.x = this.pos.x;
      this.vanPos.y = this.pos.y;
      this.van.setPosition(this.vanPos.x, this.vanPos.y);
      this.vanShadow.setPosition(this.vanPos.x, this.vanPos.y + 42);
      this.player.setPosition(this.vanPos.x, this.vanPos.y);
    } else {
      this.player.setPosition(this.pos.x, this.pos.y);
    }
  }

  toggleEnterExitVan() {
    const dist = Phaser.Math.Distance.Between(this.pos.x, this.pos.y, this.vanPos.x, this.vanPos.y);
    if (!this.inVan) {
      if (dist <= 110) {
        this.inVan = true;
        this.pos.x = this.vanPos.x;
        this.pos.y = this.vanPos.y;
        this.player.setVisible(false);
        this.cameras.main.startFollow(this.van, true, 0.12, 0.12);
      }
    } else {
      const exitX = this.vanPos.x + 72;
      const exitY = this.vanPos.y + 10;
      if (this.canStandAt(exitX, exitY)) {
        this.inVan = false;
        this.pos.x = exitX;
        this.pos.y = exitY;
        this.player.setPosition(this.pos.x, this.pos.y).setVisible(true);
        this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
      }
    }
  }

  update(_time, deltaMs) {
    if (Phaser.Input.Keyboard.JustDown(this.keys.E)) this.toggleEnterExitVan();
    if (Phaser.Input.Keyboard.JustDown(this.keys.M)) this.toggleMasks();
    if (Phaser.Input.Keyboard.JustDown(this.keys.L)) this.toggleLabels();
    if (Phaser.Input.Keyboard.JustDown(this.keys.R)) this.resetPlayer();

    let dx = 0, dy = 0;
    if (this.keys.A.isDown || this.cursors.left.isDown) dx -= 1;
    if (this.keys.D.isDown || this.cursors.right.isDown) dx += 1;
    if (this.keys.W.isDown || this.cursors.up.isDown) dy -= 1;
    if (this.keys.S.isDown || this.cursors.down.isDown) dy += 1;
    dx += VJOY.dx; dy += VJOY.dy;

    const len = Math.hypot(dx, dy);
    if (len > 0.01) {
      dx /= len; dy /= len;
      this.facingAngle = Math.atan2(dy, dx) + Math.PI / 2;
      const speed = (this.inVan ? 330 : 210) * (this.keys.SHIFT.isDown ? 1.55 : 1);
      this.moveWithCollision(dx * speed * deltaMs/1000, dy * speed * deltaMs/1000);

      if (this.inVan) {
        this.van.rotation = this.facingAngle;
        this.vanShadow.rotation = this.facingAngle;
      } else {
        if (this.donnySprite) this.donnySprite.setFlipX(dx < -0.05);
      }
    }

    const currentX = this.inVan ? this.vanPos.x : this.pos.x;
    const currentY = this.inVan ? this.vanPos.y : this.pos.y;
    const c = this.currentCellAt(currentX, currentY);
    const dist = Math.round(Phaser.Math.Distance.Between(this.pos.x, this.pos.y, this.vanPos.x, this.vanPos.y));
    this.hud.setText([
      `Glasswell City Runtime Test v124`,
      `Mode: ${this.inVan ? 'Driving Astro Van' : 'Donny on foot'}`,
      `Cell: ${c ? c.id + ' — ' + c.title : 'blocked/outside grid'}`,
      `E: ${this.inVan ? 'exit van' : (dist <= 110 ? 'enter van' : 'walk near van to enter')}  Distance: ${dist}`,
      `Donny asset: ${this.donnyInfo?.url || 'not found in common paths'}`
    ]);
  }

  toggleMasks() { this.showMask = !this.showMask; this.maskOverlays.forEach(o => o.setVisible(this.showMask)); }
  toggleLabels() { this.showLabels = !this.showLabels; this.labels.forEach(l => l.setVisible(this.showLabels)); }
  resetPlayer() {
    this.inVan = false;
    this.pos.x = START_X; this.pos.y = START_Y;
    this.vanPos.x = START_X + 130; this.vanPos.y = START_Y + 80;
    this.player.setPosition(this.pos.x, this.pos.y).setVisible(true);
    this.van.setPosition(this.vanPos.x, this.vanPos.y).setRotation(0);
    this.vanShadow.setPosition(this.vanPos.x, this.vanPos.y + 42).setRotation(0);
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
  }
}

function setupTouchControls(scene) {
  const zone = document.getElementById('stickZone'), knob = document.getElementById('stickKnob');
  function center(){ const r = zone.getBoundingClientRect(); return {x:r.left+r.width/2,y:r.top+r.height/2,radius:r.width/2}; }
  function setKnob(clientX, clientY){
    const c = center(), rawX = clientX-c.x, rawY = clientY-c.y, dist = Math.hypot(rawX,rawY), max = c.radius-29;
    const clamped = Math.min(dist,max), nx = dist>0 ? rawX/dist : 0, ny = dist>0 ? rawY/dist : 0;
    knob.style.left = `${46 + nx*clamped}px`; knob.style.top = `${46 + ny*clamped}px`;
    VJOY.dx = (nx*clamped)/max; VJOY.dy = (ny*clamped)/max;
  }
  function reset(){ knob.style.left='46px'; knob.style.top='46px'; VJOY.active=false; VJOY.pointerId=null; VJOY.dx=0; VJOY.dy=0; }
  zone.addEventListener('pointerdown', e => { VJOY.active=true; VJOY.pointerId=e.pointerId; zone.setPointerCapture(e.pointerId); setKnob(e.clientX,e.clientY); });
  zone.addEventListener('pointermove', e => { if(VJOY.active && e.pointerId===VJOY.pointerId) setKnob(e.clientX,e.clientY); });
  zone.addEventListener('pointerup', reset); zone.addEventListener('pointercancel', reset);
  const bind = (id, fn) => document.getElementById(id).addEventListener('pointerdown', e => { e.preventDefault(); fn(); });
  bind('btnE', () => scene.toggleEnterExitVan()); bind('btnM', () => scene.toggleMasks()); bind('btnL', () => scene.toggleLabels()); bind('btnR', () => scene.resetPlayer());
}

(async function boot() {
  window.__DONNY_INFO__ = await findDonnySprite();
  new Phaser.Game({
    type: Phaser.AUTO, parent:'game-wrap', width:960, height:540, backgroundColor:'#050607',
    scale:{ mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    render:{ pixelArt:false, antialias:true, roundPixels:false },
    physics:{ default:'arcade', arcade:{ debug:false } },
    scene:[BootScene, GlasswellCityTestScene]
  });
})();
