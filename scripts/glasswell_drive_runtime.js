const VERSION = "012";

const CHUNKS = [
  { id:"C2", title:"Civic Admin Street",       gridX:0, gridY:-1 },
  { id:"C3", title:"Main Civic Gate",         gridX:0, gridY:0  },
  { id:"D3", title:"Red Concord Checkpoint",  gridX:1, gridY:0  },
  { id:"C4", title:"Transit Vendor Square",   gridX:0, gridY:1  },
];

const BASE_PATH = id => `assets/maps/dust9/glasswell/${id.toLowerCase()}/layers/GLASSWELL_${id}_base.png`;
const OVERLAY_PATH = id => `assets/maps/dust9/glasswell/${id.toLowerCase()}/layers/GLASSWELL_${id}_foreground_overlay.png`;
const MASK_PATH = id => `assets/maps/dust9/glasswell/${id.toLowerCase()}/masks/GLASSWELL_${id}_collision_mask.png`;

const C3_GATE_PATHS = {
  mainLeft:  "assets/maps/dust9/glasswell/c3/interactive/GLASSWELL_C3_gate_main_left.png",
  mainRight: "assets/maps/dust9/glasswell/c3/interactive/GLASSWELL_C3_gate_main_right.png",
};

const PROP_PATHS = {
  c4Vendor: "assets/maps/dust9/glasswell/c4/props/GLASSWELL_C4_vendor_canopy_cluster_04.png",
};

const VAN_PATH = "assets/vehicles/donny_astro_van/donny_astro_van_4frame_sheet_512x256.png";

const DONNY_PATHS = [
  "assets/sprites/player/donny/donny_idle.png",
  "assets/sprites/player/donny/donny_walk.png",
  "assets/sprites/player/donny/donny-master.png",
  "assets/sprites/player/donny/movement/donny_idle.png",
  "assets/sprites/player/donny/movement/donny_walk.png",
  "assets/sprites/player/donny/combat/movement/donny_idle.png",
  "assets/sprites/player/donny/combat/movement/donny_walk.png",
  "assets/sprites/donny/donny_idle.png",
  "assets/sprites/donny/donny_walk.png",
  "assets/player/donny/donny_idle.png",
  "assets/player/donny/donny_walk.png"
];

function v(path){ return `${path}${path.includes("?") ? "&" : "?"}v=${VERSION}`; }

const VJOY = { x:0, y:0 };
const TOUCH = { boost:false, brake:false };
const LOAD_ERRORS = [];

function showError(msg){
  const el = document.getElementById("error");
  if(!el) return;
  el.style.display = "block";
  el.textContent = msg;
}

class BootScene extends Phaser.Scene {
  constructor(){ super("BootScene"); }
  preload(){
    for(const c of CHUNKS){
      this.load.image(`base_${c.id}`, v(BASE_PATH(c.id)));
      this.load.image(`overlay_${c.id}`, v(OVERLAY_PATH(c.id)));
      this.load.image(`mask_${c.id}`, v(MASK_PATH(c.id)));
    }

    this.load.image("c3_gate_main_left", v(C3_GATE_PATHS.mainLeft));
    this.load.image("c3_gate_main_right", v(C3_GATE_PATHS.mainRight));
    this.load.image("c4_vendor_cluster_04", v(PROP_PATHS.c4Vendor));
    this.load.image("van_sheet_raw", v(VAN_PATH));

    // Use the real Donny 4-direction registry already in the repo.
    if(window.preloadDonnyAssets){
      window.preloadDonnyAssets(this, VERSION);
    } else {
      DONNY_PATHS.forEach((path, i) => this.load.image(`donny_candidate_${i}`, v(path)));
    }

    this.load.on("loaderror", file => {
      const src = String(file?.src || file?.key || "unknown missing file");
      if(src.includes("astro_van") || src.includes("donny_astro_van")) return;
      if(src.includes("donny") || src.includes("Donny")) return;
      LOAD_ERRORS.push(src);
    });
  }
  create(){ this.scene.start("DriveScene"); }
}

class DriveScene extends Phaser.Scene {
  constructor(){
    super("DriveScene");
    this.chunkW = 1024;
    this.chunkH = 768;
    this.worldOffsetX = 0;
    this.worldOffsetY = 0;
    this.maskVisible = false;
    this.maskData = {};
    this.gateOpen = true;
    this.inVan = true;

    // GTA-style car state.
    this.car = {
      vx:0, vy:0,
      heading:-Math.PI / 2,
      speed:0
    };
  }

  create(){
    this.keys = this.input.keyboard.addKeys({
      W:"W", A:"A", S:"S", D:"D",
      UP:"UP", DOWN:"DOWN", LEFT:"LEFT", RIGHT:"RIGHT",
      SHIFT:"SHIFT", SPACE:"SPACE", E:"E", Y:"Y", G:"G", R:"R", Q:"Q"
    });

    this.pickChunkSize();
    this.computeWorldOffset();
    this.createWorld();
    this.createProps();

    if(window.createDonnyAnimations){
      window.createDonnyAnimations(this);
    }

    this.createActors();
    this.createHud();
    this.createMaskReaders();
    this.bindTouch();

    this.cameras.main.startFollow(this.van, true, 0.15, 0.15);
    this.cameras.main.setZoom(1.18);

    if(LOAD_ERRORS.length){
      showError("Missing required map file:\n" + LOAD_ERRORS[0]);
    }
  }

  pickChunkSize(){
    const tex = this.textures.exists("base_C3") ? this.textures.get("base_C3").getSourceImage() : null;
    if(tex?.width && tex?.height){ this.chunkW = tex.width; this.chunkH = tex.height; }
  }

  computeWorldOffset(){
    const minX = Math.min(...CHUNKS.map(c => c.gridX));
    const minY = Math.min(...CHUNKS.map(c => c.gridY));
    this.worldOffsetX = -minX * this.chunkW + 120;
    this.worldOffsetY = -minY * this.chunkH + 120;
  }

  chunkWorld(c){
    return {
      x: this.worldOffsetX + c.gridX * this.chunkW,
      y: this.worldOffsetY + c.gridY * this.chunkH,
      w: this.chunkW,
      h: this.chunkH
    };
  }

  createWorld(){
    const maxX = this.worldOffsetX + (Math.max(...CHUNKS.map(c=>c.gridX)) + 1) * this.chunkW + 120;
    const maxY = this.worldOffsetY + (Math.max(...CHUNKS.map(c=>c.gridY)) + 1) * this.chunkH + 120;
    this.worldBounds = new Phaser.Geom.Rectangle(0, 0, maxX, maxY);
    this.cameras.main.setBounds(0, 0, maxX, maxY);
    this.add.rectangle(maxX/2, maxY/2, maxX, maxY, 0x050607).setDepth(-10);

    this.maskOverlays = [];
    for(const c of CHUNKS){
      const p = this.chunkWorld(c);
      if(this.textures.exists(`base_${c.id}`)){
        this.add.image(p.x, p.y, `base_${c.id}`).setOrigin(0).setDisplaySize(this.chunkW, this.chunkH).setDepth(0);
      } else {
        this.add.rectangle(p.x, p.y, this.chunkW, this.chunkH, 0x330000).setOrigin(0).setDepth(0);
      }

      if(this.textures.exists(`mask_${c.id}`)){
        const maskOverlay = this.add.image(p.x, p.y, `mask_${c.id}`)
          .setOrigin(0).setDisplaySize(this.chunkW, this.chunkH).setTint(0x00ff66).setAlpha(0.22).setDepth(80).setVisible(false);
        this.maskOverlays.push(maskOverlay);
      }
    }

    for(const c of CHUNKS){
      const p = this.chunkWorld(c);
      if(this.textures.exists(`overlay_${c.id}`)){
        this.add.image(p.x, p.y, `overlay_${c.id}`).setOrigin(0).setDisplaySize(this.chunkW, this.chunkH).setDepth(120);
      }
    }
  }

  makeSingleVanTexture(){
    if(!this.textures.exists("van_sheet_raw")) return null;
    const src = this.textures.get("van_sheet_raw").getSourceImage();
    if(!src?.width || !src?.height) return "van_sheet_raw";

    // Four vans happened because the whole horizontal sheet was displayed.
    // This crops ONE frame only.
    const frameW = src.width >= src.height * 1.4 ? Math.floor(src.width / 4) : src.width;
    const tex = this.textures.createCanvas("van_single", frameW, src.height);
    const ctx = tex.getContext();
    ctx.clearRect(0,0,frameW,src.height);
    ctx.drawImage(src, 0, 0, frameW, src.height, 0, 0, frameW, src.height);
    tex.refresh();
    return "van_single";
  }

  makeDonnyTexture(){
    if(this.textures.exists("donny_idle_4dir")){
      return "donny_idle_4dir";
    }

    for(let i=0;i<DONNY_PATHS.length;i++){
      const key = `donny_candidate_${i}`;
      if(!this.textures.exists(key)) continue;

      const src = this.textures.get(key).getSourceImage();
      if(!src?.width || !src?.height) return key;

      // If it looks like a strip/sheet, crop first frame for a normal standing Donny.
      if(src.width > src.height * 1.35){
        const frameW = Math.min(src.height, Math.floor(src.width / Math.max(2, Math.round(src.width / src.height))));
        const tex = this.textures.createCanvas("donny_single", frameW, src.height);
        const ctx = tex.getContext();
        ctx.clearRect(0,0,frameW,src.height);
        ctx.drawImage(src, 0, 0, frameW, src.height, 0, 0, frameW, src.height);
        tex.refresh();
        return "donny_single";
      }
      return key;
    }
    return null;
  }

  createActors(){
    const c3 = CHUNKS.find(c => c.id === "C3");
    const p = this.chunkWorld(c3);
    const startX = p.x + this.chunkW * 0.50;
    const startY = p.y + this.chunkH * 0.62;

    this.van = this.add.container(startX, startY).setDepth(100);
    this.vanShadow = this.add.ellipse(0, 13, 62, 26, 0x000000, 0.35);
    this.van.add(this.vanShadow);

    const vanKey = this.makeSingleVanTexture();
    if(vanKey){
      const img = this.add.image(0, 0, vanKey).setOrigin(0.5);
      const source = this.textures.get(vanKey).getSourceImage();
      img.setScale(74 / source.width);
      this.vanBody = img;
      this.van.add(img);
    } else {
      this.vanBody = this.add.rectangle(0, 0, 68, 36, 0x423528, 1).setStrokeStyle(3, 0xff4aa0, 0.9);
      this.van.add(this.vanBody);
    }

    this.player = this.add.container(startX + 68, startY + 6).setDepth(105).setVisible(false);
    this.player.add(this.add.ellipse(0, 12, 24, 10, 0x000000, 0.38));

    const donnyKey = this.makeDonnyTexture();
    if(donnyKey === "donny_idle_4dir"){
      const sprite = this.add.sprite(0, 0, "donny_idle_4dir", 0).setOrigin(0.5, 0.88);
      sprite.setScale(0.48);
      this.donnySprite = sprite;
      this.player.add(sprite);
      if(this.anims.exists("donny_idle_down")){
        sprite.play("donny_idle_down");
      }
    } else if(donnyKey){
      const sprite = this.add.image(0, 0, donnyKey).setOrigin(0.5, 0.88);
      const source = this.textures.get(donnyKey).getSourceImage();
      sprite.setScale(58 / source.height);
      this.donnySprite = sprite;
      this.player.add(sprite);
    } else {
      // Placeholder only if no Donny sprite path exists.
      this.player.add(this.add.rectangle(0, -8, 18, 34, 0x2c2c2c, 1).setStrokeStyle(2, 0xd8d0c0, 0.9));
      this.player.add(this.add.circle(0, -28, 8, 0x5b3927, 1).setStrokeStyle(1, 0xd8d0c0, 0.9));
    }

    this.car.heading = -Math.PI / 2;
    this.car.vx = 0;
    this.car.vy = 0;
    this.van.rotation = this.car.heading + Math.PI / 2;
  }

  createProps(){
    const c4 = CHUNKS.find(c => c.id === "C4");
    const c4p = this.chunkWorld(c4);
    if(this.textures.exists("c4_vendor_cluster_04")){
      this.add.image(c4p.x + this.chunkW * 0.50, c4p.y + this.chunkH * 0.50, "c4_vendor_cluster_04")
        .setOrigin(0.5).setDepth(115).setScale(0.42);
    }

    const c3 = CHUNKS.find(c => c.id === "C3");
    const p = this.chunkWorld(c3);
    const gateY = p.y + this.chunkH * 0.19;

    if(this.textures.exists("c3_gate_main_left")){
      this.gateMainLeftClosedX = p.x + this.chunkW * 0.455;
      this.gateMainLeft = this.add.image(this.gateMainLeftClosedX, gateY, "c3_gate_main_left")
        .setOrigin(1,0.5).setScale(0.30).setDepth(130);
    }
    if(this.textures.exists("c3_gate_main_right")){
      this.gateMainRightClosedX = p.x + this.chunkW * 0.545;
      this.gateMainRight = this.add.image(this.gateMainRightClosedX, gateY, "c3_gate_main_right")
        .setOrigin(0,0.5).setScale(0.30).setDepth(130);
    }
    this.gateBlockerRect = new Phaser.Geom.Rectangle(
      p.x + this.chunkW * 0.40,
      p.y + this.chunkH * 0.135,
      this.chunkW * 0.20,
      this.chunkH * 0.11
    );

    this.setGateOpen(true, true);
  }

  createHud(){
    this.hud = this.add.text(12, 12, "", {
      fontFamily:"monospace", fontSize:"13px", color:"#fff",
      backgroundColor:"rgba(0,0,0,.55)", padding:{x:7,y:5}
    }).setScrollFactor(0).setDepth(500);
  }

  createMaskReaders(){
    this.maskData = {};
    for(const c of CHUNKS){
      if(!this.textures.exists(`mask_${c.id}`)) continue;

      const src = this.textures.get(`mask_${c.id}`).getSourceImage();
      const canvas = document.createElement("canvas");
      canvas.width = src.width;
      canvas.height = src.height;

      const ctx = canvas.getContext("2d", { willReadFrequently:true });
      ctx.drawImage(src, 0, 0);

      this.maskData[c.id] = { ctx, w:src.width, h:src.height };
    }
  }

  isWalkable(x, y){
    const hit = this.chunkAt(x, y);
    if(!hit) return false;

    // Gate collision comes back when the gate is closed.
    if(!this.gateOpen && this.gateBlockerRect && this.gateBlockerRect.contains(x, y)){
      return false;
    }

    const md = this.maskData[hit.c.id];

    // If a mask failed to load, do not trap the player. Allow movement on that chunk.
    if(!md) return true;

    const lx = Math.floor((x - hit.p.x) / this.chunkW * md.w);
    const ly = Math.floor((y - hit.p.y) / this.chunkH * md.h);

    if(lx < 0 || ly < 0 || lx >= md.w || ly >= md.h) return false;

    const data = md.ctx.getImageData(lx, ly, 1, 1).data;
    return data[0] > 140; // white = walkable
  }

  canVanStand(x, y){
    // Multiple sample points stop the van from clipping through walls.
    const rX = 34;
    const rY = 22;
    const pts = [
      [x, y],
      [x-rX, y], [x+rX, y],
      [x, y-rY], [x, y+rY],
      [x-rX*0.75, y-rY*0.75], [x+rX*0.75, y-rY*0.75],
      [x-rX*0.75, y+rY*0.75], [x+rX*0.75, y+rY*0.75]
    ];
    return pts.every(([px, py]) => this.isWalkable(px, py));
  }

  canPlayerStand(x, y){
    const r = 13;
    const pts = [
      [x, y],
      [x-r, y], [x+r, y],
      [x, y-r], [x, y+r],
      [x-r*0.7, y-r*0.7], [x+r*0.7, y-r*0.7],
      [x-r*0.7, y+r*0.7], [x+r*0.7, y+r*0.7]
    ];
    return pts.every(([px, py]) => this.isWalkable(px, py));
  }

  setGateOpen(open, instant=false){
    this.gateOpen = open;
    const move = 70;
    if(this.gateMainLeft){
      const targetX = this.gateMainLeftClosedX + (open ? -move : 0);
      if(instant) this.gateMainLeft.x = targetX;
      else this.tweens.add({targets:this.gateMainLeft, x:targetX, duration:240, ease:"Sine.easeOut"});
    }
    if(this.gateMainRight){
      const targetX = this.gateMainRightClosedX + (open ? move : 0);
      if(instant) this.gateMainRight.x = targetX;
      else this.tweens.add({targets:this.gateMainRight, x:targetX, duration:240, ease:"Sine.easeOut"});
    }
  }

  toggleEnterExit(){
    if(this.inVan){
      this.inVan = false;
      this.player.setPosition(this.van.x + 70, this.van.y + 4).setVisible(true);
      this.cameras.main.startFollow(this.player, true, 0.15, 0.15);
      return;
    }

    const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.van.x, this.van.y);
    if(d < 135){
      this.inVan = true;
      this.player.setVisible(false);
      this.cameras.main.startFollow(this.van, true, 0.15, 0.15);
    }
  }

  reset(){
    const c3 = CHUNKS.find(c => c.id === "C3");
    const p = this.chunkWorld(c3);
    const x = p.x + this.chunkW * 0.50;
    const y = p.y + this.chunkH * 0.62;
    this.van.setPosition(x, y);
    this.player.setPosition(x + 70, y + 4);
    this.inVan = true;
    this.player.setVisible(false);
    this.car.heading = -Math.PI / 2;
    this.car.vx = 0;
    this.car.vy = 0;
    this.van.rotation = this.car.heading + Math.PI / 2;
    this.cameras.main.startFollow(this.van, true, 0.15, 0.15);
  }

  getInput(){
    let x = 0, y = 0;
    if(this.keys.LEFT.isDown || this.keys.A.isDown) x -= 1;
    if(this.keys.RIGHT.isDown || this.keys.D.isDown) x += 1;
    if(this.keys.UP.isDown || this.keys.W.isDown) y -= 1;
    if(this.keys.DOWN.isDown || this.keys.S.isDown) y += 1;

    x += VJOY.x;
    y += VJOY.y;

    x = Phaser.Math.Clamp(x, -1, 1);
    y = Phaser.Math.Clamp(y, -1, 1);
    return {x, y};
  }

  updateCar(dt){
    const input = this.getInput();
    const steer = input.x;
    const throttle = -input.y;

    const forward = { x: Math.cos(this.car.heading), y: Math.sin(this.car.heading) };
    const right = { x: -Math.sin(this.car.heading), y: Math.cos(this.car.heading) };

    let localForward = this.car.vx * forward.x + this.car.vy * forward.y;
    let localSide = this.car.vx * right.x + this.car.vy * right.y;

    const boosting = this.keys.SHIFT.isDown || TOUCH.boost;
    const braking = this.keys.SPACE.isDown || TOUCH.brake;

    const maxFwd = boosting ? 520 : 360;
    const maxRev = -180;

    if(throttle > 0.05){
      localForward += throttle * (boosting ? 760 : 560) * dt;
    } else if(throttle < -0.05){
      localForward += throttle * 410 * dt;
    }

    // B/Space behaves like brake first, then reverse if nearly stopped.
    if(braking){
      if(Math.abs(localForward) > 35){
        localForward *= Math.pow(0.84, dt * 60);
      } else {
        localForward -= 260 * dt;
      }
    }

    localForward = Phaser.Math.Clamp(localForward, maxRev, maxFwd);

    // GTA-like sliding: keep some drift, but kill sideways movement enough to steer.
    const sideGrip = boosting ? 0.91 : 0.82;
    localSide *= Math.pow(sideGrip, dt * 60);

    // Friction / rolling slowdown.
    const rolling = Math.abs(throttle) > 0.05 || braking;
    if(!rolling){
      localForward *= Math.pow(0.965, dt * 60);
    }

    const speedAbs = Math.abs(localForward);
    const steerPower = Phaser.Math.Clamp(speedAbs / 260, 0.18, 1.0);
    const reverseSign = localForward >= 0 ? 1 : -1;
    this.car.heading += steer * 2.65 * steerPower * reverseSign * dt;

    const f2 = { x: Math.cos(this.car.heading), y: Math.sin(this.car.heading) };
    const r2 = { x: -Math.sin(this.car.heading), y: Math.cos(this.car.heading) };

    this.car.vx = f2.x * localForward + r2.x * localSide;
    this.car.vy = f2.y * localForward + r2.y * localSide;

    const nx = Phaser.Math.Clamp(this.van.x + this.car.vx * dt, this.worldBounds.left + 80, this.worldBounds.right - 80);
    const ny = Phaser.Math.Clamp(this.van.y + this.car.vy * dt, this.worldBounds.top + 80, this.worldBounds.bottom - 80);

    if(this.canVanStand(nx, ny)){
      this.van.setPosition(nx, ny);
    } else if(this.canVanStand(nx, this.van.y)){
      this.van.x = nx;
      this.car.vy *= -0.18;
      this.car.vx *= 0.62;
    } else if(this.canVanStand(this.van.x, ny)){
      this.van.y = ny;
      this.car.vx *= -0.18;
      this.car.vy *= 0.62;
    } else {
      // Hit a wall/head-on. Bounce and kill speed.
      this.car.vx *= -0.28;
      this.car.vy *= -0.28;
    }

    this.van.rotation = this.car.heading + Math.PI / 2;
    this.car.speed = Math.hypot(this.car.vx, this.car.vy);
  }

  updateFoot(dt){
    const input = this.getInput();
    if(Math.abs(input.x) < 0.05 && Math.abs(input.y) < 0.05) {
      if(this.donnySprite && this.donnySprite.play && this.anims.exists("donny_idle_down")){
        this.donnySprite.play("donny_idle_down", true);
      }
      return;
    }

    if(this.donnySprite && this.donnySprite.play){
      const dir = Math.abs(input.x) > Math.abs(input.y)
        ? (input.x > 0 ? "right" : "left")
        : (input.y > 0 ? "down" : "up");
      const walkKey = `donny_walk_${dir}`;
      const idleKey = `donny_idle_${dir}`;
      if(this.anims.exists(walkKey)) this.donnySprite.play(walkKey, true);
      else if(this.anims.exists(idleKey)) this.donnySprite.play(idleKey, true);
    }

    const len = Math.hypot(input.x, input.y) || 1;
    const speed = 195;
    const nx = Phaser.Math.Clamp(this.player.x + (input.x / len) * speed * dt, this.worldBounds.left + 20, this.worldBounds.right - 20);
    const ny = Phaser.Math.Clamp(this.player.y + (input.y / len) * speed * dt, this.worldBounds.top + 20, this.worldBounds.bottom - 20);

    if(this.canPlayerStand(nx, ny)){
      this.player.setPosition(nx, ny);
    } else if(this.canPlayerStand(nx, this.player.y)){
      this.player.x = nx;
    } else if(this.canPlayerStand(this.player.x, ny)){
      this.player.y = ny;
    }
  }

  update(_time, delta){
    const dt = Math.min(delta / 1000, 0.05);

    if(Phaser.Input.Keyboard.JustDown(this.keys.E)) this.toggleEnterExit();
    if(Phaser.Input.Keyboard.JustDown(this.keys.Y) || Phaser.Input.Keyboard.JustDown(this.keys.G)) this.setGateOpen(!this.gateOpen);
    if(Phaser.Input.Keyboard.JustDown(this.keys.R)) this.reset();
    if(Phaser.Input.Keyboard.JustDown(this.keys.Q)) {
      this.maskVisible = !this.maskVisible;
      this.maskOverlays.forEach(m => m.setVisible(this.maskVisible));
    }

    if(this.inVan) this.updateCar(dt);
    else this.updateFoot(dt);

    const target = this.inVan ? this.van : this.player;
    const hit = this.chunkAt(target.x, target.y);
    this.hud.setText([
      "Glasswell Drive v012",
      `Mode: ${this.inVan ? "IN VAN" : "ON FOOT"}`,
      `Cell: ${hit ? hit.c.id + " — " + hit.c.title : "outside map"}`,
      `Speed: ${this.inVan ? Math.round(this.car.speed) : "walk"}`,
      `A/E enter-exit · collisions ON · X boost · B brake/reverse · Y gate ${this.gateOpen ? "OPEN" : "CLOSED"}`
    ]);
  }

  chunkAt(x, y){
    for(const c of CHUNKS){
      const p = this.chunkWorld(c);
      if(x >= p.x && y >= p.y && x < p.x + this.chunkW && y < p.y + this.chunkH) return {c,p};
    }
    return null;
  }

  bindTouch(){
    const stick = document.getElementById("stick");
    const knob = document.getElementById("knob");
    let active = false, pid = null;

    const resetStick = () => {
      active = false; pid = null; VJOY.x = 0; VJOY.y = 0;
      knob.style.left = "49px"; knob.style.top = "49px";
    };

    const move = (clientX, clientY) => {
      const r = stick.getBoundingClientRect();
      const cx = r.left + r.width/2, cy = r.top + r.height/2;
      let dx = clientX - cx, dy = clientY - cy;
      const max = 50;
      const len = Math.hypot(dx,dy) || 1;
      if(len > max){ dx = dx/len*max; dy = dy/len*max; }
      VJOY.x = dx / max;
      VJOY.y = dy / max;
      knob.style.left = `${49 + dx}px`;
      knob.style.top = `${49 + dy}px`;
    };

    stick.addEventListener("pointerdown", e => { active = true; pid = e.pointerId; stick.setPointerCapture(pid); move(e.clientX,e.clientY); });
    stick.addEventListener("pointermove", e => { if(active && e.pointerId === pid) move(e.clientX,e.clientY); });
    stick.addEventListener("pointerup", resetStick);
    stick.addEventListener("pointercancel", resetStick);

    const holdButton = (id, key) => {
      const el = document.getElementById(id);
      if(!el) return;
      el.addEventListener("pointerdown", e => { e.preventDefault(); TOUCH[key] = true; el.classList.add("pressed"); });
      el.addEventListener("pointerup", e => { e.preventDefault(); TOUCH[key] = false; el.classList.remove("pressed"); });
      el.addEventListener("pointercancel", e => { e.preventDefault(); TOUCH[key] = false; el.classList.remove("pressed"); });
      el.addEventListener("pointerleave", e => { TOUCH[key] = false; el.classList.remove("pressed"); });
    };

    holdButton("btnX", "boost");
    holdButton("btnB", "brake");

    document.getElementById("btnA").addEventListener("pointerdown", e => { e.preventDefault(); this.toggleEnterExit(); });
    document.getElementById("btnY").addEventListener("pointerdown", e => { e.preventDefault(); this.setGateOpen(!this.gateOpen); });
    document.getElementById("btnStart").addEventListener("pointerdown", e => { e.preventDefault(); this.reset(); });
  }
}

new Phaser.Game({
  type: Phaser.AUTO,
  parent: "game",
  width: 960,
  height: 540,
  backgroundColor: "#050607",
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  render: { pixelArt:false, antialias:true },
  physics: { default:"arcade", arcade:{ gravity:{ y:0 }, debug:false } },
  scene: [BootScene, DriveScene]
});
