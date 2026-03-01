// ==============================================
// Interaction System
// ==============================================
// Proximity-based interaction for NPCs and
// interactable objects. Entities opt in with
// `interactable: true` and optionally provide
// `interactLabel` and `onInteract()`.
// ==============================================

// --- UI guard ---
// When true, E and F key presses are ignored.
// Set by dialogue, inventory, or other overlays
// that should suppress interaction input.
let uiOpen = false;

/**
 * Set whether a UI overlay is open. While true,
 * interaction keys (E and F) are suppressed.
 *
 * @param {boolean} val - true to block interactions, false to re-enable
 */
export function setUIOpen(val) {
  uiOpen = val;
}

/**
 * Set up the proximity-based interaction system.
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

  // Entities within range, sorted by distance (nearest first)
  let nearbyEntities = [];

  // Index into nearbyEntities for the currently focused entity
  let focusIndex = 0;

  // Track previously focused entity so we can turn off its outline
  let prevFocused = null;

  // --- Per-frame proximity detection ---
  const updateHandler = k.onUpdate(() => {
    // Filter to interactable entities within range
    const candidates = [];
    for (const entity of entities) {
      if (!entity.interactable) continue;
      // Skip destroyed entities
      if (entity.is && !entity.exists()) continue;

      const dist = player.pos.dist(entity.pos);
      if (dist <= interactRange) {
        candidates.push({ entity, dist });
      }
    }

    // Sort by distance (nearest first)
    candidates.sort((a, b) => a.dist - b.dist);
    nearbyEntities = candidates.map((c) => c.entity);

    // Clamp focusIndex when the list changes size
    if (nearbyEntities.length === 0) {
      focusIndex = 0;
    } else if (focusIndex >= nearbyEntities.length) {
      focusIndex = nearbyEntities.length - 1;
    }

    // Toggle the outline shader on the focused entity
    const focused = nearbyEntities.length > 0 ? nearbyEntities[focusIndex] : null;
    if (prevFocused !== focused) {
      if (prevFocused) prevFocused.outlineEnabled = false;
      if (focused) focused.outlineEnabled = true;
      prevFocused = focused;
    }
  });

  // Helper: compute center of an entity from its top-left pos + size
  function entityCenter(entity) {
    const w = entity.interactW || 32;
    const h = entity.interactH || 32;
    return k.vec2(entity.pos.x + w / 2, entity.pos.y + h / 2);
  }

  // --- Visual indicators ---
  // Use a high-z invisible game object so our drawing renders on top
  // of all tiles and entities. Attached onDraw inherits the object's z.
  // Position at (0,0) so world coordinates pass through unchanged.
  const drawLayer = k.add([k.pos(0, 0), k.z(50)]);

  drawLayer.onDraw(() => {
    // (a) Always-visible pulsing dot above every interactable entity,
    // regardless of distance, so the player can spot them from afar.
    const pulse = 0.5 + 0.5 * Math.sin(k.time() * 4);
    const dotRadius = 2 + pulse;

    for (const entity of entities) {
      if (!entity.interactable) continue;
      if (entity.is && !entity.exists()) continue;

      const center = entityCenter(entity);
      const h = entity.interactH || 32;
      k.drawCircle({
        pos: k.vec2(center.x, center.y - h / 2 - 6),
        radius: dotRadius,
        color: k.Color.fromHex('#ffcc00'),
        opacity: 0.6 + 0.4 * pulse,
      });
    }

    // (d) Draw label above the focused entity (outline is handled by shader)
    if (nearbyEntities.length === 0) return;
    const focused = nearbyEntities[focusIndex];
    if (!focused) return;

    const center = entityCenter(focused);

    // Draw the "E: [label]" prompt above the entity
    const label = focused.interactLabel || 'Interact';
    k.drawText({
      text: 'E: ' + label,
      pos: k.vec2(center.x, focused.pos.y - 4),
      size: 8,
      anchor: 'bot',
      color: k.Color.WHITE,
      outline: { width: 1, color: k.Color.fromHex('#000000') },
    });

    // If there are multiple nearby entities, show a small F-key hint
    if (nearbyEntities.length > 1) {
      k.drawText({
        text: 'F: next (' + (focusIndex + 1) + '/' + nearbyEntities.length + ')',
        pos: k.vec2(center.x, focused.pos.y - 14),
        size: 6,
        anchor: 'bot',
        color: k.Color.fromHex('#aaaaaa'),
        outline: { width: 1, color: k.Color.fromHex('#000000') },
      });
    }
  });

  // --- F key cycles focusIndex (wraps around) ---
  const fKeyHandler = k.onKeyPress('f', () => {
    if (uiOpen) return;
    if (nearbyEntities.length <= 1) return;
    focusIndex = (focusIndex + 1) % nearbyEntities.length;
  });

  // --- E key triggers interaction on the focused entity ---
  const eKeyHandler = k.onKeyPress('e', () => {
    if (uiOpen) return;
    if (nearbyEntities.length === 0) return;

    const focused = nearbyEntities[focusIndex];
    if (focused && typeof focused.onInteract === 'function') {
      focused.onInteract();
    }
  });

  // --- Cleanup function: cancel all event handlers ---
  return function cleanup() {
    if (prevFocused) prevFocused.outlineEnabled = false;
    updateHandler.cancel();
    drawLayer.destroy();
    fKeyHandler.cancel();
    eKeyHandler.cancel();
  };
}
