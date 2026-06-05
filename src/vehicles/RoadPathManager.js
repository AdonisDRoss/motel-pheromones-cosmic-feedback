/**
 * RoadPathManager.js
 *
 * Converts road/lane definitions (from your tilemap or hand-authored data)
 * into per-lane world-space point arrays that AI drivers follow.
 *
 * Key ideas:
 *  - Roads are defined as a centre-line plus a lane width.
 *  - Lane 0 is the left-most lane; lane N is the right-most.
 *  - Waypoints are pre-baked so per-frame cost is just an array look-up.
 *  - Curves are handled by Catmull-Rom interpolation over control points.
 *
 * Usage (inside a Phaser Scene or Scene's create()):
 *
 *   import RoadPathManager from './RoadPathManager';
 *   const rpm = new RoadPathManager(scene);
 *   rpm.registerRoad('main_street', controlPoints, { laneCount: 2, laneWidth: 48 });
 *   const path = rpm.getLanePath('main_street', 0);  // lane 0 waypoints
 */

const DEFAULT_SAMPLES = 40;   // interpolated points per segment

/** Catmull-Rom spline — returns a point along the curve at t ∈ [0,1] */
function catmullRom (p0, p1, p2, p3, t) {
  const t2 = t * t;
  const t3 = t2 * t;
  return {
    x: 0.5 * ((2 * p1.x) +
       (-p0.x + p2.x) * t +
       (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
       (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
    y: 0.5 * ((2 * p1.y) +
       (-p0.y + p2.y) * t +
       (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
       (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3),
  };
}

/**
 * Given a centre-line of control points, expand outward to produce
 * a lane-offset polyline.  Positive offset = right of travel direction.
 */
function buildLanePath (centreLine, laneOffset, samplesPerSegment) {
  if (centreLine.length < 2) return centreLine.slice();

  // Pad endpoints so Catmull-Rom has P0 and P3 at the boundaries
  const pts = [
    centreLine[0],
    ...centreLine,
    centreLine[centreLine.length - 1],
  ];

  const result = [];

  for (let i = 1; i < pts.length - 2; i++) {
    const p0 = pts[i - 1];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2];

    const steps = (i === pts.length - 3)
      ? samplesPerSegment + 1    // include the very last point
      : samplesPerSegment;

    for (let s = 0; s < steps; s++) {
      const t  = s / samplesPerSegment;
      const cp = catmullRom(p0, p1, p2, p3, t);

      // Compute tangent for perpendicular offset
      const dt = 0.001;
      const cp2 = catmullRom(p0, p1, p2, p3, Math.min(t + dt, 1));
      const tx  = cp2.x - cp.x;
      const ty  = cp2.y - cp.y;
      const len = Math.sqrt(tx * tx + ty * ty) || 1;

      // Right-hand perpendicular
      const nx = -ty / len;
      const ny =  tx / len;

      result.push({
        x: cp.x + nx * laneOffset,
        y: cp.y + ny * laneOffset,
      });
    }
  }

  return result;
}

// ─── Road record ──────────────────────────────────────────────────────────

class RoadRecord {
  /**
   * @param {string}   id
   * @param {{x,y}[]}  controlPoints  Centre-line control points
   * @param {object}   opts
   * @param {number}   opts.laneCount   Number of lanes (default 2)
   * @param {number}   opts.laneWidth   Width of each lane in world units
   * @param {number}   [opts.samples]   Catmull-Rom samples per segment
   * @param {boolean}  [opts.loop]      Is this road a loop?
   */
  constructor (id, controlPoints, opts = {}) {
    this.id            = id;
    this.controlPoints = controlPoints;
    this.laneCount     = opts.laneCount  ?? 2;
    this.laneWidth     = opts.laneWidth  ?? 48;
    this.samples       = opts.samples    ?? DEFAULT_SAMPLES;
    this.loop          = opts.loop       ?? false;

    /** @type {Array<{x,y}[]>} one entry per lane */
    this.lanes = [];
    this._bake();
  }

  _bake () {
    this.lanes = [];
    const halfRoad = ((this.laneCount - 1) / 2) * this.laneWidth;

    for (let lane = 0; lane < this.laneCount; lane++) {
      const offset = lane * this.laneWidth - halfRoad;
      this.lanes.push(
        buildLanePath(this.controlPoints, offset, this.samples)
      );
    }
  }

  getLanePath (lane) {
    const idx = Math.max(0, Math.min(lane, this.laneCount - 1));
    return this.lanes[idx];
  }

  /** Returns the nearest waypoint index on a given lane to world position */
  nearestWaypointIndex (lane, worldX, worldY) {
    const path = this.getLanePath(lane);
    let   best = 0;
    let   bestDist = Infinity;

    for (let i = 0; i < path.length; i++) {
      const dx = path[i].x - worldX;
      const dy = path[i].y - worldY;
      const d  = dx * dx + dy * dy;
      if (d < bestDist) { bestDist = d; best = i; }
    }
    return best;
  }
}

// ─── Public API ──────────────────────────────────────────────────────────

export default class RoadPathManager {
  /**
   * @param {Phaser.Scene} scene  Used for optional debug graphics
   */
  constructor (scene) {
    this.scene = scene;
    /** @type {Map<string, RoadRecord>} */
    this._roads = new Map();

    this._debugGraphics = null;
  }

  // ── Registration ─────────────────────────────────────────────────────

  /**
   * Register a road from control points.
   *
   * @param {string}   id
   * @param {{x,y}[]}  controlPoints
   * @param {object}   opts           see RoadRecord constructor
   * @returns {RoadRecord}
   */
  registerRoad (id, controlPoints, opts = {}) {
    const road = new RoadRecord(id, controlPoints, opts);
    this._roads.set(id, road);
    return road;
  }

  /**
   * Register roads from a flat config array — handy for map-driven setups.
   *
   * @param {Array<{id, controlPoints, opts}>} configs
   */
  registerRoads (configs) {
    for (const c of configs) {
      this.registerRoad(c.id, c.controlPoints, c.opts || {});
    }
  }

  getRoad (id) {
    return this._roads.get(id) || null;
  }

  // ── Path queries ─────────────────────────────────────────────────────

  /**
   * Return world-space waypoints for a specific lane on a road.
   * Safe to call every frame — returns the pre-baked array.
   *
   * @returns {{x,y}[]}
   */
  getLanePath (roadId, lane) {
    const road = this._roads.get(roadId);
    if (!road) {
      console.warn(`[RoadPathManager] Road "${roadId}" not found.`);
      return [];
    }
    return road.getLanePath(lane);
  }

  /**
   * Assign a full route to an AI vehicle state block (the ai namespace).
   * The vehicle's ai.routePath is filled in and ai.pathIndex reset to 0.
   *
   * @param {import('./VehicleState').VehicleRecord} vehicleRecord
   * @param {string}  roadId
   * @param {number}  lane
   */
  assignRoute (vehicleRecord, roadId, lane) {
    const path = this.getLanePath(roadId, lane);
    vehicleRecord.ai.routePath  = path;
    vehicleRecord.ai.pathIndex  = 0;
    vehicleRecord.ai.aiLane     = lane;

    // Snap to the nearest point on the path to current sprite position
    if (vehicleRecord.sprite && path.length) {
      const road = this._roads.get(roadId);
      if (road) {
        vehicleRecord.ai.pathIndex = road.nearestWaypointIndex(
          lane,
          vehicleRecord.sprite.x,
          vehicleRecord.sprite.y
        );
      }
    }
  }

  /**
   * Return the heading angle (radians) from a vehicle's current path index
   * toward the next waypoint.  Used by TrafficManager every frame.
   *
   * @returns {number} angle in radians
   */
  headingToNextWaypoint (vehicleRecord) {
    const { routePath, pathIndex } = vehicleRecord.ai;
    if (!routePath || routePath.length === 0) return vehicleRecord.ai.aiHeading;

    const target = routePath[Math.min(pathIndex, routePath.length - 1)];
    const dx = target.x - vehicleRecord.sprite.x;
    const dy = target.y - vehicleRecord.sprite.y;
    return Math.atan2(dy, dx);
  }

  /**
   * Advance the vehicle's pathIndex if it is close enough to the current
   * waypoint.  Returns true when the vehicle has reached the end of the path.
   *
   * @param {import('./VehicleState').VehicleRecord} vehicleRecord
   * @param {number} arrivalRadius  Distance (px) to consider "arrived"
   * @returns {boolean} true if route complete
   */
  advanceWaypoint (vehicleRecord, arrivalRadius = 24) {
    const ai   = vehicleRecord.ai;
    const path = ai.routePath;
    if (!path || path.length === 0) return true;

    const target = path[ai.pathIndex];
    const dx = target.x - vehicleRecord.sprite.x;
    const dy = target.y - vehicleRecord.sprite.y;

    if (dx * dx + dy * dy < arrivalRadius * arrivalRadius) {
      ai.pathIndex++;
      if (ai.pathIndex >= path.length) {
        ai.pathIndex = path.length - 1;
        return true;
      }
    }
    return false;
  }

  // ── Debug ─────────────────────────────────────────────────────────────

  /**
   * Draw all registered road lane paths as coloured lines.
   * Call once from create() or toggle with a key.
   */
  drawDebug (visible = true) {
    if (!this.scene) return;

    if (!this._debugGraphics) {
      this._debugGraphics = this.scene.add.graphics();
      this._debugGraphics.setDepth(9999);
    }

    this._debugGraphics.clear();
    this._debugGraphics.setVisible(visible);
    if (!visible) return;

    const colours = [0x00ff00, 0x0088ff, 0xff8800, 0xff00ff];
    let ci = 0;

    for (const road of this._roads.values()) {
      for (let li = 0; li < road.laneCount; li++) {
        const path = road.getLanePath(li);
        if (path.length < 2) continue;

        this._debugGraphics.lineStyle(1, colours[ci % colours.length], 0.5);
        this._debugGraphics.beginPath();
        this._debugGraphics.moveTo(path[0].x, path[0].y);
        for (let pi = 1; pi < path.length; pi++) {
          this._debugGraphics.lineTo(path[pi].x, path[pi].y);
        }
        this._debugGraphics.strokePath();
        ci++;
      }
    }
  }
}
