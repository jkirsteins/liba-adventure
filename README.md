# Liba's Adventure

A 2D pixel art adventure game built with [Kaplay](https://kaplayjs.com/)!

## Getting Started

### What you need first

1. **Node.js** - download from [nodejs.org](https://nodejs.org/) (pick the LTS version)
2. **A code editor** - [VS Code](https://code.visualstudio.com/) is great
3. **A terminal** - the built-in terminal in VS Code works perfectly

### How to run the game

Open a terminal in this folder and run:

```bash
npm install
```

This downloads all the tools the game needs. You only have to do this once.

Then start the game:

```bash
npm run dev
```

Your browser will open and you will see the game! Use **arrow keys** to move the warrior around.

### Useful commands

| Command            | What it does                            |
| ------------------ | --------------------------------------- |
| `npm run dev`      | Start the game (opens in your browser)  |
| `npm run build`    | Build the game for sharing              |
| `npm run lint`     | Check your code for mistakes            |
| `npm run lint:fix` | Check your code AND fix what it can     |
| `npm run format`   | Make your code look neat and consistent |

### How the project is organized

```
LibaGame1/
  src/              <-- Your game code lives here
    main.js         <-- The main game file (start here!)
  public/
    sprites/        <-- All the pixel art images
      characters/   <-- Player and NPC sprites
      enemies/      <-- Bad guys (slimes!)
      pets/         <-- Cute animal friends
      tiles/        <-- Ground, walls, buildings
      clothing/     <-- Outfits for characters
      hair/         <-- Hairstyles
      hats/         <-- Hats and headwear
      hand-items/   <-- Weapons and tools
      accessories/  <-- Capes, masks, ears, shields
      effects/      <-- Hearts, stars, sparkles
      special-skins/<-- Orc, demon, ghost skins
      ui/           <-- Icons and markers
      misc/         <-- Trees, fountain, furniture
  index.html        <-- The web page that holds the game
  package.json      <-- Lists all the tools and libraries
```

### How the code guardrails work

This project has automatic helpers that check your code:

- **ESLint** catches bugs and mistakes before they cause problems
- **Prettier** formats your code to look clean and consistent
- **Pre-commit hook** runs both of these automatically every time you save your work with git

If you try to commit code that has a problem, it will tell you what to fix. This is normal and helpful - even professional programmers use these tools!

## Learning Resources

- [Kaplay Docs](https://kaplayjs.com/docs/) - learn about the game engine
- [Kaplay Playground](https://play.kaplayjs.com/) - try out code in the browser
- [MDN JavaScript Guide](https://developer.mozilla.org/en-US/docs/Learn/JavaScript) - learn JavaScript

## Credits

Pixel art assets by [GandalfHardcore](https://gandalfhardcore.itch.io/) - amazing pixel art!
