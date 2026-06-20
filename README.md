# Forest Diorama

A self-animating low-poly 3D scene (three.js + TypeScript + Vite), built as a
set of independent **components** revealed from a single ordered **manifest**.

## Run

```bash
npm run dev        # dev server with HMR at http://localhost:5173
npm run build      # typecheck + production build to dist/
npm run typecheck  # tsc --noEmit
```

- `http://localhost:5173/` — the full scene (everything at once).
- `http://localhost:5173/?timelapse` — the scene **assembles itself** one feature
  at a time, camera orbiting. Add `&step=0.8` to change the seconds between reveals.
  This is the mode to screen-record.

## Architecture

```
src/
  engine/
    types.ts    Component / Ctx / World / Env / ComponentInstance interfaces
    world.ts    shared placement facts (pond, trees, clearing) + component registry
    engine.ts   mounts components, instant/timelapse reveal, raycast interaction, render loop
  main.ts       bootstrap: renderer, camera, base lighting/ground, ctx, run the manifest
  components/
    manifest.ts ordered list of every feature (also the timelapse order)
    {flora,fauna,water,sky,structures,fx}/   one module per feature
public/assets/  textures (pond.png, garden.png)
legacy/         pre-migration single-file snapshot (reference only)
```

### Component contract

Every feature is a `Component` (`src/engine/types.ts`):

```ts
{
  id: string;
  title: string;                 // shown in the log + timelapse caption
  create(ctx): {
    object?: THREE.Object3D;     // added to the scene; omit for behavior-only (e.g. breeze)
    update?(t, dt): void;        // per-frame
    onPointerDown?(ctx, hit),    // interaction — engine raycasts & dispatches
    onPointerOver?, onPointerOut?,
    api?: Record<string, unknown> // exposed to other components via ctx.world.get(id)
  }
}
```

`ctx` gives every component `{ THREE, scene, camera, renderer, sun, hemi, texLoader, env, world }`.
`env` is time-of-day (`daylight`/`night01`/`elevation`), published by the day-night component.

## Working in this codebase

- **Add a feature:** write `src/components/<domain>/<name>.js|ts` exporting a factory,
  then add one entry to `manifest.ts`. It auto-mounts, animates, reveals, and logs.
- **Improve a feature:** edit its module. To build *on* another feature, read it with
  `ctx.world.get(id)` (see the `breeze` entry, which sways the `forest`'s trees) and
  place things off shared facts like `ctx.world.pond` instead of hardcoding coordinates.
- **Interactivity:** add `onPointerDown` / `onPointerOver` to a component instance —
  no engine changes needed.
- Existing component modules are still plain `.js` (allowed via `allowJs`); convert one
  to `.ts` when you next touch it.
