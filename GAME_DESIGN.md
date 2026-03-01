# Game Design Rules

Rules and conventions for designing new interactions, events, characters, and systems.

## Tone

- Light-hearted and slightly humorous. Dark comedy over grimdark.
- The situation is serious (wrongful imprisonment, quest for justice) but characters bring warmth and personality.
- Rough edges but people are fundamentally decent.

## Dialogue

- Every NPC must have a distinct speech pattern reflecting their personality and role.
- No generic fantasy dialogue. Each line should sound like it could only come from that character.
- The hero speaks in short, direct, earnest sentences - no slang. Contrasts with colorful NPCs.
- Construct dialogue dynamically inside `onInteract` when it depends on game state. Don't export static dialogue arrays for stateful conversations.

## Art Style

- Pixel art with crisp nearest-neighbor scaling. No blurring, no sub-pixel rendering.
- Dark, moody forest palette as the primary environment mood.
- Layered character visuals: base skin + clothing + hair + hat + hand item + accessories, each a separate spritesheet.

## World Design

- Multiple areas connected by paths. Buildings have enterable interiors.
- Hidden things reward exploration - don't put everything on the obvious path.

## Items and Inventory

- Every item ID appearing in LDtk `contents` must have an `ITEM_REGISTRY` entry with display name and flavor description.
- Items should have personality in their descriptions - not just "a key" but something that hints at story or humor.

## New NPCs and Characters

- Give each NPC a reason to exist in the world beyond "gives quest X."
- Pet companions follow the player automatically and should feel alive (idle animations, reactions).

## NPC Visual Indicators

- Show an animated **exclamation quest marker** (`quest-marker` sprite, `exclamation` anim) above any NPC that has something the player hasn't acquired yet (items, key dialogue, etc.). Remove it once the player has received what the NPC offers.
- Show an animated **speech bubble emoji** (`emoji` sprite, `speechBubble` anim) above the NPC the player is currently talking to. Hide it when dialogue ends.
- Do NOT use generic dots or highlights on interactable entities. Visual cues should be meaningful and specific.
