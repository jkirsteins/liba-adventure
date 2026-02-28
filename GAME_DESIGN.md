# Game Design Document - Liba's Adventure

## Story Premise

**An innocent man gets sent to prison because he was being framed, and he tries to escape from the prison and find the criminal.**

> **TODO:** Flesh out this story premise into a full narrative. Questions to answer:
>
> - Who is the main character? What is his name and backstory?
> - Who framed him, and why?
> - How does he escape the prison?
> - What clues does he follow to find the real criminal?
> - What happens when he finds them?
> - Are there allies who help him along the way?
> - How does the story end?

## The Big Idea

A top-down 2D pixel art adventure game set in a medieval fantasy world. The player is wrongfully imprisoned and must escape, then explore forests, castles, and villages to gather evidence, find allies, and track down the criminal who framed them.

## Setting

A medieval fantasy kingdom with:

- A grim prison (the starting area)
- Dark forests full of mysteries and hiding places
- Stone castles with guards and royalty
- Cozy villages with houses and shops where you find clues
- Oriental-themed areas with unique architecture

## Characters

### The Hero

- An innocent person who was framed for a crime they didn't commit
- Can walk in four directions, equip different clothing, hair, hats, and weapons
- Has a pet companion (fox or dog) that follows along and helps

### NPCs

- **The Goddess** - a wise NPC who gives quests and advice
- **Allies** - people who believe in the hero's innocence and help
- **The Criminal** - the real villain who framed the hero (TODO: design this character)
- More NPCs can be added using the character base skins + clothing layers

### Enemies

- **Slimes** - come in green, blue, and red varieties
- **Prison guards** (TODO: design using character assets)
- Green slimes are the easiest
- Blue slimes are medium difficulty
- Red slimes are the toughest

### Pets

- **Fox** - a loyal orange fox companion
- **Dogs** - various doggy friends (can even wear hats and backpacks!)

## Available Art Assets

### Character Customization System

The game has a layered character system. Each piece is a separate spritesheet that can be layered on top of the base skin:

1. **Base skin** (10 variants: 5 female, 5 male skin tones)
2. **Clothing** (94 items: dresses, bodices, corsets, boots, armor, etc.)
3. **Hair** (68 styles: 30 female, 28 male + 10 additional)
4. **Hats** (41 headwear options)
5. **Hand items** (38 weapons and tools)
6. **Accessories** (31 items: capes, shields, masks, elven ears, lanterns)
7. **Special skins** (10 fantasy skins: orc, demon, ghost, zombie, devil)

### Environment Tiles (32x32 pixel grid)

- Castle walls, floors, doors, pillars
- Dark forest trees and ground
- House interiors and exteriors
- Oriental-themed buildings
- Furniture (beds, tables, etc.)

### Decorations

- Trees (old trees, dark trees, dead trees, fall trees)
- Fountain, garden pool
- Bees, smoker
- Coat of arms

### Effects

- Hearts (pink, blue)
- Stars (multiple colors)
- Buff/debuff indicators
- Lines and curves (for attacks, magic)

## Game Mechanics (Ideas)

### Movement

- Arrow keys to move in four directions
- Character animation changes based on direction
- Pet follows the player automatically

### Combat (future)

- Simple collision-based combat with slimes
- Health system with hearts
- Different weapons do different damage

### Quests (future)

- Talk to NPCs to receive quests
- Quest markers show above NPC heads
- Collect items or defeat enemies to complete quests

### Character Customization (future)

- Mix and match clothing, hair, hats, and weapons
- Save favorite outfits
- Unlock new items by completing quests

### World Exploration (future)

- Multiple areas connected by paths
- Enter buildings to explore interiors
- Find hidden treasures in the forest

## Art Style

- Pixel art with 32x32 tile grid
- Characters are roughly 32 pixels wide
- Crisp, nearest-neighbor scaling (no blurring)
- Dark, moody forest palette as the primary environment

## Technical Notes

- Built with Kaplay (formerly Kaboom.js)
- Character spritesheets use 100x64 pixel frames, 8 columns
- Slime spritesheets use 32x32 pixel frames, 8 columns x 3 rows
- Pet spritesheets use 32x32 pixel frames, 6 columns x 2 rows
- All tile assets are based on a 32x32 pixel grid
