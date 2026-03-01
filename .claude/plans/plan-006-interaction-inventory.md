# Plan: Proximity-Based Interaction System & Inventory

## Goal

Add a keyboard-first system for interacting with nearby LDtk entities (chests, doors, etc.) using proximity detection, focus cycling, outline highlighting, and interaction prompts, plus a simple inventory UI - all integrated into the existing prison scene and designed for future extensibility.

## Final Acceptance Criteria

- [x] Build succeeds - Verify: `cd /Users/janis.kirsteins/Projects/LibaGame1 && npm run build` - Expected: exit code 0
- [x] Lint passes - Verify: `cd /Users/janis.kirsteins/Projects/LibaGame1 && npm run lint -- --max-warnings 0` - Expected: exit code 0
- [x] Format correct - Verify: `cd /Users/janis.kirsteins/Projects/LibaGame1 && npm run format:check` - Expected: exit code 0
- [x] renderLdtkLevel returns entities alongside level and walls - Verify: `cd /Users/janis.kirsteins/Projects/LibaGame1 && grep -n "return.*{.*level.*walls.*entities" src/ldtk-loader.js && grep -n "entities\.push" src/ldtk-loader.js && echo PASS` - Expected: PASS
- [x] createInteractionSystem has behavioral markers - Verify: `node -e "const src = require('fs').readFileSync('/Users/janis.kirsteins/Projects/LibaGame1/src/interaction.js','utf8'); const ok = src.includes('setupInteraction') && src.includes('interactRange') && src.includes('focusIndex') && src.includes('setUIOpen') && src.includes('onInteract'); console.log(ok ? 'PASS' : 'FAIL')"` - Expected: PASS
- [x] Inventory module has correct signature and markers - Verify: `node -e "const src = require('fs').readFileSync('/Users/janis.kirsteins/Projects/LibaGame1/src/inventory.js','utf8'); const ok = src.includes('createInventory') && src.includes('openInventoryUI') && /function openInventoryUI\\s*\\(\\s*k\\s*,\\s*inventory/.test(src); console.log(ok ? 'PASS' : 'FAIL')"` - Expected: PASS
- [x] Prison scene wires up both systems with key hints - Verify: `node -e "const src = require('fs').readFileSync('/Users/janis.kirsteins/Projects/LibaGame1/src/main.js','utf8'); const ok = src.includes('createInventory') && src.includes('setupInteraction') && src.includes('E: interact') && src.includes('Q: inventory'); console.log(ok ? 'PASS' : 'FAIL')"` - Expected: PASS
- [x] Handler return values are captured in ldtk-loader - Verify: `node -e "const src = require('fs').readFileSync('/Users/janis.kirsteins/Projects/LibaGame1/src/ldtk-loader.js','utf8'); const ok = /=\s*handler\(entity\)/.test(src) || /const\s+\w+\s*=\s*handler\(/.test(src); console.log(ok ? 'PASS' : 'FAIL')"` - Expected: PASS

## Milestones

### M1: Extend renderLdtkLevel to return spawned entity references [DONE]

- **Description:** Modify `renderLdtkLevel()` in `src/ldtk-loader.js` to capture entity handler return values and return them as part of the result. Changes: (1) Create an `entities` array at the start of the function. (2) When an entity handler is called, capture its return value: `const result = handler(entity)`. If the handler returns a game object (truthy), push it into `entities`. If it returns an array, push all elements. Returning undefined is ignored (backward compatible with existing handlers). (3) Return `{ level, walls, entities }` instead of `{ level, walls }`. (4) Update the destructuring in `src/main.js` where `renderLdtkLevel` is called to also capture `entities`.
- **Verify:** `cd /Users/janis.kirsteins/Projects/LibaGame1 && grep -n "return.*{.*level.*walls.*entities" src/ldtk-loader.js && grep -n "entities\.push" src/ldtk-loader.js && echo "M1 OK"`
- **Depends on:** none
- **Files likely touched:** `src/ldtk-loader.js`, `src/main.js`

### M2: Create a simple inventory module [DONE]

- **Description:** Create `src/inventory.js` with two exported functions: (1) `createInventory()` returns an inventory object with methods: `add(itemName)` pushes a string, `remove(itemName)` splices first match, `has(itemName)` uses includes, `list()` returns array copy, `count()` returns length. Internally just a plain string array. (2) `openInventoryUI(k, inventory, onClose)` creates a fixed-position overlay (z=300) with dark semi-transparent background, title "Inventory" in yellow, lists items as text rows or shows "Empty" if none. Press Q or Escape to close, which calls `onClose()` and destroys the overlay. Returns the root game object so caller can destroy it if needed. The inventory object is created once per scene and passed around (not a global singleton).
- **Verify:** `cd /Users/janis.kirsteins/Projects/LibaGame1 && node -e "const fs = require('fs'); const src = fs.readFileSync('src/inventory.js', 'utf8'); const checks = [[/export\\s+function\\s+createInventory/, 'createInventory exported'], [/export\\s+function\\s+openInventoryUI/, 'openInventoryUI exported'], [/function\\s+openInventoryUI\\s*\\(\\s*k\\s*,\\s*inventory/, 'correct signature']]; let ok = true; for (const [re, label] of checks) { if (!re.test(src)) { console.error('FAIL: ' + label); ok = false; } } if (ok) console.log('M2 OK'); else process.exit(1);"`
- **Depends on:** none
- **Files likely touched:** `src/inventory.js` (new file)

### M3: Create the proximity-based interaction system [DONE]

- **Description:** Create `src/interaction.js` with exported function `setupInteraction(k, player, entities)` called once after level load. Returns a cleanup function. Entity opt-in via `interactable: true` property on the game object. Behavior: (a) Always-visible indicator - during `onDraw`, every entity with `interactable: true` gets a small pulsing dot drawn above it, visible from any distance for discoverability. (b) Proximity detection via `onUpdate` - each frame, filter entities to those with `interactable: true` within `interactRange` (default 72px) of player. Sort by distance. Store as `nearbyEntities` array. (c) Focus tracking - maintain a `focusIndex`, focused entity is `nearbyEntities[focusIndex]`. Clamp when entities leave/enter range. (d) Highlight on focused entity - draw outline effect and "E: [interactLabel]" text prompt above entity via `onDraw`. (e) F key cycles focusIndex (wraps around). (f) E key calls `focusedEntity.onInteract()` if defined, silently ignored if nothing focused. (g) Guard via exported `setUIOpen(val)` - when true, E and F presses are ignored. Also export `setUIOpen` so dialogue/inventory can suppress interactions. Important: highlight and label drawn in `onDraw` use world coordinates (Kaplay handles camera transform automatically in onDraw).
- **Verify:** `cd /Users/janis.kirsteins/Projects/LibaGame1 && node -e "const fs = require('fs'); const src = fs.readFileSync('src/interaction.js', 'utf8'); const checks = [[/export\\s+function\\s+setupInteraction/, 'setupInteraction exported'], [/interactRange/, 'interactRange'], [/72/, 'default range 72'], [/focusIndex/, 'focus tracking'], [/onKeyPress.*['\"]f['\"]/, 'F key'], [/onKeyPress.*['\"]e['\"]/, 'E key'], [/setUIOpen/, 'UI guard']]; let ok = true; for (const [re, label] of checks) { if (!re.test(src)) { console.error('FAIL: ' + label); ok = false; } } if (ok) console.log('M3 OK'); else process.exit(1);"`
- **Depends on:** M1
- **Files likely touched:** `src/interaction.js` (new file)

### M4: Wire up WoodenStand and key hints in the prison scene [DONE]

- **Description:** In `src/main.js`, inside the prison scene: (1) Import `createInventory` and `openInventoryUI` from `./inventory.js`, and `setupInteraction` and `setUIOpen` from `./interaction.js`. (2) Create inventory: `const inventory = createInventory()`. (3) Destructure `entities` from `renderLdtkLevel` return. (4) Add a `WoodenStand` entity handler that creates a game object with `interactable: true`, `interactLabel: "Search"`, reads `contents` field (Array with `.length > 0` check), stores contents on the object, adds an `onInteract` callback that shows a dialogue listing found items ("You found: Rusty Nail!"), adds each item to inventory, and sets `searched = true`. Subsequent interactions show "Nothing left here." Uses `setUIOpen(true/false)` around dialogue. Returns the game object. (5) Call `setupInteraction(k, player, entities)` after level load. (6) Wire Q key to open inventory: sets `setUIOpen(true)`, calls `openInventoryUI(k, inventory, onClose)`, onClose sets `setUIOpen(false)`. (7) Wire dialogue system: set `setUIOpen(true)` when dialogue starts, `setUIOpen(false)` when it ends (replacing or extending the existing `dialogueActive` flag). (8) Replace the existing "C: colliders" hint label with a unified persistent key-hint bar: "E: interact | Q: inventory | F: next item | C: colliders". (9) PrisonDoor interaction is out of scope for this plan.
- **Verify:** `cd /Users/janis.kirsteins/Projects/LibaGame1 && node -e "const fs = require('fs'); const src = fs.readFileSync('src/main.js', 'utf8'); const checks = [[/import.*createInventory.*from.*inventory/, 'inventory import'], [/import.*setupInteraction.*from.*interaction/, 'interaction import'], [/createInventory\\(\\)/, 'inventory created'], [/setupInteraction\\s*\\(/, 'interaction setup'], [/interactable.*true/, 'WoodenStand interactable'], [/inventory\\.add/, 'items added to inventory'], [/searched/, 'searched flag'], [/onKeyPress.*['\"]q['\"]/, 'Q key'], [/E:.*interact.*Q:.*inventory.*F:.*next/, 'key hints']]; let ok = true; for (const [re, label] of checks) { if (!re.test(src)) { console.error('FAIL: ' + label); ok = false; } } if (ok) console.log('M4 OK'); else process.exit(1);"`
- **Depends on:** M1, M2, M3
- **Files likely touched:** `src/main.js`

### M5: Lint, format, and build verification [DONE]

- **Description:** Run `npm run lint:fix` and `npm run format` to auto-fix any code style issues in all new and modified files. Then verify `npm run build` succeeds and `npm run lint -- --max-warnings 0` passes. Fix any remaining issues.
- **Verify:** `cd /Users/janis.kirsteins/Projects/LibaGame1 && npm run format && npm run lint:fix && npm run build && echo "M5 OK"`
- **Depends on:** M4
- **Files likely touched:** `src/main.js`, `src/ldtk-loader.js`, `src/inventory.js`, `src/interaction.js`

## Dependency Graph

```
M1 (ldtk-loader: return entities)   M2 (inventory module)
         |                                  |
         v                                  |
M3 (interaction system)                     |
         |                                  |
         +------------------+---------------+
                            |
                            v
                   M4 (wire up in prison scene)
                            |
                            v
                   M5 (lint + format + build)
```

## Execution Schedule

Group 1 (start immediately, parallel): M1, M2
Group 2 (after M1): M3
Group 3 (after M2, M3): M4
Group 4 (after M4): M5
