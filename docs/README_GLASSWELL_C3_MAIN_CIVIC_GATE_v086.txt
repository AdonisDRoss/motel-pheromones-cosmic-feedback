GLASSWELL_C3 — MAIN CIVIC GATE
Runtime Layer Pack v086

Purpose:
Upgrade the core playable hub C3 with final usable Phaser-ready map art.

Runtime files:
- assets/maps/dust9/glasswell/c3/layers/GLASSWELL_C3_base.png
- assets/maps/dust9/glasswell/c3/layers/GLASSWELL_C3_foreground_overlay.png
- assets/maps/dust9/glasswell/c3/masks/GLASSWELL_C3_collision_mask.png

Preview:
- docs/GLASSWELL_C3_preview_v086.png

Design:
C3 is the main civic gate: Red Concord arch, scanner/ration gate,
Dryline intake office, checkpoint pressure office, House Varric annex,
vendor underdoor, impound spillover, queue rails, pylons, and unauthorized door marks.

Routes:
- West: GLASSWELL_B3 Dryline Outer Road
- East: GLASSWELL_D3 Red Concord Checkpoint
- North: GLASSWELL_C2 Civic Admin Street
- South: GLASSWELL_C4 Transit Vendor Square

Gameplay hooks:
- Main gate pressure event
- Dryline intake event
- Checkpoint pressure event
- Varric annex event
- Unauthorized door mark

Install:
Unzip into repo root so assets/ and docs/ merge.

Git:
git add assets/maps/dust9/glasswell/c3 docs
git commit -m "Upgrade C3 Main Civic Gate runtime layer pack v086"
git push

Locked rule:
Do not remove existing index assets without asking. This intentionally replaces only C3 map art files.
