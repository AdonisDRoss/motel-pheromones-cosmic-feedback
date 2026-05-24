// Phaser loader example
this.load.spritesheet('neon_slash_arc', 'assets/sprites/fx/weapons/neon_slash_arc.png', { frameWidth: 320, frameHeight: 320 });
this.load.spritesheet('muzzle_flash_burst', 'assets/sprites/fx/weapons/muzzle_flash_burst.png', { frameWidth: 320, frameHeight: 320 });
this.load.spritesheet('rainbow_hit_burst', 'assets/sprites/fx/weapons/rainbow_hit_burst.png', { frameWidth: 320, frameHeight: 320 });
this.load.spritesheet('plasma_ring_blast', 'assets/sprites/fx/weapons/plasma_ring_blast.png', { frameWidth: 320, frameHeight: 320 });

this.anims.create({ key:'fx_slash', frames:this.anims.generateFrameNumbers('neon_slash_arc',{ start:0,end:7 }), frameRate:12, repeat:0, hideOnComplete:true });
this.anims.create({ key:'fx_muzzle', frames:this.anims.generateFrameNumbers('muzzle_flash_burst',{ start:0,end:7 }), frameRate:16, repeat:0, hideOnComplete:true });
this.anims.create({ key:'fx_hit', frames:this.anims.generateFrameNumbers('rainbow_hit_burst',{ start:0,end:7 }), frameRate:14, repeat:0, hideOnComplete:true });
this.anims.create({ key:'fx_plasma', frames:this.anims.generateFrameNumbers('plasma_ring_blast',{ start:0,end:7 }), frameRate:12, repeat:0, hideOnComplete:true });
