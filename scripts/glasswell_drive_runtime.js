const VERSION = "008";

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

    this.load.on("loaderror", file => {
      const src = String(file?.src || file?.key || "unknown missing file");
      if(src.includes("astro_van") || src.includes("donny_astro_van")) return;
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
    this.labelsVisible = false;
    this.gateOpen = true;
    this.inVan = true;
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
    this.createActors();
    this.createHud();
    this.bindTouch();

    this.cameras.main.startFollow(this.followTarget(), true, 0.15, 0.15);
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

      const label = this.add.text(p.x+12, p.y+12, `${c.id} — ${c.title}`, {
        fontFamily:"monospace", fontSize:"20px", color:"#f4f4e6",
        backgroundColor:"rgba(0,0,0,.55)", padding:{x:7,y:4}
      }).setDepth(220).setVisible(false);
      this.labels.push(label);
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

    // If this is a 4-frame horizontal sheet, crop only frame 1 so only ONE van appears.
    const frameW = src.width >= src.height * 1.4 ? Math.floor(src.width / 4) : src.width;
    const tex = this.textures.createCanvas("van_single", frameW, src.height);
    const ctx = tex.getContext();
    ctx.clearRect(0,0,frameW,src.height);
    ctx.drawImage(src, 0, 0, frameW, src.height, 0, 0, frameW, src.height);
    tex.refresh();
    return "van_single";
  }

  createActors(){
    const c3 = CHUNKS.find(c => c.id === "C3");
    const p = this.chunkWorld(c3);

    const startX = p.x + this.chunkW * 0.50;
    const startY = p.y + this.chunkH * 0.62;

    this.van = this.add.container(startX, startY).setDepth(100);
    this.vanShadow = this.add.ellipse(0, 16, 78, 34, 0x000000, 0.35);
    this.van.add(this.vanShadow);

    const vanKey = this.makeSingleVanTexture();
    if(vanKey){
      const img = this.add.image(0, 0, vanKey).setOrigin(0.5);
      const source = this.textures.get(vanKey).getSourceImage();
      img.setScale(92 / source.width);
      this.vanBody = img;
      this.van.add(img);
    } else {
      this.vanBody = this.add.rectangle(0, 0, 86, 46, 0x423528, 1).setStrokeStyle(3, 0xff4aa0, 0.9);
      this.van.add(this.vanBody);
    }

    this.player = this.add.container(startX + 68, startY + 6).setDepth(105).setVisible(false);
    this.player.add(this.add.ellipse(0, 9, 22, 10, 0x000000, 0.38));
    this.player.add(this.add.rectangle(0, -4, 18, 34, 0x2c2c2c, 1).setStrokeStyle(2, 0xd8d0c0, 0.9));
    this.player.add(this.add.circle(0, -24, 8, 0x5b3927, 1).setStrokeStyle(1, 0xd8d0c0, 0.9));

    this.heading = -Math.PI / 2;
    this.van.rotation = this.heading + Math.PI / 2;
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
    this.setGateOpen(true, true);
  }

  createHud(){
    this.hud = this.add.text(12, 12, "", {
      fontFamily:"monospace", fontSize:"13px", color:"#fff",
      backgroundColor:"rgba(0,0,0,.55)", padding:{x:7,y:5}
    }).setScrollFactor(0).setDepth(500);
  }

  followTarget(){ return this.inVan ? this.van : this.player; }

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
    if(d < 130){
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
    this.heading = -Math.PI / 2;
    this.van.rotation = this.heading + Math.PI / 2;
    this.cameras.main.startFollow(this.van, true, 0.15, 0.15);
  }

  moveObject(obj, dx, dy, speed, dt){
    if(Math.abs(dx) < 0.05 && Math.abs(dy) < 0.05) return;
    const len = Math.hypot(dx, dy) || 1;
    dx /= len; dy /= len;
    obj.x += dx * speed * dt;
    obj.y += dy * speed * dt;
    if(obj === this.van){
      this.heading = Math.atan2(dy, dx);
      this.van.rotation = this.heading + Math.PI / 2;
    }
  }

  update(_time, delta){
    const dt = delta / 1000;

    if(Phaser.Input.Keyboard.JustDown(this.keys.E)) this.toggleEnterExit();
    if(Phaser.Input.Keyboard.JustDown(this.keys.Y) || Phaser.Input.Keyboard.JustDown(this.keys.G)) this.setGateOpen(!this.gateOpen);
    if(Phaser.Input.Keyboard.JustDown(this.keys.R)) this.reset();
    if(Phaser.Input.Keyboard.JustDown(this.keys.Q)) {
      this.maskVisible = !this.maskVisible;
      this.maskOverlays.forEach(m => m.setVisible(this.maskVisible));
    }

    let dx = 0, dy = 0;
    if(this.keys.LEFT.isDown || this.keys.A.isDown) dx -= 1;
    if(this.keys.RIGHT.isDown || this.keys.D.isDown) dx += 1;
    if(this.keys.UP.isDown || this.keys.W.isDown) dy -= 1;
    if(this.keys.DOWN.isDown || this.keys.S.isDown) dy += 1;
    dx += VJOY.x;
    dy += VJOY.y;

    const speed = this.inVan
      ? ((this.keys.SHIFT.isDown || TOUCH.boost) ? 430 : 275)
      : 190;

    // Brake slows van movement from touch/keyboard, but still allows movement.
    const finalSpeed = (this.inVan && (this.keys.SPACE.isDown || TOUCH.brake)) ? speed * 0.45 : speed;

    this.moveObject(this.followTarget(), dx, dy, finalSpeed, dt);

    const hit = this.chunkAt(this.followTarget().x, this.followTarget().y);
    this.hud.setText([
      "Glasswell Drive v008",
      `Mode: ${this.inVan ? "IN VAN" : "ON FOOT"}`,
      `Cell: ${hit ? hit.c.id + " — " + hit.c.title : "outside map"}`,
      `A/E: enter-exit  Y/G: gate ${this.gateOpen ? "OPEN" : "CLOSED"}  START/R: reset`
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
