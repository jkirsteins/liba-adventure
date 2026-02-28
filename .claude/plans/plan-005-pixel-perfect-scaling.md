# Plan: Pixel-Perfect Integer Scaling

## Goal

Switch the game from `letterbox: true` (which produces non-integer scaling and uneven pixels) to `stretch: true` with a container div sized to exact integer multiples of 800x600, so every game pixel maps to exactly NxN screen pixels. Unused browser space is black.

## Context

The 800x600 game framebuffer is upscaled to the screen via WebGL texture sampling with `GL_NEAREST`. With `letterbox: true`, the scale factor is non-integer (e.g. 1.8x), causing some game pixels to map to 2 screen pixels and others to 1. The fix: constrain the canvas to integer multiples of 800x600 using a sized container div and Kaplay's `stretch: true` + `root` options.

**Verified from Kaplay v3 (3001.0.19) source:**

- `stretch: true` with `width`/`height` enters responsive mode: canvas buffer = `parentElement.offsetWidth`, CSS = `width:100%; height:100%`
- Viewport = full canvas (no letterbox bars): `{x:0, y:0, width:canvasW, height:canvasH}`
- Resize handler active: `canvas.width = offsetWidth * pixelDensity; updateViewport()`
- Mouse input: `canvasToViewport(pt)` = `pt.x * gameW / viewport.width` = `pt.x / N` - correct
- `crisp: true` already adds `image-rendering: pixelated` CSS on the canvas - no extra CSS needed

## Final Acceptance Criteria

- [x] Build succeeds - Verify: `cd /Users/janis.kirsteins/Projects/LibaGame1 && npm run build` - Expected: exit code 0
- [x] Lint passes - Verify: `cd /Users/janis.kirsteins/Projects/LibaGame1 && npm run lint -- --max-warnings 0` - Expected: exit code 0
- [x] Format correct - Verify: `cd /Users/janis.kirsteins/Projects/LibaGame1 && npm run format:check` - Expected: exit code 0
- [x] Uses stretch not letterbox - Verify: `grep -q 'stretch: true' /Users/janis.kirsteins/Projects/LibaGame1/src/main.js && ! grep -q 'letterbox: true' /Users/janis.kirsteins/Projects/LibaGame1/src/main.js && echo PASS || echo FAIL` - Expected: PASS
- [x] Uses root container - Verify: `grep -q 'root:' /Users/janis.kirsteins/Projects/LibaGame1/src/main.js && echo PASS || echo FAIL` - Expected: PASS
- [x] Container div in HTML - Verify: `grep -q 'id="game-container"' /Users/janis.kirsteins/Projects/LibaGame1/index.html && echo PASS || echo FAIL` - Expected: PASS
- [x] Black background - Verify: `grep -q '#000' /Users/janis.kirsteins/Projects/LibaGame1/index.html && echo PASS || echo FAIL` - Expected: PASS
- [x] Integer scale logic - Verify: `grep -q 'Math.floor' /Users/janis.kirsteins/Projects/LibaGame1/src/main.js && grep -q 'Math.min' /Users/janis.kirsteins/Projects/LibaGame1/src/main.js && echo PASS || echo FAIL` - Expected: PASS

## Milestones

### M1: Update index.html with container div, black background, and flexbox centering [DONE]

- **Description:** Replace the current body/CSS in `index.html`: (1) Change body background from `#1a1a2e` to `#000` (black). (2) Add `display: flex; align-items: center; justify-content: center` to `html, body`. (3) Add `<div id="game-container"></div>` before the script tag. (4) Remove the `canvas { display: block; }` rule (Kaplay manages canvas CSS in responsive mode).
- **Verify:** `grep -q 'id="game-container"' /Users/janis.kirsteins/Projects/LibaGame1/index.html && grep -q '#000' /Users/janis.kirsteins/Projects/LibaGame1/index.html && grep -Eq 'display:\s*flex|display: flex' /Users/janis.kirsteins/Projects/LibaGame1/index.html && ! grep -q 'display: block' /Users/janis.kirsteins/Projects/LibaGame1/index.html && echo PASS || echo FAIL` - Expected: PASS
- **Depends on:** none
- **Files likely touched:** `index.html`

### M2: Add integer-scale container sizing and switch kaplay init to stretch mode [DONE]

- **Description:** In `src/main.js`, before the kaplay init: (1) Define `GAME_W = 800` and `GAME_H = 600` constants. (2) Get the container element via `document.getElementById('game-container')`. (3) Add a `resizeGameContainer()` function that computes `N = Math.max(1, Math.floor(Math.min(innerWidth / GAME_W, innerHeight / GAME_H)))` and sets `container.style.width = GAME_W * N + 'px'` and `container.style.height = GAME_H * N + 'px'`. (4) Call `resizeGameContainer()` immediately (before kaplay, so the container has a size when Kaplay reads `parentElement.offsetWidth`). (5) Add `window.addEventListener('resize', resizeGameContainer)`. Then change the kaplay init: remove `letterbox: true`, add `stretch: true`, add `root: container`, replace hardcoded `width: 800, height: 600` with `GAME_W, GAME_H`.
- **Verify:** `grep -q 'stretch: true' /Users/janis.kirsteins/Projects/LibaGame1/src/main.js && grep -q 'root:' /Users/janis.kirsteins/Projects/LibaGame1/src/main.js && ! grep -q 'letterbox: true' /Users/janis.kirsteins/Projects/LibaGame1/src/main.js && grep -q 'Math.floor' /Users/janis.kirsteins/Projects/LibaGame1/src/main.js && grep -q 'Math.min' /Users/janis.kirsteins/Projects/LibaGame1/src/main.js && grep -Eq "style\.(width|height)" /Users/janis.kirsteins/Projects/LibaGame1/src/main.js && grep -q 'addEventListener.*resize' /Users/janis.kirsteins/Projects/LibaGame1/src/main.js && echo PASS || echo FAIL` - Expected: PASS
- **Depends on:** M1
- **Files likely touched:** `src/main.js`

### M3: Lint, format, and build verification [DONE]

- **Description:** Run `npm run lint:fix` and `npm run format` to auto-fix any code style issues. Then verify `npm run build` succeeds. Fix any remaining issues.
- **Verify:** `cd /Users/janis.kirsteins/Projects/LibaGame1 && npm run lint -- --max-warnings 0 && npm run format:check && npm run build` - Expected: all three commands exit 0
- **Depends on:** M2
- **Files likely touched:** `src/main.js`, `index.html`

## Dependency Graph

```
M1 (index.html: container + CSS)
 |
 v
M2 (main.js: resize logic + kaplay init)
 |
 v
M3 (lint + format + build)
```

## Execution Schedule

Group 1 (start immediately): M1
Group 2 (after M1): M2
Group 3 (after M2): M3

## Implementation Reference

### index.html target state:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Liba's Adventure</title>
    <style>
      * {
        margin: 0;
        padding: 0;
      }
      html,
      body {
        width: 100%;
        height: 100%;
        overflow: hidden;
        background: #000;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    </style>
  </head>
  <body>
    <div id="game-container"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
```

### src/main.js kaplay init target state:

```js
// --- Pixel-perfect integer scaling ---
// Size the container to an exact integer multiple of the game resolution
// so every game pixel maps to exactly NxN screen pixels.
const GAME_W = 800;
const GAME_H = 600;
const container = document.getElementById('game-container');

function resizeGameContainer() {
  const scale = Math.max(
    1,
    Math.floor(Math.min(innerWidth / GAME_W, innerHeight / GAME_H)),
  );
  container.style.width = GAME_W * scale + 'px';
  container.style.height = GAME_H * scale + 'px';
}

// Must be called before kaplay() so the container has a size for Kaplay to read
resizeGameContainer();
window.addEventListener('resize', resizeGameContainer);

// --- Create the game engine ---
const k = kaplay({
  root: container,
  width: GAME_W,
  height: GAME_H,
  background: [26, 42, 46],
  crisp: true,
  stretch: true,
  texFilter: 'nearest',
});
```

## Plan Data (JSON)

```json
{
  "title": "Pixel-Perfect Integer Scaling",
  "goal": "Switch from letterbox to stretch+container for pixel-perfect integer scaling",
  "created": "2026-02-28T00:00:00Z",
  "acceptance_criteria": [
    {
      "description": "Build succeeds",
      "verify_command": "cd /Users/janis.kirsteins/Projects/LibaGame1 && npm run build",
      "expected": "exit code 0"
    },
    {
      "description": "Lint passes",
      "verify_command": "cd /Users/janis.kirsteins/Projects/LibaGame1 && npm run lint -- --max-warnings 0",
      "expected": "exit code 0"
    },
    {
      "description": "Format correct",
      "verify_command": "cd /Users/janis.kirsteins/Projects/LibaGame1 && npm run format:check",
      "expected": "exit code 0"
    },
    {
      "description": "Uses stretch not letterbox",
      "verify_command": "grep -q 'stretch: true' /Users/janis.kirsteins/Projects/LibaGame1/src/main.js && ! grep -q 'letterbox: true' /Users/janis.kirsteins/Projects/LibaGame1/src/main.js && echo PASS || echo FAIL",
      "expected": "PASS"
    },
    {
      "description": "Uses root container",
      "verify_command": "grep -q 'root:' /Users/janis.kirsteins/Projects/LibaGame1/src/main.js && echo PASS || echo FAIL",
      "expected": "PASS"
    },
    {
      "description": "Container div in HTML",
      "verify_command": "grep -q 'id=\"game-container\"' /Users/janis.kirsteins/Projects/LibaGame1/index.html && echo PASS || echo FAIL",
      "expected": "PASS"
    },
    {
      "description": "Black background",
      "verify_command": "grep -q '#000' /Users/janis.kirsteins/Projects/LibaGame1/index.html && echo PASS || echo FAIL",
      "expected": "PASS"
    },
    {
      "description": "Integer scale logic",
      "verify_command": "grep -q 'Math.floor' /Users/janis.kirsteins/Projects/LibaGame1/src/main.js && grep -q 'Math.min' /Users/janis.kirsteins/Projects/LibaGame1/src/main.js && echo PASS || echo FAIL",
      "expected": "PASS"
    }
  ],
  "milestones": [
    {
      "id": "M1",
      "title": "Update index.html with container div, black background, and flexbox centering",
      "description": "Add game-container div, change background to #000, add flexbox centering, remove canvas display:block rule",
      "verify_command": "grep -q 'id=\"game-container\"' /Users/janis.kirsteins/Projects/LibaGame1/index.html && grep -q '#000' /Users/janis.kirsteins/Projects/LibaGame1/index.html && grep -Eq 'display:\\s*flex|display: flex' /Users/janis.kirsteins/Projects/LibaGame1/index.html && ! grep -q 'display: block' /Users/janis.kirsteins/Projects/LibaGame1/index.html && echo PASS || echo FAIL",
      "expected_output": "PASS",
      "depends_on": [],
      "files_likely_touched": ["index.html"],
      "estimated_size": "small"
    },
    {
      "id": "M2",
      "title": "Add integer-scale container sizing and switch kaplay init to stretch mode",
      "description": "Add resizeGameContainer() with Math.floor integer scaling, call before kaplay(), add resize listener, switch kaplay init from letterbox to stretch with root container",
      "verify_command": "grep -q 'stretch: true' /Users/janis.kirsteins/Projects/LibaGame1/src/main.js && grep -q 'root:' /Users/janis.kirsteins/Projects/LibaGame1/src/main.js && ! grep -q 'letterbox: true' /Users/janis.kirsteins/Projects/LibaGame1/src/main.js && grep -q 'Math.floor' /Users/janis.kirsteins/Projects/LibaGame1/src/main.js && grep -q 'Math.min' /Users/janis.kirsteins/Projects/LibaGame1/src/main.js && grep -Eq 'style\\.(width|height)' /Users/janis.kirsteins/Projects/LibaGame1/src/main.js && grep -q 'addEventListener.*resize' /Users/janis.kirsteins/Projects/LibaGame1/src/main.js && echo PASS || echo FAIL",
      "expected_output": "PASS",
      "depends_on": ["M1"],
      "files_likely_touched": ["src/main.js"],
      "estimated_size": "small"
    },
    {
      "id": "M3",
      "title": "Lint, format, and build verification",
      "description": "Run lint:fix and format, verify build succeeds, fix any issues",
      "verify_command": "cd /Users/janis.kirsteins/Projects/LibaGame1 && npm run lint -- --max-warnings 0 && npm run format:check && npm run build",
      "expected_output": "all three exit 0",
      "depends_on": ["M2"],
      "files_likely_touched": ["src/main.js", "index.html"],
      "estimated_size": "small"
    }
  ],
  "execution_schedule": [
    {
      "group": 1,
      "label": "start immediately",
      "milestone_ids": ["M1"]
    },
    {
      "group": 2,
      "label": "after M1",
      "milestone_ids": ["M2"]
    },
    {
      "group": 3,
      "label": "after M2",
      "milestone_ids": ["M3"]
    }
  ]
}
```
