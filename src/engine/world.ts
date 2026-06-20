import type { World, ComponentApi } from './types';

type Tree = { x: number; z: number; scale: number; hue: string; kind: 'conifer' | 'round' };

const HUES = ['#2f6d34', '#357a3a', '#2b6630', '#327138', '#3a8040', '#246028', '#3f8a45'];

/** Build the forest: a few anchor trees (string lights hang from these),
 *  a denser edge ring, and a far back row for depth. Deterministic. */
function buildTrees(): Tree[] {
  const trees: Tree[] = [
    // Anchor trees at the clearing edge (string-light garland hangs on these).
    { x: -11.9, z: -8.5, scale: 1.1, hue: '#2f6d34', kind: 'conifer' },
    { x: -15.3, z: 3.4, scale: 0.9, hue: '#357a3a', kind: 'round' },
    { x: -6.8, z: 11.9, scale: 1.05, hue: '#2b6630', kind: 'conifer' },
    { x: 6.8, z: 13.6, scale: 1.2, hue: '#327138', kind: 'round' },
    { x: 13.6, z: 5.1, scale: 1.0, hue: '#2f6d34', kind: 'conifer' },
    { x: 15.3, z: -6.8, scale: 0.95, hue: '#3a8040', kind: 'conifer' },
    { x: 5.1, z: -13.6, scale: 1.15, hue: '#2b6630', kind: 'round' },
    { x: -5.1, z: -15.3, scale: 0.85, hue: '#357a3a', kind: 'conifer' },
  ];
  // Denser edge ring (just inside the clearing, clear of placed features).
  const ringN = 11;
  for (let i = 0; i < ringN; i++) {
    const a = (i / ringN) * Math.PI * 2 + 0.28;
    const r = 18.2 + (i % 3) * 0.9;
    trees.push({ x: Math.cos(a) * r, z: Math.sin(a) * r, scale: 0.85 + (i % 4) * 0.12, hue: HUES[i % HUES.length], kind: i % 3 === 0 ? 'round' : 'conifer' });
  }
  // Far back row for forest depth.
  const backN = 13;
  for (let i = 0; i < backN; i++) {
    const a = (i / backN) * Math.PI * 2 + 0.12;
    const r = 27 + (i % 4) * 2.4;
    trees.push({ x: Math.cos(a) * r, z: Math.sin(a) * r, scale: 1.0 + (i % 3) * 0.25, hue: HUES[(i + 2) % HUES.length], kind: i % 2 === 0 ? 'round' : 'conifer' });
  }
  return trees;
}

export function createWorld(): World {
  const registry = new Map<string, ComponentApi>();

  return {
    pond: { center: { x: -7.65, z: -2.55 }, radius: 2.6 },
    clearing: { radius: 20 },
    trees: buildTrees(),
    register(id, api) {
      registry.set(id, api);
    },
    get<T extends ComponentApi = ComponentApi>(id: string): T | undefined {
      return registry.get(id) as T | undefined;
    },
  };
}
