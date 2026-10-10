# THE FUTURE FACTORY

A React + Vite scroll-driven Three.js experience. The manufacturing scene is composed of reusable procedural meshes (robot arms, conveyor, chassis, bearings, gears, circuit board and housing); component positions, camera, conveyor motion and phase UI follow the same ScrollTrigger progress and reverse with scroll.

## Run locally

```sh
npm install
npm run dev
```

Create a production build with `npm run build`, then serve the generated `dist/` directory. The first visit needs a network connection for the Google Fonts stylesheet. No external model downloads are required.

## Project structure

- `src/App.jsx` — scene geometry, deterministic animation, Lenis and ScrollTrigger integration, story and interface.
- `src/styles.css` — responsive industrial art direction and interface.
- `src/main.jsx` — React entry point.

## Asset notes

The supplied factory-floor and mechanical-cutaway references appear as local images in the two closing editorial sections. All visible 3D geometry in the main scene is authored procedurally in Three.js. This keeps the demo runnable without model licenses or an external model pipeline. The procedural engineering model is a coherent illustrative electromechanical drive assembly, not a production-accurate CAD model. Replace individual scene groups with licensed, optimized GLB assets if dimensionally faithful industrial equipment is required.

Canvas resolution is capped at 1.6 device pixel ratio and Sparkles are reduced with the system motion preference. Scroll remains native and reversible; Lenis smooths desktop wheel scrolling while touch scrolling stays native.
