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
      const flipField = entity.fieldInstances.find((f) => f.__identifier === 'flipX');
      const flipX = flipField && flipField.__value;

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
    }
  }

  return { level };
}
