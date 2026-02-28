# Liba's Adventure - Project Guide for Claude Code

## Project Goal

This is a small, self-contained 2D pixel art game project for Liba, an 11-year-old. The goal is to make a fun, completable game that she can build incrementally while learning programming. Keep scope small and achievable. Every feature should be simple enough for a beginner to understand and modify. When in doubt, prefer the simpler approach.

## About This Project

A top-down adventure game where an innocent person is framed and sent to prison, and must escape and find the real criminal. Built with Kaplay (formerly Kaboom.js) and Vite. See GAME_DESIGN.md for the full story and design details.

## Important Rules

- **Keep code simple and readable.** Use clear variable names and add comments that explain _why_, not just _what_.
- **Never use TypeScript.** This project uses plain JavaScript to keep things approachable.
- **Never use em dashes.** Use regular hyphens (-) instead.
- **Pixel art must stay crisp.** Always use `texFilter: "nearest"` and never apply CSS smoothing to sprites.
- **All sprite paths start with `sprites/`** because they live in `public/sprites/`.
- **Keep the file structure flat.** Game code goes in `src/`. Avoid deeply nested directories.
- **ESLint and Prettier are set up.** Run `npm run lint:fix` and `npm run format` before suggesting commits.

## Tech Stack

- **Game engine:** Kaplay v3001.0.19 (https://kaplayjs.com/)
- **Build tool:** Vite
- **Language:** JavaScript (ES modules)
- **Linting:** ESLint 9+ (flat config in eslint.config.js)
- **Formatting:** Prettier
- **Git hooks:** Husky + lint-staged (auto-runs on commit)

## Sprite Information

Character spritesheets (warrior, base skins, clothing, hair, etc.):

- Frame size: 100x64 pixels
- Grid: 8 columns
- Row count varies (base skins = 7 rows, warrior = 17 rows)
- Row 0: idle-down, Row 1: walk-down, Row 2: walk-side, Row 3: idle-up, Row 4: idle-side

Slime spritesheets:

- Frame size: 32x32 pixels
- Grid: 8 columns x 3 rows
- Row 0: idle, Row 1: hurt, Row 2: death

Pet spritesheets (fox, dogs):

- Frame size: 32x32 pixels
- Grid: 6 columns x 2 rows

Goddess NPC:

- Frame size: 64x64 pixels
- Grid: 13 columns x 1 row

Tile assets:

- All based on 32x32 pixel grid

## Project Commands

- `npm run dev` - start dev server
- `npm run build` - production build
- `npm run lint` - check for code issues
- `npm run lint:fix` - auto-fix code issues
- `npm run format` - format all code

## Asset Organization

```
public/sprites/
  characters/   - Base skins (Female Skin1-5, Male Skin1-5), warrior, goddess NPC
  clothing/     - female/ and male/ subdirs with layered clothing PNGs
  hair/         - female/ and male/ subdirs with hairstyle PNGs
  hats/         - female/ and male/ subdirs
  hand-items/   - female/ and male/ subdirs (weapons, shields)
  accessories/  - Capes, masks, elven ears, shields, lanterns, backpacks
  enemies/      - slime-green.png, slime-blue.png, slime-red.png
  pets/         - fox.png, doggy.png (and doggy variants)
  tiles/        - castle.png, dark-forest.png, house-inside.png, etc.
  effects/      - hearts, stars, buffs, debuffs, blood, lines
  special-skins/- Orc, demon, ghost, zombie, devil skins
  ui/           - Emoji icons, quest markers
  misc/         - Trees, fountain, garden pool, bees, furniture
```
