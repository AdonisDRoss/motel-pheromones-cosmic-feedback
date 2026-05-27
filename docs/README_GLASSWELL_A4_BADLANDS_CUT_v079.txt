GLASSWELL_A4 — BADLANDS CUT
Runtime Layer Pack v079

Purpose:
Add the western badlands cut connecting A5 and B4.

Runtime files:
- assets/maps/dust9/glasswell/a4/layers/GLASSWELL_A4_base.png
- assets/maps/dust9/glasswell/a4/layers/GLASSWELL_A4_foreground_overlay.png
- assets/maps/dust9/glasswell/a4/masks/GLASSWELL_A4_collision_mask.png

Preview:
- docs/GLASSWELL_A4_preview_v079.png

Design:
A4 is the badlands-facing Black Road route between A5 and B4:
scout post, culvert gate, Sable water cache, smuggler ramp, patrol spillover,
sand drifts, pipe clutter, and escape lanes.

Routes:
- South: GLASSWELL_A5 Outer Drain Cut
- East: GLASSWELL_B4 Black Road Cut
- West: future Outer Badlands
- North: future A3 Dryline outer route

Gameplay hooks:
- Badlands escape route
- Sable water cache event
- Culvert gate bypass
- Smuggler ramp event
- Badlands route mark

Install:
Unzip into repo root so assets/ and docs/ merge.

Git:
git add assets/maps/dust9/glasswell/a4 docs
git commit -m "Add A4 Badlands Cut runtime layer pack v079"
git push

Locked rule:
Do not remove existing index assets without asking. Add/replace only intentional A4 files.
