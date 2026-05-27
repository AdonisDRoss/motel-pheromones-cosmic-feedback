GLASSWELL_B3 — DRYLINE OUTER ROAD
Runtime Layer Pack v082

Purpose:
Replace the old B3 placeholder/test route with proper runtime art.

Runtime files:
- assets/maps/dust9/glasswell/b3/layers/GLASSWELL_B3_base.png
- assets/maps/dust9/glasswell/b3/layers/GLASSWELL_B3_foreground_overlay.png
- assets/maps/dust9/glasswell/b3/masks/GLASSWELL_B3_collision_mask.png

Preview:
- docs/GLASSWELL_B3_preview_v082.png

Design:
B3 is the west Dryline road leading into the Main Civic Gate:
Sable route watch, Civic Gate pressure shed, Dryline route booth,
Black Road/Sable cache, windblown roads, road posts, and escape lanes.

Routes:
- West: GLASSWELL_A3 Dryline Outer Route
- East: GLASSWELL_C3 Main Civic Gate
- South: GLASSWELL_B4 Black Road Cut
- North: future B2 Dryline north route

Gameplay hooks:
- Dryline road entry
- Sable watch cache event
- Gate pressure bypass
- Dryline route booth event
- Hidden Dryline route mark

Install:
Unzip into repo root so assets/ and docs/ merge.

Git:
git add assets/maps/dust9/glasswell/b3 docs
git commit -m "Upgrade B3 Dryline Outer Road runtime layer pack v082"
git push

Locked rule:
Do not remove existing index assets without asking. This intentionally replaces only B3 placeholder art files.
