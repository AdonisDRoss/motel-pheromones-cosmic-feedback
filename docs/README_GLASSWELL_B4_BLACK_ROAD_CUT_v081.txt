GLASSWELL_B4 — BLACK ROAD CUT
Runtime Layer Pack v081

Purpose:
Fill the missing connector between B3, C4, A4, and B5.

Runtime files:
- assets/maps/dust9/glasswell/b4/layers/GLASSWELL_B4_base.png
- assets/maps/dust9/glasswell/b4/layers/GLASSWELL_B4_foreground_overlay.png
- assets/maps/dust9/glasswell/b4/masks/GLASSWELL_B4_collision_mask.png

Preview:
- docs/GLASSWELL_B4_preview_v081.png

Design:
B4 is a Black Road connector cut with a route office, vendor-side sensor gate,
Sable/Deep Lantern cache, route booth, crawl doors, raised service ramps, and pipe clutter.

Routes:
- North: GLASSWELL_B3 Dryline Outer Road
- East: GLASSWELL_C4 Transit Vendor Square
- West: GLASSWELL_A4 Badlands Cut
- South: GLASSWELL_B5 Black Road Drains

Gameplay hooks:
- Black Road cut passage
- Cache room event
- Sensor gate bypass
- Route booth event
- Black Road route mark

Install:
Unzip into repo root so assets/ and docs/ merge.

Git:
git add assets/maps/dust9/glasswell/b4 docs
git commit -m "Add B4 Black Road Cut runtime layer pack v081"
git push

Locked rule:
Do not remove existing index assets without asking. Add/replace only intentional B4 files.
