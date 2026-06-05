/**
 * VehicleState.js
 *
 * Single source of truth for every vehicle in the game.
 * Player state and AI state are stored in completely separate namespaces
 * so no AI vehicle can ever accidentally read or mirror player input.
 *
 * Usage:
 *   import VehicleState from './VehicleState';
 *   const vs = new VehicleState();
 *   vs.registerVehicle('truck_01', 'traffic', sprite);
 *   vs.registerVehicle('player_car', 'player',  sprite);
 */

export const VehicleMode = Object.freeze({
  IDLE:     'IDLE',
  PLAYER:   'PLAYER',
  AI:       'AI',
  PARKED:   'PARKED',
  DESPAWNED:'DESPAWNED',
});

export const VehicleType = Object.freeze({
  CAR:       'car',
  TRUCK:     'truck',
  MOTORCYCLE:'motorcycle',
  VAN:       'van',
});

/**
 * Creates a fresh AI-only state block.
 * Traffic vehicles ONLY use these fields for movement.
 */
function createAIState () {
  return {
    aiSpeed:   0,          // current speed (units/sec)
    aiHeading: 0,          // angle in radians, 0 = right
    aiLane:    0,          // lane index on current road segment
    routePath: [],         // array of { x, y } world-space waypoints
    pathIndex: 0,          // which waypoint we are heading toward
    targetSpeed: 80,       // desired cruising speed
    steerAngle: 0,         // intermediate steer value this frame
    braking:   false,      // is the car braking?
    chunkId:   null,       // which chunk spawned this vehicle
  };
}

/**
 * Creates a fresh player-only state block.
 * Player vehicle ONLY uses these fields for movement.
 */
function createPlayerState () {
  return {
    playerSpeed:   0,      // current speed (units/sec)
    playerHeading: 0,      // angle in radians
    accelerating:  false,  // A button / up key held
    braking:       false,  // B button / down key held
    steerInput:    0,      // -1..1 from thumbstick / left-right keys
    maxSpeed:      220,
    acceleration:  160,
    brakeForce:    240,
    reverseSpeed:  80,
    turnRate:      2.4,    // radians/sec at full steer
  };
}

export class VehicleRecord {
  constructor (id, type, sprite) {
    this.id      = id;
    this.type    = type;      // VehicleType constant
    this.sprite  = sprite;    // Phaser GameObject
    this.mode    = VehicleMode.AI;

    /** AI namespace — traffic reads ONLY these */
    this.ai     = createAIState();

    /** Player namespace — player reads ONLY these */
    this.player = createPlayerState();

    /** Shared cosmetic/bookkeeping */
    this.chunkId       = null;   // chunk that owns / spawned this vehicle
    this.isPlayerOwned = false;  // true after carjacking
  }

  /** Convenience: world position delegates to sprite */
  get x () { return this.sprite ? this.sprite.x : 0; }
  get y () { return this.sprite ? this.sprite.y : 0; }
}

export default class VehicleState {
  constructor () {
    /** @type {Map<string, VehicleRecord>} */
    this._vehicles = new Map();

    /** id of the vehicle the player currently controls */
    this._playerVehicleId = null;
  }

  // ─── Registration ────────────────────────────────────────────────────────

  /**
   * @param {string} id        Unique vehicle id
   * @param {string} type      VehicleType constant
   * @param {object} sprite    Phaser sprite / game object
   * @returns {VehicleRecord}
   */
  registerVehicle (id, type, sprite) {
    if (this._vehicles.has(id)) {
      console.warn(`[VehicleState] Vehicle "${id}" already registered — skipping.`);
      return this._vehicles.get(id);
    }
    const record = new VehicleRecord(id, type, sprite);
    this._vehicles.set(id, record);
    return record;
  }

  unregisterVehicle (id) {
    const rec = this._vehicles.get(id);
    if (rec) {
      rec.mode = VehicleMode.DESPAWNED;
      this._vehicles.delete(id);
    }
  }

  getVehicle (id) {
    return this._vehicles.get(id) || null;
  }

  getAllVehicles () {
    return Array.from(this._vehicles.values());
  }

  getTrafficVehicles () {
    return this.getAllVehicles().filter(
      v => v.mode === VehicleMode.AI || v.mode === VehicleMode.PARKED
    );
  }

  // ─── Player ownership ────────────────────────────────────────────────────

  get playerVehicleId () { return this._playerVehicleId; }

  getPlayerVehicle () {
    if (!this._playerVehicleId) return null;
    return this._vehicles.get(this._playerVehicleId) || null;
  }

  /**
   * Transfer player control to a specific vehicle.
   * The previous vehicle reverts to AI mode automatically.
   * All OTHER vehicles are untouched — their AI state continues unchanged.
   *
   * @param {string} vehicleId
   */
  setPlayerVehicle (vehicleId) {
    // Revert previous player vehicle to AI
    const prev = this.getPlayerVehicle();
    if (prev && prev.id !== vehicleId) {
      prev.mode          = VehicleMode.AI;
      prev.isPlayerOwned = false;
      // Hand its heading/speed back to AI namespace so it can resume
      prev.ai.aiHeading = prev.player.playerHeading;
      prev.ai.aiSpeed   = Math.min(prev.player.playerSpeed, prev.ai.targetSpeed);
    }

    const next = this._vehicles.get(vehicleId);
    if (!next) {
      console.error(`[VehicleState] setPlayerVehicle: unknown id "${vehicleId}"`);
      return;
    }

    // Promote to player mode
    next.mode               = VehicleMode.PLAYER;
    next.isPlayerOwned      = true;
    next.player.playerHeading = next.ai.aiHeading; // inherit current heading
    next.player.playerSpeed   = next.ai.aiSpeed;
    this._playerVehicleId     = vehicleId;
  }

  // ─── Chunk bookkeeping ───────────────────────────────────────────────────

  /**
   * Returns all vehicles whose chunkId matches the given chunk.
   * Used by TrafficManager when despawning a chunk's traffic.
   */
  getVehiclesInChunk (chunkId) {
    return this.getAllVehicles().filter(v => v.chunkId === chunkId);
  }

  /**
   * Despawn (remove) all non-player vehicles that belong to a chunk.
   * Player vehicle is never touched.
   */
  despawnChunk (chunkId) {
    const toRemove = this.getVehiclesInChunk(chunkId).filter(
      v => !v.isPlayerOwned
    );
    for (const v of toRemove) {
      if (v.sprite && v.sprite.active) {
        v.sprite.destroy();
      }
      this.unregisterVehicle(v.id);
    }
  }

  // ─── Debug snapshot ──────────────────────────────────────────────────────

  debugSnapshot () {
    const pv  = this.getPlayerVehicle();
    return {
      playerVehicleId:  this._playerVehicleId,
      playerVehicleType: pv ? pv.type : 'none',
      vehicleMode:       pv ? pv.mode : 'none',
      trafficCount:      this.getTrafficVehicles().length,
    };
  }
}
