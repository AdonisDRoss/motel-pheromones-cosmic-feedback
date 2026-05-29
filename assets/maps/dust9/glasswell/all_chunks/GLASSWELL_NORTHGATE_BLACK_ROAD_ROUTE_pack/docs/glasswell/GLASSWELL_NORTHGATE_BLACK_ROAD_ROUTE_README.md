# GLASSWELL_NORTHGATE_BLACK_ROAD_ROUTE

Type: broken gate / hidden route cell  
Role: Northgate collapsed checkpoint with closed official road and hidden Black Road access.

## Included

- `assets/maps/dust9/glasswell/northgate_black_road_route/layers/GLASSWELL_NORTHGATE_BLACK_ROAD_ROUTE_base.png`
- `assets/maps/dust9/glasswell/northgate_black_road_route/masks/GLASSWELL_NORTHGATE_BLACK_ROAD_ROUTE_collision_mask.png`

## Final aligned size

1536x1024

## Collision

- white = walkable / limited vehicle approach
- black = blocked rubble, walls, barricade, debris, closed checkpoint structures, rocks, trees

## Gameplay notes

- Northgate is officially closed and out of order.
- Donny's van should not be able to drive deep into this chunk.
- Rubble and collapsed road sections stop vehicle entry.
- Donny can walk up to the closed barricade.
- Donny cannot pass the barricade yet.
- Hidden Black Road foot route can unlock later.
- Add Red Concord invisible detection/warning zones later in Phaser.

## Phaser-specific rule

Use a separate vehicle-stop zone in code so the van cannot enter too far, even if the walkable mask allows Donny on foot to approach the barricade.

Suggested logic:

```js
// vehicle-only blocker; replace with tuned rectangles after image placement
const northgateVehicleStopZones = [
  { x: 0, y: 0, w: 1536, h: 1024 }
];

// player-only path:
// allow on-foot movement up to barricade,
// then block past the closed barricade line.
```

## Future reminder

Build `IMPERIAL_GALACTIC_NEWS_STATION` later as the Empire propaganda media/broadcast hub.
