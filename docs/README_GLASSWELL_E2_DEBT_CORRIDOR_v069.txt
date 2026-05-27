GLASSWELL_E2 — DEBT CORRIDOR
Runtime Layer Pack v069

Purpose:
Add the House Varric / Red Concord debt-control corridor east of D2.

Runtime files:
- assets/maps/dust9/glasswell/e2/layers/GLASSWELL_E2_base.png
- assets/maps/dust9/glasswell/e2/layers/GLASSWELL_E2_foreground_overlay.png
- assets/maps/dust9/glasswell/e2/masks/GLASSWELL_E2_collision_mask.png

Design:
E2 is where debt becomes physical control: collection hall, compliance office,
water shutoff station, seized-property cage, payment queues, and patrol pressure.

Routes:
- West: GLASSWELL_D2 Varric Service Alley
- East: future F2 collection vaults
- North: future E1 surveillance roofs
- South: future E3 red route control

Gameplay hooks:
- Witness debt collection
- Override water shutoff
- Recover seized property
- Compliance office raid
- Deep Lantern debt-slip mark

Install:
Unzip into repo root so assets/ and docs/ merge.

Git:
git add assets/maps/dust9/glasswell/e2 docs
git commit -m "Add E2 Debt Corridor runtime layer pack v069"
git push

Locked rule:
Do not remove existing index assets without asking. Add/replace only intentional E2 files.
