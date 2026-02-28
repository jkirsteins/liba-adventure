# Plan: Add Simple Health System

## Goal

Add a basic health system where the player has HP, takes damage from slime collisions, and sees a health bar on screen.

## Final Acceptance Criteria

These verify that the ENTIRE plan is complete, not just individual milestones.

- [x] Health variable, health bar, and damage-on-collision all present - Verify: `cd /Users/janis.kirsteins/Projects/LibaGame1 && grep -q 'playerHealth' src/main.js && grep -q 'healthBar\|health-bar\|healthLabel' src/main.js && echo PASS || echo FAIL` - Expected: PASS
- [x] Build succeeds - Verify: `cd /Users/janis.kirsteins/Projects/LibaGame1 && npm run build 2>&1 | tail -1` - Expected: no errors

## Milestones

### M1: Add player health variable and damage function [DONE]

- **Description:** Add a `playerHealth` variable (starting at 100) and a `takeDamage(amount)` function to the game scene. The function should reduce health and clamp it at 0. Also add a `maxHealth` constant set to 100.
- **Verify:** `cd /Users/janis.kirsteins/Projects/LibaGame1 && grep -q 'playerHealth' src/main.js && grep -q 'takeDamage' src/main.js && grep -q 'maxHealth' src/main.js && echo PASS || echo FAIL` - Expected: PASS
- **Depends on:** none
- **Files likely touched:** src/main.js

### M2: Add health bar UI [DONE]

- **Description:** Add a fixed health bar in the top-left corner of the game scene. Use a colored rectangle (green when health > 50%, yellow 25-50%, red below 25%) that shrinks as health decreases. Show the numeric value next to it. Update the bar whenever `playerHealth` changes.
- **Verify:** `cd /Users/janis.kirsteins/Projects/LibaGame1 && grep -q 'healthBar\|health-bar\|healthLabel' src/main.js && grep -qE 'GREEN\|green\|Color' src/main.js && echo PASS || echo FAIL` - Expected: PASS
- **Depends on:** M1
- **Files likely touched:** src/main.js

### M3: Trigger damage on slime collision [DONE]

- **Description:** Modify the existing slime collision handler in the game scene to call `takeDamage(10)` when the player touches a slime. Add a short invulnerability window (1 second) after taking damage so the player doesn't instantly lose all health from sustained contact. Use a simple boolean flag with a `wait()` timer.
- **Verify:** `cd /Users/janis.kirsteins/Projects/LibaGame1 && grep -q 'takeDamage' src/main.js && grep -qE 'invulnerable\|invincible\|canTakeDamage\|damageCooldown' src/main.js && echo PASS || echo FAIL` - Expected: PASS
- **Depends on:** M1
- **Files likely touched:** src/main.js

## Dependency Graph

      M1
     / \
    M2  M3

## Execution Schedule

Group 1 (start immediately): M1
Group 2 (after M1 completes): M2, M3

## Plan Data (JSON)

```json
{
  "title": "Add Simple Health System",
  "goal": "Add a basic health system with HP, damage from slimes, and a health bar UI",
  "created": "2026-02-28T10:00:00Z",
  "acceptance_criteria": [
    {
      "description": "Health system fully integrated",
      "verify_command": "cd /Users/janis.kirsteins/Projects/LibaGame1 && grep -q 'playerHealth' src/main.js && grep -q 'healthBar\\|health-bar\\|healthLabel' src/main.js && echo PASS || echo FAIL",
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
      "title": "Add player health variable and damage function",
      "description": "Add playerHealth variable (100), maxHealth constant (100), and takeDamage(amount) function that clamps at 0",
      "verify_command": "cd /Users/janis.kirsteins/Projects/LibaGame1 && grep -q 'playerHealth' src/main.js && grep -q 'takeDamage' src/main.js && grep -q 'maxHealth' src/main.js && echo PASS || echo FAIL",
      "expected_output": "PASS",
      "depends_on": [],
      "files_likely_touched": ["src/main.js"],
      "estimated_size": "small",
      "status": "complete"
    },
    {
      "id": "M2",
      "title": "Add health bar UI",
      "description": "Fixed health bar in top-left, colored by health percentage, shows numeric value",
      "verify_command": "cd /Users/janis.kirsteins/Projects/LibaGame1 && grep -q 'healthBar\\|health-bar\\|healthLabel' src/main.js && grep -qE 'GREEN\\|green\\|Color' src/main.js && echo PASS || echo FAIL",
      "expected_output": "PASS",
      "depends_on": ["M1"],
      "files_likely_touched": ["src/main.js"],
      "estimated_size": "medium",
      "status": "complete"
    },
    {
      "id": "M3",
      "title": "Trigger damage on slime collision",
      "description": "Call takeDamage(10) on slime collision with 1-second invulnerability window",
      "verify_command": "cd /Users/janis.kirsteins/Projects/LibaGame1 && grep -q 'takeDamage' src/main.js && grep -qE 'invulnerable\\|invincible\\|canTakeDamage\\|damageCooldown' src/main.js && echo PASS || echo FAIL",
      "expected_output": "PASS",
      "depends_on": ["M1"],
      "files_likely_touched": ["src/main.js"],
      "estimated_size": "small",
      "status": "complete"
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
      "milestone_ids": ["M2", "M3"]
    }
  ]
}
```
