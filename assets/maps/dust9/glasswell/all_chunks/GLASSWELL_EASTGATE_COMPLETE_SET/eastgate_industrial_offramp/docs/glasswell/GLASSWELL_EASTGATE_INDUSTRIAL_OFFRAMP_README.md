# GLASSWELL_EASTGATE_INDUSTRIAL_OFFRAMP

Type: industrial_gate_road_cell  
Role: Eastgate industrial entrance with Industrial Oversight door and Red Concord control.

## Included

- `assets/maps/dust9/glasswell/eastgate_industrial_offramp/layers/GLASSWELL_EASTGATE_INDUSTRIAL_OFFRAMP_base.png`
- `assets/maps/dust9/glasswell/eastgate_industrial_offramp/layers/GLASSWELL_EASTGATE_INDUSTRIAL_OFFRAMP_foreground_overlay.png`
- `assets/maps/dust9/glasswell/eastgate_industrial_offramp/masks/GLASSWELL_EASTGATE_INDUSTRIAL_OFFRAMP_collision_mask.png`

## Final aligned size

1254x1254

## Collision

- white = drivable / walkable
- black = blocked

## Layer order recommendation

```js
base
vehicles / Donny / NPCs
foreground_overlay
```

## Notes

- Vehicle-access outer-road/industrial gate chunk.
- Industrial Oversight door is the major transition point.
- Use invisible Red Concord detection cones later for cameras, gate posts, and scan zones.
- Use road override rectangles in Phaser if thin painted/collision artifacts snag Donny's van.
- Doors/gates that open/close should become separate interactive assets later.
