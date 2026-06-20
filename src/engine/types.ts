import type * as THREE from 'three';

/** Time-of-day state, published each frame by the day-night component
 *  and read by anything that reacts to dusk/dawn. */
export interface Env {
  daylight: number;  // 0 (night) .. 1 (full day)
  night01: number;   // 0 (day) .. 1 (full night)
  elevation: number; // sun elevation, -1 .. 1
}

/** Whatever a component chooses to expose to others (read via world.get). */
export type ComponentApi = Record<string, unknown>;

/** Shared world facts (placements) + a registry of component APIs.
 *  Components read placements from here instead of hardcoding numbers,
 *  so moving e.g. the pond updates everything that sits on it. */
export interface World {
  readonly pond: { center: { x: number; z: number }; radius: number };
  readonly clearing: { radius: number };
  readonly trees: ReadonlyArray<{ x: number; z: number; scale: number; hue: string; kind?: 'conifer' | 'round' }>;
  register(id: string, api: ComponentApi): void;
  get<T extends ComponentApi = ComponentApi>(id: string): T | undefined;
}

/** The context handed to every component's create(). */
export interface Ctx {
  readonly THREE: typeof THREE;
  readonly scene: THREE.Scene;
  readonly camera: THREE.PerspectiveCamera;
  readonly renderer: THREE.WebGLRenderer;
  readonly sun: THREE.DirectionalLight;
  readonly hemi: THREE.HemisphereLight;
  readonly texLoader: THREE.TextureLoader;
  readonly env: Env;
  readonly world: World;
}

/** A live, mounted component. */
export interface ComponentInstance {
  /** Root object added to the scene (omit for behavior-only components like the breeze). */
  object?: THREE.Object3D;
  /** Per-frame update. t = elapsed seconds, dt = delta seconds. */
  update?(t: number, dt: number): void;
  /** Pointer interaction (engine raycasts and dispatches to the owning component). */
  onPointerDown?(ctx: Ctx, hit: THREE.Intersection): void;
  onPointerOver?(ctx: Ctx, hit: THREE.Intersection): void;
  onPointerOut?(ctx: Ctx): void;
  /** Data exposed to other components via world.get(id). */
  api?: ComponentApi;
}

/** A scene feature. Add one = write a module + one manifest entry.
 *  Improve one = edit its module, or read an earlier one via ctx.world.get(). */
export interface Component {
  id: string;
  title: string; // shown in the log and during the timelapse reveal
  create(ctx: Ctx): ComponentInstance;
}
