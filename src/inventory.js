// ==============================================
// Inventory System
// ==============================================
// A simple inventory that stores items as strings
// and a UI overlay to view them. Create one
// inventory per scene with createInventory() and
// pass it around to NPCs, pickups, etc.
// ==============================================

// ==============================================
// Item Registry
// ==============================================
// Every item ID that appears in LDtk entity
// `contents` fields must have an entry here.
// The inventory UI and pickup messages use these
// display names and descriptions.
// ==============================================

/**
 * @typedef {object} ItemInfo
 * @property {string} name - Display name shown in inventory and pickup messages
 * @property {string} description - Short flavor text describing the item
 */

/** @type {Record<string, ItemInfo>} */
const ITEM_REGISTRY = {
  'steel-wire': {
    name: 'Steel Wire',
    description: 'A thin but sturdy wire. Could pick a lock... or a tooth.',
  },
  'rusty-nail': {
    name: 'Rusty Nail',
    description: 'A bent nail caked in rust. Tetanus included, free of charge.',
  },
};

/**
 * Look up an item's display info by ID.
 * Warns and returns a fallback if the ID is missing from the registry.
 *
 * @param {string} id - The item ID (e.g. "steel-wire")
 * @returns {ItemInfo}
 */
export function getItemInfo(id) {
  const info = ITEM_REGISTRY[id];
  if (!info) {
    console.warn(
      `Item "${id}" not found in ITEM_REGISTRY - add an entry in inventory.js`,
    );
    return {
      name: id
        .split('-')
        .map((w) => w[0].toUpperCase() + w.slice(1))
        .join(' '),
      description: '',
    };
  }
  return info;
}

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
    // Show each item with its display name and flavor description
    let y = startY;
    for (let i = 0; i < items.length; i++) {
      const info = getItemInfo(items[i]);
      const nameLabel = k.add([
        k.text(info.name, { size: 16 }),
        k.pos(padding, y),
        k.color(255, 255, 255),
        k.fixed(),
        k.z(300),
      ]);
      uiObjects.push(nameLabel);
      y += 20;
      if (info.description) {
        const descLabel = k.add([
          k.text(info.description, { size: 12 }),
          k.pos(padding + 12, y),
          k.color(150, 150, 150),
          k.fixed(),
          k.z(300),
        ]);
        uiObjects.push(descLabel);
        y += 18;
      }
      y += 6;
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
