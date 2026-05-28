const VERSION = "001";

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
  sideLeft:  "assets/maps/dust9/glasswell/c3/interactive/GLASSWELL_C3_gate_side_left.png",
  sideRight: "assets/maps/dust9/glasswell/c3/interactive/GLASSWELL_C3_gate_side_right.png",
};

const PROP_PATHS = {
  c4Vendor: "assets/maps/dust9/glasswell/c4/props/GLASSWELL_C4_vendor_canopy_cluster_04.png",
};

const VAN_PATHS = [
  "assets/vehicles/donny_astro_van/donny_astro_van_4frame_sheet_512x256.png",
  "assets/sprites/vehicles/astro_van/astro_van_v1_sheet.png",
  "assets/sprites/vehicles/astro_van/astro_van.png",
];

function v(path){ return `${path}${path.includes("?") ? "&" : "?"}v=${VERSION}`; }

const VJOY = { x:0, y:0 };
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
    this.load.image("c3_gate_side_left", v(C3_GATE_PATHS.sideLeft));
    this.load.image("c3_gate_side_right", v(C3_GATE_PATHS.sideRight));
    this.load.image("c4_vendor_cluster_04", v(PROP_PATHS.c4Vendor));

    VAN_PATHS.forEach((path, i) => this.load.image(`van_${i}`, v(path)));

    this.load.on("loaderror", file => {
      LOAD_ERRORS.push(file?.src || file?.key || "unknown missing file");
    });
  }

  create(){
    this.scene.start("DriveScene");
  }
}

class DriveScene extends Phaser.Scene {
  constructor(){
    super("DriveScene");
    this.chunkW = 1024;
    this.chunkH = 768;
    this.worldOffsetX = 0;
    this.worldOffsetY = 0;
    this.maskData = {};
    this.maskVisible = false;
    this.labelsVisible = true;
    this.gateOpen = true;
  }

  create(){
    this.keys = this.input.keyboard.addKeys({
      W:"W", A:"A", S:"S", D:"D",
      UP:"UP", DOWN:"DOWN", LEFT:"LEFT", RIGHT:"RIGHT",
      SHIFT:"SHIFT", SPACE:"SPACE", G:"G", M:"M", L:"L", R:"R"
    });

    this.pickChunkSize();
    this.computeWorldOffset();
    this.createWorld();
    this.createProps();
    this.createVan();
    this.createHud();
    this.createMaskReaders();
    this.bindTouch();

    this.cameras.main.startFollow(this.van, true, 0.12, 0.12);
    this.cameras.main.setZoom(0.72);

    if(LOAD_ERRORS.length){
      showError(
        "Some files are missing. First missing file:\\n" +
        LOAD_ERRORS[0] +
        "\\n\\nThe test still runs with any files that loaded."
      );
    }
  }

  pickChunkSize(){
    const tex = this.textures.exists("base_C3") ? this.textures.get("base_C3").getSourceImage() : null;
    if(tex && tex.width && tex.height){
      this.chunkW = tex.width;
      this.chunkH = tex.height;
    }
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
    this.physics.world.setBounds(0, 0, maxX, maxY);
    this.cameras.main.setBounds(0, 0, maxX, maxY);

    this.add.rectangle(maxX/2, maxY/2, maxX, maxY, 0x050607).setDepth(-10);

    this.maskOverlays = [];
    this.labels = [];

    for(const c of CHUNKS){
      const p = this.chunkWorld(c);

      if(this.textures.exists(`base_${c.id}`)){
        this.add.image(p.x, p.y, `base_${c.id}`).setOrigin(0).setDisplaySize(this.chunkW, this.chunkH).setDepth(0);
      } else {
        this.add.rectangle(p.x, p.y, this.chunkW, this.chunkH, 0x330000).setOrigin(0).setDepth(0);
        this.add.text(p.x+25, p.y+30, `MISSING ${c.id} BASE`, {fontFamily:"monospace",fontSize:"28px",color:"#fff",backgroundColor:"rgba(120,0,0,.8)",padding:{x:8,y:5}}).setDepth(300);
      }

      if(this.textures.exists(`mask_${c.id}`)){
        const maskOverlay = this.add.image(p.x, p.y, `mask_${c.id}`)
          .setOrigin(0).setDisplaySize(this.chunkW, this.chunkH).setTint(0x00ff66).setAlpha(0.22).setDepth(80).setVisible(false);
        this.maskOverlays.push(maskOverlay);
      }

      const label = this.add.text(p.x + 12, p.y + 12, `${c.id} — ${c.title}`, {
        fontFamily:"monospace", fontSize:"24px", color:"#f4f4e6",
        backgroundColor:"rgba(0,0,0,.55)", padding:{x:7,y:4}
      }).setDepth(220);
      this.labels.push(label);
    }

    // Overlays always draw above van.
    for(const c of CHUNKS){
      const p = this.chunkWorld(c);
      if(this.textures.exists(`overlay_${c.id}`)){
        this.add.image(p.x, p.y, `overlay_${c.id}`).setOrigin(0).setDisplaySize(this.chunkW, this.chunkH).setDepth(120);
      }
    }
  }

  createProps(){
    const c4 = CHUNKS.find(c => c.id === "C4");
    const c4p = this.chunkWorld(c4);

    if(this.textures.exists("c4_vendor_cluster_04")){
      this.c4Vendor = this.add.image(c4p.x + this.chunkW * 0.50, c4p.y + this.chunkH * 0.50, "c4_vendor_cluster_04")
        .setOrigin(0.5)
        .setDepth(115)
        .setScale(0.42);
    }

    const c3 = CHUNKS.find(c => c.id === "C3");
    const p = this.chunkWorld(c3);

    // Gate placement is intentionally simple and tweakable.
    this.gates = [];
    const gateY = p.y + this.chunkH * 0.19;
    if(this.textures.exists("c3_gate_main_left")){
      this.gateMainLeft = this.add.image(p.x + this.chunkW * 0.455, gateY, "c3_gate_main_left").setOrigin(1, 0.5).setScale(0.30).setDepth(130);
      this.gates.push(this.gateMainLeft);
    }
    if(this.textures.exists("c3_gate_main_right")){
      this.gateMainRight = this.add.image(p.x + this.chunkW * 0.545, gateY, "c3_gate_main_right").setOrigin(0, 0.5).setScale(0.30).setDepth(130);
      this.gates.push(this.gateMainRight);
    }

    this.gateBlocker = this.add.rectangle(p.x + this.chunkW * 0.50, p.y + this.chunkH * 0.18, this.chunkW * 0.20, this.chunkH * 0.09, 0xff0000, 0)
      .setDepth(1);
    this.setGateOpen(true);
  }

  createVan(){
    const c3 = CHUNKS.find(c => c.id === "C3");
    const p = this.chunkWorld(c3);

    let vanKey = null;
    for(let i=0;i<VAN_PATHS.length;i++){
      if(this.textures.exists(`van_${i}`)){
        vanKey = `van_${i}`;
        break;
      }
    }

    this.van = this.add.container(p.x + this.chunkW * 0.50, p.y + this.chunkH * 0.62).setDepth(100);
    this.van.angle = 0;

    this.vanShadow = this.add.ellipse(0, 16, 72, 32, 0x000000, 0.35);
    this.van.add(this.vanShadow);

    if(vanKey){
      const img = this.add.image(0, 0, vanKey).setOrigin(0.5);
      const source = this.textures.get(vanKey).getSourceImage();
      const displayW = 74;
      img.setScale(displayW / source.width);
      this.vanBody = img;
      this.van.add(img);
    } else {
      this.vanBody = this.add.rectangle(0, 0, 78, 42, 0x423528, 1).setStrokeStyle(2, 0xff4aa0, 0.8);
      this.van.add(this.vanBody);
    }

    this.speed = 0;
    this.heading = -Math.PI / 2;
  }

  createMaskReaders(){
    for(const c of CHUNKS){
      if(!this.textures.exists(`mask_${c.id}`)) continue;
      const src = this.textures.get(`mask_${c.id}`).getSourceImage();
      const canvas = document.createElement("canvas");
      canvas.width = src.width;
      canvas.height = src.height;
      const ctx = canvas.getContext("2d", {willReadFrequently:true});
      ctx.drawImage(src, 0, 0);
      this.maskData[c.id] = {ctx, w:src.width, h:src.height};
    }
  }

  createHud(){
    this.hud = this.add.text(12, 12, "", {
      fontFamily:"monospace", fontSize:"14px", color:"#fff",
      backgroundColor:"rgba(0,0,0,.62)", padding:{x:8,y:6}
    }).setScrollFactor(0).setDepth(500);
  }

  chunkAt(x, y){
    for(const c of CHUNKS){
      const p = this.chunkWorld(c);
      if(x >= p.x && y >= p.y && x < p.x + this.chunkW && y < p.y + this.chunkH) return {c, p};
    }
    return null;
  }

  isWalkable(x, y){
    const hit = this.chunkAt(x, y);
    if(!hit) return false;

    // Closed C3 gate blocker.
    if(!this.gateOpen){
      const gb = this.gateBlocker.getBounds();
      if(gb.contains(x, y)) return false;
    }

    const md = this.maskData[hit.c.id];
    if(!md) return true;

    const lx = (x - hit.p.x) / this.chunkW * md.w;
    const ly = (y - hit.p.y) / this.chunkH * md.h;
    if(lx < 0 || ly < 0 || lx >= md.w || ly >= md.h) return false;

    const d = md.ctx.getImageData(Math.floor(lx), Math.floor(ly), 1, 1).data;
    return d[0] > 140;
  }

  canVanStand(x, y){
    const rX = 38, rY = 25;
    const pts = [
      [x,y], [x-rX,y], [x+rX,y], [x,y-rY], [x,y+rY],
      [x-rX*0.8,y-rY*0.8], [x+rX*0.8,y-rY*0.8],
      [x-rX*0.8,y+rY*0.8], [x+rX*0.8,y+rY*0.8]
    ];
    return pts.every(([px,py]) => this.isWalkable(px, py));
  }

  setGateOpen(open){
    this.gateOpen = open;
    if(this.gateMainLeft){
      this.tweens.add({ targets:this.gateMainLeft, x:this.gateMainLeft.x + (open ? -70 : 70), duration:260, ease:"Sine.easeOut" });
    }
    if(this.gateMainRight){
      this.tweens.add({ targets:this.gateMainRight, x:this.gateMainRight.x + (open ? 70 : -70), duration:260, ease:"Sine.easeOut" });
    }
    if(this.gateBlocker) this.gateBlocker.setVisible(!open);
  }

  toggleMasks(){
    this.maskVisible = !this.maskVisible;
    this.maskOverlays.forEach(m => m.setVisible(this.maskVisible));
  }

  toggleLabels(){
    this.labelsVisible = !this.labelsVisible;
    this.labels.forEach(l => l.setVisible(this.labelsVisible));
  }

  resetVan(){
    const c3 = CHUNKS.find(c => c.id === "C3");
    const p = this.chunkWorld(c3);
    this.van.setPosition(p.x + this.chunkW * 0.50, p.y + this.chunkH * 0.62);
    this.heading = -Math.PI / 2;
    this.speed = 0;
    this.van.rotation = this.heading + Math.PI / 2;
  }

  update(time, delta){
    if(Phaser.Input.Keyboard.JustDown(this.keys.G)) this.setGateOpen(!this.gateOpen);
    if(Phaser.Input.Keyboard.JustDown(this.keys.M)) this.toggleMasks();
    if(Phaser.Input.Keyboard.JustDown(this.keys.L)) this.toggleLabels();
    if(Phaser.Input.Keyboard.JustDown(this.keys.R)) this.resetVan();

    let steer = 0, throttle = 0;
    if(this.keys.LEFT.isDown || this.keys.A.isDown) steer -= 1;
    if(this.keys.RIGHT.isDown || this.keys.D.isDown) steer += 1;
    if(this.keys.UP.isDown || this.keys.W.isDown) throttle += 1;
    if(this.keys.DOWN.isDown || this.keys.S.isDown) throttle -= 0.8;

    steer += VJOY.x;
    throttle += -VJOY.y;

    const dt = delta / 1000;
    const maxSpeed = this.keys.SHIFT.isDown ? 360 : 250;
    const accel = 520;
    const friction = this.keys.SPACE.isDown ? 0.82 : 0.985;

    this.speed += throttle * accel * dt;
    this.speed *= friction;
    this.speed = Phaser.Math.Clamp(this.speed, -120, maxSpeed);

    if(Math.abs(this.speed) > 3){
      this.heading += steer * 2.15 * dt * Math.sign(this.speed);
    }

    const nx = this.van.x + Math.cos(this.heading) * this.speed * dt;
    const ny = this.van.y + Math.sin(this.heading) * this.speed * dt;

    if(this.canVanStand(nx, ny)){
      this.van.setPosition(nx, ny);
    } else {
      this.speed *= -0.25;
    }

    this.van.rotation = this.heading + Math.PI / 2;

    const hit = this.chunkAt(this.van.x, this.van.y);
    this.hud.setText([
      "Glasswell Four-Map Car Test",
      `Cell: ${hit ? hit.c.id + " — " + hit.c.title : "outside map"}`,
      `Gate: ${this.gateOpen ? "OPEN" : "CLOSED"}   G toggles`,
      `Speed: ${Math.round(this.speed)}`,
      "M masks · L labels · R reset"
    ]);
  }

  bindTouch(){
    const stick = document.getElementById("stick");
    const knob = document.getElementById("knob");
    let active = false, pid = null;

    const reset = () => {
      active = false; pid = null; VJOY.x = 0; VJOY.y = 0;
      knob.style.left = "43px"; knob.style.top = "43px";
    };

    const move = (clientX, clientY) => {
      const r = stick.getBoundingClientRect();
      const cx = r.left + r.width/2, cy = r.top + r.height/2;
      let dx = clientX - cx, dy = clientY - cy;
      const max = 48;
      const len = Math.hypot(dx, dy) || 1;
      if(len > max){ dx = dx/len*max; dy = dy/len*max; }
      VJOY.x = dx / max;
      VJOY.y = dy / max;
      knob.style.left = `${43 + dx}px`;
      knob.style.top = `${43 + dy}px`;
    };

    stick.addEventListener("pointerdown", e => { active = true; pid = e.pointerId; stick.setPointerCapture(pid); move(e.clientX, e.clientY); });
    stick.addEventListener("pointermove", e => { if(active && e.pointerId === pid) move(e.clientX, e.clientY); });
    stick.addEventListener("pointerup", reset);
    stick.addEventListener("pointercancel", reset);

    document.getElementById("btnG").addEventListener("pointerdown", e => { e.preventDefault(); this.setGateOpen(!this.gateOpen); });
    document.getElementById("btnM").addEventListener("pointerdown", e => { e.preventDefault(); this.toggleMasks(); });
    document.getElementById("btnL").addEventListener("pointerdown", e => { e.preventDefault(); this.toggleLabels(); });
    document.getElementById("btnR").addEventListener("pointerdown", e => { e.preventDefault(); this.resetVan(); });
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
  scene: [BootScene, DriveScene]
});
