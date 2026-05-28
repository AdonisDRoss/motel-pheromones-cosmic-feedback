GLASSWELL CITY RUNTIME TEST BUILD v124

Purpose:
Playable Glasswell city boundary test with:
- Donny real sprite auto-detect
- Donny Astro Van asset included
- Enter/exit van test
- Boundaries/collision masks active

Open:
- /glasswell-test.html

This does NOT replace your main index.html.

Controls:
- WASD / arrows = move
- SHIFT = dash
- E = enter/exit Astro Van
- M = collision mask overlay
- L = chunk labels
- R = reset to C3
- mouse wheel = zoom

Touch:
- left joystick = move
- E = enter/exit van
- M = mask
- L = labels
- R = reset

Install:
unzip glasswell_city_runtime_test_build_v124.zip
git status
git add glasswell-test.html scripts/glasswell_city_test.js assets/maps/dust9/glasswell assets/vehicles/donny_astro_van docs
git commit -m "Add Glasswell city runtime test build v124 with Donny and Astro Van"
git push

Do not delete your whole map directory.
Merge this package into the repo root. It should overwrite same-named Glasswell test files only.
If git status shows unrelated deleted files, stop before committing.
