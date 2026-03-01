// ==============================================
// Inventory System
// ==============================================
// A simple inventory that stores items as strings
// and a UI overlay to view them. Create one
// inventory per scene with createInventory() and
// pass it around to NPCs, pickups, etc.
// ==============================================

/**
 * An inventory object that holds item names as strings.
 * @typedef {object} Inventory
 * @property {function(string): void} add - Add an item by name
 * @property {function(string): boolean} remove - Remove first matching item, returns true if found
 * @property {function(string): boolean} has - Check if an item exists
 * @property {function(): string[]} list - Get a copy of all item names
 * @property {function(): number} count - Get the number of items
 */

/**
 * Create a new inventory instance backed by a plain string array.
 *
 * @returns {Inventory}
 */
export function createInventory() {
  /** @type {string[]} */
  const items = [];

  return {
    /** Add an item to the inventory. */
    add(itemName) {
      items.push(itemName);
    },

    /** Remove the first matching item. Returns true if something was removed. */
    remove(itemName) {
      const index = items.indexOf(itemName);
      if (index === -1) return false;
      items.splice(index, 1);
      return true;
    },

    /** Check whether the inventory contains at least one of this item. */
    has(itemName) {
      return items.includes(itemName);
    },

    /** Return a shallow copy of the items array. */
    list() {
      return [...items];
    },

    /** Return the number of items in the inventory. */
    count() {
      return items.length;
    },
  };
}

/**
 * Open a fullscreen inventory overlay. Shows all items (or "Empty"
 * if none). Press Q or Escape to close.
 *
 * @param {object} k - The Kaplay game engine instance
 * @param {Inventory} inventory - The inventory to display
 * @param {function} onClose - Called after the overlay is destroyed
 * @returns {object} The root background game object (caller can destroy it early if needed)
 */
export function openInventoryUI(k, inventory, onClose) {
  const padding = 24;

  // -- Keep track of all UI objects and key handlers for cleanup --
  const uiObjects = [];
  const keyHandlers = [];

  // -- Dark semi-transparent fullscreen background --
  const bg = k.add([
    k.rect(k.width(), k.height()),
    k.pos(0, 0),
    k.color(0, 0, 0),
    k.opacity(0.8),
    k.fixed(),
    k.z(300),
  ]);
  uiObjects.push(bg);

  // -- Title: "Inventory" in yellow/gold --
  const title = k.add([
    k.text('Inventory', { size: 24 }),
    k.pos(padding, padding),
    k.color(255, 204, 0),
    k.fixed(),
    k.z(300),
  ]);
  uiObjects.push(title);

  // -- Item list or "Empty" message --
  const items = inventory.list();
  const startY = padding + 40;

  if (items.length === 0) {
    // No items - show a gray "Empty" message
    const emptyLabel = k.add([
      k.text('Empty', { size: 16 }),
      k.pos(padding, startY),
      k.color(180, 180, 180),
      k.fixed(),
      k.z(300),
    ]);
    uiObjects.push(emptyLabel);
  } else {
    // Show each item as a white text row
    for (let i = 0; i < items.length; i++) {
      const itemLabel = k.add([
        k.text(items[i], { size: 16 }),
        k.pos(padding, startY + i * 24),
        k.color(255, 255, 255),
        k.fixed(),
        k.z(300),
      ]);
      uiObjects.push(itemLabel);
    }
  }

  // -- Close hint at the bottom --
  const hint = k.add([
    k.text('- Q / Esc to close -', { size: 12 }),
    k.pos(k.width() / 2, k.height() - padding),
    k.anchor('bot'),
    k.color(180, 180, 180),
    k.fixed(),
    k.z(300),
  ]);
  uiObjects.push(hint);

  // -- Cleanup: destroy everything and notify caller --
  function close() {
    for (const handler of keyHandlers) {
      handler.cancel();
    }
    for (const obj of uiObjects) {
      obj.destroy();
    }
    onClose();
  }

  // Delay registering close handlers by one frame so the same Q keypress
  // that opened the inventory doesn't immediately close it
  let ready = false;
  const readyHandler = k.onUpdate(() => {
    ready = true;
    readyHandler.cancel();
  });
  keyHandlers.push(readyHandler);

  // -- Key handlers: Q or Escape to close --
  keyHandlers.push(
    k.onKeyPress('q', () => {
      if (ready) close();
    }),
  );
  keyHandlers.push(
    k.onKeyPress('escape', () => {
      if (ready) close();
    }),
  );

  // Return the background object so the caller can destroy the overlay
  // externally if needed (e.g. on scene switch)
  return bg;
}
