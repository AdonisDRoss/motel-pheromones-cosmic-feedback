GLASSWELL_D5 — PRESSURE SERVICE ROUTE
Runtime Layer Pack v091

Purpose:
Add the pressure-service connector between D4, C5, E5, and future D6.

Runtime files:
- assets/maps/dust9/glasswell/d5/layers/GLASSWELL_D5_base.png
- assets/maps/dust9/glasswell/d5/layers/GLASSWELL_D5_foreground_overlay.png
- assets/maps/dust9/glasswell/d5/masks/GLASSWELL_D5_collision_mask.png

Preview:
- docs/GLASSWELL_D5_preview_v091.png

Design:
D5 is a water-pressure / service infrastructure route:
pressure reader, valve-control pad, pipe cellar, Red utility patrol cage,
service office, valve office, pipe banks, fuel tanks, pylons, and hidden rescue marks.

Routes:
- North: GLASSWELL_D4 Vendor Backroute / Checkpoint Backlot
- West: GLASSWELL_C5 Transit Drain Market
- East: GLASSWELL_E5 Custody Convoy Yard
- South: future D6 Pressure Pipeworks

Gameplay hooks:
- Pressure reader event
- Valve array event
- Utility cage event
- Pipe cellar event
- Hidden pressure rescue mark

Install:
Unzip into repo root so assets/ and docs/ merge.

Git:
git add assets/maps/dust9/glasswell/d5 docs
git commit -m "Add D5 Pressure Service Route runtime layer pack v091"
git push

Locked rule:
Do not remove existing index assets without asking. Add/replace only intentional D5 files.
