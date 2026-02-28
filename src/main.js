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

// Characters available in the debug animation viewer.
// Each entry drives both the loadSprite call and the viewer UI.
const CHARACTER_CONFIGS = [
  {
    key: 'warrior',
    label: 'Warrior',
    path: 'sprites/characters/warrior.png',
    sliceX: 10,
    sliceY: 17,
    frameW: 80,
    frameH: 64,
    heightCm: 52, // character body fills ~52 of the 64px frame (rest is breathing room)
    facingRight: false, // sprite sheet faces left
    anims: {
      // Row 0: Idle (5 frames)
      idle: { from: 0, to: 4, loop: true, speed: 6 },
      // Row 1: Walk (8 frames)
      walk: { from: 10, to: 17, loop: true, speed: 10 },
      // Row 2: Run sideways - flipped for left/right direction (8 frames)
      run: { from: 20, to: 27, loop: true, speed: 10 },
    },
  },
  {
    key: 'scribe',
    label: 'Scribe',
    path: 'sprites/characters/scribe.png',
    sliceX: 8,
    sliceY: 2,
    frameW: 64,
    frameH: 64,
    heightCm: 52,
    facingRight: false, // sprite sheet faces left
    anims: {
      // Row 0: Idle (frames 0-4, 5 frames)
      idle: { from: 0, to: 4, loop: true, speed: 6 },
      // Row 1: Walk cycle (frames 8-15, 8 frames)
      walk: { from: 8, to: 15, loop: true, speed: 10 },
    },
  },
  {
    key: 'inquisition',
    label: 'Inquisition',
    path: 'sprites/characters/inquisition.png',
    sliceX: 8,
    sliceY: 2,
    frameW: 64,
    frameH: 64,
    heightCm: 52,
    facingRight: false, // sprite sheet faces left
    anims: {
      // Row 0: Idle (frames 0-4, 5 frames)
      idle: { from: 0, to: 4, loop: true, speed: 6 },
      // Row 1: Walk cycle (frames 8-15, 8 frames)
      walk: { from: 8, to: 15, loop: true, speed: 10 },
    },
  },
  {
    key: 'fox',
    label: 'Fox',
    path: 'sprites/pets/fox.png',
    sliceX: 6,
    sliceY: 2,
    frameW: 32,
    frameH: 32,
    heightCm: 20, // fox character is ~20px tall within the 32px frame
    facingRight: true, // sprite sheet faces right
    anims: {
      // Row 0: Idle (frames 0-4, 5 frames)
      idle: { from: 0, to: 4, loop: true, speed: 6 },
      // Row 1: Run cycle (frames 6-11, 6 frames)
      run: { from: 6, to: 11, loop: true, speed: 10 },
    },
  },
  // Tavern NPCs - loaded via loadSpriteAtlas, so skipLoad prevents double-loading.
  // 64x64 frames; character art fills ~48px vertically (top 16px is padding).
  {
    key: 'bard',
    label: 'Bard',
    skipLoad: true,
    frameW: 64,
    frameH: 64,
    heightCm: 48, // character body fills ~48 of the 64px frame
    facingRight: true,
    anims: { idle: { from: 0, to: 4, loop: true, speed: 6 } },
  },
  {
    key: 'hunter',
    label: 'Hunter',
    skipLoad: true,
    frameW: 64,
    frameH: 64,
    heightCm: 48, // character body fills ~48 of the 64px frame
    facingRight: false,
    anims: { idle: { from: 0, to: 4, loop: true, speed: 6 } },
  },
  {
    key: 'drunkard',
    label: 'Drunkard',
    skipLoad: true,
    frameW: 64,
    frameH: 64,
    heightCm: 48, // character body fills ~48 of the 64px frame
    facingRight: true,
    anims: { idle: { from: 0, to: 4, loop: true, speed: 6 } },
  },
];

// Load all debug-viewable characters from config
// (skip atlas-loaded sprites - they were already loaded via loadSpriteAtlas)
CHARACTER_CONFIGS.forEach((cfg) => {
  if (cfg.skipLoad) return;
  k.loadSprite(cfg.key, cfg.path, {
    sliceX: cfg.sliceX,
    sliceY: cfg.sliceY,
    anims: cfg.anims,
  });
});

// The green slime enemy (8 columns, 3 rows) - not in debug viewer
k.loadSprite('slime', 'sprites/enemies/slime-green.png', {
  sliceX: 8,
  sliceY: 3,
  anims: {
    idle: { from: 0, to: 4, loop: true, speed: 6 },
    move: { from: 5, to: 12, loop: true, speed: 8 },
    death: { from: 13, to: 18, loop: false, speed: 8 },
  },
});

// The Goddess NPC (13 columns, 1 row) - not in debug viewer
k.loadSprite('goddess', 'sprites/characters/goddess-npc.png', {
  sliceX: 13,
  sliceY: 1,
  anims: {
    idle: { from: 0, to: 4, loop: true, speed: 6 },
    walk: { from: 5, to: 12, loop: true, speed: 8 },
  },
});

// Castle tiles - 26 cols x 16 rows, 16x16px per tile
k.loadSprite('castle-tiles', 'sprites/tiles/castle.png', {
  sliceX: 26,
  sliceY: 16,
});

// Tavern NPCs - 40 cols x 16 rows, 16x16px per frame
k.loadSprite('tavern-npcs', 'sprites/characters/tavern-npcs.png', {
  sliceX: 40,
  sliceY: 16,
});

// Animated tavern NPC characters (from the same sheet, atlas-sliced).
// Each character row is 5 frames in 64x64 cells (320x64 region).
// The 32x48 art sits in the bottom-right of each cell, so frame = 64x64 with padding.
k.loadSpriteAtlas('sprites/characters/tavern-npcs.png', {
  bard: {
    x: 0,
    y: 0,
    width: 320,
    height: 64,
    sliceX: 5,
    sliceY: 1,
    anims: { idle: { from: 0, to: 4, loop: true, speed: 6 } },
  },
  hunter: {
    x: 0,
    y: 64,
    width: 320,
    height: 64,
    sliceX: 5,
    sliceY: 1,
    anims: { idle: { from: 0, to: 4, loop: true, speed: 6 } },
  },
  drunkard: {
    x: 0,
    y: 128,
    width: 320,
    height: 64,
    sliceX: 5,
    sliceY: 1,
    anims: { idle: { from: 0, to: 4, loop: true, speed: 6 } },
  },
});

// House furniture tiles - 15 cols x 13 rows, 32x32px per tile
k.loadSprite('furniture-tiles', 'sprites/tiles/furniture.png', {
  sliceX: 15,
  sliceY: 13,
});

// ==============================================
// Debug scene - animation viewer
// Keys: Left/Right = switch character, Up/Down = switch anim, G = game
// ==============================================

k.scene('debug', () => {
  let charIdx = 0;
  let animIdx = 0;

  // How many screen pixels equal 1 in-game cm.
  // Tune this to control the overall zoom level of the viewer.
  const VIEWER_PX_PER_CM = 5;

  // Compute the integer display scale for a character so it renders at its declared
  // heightCm, regardless of how large or small the sprite sheet frames are.
  // Using Math.round keeps it pixel-perfect (no fractional pixel stretching).
  function displayScale(cfg) {
    return Math.round((cfg.heightCm * VIEWER_PX_PER_CM) / cfg.frameH);
  }

  // Help text at the top
  k.add([
    k.text('Q/E: character  |  Up/Down: anim  |  Left/Right: flip  |  G: game', {
      size: 14,
    }),
    k.pos(k.width() / 2, 18),
    k.anchor('center'),
    k.color(180, 180, 180),
    k.z(100),
  ]);

  // Character name display with < > arrows
  const charLabel = k.add([
    k.text('', { size: 20 }),
    k.pos(k.width() / 2, 52),
    k.anchor('center'),
    k.color(255, 220, 100),
    k.z(100),
  ]);

  // Preview sprite - starts with first character's first anim
  const firstCfg = CHARACTER_CONFIGS[0];
  const firstAnimName = Object.keys(firstCfg.anims)[0];
  const previewX = k.width() / 2 - 80; // shift left to leave room for anim list
  const previewY = k.height() / 2 + 20;

  const preview = k.add([
    k.sprite(firstCfg.key, { anim: firstAnimName }),
    k.pos(previewX, previewY),
    k.anchor('center'),
    k.scale(displayScale(firstCfg)),
    k.z(10),
  ]);

  // Yellow border that resizes to match current frame dimensions
  const border = k.add([
    k.rect(
      firstCfg.frameW * displayScale(firstCfg) + 4,
      firstCfg.frameH * displayScale(firstCfg) + 4,
    ),
    k.pos(previewX, previewY),
    k.anchor('center'),
    k.outline(2, k.Color.fromHex('#ffcc00')),
    k.color(0, 0, 0),
    k.opacity(0.15),
    k.z(5),
  ]);

  // Animation list labels - we'll recreate them on character switch
  let animLabels = [];

  // Build the anim list UI on the right side of the preview
  function buildAnimList(cfg, selectedIdx) {
    // Remove old labels
    animLabels.forEach((lbl) => lbl.destroy());
    animLabels = [];

    const animNames = Object.keys(cfg.anims);
    const listX = k.width() / 2 + 80;
    const listStartY = k.height() / 2 - (animNames.length * 24) / 2;

    animNames.forEach((name, i) => {
      const isSelected = i === selectedIdx;
      const lbl = k.add([
        k.text((isSelected ? '> ' : '  ') + name, { size: 16 }),
        k.pos(listX, listStartY + i * 24),
        k.anchor('left'),
        k.color(isSelected ? k.Color.fromHex('#ffcc00') : k.Color.fromHex('#aaaaaa')),
        k.z(100),
      ]);
      animLabels.push(lbl);
    });
  }

  // Apply the current character and animation to the preview
  function applySelection() {
    const cfg = CHARACTER_CONFIGS[charIdx];
    const animNames = Object.keys(cfg.anims);

    // Clamp animIdx to valid range for this character
    if (animIdx >= animNames.length) animIdx = 0;

    const animName = animNames[animIdx];

    const sc = displayScale(cfg);

    // Swap sprite and restart the selected animation
    preview.use(k.sprite(cfg.key, { anim: animName }));
    preview.play(animName, { loop: true }); // always loop in viewer
    preview.scale = k.vec2(sc);
    preview.flipX = false; // flipX=false always shows the natural/default facing direction

    // Resize border to match this character's frame size at the new scale
    border.width = cfg.frameW * sc + 4;
    border.height = cfg.frameH * sc + 4;

    // Update header label
    charLabel.text = `< ${cfg.label} >`;

    // Rebuild anim list with new selection
    buildAnimList(cfg, animIdx);
  }

  // First render
  applySelection();

  // Q / E: switch character (wraps around)
  k.onKeyPress('e', () => {
    charIdx = (charIdx + 1) % CHARACTER_CONFIGS.length;
    animIdx = 0;
    applySelection();
  });
  k.onKeyPress('q', () => {
    charIdx = (charIdx - 1 + CHARACTER_CONFIGS.length) % CHARACTER_CONFIGS.length;
    animIdx = 0;
    applySelection();
  });

  // Up/Down: switch animation for current character (wraps around)
  k.onKeyPress('down', () => {
    const len = Object.keys(CHARACTER_CONFIGS[charIdx].anims).length;
    animIdx = (animIdx + 1) % len;
    applySelection();
  });
  k.onKeyPress('up', () => {
    const len = Object.keys(CHARACTER_CONFIGS[charIdx].anims).length;
    animIdx = (animIdx - 1 + len) % len;
    applySelection();
  });

  // Left/Right: make the sprite face that direction.
  // flipX depends on which way the sprite naturally faces in the sheet:
  //   facing left naturally -> flip to face right, no flip to face left
  //   facing right naturally -> no flip to face right, flip to face left
  k.onKeyPress('left', () => {
    preview.flipX = CHARACTER_CONFIGS[charIdx].facingRight;
  });
  k.onKeyPress('right', () => {
    preview.flipX = !CHARACTER_CONFIGS[charIdx].facingRight;
  });

  // G key goes to the prison scene
  k.onKeyPress('g', () => {
    goToPrison();
  });
});

// ==============================================
// Game scene - the actual game
// ==============================================

k.scene('game', () => {
  // -- Score tracking (not yet wired up to gameplay) --
  const _score = 0;

  // -- Player health system --
  const maxHealth = 100;
  let playerHealth = maxHealth;

  // Invulnerability flag - prevents taking damage too fast from sustained contact
  let invulnerable = false;

  // Reduce the player's health by the given amount, clamping at 0
  function takeDamage(amount) {
    playerHealth = Math.max(0, playerHealth - amount);
    updateHealthBar();
  }

  // -- Health bar UI in the top-left corner --
  // Background (dark bar that shows max width)
  const _healthBarBg = k.add([
    k.rect(104, 14),
    k.pos(10, 10),
    k.color(40, 40, 40),
    k.fixed(),
    k.z(100),
  ]);

  // The colored health bar that shrinks as health decreases
  const healthBar = k.add([
    k.rect(100, 10),
    k.pos(12, 12),
    k.color(0, 200, 0),
    k.fixed(),
    k.z(101),
  ]);

  // Numeric health label next to the bar
  const healthLabel = k.add([
    k.text('100/100', { size: 14 }),
    k.pos(120, 10),
    k.color(255, 255, 255),
    k.fixed(),
    k.z(100),
  ]);

  // Update the health bar width and color based on current health
  function updateHealthBar() {
    const healthPercent = playerHealth / maxHealth;
    healthBar.width = 100 * healthPercent;

    // Green when above 50%, yellow 25-50%, red below 25%
    if (healthPercent > 0.5) {
      healthBar.color = k.Color.fromHex('#00cc00');
    } else if (healthPercent > 0.25) {
      healthBar.color = k.Color.fromHex('#cccc00');
    } else {
      healthBar.color = k.Color.fromHex('#cc0000');
    }

    healthLabel.text = `${playerHealth}/${maxHealth}`;
  }

  // -- Score display in the top-left corner --
  const _scoreText = k.add([
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
    k.sprite('warrior', { anim: 'idle' }),
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

  // Keep track of movement state to avoid replaying the same anim every frame
  let moving = false;

  // How much of the rendered sprite extends from center
  const PLAYER_HALF_W = 40 * 2; // half of 80px frame * scale(2)
  const PLAYER_HALF_H = 32 * 2; // half of 64px frame * scale(2)

  k.onUpdate(() => {
    const wasMoving = moving;
    moving = false;

    if (k.isKeyDown('left')) {
      player.move(-SPEED, 0);
      player.flipX = false; // warrior faces left naturally - no flip needed
      moving = true;
    } else if (k.isKeyDown('right')) {
      player.move(SPEED, 0);
      player.flipX = true; // flip left-facing warrior to face right
      moving = true;
    }

    if (k.isKeyDown('up')) {
      player.move(0, -SPEED);
      moving = true;
    } else if (k.isKeyDown('down')) {
      player.move(0, SPEED);
      moving = true;
    }

    // Switch between walk and idle only when the state changes
    if (moving && !wasMoving) {
      player.play('walk');
    } else if (!moving && wasMoving) {
      player.play('idle');
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
    k.sprite('fox', { anim: 'run' }),
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
    // Skip damage if the player is still invulnerable from a recent hit
    if (invulnerable) return;

    // Deal damage and start the invulnerability window
    takeDamage(10);
    invulnerable = true;

    // After 1 second, allow taking damage again
    k.wait(1, () => {
      invulnerable = false;
    });

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

// ==============================================
// Prison scene - rendered from LDtk level data
// ==============================================

// Pre-load LDtk data and then enter the prison scene
import { preloadLdtk, renderLdtkLevel } from './ldtk-loader.js';
import { startDialogue, PRISON_DRUNK_DIALOGUE } from './dialogue.js';

// Integer zoom steps for pixel-perfect scaling
const ZOOM_STEPS = [1, 2, 3, 4, 5, 6];
const DEFAULT_ZOOM = 2;

k.scene('prison', (ldtkData) => {
  // Render the level at (0, 0) - camera handles centering
  const { level } = renderLdtkLevel(
    k,
    ldtkData,
    {
      3: 'castle-tiles', // Castle_Tiles (16px grid)
      10: 'furniture-tiles', // House furniture (32px grid)
      14: 'tavern-npcs', // Tavern NPCs (16px grid)
    },
    {
      // The Hero entity uses the warrior sprite at natural size.
      // The 80x64 frame has padding so scale(1) looks right.
      Hero: (entity) => {
        k.add([
          k.sprite('warrior', { anim: 'idle' }),
          k.pos(entity.px[0], entity.px[1]),
          k.anchor('bot'),
          k.scale(1),
          k.z(10),
        ]);
      },

      // The Drunk NPC - uses the animated drunkard sprite from the atlas
      Drunk: (entity) => {
        k.add([
          k.sprite('drunkard', { anim: 'idle' }),
          k.pos(entity.px[0], entity.px[1]),
          k.anchor('bot'),
          k.z(10),
        ]);
      },
    },
  );

  // After a brief pause so the player can see the prison cell,
  // start the drunk cellmate's dialogue
  k.wait(1.5, () => {
    startDialogue(k, PRISON_DRUNK_DIALOGUE, () => {
      // Dialogue finished - nothing to do for now
    });
  });

  // Center camera on the level and set default 2x zoom
  let zoomIdx = ZOOM_STEPS.indexOf(DEFAULT_ZOOM);
  k.setCamPos(level.pxWid / 2, level.pxHei / 2);
  k.setCamScale(ZOOM_STEPS[zoomIdx]);

  // +/= key zooms in, - key zooms out (integer steps only)
  k.onKeyPress('=', () => {
    if (zoomIdx < ZOOM_STEPS.length - 1) {
      zoomIdx++;
      k.setCamScale(ZOOM_STEPS[zoomIdx]);
    }
  });
  k.onKeyPress('-', () => {
    if (zoomIdx > 0) {
      zoomIdx--;
      k.setCamScale(ZOOM_STEPS[zoomIdx]);
    }
  });

  // Scene label (fixed so it doesn't move with camera)
  k.add([
    k.text('Prison Cell', { size: 16 }),
    k.pos(k.width() / 2, 16),
    k.anchor('center'),
    k.color(k.Color.fromHex('#ffcc00')),
    k.fixed(),
    k.z(100),
  ]);
});

// Helper: fetch LDtk data then go to the prison scene
function goToPrison() {
  preloadLdtk('prison.ldtk').then((data) => {
    k.go('prison', data);
  });
}

// -- Start on the debug scene so we can inspect sprites first --
// Press G to switch to the prison scene
k.go('debug');
