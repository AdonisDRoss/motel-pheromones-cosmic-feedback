GLASSWELL_D4 — VENDOR BACKROUTE / CHECKPOINT BACKLOT
Runtime Layer Pack v088

Purpose:
Fill the connector between C4, D3, E4, and D5.

Runtime files:
- assets/maps/dust9/glasswell/d4/layers/GLASSWELL_D4_base.png
- assets/maps/dust9/glasswell/d4/layers/GLASSWELL_D4_foreground_overlay.png
- assets/maps/dust9/glasswell/d4/masks/GLASSWELL_D4_collision_mask.png

Preview:
- docs/GLASSWELL_D4_preview_v088.png

Design:
D4 is the back side of the checkpoint and vendor district:
vendor loading office, logistics gate, service cellar, checkpoint spillover,
overflow cage, seized vendor goods pad, alley awnings, hidden route marks,
loading clutter, and service lanes.

Routes:
- North: GLASSWELL_D3 Red Concord Checkpoint
- West: GLASSWELL_C4 Transit Vendor Square
- East: GLASSWELL_E4 Logistics Route
- South: GLASSWELL_D5 Pressure Service Route

Gameplay hooks:
- Vendor backroute trade
- Checkpoint spillover event
- Logistics gate event
- Service cellar event
- Hidden backroute mark

Install:
Unzip into repo root so assets/ and docs/ merge.

Git:
git add assets/maps/dust9/glasswell/d4 docs
git commit -m "Add D4 Vendor Backroute Checkpoint Backlot runtime layer pack v088"
git push

Locked rule:
Do not remove existing index assets without asking. Add/replace only intentional D4 files.
