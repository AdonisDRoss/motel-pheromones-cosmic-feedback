GLASSWELL_D2 — VARRIC SERVICE ALLEY
Runtime Layer Pack v066

Purpose:
Add the House Varric service/alley infrastructure between C2 Civic Admin Street and D3 Red Concord Checkpoint.

Runtime files:
- assets/maps/dust9/glasswell/d2/layers/GLASSWELL_D2_base.png
- assets/maps/dust9/glasswell/d2/layers/GLASSWELL_D2_foreground_overlay.png
- assets/maps/dust9/glasswell/d2/masks/GLASSWELL_D2_collision_mask.png

Design:
D2 is a ledger/water-credit/debt service alley. It is where House Varric clerks,
water-credit routing, Red Concord back-service access, and false records physically connect.

Routes:
- West: GLASSWELL_C2 Civic Admin Street
- South: GLASSWELL_D3 Red Concord Checkpoint back-service
- North: future D1 admin rooftop/service route
- East: future E2 debt corridor

Gameplay hooks:
- False debt record
- Water-credit routing
- Clerk archive break-in
- Checkpoint backservice route
- Deep Lantern ledger mark

Install:
Unzip into repo root so assets/ and docs/ merge.

Git:
git add assets/maps/dust9/glasswell/d2 docs
git commit -m "Add D2 Varric Service Alley runtime layer pack v066"
git push

Locked rule:
Do not remove existing index assets without asking. Add/replace only intentional D2 files.
