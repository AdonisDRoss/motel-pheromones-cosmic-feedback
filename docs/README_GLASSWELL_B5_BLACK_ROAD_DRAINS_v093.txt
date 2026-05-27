GLASSWELL_B5 — BLACK ROAD DRAINS
Runtime Layer Pack v093

Purpose:
Add the hidden Black Road drain connector between B4, C5, future A5, and future B6.

Runtime files:
- assets/maps/dust9/glasswell/b5/layers/GLASSWELL_B5_base.png
- assets/maps/dust9/glasswell/b5/layers/GLASSWELL_B5_foreground_overlay.png
- assets/maps/dust9/glasswell/b5/masks/GLASSWELL_B5_collision_mask.png

Preview:
- docs/GLASSWELL_B5_preview_v093.png

Design:
B5 is the hidden Black Road drain layer:
flooded drain channel, raised platforms, dead-drop station, crawl deck,
lower Black Road cell, Sable/Deep Lantern rescue marks, and utility spillover.

Routes:
- North: GLASSWELL_B4 Black Road Cut
- East: GLASSWELL_C5 Transit Drain Market
- West: future A5 Badlands Drain Route
- South: future B6 Lower Black Road

Gameplay hooks:
- Black Road dead-drop event
- Lower Black Road cell event
- Crawl deck event
- Flooded Black Road warning
- Hidden rescue mark

Install:
Unzip into repo root so assets/ and docs/ merge.

Git:
git add assets/maps/dust9/glasswell/b5 docs
git commit -m "Add B5 Black Road Drains runtime layer pack v093"
git push

Locked rule:
Do not remove existing index assets without asking. Add/replace only intentional B5 files.
