# Plan: Fix Outline Shader to Use Actual GPU Texture Dimensions

## Goal

Fix the massive white fill on interactable objects caused by the outline shader using incorrect UV step values, and add an entity/outline debug mode to the debug scene for visual verification.

## Root Cause Analysis

The outline shader steps through neighboring texels to detect edges. Currently:

```javascript
const stepX = 1 / (cols * gridSize); // 1 / (15 * 32) = 1/480
const stepY = 1 / (rows * gridSize); // 1 / (13 * 32) = 1/416
```

This assumes the GPU texture is exactly 480x416 pixels (the source image size). However, Kaplay's fragment shader `uv` parameter maps to the **actual GPU texture**, not the source image. Kaplay has an internal texture atlas packing system (`spriteAtlasPadding` option). If sprites are repacked into a larger internal atlas, `1/480` steps multiple texels instead of 1, creating a thick white outline that fills transparent padding with white.

The fix: read `k.getSprite('furniture-tiles').data.tex.width/.height` for actual GPU texture dimensions and use `1/texWidth` as the step.

## Final Acceptance Criteria

- [x] Step values use actual texture dimensions AND old hardcoded calculation is removed - Verify: `cd /Users/janis.kirsteins/Projects/LibaGame1 && grep -q 'tex\.width\|tex\.height' src/main.js && ! grep -q '1 / (cols \* gridSize)\|1 / (rows \* gridSize)' src/main.js && echo PASS || echo FAIL` - Expected: PASS
- [x] Debug scene has entity/outline toggle - Verify: `cd /Users/janis.kirsteins/Projects/LibaGame1 && grep -q "onKeyPress.*'o'" src/main.js && grep -q 'outlineMode' src/main.js && echo PASS || echo FAIL` - Expected: PASS
- [x] Build and lint pass - Verify: `cd /Users/janis.kirsteins/Projects/LibaGame1 && npm run build > /dev/null 2>&1 && npm run lint > /dev/null 2>&1 && echo PASS || echo FAIL` - Expected: PASS

## Milestones

### M1: Fix outline step values to use actual GPU texture dimensions [DONE]

- **Description:** In the WoodenStand entity handler (src/main.js around line 1089), replace the hardcoded step calculation (`1 / (cols * gridSize)`) with values derived from the actual GPU texture. Retrieve the sprite data via `k.getSprite('furniture-tiles').data.tex` and compute `stepX = 1 / tex.width` and `stepY = 1 / tex.height`. Keep `cols` and `gridSize` for frame index calculation (they're still needed for `startRow * cols + startCol`). Add a fallback to the old calculation if `.data` is null, with a console.warn.
- **Verify:** `cd /Users/janis.kirsteins/Projects/LibaGame1 && grep -q 'tex\.width\|tex\.height' src/main.js && ! grep -q '1 / (cols \* gridSize)\|1 / (rows \* gridSize)' src/main.js && echo PASS || echo FAIL` - Expected: PASS
- **Depends on:** none
- **Files likely touched:** src/main.js (WoodenStand handler, lines ~1078-1120)

### M2: Add entity/outline debug mode to the debug scene [DONE]

- **Description:** Add an `outlineMode` toggle (O key) to the debug scene that shows a furniture-tiles sprite with the outline shader applied, centered on screen. When active: show the sprite with outline enabled, display debug text labels showing actual texture dimensions (texW x texH), step values, and current frame index. Left/Right arrows cycle through frames. Pressing O again toggles the outline off while keeping the sprite visible (to compare with/without outline). Pressing O a third time exits outline mode. Update the help text at the top to include "O: outline". This provides a permanent visual tool for verifying outline behavior on any furniture tile frame.
- **Verify:** `cd /Users/janis.kirsteins/Projects/LibaGame1 && grep -q "onKeyPress.*'o'" src/main.js && grep -q 'outlineMode' src/main.js && grep -q 'stepX\|stepY' src/main.js && echo PASS || echo FAIL` - Expected: PASS
- **Depends on:** M1 (needs the texture-based step calculation to show correct behavior)
- **Files likely touched:** src/main.js (debug scene, lines 317-732)

### M3: Lint, format, and final build check [DONE]

- **Description:** Run `npm run lint:fix` and `npm run format` to ensure code style compliance, then `npm run build` to confirm no build errors. Fix any issues found.
- **Verify:** `cd /Users/janis.kirsteins/Projects/LibaGame1 && npm run build > /dev/null 2>&1 && npm run lint > /dev/null 2>&1 && echo PASS || echo FAIL` - Expected: PASS
- **Depends on:** M1, M2
- **Files likely touched:** src/main.js (formatting only)

## Dependency Graph

```
M1 (fix step values)
 |  \
 |   v
 |   M2 (debug outline mode)
 |  /
 v v
M3 (lint/build)
```

## Execution Schedule

Group 1 (start immediately): M1
Group 2 (after M1): M2
Group 3 (after M1 + M2): M3

## Notes

- Currently only the WoodenStand entity uses the outline shader (confirmed via grep). If other entities (PrisonDoor, DoubleDoor, Gulta) get outlines later, they'll need the same texture-based step calculation for their respective tilesets.
- After the step fix, the outline will be genuinely 1px thick. The full-opacity white color (`vec4(1,1,1,1)`) may look fine at that thickness. If the user still wants it softer, reducing the alpha (e.g., 0.5) is a trivial follow-up change.
- The debug viewer in M2 makes future outline tuning much easier since the user can toggle outlines and inspect different frames without loading the full game.
