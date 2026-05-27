GLASSWELL_D1 — ADMIN ROOFTOP SERVICE ROUTE
Runtime Layer Pack v068

Purpose:
Add an elevated admin-service route connecting C1 and D2.

Runtime files:
- assets/maps/dust9/glasswell/d1/layers/GLASSWELL_D1_base.png
- assets/maps/dust9/glasswell/d1/layers/GLASSWELL_D1_foreground_overlay.png
- assets/maps/dust9/glasswell/d1/masks/GLASSWELL_D1_collision_mask.png

Design:
D1 is a rooftop/service deck above the admin district with pipe bridges,
surveillance pylons, monitor rooms, relay station access, ladder wells, and
Varric roof access.

Routes:
- West: GLASSWELL_C1 Civic Admin Core
- South: GLASSWELL_D2 Varric Service Alley
- East: future E1 surveillance roofs
- North: future D0 upper rooftops

Gameplay hooks:
- Disable admin surveillance
- Tap relay station
- Rooftop escape route
- Varric roof access
- Deep Lantern rooftop mark

Install:
Unzip into repo root so assets/ and docs/ merge.

Git:
git add assets/maps/dust9/glasswell/d1 docs
git commit -m "Add D1 Admin Rooftop Service runtime layer pack v068"
git push

Locked rule:
Do not remove existing index assets without asking. Add/replace only intentional D1 files.
