// Donny Phaser-ready sprite/weapon registry
// All 4dir spritesheets are 1024x512, frameWidth 128, frameHeight 128.
// Row order: 0 down, 1 right, 2 left, 3 up. Each row has 8 frames.

window.DONNY_ASSET_REGISTRY = {
  root: 'assets/sprites/player/donny/',
  frameWidth: 128,
  frameHeight: 128,
  rowOrder: ['down','right','left','up'],
  dirRow: { down:0, right:1, left:2, up:3 },
  sheets: [
    ['donny_idle_4dir',  'donny_idle_4dir.png',  8, -1, 6],
    ['donny_walk_4dir',  'donny_walk_4dir.png',  8, -1, 9],
    ['donny_run_4dir',   'donny_run_4dir.png',   8, -1, 13],
    ['donny_jump_4dir',  'donny_jump_4dir.png',  8,  0, 10],
    ['donny_slide_4dir', 'donny_slide_4dir.png', 8,  0, 14],
    ['donny_crawl_4dir', 'donny_crawl_4dir.png', 8, -1, 8],
    ['donny_punch_4dir', 'donny_punch_4dir.png', 8,  0, 13],
    ['donny_kick_4dir',  'donny_kick_4dir.png',  8,  0, 12],
    ['donny_shoot_4dir', 'donny_shoot_4dir.png', 8,  0, 13],
    ['donny_hurt_4dir',  'donny_hurt_4dir.png',  8,  0, 12],
    ['donny_sleep_4dir', 'donny_sleep_4dir.png', 8, -1, 5]
  ],
  props: {
    gun: 'props/donny_laser_gun_overlay_4dir_128.png',
    holster: 'props/donny_laser_holster_4dir_128.png'
  }
};

window.preloadDonnyAssets = function(scene, version='v1') {
  const R = window.DONNY_ASSET_REGISTRY;
  R.sheets.forEach(([key,file]) => {
    scene.load.spritesheet(key, R.root + file + '?v=' + version, {
      frameWidth: R.frameWidth,
      frameHeight: R.frameHeight
    });
  });
  scene.load.spritesheet('donny_laser_gun_overlay_4dir', R.root + R.props.gun + '?v=' + version, {
    frameWidth: 128,
    frameHeight: 128
  });
  scene.load.spritesheet('donny_laser_holster_4dir', R.root + R.props.holster + '?v=' + version, {
    frameWidth: 128,
    frameHeight: 128
  });
};

window.createDonnyAnimations = function(scene) {
  const R = window.DONNY_ASSET_REGISTRY;
  R.sheets.forEach(([sheetKey, file, cols, repeat, rate]) => {
    const animBase = sheetKey.replace('donny_', '').replace('_4dir', '');
    R.rowOrder.forEach((dir, row) => {
      const frames = [];
      for (let i = 0; i < cols; i++) {
        frames.push({ key: sheetKey, frame: row * cols + i });
      }
      const animKey = `donny_${animBase}_${dir}`;
      if (!scene.anims.exists(animKey)) {
        scene.anims.create({ key: animKey, frames, frameRate: rate, repeat });
      }
    });
  });
};
