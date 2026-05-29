
const GAME_W = 960;
const GAME_H = 540;

const START = { x: 720, y: 2048 };

const GATE_ZONES = [
  { id:"westgate_exit", name:"Westgate Night Market / Blacklight Kids", x:565, y:2048, radius:260, color:0xb45aff, status:"Wired: Westgate Offramp → Blacklight Kids Connector" },
  { id:"southgate_exit", name:"Southgate Main Entry / Drip Saints", x:2048, y:3550, radius:285, color:0xff8f7a, status:"Wired: Southgate → Checkpoint → Drip Saints Connector" },
  { id:"eastgate_exit", name:"Eastgate Industrial / Rust Jackals", x:3530, y:2048, radius:285, color:0xffaa4d, status:"Wired: Eastgate → Industrial Oversight → Rust Jackals Connector" },
  { id:"northgate_exit", name:"Northgate Closed / Black Road", x:2048, y:545, radius:260, color:0xd0d0d0, status:"Closed: future Black Road foot route" }
];

const FUEL_STATIONS = [
  { id:"fuel_poor_west_outer", name:"Muckrail Fuel & Salvage", tier:"poor", x:760, y:2860, radius:150, color:0xb46e37 },
  { id:"fuel_poor_north_outer", name:"Muckrail Fuel & Salvage", tier:"poor", x:2850, y:760, radius:150, color:0xb46e37 },
  { id:"fuel_mid_east_outer", name:"Dustline Waystop", tier:"middle", x:3380, y:2780, radius:165, color:0x69aaff },
  { id:"fuel_mid_west_outer", name:"Dustline Waystop", tier:"middle", x:780, y:1120, radius:165, color:0x69aaff },
  { id:"fuel_rich_city_close", name:"Nova Crown Fuel", tier:"rich", x:2510, y:1260, radius:180, color:0xf0d278 },
];

const DISTORTION = {
  id: "aurelix_distortion",
  brand: "Aurelix Motorworks",
  model: "Distortion",
  className: "Prototype sports car",
  condition: "Prototype",
  fuelMax: 180,
  fuel: 180,
  speed: 0,
  maxSpeed: 650,
  accel: 520,
  drag: 0.985,
  turnSpeed: 3.15,
  headlightsOn: true
};

// GTA rule: one top-down vehicle sprite is rotated in code. No directional vehicle sheet needed.
// Simple closed-loop freeway lanes around the master map.
const TRAFFIC_ROUTE_OUTER = [
  {x:720, y:720}, {x:2048, y:720}, {x:3376, y:720},
  {x:3376, y:2048}, {x:3376, y:3376},
  {x:2048, y:3376}, {x:720, y:3376},
  {x:720, y:2048}
];

const TRAFFIC_ROUTE_INNER = [
  {x:840, y:840}, {x:2048, y:840}, {x:3256, y:840},
  {x:3256, y:2048}, {x:3256, y:3256},
  {x:2048, y:3256}, {x:840, y:3256},
  {x:840, y:2048}
];

const PEDESTRIAN_WALK_NODES = [
  {x:585, y:1900}, {x:620, y:2200}, {x:780, y:2380}, // Westgate
  {x:1880, y:3500}, {x:2180, y:3500}, {x:2048, y:3260}, // Southgate
  {x:3480, y:1880}, {x:3480, y:2200}, {x:3260, y:2048}, // Eastgate
  {x:1880, y:620}, {x:2200, y:620}, {x:2048, y:840}, // Northgate
];

class GlasswellScene extends Phaser.Scene {
  constructor() { super("GlasswellScene"); }

  preload() {
    this.load.image("map", "assets/maps/dust9/glasswell/GLASSWELL_FREEWAY_RING_WIRED_TEST_MAP.png");
    this.load.image("distortion_topdown", "assets/vehicles/special/aurelix_distortion/distortion_topdown.png");

    this.load.audio("engine_idle", "assets/audio/vehicles/vehicle_engine_idle_loop.wav");
    this.load.audio("engine_drive", "assets/audio/vehicles/vehicle_engine_drive_loop.wav");
    this.load.audio("engine_boost", "assets/audio/vehicles/vehicle_engine_boost_loop.wav");
    this.load.audio("refuel_loop", "assets/audio/vehicles/fuel_pump_refuel_loop.wav");
    this.load.audio("police_siren", "assets/audio/vehicles/police_siren_loop.wav");
    this.load.audio("ambulance_siren", "assets/audio/vehicles/ambulance_siren_loop.wav");
  }

  create() {
    this.add.image(0, 0, "map").setOrigin(0, 0);
    this.physics.world.setBounds(0, 0, 4096, 4096);
    this.cameras.main.setBounds(0, 0, 4096, 4096);

    this.keys = this.input.keyboard.addKeys({
      up: "W,UP", down: "S,DOWN", left: "A,LEFT", right: "D,RIGHT",
      interact: "E", brake: "SPACE", boost: "SHIFT", headlights: "H",
      siren: "P"
    });

    this.createRuntimeTextures();
    this.createMobileControls();

    this.car = this.physics.add.sprite(START.x, START.y, "distortion_topdown");
    this.car.setDepth(50);
    this.car.setScale(0.45);
    this.car.rotation = -Math.PI / 2;
    this.car.setMaxVelocity(850);

    this.cameras.main.startFollow(this.car, true, 0.12, 0.12);
    this.cameras.main.setZoom(0.60);

    this.headlightLayer = this.add.graphics().setDepth(42);
    this.headlightLayer.setBlendMode(Phaser.BlendModes.ADD);
    this.trackLayer = this.add.graphics().setDepth(18);

    this.smoke = this.add.particles(0, 0, "fx_smoke_puff", {
      lifespan: { min: 350, max: 850 },
      speed: { min: 8, max: 34 },
      scale: { start: 0.14, end: 0.70 },
      alpha: { start: 0.26, end: 0 },
      quantity: 1,
      frequency: 55,
      tint: [0x777777, 0x9a9a9a, 0x5a5a5a],
      emitting: false
    }).setDepth(45);

    this.drawGateZones();
    this.drawFuelStations();
    this.createTraffic();
    this.createPedestrians();
    this.makeHud();
    this.makePrompt();
    this.setupAudio();

    this.wantedLevel = 0;
    this.debugSirenOn = false;
  }

  createRuntimeTextures() {
    const g = this.add.graphics();

    // smoke
    g.fillStyle(0xffffff, 1);
    g.fillCircle(16, 16, 14);
    g.generateTexture("fx_smoke_puff", 32, 32);
    g.clear();

    // Civilian car texture
    g.fillStyle(0x445d68, 1);
    g.fillRoundedRect(16, 5, 32, 74, 10);
    g.fillStyle(0xa9d7e8, 1);
    g.fillRoundedRect(21, 13, 22, 18, 5);
    g.fillStyle(0x202328, 1);
    g.fillRoundedRect(22, 47, 20, 19, 4);
    g.fillStyle(0xd9d29c, 1);
    g.fillRect(21, 5, 22, 3);
    g.generateTexture("traffic_civilian", 64, 84);
    g.clear();

    // Police / Civic Patrol
    g.fillStyle(0x111116, 1);
    g.fillRoundedRect(15, 4, 34, 78, 9);
    g.fillStyle(0x661e1e, 1);
    g.fillRect(18, 8, 28, 9);
    g.fillStyle(0xdddddd, 1);
    g.fillRect(24, 28, 16, 7);
    g.fillStyle(0xb01818, 1);
    g.fillCircle(24, 23, 4);
    g.fillStyle(0xffffff, 1);
    g.fillCircle(40, 23, 4);
    g.generateTexture("traffic_police", 64, 88);
    g.clear();

    // EMS
    g.fillStyle(0xe9e9e9, 1);
    g.fillRoundedRect(14, 3, 36, 82, 8);
    g.fillStyle(0x841c1c, 1);
    g.fillRect(17, 11, 30, 8);
    g.fillStyle(0x1f2f37, 1);
    g.fillRoundedRect(20, 45, 24, 22, 5);
    g.fillStyle(0xff2222, 1);
    g.fillCircle(24, 28, 4);
    g.fillStyle(0xffffff, 1);
    g.fillCircle(40, 28, 4);
    g.generateTexture("traffic_ems", 64, 90);
    g.clear();

    // Pedestrian
    g.fillStyle(0x222222, 1);
    g.fillCircle(16, 11, 7);
    g.fillStyle(0x2a76a8, 1);
    g.fillRoundedRect(9, 18, 14, 22, 5);
    g.fillStyle(0x1a1a1a, 1);
    g.fillRect(10, 38, 5, 14);
    g.fillRect(18, 38, 5, 14);
    g.generateTexture("pedestrian_a", 32, 56);
    g.clear();

    g.fillStyle(0x4d4035, 1);
    g.fillCircle(16, 10, 7);
    g.fillStyle(0x7c2c84, 1);
    g.fillRoundedRect(8, 17, 16, 24, 5);
    g.fillStyle(0x202020, 1);
    g.fillRect(10, 39, 5, 14);
    g.fillRect(18, 39, 5, 14);
    g.generateTexture("pedestrian_b", 32, 56);

    g.destroy();
  }

  setupAudio() {
    this.audioEnabled = false;
    this.audio = {};
    for (const [key, asset] of Object.entries({
      idle:"engine_idle", drive:"engine_drive", boost:"engine_boost", refuel:"refuel_loop",
      police:"police_siren", ambulance:"ambulance_siren"
    })) {
      if (this.cache.audio.exists(asset)) this.audio[key] = this.sound.add(asset, { loop:true, volume:0 });
    }
  }

  startAudioOnce() {
    if (this.audioEnabled) return;
    this.audioEnabled = true;
    Object.values(this.audio).forEach(s => { try { s.play(); } catch(e) {} });
  }

  drawGateZones() {
    const gfx = this.add.graphics().setDepth(20);
    for (const z of GATE_ZONES) {
      gfx.lineStyle(5, z.color, 0.40);
      gfx.strokeCircle(z.x, z.y, z.radius);
      gfx.fillStyle(z.color, 0.12);
      gfx.fillCircle(z.x, z.y, 44);
      this.add.text(z.x, z.y - z.radius - 22, z.name, {
        fontFamily:"monospace", fontSize:"17px", color:"#ffffff",
        backgroundColor:"rgba(0,0,0,0.6)", padding:{x:6,y:3}
      }).setOrigin(0.5).setDepth(40);
    }
  }

  drawFuelStations() {
    const gfx = this.add.graphics().setDepth(21);
    for (const s of FUEL_STATIONS) {
      gfx.lineStyle(4, s.color, 0.45);
      gfx.strokeCircle(s.x, s.y, s.radius);
      gfx.fillStyle(s.color, 0.18);
      gfx.fillCircle(s.x, s.y, 46);
      this.add.text(s.x, s.y + s.radius + 18, s.name, {
        fontFamily:"monospace", fontSize:"15px", color:"#fff4ce",
        backgroundColor:"rgba(0,0,0,0.55)", padding:{x:5,y:2}
      }).setOrigin(0.5).setDepth(40);
    }
  }

  createTraffic() {
    this.traffic = [];

    const configs = [
      { type:"civilian", texture:"traffic_civilian", route:TRAFFIC_ROUTE_OUTER, start:0, speed:125, color:0x69aaff },
      { type:"civilian", texture:"traffic_civilian", route:TRAFFIC_ROUTE_OUTER, start:2, speed:118, color:0x69aaff },
      { type:"civilian", texture:"traffic_civilian", route:TRAFFIC_ROUTE_INNER, start:4, speed:112, color:0x69aaff },
      { type:"civilian", texture:"traffic_civilian", route:TRAFFIC_ROUTE_INNER, start:6, speed:106, color:0x69aaff },
      { type:"police", texture:"traffic_police", route:TRAFFIC_ROUTE_OUTER, start:1, speed:145, color:0xff4444 },
      { type:"police", texture:"traffic_police", route:TRAFFIC_ROUTE_INNER, start:5, speed:140, color:0xff4444 },
      { type:"ems", texture:"traffic_ems", route:TRAFFIC_ROUTE_OUTER, start:3, speed:135, color:0xffffff },
      { type:"ems", texture:"traffic_ems", route:TRAFFIC_ROUTE_INNER, start:7, speed:130, color:0xffffff },
    ];

    for (const cfg of configs) {
      const p = cfg.route[cfg.start % cfg.route.length];
      const sprite = this.physics.add.sprite(p.x, p.y, cfg.texture);
      sprite.setDepth(cfg.type === "civilian" ? 35 : 38);
      sprite.setScale(cfg.type === "ems" ? 0.70 : 0.65);
      sprite.route = cfg.route;
      sprite.routeIndex = (cfg.start + 1) % cfg.route.length;
      sprite.aiSpeed = cfg.speed;
      sprite.vehicleType = cfg.type;
      sprite.sirenPhase = Math.random() * 100;
      this.traffic.push(sprite);
    }
  }

  createPedestrians() {
    this.pedestrians = [];
    for (let i = 0; i < 18; i++) {
      const node = PEDESTRIAN_WALK_NODES[i % PEDESTRIAN_WALK_NODES.length];
      const tex = i % 2 === 0 ? "pedestrian_a" : "pedestrian_b";
      const ped = this.physics.add.sprite(node.x + (Math.random()*90-45), node.y + (Math.random()*90-45), tex);
      ped.setDepth(44);
      ped.setScale(0.78);
      ped.homeX = ped.x;
      ped.homeY = ped.y;
      ped.walkAngle = Math.random() * Math.PI * 2;
      ped.walkRadius = 44 + Math.random() * 60;
      ped.walkSpeed = 0.35 + Math.random() * 0.35;
      ped.phase = Math.random() * Math.PI * 2;
      this.pedestrians.push(ped);
    }
  }

  updateTraffic(delta) {
    for (const car of this.traffic) {
      const target = car.route[car.routeIndex];
      const dist = Phaser.Math.Distance.Between(car.x, car.y, target.x, target.y);
      if (dist < 26) {
        car.routeIndex = (car.routeIndex + 1) % car.route.length;
        continue;
      }

      const angle = Phaser.Math.Angle.Between(car.x, car.y, target.x, target.y);
      car.rotation = angle + Math.PI / 2;
      car.setVelocity(Math.cos(angle) * car.aiSpeed, Math.sin(angle) * car.aiSpeed);

      // Siren flashing tint, visual only. Audio handled globally.
      if (car.vehicleType === "police" || car.vehicleType === "ems") {
        const flash = Math.sin((this.time.now + car.sirenPhase) * 0.018) > 0;
        car.setTint(flash ? (car.vehicleType === "police" ? 0xff5555 : 0xffffff) : 0xffffff);
      }

      const playerDist = Phaser.Math.Distance.Between(this.car.x, this.car.y, car.x, car.y);
      if (car.vehicleType === "police" && playerDist < 520 && DISTORTION.speed > 420) {
        this.wantedLevel = Math.max(this.wantedLevel, 1);
      }
    }
  }

  updatePedestrians(time) {
    for (const ped of this.pedestrians) {
      const t = time * 0.001 * ped.walkSpeed + ped.phase;
      ped.x = ped.homeX + Math.cos(t) * ped.walkRadius;
      ped.y = ped.homeY + Math.sin(t * 0.7) * ped.walkRadius * 0.55;
      ped.rotation = Math.sin(t) * 0.08;
    }
  }

  createMobileControls() {
    this.mobile = {
      joyX: 0, joyY: 0, activePointer: null,
      buttons: { accel:false, brake:false, interact:false, boost:false, headlights:false },
      buttonPress: { headlights:false }
    };

    const uiDepth = 500;
    const joyCX = 105;
    const joyCY = GAME_H - 105;
    const joyRadius = 70;
    const knobRadius = 26;

    this.add.circle(joyCX, joyCY, joyRadius, 0x111111, 0.30)
      .setScrollFactor(0).setDepth(uiDepth).setStrokeStyle(3, 0xffffff, 0.26);
    const knob = this.add.circle(joyCX, joyCY, knobRadius, 0xffffff, 0.20)
      .setScrollFactor(0).setDepth(uiDepth + 1).setStrokeStyle(2, 0xffffff, 0.35);

    const zone = this.add.zone(joyCX, joyCY, joyRadius * 2.3, joyRadius * 2.3)
      .setScrollFactor(0).setDepth(uiDepth + 2).setInteractive();

    const setJoy = (pointer) => {
      const dx = pointer.x - joyCX;
      const dy = pointer.y - joyCY;
      const dist = Math.sqrt(dx*dx + dy*dy);
      const max = joyRadius - knobRadius * 0.35;
      const clamped = Math.min(dist, max);
      const angle = Math.atan2(dy, dx);
      knob.setPosition(joyCX + Math.cos(angle)*clamped, joyCY + Math.sin(angle)*clamped);
      this.mobile.joyX = Phaser.Math.Clamp(dx / max, -1, 1);
      this.mobile.joyY = Phaser.Math.Clamp(dy / max, -1, 1);
    };

    const resetJoy = () => {
      this.mobile.joyX = 0;
      this.mobile.joyY = 0;
      this.mobile.activePointer = null;
      knob.setPosition(joyCX, joyCY);
    };

    zone.on("pointerdown", pointer => { this.mobile.activePointer = pointer.id; setJoy(pointer); });
    zone.on("pointermove", pointer => { if (this.mobile.activePointer === pointer.id) setJoy(pointer); });
    this.input.on("pointerup", pointer => { if (this.mobile.activePointer === pointer.id) resetJoy(); });
    this.input.on("pointerupoutside", pointer => { if (this.mobile.activePointer === pointer.id) resetJoy(); });

    const makeButton = (id, labelTop, labelBottom, x, y, color) => {
      const circle = this.add.circle(x, y, 38, color, 0.34)
        .setScrollFactor(0).setDepth(uiDepth).setStrokeStyle(3, 0xffffff, 0.30)
        .setInteractive({ useHandCursor: true });
      this.add.text(x, y - 10, labelTop + (labelBottom ? "\n" + labelBottom : ""), {
        fontFamily: "monospace", fontSize: labelBottom ? "12px" : "18px", color: "#ffffff", align: "center"
      }).setOrigin(0.5).setScrollFactor(0).setDepth(uiDepth + 1);

      circle.on("pointerdown", () => {
        this.mobile.buttons[id] = true;
        if (id === "headlights") this.mobile.buttonPress.headlights = true;
        circle.setAlpha(0.65);
      });
      const release = () => { this.mobile.buttons[id] = false; circle.setAlpha(1); };
      circle.on("pointerup", release);
      circle.on("pointerout", release);
      this.input.on("pointerup", release);
    };

    makeButton("accel", "A", "GAS", GAME_W - 82, GAME_H - 92, 0x2e7d32);
    makeButton("brake", "B", "BRK", GAME_W - 148, GAME_H - 54, 0x8a2020);
    makeButton("interact", "X", "USE", GAME_W - 148, GAME_H - 130, 0x245b9a);
    makeButton("headlights", "Y", "LTS", GAME_W - 214, GAME_H - 92, 0x8d7a21);
    makeButton("boost", "R", "BST", GAME_W - 82, GAME_H - 174, 0x7b36c7);
  }

  getMobileInput() {
    if (!this.mobile) return { joyX:0, joyY:0, accel:false, brake:false, interact:false, boost:false, headlightsPressed:false, any:false };
    const m = this.mobile;
    const out = {
      joyX: m.joyX || 0,
      joyY: m.joyY || 0,
      accel: !!m.buttons.accel,
      brake: !!m.buttons.brake,
      interact: !!m.buttons.interact,
      boost: !!m.buttons.boost,
      headlightsPressed: !!m.buttonPress.headlights,
      any: !!(m.buttons.accel || m.buttons.brake || m.buttons.interact || m.buttons.boost || m.buttons.headlights || Math.abs(m.joyX) > 0.05 || Math.abs(m.joyY) > 0.05)
    };
    m.buttonPress.headlights = false;
    return out;
  }

  makeHud() {
    this.hud = this.add.container(16, GAME_H - 130).setScrollFactor(0).setDepth(300);
    const bg = this.add.rectangle(0, 0, 390, 116, 0x000000, 0.68).setOrigin(0);
    bg.setStrokeStyle(2, 0xa66cff, 0.9);
    this.hudTitle = this.add.text(14, 10, DISTORTION.brand.toUpperCase(), {fontFamily:"monospace", fontSize:"16px", color:"#e5b8ff"});
    this.hudModel = this.add.text(14, 33, "Distortion", {fontFamily:"monospace", fontSize:"18px", color:"#ffffff"});
    this.hudClass = this.add.text(14, 57, "Prototype sports car", {fontFamily:"monospace", fontSize:"13px", color:"#9befff"});
    this.hudFuel = this.add.text(14, 82, "Fuel", {fontFamily:"monospace", fontSize:"13px", color:"#ffffff"});
    this.hudWanted = this.add.text(292, 10, "WANTED 0", {fontFamily:"monospace", fontSize:"13px", color:"#ff7777"});
    this.fuelBack = this.add.rectangle(78, 90, 210, 13, 0x303030, 1).setOrigin(0, 0.5);
    this.fuelBar = this.add.rectangle(78, 90, 210, 13, 0x9b6cff, 1).setOrigin(0, 0.5);
    this.hud.add([bg, this.hudTitle, this.hudModel, this.hudClass, this.hudFuel, this.hudWanted, this.fuelBack, this.fuelBar]);
  }

  makePrompt() {
    this.prompt = this.add.text(20, 82, "", {
      fontFamily:"monospace", fontSize:"18px", color:"#fff1b8",
      backgroundColor:"rgba(0,0,0,0.72)", padding:{x:8,y:5}
    }).setDepth(350).setScrollFactor(0).setVisible(false);
  }

  update(time, delta) {
    const dt = delta / 1000;
    const c = this.car;

    const mobile = this.getMobileInput();
    const up = this.keys.up.isDown || mobile.accel || mobile.joyY < -0.45;
    const down = this.keys.down.isDown || mobile.brake || mobile.joyY > 0.45;
    const left = this.keys.left.isDown || mobile.joyX < -0.35;
    const right = this.keys.right.isDown || mobile.joyX > 0.35;
    const braking = this.keys.brake.isDown || mobile.brake || down;
    const boosting = (this.keys.boost.isDown || mobile.boost) && DISTORTION.fuel > 0;
    this.mobileInteract = mobile.interact;

    if (up || down || left || right || boosting || this.keys.interact.isDown || mobile.any) this.startAudioOnce();

    if (Phaser.Input.Keyboard.JustDown(this.keys.headlights) || mobile.headlightsPressed) {
      DISTORTION.headlightsOn = !DISTORTION.headlightsOn;
    }
    if (Phaser.Input.Keyboard.JustDown(this.keys.siren)) {
      this.debugSirenOn = !this.debugSirenOn;
      this.wantedLevel = this.debugSirenOn ? 1 : 0;
    }

    const canDrive = DISTORTION.fuel > 0.01;
    if (left) c.rotation -= DISTORTION.turnSpeed * dt * (DISTORTION.speed > 30 ? 1 : 0.55);
    if (right) c.rotation += DISTORTION.turnSpeed * dt * (DISTORTION.speed > 30 ? 1 : 0.55);

    if (up && canDrive) {
      DISTORTION.speed += DISTORTION.accel * dt * (boosting ? 1.8 : 1);
      DISTORTION.fuel -= (boosting ? 2.5 : 0.65) * dt;
    } else {
      DISTORTION.speed *= Math.pow(DISTORTION.drag, delta / 16.67);
    }

    if (braking) {
      DISTORTION.speed *= Math.pow(0.94, delta / 16.67);
      if (DISTORTION.speed > 150) this.drawTireTracks();
    }

    DISTORTION.speed = Phaser.Math.Clamp(Number.isFinite(DISTORTION.speed) ? DISTORTION.speed : 0, 0, DISTORTION.maxSpeed * (boosting ? 1.30 : 1));
    if (DISTORTION.fuel <= 0) {
      DISTORTION.fuel = 0;
      DISTORTION.speed *= Math.pow(0.93, delta / 16.67);
    }

    c.setVelocity(Math.cos(c.rotation) * DISTORTION.speed, Math.sin(c.rotation) * DISTORTION.speed);
    c.setTexture("distortion_topdown");

    this.updateTraffic(delta);
    this.updatePedestrians(time);
    this.updateCamera();
    this.updateFx(up, braking, boosting);
    this.drawHeadlights();
    this.checkInteractions(delta);
    this.updateHud();
    this.updateAudio(boosting);
  }

  updateCamera() {
    const ratio = Phaser.Math.Clamp(DISTORTION.speed / DISTORTION.maxSpeed, 0, 1);
    this.cameras.main.setZoom(Phaser.Math.Linear(0.68, 0.44, ratio));
  }

  updateFx(accel, braking, boosting) {
    const c = this.car;
    const rearX = c.x - Math.cos(c.rotation) * 42;
    const rearY = c.y - Math.sin(c.rotation) * 42;
    const shouldSmoke = braking || boosting || DISTORTION.fuel <= 0 || (accel && DISTORTION.speed > 280);
    if (shouldSmoke) {
      this.smoke.setPosition(rearX, rearY);
      this.smoke.start();
    } else {
      this.smoke.stop();
    }
  }

  drawTireTracks() {
    const c = this.car;
    const angle = c.rotation;
    const sx = Math.cos(angle + Math.PI / 2);
    const sy = Math.sin(angle + Math.PI / 2);
    const rearX = c.x - Math.cos(angle) * 38;
    const rearY = c.y - Math.sin(angle) * 38;
    const off = 18;
    this.trackLayer.lineStyle(3, 0x101010, 0.30);
    for (const side of [-1, 1]) {
      const x = rearX + sx * off * side;
      const y = rearY + sy * off * side;
      this.trackLayer.beginPath();
      this.trackLayer.moveTo(x, y);
      this.trackLayer.lineTo(x - Math.cos(angle) * 22, y - Math.sin(angle) * 22);
      this.trackLayer.strokePath();
    }
  }

  drawHeadlights() {
    this.headlightLayer.clear();
    if (!DISTORTION.headlightsOn) return;
    const c = this.car;
    const a = c.rotation;
    const fx = c.x + Math.cos(a) * 52;
    const fy = c.y + Math.sin(a) * 52;
    const len = 340;
    const width = 110;
    const ex = fx + Math.cos(a) * len;
    const ey = fy + Math.sin(a) * len;
    const sx = Math.cos(a + Math.PI/2);
    const sy = Math.sin(a + Math.PI/2);
    this.headlightLayer.fillStyle(0x9befff, 0.035);
    this.headlightLayer.fillTriangle(fx, fy, ex + sx*width, ey + sy*width, ex - sx*width, ey - sy*width);
    this.headlightLayer.fillStyle(0xd7f7ff, 0.11);
    this.headlightLayer.fillTriangle(fx, fy, ex + sx*42, ey + sy*42, ex - sx*42, ey - sy*42);
  }

  checkInteractions(delta) {
    let message = "";
    let refueling = false;

    for (const s of FUEL_STATIONS) {
      const dist = Phaser.Math.Distance.Between(this.car.x, this.car.y, s.x, s.y);
      if (dist < s.radius) {
        message = `Press E / X to refuel at ${s.name}`;
        if (this.keys.interact.isDown || this.mobileInteract) {
          DISTORTION.fuel = Math.min(DISTORTION.fuelMax, DISTORTION.fuel + 42 * delta / 1000);
          DISTORTION.condition = "Refueling";
          refueling = true;
        }
        break;
      }
    }

    if (!message) {
      for (const z of GATE_ZONES) {
        const dist = Phaser.Math.Distance.Between(this.car.x, this.car.y, z.x, z.y);
        if (dist < z.radius) {
          message = `${z.name}\n${z.status}`;
          break;
        }
      }
    }

    if (!refueling && DISTORTION.condition === "Refueling") DISTORTION.condition = "Prototype";
    this.isRefueling = refueling;

    if (message) {
      this.prompt.setText(message);
      this.prompt.setVisible(true);
    } else {
      this.prompt.setVisible(false);
    }
  }

  updateHud() {
    const ratio = Phaser.Math.Clamp(DISTORTION.fuel / DISTORTION.fuelMax, 0, 1);
    this.fuelBar.width = 210 * ratio;
    this.fuelBar.fillColor = ratio < 0.18 ? 0xd94d3d : ratio < 0.45 ? 0xd6b94b : 0x9b6cff;
    this.hudFuel.setText(`Fuel: ${Math.round(ratio * 100)}%  ${DISTORTION.condition}`);
    this.hudWanted.setText(`WANTED ${this.wantedLevel}`);
  }

  updateAudio(boosting) {
    if (!this.audioEnabled || !this.audio.idle) return;
    const ratio = Phaser.Math.Clamp(DISTORTION.speed / DISTORTION.maxSpeed, 0, 1);
    this.audio.idle.setVolume(Phaser.Math.Linear(0.20, 0.04, ratio));
    this.audio.drive.setVolume(Phaser.Math.Linear(0.00, 0.34, ratio));
    this.audio.drive.setRate(Phaser.Math.Linear(0.80, 1.45, ratio));
    this.audio.boost.setVolume(boosting ? 0.30 : 0.0);
    this.audio.refuel.setVolume(this.isRefueling ? 0.24 : 0.0);
    if (this.audio.police) this.audio.police.setVolume(this.wantedLevel > 0 ? 0.24 : 0.0);
    if (this.audio.ambulance) this.audio.ambulance.setVolume(0.10); // low ambient EMS traffic siren
  }
}

new Phaser.Game({
  type: Phaser.AUTO,
  width: GAME_W,
  height: GAME_H,
  backgroundColor: "#050505",
  pixelArt: true,
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  physics: { default: "arcade", arcade: { debug: false } },
  scene: [GlasswellScene]
});
