DONNY ASTRO VAN — PHASER SPRITE SHEET v062

Purpose:
Convert the uploaded Donny Astro Van four-frame image into clean transparent Phaser-ready files.

Runtime sheet:
assets/vehicles/donny_astro_van/donny_astro_van_4frame_sheet_1024x512.png

Frame size:
256x512

Frame order:
0 — main body / doors closed
1 — shadow delta
2 — interior / doors open delta
3 — damage delta

Also included:
- individual frame PNGs
- smaller 512x256 quick-test sheet
- metadata JSON
- preview image

Phaser loading example:
this.load.spritesheet(
  'donnyAstroVan',
  'assets/vehicles/donny_astro_van/donny_astro_van_4frame_sheet_1024x512.png',
  { frameWidth: 256, frameHeight: 512 }
);

Runtime notes:
- Use frame 0 as the default van body.
- Use frame 1 as a separate shadow layer below the van if desired.
- Use frame 2 when doors are open/interior is shown.
- Use frame 3 as damage overlay or damaged state.
- Keep origin at 0.5, 0.5.
- Depth sort by Y: van.setDepth(van.y + 280).
- Keep the physics body smaller than the visible van.
- All frames were centered and converted to true RGBA transparency.

Install:
Unzip into repo root so assets/ and docs/ merge.

Git:
git add assets/vehicles/donny_astro_van docs
git commit -m "Add Donny Astro Van Phaser sprite sheet v062"
git push
