# Plan: Fix Thick Outline on Interactable Objects

## Goal

Make the interaction outline on objects (like the wooden stand) look thinner and more subtle by changing the outline color from pure opaque white to semi-transparent white, reducing visual weight without adding complexity.

## Context

The outline shader (src/main.js lines 283-310) creates a 1-texel border around sprite silhouettes. At the default 2x camera zoom, each game pixel becomes 2x2 screen pixels, so the outline appears 2 screen pixels thick. Combined with pure white color (`vec4(1.0, 1.0, 1.0, 1.0)`) against dark furniture, the outline looks chunky. With `texFilter: 'nearest'`, sub-texel sampling cannot produce thinner outlines - 1 texel is the minimum. The fix is to reduce the outline opacity so it blends with the background and appears visually lighter.

## Final Acceptance Criteria

- [ ] Old pure-white outline is gone AND new semi-transparent outline is present - Verify: `cd /Users/janis.kirsteins/Projects/LibaGame1 && grep -qP 'vec4\(1\.0,\s*1\.0,\s*1\.0,\s*1\.0\)' src/main.js && echo FAIL || (grep -qP 'vec4\(1\.0,\s*1\.0,\s*1\.0,\s*0\.[3-7]\)' src/main.js && echo PASS || echo FAIL)` - Expected: PASS
- [ ] Build and lint pass cleanly - Verify: `cd /Users/janis.kirsteins/Projects/LibaGame1 && npm run build > /dev/null 2>&1 && npm run lint > /dev/null 2>&1 && echo PASS || echo FAIL` - Expected: PASS

## Milestones

### M1: Change outline color from pure white to semi-transparent white

- **Description:** In the outline GLSL shader (src/main.js around line 304), change the outline color from `vec4(1.0, 1.0, 1.0, 1.0)` to `vec4(1.0, 1.0, 1.0, 0.5)` (alpha in the 0.3-0.7 range is acceptable). This reduces the visual contrast of the 1-texel outline, making it appear thinner and less chunky without any shader architecture changes. The outline thickness remains 1 texel, but lower alpha blends it with the background so it reads as lighter and less dominant.
- **Verify:** `cd /Users/janis.kirsteins/Projects/LibaGame1 && grep -qP 'vec4\(1\.0,\s*1\.0,\s*1\.0,\s*0\.[3-7]\)' src/main.js && echo PASS || echo FAIL` - Expected: PASS
- **Depends on:** none
- **Files likely touched:** src/main.js

### M2: Verify build and lint pass

- **Description:** Run the project build and linter to confirm the shader string change introduces no syntax errors or lint violations. Fix any formatting issues if needed.
- **Verify:** `cd /Users/janis.kirsteins/Projects/LibaGame1 && npm run build > /dev/null 2>&1 && npm run lint > /dev/null 2>&1 && echo PASS || echo FAIL` - Expected: PASS
- **Depends on:** M1
- **Files likely touched:** none (verification only)

## Dependency Graph

```
M1 (change outline alpha)
 |
 v
M2 (build + lint check)
```

## Execution Schedule

Group 1 (start immediately): M1
Group 2 (after M1): M2
