GLASSWELL_C5 — TRANSIT DRAIN MARKET
Runtime Layer Pack v092

Purpose:
Add the drain-market connector between C4, B5, D5, and future C6.

Runtime files:
- assets/maps/dust9/glasswell/c5/layers/GLASSWELL_C5_base.png
- assets/maps/dust9/glasswell/c5/layers/GLASSWELL_C5_foreground_overlay.png
- assets/maps/dust9/glasswell/c5/masks/GLASSWELL_C5_collision_mask.png

Preview:
- docs/GLASSWELL_C5_preview_v092.png

Design:
C5 is an old flooded transit drain turned into a survival market:
raised market platforms, drain stalls, Sable water cache, pressure-valve deck,
Black Road crawl marks, flooded center channel, and Red utility spillover.

Routes:
- North: GLASSWELL_C4 Transit Vendor Square
- West: GLASSWELL_B5 Black Road Drains
- East: GLASSWELL_D5 Pressure Service Route
- South: future C6 Lower Drain Line

Gameplay hooks:
- Drain market trade
- Sable water cache event
- Drain valve deck event
- Flooded channel warning
- Hidden drain mark

Install:
Unzip into repo root so assets/ and docs/ merge.

Git:
git add assets/maps/dust9/glasswell/c5 docs
git commit -m "Add C5 Transit Drain Market runtime layer pack v092"
git push

Locked rule:
Do not remove existing index assets without asking. Add/replace only intentional C5 files.
