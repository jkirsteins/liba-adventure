# Plan: Reusable RPG Dialogue System with Drunk Cellmate Conversation

## Goal

Create a reusable dialogue module (`src/dialogue.js`) that renders an RPG-style dialogue box UI and supports NPC lines and player choices, then use it to implement the first dialogue where a drunk cellmate speaks to the hero upon entering the prison scene.

## Final Acceptance Criteria

- [x] Dialogue module exists and is importable - Verify: `node -e "import('./src/dialogue.js').then(m => { if (typeof m.startDialogue !== 'function') throw 'missing'; console.log('PASS'); })"` - Expected: "PASS"
- [x] ESLint passes with zero warnings - Verify: `cd /Users/janis.kirsteins/Projects/LibaGame1 && npx eslint src/ --max-warnings 0` - Expected: exit code 0
- [x] Prettier formatting is clean - Verify: `cd /Users/janis.kirsteins/Projects/LibaGame1 && npx prettier --check "src/**/*.js"` - Expected: exit code 0
- [x] Build succeeds without errors - Verify: `cd /Users/janis.kirsteins/Projects/LibaGame1 && npx vite build 2>&1 | grep -q 'built in' && echo PASS || echo FAIL` - Expected: "PASS"
- [x] No TypeScript files exist - Verify: `find /Users/janis.kirsteins/Projects/LibaGame1/src -name "*.ts" | wc -l | tr -d ' '` - Expected: "0"
- [x] Dialogue data is referenced in main.js - Verify: `grep -q 'PRISON_DRUNK_DIALOGUE' /Users/janis.kirsteins/Projects/LibaGame1/src/main.js && echo PASS || echo FAIL` - Expected: "PASS"
- [x] Dialogue module has no top-level side effects - Verify: `cd /Users/janis.kirsteins/Projects/LibaGame1 && npx eslint src/dialogue.js --max-warnings 0` - Expected: exit code 0
- [x] Smoke test passes - Verify: `cd /Users/janis.kirsteins/Projects/LibaGame1 && node -e "import('./src/dialogue.js').then(m => { const handlers = {}; const mockK = { add() { return { destroy() {}, text: '', use() {} }; }, width() { return 800; }, height() { return 600; }, onKeyPress(key, cb) { handlers[key] = cb; return { cancel() {} }; }, onUpdate() { return { cancel() {} }; } }; let done = false; m.startDialogue(mockK, [{ speaker: 'Test', text: 'Hello' }], () => { done = true; }); if (handlers['space']) handlers['space'](); if (!done) throw 'onComplete not called'; console.log('SMOKE_PASS'); })"` - Expected: "SMOKE_PASS"

## Milestones

### M1: Create the dialogue data format and module skeleton [DONE]

- **Description:** Create `src/dialogue.js` with the exported `startDialogue` function signature and supporting types documented in JSDoc comments. Define the dialogue data format: an array of step objects where each step is either `{ speaker, text }` for NPC lines or `{ speaker, prompt, choices: [{ text }] }` for player choices. Export `startDialogue(k, dialogueSteps, onComplete)` as the main entry point. The function body can initially just call `onComplete()` immediately (stub). Also define and export `PRISON_DRUNK_DIALOGUE` as the dialogue data array with the medieval-themed drunk cellmate conversation (2-3 NPC lines, one choice with 2 options, and a follow-up NPC reaction). Ensure the module has no top-level side effects (only exports).
- **Verify:** `cd /Users/janis.kirsteins/Projects/LibaGame1 && npx eslint src/dialogue.js --max-warnings 0 && node -e "import('./src/dialogue.js').then(m => { if (typeof m.startDialogue !== 'function') throw 'no startDialogue'; if (!Array.isArray(m.PRISON_DRUNK_DIALOGUE)) throw 'no dialogue data'; console.log('PASS'); })"` - Expected: "PASS" with exit code 0
- **Depends on:** none
- **Files likely touched:** `src/dialogue.js`

### M2: Implement the dialogue box UI rendering [DONE]

- **Description:** Implement the core of `startDialogue` to render a semi-transparent dialogue box at the bottom of the screen. The box should use `k.fixed()` so it stays in place regardless of camera position, and `k.z(200)` to appear above all game content. It should show: (1) a dark semi-transparent background rectangle spanning the bottom ~150px of the 800x600 window, (2) the speaker name in a distinct color (yellow/gold) at the top-left of the box, (3) the dialogue text in white below the name. Use `k.text()` with a pixel-appropriate font size (16-20px). The function should step through NPC lines one at a time - each line waits for the player to press Space or Enter to advance. When all steps are consumed, call `onComplete` and destroy all dialogue UI game objects. The function must be fully synchronous in its setup (no async) - use `k.onKeyPress` callbacks to advance state.
- **Verify:** `cd /Users/janis.kirsteins/Projects/LibaGame1 && npx eslint src/dialogue.js --max-warnings 0 && node -e "import('./src/dialogue.js').then(m => { const src = m.startDialogue.toString(); if (src.length < 300) throw 'stub too short - UI not implemented'; if (!src.includes('.fixed(')) throw 'missing .fixed()'; if (!src.includes('.rect(')) throw 'missing .rect()'; if (!src.includes('.text(')) throw 'missing .text()'; if (!src.includes('.z(')) throw 'missing .z()'; if (!src.includes('onKeyPress')) throw 'missing onKeyPress'; console.log('PASS'); })"` - Expected: "PASS"
- **Depends on:** M1
- **Files likely touched:** `src/dialogue.js`

### M3: Implement player choice UI [DONE]

- **Description:** Extend the dialogue stepping logic to handle choice steps. When the current step has a `choices` array, render the choices as a vertical list within the dialogue box. Highlight the currently selected choice (e.g., yellow text with a `>` prefix, others in gray). Arrow keys (Up/Down) navigate between choices. Space or Enter confirms the selection. After a choice is made, advance to the next step. Key handlers for choices must be cleaned up properly when the dialogue ends or moves past the choice step (use Kaplay's cancel pattern: store the return value of `k.onKeyPress` and call `.cancel()`).
- **Verify:** `cd /Users/janis.kirsteins/Projects/LibaGame1 && npx eslint src/dialogue.js --max-warnings 0 && node -e "import('./src/dialogue.js').then(m => { const src = m.startDialogue.toString(); if (!src.includes('choices')) throw 'missing choice handling'; if (!src.includes(\"'up'\")) throw 'missing up arrow key'; if (!src.includes(\"'down'\")) throw 'missing down arrow key'; console.log('PASS'); })"` - Expected: "PASS"
- **Depends on:** M2
- **Files likely touched:** `src/dialogue.js`

### M4: Add a press-to-continue indicator for NPC lines [DONE]

- **Description:** Add a small flashing indicator (e.g., blinking text like "[Space]") at the bottom-right of the dialogue box when waiting for the player to press Space/Enter to advance past an NPC line. The indicator should blink using a `k.onUpdate` timer toggling opacity every 0.5s. The indicator should not appear during choice steps. Clean up the indicator game object when advancing to the next step.
- **Verify:** `cd /Users/janis.kirsteins/Projects/LibaGame1 && npx eslint src/dialogue.js --max-warnings 0 && node -e "import('./src/dialogue.js').then(m => { const src = m.startDialogue.toString(); if (!src.includes('onUpdate')) throw 'missing onUpdate for blink timer'; if (!src.includes('opacity')) throw 'missing opacity toggle'; console.log('PASS'); })"` - Expected: "PASS"
- **Depends on:** M2
- **Files likely touched:** `src/dialogue.js`

### M5: Wire dialogue into the prison scene with the Drunk entity [DONE]

- **Description:** In `src/main.js`, import `startDialogue` and `PRISON_DRUNK_DIALOGUE` from `src/dialogue.js`. Add a `Drunk` entity handler in the prison scene's `renderLdtkLevel` call (alongside the existing `Hero` handler) that renders the drunk NPC sprite from the tavern-npcs spritesheet at the entity's LDtk position. After the level renders, use `k.wait(1.5, ...)` to trigger the dialogue after a brief pause so the player can see the prison first. Call `startDialogue(k, PRISON_DRUNK_DIALOGUE, () => { /* dialogue finished */ })`.
- **Verify:** `cd /Users/janis.kirsteins/Projects/LibaGame1 && npx eslint src/ --max-warnings 0 && npx prettier --check "src/**/*.js" && grep -q 'PRISON_DRUNK_DIALOGUE' src/main.js && grep -q 'startDialogue' src/main.js && grep -q 'Drunk' src/main.js && echo PASS || echo FAIL` - Expected: "PASS"
- **Depends on:** M3, M4
- **Files likely touched:** `src/main.js`

### M6: Final lint, format, and build verification [DONE]

- **Description:** Run `npm run lint:fix` and `npm run format` to ensure all code passes the project's quality checks. Run `npm run build` to verify the production build succeeds. Fix any issues found.
- **Verify:** `cd /Users/janis.kirsteins/Projects/LibaGame1 && npx eslint src/ --max-warnings 0 && npx prettier --check "src/**/*.js" && npx vite build 2>&1 | grep -q 'built in' && echo ALL_PASS || echo ALL_FAIL` - Expected: "ALL_PASS"
- **Depends on:** M5
- **Files likely touched:** `src/dialogue.js`, `src/main.js`

## Dependency Graph

```
M1 (data format + skeleton)
 |
M2 (dialogue box UI)
 |  \
M3   M4 (choices)  (continue indicator)
  \  /
   M5 (wire into prison scene)
    |
   M6 (lint + format + build)
```

## Execution Schedule

Group 1 (start immediately): M1
Group 2 (after M1): M2
Group 3 (after M2): M3, M4
Group 4 (after M3 and M4): M5
Group 5 (after M5): M6

## Plan Data (JSON)

```json
{
  "title": "Reusable RPG Dialogue System with Drunk Cellmate Conversation",
  "goal": "Create a reusable dialogue module (src/dialogue.js) that renders an RPG-style dialogue box UI and supports NPC lines and player choices, then use it to implement the first dialogue where a drunk cellmate speaks to the hero upon entering the prison scene.",
  "created": "2026-02-28T00:00:00Z",
  "acceptance_criteria": [
    {
      "description": "Dialogue module exists and is importable",
      "verify_command": "node -e \"import('./src/dialogue.js').then(m => { if (typeof m.startDialogue !== 'function') throw 'missing'; console.log('PASS'); })\"",
      "expected": "PASS"
    },
    {
      "description": "ESLint passes with zero warnings",
      "verify_command": "cd /Users/janis.kirsteins/Projects/LibaGame1 && npx eslint src/ --max-warnings 0",
      "expected": "exit code 0"
    },
    {
      "description": "Prettier formatting is clean",
      "verify_command": "cd /Users/janis.kirsteins/Projects/LibaGame1 && npx prettier --check \"src/**/*.js\"",
      "expected": "exit code 0"
    },
    {
      "description": "Build succeeds without errors",
      "verify_command": "cd /Users/janis.kirsteins/Projects/LibaGame1 && npx vite build 2>&1 | grep -q 'built in' && echo PASS || echo FAIL",
      "expected": "PASS"
    },
    {
      "description": "No TypeScript files exist",
      "verify_command": "find /Users/janis.kirsteins/Projects/LibaGame1/src -name '*.ts' | wc -l | tr -d ' '",
      "expected": "0"
    },
    {
      "description": "Dialogue data is referenced in main.js",
      "verify_command": "grep -q 'PRISON_DRUNK_DIALOGUE' /Users/janis.kirsteins/Projects/LibaGame1/src/main.js && echo PASS || echo FAIL",
      "expected": "PASS"
    },
    {
      "description": "Dialogue module has no top-level side effects",
      "verify_command": "cd /Users/janis.kirsteins/Projects/LibaGame1 && npx eslint src/dialogue.js --max-warnings 0",
      "expected": "exit code 0"
    },
    {
      "description": "Smoke test - startDialogue runs without crashing and calls onComplete",
      "verify_command": "cd /Users/janis.kirsteins/Projects/LibaGame1 && node -e \"import('./src/dialogue.js').then(m => { const handlers = {}; const mockK = { add() { return { destroy() {}, text: '', use() {} }; }, width() { return 800; }, height() { return 600; }, onKeyPress(key, cb) { handlers[key] = cb; return { cancel() {} }; }, onUpdate() { return { cancel() {} }; } }; let done = false; m.startDialogue(mockK, [{ speaker: 'Test', text: 'Hello' }], () => { done = true; }); if (handlers['space']) handlers['space'](); if (!done) throw 'onComplete not called'; console.log('SMOKE_PASS'); })\"",
      "expected": "SMOKE_PASS"
    }
  ],
  "milestones": [
    {
      "id": "M1",
      "title": "Create the dialogue data format and module skeleton",
      "description": "Create src/dialogue.js with exported startDialogue function (stub) and PRISON_DRUNK_DIALOGUE data array. Define the dialogue step format: { speaker, text } for NPC lines or { speaker, prompt, choices: [{ text }] } for player choices. Medieval prison themed phrasing.",
      "verify_command": "cd /Users/janis.kirsteins/Projects/LibaGame1 && npx eslint src/dialogue.js --max-warnings 0 && node -e \"import('./src/dialogue.js').then(m => { if (typeof m.startDialogue !== 'function') throw 'no startDialogue'; if (!Array.isArray(m.PRISON_DRUNK_DIALOGUE)) throw 'no dialogue data'; console.log('PASS'); })\"",
      "expected_output": "PASS with exit code 0",
      "depends_on": [],
      "files_likely_touched": ["src/dialogue.js"],
      "estimated_size": "small"
    },
    {
      "id": "M2",
      "title": "Implement the dialogue box UI rendering",
      "description": "Implement startDialogue to render a semi-transparent dialogue box at the bottom of the screen with k.fixed(), k.z(200), speaker name in yellow, dialogue text in white. Step through NPC lines one at a time waiting for Space/Enter. Destroy UI and call onComplete when done.",
      "verify_command": "cd /Users/janis.kirsteins/Projects/LibaGame1 && npx eslint src/dialogue.js --max-warnings 0 && node -e \"import('./src/dialogue.js').then(m => { const src = m.startDialogue.toString(); if (src.length < 300) throw 'stub too short'; if (!src.includes('.fixed(')) throw 'missing .fixed()'; if (!src.includes('.rect(')) throw 'missing .rect()'; if (!src.includes('.text(')) throw 'missing .text()'; if (!src.includes('.z(')) throw 'missing .z()'; if (!src.includes('onKeyPress')) throw 'missing onKeyPress'; console.log('PASS'); })\"",
      "expected_output": "PASS",
      "depends_on": ["M1"],
      "files_likely_touched": ["src/dialogue.js"],
      "estimated_size": "medium"
    },
    {
      "id": "M3",
      "title": "Implement player choice UI",
      "description": "Extend dialogue stepping to handle choice steps. Render choices as vertical list, highlight selected with > prefix. Up/Down arrows navigate, Space/Enter confirms. Clean up key handlers when advancing past choices.",
      "verify_command": "cd /Users/janis.kirsteins/Projects/LibaGame1 && npx eslint src/dialogue.js --max-warnings 0 && node -e \"import('./src/dialogue.js').then(m => { const src = m.startDialogue.toString(); if (!src.includes('choices')) throw 'missing choice handling'; if (!src.includes(\\\"'up'\\\")) throw 'missing up arrow key'; if (!src.includes(\\\"'down'\\\")) throw 'missing down arrow key'; console.log('PASS'); })\"",
      "expected_output": "PASS",
      "depends_on": ["M2"],
      "files_likely_touched": ["src/dialogue.js"],
      "estimated_size": "medium"
    },
    {
      "id": "M4",
      "title": "Add a press-to-continue indicator for NPC lines",
      "description": "Add blinking [Space] indicator at bottom-right of dialogue box during NPC lines. Uses k.onUpdate timer toggling opacity every 0.5s. Not shown during choice steps. Cleaned up when advancing.",
      "verify_command": "cd /Users/janis.kirsteins/Projects/LibaGame1 && npx eslint src/dialogue.js --max-warnings 0 && node -e \"import('./src/dialogue.js').then(m => { const src = m.startDialogue.toString(); if (!src.includes('onUpdate')) throw 'missing onUpdate for blink timer'; if (!src.includes('opacity')) throw 'missing opacity toggle'; console.log('PASS'); })\"",
      "expected_output": "PASS",
      "depends_on": ["M2"],
      "files_likely_touched": ["src/dialogue.js"],
      "estimated_size": "small"
    },
    {
      "id": "M5",
      "title": "Wire dialogue into the prison scene with the Drunk entity",
      "description": "Import startDialogue and PRISON_DRUNK_DIALOGUE into main.js. Add Drunk entity handler to renderLdtkLevel. Trigger dialogue with k.wait(1.5) after scene loads.",
      "verify_command": "cd /Users/janis.kirsteins/Projects/LibaGame1 && npx eslint src/ --max-warnings 0 && npx prettier --check \"src/**/*.js\" && grep -q 'PRISON_DRUNK_DIALOGUE' src/main.js && grep -q 'startDialogue' src/main.js && grep -q 'Drunk' src/main.js && echo PASS || echo FAIL",
      "expected_output": "PASS",
      "depends_on": ["M3", "M4"],
      "files_likely_touched": ["src/main.js"],
      "estimated_size": "medium"
    },
    {
      "id": "M6",
      "title": "Final lint, format, and build verification",
      "description": "Run npm run lint:fix and npm run format. Run npm run build. Fix any issues.",
      "verify_command": "cd /Users/janis.kirsteins/Projects/LibaGame1 && npx eslint src/ --max-warnings 0 && npx prettier --check \"src/**/*.js\" && npx vite build 2>&1 | grep -q 'built in' && echo ALL_PASS || echo ALL_FAIL",
      "expected_output": "ALL_PASS",
      "depends_on": ["M5"],
      "files_likely_touched": ["src/dialogue.js", "src/main.js"],
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
      "label": "after M1 completes",
      "milestone_ids": ["M2"]
    },
    {
      "group": 3,
      "label": "after M2 completes",
      "milestone_ids": ["M3", "M4"]
    },
    {
      "group": 4,
      "label": "after M3 and M4 complete",
      "milestone_ids": ["M5"]
    },
    {
      "group": 5,
      "label": "after M5 completes",
      "milestone_ids": ["M6"]
    }
  ]
}
```
