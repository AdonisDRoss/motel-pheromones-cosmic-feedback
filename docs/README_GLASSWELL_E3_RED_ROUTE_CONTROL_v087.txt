GLASSWELL_E3 — RED ROUTE CONTROL
Runtime Layer Pack v087

Purpose:
Add Red Route Control east of D3.

Runtime files:
- assets/maps/dust9/glasswell/e3/layers/GLASSWELL_E3_base.png
- assets/maps/dust9/glasswell/e3/layers/GLASSWELL_E3_foreground_overlay.png
- assets/maps/dust9/glasswell/e3/masks/GLASSWELL_E3_collision_mask.png

Preview:
- docs/GLASSWELL_E3_preview_v087.png

Design:
E3 is a Red Concord road-authority / route-control layer:
route-control tower, checkpoint handoff office, route reader, signal relay bank,
dispatch room, routing seizure cage, scanner lanes, barricades, and road-law pylons.

Routes:
- West: GLASSWELL_D3 Red Concord Checkpoint
- South: GLASSWELL_E4 Logistics Route
- East: future F3 Red Road Authority
- North: future E2 Upper Route Control

Gameplay hooks:
- Route reader event
- Handoff office bypass
- Signal relay event
- Routing seizure event
- Hidden Red Route mark

Install:
Unzip into repo root so assets/ and docs/ merge.

Git:
git add assets/maps/dust9/glasswell/e3 docs
git commit -m "Add E3 Red Route Control runtime layer pack v087"
git push

Locked rule:
Do not remove existing index assets without asking. Add/replace only intentional E3 files.
