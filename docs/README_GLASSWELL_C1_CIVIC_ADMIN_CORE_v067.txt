GLASSWELL_C1 — CIVIC ADMIN CORE
Runtime Layer Pack v067

Purpose:
Add the admin core north of C2 Civic Admin Street.

Runtime files:
- assets/maps/dust9/glasswell/c1/layers/GLASSWELL_C1_base.png
- assets/maps/dust9/glasswell/c1/layers/GLASSWELL_C1_foreground_overlay.png
- assets/maps/dust9/glasswell/c1/masks/GLASSWELL_C1_collision_mask.png

Design:
C1 is the sealed bureaucracy core of Glasswell: permit vault, public records annex,
Red Concord admin office, sealed registry vault, and Varric ledger annex.

Routes:
- South: GLASSWELL_C2 Civic Admin Street
- West: future B1 records/service route
- East: future D1 admin rooftop/service route
- North: future C0 upper registry/locked core

Gameplay hooks:
- Registry vault access
- False identity record
- Permit vault lockdown
- Varric debt-chain tracing
- Deep Lantern record mark

Install:
Unzip into repo root so assets/ and docs/ merge.

Git:
git add assets/maps/dust9/glasswell/c1 docs
git commit -m "Add C1 Civic Admin Core runtime layer pack v067"
git push

Locked rule:
Do not remove existing index assets without asking. Add/replace only intentional C1 files.
