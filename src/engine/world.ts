import type { World, ComponentApi } from './types';

/** The shared placement facts for the scene. Edit these once and every
 *  component that reads them (pond ecosystem, breeze, etc.) follows. */
export function createWorld(): World {
  const registry = new Map<string, ComponentApi>();

  return {
    pond: { center: { x: -4.5, z: -1.5 }, radius: 2.6 },
    clearing: { radius: 12 },
    trees: [
      { x: -7, z: -5, scale: 1.1, hue: '#2f6d34' },
      { x: -9, z: 2, scale: 0.9, hue: '#357a3a' },
      { x: -4, z: 7, scale: 1.05, hue: '#2b6630' },
      { x: 4, z: 8, scale: 1.2, hue: '#327138' },
      { x: 8, z: 3, scale: 1.0, hue: '#2f6d34' },
      { x: 9, z: -4, scale: 0.95, hue: '#3a8040' },
      { x: 3, z: -8, scale: 1.15, hue: '#2b6630' },
      { x: -3, z: -9, scale: 0.85, hue: '#357a3a' },
    ],
    register(id, api) {
      registry.set(id, api);
    },
    get<T extends ComponentApi = ComponentApi>(id: string): T | undefined {
      return registry.get(id) as T | undefined;
    },
  };
}
