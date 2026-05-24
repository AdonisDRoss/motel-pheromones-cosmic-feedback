// Riff Phaser 3 preload/create snippet
// Put preload lines in preload(), animation lines in create() after load completes.

// preload()
this.load.spritesheet('riff_movement', 'assets/sprites/companions/riff/riff_movement_8x4_222.png', { frameWidth: 222, frameHeight: 222 });
this.load.spritesheet('riff_attack', 'assets/sprites/companions/riff/riff_attack_8x4_222.png', { frameWidth: 222, frameHeight: 222 });
this.load.spritesheet('riff_actions', 'assets/sprites/companions/riff/riff_actions_8x4_222.png', { frameWidth: 222, frameHeight: 222 });
this.load.spritesheet('riff_hurt', 'assets/sprites/companions/riff/riff_hurt_8x4_222.png', { frameWidth: 222, frameHeight: 222 });
this.load.spritesheet('riff_reactions', 'assets/sprites/companions/riff/riff_reactions_8x4_222.png', { frameWidth: 222, frameHeight: 222 });
this.load.spritesheet('riff_extra_poses', 'assets/sprites/companions/riff/riff_extra_poses_8x4_222.png', { frameWidth: 222, frameHeight: 222 });
this.load.spritesheet('riff_fx_movement', 'assets/fx/companions/riff/riff_fx_movement_4x4_314.png', { frameWidth: 314, frameHeight: 314 });
this.load.spritesheet('riff_fx_attack', 'assets/fx/companions/riff/riff_fx_attack_4x4_314.png', { frameWidth: 314, frameHeight: 314 });
this.load.spritesheet('riff_fx_reactions', 'assets/fx/companions/riff/riff_fx_reactions_4x4_314.png', { frameWidth: 314, frameHeight: 314 });
this.load.spritesheet('riff_fx_actions', 'assets/fx/companions/riff/riff_fx_actions_4x4_314.png', { frameWidth: 314, frameHeight: 314 });

// create()
this.anims.create({ key: 'riff_walk_down', frames: this.anims.generateFrameNumbers('riff_movement', { start: 0, end: 7 }), frameRate: 8, repeat: -1 });
this.anims.create({ key: 'riff_walk_left', frames: this.anims.generateFrameNumbers('riff_movement', { start: 8, end: 15 }), frameRate: 8, repeat: -1 });
this.anims.create({ key: 'riff_walk_right', frames: this.anims.generateFrameNumbers('riff_movement', { start: 16, end: 23 }), frameRate: 8, repeat: -1 });
this.anims.create({ key: 'riff_walk_up', frames: this.anims.generateFrameNumbers('riff_movement', { start: 24, end: 31 }), frameRate: 8, repeat: -1 });
this.anims.create({ key: 'riff_short_down', frames: this.anims.generateFrameNumbers('riff_attack', { start: 0, end: 3 }), frameRate: 10, repeat: 0 });
this.anims.create({ key: 'riff_long_down', frames: this.anims.generateFrameNumbers('riff_attack', { start: 4, end: 7 }), frameRate: 10, repeat: 0 });
this.anims.create({ key: 'riff_short_left', frames: this.anims.generateFrameNumbers('riff_attack', { start: 8, end: 11 }), frameRate: 10, repeat: 0 });
this.anims.create({ key: 'riff_long_left', frames: this.anims.generateFrameNumbers('riff_attack', { start: 12, end: 15 }), frameRate: 10, repeat: 0 });
this.anims.create({ key: 'riff_short_right', frames: this.anims.generateFrameNumbers('riff_attack', { start: 16, end: 19 }), frameRate: 10, repeat: 0 });
this.anims.create({ key: 'riff_long_right', frames: this.anims.generateFrameNumbers('riff_attack', { start: 20, end: 23 }), frameRate: 10, repeat: 0 });
this.anims.create({ key: 'riff_short_up', frames: this.anims.generateFrameNumbers('riff_attack', { start: 24, end: 27 }), frameRate: 10, repeat: 0 });
this.anims.create({ key: 'riff_long_up', frames: this.anims.generateFrameNumbers('riff_attack', { start: 28, end: 31 }), frameRate: 10, repeat: 0 });
this.anims.create({ key: 'riff_action_scan_down', frames: this.anims.generateFrameNumbers('riff_actions', { start: 0, end: 3 }), frameRate: 8, repeat: 0 });
this.anims.create({ key: 'riff_action_use_down', frames: this.anims.generateFrameNumbers('riff_actions', { start: 4, end: 7 }), frameRate: 8, repeat: 0 });
this.anims.create({ key: 'riff_action_scan_left', frames: this.anims.generateFrameNumbers('riff_actions', { start: 8, end: 11 }), frameRate: 8, repeat: 0 });
this.anims.create({ key: 'riff_action_use_left', frames: this.anims.generateFrameNumbers('riff_actions', { start: 12, end: 15 }), frameRate: 8, repeat: 0 });
this.anims.create({ key: 'riff_action_scan_right', frames: this.anims.generateFrameNumbers('riff_actions', { start: 16, end: 19 }), frameRate: 8, repeat: 0 });
this.anims.create({ key: 'riff_action_use_right', frames: this.anims.generateFrameNumbers('riff_actions', { start: 20, end: 23 }), frameRate: 8, repeat: 0 });
this.anims.create({ key: 'riff_action_scan_up', frames: this.anims.generateFrameNumbers('riff_actions', { start: 24, end: 27 }), frameRate: 8, repeat: 0 });
this.anims.create({ key: 'riff_action_use_up', frames: this.anims.generateFrameNumbers('riff_actions', { start: 28, end: 31 }), frameRate: 8, repeat: 0 });
this.anims.create({ key: 'riff_hurt_down', frames: this.anims.generateFrameNumbers('riff_hurt', { start: 0, end: 3 }), frameRate: 9, repeat: 0 });
this.anims.create({ key: 'riff_knockdown_down', frames: this.anims.generateFrameNumbers('riff_hurt', { start: 4, end: 7 }), frameRate: 9, repeat: 0 });
this.anims.create({ key: 'riff_hurt_left', frames: this.anims.generateFrameNumbers('riff_hurt', { start: 8, end: 11 }), frameRate: 9, repeat: 0 });
this.anims.create({ key: 'riff_knockdown_left', frames: this.anims.generateFrameNumbers('riff_hurt', { start: 12, end: 15 }), frameRate: 9, repeat: 0 });
this.anims.create({ key: 'riff_hurt_right', frames: this.anims.generateFrameNumbers('riff_hurt', { start: 16, end: 19 }), frameRate: 9, repeat: 0 });
this.anims.create({ key: 'riff_knockdown_right', frames: this.anims.generateFrameNumbers('riff_hurt', { start: 20, end: 23 }), frameRate: 9, repeat: 0 });
this.anims.create({ key: 'riff_hurt_up', frames: this.anims.generateFrameNumbers('riff_hurt', { start: 24, end: 27 }), frameRate: 9, repeat: 0 });
this.anims.create({ key: 'riff_knockdown_up', frames: this.anims.generateFrameNumbers('riff_hurt', { start: 28, end: 31 }), frameRate: 9, repeat: 0 });
this.anims.create({ key: 'riff_react_alert_down', frames: this.anims.generateFrameNumbers('riff_reactions', { start: 0, end: 3 }), frameRate: 8, repeat: 0 });
this.anims.create({ key: 'riff_react_signal_down', frames: this.anims.generateFrameNumbers('riff_reactions', { start: 4, end: 7 }), frameRate: 8, repeat: 0 });
this.anims.create({ key: 'riff_react_alert_left', frames: this.anims.generateFrameNumbers('riff_reactions', { start: 8, end: 11 }), frameRate: 8, repeat: 0 });
this.anims.create({ key: 'riff_react_signal_left', frames: this.anims.generateFrameNumbers('riff_reactions', { start: 12, end: 15 }), frameRate: 8, repeat: 0 });
this.anims.create({ key: 'riff_react_alert_right', frames: this.anims.generateFrameNumbers('riff_reactions', { start: 16, end: 19 }), frameRate: 8, repeat: 0 });
this.anims.create({ key: 'riff_react_signal_right', frames: this.anims.generateFrameNumbers('riff_reactions', { start: 20, end: 23 }), frameRate: 8, repeat: 0 });
this.anims.create({ key: 'riff_react_alert_up', frames: this.anims.generateFrameNumbers('riff_reactions', { start: 24, end: 27 }), frameRate: 8, repeat: 0 });
this.anims.create({ key: 'riff_react_signal_up', frames: this.anims.generateFrameNumbers('riff_reactions', { start: 28, end: 31 }), frameRate: 8, repeat: 0 });
this.anims.create({ key: 'riff_fx_movement_row1', frames: this.anims.generateFrameNumbers('riff_fx_movement', { start: 0, end: 3 }), frameRate: 12, repeat: 0 });
this.anims.create({ key: 'riff_fx_movement_row2', frames: this.anims.generateFrameNumbers('riff_fx_movement', { start: 4, end: 7 }), frameRate: 12, repeat: 0 });
this.anims.create({ key: 'riff_fx_movement_row3', frames: this.anims.generateFrameNumbers('riff_fx_movement', { start: 8, end: 11 }), frameRate: 12, repeat: 0 });
this.anims.create({ key: 'riff_fx_movement_row4', frames: this.anims.generateFrameNumbers('riff_fx_movement', { start: 12, end: 15 }), frameRate: 12, repeat: 0 });
this.anims.create({ key: 'riff_fx_attack_row1', frames: this.anims.generateFrameNumbers('riff_fx_attack', { start: 0, end: 3 }), frameRate: 12, repeat: 0 });
this.anims.create({ key: 'riff_fx_attack_row2', frames: this.anims.generateFrameNumbers('riff_fx_attack', { start: 4, end: 7 }), frameRate: 12, repeat: 0 });
this.anims.create({ key: 'riff_fx_attack_row3', frames: this.anims.generateFrameNumbers('riff_fx_attack', { start: 8, end: 11 }), frameRate: 12, repeat: 0 });
this.anims.create({ key: 'riff_fx_attack_row4', frames: this.anims.generateFrameNumbers('riff_fx_attack', { start: 12, end: 15 }), frameRate: 12, repeat: 0 });
this.anims.create({ key: 'riff_fx_reactions_row1', frames: this.anims.generateFrameNumbers('riff_fx_reactions', { start: 0, end: 3 }), frameRate: 12, repeat: 0 });
this.anims.create({ key: 'riff_fx_reactions_row2', frames: this.anims.generateFrameNumbers('riff_fx_reactions', { start: 4, end: 7 }), frameRate: 12, repeat: 0 });
this.anims.create({ key: 'riff_fx_reactions_row3', frames: this.anims.generateFrameNumbers('riff_fx_reactions', { start: 8, end: 11 }), frameRate: 12, repeat: 0 });
this.anims.create({ key: 'riff_fx_reactions_row4', frames: this.anims.generateFrameNumbers('riff_fx_reactions', { start: 12, end: 15 }), frameRate: 12, repeat: 0 });
this.anims.create({ key: 'riff_fx_actions_row1', frames: this.anims.generateFrameNumbers('riff_fx_actions', { start: 0, end: 3 }), frameRate: 12, repeat: 0 });
this.anims.create({ key: 'riff_fx_actions_row2', frames: this.anims.generateFrameNumbers('riff_fx_actions', { start: 4, end: 7 }), frameRate: 12, repeat: 0 });
this.anims.create({ key: 'riff_fx_actions_row3', frames: this.anims.generateFrameNumbers('riff_fx_actions', { start: 8, end: 11 }), frameRate: 12, repeat: 0 });
this.anims.create({ key: 'riff_fx_actions_row4', frames: this.anims.generateFrameNumbers('riff_fx_actions', { start: 12, end: 15 }), frameRate: 12, repeat: 0 });

// Example use:
// const riff = this.add.sprite(400, 320, 'riff_movement', 0).setOrigin(0.5, 1).setScale(0.55);
// riff.play('riff_walk_down');
// const fx = this.add.sprite(riff.x, riff.y - 60, 'riff_fx_attack', 0).setScale(0.45);
// fx.play('riff_fx_attack_row1');
// fx.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => fx.destroy());
