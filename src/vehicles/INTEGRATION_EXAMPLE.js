/**
 * INTEGRATION_EXAMPLE.js
 *
 * How to wire the four vehicle modules into your existing Phaser 3 Scene.
 * Copy the relevant parts into your GameScene (or whatever scene hosts
 * the world map, chunks, and Donny).
 *
 * This file is documentation — do NOT import it directly.
 */

import VehicleState,     { VehicleMode, VehicleType } from './VehicleState.js';
import VehicleController                               from './VehicleController.js';
import TrafficManager                                  from './TrafficManager.js';
import RoadPathManager                                 from './RoadPathManager.js';

// ─────────────────────────────────────────────────────────────────────────────
// 1.  SCENE FIELDS  (declare these on your Scene class)
// ─────────────────────────────────────────────────────────────────────────────

/*
  this.vehicleState    = null;
  this.vehicleController = null;
  this.trafficManager  = null;
  this.roadPathManager = null;
  this.currentChunkId  = null;
  this.donnySprite     = null;   // Donny's on-foot sprite
  this.mobileControls  = {       // hooked up by your virtual joystick code
    aDown:  false,
    bDown:  false,
    stickX: 0,
  };
*/

// ─────────────────────────────────────────────────────────────────────────────
// 2.  create()  — put this AFTER you create Donny's sprite and tilemap
// ─────────────────────────────────────────────────────────────────────────────

function exampleCreate () {
  // ── 2a. Core systems ──────────────────────────────────────────────────

  this.vehicleState      = new VehicleState();
  this.roadPathManager   = new RoadPathManager(this);
  this.trafficManager    = new TrafficManager(
    this, this.vehicleState, this.roadPathManager
  );
  this.vehicleController = new VehicleController(
    this, this.vehicleState, this.mobileControls
  );

  // Tell VehicleController where Donny is for proximity / carjack checks
  this.vehicleController.setPlayerSprite(this.donnySprite);

  // ── 2b. Register roads ───────────────────────────────────────────────
  // Replace these example control points with your actual map coordinates.

  this.roadPathManager.registerRoad('main_street', [
    { x: 100,  y: 500 },
    { x: 400,  y: 500 },
    { x: 700,  y: 480 },
    { x: 950,  y: 460 },
    { x: 1200, y: 500 },
  ], { laneCount: 2, laneWidth: 52 });

  this.roadPathManager.registerRoad('south_avenue', [
    { x: 300,  y: 200 },
    { x: 300,  y: 500 },
    { x: 300,  y: 800 },
  ], { laneCount: 2, laneWidth: 52 });

  // Optionally draw debug overlays (remove for release):
  this.roadPathManager.drawDebug(true);

  // ── 2c. Register chunk traffic definitions ───────────────────────────
  // Call registerChunk() for EVERY chunk in the game.
  // Vehicles here are ONLY spawned when that chunk becomes active.

  this.trafficManager.registerChunk('chunk_01', [
    {
      id:         'truck_01',
      type:       VehicleType.TRUCK,
      roadId:     'main_street',
      lane:       0,
      startIndex: 0,
      x:          150,
      y:          500,
      heading:    0,
      speed:      70,
      spriteKey:  'orange_truck',   // your existing texture key
    },
    {
      id:         'car_01',
      type:       VehicleType.CAR,
      roadId:     'main_street',
      lane:       1,
      startIndex: 4,
      x:          250,
      y:          548,
      heading:    0,
      speed:      90,
      spriteKey:  'blue_car',
    },
  ]);

  this.trafficManager.registerChunk('chunk_02', [
    {
      id:         'van_01',
      type:       VehicleType.VAN,
      roadId:     'south_avenue',
      lane:       0,
      startIndex: 0,
      x:          300,
      y:          220,
      heading:    Math.PI / 2,
      speed:      60,
      spriteKey:  'white_van',
    },
  ]);

  // ── 2d. Donny starts on foot — no player vehicle yet ─────────────────
  // (VehicleState._playerVehicleId is null until carjacking occurs.)

  // ── 2e. Start with chunk_01 ──────────────────────────────────────────
  this.currentChunkId = 'chunk_01';
  this.trafficManager.onChunkEnter('chunk_01');
  this.trafficManager.setCurrentChunk('chunk_01');

  // Enable debug overlay
  this.trafficManager.showDebug('chunk_01');

  // ── 2f. Optional: wire mobile carjack button ─────────────────────────
  /*
  this.carjackButton.on('pointerdown', () => {
    this.vehicleController.setMobileCarjackTrigger(true);
  });
  */

  // ── 2g. Carjack callback ─────────────────────────────────────────────
  this.vehicleController.setCarjackCallback((newVehicle) => {
    console.log(`[Game] Carjacked "${newVehicle.id}" (${newVehicle.type})`);
    // e.g. switch camera follow to newVehicle.sprite
    this.cameras.main.startFollow(newVehicle.sprite, true, 0.1, 0.1);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 3.  update(time, delta)
// ─────────────────────────────────────────────────────────────────────────────

function exampleUpdate (time, delta) {
  // Player vehicle — VehicleController owns this; never update AI for it
  this.vehicleController.update(delta);

  // All AI traffic vehicles
  this.trafficManager.update(delta);
}

// ─────────────────────────────────────────────────────────────────────────────
// 4.  CHUNK TRANSITION  — call this from your existing chunk-change logic
// ─────────────────────────────────────────────────────────────────────────────

function exampleOnChunkChange (newChunkId) {
  const oldChunkId = this.currentChunkId;

  // Exit the old chunk — despawns its traffic ONLY (player vehicle untouched)
  if (oldChunkId) {
    this.trafficManager.onChunkExit(oldChunkId);
  }

  // Enter the new chunk — respawns fresh traffic for it
  this.currentChunkId = newChunkId;
  this.trafficManager.onChunkEnter(newChunkId);
  this.trafficManager.setCurrentChunk(newChunkId);

  // Camera: keep following whatever sprite the player is currently in
  const pv = this.vehicleState.getPlayerVehicle();
  if (pv && pv.sprite) {
    this.cameras.main.startFollow(pv.sprite, true, 0.1, 0.1);
  } else {
    this.cameras.main.startFollow(this.donnySprite, true, 0.1, 0.1);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5.  MOBILE CONTROLS  — wire your joystick plugin into mobileControls
//     (This is READ by VehicleController; never by TrafficManager.)
// ─────────────────────────────────────────────────────────────────────────────

/*
// Example using any Phaser virtual joystick plugin:

joystick.on('update', () => {
  this.mobileControls.stickX = joystick.forceX / joystick.radius;
  // stickX is all that is read for steering — no drag-style, no Y axis
});

aButtonObject.on('pointerdown', () => { this.mobileControls.aDown = true;  });
aButtonObject.on('pointerup',   () => { this.mobileControls.aDown = false; });
bButtonObject.on('pointerdown', () => { this.mobileControls.bDown = true;  });
bButtonObject.on('pointerup',   () => { this.mobileControls.bDown = false; });
*/

// ─────────────────────────────────────────────────────────────────────────────
// 6.  PHASE 1 SUCCESS CHECKLIST
// ─────────────────────────────────────────────────────────────────────────────

/*
  [1] Donny enters one car
        → Press E near a traffic vehicle; vehicleController._enterNearestVehicle()
          calls vehicleState.setPlayerVehicle(id).

  [2] Only that car responds to controls
        → VehicleController skips all records except playerVehicleId.
        → TrafficManager skips the record whose id === playerVehicleId.

  [3] Traffic keeps moving independently
        → TrafficManager._updateAI() runs for every non-player vehicle
          using ONLY ai.aiSpeed / ai.aiHeading / ai.aiLane / ai.routePath.

  [4] Orange trucks do not spin or copy player movement
        → No shared state. Trucks have their own ai namespace; player
          namespace is never written or read by TrafficManager.

  [5] Current car persists after chunk transition
        → onChunkExit calls despawnChunk() which filters out isPlayerOwned
          vehicles — the stolen car is never destroyed.

  [6] Returning to previous chunk respawns traffic
        → onChunkEnter re-runs _spawnTrafficVehicle() for that chunk's defs.

  [7] Donny does not reset to default car
        → vehicleState._playerVehicleId is never cleared during chunk
          transitions. Only a voluntary exit (E key) clears it.
*/
