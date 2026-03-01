Architecture guidelines

- When loading .ldtk files, all entities that are spawned should be recognized in OUTLINE_ENTITIES - if they are not, a warning has to be shown somewhere, so we can update the code
- Interactable entities must set: `interactable`, `interactLabel`, `interactW`, `interactH`, `onInteract()`, and the outline shader. Optional: `globalInteract` (interact from any distance), `interactAnchor` ('bot' if using anchor('bot'))

## World Tone

Medieval fantasy, light-hearted and slightly humorous. The situation is serious (wrongful imprisonment, a quest for justice) but characters bring warmth and personality. Dark comedy over grimdark - the world has rough edges but people are fundamentally decent.

## Character Voice Guidelines

- **Grumbold (Drunk Cellmate)**: Slurred, folksy medieval speech. Uses "ye", "yer", "'ere", "innit", dropped endings ("goin'", "somethin'"). Self-refers as "ol' Grumbold". Good-natured, slightly unreliable, but genuinely kind underneath the drink.
- **The Hero ("You")**: Standard, earnest tone. Short, direct sentences. No slang - contrasts with the colorful NPCs around them.
- **General NPCs**: Each should have a distinct speech pattern that reflects their personality and role. Avoid generic fantasy dialogue.

## System Interactions (Dialogue / Inventory / Entities)

- Entity `contents` field holds an array of item ID strings (e.g. `["steel-wire"]`). Read with `getEntityField(entity, 'contents')`. Every item ID that appears in LDtk `contents` must have an entry in `ITEM_REGISTRY` (in `inventory.js`) with a display name and flavor description. Use `getItemInfo(id)` to look up display info.
- The scene-scoped `inventory` object (from `createInventory()`) is accessed via closure in entity handlers.
- When dialogue depends on game state (e.g. whether items have been given), construct the steps array dynamically inside `onInteract` rather than exporting a static constant.
- `DialogueChoice.next` (optional `DialogueStep[]`) replaces remaining dialogue steps when the choice is confirmed. `DialogueChoice.onSelect` (optional callback) runs when confirmed, before next steps display. Both fields are optional so existing callers are unaffected.
