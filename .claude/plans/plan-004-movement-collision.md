# Plan: Movement and Collision System for LDtk Levels

## Context

The prison scene currently renders tiles and entities from LDtk but has no player movement or collision. The game scene has basic arrow-key movement but only boundary-clamping (no tile collision). We need a proper collision system that is data-driven (reads from LDtk), reusable across any future level, and doesn't hardcode tile IDs or entity names.

The approach: use an **IntGrid collision layer** in LDtk for wall collision, and a **`solid` boolean field** on entity definitions for entity collision. Kaplay's built-in `area()` + `body()` physics handles collision resolution automatically.

## LDtk Manual Steps (user must do in LDtk editor)

Before the code works, the user needs to make two changes in the LDtk editor:

1. **Add an IntGrid layer** named "Collision" above the tile layers. Paint value 1 on solid cells (walls, floor edges, ceiling) and leave walkable cells as 0.
2. **Add a `solid` boolean field** (default false) to entity definitions that may block movement. Set `solid=true` on Doors instances. Leave Gulta (beds), Skapitis (wardrobe), and Drunk as `solid=false`.

## Goal

Add arrow-key player movement with walk/idle animation to the prison scene, plus a reusable collision system that reads wall data from an LDtk IntGrid layer and blocking data from a `solid` boolean field on entities. The system must work with any LDtk level without code changes.

## Final Acceptance Criteria

- [x] IntGrid collision processing exists in loader - Verify: `cd /Users/janis.kirsteins/Projects/LibaGame1 && grep -q "intGridCsv" src/ldtk-loader.js && grep -q "isStatic" src/ldtk-loader.js && echo PASS || echo FAIL` - Expected: PASS
- [x] Entity solid field support exists in loader - Verify: `grep -q "fieldInstances" src/ldtk-loader.js && grep -q "solid" src/ldtk-loader.js && echo PASS || echo FAIL` - Expected: PASS
- [x] Player movement with collision in prison scene - Verify: `grep -q "isKeyDown" src/main.js && grep -q "area()" src/main.js && grep -q "body()" src/main.js && echo PASS || echo FAIL` - Expected: PASS
- [x] Code passes lint and builds - Verify: `cd /Users/janis.kirsteins/Projects/LibaGame1 && npm run lint && npm run build` - Expected: Exit code 0
- [x] Loader module parses without errors - Verify: `cd /Users/janis.kirsteins/Projects/LibaGame1 && node -e "import('./src/ldtk-loader.js')" 2>&1 | grep -q "Error" && echo FAIL || echo PASS` - Expected: PASS

## Milestones

### M1: Add IntGrid collision body creation to ldtk-loader.js [DONE]

- **Description:** Add a function to `ldtk-loader.js` that finds the first IntGrid layer in a level (by `__type === 'IntGrid'`), reads its `intGridCsv` array, and for each cell with value >= 1, creates an invisible static collision body: `k.add([k.pos(x, y), k.rect(gridSize, gridSize), k.area(), k.body({ isStatic: true }), k.opacity(0), 'wall'])`. The function uses the layer's `__gridSize` and `__cWid` to compute pixel positions. If no IntGrid layer is found, skip gracefully (no crash). Call this from `renderLdtkLevel()` and include the collision bodies in the return value. Add a doc comment block at the top of the function explaining the IntGrid layer requirement for future level designers.
- **Verify:** `cd /Users/janis.kirsteins/Projects/LibaGame1 && grep -q "intGridCsv" src/ldtk-loader.js && grep -q "isStatic" src/ldtk-loader.js && grep -q "area()" src/ldtk-loader.js && echo PASS || echo FAIL` - Expected: PASS
- **Depends on:** none
- **Files likely touched:** `src/ldtk-loader.js`

### M2: Add `solid` entity field support + getEntityField helper to ldtk-loader.js [DONE]

- **Description:** Add an exported helper function `getEntityField(entity, fieldName)` that looks up a field's `__value` from `entity.fieldInstances` by `__identifier`. In the default entity renderer (inside `renderLdtkLevel()`), after rendering entity tiles, check if the entity has `solid === true`. If so, create an additional game object covering the entity's bounding box with `k.area()`, `k.body({ isStatic: true })`, `k.opacity(0)`, and tag `'wall'`. If the entity has no `fieldInstances` or no `solid` field, skip gracefully (treat as non-solid). For entities with custom handlers, the handler receives the raw entity object and can call `getEntityField(entity, 'solid')` itself. Add a doc comment explaining the `solid` field convention.
- **Verify:** `cd /Users/janis.kirsteins/Projects/LibaGame1 && grep -q "getEntityField" src/ldtk-loader.js && grep -q "solid" src/ldtk-loader.js && grep -q "export" src/ldtk-loader.js && echo PASS || echo FAIL` - Expected: PASS
- **Depends on:** none
- **Files likely touched:** `src/ldtk-loader.js`

### M3: Add player movement and collision to the prison scene [DONE]

- **Description:** In the prison scene's Hero entity handler in `src/main.js`:
  1. Add `k.area({ shape: new k.Rect(k.vec2(-10, -16), 20, 16) })` and `k.body()` to the player game object (small collision box at feet, matching the 16px grid).
  2. Store a reference to the player object (needs to be accessible outside the handler since handlers run during `renderLdtkLevel()`).
  3. Add an `onUpdate` handler with arrow key movement: `k.isKeyDown('left/right/up/down')` calling `player.move()`, SPEED=80.
  4. Walk/idle animation switching (same pattern as game scene): track `moving` state, play 'walk' when starting to move, 'idle' when stopping.
  5. Directional sprite flipping: warrior faces left naturally, so `flipX=false` for left, `flipX=true` for right.
  6. Camera follows player: `k.setCamPos(player.pos)` each frame, clamped to level bounds so camera doesn't show outside the level.
  7. Add a `dialogueActive` flag. Set it to `true` before `startDialogue()`, clear in the `onComplete` callback. Skip all movement input when `dialogueActive` is true. Reset to idle animation when dialogue ends.
- **Verify:** `cd /Users/janis.kirsteins/Projects/LibaGame1 && grep -q "isKeyDown" src/main.js && grep -q "area()" src/main.js && grep -q "body()" src/main.js && grep -q "dialogueActive" src/main.js && echo PASS || echo FAIL` - Expected: PASS
- **Depends on:** M1, M2
- **Files likely touched:** `src/main.js`

### M4: Add debug collision visualization toggle [DONE]

- **Description:** Add a `c` key toggle in the prison scene that shows/hides collision boxes. When pressed, find all game objects tagged `'wall'` and toggle their opacity between 0 (invisible) and 0.3 with a red color tint. Add a small fixed UI hint label showing "C: colliders" in the corner. This is essential for debugging since the IntGrid collision layer is invisible by default and alignment issues would be hard to diagnose.
- **Verify:** `cd /Users/janis.kirsteins/Projects/LibaGame1 && grep -q "onKeyPress.*[\"']c[\"']" src/main.js && grep -q "opacity" src/main.js && echo PASS || echo FAIL` - Expected: PASS
- **Depends on:** M3
- **Files likely touched:** `src/main.js`

### M5: Lint, format, and verify build [DONE]

- **Description:** Run `npm run lint:fix` and `npm run format` to ensure all code passes ESLint and Prettier. Fix any warnings introduced (unused vars, prefer-const, etc.). Run `npm run build` to confirm Vite builds without errors.
- **Verify:** `cd /Users/janis.kirsteins/Projects/LibaGame1 && npm run lint -- --max-warnings 0 && npm run build 2>&1 | grep -q "built in" && echo PASS || echo FAIL` - Expected: PASS
- **Depends on:** M3, M4
- **Files likely touched:** `src/main.js`, `src/ldtk-loader.js`

## Dependency Graph

```
M1 (IntGrid collision)    M2 (entity solid field)
         \                  /
          \                /
           M3 (player movement + collision)
            |
           M4 (debug viz toggle)
            |
           M5 (lint + build)
```

## Execution Schedule

Group 1 (start immediately): M1, M2
Group 2 (after M1, M2): M3
Group 3 (after M3): M4
Group 4 (after M3, M4): M5

## Design Decisions

### Entity blocking field name: `solid`

Short, self-explanatory, matches standard game engine terminology. When `true`, the entity blocks movement. When `false` or absent, the entity is traversable.

### Player collision shape

A 20x16px rectangle at the character's feet (anchor='bot'). The warrior frame is 80x64 with padding - using a small foot box means the player's head can overlap walls above, creating the depth illusion common in top-down games. The 16px height matches the grid size.

### Movement speed

SPEED=80 px/s. The prison level is only 368x96px, so slower than the game scene's 150. Feels appropriate for a confined space.

### Camera behavior

Camera follows the player each frame, clamped to level bounds. At zoom 2 (default), the viewport (400x300) is larger than the level (368x96), so the camera stays roughly centered. At higher zoom levels, the camera follows meaningfully.

### Graceful degradation

If no IntGrid layer exists in a level, collision creation is silently skipped (the level just has no wall collision). If an entity lacks a `solid` field, it is treated as non-solid. This means the game still runs even before the user edits the LDtk file - just without collision.

## Key Files

- `src/ldtk-loader.js` - IntGrid collision body creation, `solid` field handling, `getEntityField` export
- `src/main.js` - Prison scene: player movement, collision components, debug toggle, dialogue flag
