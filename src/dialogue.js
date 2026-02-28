// ==============================================
// Dialogue System
// ==============================================
// A simple data-driven dialogue system for
// conversations with NPCs. Each dialogue is an
// array of steps that are either NPC lines or
// player choices.
// ==============================================

// --- Dialogue data format ---
//
// A dialogue is an array of step objects.
// There are two kinds of steps:
//
// 1. NPC line - the NPC says something:
//    { speaker: "Name", text: "What they say" }
//
// 2. Player choice - the player picks a response:
//    { speaker: "You", prompt: "Question text",
//      choices: [{ text: "Option A" }, { text: "Option B" }] }

/**
 * A single line spoken by an NPC.
 * @typedef {object} DialogueLine
 * @property {string} speaker - Who is talking (e.g. "Drunk Cellmate")
 * @property {string} text - What they say
 */

/**
 * A choice the player can pick during dialogue.
 * @typedef {object} DialogueChoice
 * @property {string} text - The text shown for this option
 */

/**
 * A step where the player picks from several options.
 * @typedef {object} DialoguePrompt
 * @property {string} speaker - Who is asking (e.g. "You")
 * @property {string} prompt - The question or context shown above the choices
 * @property {DialogueChoice[]} choices - The options the player can pick
 */

/**
 * One step in a dialogue sequence - either a line or a prompt.
 * @typedef {DialogueLine | DialoguePrompt} DialogueStep
 */

/**
 * Start a dialogue sequence. Shows each step one at a time,
 * then calls onComplete when the conversation is finished.
 *
 * @param {object} k - The Kaplay game engine instance
 * @param {DialogueStep[]} dialogueSteps - The conversation steps to play through
 * @param {function} onComplete - Called when the dialogue is finished
 */
export function startDialogue(k, dialogueSteps, onComplete) {
  // If there are no steps, finish right away
  if (dialogueSteps.length === 0) {
    onComplete();
    return;
  }

  // Track which step we're showing
  let currentIndex = 0;

  // -- Box dimensions --
  const boxHeight = 150;
  const boxY = k.height() - boxHeight;
  const padding = 20;

  // -- Dark semi-transparent background --
  const bgBox = k.add([
    k.rect(k.width(), boxHeight),
    k.pos(0, boxY),
    k.color(0, 0, 0),
    k.opacity(0.8),
    k.fixed(),
    k.z(200),
  ]);

  // -- Speaker name (yellow/gold) --
  const speakerLabel = k.add([
    k.text(dialogueSteps[0].speaker, { size: 18 }),
    k.pos(padding, boxY + padding),
    k.color(255, 204, 0),
    k.fixed(),
    k.z(200),
  ]);

  // -- Dialogue text (white, used for NPC lines and choice prompts) --
  const firstText = dialogueSteps[0].text || dialogueSteps[0].prompt || '';
  const dialogueLabel = k.add([
    k.text(firstText, { size: 16 }),
    k.pos(padding, boxY + padding + 28),
    k.color(255, 255, 255),
    k.fixed(),
    k.z(200),
  ]);

  // -- Press-to-continue indicator (flashing "[Space]" hint) --
  // Only visible during NPC line steps, hidden during choice steps.
  const indicator = k.add([
    k.text('- Space -', { size: 12 }),
    k.pos(k.width() - padding - 60, boxY + boxHeight - padding - 4),
    k.color(180, 180, 180),
    k.opacity(1),
    k.fixed(),
    k.z(200),
  ]);

  // Blink the indicator by toggling its opacity every 0.5 seconds
  let blinkTimer = 0;
  const blinkInterval = 0.5;
  const indicatorBlink = k.onUpdate(() => {
    blinkTimer += k.dt();
    if (blinkTimer >= blinkInterval) {
      blinkTimer -= blinkInterval;
      indicator.opacity = indicator.opacity > 0.5 ? 0 : 1;
    }
  });

  // Hide the indicator (used during choice steps)
  function hideIndicator() {
    indicator.opacity = 0;
    blinkTimer = 0;
  }

  // Show the indicator and restart its blink cycle
  function showIndicator() {
    indicator.opacity = 1;
    blinkTimer = 0;
  }

  // If the first step is a choice step, hide the indicator right away
  if (dialogueSteps[0].choices) {
    hideIndicator();
  }

  // Keep track of all game objects so we can clean up
  const uiObjects = [bgBox, speakerLabel, dialogueLabel, indicator];

  // -- Choice state --
  // These are only active when the current step has choices
  let choiceLabels = []; // game objects for each choice option
  let choiceHandlers = []; // key handler cancellers for up/down
  let selectedChoice = 0;

  // Remove choice labels from the screen and cancel arrow key handlers
  function cleanupChoices() {
    for (const handler of choiceHandlers) {
      handler.cancel();
    }
    choiceHandlers = [];
    for (const label of choiceLabels) {
      label.destroy();
    }
    choiceLabels = [];
    selectedChoice = 0;
  }

  // Destroy all dialogue UI and cancel all input handlers
  function cleanup() {
    cleanupChoices();
    indicatorBlink.cancel();
    spaceHandler.cancel();
    enterHandler.cancel();
    for (const obj of uiObjects) {
      obj.destroy();
    }
  }

  // Update the visual style of choice labels to reflect the current selection
  function updateChoiceHighlight() {
    for (let i = 0; i < choiceLabels.length; i++) {
      const step = dialogueSteps[currentIndex];
      if (i === selectedChoice) {
        // Highlighted - yellow with arrow prefix
        choiceLabels[i].text = '> ' + step.choices[i].text;
        choiceLabels[i].color = k.rgb(255, 204, 0);
      } else {
        // Unselected - gray without prefix
        choiceLabels[i].text = '  ' + step.choices[i].text;
        choiceLabels[i].color = k.rgb(150, 150, 150);
      }
    }
  }

  // Show the choices for the current step
  function showChoices(step) {
    const choiceStartY = boxY + padding + 28 + 24;
    for (let i = 0; i < step.choices.length; i++) {
      const label = k.add([
        k.text('', { size: 16 }),
        k.pos(padding + 10, choiceStartY + i * 24),
        k.color(150, 150, 150),
        k.fixed(),
        k.z(200),
      ]);
      choiceLabels.push(label);
      uiObjects.push(label);
    }
    updateChoiceHighlight();

    // Arrow key handlers for navigating choices
    const upHandler = k.onKeyPress('up', () => {
      selectedChoice = (selectedChoice - 1 + choiceLabels.length) % choiceLabels.length;
      updateChoiceHighlight();
    });
    const downHandler = k.onKeyPress('down', () => {
      selectedChoice = (selectedChoice + 1) % choiceLabels.length;
      updateChoiceHighlight();
    });
    choiceHandlers.push(upHandler, downHandler);
  }

  // True when the current step is a choice step and we're waiting
  // for the player to confirm a selection
  let waitingForChoice = false;

  // Render the current step (NPC line or choice prompt)
  function showStep() {
    const step = dialogueSteps[currentIndex];
    speakerLabel.text = step.speaker;

    if (step.choices) {
      // Choice step - show prompt and option list, hide the indicator
      dialogueLabel.text = step.prompt || '';
      waitingForChoice = true;
      hideIndicator();
      showChoices(step);
    } else {
      // NPC line - update text and show the press-to-continue indicator
      dialogueLabel.text = step.text;
      waitingForChoice = false;
      showIndicator();
    }
  }

  // Advance to the next step, or finish if we've shown them all
  function advance() {
    // If we're on a choice step but the player hasn't confirmed yet,
    // Space/Enter confirms the choice (then advances)
    if (waitingForChoice) {
      // Choice confirmed - clean up choice UI and move on
      cleanupChoices();
      waitingForChoice = false;
    }

    currentIndex++;
    if (currentIndex >= dialogueSteps.length) {
      // All steps shown - close the dialogue
      cleanup();
      onComplete();
    } else {
      showStep();
    }
  }

  // Listen for Space or Enter to advance the dialogue
  const spaceHandler = k.onKeyPress('space', advance);
  const enterHandler = k.onKeyPress('enter', advance);

  // Show the first step's choices if it happens to be a choice step
  if (dialogueSteps[0].choices) {
    waitingForChoice = true;
    showChoices(dialogueSteps[0]);
  }
}

// ==============================================
// Prison Drunk Cellmate Dialogue
// ==============================================
// The first conversation the player has after
// waking up in the prison cell. A drunk cellmate
// greets them and asks why they're locked up.
// ==============================================

/** @type {DialogueStep[]} */
export const PRISON_DRUNK_DIALOGUE = [
  {
    speaker: 'Drunk Cellmate',
    text: 'Oi there... ye look a bit lost, friend. Welcome to yer new home, heh.',
  },
  {
    speaker: 'Drunk Cellmate',
    text: "Name's Grumbold. Been in 'ere so long I forgot what the sky looks like.",
  },
  {
    speaker: 'Drunk Cellmate',
    text: "So tell me... what'd they drag YOU in for?",
  },
  {
    speaker: 'You',
    prompt: 'Why are you in prison?',
    choices: [
      { text: "I was framed! I didn't do anything wrong!" },
      { text: 'Honestly... I have no idea what happened.' },
    ],
  },
  {
    speaker: 'Drunk Cellmate',
    text: "Ha! That's what they ALL say, innit? But don't worry - ol' Grumbold believes ye.",
  },
];
