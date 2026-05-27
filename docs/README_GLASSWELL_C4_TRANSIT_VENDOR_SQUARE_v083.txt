GLASSWELL_C4 — TRANSIT VENDOR SQUARE
Runtime Layer Pack v083

Purpose:
Replace C4 placeholder/greybox art with proper runtime art.

Runtime files:
- assets/maps/dust9/glasswell/c4/layers/GLASSWELL_C4_base.png
- assets/maps/dust9/glasswell/c4/layers/GLASSWELL_C4_foreground_overlay.png
- assets/maps/dust9/glasswell/c4/masks/GLASSWELL_C4_collision_mask.png

Preview:
- docs/GLASSWELL_C4_preview_v083.png

Design:
C4 is the vendor/transit square south of the Main Civic Gate:
old transit platforms, vendor stalls, ration exchange, patrol confiscation bay,
Sable/Deep Lantern cellar, Black Road vendor contacts, and market-clutter vehicle lanes.

Routes:
- North: GLASSWELL_C3 Main Civic Gate
- West: GLASSWELL_B4 Black Road Cut
- East: GLASSWELL_D4 Vendor Backroute / Checkpoint Backlot
- South: GLASSWELL_C5 Transit Drain Market

Gameplay hooks:
- Vendor market trade
- Sable cellar event
- Confiscation bay event
- Vendor backroute hint
- Hidden vendor mark

Install:
Unzip into repo root so assets/ and docs/ merge.

Git:
git add assets/maps/dust9/glasswell/c4 docs
git commit -m "Upgrade C4 Transit Vendor Square runtime layer pack v083"
git push

Locked rule:
Do not remove existing index assets without asking. This intentionally replaces only C4 placeholder art files.
