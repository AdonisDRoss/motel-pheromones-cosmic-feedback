GLASSWELL_E1 — SURVEILLANCE ROOFS
Runtime Layer Pack v070

Purpose:
Add the surveillance rooftop chunk connecting D1 and E2.

Runtime files:
- assets/maps/dust9/glasswell/e1/layers/GLASSWELL_E1_base.png
- assets/maps/dust9/glasswell/e1/layers/GLASSWELL_E1_foreground_overlay.png
- assets/maps/dust9/glasswell/e1/masks/GLASSWELL_E1_collision_mask.png

Preview:
- docs/GLASSWELL_E1_preview_v070.png

Design:
E1 is a rooftop surveillance zone with command room, signal tower, camera pylons,
surveillance dishes, service catwalks, and ladder routes.

Routes:
- West: GLASSWELL_D1 Admin Rooftop Service
- South: GLASSWELL_E2 Debt Corridor
- East: future F1 surveillance edge
- North: future E0 upper roofs

Gameplay hooks:
- Disable surveillance grid
- Tap signal tower
- Rooftop escape line
- Collect camera parts
- Deep Lantern roof mark

Install:
Unzip into repo root so assets/ and docs/ merge.

Git:
git add assets/maps/dust9/glasswell/e1 docs
git commit -m "Add E1 Surveillance Roofs runtime layer pack v070"
git push

Locked rule:
Do not remove existing index assets without asking. Add/replace only intentional E1 files.
