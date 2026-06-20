import type { World, ComponentApi } from './types';

/** The shared placement facts for the scene. Edit these once and every
 *  component that reads them (pond ecosystem, breeze, etc.) follows. */
export function createWorld(): World {
  const registry = new Map<string, ComponentApi>();

  return {
    pond: { center: { x: -7.65, z: -2.55 }, radius: 2.6 },
    clearing: { radius: 20 },
    trees: [
      { x: -11.9, z: -8.5, scale: 1.1, hue: '#2f6d34' },
      { x: -15.3, z: 3.4, scale: 0.9, hue: '#357a3a' },
      { x: -6.8, z: 11.9, scale: 1.05, hue: '#2b6630' },
      { x: 6.8, z: 13.6, scale: 1.2, hue: '#327138' },
      { x: 13.6, z: 5.1, scale: 1.0, hue: '#2f6d34' },
      { x: 15.3, z: -6.8, scale: 0.95, hue: '#3a8040' },
      { x: 5.1, z: -13.6, scale: 1.15, hue: '#2b6630' },
      { x: -5.1, z: -15.3, scale: 0.85, hue: '#357a3a' },
    ],
    register(id, api) {
      registry.set(id, api);
    },
    get<T extends ComponentApi = ComponentApi>(id: string): T | undefined {
      return registry.get(id) as T | undefined;
    },
  };
}
