GLASSWELL_A5 — BADLANDS DRAIN ROUTE
Runtime Layer Pack v094

Purpose:
Extend B5 Black Road Drains west into the Dust-9 badlands edge.

Runtime files:
- assets/maps/dust9/glasswell/a5/layers/GLASSWELL_A5_base.png
- assets/maps/dust9/glasswell/a5/layers/GLASSWELL_A5_foreground_overlay.png
- assets/maps/dust9/glasswell/a5/masks/GLASSWELL_A5_collision_mask.png

Preview:
- docs/GLASSWELL_A5_preview_v094.png

Design:
A5 is the outer escape side of the lower drain network:
badlands culvert road, rusted service bridge, flooded drain mouth,
smuggler dead-drop station, crawl deck, Sable water-cache cell,
abandoned utility pads, and hidden Black Road/Deep Lantern route marks.

Routes:
- East: GLASSWELL_B5 Black Road Drains
- West: future outer badlands
- North: future A4 Badlands Service Cut
- South: future A6 Lower Badlands Culvert

Gameplay hooks:
- Badlands escape event
- Badlands dead-drop event
- Sable cache event
- Smuggler crawl deck event
- Flooded culvert warning

Install:
Unzip into repo root so assets/ and docs/ merge.

Git:
git add assets/maps/dust9/glasswell/a5 docs
git commit -m "Add A5 Badlands Drain Route runtime layer pack v094"
git push

Locked rule:
Do not remove existing index assets without asking. Add/replace only intentional A5 files.
