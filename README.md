# Cosmic Feedback — Glasswell Westgate Distortion Test

Repo-ready Phaser test build.

## Start

Donny starts outside **Westgate** in the late-game Aurelix prototype car:

- Brand: Aurelix Motorworks
- Model: Distortion
- Class: Prototype sports car

## Wired map so far

- Westgate → Night Market / Blacklight Kids connector
- Southgate → Main checkpoint / Drip Saints connector
- Eastgate → Industrial Oversight / Rust Jackals connector
- Northgate → Closed / future Black Road route

## Mechanics included

- Driveable Distortion prototype
- Westgate spawn
- Full freeway ring overview map
- Gate zone prompts
- Fuel system
- Five fuel station zones
- Vehicle HUD
- Transparent headlights
- Runtime smoke
- Runtime tire tracks
- Engine, boost, refuel audio

## Controls

Keyboard:
- WASD / Arrow keys = drive
- Shift = Distortion Boost
- Space = brake
- E = refuel / gate info
- H = toggle headlights

Mobile:
- Left circular joystick = steer / directional input
- A = gas
- B = brake
- X = refuel / gate info
- Y = headlights
- R = Distortion Boost

## Install

Upload the contents of this package to the repository root.

Entry point:

```text
index.html
```

## Notes

This is a playable wiring package using the current master freeway overview as a single test map. The source packs are included for manual installation of individual road, gate, vehicle, and sprite assets later.


## Full-map / traffic update

This package now includes the major map packs extracted under:

```text
assets/maps/dust9/glasswell/all_chunks/
```

Included/active in the test scene:

- All current Southgate, Westgate, Eastgate, Northgate, road/highway, vehicle, sprite, audio, and gang source packs
- AI civilian traffic driving the freeway loop
- Red Concord / Civic Patrol police vehicles driving the freeway loop
- EMS vehicles driving the freeway loop
- Pedestrians placed near gate/checkpoint areas
- P key toggles a police siren/wanted test

Important: the active playable map is still the master freeway overview for testing. The real individual chunks, base layers, overlays, and collision masks are included in the repo tree for the next index pass.


## Full index update

The root `index.html` now contains the full Phaser code inline. Uploading the package contents to the repository root should run directly from `index.html`.

Also included:

```text
index-linked.html
src/main.js
src/mapChunkRegistry.json
```

Current active playable layer:

```text
assets/maps/dust9/glasswell/GLASSWELL_FREEWAY_RING_WIRED_TEST_MAP.png
```

Current extracted chunk count in registry: 17
