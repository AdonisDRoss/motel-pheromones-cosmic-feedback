GLASSWELL CITY RUNTIME TEST BUILD v122

Purpose:
A playable test build for the current 21-cell Glasswell city art pass with collision boundaries active.

Open:
- Upload this package into your repo root.
- Visit:
  /glasswell-test.html

This does NOT replace your main index.html.

Included:
- 21 Glasswell runtime cells.
- Base layers.
- Foreground overlays.
- Collision masks.
- Phaser test page.
- Pixel-sampled mask collision.
- Donny placeholder.
- Astro Van placeholder toggle.
- Camera follow.
- Chunk labels.
- Collision mask overlay toggle.

Controls:
Keyboard:
- WASD / arrows: move
- SHIFT: dash
- V: toggle Donny / Astro Van placeholder
- M: toggle collision mask overlay
- L: toggle chunk labels
- R: reset to C3 Main Civic Gate
- mouse wheel: zoom

Touch:
- left joystick: move
- V button: toggle Donny / Astro Van
- M button: toggle mask overlay
- L button: toggle labels
- R button: reset

Install:
unzip glasswell_city_runtime_test_build_v122.zip
git status
git add glasswell-test.html scripts/glasswell_city_test.js assets/maps/dust9/glasswell docs
git commit -m "Add Glasswell city runtime test build v122"
git push

GitHub Pages:
After pushing, open:
/glasswell-test.html

Notes:
- Collision uses the black/white collision masks. White = passable, black = blocked.
- Some generated cells were extracted from layout sheets. This is good enough for city flow testing.
- Later cleanup pass should remove any visible labels/artifacts and add real gate logic/FX.
