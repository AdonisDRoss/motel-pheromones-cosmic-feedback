# GLASSWELL CITY UPLOAD BUILD v095

## What this package is

Repo-ready Glasswell city upload package for:

`AdonisDRoss/motel-pheromones-cosmic-feedback`

It includes all latest map chunks currently available in this workspace:

C1 v067, D1 v068, E1 v070, C2 v085, D2 v066, E2 v069, A3 v080, B3 v082, C3 v086, D3 v084, E3 v087, A4 v079, B4 v081, C4 v083, D4 v088, E4 v089, A5 v094, B5 v093, C5 v092, D5 v091, E5 v090

## Install location

Unzip this package into the repo root.

Correct result:

```txt
assets/maps/dust9/glasswell/
docs/
scripts/
glasswell-city-test.html
```

## Safe upload command

From repo root:

```bash
unzip glasswell_city_upload_build_v095.zip
git status
git add assets/maps/dust9/glasswell docs scripts/glasswell_city_manifest_loader_v095.js glasswell-city-test.html
git commit -m "Add Glasswell city upload build v095"
git push
```

## Test URL after GitHub Pages updates

```txt
https://AdonisDRoss.github.io/motel-pheromones-cosmic-feedback/glasswell-city-test.html?v=095
```

## What to test first

1. Page loads without black screen.
2. `GLASSWELL_C3` appears and labels show.
3. WASD/arrows move the cyan test marker.
4. Camera can travel across all loaded chunks.
5. Base layers and foreground overlays both render.
6. No missing image icons in browser console.
7. The city layout makes sense before connecting this into the main `index.html`.

## Do not do yet

Do not replace `index.html` until the standalone city test loads correctly.

## Main runtime files added

```txt
assets/maps/dust9/glasswell/glasswell_city_manifest_v095.json
assets/maps/dust9/glasswell/page_registry_v095.json
scripts/glasswell_city_manifest_loader_v095.js
glasswell-city-test.html
```
