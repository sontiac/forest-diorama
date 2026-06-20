import type { Component } from '../engine/types';

// Flora
import { makeForest } from './flora/trees.js';
import { makeRocks } from './flora/rocks.js';
import { createGarden } from './flora/garden.js';
import { createMushrooms } from './flora/mushrooms.js';
import { createReeds } from './flora/reeds.js';
import { createLilyPads } from './flora/lilypads.js';
// Fauna
import { createButterflies } from './fauna/butterflies.js';
import { createDeer } from './fauna/deer.js';
import { createBirds } from './fauna/birds.js';
import { createKoi } from './fauna/koi.js';
import { createRabbits } from './fauna/rabbits.js';
import { createOwl } from './fauna/owl.js';
import { createFox } from './fauna/fox.js';
import { createDragonflies } from './fauna/dragonflies.js';
import { createBees } from './fauna/bees.js';
import { createFrogs } from './fauna/frogs.js';
import { turtle } from './fauna/turtle';
import { kite } from './sky/kite';
import { hedgehog } from './fauna/hedgehog';
import { lamppost } from './structures/lamppost';
import { sunflowers } from './flora/sunflowers';
import { ducks } from './fauna/ducks';
import { flag } from './structures/flag';
// Water
import { makePond } from './water/pond.js';
import { createWaterfall } from './water/waterfall.js';
// Sky
import { makeBalloon } from './sky/balloon.js';
import { makeRainbow } from './sky/rainbow.js';
import { createDayNight } from './sky/daynight.js';
import { createClouds } from './sky/clouds.js';
import { createMeteors } from './sky/meteors.js';
import { createAurora } from './sky/aurora.js';
// Structures
import { createCampsite } from './structures/campsite.js';
import { createCottage } from './structures/cottage.js';
import { createBridge } from './structures/bridge.js';
import { createWaterWheel } from './structures/waterwheel.js';
import { createStringLights } from './structures/stringlights.js';
import { createWindmill } from './structures/windmill.js';
import { createSwing } from './structures/swing.js';
import { createScarecrow } from './structures/scarecrow.js';
import { createWell } from './structures/well.js';
import { createBeehive } from './structures/beehive.js';
// FX
import { makeWisp } from './fx/wisp.js';
import { createPetals } from './fx/petals.js';

/**
 * The ordered scene manifest. This list is the single source of truth for
 * what's in the scene and the order features reveal in the timelapse.
 *
 * To add a feature: write a module and add one entry here.
 * To improve a feature: edit its module, or read an earlier one with
 * ctx.world.get(id) (see the 'breeze' entry, which sways the 'forest').
 *
 * Placements are spread across a roomy clearing; pond-attached features
 * derive their position from ctx.world.pond so they move together.
 */
export const manifest: Component[] = [
  {
    id: 'forest', title: 'A forest clearing',
    create: (ctx) => {
      const { group, trees } = makeForest(ctx.THREE, ctx.world.trees);
      return { object: group, api: { trees } };
    },
  },
  {
    id: 'rocks', title: 'Mossy rocks',
    create: (ctx) => ({
      object: makeRocks(ctx.THREE, [
        { x: -4.25, z: 5.1, scale: 1.3 },
        { x: 3.4, z: -3.4, scale: 0.8 },
        { x: 8.5, z: 2.55, scale: 1.0 },
      ]),
    }),
  },
  {
    id: 'balloon', title: 'A hot-air balloon',
    create: (ctx) => {
      const r = makeBalloon(ctx.THREE, { x: 0, z: 0, height: 18, colors: ['#e84c3d', '#f4d03f', '#3da5e8'] });
      return { object: r.group, update: r.tick };
    },
  },
  {
    id: 'pond', title: 'A shimmering pond',
    create: (ctx) => {
      const p = ctx.world.pond;
      const r = makePond(ctx.THREE, ctx.texLoader, { x: p.center.x, z: p.center.z, radius: p.radius });
      return { object: r.mesh, update: r.tick };
    },
  },
  {
    id: 'butterflies', title: 'A flutter of butterflies',
    create: (ctx) => {
      const r = createButterflies(ctx.THREE, { count: 7 });
      return { object: r.group, update: r.tick };
    },
  },
  {
    id: 'wisp', title: 'A will-o\'-the-wisp',
    create: (ctx) => {
      const p = ctx.world.pond;
      const r = makeWisp(ctx.THREE, { x: p.center.x, y: 2.6, z: p.center.z, colorA: '#7df9ff', colorB: '#b06bff' });
      return { object: r.group, update: r.tick };
    },
  },
  {
    id: 'deer', title: 'A grazing deer',
    create: (ctx) => {
      const r = createDeer(ctx.THREE, { x: 9.35, z: 7.65, facing: Math.PI * 0.85 });
      return { object: r.group, update: r.tick };
    },
  },
  {
    id: 'rainbow', title: 'A rainbow',
    create: (ctx) => {
      const r = makeRainbow(ctx.THREE, { x: 0, y: 0, z: -22, radius: 30, env: ctx.env } as any);
      return { object: r.group, update: r.tick };
    },
  },
  {
    id: 'daynight', title: 'A day-night cycle',
    create: (ctx) => {
      const r = createDayNight(ctx.THREE, { scene: ctx.scene, sun: ctx.sun, hemi: ctx.hemi, env: ctx.env, periodSeconds: 60 } as any);
      return { object: r.group, update: r.tick };
    },
  },
  {
    id: 'campsite', title: 'A cozy campsite',
    create: (ctx) => {
      const r = createCampsite(ctx.THREE, { x: 10.2, z: -10.2 });
      return { object: r.group, update: r.tick };
    },
  },
  {
    id: 'birds', title: 'A flock of birds',
    create: (ctx) => {
      const r = createBirds(ctx.THREE, { count: 7, radius: 24, height: 13 });
      return { object: r.group, update: r.tick };
    },
  },
  {
    id: 'cottage', title: 'A cottage',
    create: (ctx) => {
      const r = createCottage(ctx.THREE, { x: -11.05, z: 7.65, facing: Math.atan2(6.5, -4.5), env: ctx.env, texLoader: ctx.texLoader } as any);
      return { object: r.group, update: r.tick };
    },
  },
  {
    id: 'waterfall', title: 'A waterfall',
    create: (ctx) => {
      const p = ctx.world.pond; // sits at the pond's edge
      const r = createWaterfall(ctx.THREE, { x: p.center.x - 3.0, z: p.center.z - 1.2, facing: Math.atan2(3.0, 1.2), height: 2.9 });
      return { object: r.group, update: r.tick };
    },
  },
  {
    id: 'clouds', title: 'Drifting clouds',
    create: (ctx) => {
      const r = createClouds(ctx.THREE, { count: 7 });
      return { object: r.group, update: r.tick };
    },
  },
  {
    id: 'koi', title: 'Koi in the pond',
    create: (ctx) => {
      const p = ctx.world.pond;
      const r = createKoi(ctx.THREE, { center: p.center, radius: 1.6, count: 5 });
      return { object: r.group, update: r.tick };
    },
  },
  {
    id: 'garden', title: 'A flower garden',
    create: (ctx) => {
      const r = createGarden(ctx.THREE, { x: -7.82, z: 5.78, texLoader: ctx.texLoader } as any);
      return { object: r.group, update: r.tick };
    },
  },
  {
    id: 'mushrooms', title: 'Glowing mushrooms',
    create: (ctx) => {
      const r = createMushrooms(ctx.THREE, {
        clusters: [{ x: -11.9, z: 0.34 }, { x: 4.76, z: -12.58 }, { x: -2.72, z: 10.54 }],
        env: ctx.env,
      });
      return { object: r.group, update: r.tick };
    },
  },
  {
    id: 'rabbits', title: 'Hopping rabbits',
    create: (ctx) => {
      const r = createRabbits(ctx.THREE, { homes: [{ x: 3.74, z: 4.08 }, { x: -2.55, z: -7.65 }, { x: 5.95, z: -4.25 }] });
      return { object: r.group, update: r.tick };
    },
  },
  {
    id: 'meteors', title: 'Shooting stars',
    create: (ctx) => {
      const r = createMeteors(ctx.THREE, { env: ctx.env, count: 3 });
      return { object: r.group, update: r.tick };
    },
  },
  {
    id: 'aurora', title: 'An aurora',
    create: (ctx) => {
      const r = createAurora(ctx.THREE, { env: ctx.env });
      return { object: r.group, update: r.tick };
    },
  },
  {
    id: 'petals', title: 'Cherry-blossom petals',
    create: (ctx) => {
      const r = createPetals(ctx.THREE, { count: 80, area: 30, top: 17 });
      return { object: r.group, update: r.tick };
    },
  },
  {
    id: 'bridge', title: 'A footbridge',
    create: (ctx) => {
      const p = ctx.world.pond;
      const r = createBridge(ctx.THREE, { x: p.center.x, z: p.center.z, facing: Math.PI / 2, span: 5.6, width: 1.3, archH: 0.9 });
      return { object: r.group };
    },
  },
  {
    id: 'waterwheel', title: 'A water wheel',
    create: (ctx) => {
      const p = ctx.world.pond; // at the pond's edge by the waterfall
      const r = createWaterWheel(ctx.THREE, { x: p.center.x - 1.5, z: p.center.z + 2.1, facing: 0.93, R: 1.4 });
      return { object: r.group, update: r.tick };
    },
  },
  {
    id: 'stringlights', title: 'Festoon string lights',
    create: (ctx) => {
      const r = createStringLights(ctx.THREE, {
        anchors: [
          { x: -15.3, y: 3.4, z: 3.4 }, { x: -6.8, y: 3.8, z: 11.9 }, { x: 6.8, y: 3.8, z: 13.6 },
          { x: 13.6, y: 3.6, z: 5.1 }, { x: 15.3, y: 3.4, z: -6.8 },
        ],
        env: ctx.env,
      } as any);
      return { object: r.group, update: r.tick };
    },
  },
  {
    id: 'owl', title: 'An owl',
    create: (ctx) => {
      const r = createOwl(ctx.THREE, { x: 12.24, y: 3.8, z: 5.78, facing: Math.atan2(-7.2, -3.4), env: ctx.env });
      return { object: r.group, update: r.tick };
    },
  },
  {
    id: 'windmill', title: 'A windmill',
    create: (ctx) => {
      const r = createWindmill(ctx.THREE, { x: -18.7, z: -15.3, facing: Math.atan2(11, 9), height: 5, texLoader: ctx.texLoader } as any);
      return { object: r.group, update: r.tick };
    },
  },
  {
    id: 'breeze', title: 'A breeze through the forest',
    create: (ctx) => {
      const trees = (ctx.world.get('forest')?.trees ?? []) as Array<{ rotation: { x: number; z: number } }>;
      const wind = trees.map((tr, i) => ({ tr, phase: i * 1.3, freq: 0.6 + (i % 3) * 0.15 }));
      return {
        update: (t: number) => {
          for (const w of wind) {
            w.tr.rotation.z = Math.sin(t * w.freq + w.phase) * 0.035;
            w.tr.rotation.x = Math.cos(t * w.freq * 0.8 + w.phase) * 0.02;
          }
        },
      };
    },
  },
  {
    id: 'fox', title: 'A trotting fox',
    create: (ctx) => {
      const r = createFox(ctx.THREE, { center: { x: 0.85, z: 10.2 }, radius: 3.0, speed: 0.4 });
      return { object: r.group, update: r.tick };
    },
  },
  {
    id: 'dragonflies', title: 'Dragonflies',
    create: (ctx) => {
      const p = ctx.world.pond;
      const r = createDragonflies(ctx.THREE, { center: p.center, radius: 1.8, count: 4, baseY: 1.0 });
      return { object: r.group, update: r.tick };
    },
  },
  {
    id: 'reeds', title: 'Cattail reeds',
    create: (ctx) => {
      const p = ctx.world.pond;
      const r = createReeds(ctx.THREE, { center: p.center, radius: 2.95, count: 8 });
      return { object: r.group, update: r.tick };
    },
  },
  {
    id: 'swing', title: 'A rope swing',
    create: (ctx) => {
      const r = createSwing(ctx.THREE, { anchor: { x: 6.8, y: 2.9, z: 9.52 }, ropeLen: 1.7, fromZ: 12.58 } as any);
      return { object: r.group, update: r.tick };
    },
  },
  {
    id: 'lilypads', title: 'Lily pads',
    create: (ctx) => {
      const p = ctx.world.pond;
      const r = createLilyPads(ctx.THREE, { center: p.center, radius: 1.9, count: 6 });
      return { object: r.group, update: r.tick, api: { positions: r.positions } };
    },
  },
  {
    id: 'scarecrow', title: 'A scarecrow',
    create: (ctx) => {
      const r = createScarecrow(ctx.THREE, { x: -5.1, z: 7.82, facing: Math.atan2(3.0, -4.6) });
      return { object: r.group, update: r.tick };
    },
  },
  {
    id: 'bees', title: 'Busy bees',
    create: (ctx) => {
      const r = createBees(ctx.THREE, { center: { x: -7.82, z: 5.78 }, area: { x: 1.4, z: 0.9 }, count: 6, baseY: 0.8 });
      return { object: r.group, update: r.tick };
    },
  },
  {
    id: 'well', title: 'A wishing well (click to toss a coin)',
    create: (ctx) => {
      const r = createWell(ctx.THREE, { x: 2.55, z: 7.82, facing: 0.3, texLoader: ctx.texLoader } as any);
      return { object: r.group, update: r.tick, onPointerDown: r.onPointerDown };
    },
  },
  {
    id: 'beehive', title: 'A beehive',
    create: (ctx) => {
      const r = createBeehive(ctx.THREE, { x: -3.74, z: 5.1, facing: -0.4 });
      return { object: r.group, update: r.tick };
    },
  },
  {
    id: 'frogs', title: 'Frogs on the lily pads (click to make them hop)',
    create: (ctx) => {
      const positions = (ctx.world.get('lilypads')?.positions ?? []) as Array<{ x: number; z: number }>;
      const r = createFrogs(ctx.THREE, { pads: positions, maxFrogs: 3 } as any);
      return { object: r.group, update: r.tick, onPointerDown: r.onPointerDown };
    },
  },
  turtle, // native TypeScript component — already a Component, no wrapper needed
  kite,
  hedgehog,
  lamppost,
  sunflowers,
  ducks,
  flag,
];
