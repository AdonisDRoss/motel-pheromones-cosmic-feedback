GLASSWELL_A3 — DRYLINE OUTER ROUTE
Runtime Layer Pack v080

Purpose:
Add the outer Dryline route north of A4 and west of B3.

Runtime files:
- assets/maps/dust9/glasswell/a3/layers/GLASSWELL_A3_base.png
- assets/maps/dust9/glasswell/a3/layers/GLASSWELL_A3_foreground_overlay.png
- assets/maps/dust9/glasswell/a3/masks/GLASSWELL_A3_collision_mask.png

Preview:
- docs/GLASSWELL_A3_preview_v080.png

Design:
A3 is an outer Dust-9 road route with Black Road lookout, Sable Kin scout cache,
route signal gate, tanker route booth, windblown sand, and Astro Van escape lanes.

Routes:
- South: GLASSWELL_A4 Badlands Cut
- East: GLASSWELL_B3 Dryline Outer Road
- West: future Outer Badlands
- North: future A2 Dryline north route

Gameplay hooks:
- Dryline escape route
- Sable scout cache event
- Route signal gate bypass
- Tanker route event
- Dryline route mark

Install:
Unzip into repo root so assets/ and docs/ merge.

Git:
git add assets/maps/dust9/glasswell/a3 docs
git commit -m "Add A3 Dryline Outer Route runtime layer pack v080"
git push

Locked rule:
Do not remove existing index assets without asking. Add/replace only intentional A3 files.
