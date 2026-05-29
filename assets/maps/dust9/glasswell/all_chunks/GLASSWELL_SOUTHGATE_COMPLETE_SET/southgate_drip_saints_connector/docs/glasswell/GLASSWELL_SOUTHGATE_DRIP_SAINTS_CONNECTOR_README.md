# GLASSWELL_SOUTHGATE_DRIP_SAINTS_CONNECTOR

Type: inner-city connector  
Role: Southgate parking/checkpoint into civic-ration alley and Drip Saints territory.

## Included

- `assets/maps/dust9/glasswell/southgate_drip_saints_connector/layers/GLASSWELL_SOUTHGATE_DRIP_SAINTS_CONNECTOR_base.png`
- `assets/maps/dust9/glasswell/southgate_drip_saints_connector/layers/GLASSWELL_SOUTHGATE_DRIP_SAINTS_CONNECTOR_foreground_overlay.png`
- `assets/maps/dust9/glasswell/southgate_drip_saints_connector/masks/GLASSWELL_SOUTHGATE_DRIP_SAINTS_CONNECTOR_collision_mask.png`

## Final aligned size

1254x1254

## Collision

- white = walkable
- black = blocked

## Layer order recommendation

```js
base
Donny / NPCs / enemies
foreground_overlay
```

## Notes

- Walk-only chunk.
- No van driving inside this connector.
- Add Red Concord invisible detection cones later in Phaser.
- Keep future open/closed gates and doors as separate interactive assets.
