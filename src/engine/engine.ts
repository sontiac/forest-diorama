import * as THREE from 'three';
import type { Component, ComponentInstance, Ctx } from './types';

export interface RunOptions {
  mode: 'instant' | 'timelapse';
  stepSeconds?: number;
  /** Called every frame before render (e.g. OrbitControls.update). */
  onFrame?: (t: number, dt: number) => void;
  /** Called when a component is mounted (drives the log / timelapse caption). */
  onReveal?: (component: Component, index: number, total: number) => void;
}

const easeOutBack = (p: number): number => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2);
};

interface Interactive {
  root: THREE.Object3D;
  inst: ComponentInstance;
}
interface RevealAnim {
  obj: THREE.Object3D;
  base: THREE.Vector3;
  t0: number;
  dur: number;
}

/** Mounts components (instantly or as a timelapse), wires interaction,
 *  and drives the render loop. */
export function runScene(ctx: Ctx, components: Component[], opts: RunOptions): void {
  const updaters: Array<(t: number, dt: number) => void> = [];
  const interactives: Interactive[] = [];
  const reveals: RevealAnim[] = [];

  function mount(c: Component): ComponentInstance {
    const inst = c.create(ctx);
    if (inst.api) ctx.world.register(c.id, inst.api);
    if (inst.object) ctx.scene.add(inst.object);
    if (inst.update) {
      const update = inst.update.bind(inst);
      updaters.push(update);
    }
    if (inst.object && (inst.onPointerDown || inst.onPointerOver || inst.onPointerOut)) {
      const root = inst.object;
      root.traverse((o) => { o.userData.__cid = c.id; });
      interactives.push({ root, inst });
    }
    return inst;
  }

  function reveal(obj: THREE.Object3D): void {
    const base = obj.scale.clone();
    obj.scale.setScalar(0.0001);
    reveals.push({ obj, base, t0: performance.now() / 1000, dur: 0.7 });
  }

  if (opts.mode === 'instant') {
    components.forEach((c, i) => {
      mount(c);
      opts.onReveal?.(c, i, components.length);
    });
  } else {
    const stepMs = (opts.stepSeconds ?? 1.1) * 1000;
    let i = 0;
    const playNext = (): void => {
      if (i >= components.length) return;
      const c = components[i];
      const inst = mount(c);
      if (inst.object) reveal(inst.object);
      opts.onReveal?.(c, i, components.length);
      i += 1;
      window.setTimeout(playNext, stepMs);
    };
    playNext();
  }

  // ---- Pointer interaction: raycast → owning component ----
  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();

  function pick(ev: PointerEvent): { inst: ComponentInstance; hit: THREE.Intersection } | null {
    if (interactives.length === 0) return null;
    ndc.x = (ev.clientX / window.innerWidth) * 2 - 1;
    ndc.y = -(ev.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(ndc, ctx.camera);
    const hits = raycaster.intersectObjects(interactives.map((x) => x.root), true);
    if (hits.length === 0) return null;
    const cid = hits[0].object.userData.__cid as string | undefined;
    const entry = interactives.find((x) => x.root.userData.__cid === cid);
    return entry ? { inst: entry.inst, hit: hits[0] } : null;
  }

  const canvas = ctx.renderer.domElement;
  canvas.addEventListener('pointerdown', (ev) => {
    const r = pick(ev);
    if (r) r.inst.onPointerDown?.(ctx, r.hit);
  });

  let hovered: ComponentInstance | null = null;
  canvas.addEventListener('pointermove', (ev) => {
    const r = pick(ev);
    const inst = r ? r.inst : null;
    if (inst !== hovered) {
      hovered?.onPointerOut?.(ctx);
      hovered = inst;
      if (r && inst) inst.onPointerOver?.(ctx, r.hit);
    }
  });

  // ---- Render loop ----
  const clock = new THREE.Clock();
  function frame(): void {
    requestAnimationFrame(frame);
    const dt = clock.getDelta();
    const t = clock.elapsedTime;

    for (const u of updaters) u(t, dt);

    const now = performance.now() / 1000;
    for (let k = reveals.length - 1; k >= 0; k -= 1) {
      const a = reveals[k];
      const p = Math.min(1, (now - a.t0) / a.dur);
      const e = Math.max(0.0001, easeOutBack(p));
      a.obj.scale.copy(a.base).multiplyScalar(e);
      if (p >= 1) {
        a.obj.scale.copy(a.base);
        reveals.splice(k, 1);
      }
    }

    opts.onFrame?.(t, dt);
    ctx.renderer.render(ctx.scene, ctx.camera);
  }
  frame();
}
