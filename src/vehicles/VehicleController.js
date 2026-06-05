/**
 * VehicleController.js
 *
 * Handles ALL player input → vehicle physics.
 * This class NEVER touches any VehicleRecord.ai.* field.
 * Traffic AI never calls anything in this file.
 *
 * Mobile controls:
 *   A button        → accelerate
 *   B button        → brake / reverse
 *   Left thumbstick → steer left/right only (no drag-style steering)
 *
 * Keyboard fallback (desktop / testing):
 *   Up / W          → accelerate
 *   Down / S        → brake / reverse
 *   Left / A        → steer left
 *   Right / D       → steer right
 *
 * Usage (inside Phaser Scene.create()):
 *
 *   import VehicleController from './VehicleController';
 *   const vc = new VehicleController(scene, vehicleState, mobileControls);
 *   vc.setCarjackCallback((newVehicle) => { ... });
 *
 * Usage (inside Phaser Scene.update(delta)):
 *
 *   vc.update(delta);
 */

import { VehicleMode } from './VehicleState.js';

// ── Constants ──────────────────────────────────────────────────────────────

const CARJACK_RANGE_SQ = 64 * 64;   // px² — how close Donny must be
const STEER_DEADZONE   = 0.15;       // thumbstick dead-zone

// ── Helpers ────────────────────────────────────────────────────────────────

function angleLerp (from, to, t) {
  let diff = to - from;
  while (diff >  Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  return from + diff * t;
}

// ── Class ─────────────────────────────────────────────────────────────────

export default class VehicleController {
  /**
   * @param {Phaser.Scene}           scene
   * @param {import('./VehicleState').default} vehicleState
   * @param {object|null}            mobileControls
   *   Expected interface:
   *     mobileControls.aDown     {boolean}  A button pressed
   *     mobileControls.bDown     {boolean}  B button pressed
   *     mobileControls.stickX    {number}   -1..1 from thumbstick X axis
   */
  constructor (scene, vehicleState, mobileControls = null) {
    this.scene          = scene;
    this.vehicleState   = vehicleState;
    this.mobileControls = mobileControls;

    /** Called with the new VehicleRecord when carjacking succeeds */
    this._carjackCallback = null;

    // Keyboard cursors + WASD
    this._cursors = scene.input.keyboard
      ? scene.input.keyboard.createCursorKeys()
      : null;
    this._wasd = scene.input.keyboard
      ? scene.input.keyboard.addKeys({ up:'W', down:'S', left:'A', right:'D' })
      : null;

    // Carjack key (E or tap on vehicle icon — mobile handles via button)
    this._carjackKey = scene.input.keyboard
      ? scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E)
      : null;

    /** Mobile carjack button — set via setMobileCarjackTrigger() */
    this._mobileCarjackDown = false;

    /** Donny's foot-sprite (used for proximity carjack check) */
    this._playerSprite = null;
  }

  // ── Public API ──────────────────────────────────────────────────────────

  /**
   * Provide Donny's walking sprite so proximity checks work.
   * @param {Phaser.GameObjects.Sprite} sprite
   */
  setPlayerSprite (sprite) {
    this._playerSprite = sprite;
  }

  /**
   * Register a callback invoked after successful carjacking.
   * @param {function(import('./VehicleState').VehicleRecord):void} cb
   */
  setCarjackCallback (cb) {
    this._carjackCallback = cb;
  }

  /**
   * Call from your mobile UI button's pointerdown/pointerup handlers
   * to drive the carjack action.
   * @param {boolean} isDown
   */
  setMobileCarjackTrigger (isDown) {
    this._mobileCarjackDown = isDown;
  }

  // ── Per-frame update ────────────────────────────────────────────────────

  /**
   * @param {number} delta  Phaser delta in milliseconds
   */
  update (delta) {
    const dt = delta / 1000;   // seconds

    this._handleCarjackInput();

    const pv = this.vehicleState.getPlayerVehicle();
    if (!pv || pv.mode !== VehicleMode.PLAYER) return;

    const ps      = pv.player;   // ONLY the player namespace
    const sprite  = pv.sprite;
    if (!sprite || !sprite.active) return;

    // ── Read input ──────────────────────────────────────────────────────

    const accel  = this._readAccelerate();
    const brake  = this._readBrake();
    const steerX = this._readSteerX();      // -1 = left, +1 = right

    ps.accelerating = accel;
    ps.braking      = brake;
    ps.steerInput   = steerX;

    // ── Speed ───────────────────────────────────────────────────────────

    if (accel && !brake) {
      ps.playerSpeed = Math.min(
        ps.playerSpeed + ps.acceleration * dt,
        ps.maxSpeed
      );
    } else if (brake) {
      if (ps.playerSpeed > 0) {
        // Forward braking
        ps.playerSpeed = Math.max(0, ps.playerSpeed - ps.brakeForce * dt);
      } else {
        // Reverse
        ps.playerSpeed = Math.max(-ps.reverseSpeed,
          ps.playerSpeed - ps.acceleration * dt);
      }
    } else {
      // Coast / natural decel
      if (ps.playerSpeed > 0) {
        ps.playerSpeed = Math.max(0, ps.playerSpeed - 60 * dt);
      } else if (ps.playerSpeed < 0) {
        ps.playerSpeed = Math.min(0, ps.playerSpeed + 60 * dt);
      }
    }

    // ── Steering ────────────────────────────────────────────────────────
    // Only turn when moving; direction flips in reverse.
    // No drag-style steering — direct axis input only.

    const steerFactor = Math.abs(ps.playerSpeed) > 10
      ? Math.sign(ps.playerSpeed)
      : 0;

    if (Math.abs(steerX) > STEER_DEADZONE) {
      const turn = steerX * ps.turnRate * dt * steerFactor;
      ps.playerHeading += turn;
    }

    // ── Apply to sprite ─────────────────────────────────────────────────

    const vx = Math.cos(ps.playerHeading) * ps.playerSpeed;
    const vy = Math.sin(ps.playerHeading) * ps.playerSpeed;

    sprite.x += vx * dt;
    sprite.y += vy * dt;

    // Rotate sprite to match heading (assumes right = 0 rad in your atlas)
    sprite.rotation = ps.playerHeading;
  }

  // ── Carjacking ──────────────────────────────────────────────────────────

  _handleCarjackInput () {
    const keyPressed    = this._carjackKey && Phaser.Input.Keyboard.JustDown(this._carjackKey);
    const mobilePressed = this._mobileCarjackDown;

    if (!keyPressed && !mobilePressed) return;
    this._mobileCarjackDown = false;  // consume event

    const pv = this.vehicleState.getPlayerVehicle();

    if (pv) {
      // Already in a vehicle — exit it
      this._exitVehicle(pv);
    } else {
      // On foot — try to enter nearest vehicle
      this._enterNearestVehicle();
    }
  }

  /**
   * Exit the current player vehicle: Donny walks away,
   * vehicle reverts to idle/parked AI.
   */
  _exitVehicle (pv) {
    pv.mode          = VehicleMode.PARKED;
    pv.isPlayerOwned = false;
    // Reset player heading state so the vehicle sits still
    pv.player.playerSpeed = 0;
    pv.player.steerInput  = 0;

    // Move Donny next to the vehicle door
    if (this._playerSprite && pv.sprite) {
      this._playerSprite.x = pv.sprite.x + 40;
      this._playerSprite.y = pv.sprite.y;
      this._playerSprite.setVisible(true);
    }

    // Clear the player vehicle — Donny is now on foot
    // (VehicleState doesn't hold a "no vehicle" concept explicitly;
    //  we set _playerVehicleId to null by accessing internal property)
    this.vehicleState._playerVehicleId = null;
  }

  /**
   * Find the closest traffic vehicle within CARJACK_RANGE_SQ
   * and transfer control to it.
   */
  _enterNearestVehicle () {
    const donny = this._playerSprite;
    if (!donny) return;

    let best     = null;
    let bestDist = CARJACK_RANGE_SQ;

    for (const v of this.vehicleState.getTrafficVehicles()) {
      if (!v.sprite || !v.sprite.active) continue;
      const dx = v.sprite.x - donny.x;
      const dy = v.sprite.y - donny.y;
      const d  = dx * dx + dy * dy;
      if (d < bestDist) { bestDist = d; best = v; }
    }

    if (!best) return;

    // Transfer control — ALL other traffic vehicles are untouched
    this.vehicleState.setPlayerVehicle(best.id);

    // Hide Donny (he's inside the car)
    if (donny) donny.setVisible(false);

    if (this._carjackCallback) this._carjackCallback(best);
  }

  // ── Input readers ────────────────────────────────────────────────────────

  _readAccelerate () {
    if (this.mobileControls && this.mobileControls.aDown) return true;
    if (this._cursors && this._cursors.up.isDown) return true;
    if (this._wasd && this._wasd.up.isDown) return true;
    return false;
  }

  _readBrake () {
    if (this.mobileControls && this.mobileControls.bDown) return true;
    if (this._cursors && this._cursors.down.isDown) return true;
    if (this._wasd && this._wasd.down.isDown) return true;
    return false;
  }

  _readSteerX () {
    // Mobile thumbstick takes priority
    if (this.mobileControls && Math.abs(this.mobileControls.stickX) > STEER_DEADZONE) {
      return Math.max(-1, Math.min(1, this.mobileControls.stickX));
    }
    // Keyboard
    let x = 0;
    if (this._cursors) {
      if (this._cursors.left.isDown)  x -= 1;
      if (this._cursors.right.isDown) x += 1;
    }
    if (this._wasd) {
      if (this._wasd.left.isDown)  x -= 1;
      if (this._wasd.right.isDown) x += 1;
    }
    return Math.max(-1, Math.min(1, x));
  }
}
