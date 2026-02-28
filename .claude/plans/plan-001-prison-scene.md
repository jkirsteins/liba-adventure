# Plan: Prison Scene with Castle Tileset

## Goal

Copy 4 canonically-named aliases of existing misc/ sprites, load castle and house-inside tilesets in `main.js`, build a `prison` scene with tiled floor/walls/bars and an idle warrior character, and wire a `P` key in the debug scene to navigate there.

## Final Acceptance Criteria

- [x] All 4 canonical-named asset files exist - Verify: `MISSING=$(for f in fountain-face.png small-bees.png old-dark-tree2.png old-dark-tree3.png; do test -f /Users/janis.kirsteins/Projects/LibaGame1/public/sprites/misc/$f || echo "MISSING $f"; done); [ -z "$MISSING" ] && echo PASS || echo "FAIL: $MISSING"` - Expected: `PASS`
- [x] castle-tiles loadSprite has sliceX:13 and sliceY:8 - Verify: `grep -A5 "castle-tiles" /Users/janis.kirsteins/Projects/LibaGame1/src/main.js | grep -q "sliceX: 13" && grep -A5 "castle-tiles" /Users/janis.kirsteins/Projects/LibaGame1/src/main.js | grep -q "sliceY: 8" && echo PASS || echo FAIL` - Expected: `PASS`
- [x] house-inside-tiles loadSprite has sliceX:13 and sliceY:17 - Verify: `grep -A5 "house-inside-tiles" /Users/janis.kirsteins/Projects/LibaGame1/src/main.js | grep -q "sliceX: 13" && grep -A5 "house-inside-tiles" /Users/janis.kirsteins/Projects/LibaGame1/src/main.js | grep -q "sliceY: 17" && echo PASS || echo FAIL` - Expected: `PASS`
- [x] Prison scene registered with required constants and label - Verify: `grep -qE "FLOOR_FRAME|WALL_FRAME|BAR_FRAME" /Users/janis.kirsteins/Projects/LibaGame1/src/main.js && grep -q "Prison Cell" /Users/janis.kirsteins/Projects/LibaGame1/src/main.js && grep -q "k.scene('prison')" /Users/janis.kirsteins/Projects/LibaGame1/src/main.js && echo PASS || echo FAIL` - Expected: `PASS` (NOTE: verify command has a false-negative - pattern `k.scene('prison')` doesn't match actual code `k.scene('prison',` - implementation is confirmed present via direct grep and visual confirmation in browser)
- [x] P key in debug scene navigates to prison - Verify: `grep -A2 "'p'" /Users/janis.kirsteins/Projects/LibaGame1/src/main.js | grep -q "prison" && echo PASS || echo FAIL` - Expected: `PASS`
- [x] Build succeeds - Verify: `cd /Users/janis.kirsteins/Projects/LibaGame1 && npm run build 2>&1 | tail -3 | grep -q "built in" && echo PASS || echo FAIL` - Expected: `PASS`

## Milestones

### M1: Copy the four missing canonical-named assets to misc/ ✅

- **Description:** Create canonically-named copies of 4 existing files already in `public/sprites/misc/`. All sources and destinations are in the same directory: `fountain.png` -> `fountain-face.png`, `bees.png` -> `small-bees.png`, `old-dark-tree-2.png` -> `old-dark-tree2.png`, `old-dark-tree-3.png` -> `old-dark-tree3.png`. These are copies (not renames) to avoid breaking any future references to the original names.
- **Verify:** `MISSING=$(for f in fountain-face.png small-bees.png old-dark-tree2.png old-dark-tree3.png; do test -f /Users/janis.kirsteins/Projects/LibaGame1/public/sprites/misc/$f || echo "MISSING $f"; done); [ -z "$MISSING" ] && echo PASS || echo "FAIL: $MISSING"` - Expected: `PASS`
- **Depends on:** none
- **Files likely touched:** `public/sprites/misc/fountain-face.png`, `public/sprites/misc/small-bees.png`, `public/sprites/misc/old-dark-tree2.png`, `public/sprites/misc/old-dark-tree3.png`

### M2: Load castle-tiles and house-inside-tiles sprites in main.js ✅

- **Description:** Add two `k.loadSprite` calls in the asset-loading section of `src/main.js` (after the existing four sprite loads, before the first scene). `castle-tiles` loads `sprites/tiles/castle.png` with `sliceX: 13, sliceY: 8` (castle.png is 416x256 = 13 cols x 8 rows at 32x32). `house-inside-tiles` loads `sprites/tiles/house-inside.png` with `sliceX: 13, sliceY: 17` (house-inside.png is 416x544 = 13 cols x 17 rows). No animations needed - these are pure tileset sprites accessed by frame index. Add a short comment per project style.
- **Verify:** `grep -A5 "castle-tiles" /Users/janis.kirsteins/Projects/LibaGame1/src/main.js | grep -q "sliceX: 13" && grep -A5 "castle-tiles" /Users/janis.kirsteins/Projects/LibaGame1/src/main.js | grep -q "sliceY: 8" && grep -A5 "house-inside-tiles" /Users/janis.kirsteins/Projects/LibaGame1/src/main.js | grep -q "sliceX: 13" && grep -A5 "house-inside-tiles" /Users/janis.kirsteins/Projects/LibaGame1/src/main.js | grep -q "sliceY: 17" && echo PASS || echo FAIL` - Expected: `PASS`
- **Depends on:** none
- **Files likely touched:** `src/main.js`

### M3: Add the prison scene to main.js ✅

- **Description:** Add `k.scene('prison', () => { ... })` after the existing `game` scene and before the `k.go('debug')` call at the bottom of `src/main.js`. The scene must:
  1. Define three named frame-index constants at the top of the scene (with a comment noting they are starting guesses and can be adjusted by inspecting the tile sheet): `const FLOOR_FRAME = 14;`, `const WALL_FRAME = 0;`, `const BAR_FRAME = 7;`
  2. **Stone floor (z:0):** Tile the full 800x600 canvas with `castle-tiles` frame `FLOOR_FRAME` using a double `for` loop over `x` (0 to 800, step 32) and `y` (0 to 600, step 32).
  3. **Perimeter walls (z:1):** In the same loop (or a second pass), replace tiles on the top row (`y === 0`), bottom row (`y === 576`), left column (`x === 0`), and right column (`x === 768`) with `WALL_FRAME`.
  4. **Prison bar row (z:2):** Draw a horizontal row of `BAR_FRAME` tiles at `y = 368` from `x = 32` to `x = 736` (inside the left and right walls). Add a comment: `// Prison Cell - front wall bars`.
  5. **Warrior (z:10):** Place the warrior sprite at `k.pos(400, 220)` with `k.anchor('center')`, `k.scale(2)`, playing `'idle-down'`.
  6. **Label (z:100):** Add `k.text('Prison Cell', { size: 24 })` at `k.pos(k.width() / 2, 20)`, `k.anchor('center')`, `k.color(k.Color.fromHex('#ffcc00'))`, `k.fixed()`.
- **Verify:** `grep -qE "FLOOR_FRAME|WALL_FRAME|BAR_FRAME" /Users/janis.kirsteins/Projects/LibaGame1/src/main.js && grep -q "Prison Cell" /Users/janis.kirsteins/Projects/LibaGame1/src/main.js && grep -q "k.scene('prison')" /Users/janis.kirsteins/Projects/LibaGame1/src/main.js && echo PASS || echo FAIL` - Expected: `PASS`
- **Depends on:** M2
- **Files likely touched:** `src/main.js`

### M4: Add P key binding in the debug scene ✅

- **Description:** In the debug scene in `src/main.js`, add `k.onKeyPress('p', () => { k.go('prison'); });` immediately after the existing `k.onKeyPress('g', ...)` binding (around line 274). Also update the help text string to append `| P: prison` so the key is discoverable on screen.
- **Verify:** `grep -A2 "'p'" /Users/janis.kirsteins/Projects/LibaGame1/src/main.js | grep -q "prison" && echo PASS || echo FAIL` - Expected: `PASS`
- **Depends on:** M3
- **Files likely touched:** `src/main.js`

### M5: Lint, format, and verify build ✅

- **Description:** Run `npm run lint:fix` then `npm run format` in the project root to auto-fix any style issues introduced by M2-M4, then run `npm run build` to confirm Vite compiles the project without errors. This is a pure quality gate - no source logic changes expected.
- **Verify:** `cd /Users/janis.kirsteins/Projects/LibaGame1 && npm run build 2>&1 | tail -3 | grep -q "built in" && echo PASS || echo FAIL` - Expected: `PASS`
- **Depends on:** M4
- **Files likely touched:** `src/main.js` (formatting only)

## Dependency Graph

```
M1 (copy assets)    M2 (load tilesets)
        \               /
         (independent, parallel)
                 |
               M3 (prison scene)
                 |
               M4 (P key binding)
                 |
               M5 (lint + build)
```

## Execution Schedule

Group 1 (start immediately): M1, M2
Group 2 (after M2 completes): M3
Group 3 (after M3 completes): M4
Group 4 (after M4 completes): M5

## Plan Data (JSON)

```json
{
  "title": "Prison Scene with Castle Tileset",
  "goal": "Copy 4 canonically-named aliases of existing misc/ sprites, load castle and house-inside tilesets in main.js, build a prison scene with tiled floor/walls/bars and idle warrior, and wire a P key in the debug scene to navigate there.",
  "created": "2026-02-28T00:00:00Z",
  "acceptance_criteria": [
    {
      "description": "All 4 canonical-named asset files exist in misc/",
      "verify_command": "MISSING=$(for f in fountain-face.png small-bees.png old-dark-tree2.png old-dark-tree3.png; do test -f /Users/janis.kirsteins/Projects/LibaGame1/public/sprites/misc/$f || echo \"MISSING $f\"; done); [ -z \"$MISSING\" ] && echo PASS || echo \"FAIL: $MISSING\"",
      "expected": "PASS"
    },
    {
      "description": "castle-tiles loadSprite has sliceX:13 and sliceY:8",
      "verify_command": "grep -A5 \"castle-tiles\" /Users/janis.kirsteins/Projects/LibaGame1/src/main.js | grep -q \"sliceX: 13\" && grep -A5 \"castle-tiles\" /Users/janis.kirsteins/Projects/LibaGame1/src/main.js | grep -q \"sliceY: 8\" && echo PASS || echo FAIL",
      "expected": "PASS"
    },
    {
      "description": "house-inside-tiles loadSprite has sliceX:13 and sliceY:17",
      "verify_command": "grep -A5 \"house-inside-tiles\" /Users/janis.kirsteins/Projects/LibaGame1/src/main.js | grep -q \"sliceX: 13\" && grep -A5 \"house-inside-tiles\" /Users/janis.kirsteins/Projects/LibaGame1/src/main.js | grep -q \"sliceY: 17\" && echo PASS || echo FAIL",
      "expected": "PASS"
    },
    {
      "description": "Prison scene registered with FLOOR_FRAME/WALL_FRAME/BAR_FRAME constants and Prison Cell label",
      "verify_command": "grep -qE \"FLOOR_FRAME|WALL_FRAME|BAR_FRAME\" /Users/janis.kirsteins/Projects/LibaGame1/src/main.js && grep -q \"Prison Cell\" /Users/janis.kirsteins/Projects/LibaGame1/src/main.js && grep -q \"k.scene('prison')\" /Users/janis.kirsteins/Projects/LibaGame1/src/main.js && echo PASS || echo FAIL",
      "expected": "PASS"
    },
    {
      "description": "P key in debug scene navigates to prison",
      "verify_command": "grep -A2 \"'p'\" /Users/janis.kirsteins/Projects/LibaGame1/src/main.js | grep -q \"prison\" && echo PASS || echo FAIL",
      "expected": "PASS"
    },
    {
      "description": "Vite build succeeds",
      "verify_command": "cd /Users/janis.kirsteins/Projects/LibaGame1 && npm run build 2>&1 | tail -3 | grep -q \"built in\" && echo PASS || echo FAIL",
      "expected": "PASS"
    }
  ],
  "milestones": [
    {
      "id": "M1",
      "title": "Copy the four missing canonical-named assets to misc/",
      "description": "Create canonically-named copies of 4 existing files in public/sprites/misc/: fountain.png -> fountain-face.png, bees.png -> small-bees.png, old-dark-tree-2.png -> old-dark-tree2.png, old-dark-tree-3.png -> old-dark-tree3.png.",
      "verify_command": "MISSING=$(for f in fountain-face.png small-bees.png old-dark-tree2.png old-dark-tree3.png; do test -f /Users/janis.kirsteins/Projects/LibaGame1/public/sprites/misc/$f || echo \"MISSING $f\"; done); [ -z \"$MISSING\" ] && echo PASS || echo \"FAIL: $MISSING\"",
      "expected_output": "PASS",
      "depends_on": [],
      "files_likely_touched": [
        "public/sprites/misc/fountain-face.png",
        "public/sprites/misc/small-bees.png",
        "public/sprites/misc/old-dark-tree2.png",
        "public/sprites/misc/old-dark-tree3.png"
      ],
      "estimated_size": "small"
    },
    {
      "id": "M2",
      "title": "Load castle-tiles and house-inside-tiles sprites in main.js",
      "description": "Add two k.loadSprite calls in main.js. castle-tiles: sprites/tiles/castle.png, sliceX:13, sliceY:8. house-inside-tiles: sprites/tiles/house-inside.png, sliceX:13, sliceY:17. No animations.",
      "verify_command": "grep -A5 \"castle-tiles\" /Users/janis.kirsteins/Projects/LibaGame1/src/main.js | grep -q \"sliceX: 13\" && grep -A5 \"castle-tiles\" /Users/janis.kirsteins/Projects/LibaGame1/src/main.js | grep -q \"sliceY: 8\" && grep -A5 \"house-inside-tiles\" /Users/janis.kirsteins/Projects/LibaGame1/src/main.js | grep -q \"sliceX: 13\" && grep -A5 \"house-inside-tiles\" /Users/janis.kirsteins/Projects/LibaGame1/src/main.js | grep -q \"sliceY: 17\" && echo PASS || echo FAIL",
      "expected_output": "PASS",
      "depends_on": [],
      "files_likely_touched": ["src/main.js"],
      "estimated_size": "small"
    },
    {
      "id": "M3",
      "title": "Add the prison scene to main.js",
      "description": "Add k.scene('prison', ...) with FLOOR_FRAME/WALL_FRAME/BAR_FRAME constants, tiled stone floor, perimeter walls, a prison bar row at y=368, the warrior at pos(400,220) playing idle-down, and a fixed Prison Cell label.",
      "verify_command": "grep -qE \"FLOOR_FRAME|WALL_FRAME|BAR_FRAME\" /Users/janis.kirsteins/Projects/LibaGame1/src/main.js && grep -q \"Prison Cell\" /Users/janis.kirsteins/Projects/LibaGame1/src/main.js && grep -q \"k.scene('prison')\" /Users/janis.kirsteins/Projects/LibaGame1/src/main.js && echo PASS || echo FAIL",
      "expected_output": "PASS",
      "depends_on": ["M2"],
      "files_likely_touched": ["src/main.js"],
      "estimated_size": "medium"
    },
    {
      "id": "M4",
      "title": "Add P key binding in the debug scene",
      "description": "In the debug scene, add k.onKeyPress('p', () => { k.go('prison'); }) after the G key binding. Update the help text to include | P: prison.",
      "verify_command": "grep -A2 \"'p'\" /Users/janis.kirsteins/Projects/LibaGame1/src/main.js | grep -q \"prison\" && echo PASS || echo FAIL",
      "expected_output": "PASS",
      "depends_on": ["M3"],
      "files_likely_touched": ["src/main.js"],
      "estimated_size": "small"
    },
    {
      "id": "M5",
      "title": "Lint, format, and verify build",
      "description": "Run npm run lint:fix, npm run format, then npm run build. Pure quality gate.",
      "verify_command": "cd /Users/janis.kirsteins/Projects/LibaGame1 && npm run build 2>&1 | tail -3 | grep -q \"built in\" && echo PASS || echo FAIL",
      "expected_output": "PASS",
      "depends_on": ["M4"],
      "files_likely_touched": ["src/main.js"],
      "estimated_size": "small"
    }
  ],
  "execution_schedule": [
    {
      "group": 1,
      "label": "start immediately",
      "milestone_ids": ["M1", "M2"]
    },
    {
      "group": 2,
      "label": "after M2 completes",
      "milestone_ids": ["M3"]
    },
    {
      "group": 3,
      "label": "after M3 completes",
      "milestone_ids": ["M4"]
    },
    {
      "group": 4,
      "label": "after M4 completes",
      "milestone_ids": ["M5"]
    }
  ]
}
```
