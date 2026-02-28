# Plan: Add Basic UI Elements

## Goal

Add a score counter and scene label to the game scene so the player sees their score and current location.

## Final Acceptance Criteria

These verify that the ENTIRE plan is complete, not just individual milestones.

- [x] Both score and scene label visible in game scene code - Verify: `grep -c 'fixed' src/main.js | awk '{if($1>=2) print "PASS"; else print "FAIL"}'` - Expected: PASS
- [x] Build succeeds - Verify: `cd /Users/janis.kirsteins/Projects/LibaGame1 && npm run build 2>&1 | tail -1` - Expected: no errors

## Milestones

### M1: Add score display [DONE]

- **Description:** Add a fixed UI text element in the top-left corner of the game scene that shows "Score: 0". Create a `score` variable in the game scene and a text object with `fixed()` component so it stays on screen. Use the default Kaplay font.
- **Verify:** `cd /Users/janis.kirsteins/Projects/LibaGame1 && grep -q 'let score' src/main.js && grep -q 'Score' src/main.js && echo PASS || echo FAIL` - Expected: PASS
- **Depends on:** none
- **Files likely touched:** src/main.js

### M2: Add scene label [DONE]

- **Description:** Add a fixed UI text element in the top-right corner of the game scene that shows the scene name "Town". Use `fixed()` and `anchor("topright")` to position it. Use the default Kaplay font.
- **Verify:** `cd /Users/janis.kirsteins/Projects/LibaGame1 && grep -q 'Town' src/main.js && grep -q 'topright' src/main.js && echo PASS || echo FAIL` - Expected: PASS
- **Depends on:** none
- **Files likely touched:** src/main.js

## Dependency Graph

    M1    M2

(No dependencies - both can run in parallel)

## Execution Schedule

Group 1 (start immediately): M1, M2

## Plan Data (JSON)

```json
{
  "title": "Add Basic UI Elements",
  "goal": "Add a score counter and scene label to the game scene",
  "created": "2026-02-28T10:00:00Z",
  "acceptance_criteria": [
    {
      "description": "Both fixed UI elements present",
      "verify_command": "grep -c 'fixed' src/main.js | awk '{if($1>=2) print \"PASS\"; else print \"FAIL\"}'",
      "expected": "PASS"
    },
    {
      "description": "Build succeeds",
      "verify_command": "cd /Users/janis.kirsteins/Projects/LibaGame1 && npm run build 2>&1 | tail -1",
      "expected": "no errors"
    }
  ],
  "milestones": [
    {
      "id": "M1",
      "title": "Add score display",
      "description": "Add a fixed UI text element showing Score: 0 in the top-left of the game scene",
      "verify_command": "cd /Users/janis.kirsteins/Projects/LibaGame1 && grep -q 'let score' src/main.js && grep -q 'Score' src/main.js && echo PASS || echo FAIL",
      "expected_output": "PASS",
      "depends_on": [],
      "files_likely_touched": ["src/main.js"],
      "estimated_size": "small",
      "status": "complete"
    },
    {
      "id": "M2",
      "title": "Add scene label",
      "description": "Add a fixed UI text element showing Town in the top-right of the game scene",
      "verify_command": "cd /Users/janis.kirsteins/Projects/LibaGame1 && grep -q 'Town' src/main.js && grep -q 'topright' src/main.js && echo PASS || echo FAIL",
      "expected_output": "PASS",
      "depends_on": [],
      "files_likely_touched": ["src/main.js"],
      "estimated_size": "small",
      "status": "complete"
    }
  ],
  "execution_schedule": [
    {
      "group": 1,
      "label": "start immediately",
      "milestone_ids": ["M1", "M2"]
    }
  ]
}
```
