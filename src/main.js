// ==============================================
// Liba's Adventure - Main Entry Point
// ==============================================
// This file sets up the game engine and loads
// all the sprites we need. Then it starts
// the game scene.
// ==============================================

import kaplay from 'kaplay';

// --- Create the game engine ---
const k = kaplay({
  // How big the game window is
  width: 800,
  height: 600,

  // The background color (dark blue-green, like a forest at night)
  background: [26, 42, 46],

  // Make the pixels crisp (no blurring) - important for pixel art!
  crisp: true,

  // Scale the canvas to fill the browser window
  letterbox: true,

  // Pixel art games look best with nearest-neighbor scaling
  texFilter: 'nearest',
});

// --- Load all our sprites ---

// The warrior character - 10 columns x 17 rows, 80x64px per frame
// Source: GandalfHardcore FREE Warrior
k.loadSprite('warrior', 'sprites/characters/warrior.png', {
  sliceX: 10,
  sliceY: 17,
  anims: {
    // -- Unarmed animations (rows 0-6) --
    // Row 0: Idle facing down (5 frames)
    'idle-down': { from: 0, to: 4, loop: true, speed: 6 },
    // Row 1: Run facing down (8 frames)
    'run-down': { from: 10, to: 17, loop: true, speed: 10 },
    // Row 2: Run facing side (8 frames)
    'run-side': { from: 20, to: 27, loop: true, speed: 10 },
    // Row 3: Jump (4 frames)
    jump: { from: 30, to: 33, loop: false, speed: 8 },
    // Row 4: Emote / cast (4 frames)
    emote: { from: 40, to: 43, loop: true, speed: 6 },
    // Row 5: Attack unarmed (4 frames)
    attack: { from: 50, to: 53, loop: false, speed: 10 },
    // Row 6: Death unarmed (4 frames)
    death: { from: 60, to: 63, loop: false, speed: 6 },
  },
});

// The green slime enemy (8 columns, 3 rows)
// Frames are packed sequentially (not one animation per row!)
k.loadSprite('slime', 'sprites/enemies/slime-green.png', {
  sliceX: 8,
  sliceY: 3,
  anims: {
    // Idle bounce (frames 0-4, crosses no row boundary)
    idle: { from: 0, to: 4, loop: true, speed: 6 },
    // Move (frames 5-12, crosses row 0 into row 1)
    move: { from: 5, to: 12, loop: true, speed: 8 },
    // Death (frames 13-18, stays in rows 1-2)
    death: { from: 13, to: 18, loop: false, speed: 8 },
  },
});

// The cute fox pet (6 columns, 2 rows)
k.loadSprite('fox', 'sprites/pets/fox.png', {
  sliceX: 6,
  sliceY: 2,
  anims: {
    walk: { from: 0, to: 5, loop: true, speed: 8 },
    idle: { from: 6, to: 11, loop: true, speed: 6 },
  },
});

// The Goddess NPC (13 columns, 1 row)
// Idle = frames 0-4, Walk = frames 5-12
k.loadSprite('goddess', 'sprites/characters/goddess-npc.png', {
  sliceX: 13,
  sliceY: 1,
  anims: {
    idle: { from: 0, to: 4, loop: true, speed: 6 },
    walk: { from: 5, to: 12, loop: true, speed: 8 },
  },
});

// ==============================================
// Debug scene - step through sprite frames one by one
// Keys: Left/Right = step frame, Up/Down = jump row,
//       1-4 = switch sprite, Space = auto-play, G = game
// ==============================================

// All the sprites we can inspect, with their grid info
const DEBUG_SPRITES = [
  { name: 'warrior', cols: 10, rows: 17, frameW: 80, frameH: 64 },
  { name: 'slime', cols: 8, rows: 3, frameW: 32, frameH: 32 },
  { name: 'fox', cols: 6, rows: 2, frameW: 32, frameH: 32 },
  { name: 'goddess', cols: 13, rows: 1, frameW: 64, frameH: 64 },
];

k.scene('debug', () => {
  let spriteIdx = 0;
  let prevSpriteIdx = -1; // track when we need to swap the sprite component
  let frame = 0;
  let autoPlay = false;
  let autoTimer = 0;
  const AUTO_SPEED = 0.25; // seconds per frame when auto-playing

  // The big sprite preview in the center
  const preview = k.add([
    k.sprite(DEBUG_SPRITES[0].name),
    k.pos(k.width() / 2, k.height() / 2 - 30),
    k.anchor('center'),
    k.scale(4),
    k.z(10),
  ]);
  prevSpriteIdx = 0;

  // Colored border around the sprite to show frame boundary
  const border = k.add([
    k.rect(100 * 4 + 4, 64 * 4 + 4),
    k.pos(k.width() / 2, k.height() / 2 - 30),
    k.anchor('center'),
    k.outline(2, k.Color.fromHex('#ffcc00')),
    k.color(0, 0, 0),
    k.opacity(0.15),
    k.z(5),
  ]);

  // Info text overlay
  const infoText = k.add([
    k.text('', { size: 16 }),
    k.pos(k.width() / 2, k.height() - 100),
    k.anchor('center'),
    k.color(255, 255, 255),
    k.z(100),
  ]);

  // Help text at the top
  k.add([
    k.text('SPRITE DEBUG - arrows: step | 1-4: sprite | space: auto | G: game', {
      size: 14,
    }),
    k.pos(k.width() / 2, 20),
    k.anchor('center'),
    k.color(180, 180, 180),
    k.z(100),
  ]);

  // Find which animation name (if any) this frame belongs to
  function getAnimName(spriteDef, frameIdx) {
    // We need to look up the animation definitions we registered
    const animDefs = {
      warrior: {
        'idle-down': [0, 4],
        'run-down': [10, 17],
        'run-side': [20, 27],
        jump: [30, 33],
        emote: [40, 43],
        attack: [50, 53],
        death: [60, 63],
      },
      slime: { idle: [0, 4], move: [5, 12], death: [13, 18] },
      fox: { walk: [0, 5], idle: [6, 11] },
      goddess: { idle: [0, 4], walk: [5, 12] },
    };
    const anims = animDefs[spriteDef.name] || {};
    for (const [name, [from, to]] of Object.entries(anims)) {
      if (frameIdx >= from && frameIdx <= to) return name;
    }
    return '-';
  }

  // Update the display for the current frame and sprite
  function refresh() {
    const info = DEBUG_SPRITES[spriteIdx];
    const totalFrames = info.cols * info.rows;

    // Clamp frame to valid range
    if (frame < 0) frame = 0;
    if (frame >= totalFrames) frame = totalFrames - 1;

    const row = Math.floor(frame / info.cols);
    const col = frame % info.cols;
    const animName = getAnimName(info, frame);

    // Only swap the sprite component when switching to a different sprite
    if (spriteIdx !== prevSpriteIdx) {
      preview.use(k.sprite(info.name));
      border.width = info.frameW * 4 + 4;
      border.height = info.frameH * 4 + 4;
      prevSpriteIdx = spriteIdx;
    }
    preview.frame = frame;

    // Update info text
    infoText.text =
      `${info.name} | frame ${frame}/${totalFrames - 1}` +
      ` | row ${row} col ${col}` +
      ` | anim: ${animName}` +
      ` | ${autoPlay ? 'AUTO' : 'manual'}`;
  }

  refresh();

  // Step frame with Left/Right
  k.onKeyPress('right', () => {
    frame++;
    refresh();
  });
  k.onKeyPress('left', () => {
    frame--;
    refresh();
  });

  // Jump one row with Up/Down
  k.onKeyPress('up', () => {
    frame -= DEBUG_SPRITES[spriteIdx].cols;
    refresh();
  });
  k.onKeyPress('down', () => {
    frame += DEBUG_SPRITES[spriteIdx].cols;
    refresh();
  });

  // Switch sprites with 1-4
  k.onKeyPress('1', () => {
    spriteIdx = 0;
    frame = 0;
    refresh();
  });
  k.onKeyPress('2', () => {
    spriteIdx = 1;
    frame = 0;
    refresh();
  });
  k.onKeyPress('3', () => {
    spriteIdx = 2;
    frame = 0;
    refresh();
  });
  k.onKeyPress('4', () => {
    spriteIdx = 3;
    frame = 0;
    refresh();
  });

  // Toggle auto-play with Space
  k.onKeyPress('space', () => {
    autoPlay = !autoPlay;
    autoTimer = 0;
    refresh();
  });

  // Auto-play stepping
  k.onUpdate(() => {
    if (!autoPlay) return;
    autoTimer += k.dt();
    if (autoTimer >= AUTO_SPEED) {
      autoTimer -= AUTO_SPEED;
      frame++;
      const totalFrames = DEBUG_SPRITES[spriteIdx].cols * DEBUG_SPRITES[spriteIdx].rows;
      if (frame >= totalFrames) frame = 0;
      refresh();
    }
  });

  // G key goes to the game scene
  k.onKeyPress('g', () => {
    k.go('game');
  });
});

// ==============================================
// Game scene - the actual game
// ==============================================

k.scene('game', () => {
  // -- Score tracking --
  let score = 0;

  // -- Score display in the top-left corner --
  const scoreText = k.add([
    k.text('Score: 0', { size: 20 }),
    k.pos(12, 60),
    k.color(255, 255, 255),
    k.fixed(),
    k.z(100),
  ]);

  // -- Title text at the top --
  k.add([
    k.text("Liba's Adventure", { size: 28 }),
    k.pos(k.width() / 2, 30),
    k.anchor('center'),
    k.color(255, 220, 100),
    k.fixed(),
    k.z(100),
  ]);

  // -- Scene label in the top-right corner --
  k.add([
    k.text('Town', { size: 20 }),
    k.pos(k.width() - 12, 60),
    k.anchor('topright'),
    k.color(200, 200, 255),
    k.fixed(),
    k.z(100),
  ]);

  // -- Instructions at the bottom --
  k.add([
    k.text('Arrow keys to move!', { size: 16 }),
    k.pos(k.width() / 2, k.height() - 30),
    k.anchor('center'),
    k.color(180, 180, 180),
    k.fixed(),
    k.z(100),
  ]);

  // -- Draw a simple grass floor --
  // We create a grid of green rectangles to look like grass
  const TILE_SIZE = 32;
  for (let x = 0; x < k.width(); x += TILE_SIZE) {
    for (let y = 0; y < k.height(); y += TILE_SIZE) {
      // Alternate between two shades of green for a checkerboard look
      const isLight = (x / TILE_SIZE + y / TILE_SIZE) % 2 === 0;
      k.add([
        k.rect(TILE_SIZE, TILE_SIZE),
        k.pos(x, y),
        k.color(isLight ? k.Color.fromHex('#3a5a3a') : k.Color.fromHex('#2d4a2d')),
        k.z(0),
      ]);
    }
  }

  // -- The player character (warrior) --
  const player = k.add([
    k.sprite('warrior', { anim: 'idle-down' }),
    k.pos(k.width() / 2, k.height() / 2),
    k.anchor('center'),
    k.area({ shape: new k.Rect(k.vec2(-12, -12), 24, 24) }),
    k.body(),
    k.scale(2), // Make the character bigger so we can see it
    k.z(10),
    'player',
  ]);

  // How fast the player moves (pixels per second)
  const SPEED = 150;

  // Keep track of which direction the player is facing
  let facing = 'down';

  // -- Player movement with arrow keys --
  // This asset only has front and side views, so:
  //   Up/Down both use run-down, Left/Right use run-side with flipX
  //   All idle uses idle-down (the only idle animation available)

  // How much of the rendered sprite extends from center
  const PLAYER_HALF_W = 40 * 2; // half of 80px frame * scale(2)
  const PLAYER_HALF_H = 32 * 2; // half of 64px frame * scale(2)

  k.onUpdate(() => {
    let moving = false;

    if (k.isKeyDown('left')) {
      player.move(-SPEED, 0);
      if (facing !== 'left') {
        player.play('run-side');
        player.flipX = false;
        facing = 'left';
      }
      moving = true;
    } else if (k.isKeyDown('right')) {
      player.move(SPEED, 0);
      if (facing !== 'right') {
        player.play('run-side');
        player.flipX = true;
        facing = 'right';
      }
      moving = true;
    }

    if (k.isKeyDown('up')) {
      player.move(0, -SPEED);
      if (!moving && facing !== 'up') {
        player.play('run-down');
        facing = 'up';
      }
      moving = true;
    } else if (k.isKeyDown('down')) {
      player.move(0, SPEED);
      if (!moving && facing !== 'down') {
        player.play('run-down');
        facing = 'down';
      }
      moving = true;
    }

    // When no keys are pressed, always idle with the front-facing animation
    if (!moving && facing !== 'idle') {
      player.play('idle-down');
      facing = 'idle';
    }

    // Keep the player fully inside the screen
    player.pos.x = Math.max(
      PLAYER_HALF_W,
      Math.min(k.width() - PLAYER_HALF_W, player.pos.x),
    );
    player.pos.y = Math.max(
      PLAYER_HALF_H,
      Math.min(k.height() - PLAYER_HALF_H, player.pos.y),
    );
  });

  // -- A slime enemy that bounces around --
  const slime = k.add([
    k.sprite('slime', { anim: 'idle' }),
    k.pos(200, 200),
    k.anchor('center'),
    k.area(),
    k.scale(2),
    k.z(10),
    'enemy',
  ]);

  // Make the slime wander around
  const slimeDirection = k.vec2(1, 0.5).unit();
  const SLIME_SPEED = 60;

  // Slime is 32x32 at scale(2) = 64x64 rendered, so half = 32
  const SLIME_HALF = 16 * 2;

  slime.onUpdate(() => {
    slime.move(slimeDirection.scale(SLIME_SPEED));

    // Bounce off the screen edges (accounting for sprite size)
    if (slime.pos.x < SLIME_HALF || slime.pos.x > k.width() - SLIME_HALF) {
      slimeDirection.x *= -1;
    }
    if (slime.pos.y < SLIME_HALF || slime.pos.y > k.height() - SLIME_HALF) {
      slimeDirection.y *= -1;
    }
  });

  // -- The cute fox friend --
  const fox = k.add([
    k.sprite('fox', { anim: 'walk' }),
    k.pos(500, 400),
    k.anchor('center'),
    k.scale(2),
    k.z(10),
    'fox',
  ]);

  // The fox slowly follows the player
  fox.onUpdate(() => {
    const direction = player.pos.sub(fox.pos);
    const distance = direction.len();

    // Only follow if far enough away (don't crowd the player)
    if (distance > 80) {
      fox.move(direction.unit().scale(80));
      fox.flipX = direction.x < 0;
    }
  });

  // -- What happens when the player touches the slime --
  player.onCollide('enemy', () => {
    // Flash the screen red briefly
    k.flash(k.Color.fromHex('#ff000044'));

    // Show a funny message
    const messages = [
      'Ouch! Slimy!',
      'Eww, slime!',
      'That tickles!',
      'Hey, watch it!',
      'Bloop!',
    ];
    const msg = messages[Math.floor(Math.random() * messages.length)];

    const popup = k.add([
      k.text(msg, { size: 20 }),
      k.pos(player.pos.x, player.pos.y - 60),
      k.anchor('center'),
      k.color(255, 100, 100),
      k.opacity(1),
      k.z(50),
      k.lifespan(1, { fade: 0.5 }),
    ]);

    // Make the text float upward
    popup.onUpdate(() => {
      popup.move(0, -40);
    });
  });
});

// -- Start on the debug scene so we can inspect sprites first --
// Press G to switch to the game scene
k.go('debug');
