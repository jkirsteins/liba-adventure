// ==============================================
// Interaction System
// ==============================================
// Tab cycles through ALL interactable entities
// (sorted left-to-right). Moving resets focus to
// the nearest entity within proximity range.
// Entities with `globalInteract` can be activated
// from any distance; others require proximity.
// ==============================================

// --- UI guard ---
// When true, E and Tab key presses are ignored.
// Set by dialogue, inventory, or other overlays
// that should suppress interaction input.
let uiOpen = false;

/**
 * Set whether a UI overlay is open. While true,
 * interaction keys (E and Tab) are suppressed.
 *
 * @param {boolean} val - true to block interactions, false to re-enable
 */
export function setUIOpen(val) {
  uiOpen = val;
}

/**
 * Set up the interaction system.
 * Call once after a level loads. Returns a cleanup
 * function that cancels all event handlers.
 *
 * @param {object} k - The Kaplay game engine instance
 * @param {object} player - The player game object (must have .pos)
 * @param {object[]} entities - Flat array of game objects from the level
 * @returns {function} cleanup - Call to tear down all interaction handlers
 */
export function setupInteraction(k, player, entities) {
  // How close the player must be to interact (in game pixels)
  const interactRange = 72;

  // Currently focused entity (or null)
  let focused = null;

  // True when Tab set the current focus (not proximity)
  let focusedByTab = false;

  // Track previously focused entity so we can turn off its outline
  let prevFocused = null;

  // Helper: compute center of an entity from its pos + size.
  // Handles both top-left anchored and bot-anchored entities.
  function entityCenter(entity) {
    const w = entity.interactW || 32;
    const h = entity.interactH || 32;
    if (entity.interactAnchor === 'bot') {
      // pos is bottom-center, so center is half-height above
      return k.vec2(entity.pos.x, entity.pos.y - h / 2);
    }
    return k.vec2(entity.pos.x + w / 2, entity.pos.y + h / 2);
  }

  // Helper: get all alive interactable entities sorted left-to-right
  function allInteractables() {
    const list = [];
    for (const entity of entities) {
      if (!entity.interactable) continue;
      if (entity.is && !entity.exists()) continue;
      list.push(entity);
    }
    list.sort((a, b) => entityCenter(a).x - entityCenter(b).x);
    return list;
  }

  // Helper: find the nearest interactable within range
  function nearestInRange() {
    let best = null;
    let bestDist = Infinity;
    for (const entity of entities) {
      if (!entity.interactable) continue;
      if (entity.is && !entity.exists()) continue;
      const dist = player.pos.dist(entityCenter(entity));
      if (dist <= interactRange && dist < bestDist) {
        best = entity;
        bestDist = dist;
      }
    }
    return best;
  }

  // Helper: distance from player to entity center
  function distTo(entity) {
    return player.pos.dist(entityCenter(entity));
  }

  // --- Per-frame update ---
  const updateHandler = k.onUpdate(() => {
    // Detect movement - when player is actively moving, clear Tab focus
    // and snap to nearest proximity entity
    const isMoving =
      k.isKeyDown('left') ||
      k.isKeyDown('right') ||
      k.isKeyDown('up') ||
      k.isKeyDown('down');

    if (isMoving && focusedByTab) {
      // If Tab-focused on a proximity entity that's now out of range, clear focus
      if (focused && !focused.globalInteract && distTo(focused) > interactRange) {
        focusedByTab = false;
        focused = null;
      } else {
        focusedByTab = false;
        focused = nearestInRange();
      }
    }

    // When not Tab-focused, continuously track nearest entity in range
    if (!focusedByTab) {
      focused = nearestInRange();
    }

    // Toggle the outline shader on the focused entity
    if (prevFocused !== focused) {
      if (prevFocused) prevFocused.outlineEnabled = false;
      if (focused) focused.outlineEnabled = true;
      prevFocused = focused;
    }
  });

  // --- Visual indicators ---
  const drawLayer = k.add([k.pos(0, 0), k.z(50)]);

  drawLayer.onDraw(() => {
    // (a) Pulsing dot above every interactable entity
    const pulse = 0.5 + 0.5 * Math.sin(k.time() * 4);
    const dotRadius = 2 + pulse;

    for (const entity of entities) {
      if (!entity.interactable) continue;
      if (entity.is && !entity.exists()) continue;

      const center = entityCenter(entity);
      const h = entity.interactH || 32;
      // For bot-anchored entities, center is already at mid-height,
      // so top is center.y - h/2. For top-left, center.y - h/2 is also the top.
      const dotY = center.y - h / 2 - 6;
      k.drawCircle({
        pos: k.vec2(center.x, dotY),
        radius: dotRadius,
        color: k.Color.fromHex('#ffcc00'),
        opacity: 0.6 + 0.4 * pulse,
      });
    }

    // (b) Draw label above the focused entity
    if (!focused) return;

    const center = entityCenter(focused);
    const isInRange = focused.globalInteract || distTo(focused) <= interactRange;
    const labelOpacity = isInRange ? 1.0 : 0.4;

    // Label Y position: use entity top edge
    const h = focused.interactH || 32;
    const labelY = center.y - h / 2 - 4;

    // Draw the "E: [label]" prompt
    const label = focused.interactLabel || 'Interact';
    k.drawText({
      text: 'E: ' + label,
      pos: k.vec2(center.x, labelY),
      size: 8,
      anchor: 'bot',
      color: k.Color.WHITE,
      opacity: labelOpacity,
      outline: { width: 1, color: k.Color.fromHex('#000000') },
    });

    // Show Tab hint
    const interactables = allInteractables();
    if (interactables.length > 1) {
      k.drawText({
        text: 'Tab: next',
        pos: k.vec2(center.x, labelY - 10),
        size: 6,
        anchor: 'bot',
        color: k.Color.fromHex('#aaaaaa'),
        opacity: labelOpacity,
        outline: { width: 1, color: k.Color.fromHex('#000000') },
      });
    }
  });

  // --- Tab key cycles through all interactables (sorted left-to-right) ---
  // Cycle includes a "nothing" slot after the last entity:
  //   entity0 -> entity1 -> ... -> nothing -> entity0
  const tabKeyHandler = k.onKeyPress('tab', () => {
    if (uiOpen) return;
    const interactables = allInteractables();
    if (interactables.length === 0) return;

    const currentIdx = focused ? interactables.indexOf(focused) : -1;
    const nextIdx = currentIdx + 1;

    if (nextIdx >= interactables.length) {
      // Past the last entity - select nothing
      focused = null;
      focusedByTab = false;
    } else {
      focused = interactables[nextIdx];
      focusedByTab = true;
    }
  });

  // --- E key triggers interaction on the focused entity ---
  const eKeyHandler = k.onKeyPress('e', () => {
    if (uiOpen) return;
    if (!focused) return;

    // Global entities can be interacted from anywhere
    if (focused.globalInteract) {
      if (typeof focused.onInteract === 'function') {
        focused.onInteract();
      }
      return;
    }

    // Proximity entities require being within range
    if (distTo(focused) <= interactRange) {
      if (typeof focused.onInteract === 'function') {
        focused.onInteract();
      }
    }
  });

  // --- Cleanup function: cancel all event handlers ---
  return function cleanup() {
    if (prevFocused) prevFocused.outlineEnabled = false;
    updateHandler.cancel();
    drawLayer.destroy();
    tabKeyHandler.cancel();
    eKeyHandler.cancel();
  };
}
