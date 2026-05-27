GLASSWELL_C2 — CIVIC ADMIN STREET
Runtime Layer Pack v085

Purpose:
Replace C2 placeholder/greybox art with proper runtime art.

Runtime files:
- assets/maps/dust9/glasswell/c2/layers/GLASSWELL_C2_base.png
- assets/maps/dust9/glasswell/c2/layers/GLASSWELL_C2_foreground_overlay.png
- assets/maps/dust9/glasswell/c2/masks/GLASSWELL_C2_collision_mask.png

Preview:
- docs/GLASSWELL_C2_preview_v085.png

Design:
C2 is the civic paperwork layer north of the Main Civic Gate:
Civic Registry, House Varric Water-Credit Hall, ration/water-credit counter,
records impound, clerk cellar, queue rails, scanner kiosks, and overhead pipes.

Routes:
- South: GLASSWELL_C3 Main Civic Gate
- West: future B2 admin service cut
- East: future D2 upper checkpoint/admin route
- North: future C1 Civic Hall route

Gameplay hooks:
- Ration counter event
- Registry bypass
- Varric water-credit event
- Records impound event
- Hidden admin mark

Install:
Unzip into repo root so assets/ and docs/ merge.

Git:
git add assets/maps/dust9/glasswell/c2 docs
git commit -m "Upgrade C2 Civic Admin Street runtime layer pack v085"
git push

Locked rule:
Do not remove existing index assets without asking. This intentionally replaces only C2 placeholder art files.
