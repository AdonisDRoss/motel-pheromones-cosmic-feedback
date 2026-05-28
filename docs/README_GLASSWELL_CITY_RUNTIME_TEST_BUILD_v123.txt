GLASSWELL CITY RUNTIME TEST BUILD v123

Purpose:
Playable Glasswell city boundary test using your real Donny sprite instead of the old placeholder box.

Open:
- Upload this package into your repo root.
- Visit:
  /glasswell-test.html

This does NOT replace your main index.html.

What changed from v122:
- Donny placeholder removed.
- Test page now searches common Donny sprite paths in your repo.
- First Donny sprite it finds is used in-world.
- If your exact Donny path differs, edit scripts/glasswell_city_test.js and add your path to DONNY_CANDIDATES.

Current candidate paths:
- assets/sprites/player/donny/donny_idle.png
- assets/sprites/player/donny/donny_walk.png
- assets/sprites/player/donny/donny-master.png
- assets/sprites/player/donny/movement/donny_idle.png
- assets/sprites/player/donny/movement/donny_walk.png
- assets/sprites/player/donny/combat/movement/donny_idle.png
- assets/sprites/player/donny/combat/movement/donny_walk.png
- assets/sprites/donny/donny_idle.png
- assets/sprites/donny/donny_walk.png
- assets/player/donny/donny_idle.png
- assets/player/donny/donny_walk.png

Controls:
- WASD / arrows = move
- SHIFT = dash
- M = collision mask overlay
- L = chunk labels
- R = reset to C3
- mouse wheel = zoom

Touch:
- left joystick = move
- M = mask
- L = labels
- R = reset

Install:
unzip glasswell_city_runtime_test_build_v123.zip
git add glasswell-test.html scripts/glasswell_city_test.js assets/maps/dust9/glasswell docs
git commit -m "Add Glasswell city runtime test build v123 using Donny sprite"
git push
