/**
 * TrafficManager.js
 *
 * Owns spawning, updating, and despawning of ALL non-player vehicles.
 * Traffic AI NEVER reads player input, player speed, or player heading.
 * It reads only: ai.aiSpeed, ai.aiHeading, ai.aiLane, ai.routePath.
 *
 * Chunk lifecycle:
 *   - onChunkEnter(chunkId)   → spawn traffic defined for that chunk
 *   - onChunkExit(chunkId)    → despawn traffic that belongs to that chunk
 *     (player vehicle is never touched by either call)
 *
 * Usage (inside Phaser Scene.create()):
 *
 *   import TrafficManager from './TrafficManager';
 *   const tm = new TrafficManager(scene, vehicleState, roadPathManager);
 *
 *   tm.registerChunk('chunk_01', [
 *     { id:'truck_01', type:'truck', roadId:'main_street', lane:0, startIndex:0,
 *       x:200, y:400, heading:0, speed:70, spriteKey:'orange_truck' },
 *     { id:'car_02',   type:'car',   roadId:'main_street', lane:1, startIndex:5,
 *       x:250, y:400, heading:0, speed:90, spriteKey:'blue_car' },
 *   ]);
 *
 *   // When entering chunk_01:
 *   tm.onChunkEnter('chunk_01');
 *
 *   // In update loop:
 *   tm.update(delta);
 *
 *   // When leaving chunk_01:
 *   tm.onChunkExit('chunk_01');
 */

import { VehicleMode } from './VehicleState.js';

// ── AI tuning constants ────────────────────────────────────────────────────

const WAYPOINT_ARRIVAL_RADIUS = 24;    // px
const STEER_SPEED             = 4.0;   // radians/sec max turn rate for AI
const LOOK_AHEAD_STEPS        = 3;     // how many waypoints ahead to steer toward
const STOP_DISTANCE_SQ        = 60*60; // px² — stop if blocked by another car
const LOOP_PATH               = true;  // loop route when reaching the end

// ── Helpers ────────────────────────────────────────────────────────────────

function angleDiff (from, to) {
  let d = to - from;
  while (d >  Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}

function distSq (ax, ay, bx, by) {
  const dx = ax - bx, dy = ay - by;
  return dx * dx + dy * dy;
}

// ── Class ─────────────────────────────────────────────────────────────────

export default class TrafficManager {
  /**
   * @param {Phaser.Scene}                          scene
   * @param {import('./VehicleState').default}      vehicleState
   * @param {import('./RoadPathManager').default}   roadPathManager
   */
  constructor (scene, vehicleState, roadPathManager) {
    this.scene          = scene;
    this.vehicleState   = vehicleState;
    this.roadPathManager = roadPathManager;

    /**
     * Map of chunkId → array of spawn definitions.
     * @type {Map<string, object[]>}
     */
    this._chunkDefs = new Map();

    /** Currently active chunk IDs */
    this._activeChunks = new Set();

    /** Debug overlay text (created on demand) */
    this._debugText = null;
  }

  // ── Chunk registration ──────────────────────────────────────────────────

  /**
   * Register traffic spawn definitions for a chunk.
   *
   * @param {string} chunkId
   * @param {Array<{
   *   id:          string,   // unique vehicle id
   *   type:        string,   // VehicleType constant
   *   roadId:      string,   // road to follow
   *   lane:        number,   // lane index
   *   startIndex:  number,   // initial waypoint index (0 = road start)
   *   x:           number,   // world spawn X
   *   y:           number,   // world spawn Y
   *   heading:     number,   // initial heading in radians
   *   speed:       number,   // cruising speed
   *   spriteKey:   string,   // Phaser texture key
   * }>} defs
   */
  registerChunk (chunkId, defs) {
    this._chunkDefs.set(chunkId, defs);
  }

  // ── Chunk lifecycle ─────────────────────────────────────────────────────

  /**
   * Call when the player enters a chunk.
   * Spawns all traffic vehicles defined for that chunk.
   * Player vehicle is untouched.
   */
  onChunkEnter (chunkId) {
    if (this._activeChunks.has(chunkId)) return;  // already active
    this._activeChunks.add(chunkId);

    const defs = this._chunkDefs.get(chunkId);
    if (!defs) return;

    for (const def of defs) {
      this._spawnTrafficVehicle(chunkId, def);
    }
  }

  /**
   * Call when the player leaves a chunk.
   * Despawns all non-player vehicles that belong to that chunk.
   * Player vehicle (even if carjacked from this chunk) is NEVER touched.
   */
  onChunkExit (chunkId) {
    if (!this._activeChunks.has(chunkId)) return;
    this._activeChunks.delete(chunkId);
    this.vehicleState.despawnChunk(chunkId);
  }

  // ── Spawn ────────────────────────────────────────────────────────────────

  _spawnTrafficVehicle (chunkId, def) {
    // If a vehicle with this id is still registered (e.g. was carjacked),
    // do not re-spawn — preserve the player's stolen vehicle.
    if (this.vehicleState.getVehicle(def.id)) {
      // Check if it is player-owned — if so, skip
      const existing = this.vehicleState.getVehicle(def.id);
      if (existing.isPlayerOwned) return;
      // Otherwise remove stale record before re-spawning
      this.vehicleState.unregisterVehicle(def.id);
    }

    // Create Phaser sprite
    const sprite = this.scene.physics.add.sprite(def.x, def.y, def.spriteKey);
    sprite.setRotation(def.heading);
    if (this.scene.physics && sprite.body) {
      sprite.body.setAllowGravity(false);
    }

    // Register in VehicleState
    const record = this.vehicleState.registerVehicle(def.id, def.type, sprite);
    record.mode    = VehicleMode.AI;
    record.chunkId = chunkId;

    // Set AI namespace only — never player namespace
    record.ai.aiSpeed     = def.speed;
    record.ai.aiHeading   = def.heading;
    record.ai.aiLane      = def.lane;
    record.ai.targetSpeed = def.speed;
    record.ai.chunkId     = chunkId;

    // Assign route
    this.roadPathManager.assignRoute(record, def.roadId, def.lane);

    // Snap pathIndex to startIndex if provided
    if (typeof def.startIndex === 'number' && def.startIndex > 0) {
      record.ai.pathIndex = Math.min(
        def.startIndex,
        record.ai.routePath.length - 1
      );
    }
  }

  // ── Per-frame AI update ──────────────────────────────────────────────────

  /**
   * Update all AI vehicles.  Player vehicle is identified and skipped.
   * @param {number} delta  Phaser delta in milliseconds
   */
  update (delta) {
    const dt            = delta / 1000;
    const playerVehicleId = this.vehicleState.playerVehicleId;
    const allVehicles   = this.vehicleState.getAllVehicles();

    for (const v of allVehicles) {
      // Never update the player vehicle — its motion is VehicleController's job
      if (v.id === playerVehicleId) continue;
      if (v.mode === VehicleMode.DESPAWNED) continue;
      if (v.mode === VehicleMode.PARKED)    continue;
      if (!v.sprite || !v.sprite.active)    continue;

      this._updateAI(v, dt, allVehicles, playerVehicleId);
    }

    this._updateDebug();
  }

  _updateAI (v, dt, allVehicles, playerVehicleId) {
    const ai   = v.ai;   // ONLY the ai namespace is touched here
    const path = ai.routePath;

    if (!path || path.length === 0) return;

    // ── Look-ahead steering ─────────────────────────────────────────────
    // Pick a waypoint a few steps ahead so curves are tracked smoothly.

    const lookIdx   = Math.min(ai.pathIndex + LOOK_AHEAD_STEPS, path.length - 1);
    const target    = path[lookIdx];
    const desiredH  = Math.atan2(
      target.y - v.sprite.y,
      target.x - v.sprite.x
    );

    const diff     = angleDiff(ai.aiHeading, desiredH);
    const maxTurn  = STEER_SPEED * dt;
    ai.steerAngle  = Math.max(-maxTurn, Math.min(maxTurn, diff));
    ai.aiHeading  += ai.steerAngle;

    // ── Advance waypoint ────────────────────────────────────────────────

    const reached = this.roadPathManager.advanceWaypoint(v, WAYPOINT_ARRIVAL_RADIUS);

    if (reached) {
      if (LOOP_PATH && path.length > 1) {
        ai.pathIndex = 0;
      } else {
        // End of path: sit still
        ai.aiSpeed = 0;
        return;
      }
    }

    // ── Collision avoidance (simple — no overtaking) ────────────────────

    ai.braking = false;
    for (const other of allVehicles) {
      if (other.id === v.id)            continue;
      if (other.id === playerVehicleId) continue;  // ignore player for AI blocking
      if (!other.sprite || !other.sprite.active) continue;

      const d = distSq(v.sprite.x, v.sprite.y, other.sprite.x, other.sprite.y);
      if (d < STOP_DISTANCE_SQ) {
        // Only brake if the other vehicle is roughly ahead of us
        const toOther = Math.atan2(
          other.sprite.y - v.sprite.y,
          other.sprite.x - v.sprite.x
        );
        if (Math.abs(angleDiff(ai.aiHeading, toOther)) < Math.PI / 3) {
          ai.braking = true;
          break;
        }
      }
    }

    // ── Speed ───────────────────────────────────────────────────────────

    if (ai.braking) {
      ai.aiSpeed = Math.max(0, ai.aiSpeed - 120 * dt);
    } else {
      ai.aiSpeed = Math.min(ai.targetSpeed, ai.aiSpeed + 80 * dt);
    }

    // ── Move sprite ─────────────────────────────────────────────────────

    v.sprite.x        += Math.cos(ai.aiHeading) * ai.aiSpeed * dt;
    v.sprite.y        += Math.sin(ai.aiHeading) * ai.aiSpeed * dt;
    v.sprite.rotation  = ai.aiHeading;
  }

  // ── Debug overlay ────────────────────────────────────────────────────────

  /**
   * Create (once) and update the in-game debug text.
   * Shows: player vehicle id, traffic count, current chunk, vehicle type, mode.
   *
   * @param {string} currentChunkId   Pass the current chunk from your Scene.
   */
  showDebug (currentChunkId = '?') {
    this._currentChunkId = currentChunkId;

    if (!this._debugText) {
      this._debugText = this.scene.add.text(12, 12, '', {
        fontSize:        '13px',
        fontFamily:      'monospace',
        color:           '#00ff88',
        backgroundColor: '#00000099',
        padding:         { x: 8, y: 6 },
      });
      this._debugText.setScrollFactor(0);   // fixed to camera
      this._debugText.setDepth(10000);
    }
  }

  hideDebug () {
    if (this._debugText) {
      this._debugText.destroy();
      this._debugText = null;
    }
  }

  _updateDebug () {
    if (!this._debugText) return;

    const snap = this.vehicleState.debugSnapshot();
    this._debugText.setText([
      `Player Vehicle : ${snap.playerVehicleId  ?? 'on foot'}`,
      `Vehicle Type   : ${snap.playerVehicleType}`,
      `Vehicle Mode   : ${snap.vehicleMode}`,
      `Traffic Count  : ${snap.trafficCount}`,
      `Current Chunk  : ${this._currentChunkId ?? '?'}`,
    ]);
  }

  /**
   * Call from your chunk-transition code to keep the debug text current.
   * @param {string} chunkId
   */
  setCurrentChunk (chunkId) {
    this._currentChunkId = chunkId;
  }
}
