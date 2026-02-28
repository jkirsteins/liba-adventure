// ==============================================
// LDtk Level Loader
// ==============================================
// Loads an LDtk project file and renders the
// first level's tile layers in Kaplay.
// Also calls entity handlers so the game can
// spawn characters and objects.
// Camera handles centering - tiles render at
// their natural LDtk coordinates.
// ==============================================

// Cache for fetched LDtk data so we can load before entering the scene
const cache = {};

/**
 * Look up a custom field value on an LDtk entity.
 *
 * LDtk entities can have user-defined fields (added in the Entity
 * editor). Each field appears in `entity.fieldInstances` with an
 * `__identifier` (the field name) and `__value` (the value).
 *
 * This helper saves you from writing the lookup boilerplate every
 * time. Returns `undefined` if the entity has no fieldInstances
 * array or the named field does not exist.
 *
 * Convention used in this project: a boolean field called "solid"
 * marks an entity as impassable. The default entity renderer checks
 * this automatically and creates a collision body. Custom entity
 * handlers can call `getEntityField(entity, 'solid')` to do the
 * same thing themselves.
 *
 * @param {object} entity - An LDtk entity instance
 * @param {string} fieldName - The __identifier of the field to find
 * @returns {*} The field's __value, or undefined if not found
 */
export function getEntityField(entity, fieldName) {
  if (!entity.fieldInstances) return undefined;
  const field = entity.fieldInstances.find((f) => f.__identifier === fieldName);
  return field ? field.__value : undefined;
}

/**
 * Pre-fetch an LDtk file. Call this before k.go() so the data
 * is ready when the scene runs synchronously.
 */
export async function preloadLdtk(url) {
  if (!cache[url]) {
    const res = await fetch(url);
    cache[url] = await res.json();
  }
  return cache[url];
}

/**
 * Render a pre-loaded LDtk level in Kaplay (synchronous).
 * Tiles are placed at their natural LDtk pixel positions.
 * Use setCamPos to center the camera on the level.
 *
 * @param {object} k - Kaplay instance
 * @param {object} data - Parsed LDtk JSON (from preloadLdtk)
 * @param {object} tilesetMap - Maps LDtk tileset uid -> Kaplay sprite name
 * @param {object} entityHandlers - Maps entity identifier -> callback(entity)
 */
export function renderLdtkLevel(k, data, tilesetMap, entityHandlers) {
  const level = data.levels[0];

  // Tile layers are stored front-to-back in the array,
  // so we reverse to render back-to-front
  const tileLayers = level.layerInstances.filter((l) => l.__type === 'Tiles').reverse();

  tileLayers.forEach((layer, layerIdx) => {
    const spriteName = tilesetMap[layer.__tilesetDefUid];
    if (!spriteName) return; // skip unmapped tilesets

    for (const tile of layer.gridTiles) {
      const components = [
        k.sprite(spriteName, { frame: tile.t }),
        k.pos(tile.px[0], tile.px[1]),
        k.z(layerIdx),
      ];

      // Handle horizontal/vertical flip bits
      const flipH = tile.f & 1;
      const flipV = tile.f & 2;
      if (flipH || flipV) {
        components.push(k.scale(flipH ? -1 : 1, flipV ? -1 : 1));
        components.push(k.anchor('center'));
        // Shift position to keep the tile in the right spot
        components[1] = k.pos(tile.px[0] + 8, tile.px[1] + 8);
      }

      k.add(components);
    }
  });

  // Build a lookup of tileset definitions by uid
  const tilesetDefs = {};
  for (const ts of data.defs.tilesets) {
    tilesetDefs[ts.uid] = ts;
  }

  // Process entity layer
  const entityLayer = level.layerInstances.find((l) => l.__type === 'Entities');
  if (entityLayer) {
    for (const entity of entityLayer.entityInstances) {
      // If there's a custom handler, use it instead of the default renderer
      const handler = entityHandlers && entityHandlers[entity.__identifier];
      if (handler) {
        handler(entity);
        continue;
      }

      // Default: render the entity's tile graphic from its tileset
      const tile = entity.__tile;
      if (!tile) continue;

      const tsDef = tilesetDefs[tile.tilesetUid];
      if (!tsDef) continue;

      const spriteName = tilesetMap[tile.tilesetUid];
      if (!spriteName) continue;

      const gridSize = tsDef.tileGridSize;
      const cols = tsDef.__cWid;

      // Compute the top-left of this entity from its px and pivot
      const pivot = entity.__pivot;
      const topX = entity.px[0] - pivot[0] * entity.width;
      const topY = entity.px[1] - pivot[1] * entity.height;

      // Check if the entity has a flipX field
      const flipX = getEntityField(entity, 'flipX');

      // Break the tileRect into individual grid-sized frames
      const tilesW = tile.w / gridSize;
      const tilesH = tile.h / gridSize;
      const startCol = tile.x / gridSize;
      const startRow = tile.y / gridSize;

      // FitInside: uniform scale using the smaller ratio to keep aspect ratio
      const fitScale = Math.min(entity.width / tile.w, entity.height / tile.h);

      for (let row = 0; row < tilesH; row++) {
        for (let col = 0; col < tilesW; col++) {
          const frame = (startRow + row) * cols + (startCol + col);

          // Position each sub-tile within the entity bounds
          let tileX = col * gridSize * fitScale;
          const tileY = row * gridSize * fitScale;

          // If flipped horizontally, mirror the tile positions
          if (flipX) {
            tileX = tile.w * fitScale - (col + 1) * gridSize * fitScale;
          }

          k.add([
            k.sprite(spriteName, { frame }),
            k.pos(topX + tileX, topY + tileY),
            k.scale(flipX ? -fitScale : fitScale, fitScale),
            ...(flipX ? [k.anchor('topright')] : []),
            k.z(5),
          ]);
        }
      }

      // If the entity is marked solid, add an invisible collision body
      // covering the full entity bounding box so the player can't walk
      // through it (e.g. furniture, pillars, locked doors)
      if (getEntityField(entity, 'solid') === true) {
        k.add([
          k.pos(topX, topY),
          k.rect(entity.width, entity.height),
          k.area(),
          k.body({ isStatic: true }),
          k.opacity(0),
          'wall',
        ]);
      }
    }
  }

  // Create collision bodies from the IntGrid layer (if present)
  const walls = createIntGridColliders(k, level);

  return { level, walls };
}

/**
 * Create invisible static collision bodies from an LDtk IntGrid layer.
 *
 * LDtk IntGrid layers store a flat CSV array of integer values - one per
 * grid cell, row by row. Any cell with a value >= 1 is treated as a solid
 * wall. The layer's __gridSize and __cWid fields determine cell dimensions
 * and row width.
 *
 * For level designers: add an IntGrid layer to your LDtk level and paint
 * cells with value 1 (or higher) wherever you want impassable walls.
 * Cells with value 0 (or unpainted) are walkable. The layer name and
 * identifier do not matter - the loader finds the first layer whose
 * __type is "IntGrid" and whose intGridCsv is non-empty.
 *
 * @param {object} k - Kaplay instance
 * @param {object} level - A single LDtk level object
 * @returns {object[]} Array of wall game objects (empty if no IntGrid layer)
 */
function createIntGridColliders(k, level) {
  const intGridLayer = level.layerInstances.find(
    (l) => l.__type === 'IntGrid' && l.intGridCsv && l.intGridCsv.length > 0,
  );

  if (!intGridLayer) return [];

  const gridSize = intGridLayer.__gridSize;
  const cols = intGridLayer.__cWid;
  const wallObjects = [];

  for (let i = 0; i < intGridLayer.intGridCsv.length; i++) {
    if (intGridLayer.intGridCsv[i] < 1) continue;

    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = col * gridSize;
    const y = row * gridSize;

    const wall = k.add([
      k.pos(x, y),
      k.rect(gridSize, gridSize),
      k.area(),
      k.body({ isStatic: true }),
      k.opacity(0),
      'wall',
    ]);

    wallObjects.push(wall);
  }

  return wallObjects;
}
