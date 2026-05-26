# Donny Phaser-ready sprite + weapon pack

## Output format

All main Donny sheets are:

```text
1024x512 PNG
4 rows x 8 columns
128x128 frames
transparent background
```

Row order:

```text
row 0 = down/front
row 1 = right
row 2 = left
row 3 = up/back
```

## Main sprite files

```text
assets/sprites/player/donny/donny_idle_4dir.png
assets/sprites/player/donny/donny_walk_4dir.png
assets/sprites/player/donny/donny_run_4dir.png
assets/sprites/player/donny/donny_jump_4dir.png
assets/sprites/player/donny/donny_slide_4dir.png
assets/sprites/player/donny/donny_crawl_4dir.png
assets/sprites/player/donny/donny_punch_4dir.png
assets/sprites/player/donny/donny_kick_4dir.png
assets/sprites/player/donny/donny_shoot_4dir.png
assets/sprites/player/donny/donny_hurt_4dir.png
assets/sprites/player/donny/donny_sleep_4dir.png
```

Each direction also has a one-row sheet:

```text
assets/sprites/player/donny/donny_walk_down_8f.png
assets/sprites/player/donny/donny_walk_right_8f.png
...
```

## Weapon props

```text
assets/sprites/player/donny/props/donny_laser_gun_overlay_4dir_128.png
assets/sprites/player/donny/props/donny_laser_gun_hold_4dir_128.png
assets/sprites/player/donny/props/donny_laser_holster_4dir_128.png
assets/sprites/player/donny/props/donny_laser_holster_variants_4x4_128.png
```

Weapon frame order:

```text
0 = down/front
1 = right
2 = left
3 = up/back
```

The gun and holster are separate overlays, not baked into Donny.

## Phaser helper

```text
scripts/donny_asset_registry.js
```

Use:

```html
<script src="scripts/donny_asset_registry.js?v=donny-pack-001"></script>
```

In Phaser:

```js
preloadDonnyAssets(this, 'donny-pack-001');
createDonnyAnimations(this);
```

## Git upload

From repo root:

```bash
git add assets/sprites/player/donny scripts/donny_asset_registry.js docs/DONNY_SPRITE_WEAPON_PACK.md
git commit -m "Add Phaser-ready Donny sprite and weapon pack"
git push
```

## Important notes

- Backgrounds were removed into real transparent PNGs.
- Sprite cells are normalized for Phaser.
- Some actions were rebuilt from side-view/generated pages and mirrored to complete all four directions.
- The crawl sheet is usable, but the original crawl generated directly for crawling may look better if you want to swap it later.
