# SaynumB · WebGL

An interactive 3D rendering of the SaynumB mascot, built with [Three.js](https://threejs.org/). The character (head, hair, neck, body) is constructed procedurally from primitives and canvas textures rather than an imported model file, so expressions, hair, and the shirt's cloth-like sway can all be driven live in code.

## Running it

Requires Python (for a static file server) since the page loads Three.js as an ES module, which browsers block over `file://`.

```bash
python -m http.server 4173 --directory .
```

Then open `http://localhost:4173`.

If you're using Claude Code in this repo, a `saynumb-webgl` launch config is already registered in `.claude/launch.json`.

## Features

- **Drag and drop** — click/touch-drag the character around the scene; it squashes and bounces on pickup/drop.
- **Emotions** — Happy, Surprised, Wink, Sad, Love, selectable from the side panel; the face is redrawn live on a canvas texture. Idle blinking happens automatically.
- **Say Hi** — click the button (or just tap the character) for a little bounce and a "Hi~!" speech bubble.
- **Cloth physics** — the shirt hangs from a pivot at the shoulder line and reacts to the character's own motion with a small spring-damper simulation, so it swings and settles like real fabric under gravity/inertia when dragged or dropped.
- **Background colors** — white (default), pastel swatches, or a custom color picker.
- **Background scenes** — Space (starfield + planets), Star Landscape (gradient sky, moon, mountain silhouette), Glass & Cloud (drifting clouds + a glass floor panel).

## Project structure

```
index.html          Page shell + UI panel (emotions, backgrounds, Say Hi)
css/style.css        Styling, responsive panel (collapses to a hamburger on mobile)
js/main.js           Scene/camera/renderer setup, drag interaction, UI wiring, render loop
js/character.js      Builds the 3D character (head/hair/neck/body), expressions, cloth sway
js/background.js      Background color/scene presets (space, star landscape, glass & cloud)
assets/              Reference art (saynumb-reference.png)
```

Three.js is installed locally via npm (`node_modules/three`) and loaded through an import map in `index.html` — no CDN dependency at runtime.

## Notes

- Colors (head cyan, body blue, ink outline) were sampled directly from the original mascot artwork to match it closely.
- The hair is drawn as a flat canvas-texture billboard rather than 3D tubes — curving thin tubes along the sphere's surface kept compressing the 3 strands into a single blob from the camera's angle.
