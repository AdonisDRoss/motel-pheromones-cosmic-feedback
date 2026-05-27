GLASSWELL_D3 — RED CONCORD CHECKPOINT
Runtime Layer Pack v084

Purpose:
Replace D3 placeholder/greybox art with proper runtime art.

Runtime files:
- assets/maps/dust9/glasswell/d3/layers/GLASSWELL_D3_base.png
- assets/maps/dust9/glasswell/d3/layers/GLASSWELL_D3_foreground_overlay.png
- assets/maps/dust9/glasswell/d3/masks/GLASSWELL_D3_collision_mask.png

Preview:
- docs/GLASSWELL_D3_preview_v084.png

Design:
D3 is a militarized Red Concord checkpoint between the Main Civic Gate and Red Route Control:
gatehouse, scanner gate, search lanes, barricades, impound cage, custody backlot,
scanner pylons, and overhead checkpoint gantry.

Routes:
- West: GLASSWELL_C3 Main Civic Gate
- East: GLASSWELL_E3 Red Route Control
- South: GLASSWELL_D4 Vendor Backroute / Checkpoint Backlot
- North: future D2 Upper Checkpoint

Gameplay hooks:
- Checkpoint scan event
- Gatehouse bypass
- Vehicle impound event
- Custody service hint
- Hidden checkpoint mark

Install:
Unzip into repo root so assets/ and docs/ merge.

Git:
git add assets/maps/dust9/glasswell/d3 docs
git commit -m "Upgrade D3 Red Concord Checkpoint runtime layer pack v084"
git push

Locked rule:
Do not remove existing index assets without asking. This intentionally replaces only D3 placeholder art files.
