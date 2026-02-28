// ==============================================
// Liba's Adventure - Main Entry Point
// ==============================================
// This file sets up the game engine and loads
// all the sprites we need. Then it starts
// the game scene.
// ==============================================

import kaplay from 'kaplay';

// --- Pixel-perfect integer scaling ---
// Size the container to an exact integer multiple of the game resolution
// so every game pixel maps to exactly NxN screen pixels.
const GAME_W = 800;
const GAME_H = 600;
const container = document.getElementById('game-container');

function resizeGameContainer() {
  const intScale = Math.floor(Math.min(innerWidth / GAME_W, innerHeight / GAME_H));
  if (intScale >= 1) {
    // Integer scaling: every game pixel = exactly NxN screen pixels
    container.style.width = GAME_W * intScale + 'px';
    container.style.height = GAME_H * intScale + 'px';
  } else {
    // Window smaller than game resolution: fit while keeping aspect ratio
    const fitScale = Math.min(innerWidth / GAME_W, innerHeight / GAME_H);
    container.style.width = Math.floor(GAME_W * fitScale) + 'px';
    container.style.height = Math.floor(GAME_H * fitScale) + 'px';
  }
}

// Must be called before kaplay() so the container has a size for Kaplay to read
resizeGameContainer();
window.addEventListener('resize', resizeGameContainer);

// --- Create the game engine ---
const k = kaplay({
  root: container,
  width: GAME_W,
  height: GAME_H,

  background: [19, 19, 24],

  // Make the pixels crisp (no blurring) - important for pixel art!
  crisp: true,

  // Stretch the canvas to fill the container (which is integer-scaled)
  stretch: true,

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
    // Hitbox relative to anchor('bot') (bottom-center of sprite frame):
    //   (0,0) = bottom-center, negative y = upward, negative x = leftward
    hitbox: { x: -9, y: -44, w: 19, h: 44 },
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
    hitbox: { x: -11, y: -16, w: 21, h: 16 },
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
    hitbox: { x: -11, y: -16, w: 21, h: 16 },
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
    hitbox: { x: -5, y: -8, w: 11, h: 8 },
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
    hitbox: { x: -11, y: -16, w: 21, h: 16 },
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
    hitbox: { x: -11, y: -16, w: 21, h: 16 },
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
    hitbox: { x: -11, y: -16, w: 21, h: 16 },
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

// Build a collision area from a character's hitbox config.
// anchorMode: 'bot' (anchor at bottom-center) or 'center' (anchor at sprite center).
//
// Kaplay's worldArea() applies an anchor-based offset to Rect shapes:
//   anchor('bot')    -> shifts rect by (-W/2, -H)
//   anchor('center') -> shifts rect by (-W/2, -H/2)
// Our hitbox coords are relative to the sprite's bottom-center, so we
// compensate for Kaplay's anchor shift to get the correct world position.
function makeHitboxArea(key, anchorMode = 'bot') {
  const cfg = CHARACTER_CONFIGS.find((c) => c.key === key);
  if (!cfg || !cfg.hitbox) return k.area();
  const hb = cfg.hitbox;
  // Undo Kaplay's automatic anchor offset so the shape lands where we intend
  const rectX = hb.x + hb.w / 2;
  let rectY;
  if (anchorMode === 'bot') {
    rectY = hb.y + hb.h;
  } else {
    // For center anchor, also shift from bot-relative to center-relative coords
    rectY = hb.y + cfg.frameH / 2 + hb.h / 2;
  }
  return k.area({ shape: new k.Rect(k.vec2(rectX, rectY), hb.w, hb.h) });
}

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

  // -- Hitbox editor state --
  let hitboxMode = false;
  let editorHitbox = { ...CHARACTER_CONFIGS[0].hitbox };
  let dragTarget = null; // null | 'body' | 'tl' | 'tr' | 'bl' | 'br'
  let dragStartMouse = null;
  let dragStartHitbox = null;

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
    k.text(
      'Q/E: character  |  Up/Down: anim  |  Left/Right: flip  |  H: hitbox  |  G: game',
      {
        size: 14,
      },
    ),
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
    // Force no flip in hitbox mode to avoid coordinate confusion
    preview.flipX = hitboxMode ? false : false;

    // Reload editor hitbox from this character's config
    if (cfg.hitbox) {
      editorHitbox = { ...cfg.hitbox };
    }

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

  // ==============================================
  // Hitbox editor - toggle with H key
  // Drag corners to resize, drag body to move.
  // Values displayed in real-time for copy-paste.
  // ==============================================

  k.onKeyPress('h', () => {
    hitboxMode = !hitboxMode;
    dragTarget = null;
    dragStartMouse = null;
    dragStartHitbox = null;
    if (hitboxMode) {
      // Force no flip so hitbox coordinates aren't mirrored
      preview.flipX = false;
    }
    updateHitboxUI();
  });

  // Convert hitbox coords (relative to anchor='bot') to screen coords.
  // In the debug viewer the preview uses anchor='center', so bottom-center
  // of the sprite is at previewY + (frameH * scale) / 2.
  function hitboxToScreen(hb) {
    const cfg = CHARACTER_CONFIGS[charIdx];
    const sc = displayScale(cfg);
    const botCenterY = previewY + (cfg.frameH * sc) / 2;
    return {
      x: previewX + hb.x * sc,
      y: botCenterY + hb.y * sc,
      w: hb.w * sc,
      h: hb.h * sc,
    };
  }

  // Check if a screen point is within radius of a target point
  function nearPoint(px, py, tx, ty, radius) {
    const dx = px - tx;
    const dy = py - ty;
    return dx * dx + dy * dy <= radius * radius;
  }

  // Hit-test the mouse against corners and body, return drag target name
  function hitTestHitbox(mx, my) {
    const sr = hitboxToScreen(editorHitbox);
    const r = 10; // corner grab radius in screen pixels

    // Corners first (higher priority than body)
    if (nearPoint(mx, my, sr.x, sr.y, r)) return 'tl';
    if (nearPoint(mx, my, sr.x + sr.w, sr.y, r)) return 'tr';
    if (nearPoint(mx, my, sr.x, sr.y + sr.h, r)) return 'bl';
    if (nearPoint(mx, my, sr.x + sr.w, sr.y + sr.h, r)) return 'br';

    // Body
    if (mx >= sr.x && mx <= sr.x + sr.w && my >= sr.y && my <= sr.y + sr.h) {
      return 'body';
    }
    return null;
  }

  k.onMousePress('left', () => {
    if (!hitboxMode) return;
    const mp = k.mousePos();
    const target = hitTestHitbox(mp.x, mp.y);
    if (target) {
      dragTarget = target;
      dragStartMouse = { x: mp.x, y: mp.y };
      dragStartHitbox = { ...editorHitbox };
    }
  });

  k.onMouseRelease('left', () => {
    dragTarget = null;
    dragStartMouse = null;
    dragStartHitbox = null;
  });

  k.onMouseMove(() => {
    if (!hitboxMode || !dragTarget || !dragStartMouse) return;

    const mp = k.mousePos();
    const cfg = CHARACTER_CONFIGS[charIdx];
    const sc = displayScale(cfg);

    // Delta in sprite-pixel units (rounded for pixel-perfect editing)
    const dx = Math.round((mp.x - dragStartMouse.x) / sc);
    const dy = Math.round((mp.y - dragStartMouse.y) / sc);
    const sh = dragStartHitbox;

    if (dragTarget === 'body') {
      editorHitbox.x = sh.x + dx;
      editorHitbox.y = sh.y + dy;
    } else if (dragTarget === 'tl') {
      editorHitbox.x = sh.x + dx;
      editorHitbox.y = sh.y + dy;
      editorHitbox.w = Math.max(1, sh.w - dx);
      editorHitbox.h = Math.max(1, sh.h - dy);
    } else if (dragTarget === 'tr') {
      editorHitbox.y = sh.y + dy;
      editorHitbox.w = Math.max(1, sh.w + dx);
      editorHitbox.h = Math.max(1, sh.h - dy);
    } else if (dragTarget === 'bl') {
      editorHitbox.x = sh.x + dx;
      editorHitbox.w = Math.max(1, sh.w - dx);
      editorHitbox.h = Math.max(1, sh.h + dy);
    } else if (dragTarget === 'br') {
      editorHitbox.w = Math.max(1, sh.w + dx);
      editorHitbox.h = Math.max(1, sh.h + dy);
    }
  });

  // -- Hitbox editor UI elements (game objects, hidden until H is pressed) --
  const hitboxValLabel = k.add([
    k.text('', { size: 16 }),
    k.pos(k.width() / 2, k.height() - 55),
    k.anchor('center'),
    k.color(k.Color.fromHex('#00ff00')),
    k.fixed(),
    k.z(200),
    k.opacity(0),
  ]);

  const hitboxModeLabel = k.add([
    k.text('HITBOX EDITOR (H to exit)', { size: 14 }),
    k.pos(k.width() / 2, 80),
    k.anchor('center'),
    k.color(k.Color.fromHex('#ff6666')),
    k.fixed(),
    k.z(200),
    k.opacity(0),
  ]);

  const copyBtnBg = k.add([
    k.rect(80, 24, { radius: 4 }),
    k.pos(k.width() / 2, k.height() - 24),
    k.anchor('center'),
    k.color(k.Color.fromHex('#225522')),
    k.area(),
    k.fixed(),
    k.z(200),
    k.opacity(0),
  ]);

  const copyBtnText = k.add([
    k.text('Copy', { size: 14 }),
    k.pos(k.width() / 2, k.height() - 24),
    k.anchor('center'),
    k.color(k.Color.WHITE),
    k.fixed(),
    k.z(201),
    k.opacity(0),
  ]);

  // Hover highlight
  copyBtnBg.onHover(() => {
    if (hitboxMode) copyBtnBg.color = k.Color.fromHex('#338833');
  });
  copyBtnBg.onHoverEnd(() => {
    copyBtnBg.color = k.Color.fromHex('#225522');
  });

  // Click to copy hitbox values to clipboard
  copyBtnBg.onClick(() => {
    if (!hitboxMode) return;
    const hb = editorHitbox;
    const text = `hitbox: { x: ${hb.x}, y: ${hb.y}, w: ${hb.w}, h: ${hb.h} }`;
    navigator.clipboard.writeText(text);
    copyBtnText.text = 'Copied!';
    k.wait(1, () => {
      copyBtnText.text = 'Copy';
    });
  });

  // Show/hide hitbox UI elements when mode toggles
  function updateHitboxUI() {
    const vis = hitboxMode ? 1 : 0;
    hitboxValLabel.opacity = vis;
    hitboxModeLabel.opacity = vis;
    copyBtnBg.opacity = vis;
    copyBtnText.opacity = vis;
  }

  // Keep the value label in sync with the editor state
  k.onUpdate(() => {
    if (!hitboxMode) return;
    const hb = editorHitbox;
    hitboxValLabel.text = `hitbox: { x: ${hb.x}, y: ${hb.y}, w: ${hb.w}, h: ${hb.h} }`;
  });

  // Draw the hitbox overlay
  k.onDraw(() => {
    if (!hitboxMode) return;

    const sr = hitboxToScreen(editorHitbox);
    const cfg = CHARACTER_CONFIGS[charIdx];
    const sc = displayScale(cfg);

    // Semi-transparent green rectangle for the hitbox
    k.drawRect({
      pos: k.vec2(sr.x, sr.y),
      width: sr.w,
      height: sr.h,
      color: k.Color.fromHex('#00ff00'),
      opacity: 0.3,
    });

    // Green outline
    k.drawRect({
      pos: k.vec2(sr.x, sr.y),
      width: sr.w,
      height: sr.h,
      fill: false,
      outline: { width: 2, color: k.Color.fromHex('#00ff00') },
    });

    // Small red dot at anchor point (bottom-center of sprite)
    const botCenterY = previewY + (cfg.frameH * sc) / 2;
    k.drawCircle({
      pos: k.vec2(previewX, botCenterY),
      radius: 3,
      color: k.Color.RED,
    });

    // Corner handles - white normally, cyan when active/hovered
    const mp = k.mousePos();
    const hovered = dragTarget || hitTestHitbox(mp.x, mp.y);
    const corners = [
      { name: 'tl', x: sr.x, y: sr.y },
      { name: 'tr', x: sr.x + sr.w, y: sr.y },
      { name: 'bl', x: sr.x, y: sr.y + sr.h },
      { name: 'br', x: sr.x + sr.w, y: sr.y + sr.h },
    ];
    for (const c of corners) {
      k.drawCircle({
        pos: k.vec2(c.x, c.y),
        radius: 5,
        color: hovered === c.name ? k.Color.CYAN : k.Color.WHITE,
      });
    }
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
    makeHitboxArea('warrior', 'center'),
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
import { getEntityField, preloadLdtk, renderLdtkLevel } from './ldtk-loader.js';
import { startDialogue, PRISON_DRUNK_DIALOGUE } from './dialogue.js';

// Integer zoom steps for pixel-perfect scaling
const ZOOM_STEPS = [1, 2, 3, 4, 5, 6];
const DEFAULT_ZOOM = 2;

k.scene('prison', (ldtkData) => {
  // Enable gravity so the player falls to the ground
  k.setGravity(800);

  // Player reference - assigned inside the Hero entity handler below,
  // used by the onUpdate loop for movement and camera tracking
  let player = null;

  // Block movement while a dialogue is on screen
  let dialogueActive = false;

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
      // A small collision box at the feet keeps wall collisions tight.
      Hero: (entity) => {
        player = k.add([
          k.sprite('warrior', { anim: 'idle' }),
          k.pos(entity.px[0], entity.px[1]),
          k.anchor('bot'),
          makeHitboxArea('warrior', 'bot'),
          k.body(),
          k.scale(1),
          k.z(10),
          'player',
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
    dialogueActive = true;
    startDialogue(k, PRISON_DRUNK_DIALOGUE, () => {
      dialogueActive = false;
    });
  });

  // -- Player movement --
  const SPEED = 80; // pixels per second - slow for the confined prison space

  // Track whether the player was moving last frame to avoid replaying anims
  let moving = false;

  k.onUpdate(() => {
    if (!player) return;

    const wasMoving = moving;
    moving = false;

    // Only read input when no dialogue is active
    if (!dialogueActive) {
      if (k.isKeyDown('left')) {
        player.move(-SPEED, 0);
        player.flipX = false; // warrior faces left naturally - no flip needed
        moving = true;
      } else if (k.isKeyDown('right')) {
        player.move(SPEED, 0);
        player.flipX = true; // flip left-facing warrior to face right
        moving = true;
      }
    }

    // Animation state transitions always run - ensures the player
    // stops walking when dialogue starts, without special-case code
    if (moving && !wasMoving) {
      player.play('walk');
    } else if (!moving && wasMoving) {
      player.play('idle');
    }

    // Camera follows the player, clamped so it never shows outside the level.
    // When the level is smaller than the viewport, center on the level instead.
    const zoom = ZOOM_STEPS[zoomIdx];
    const halfViewW = k.width() / (2 * zoom);
    const halfViewH = k.height() / (2 * zoom);
    const camX =
      level.pxWid < halfViewW * 2
        ? level.pxWid / 2
        : Math.max(halfViewW, Math.min(level.pxWid - halfViewW, player.pos.x));
    const camY =
      level.pxHei < halfViewH * 2
        ? level.pxHei / 2
        : Math.max(halfViewH, Math.min(level.pxHei - halfViewH, player.pos.y));
    k.setCamPos(camX, camY);
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

  // -- Debug collision visualization toggle --
  let showColliders = false;

  k.onKeyPress('c', () => {
    showColliders = !showColliders;
    const walls = k.get('wall');
    for (const w of walls) {
      w.opacity = showColliders ? 0.3 : 0;
      w.color = showColliders ? k.Color.RED : k.Color.WHITE;
    }
  });

  // Draw the player's collision area when colliders are visible
  k.onDraw(() => {
    if (!showColliders || !player) return;
    const area = player.worldArea();
    const pts = area.pts ? area.pts : area.points();
    k.drawPolygon({
      pts,
      fill: true,
      color: k.Color.fromHex('#00ff00'),
      opacity: 0.3,
      outline: { width: 1, color: k.Color.GREEN },
    });
  });

  // Small hint label in the bottom-left corner
  k.add([
    k.text('C: colliders', { size: 10 }),
    k.pos(8, k.height() - 16),
    k.color(k.Color.fromHex('#aaaaaa')),
    k.fixed(),
    k.z(100),
  ]);

  // Scene label from LDtk "title" field, falls back to level identifier
  const levelName = getEntityField(level, 'title') || level.identifier.replace(/_/g, ' ');
  k.add([
    k.text(levelName, { size: 16 }),
    k.pos(level.pxWid / 2, -4),
    k.anchor('bot'),
    k.color(k.Color.fromHex('#ffcc00')),
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
