GLASSWELL_E5 — CUSTODY CONVOY YARD
Runtime Layer Pack v090

Purpose:
Add the custody convoy yard south of E4.

Runtime files:
- assets/maps/dust9/glasswell/e5/layers/GLASSWELL_E5_base.png
- assets/maps/dust9/glasswell/e5/layers/GLASSWELL_E5_foreground_overlay.png
- assets/maps/dust9/glasswell/e5/masks/GLASSWELL_E5_collision_mask.png

Preview:
- docs/GLASSWELL_E5_preview_v090.png

Design:
E5 is a Red Concord custody-transfer yard:
custody van reader, prisoner-transfer holding cells, van pads, transfer holding room,
custody van lockup cage, service/fuel pads, scanner pylons, rescue marks, and convoy lanes.

Routes:
- North: GLASSWELL_E4 Logistics Route
- West: GLASSWELL_D5 Pressure Service Route
- East: future F5 Red Convoy Corridor
- South: future E6 Custody Transfer Road

Gameplay hooks:
- Custody van reader event
- Transfer cells event
- Van lockup event
- Transfer holding room event
- Hidden rescue mark

Install:
Unzip into repo root so assets/ and docs/ merge.

Git:
git add assets/maps/dust9/glasswell/e5 docs
git commit -m "Add E5 Custody Convoy Yard runtime layer pack v090"
git push

Locked rule:
Do not remove existing index assets without asking. Add/replace only intentional E5 files.
