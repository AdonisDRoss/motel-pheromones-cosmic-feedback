# GLASSWELL_SOUTHGATE_MAIN_PARKING_CHECKPOINT

Type: road transition cell  
Role: Southgate parking/checkpoint entrance after the offramp.

## Included layers

1. Base road/parking/checkpoint pavement
2. Road decals underlay
3. Foreground overlay assets
4. Collision mask

## Final aligned size

1254x1254

## Collision

- white = drivable / walkable
- black = blocked

## Layer order recommendation

```js
base
road_decals_underlay
vehicles / Donny / NPCs
foreground_overlay
```

## Notes

- Road decals are underlay, not blockers.
- Overlay is decorative, not collision.
- Keep both parking lot driveways drivable.
- Use Phaser road override rectangles if tiny black mask artifacts snag the van.
- Gate panels/barriers should be separate interactive assets later.
