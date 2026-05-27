GLASSWELL_E4 — LOGISTICS ROUTE
Runtime Layer Pack v089

Purpose:
Fill the logistics connector between E3, D4, E5, and future F4.

Runtime files:
- assets/maps/dust9/glasswell/e4/layers/GLASSWELL_E4_base.png
- assets/maps/dust9/glasswell/e4/layers/GLASSWELL_E4_foreground_overlay.png
- assets/maps/dust9/glasswell/e4/masks/GLASSWELL_E4_collision_mask.png

Preview:
- docs/GLASSWELL_E4_preview_v089.png

Design:
E4 is a Red Concord logistics and supply route:
convoy reader, supply authority office, convoy dispatch room, fuel depot pad,
cargo inspection zones, blockade staging, route barricades, and logistics gantry.

Routes:
- North: GLASSWELL_E3 Red Route Control
- West: GLASSWELL_D4 Vendor Backroute / Checkpoint Backlot
- South: GLASSWELL_E5 Custody Convoy Yard
- East: future F4 Red Supply Corridor

Gameplay hooks:
- Convoy reader event
- Supply authority event
- Fuel depot event
- Convoy dispatch event
- Hidden logistics mark

Install:
Unzip into repo root so assets/ and docs/ merge.

Git:
git add assets/maps/dust9/glasswell/e4 docs
git commit -m "Add E4 Logistics Route runtime layer pack v089"
git push

Locked rule:
Do not remove existing index assets without asking. Add/replace only intentional E4 files.
