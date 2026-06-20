// Drifting low-poly clouds high over the clearing. Each cloud is a
// cluster of flattened spheres; they sail slowly along X and wrap
// around. Being lit by the scene's sun, they brighten by day and
// dim at night for free.
//
// Usage:
//   const { group, tick } = createClouds(THREE, { count: 6 });
//   scene.add(group); tickers.push(tick);

export function createClouds(THREE, { count = 6 } = {}) {
  const group = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 1, metalness: 0 });

  const SPAN = 64;        // wrap width along X
  const HALF = SPAN / 2;
  const clouds = [];

  // Deterministic pseudo-random so the layout is stable across reloads.
  let seed = 1234.5;
  const rnd = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };

  for (let i = 0; i < count; i++) {
    const cloud = new THREE.Group();
    const puffs = 4 + Math.floor(rnd() * 4);
    for (let p = 0; p < puffs; p++) {
      const r = 1.2 + rnd() * 1.1;
      const puff = new THREE.Mesh(new THREE.SphereGeometry(r, 12, 10), mat);
      puff.position.set((rnd() - 0.5) * 4.5, (rnd() - 0.5) * 0.8, (rnd() - 0.5) * 2.4);
      puff.scale.y = 0.6;
      cloud.add(puff);
    }
    group.add(cloud);
    clouds.push({
      cloud,
      baseX: rnd() * SPAN - HALF,
      y: 14 + rnd() * 5,
      z: (rnd() - 0.5) * 44,
      speed: 0.25 + rnd() * 0.5,
      bob: rnd() * 6.28,
    });
  }

  function tick(t) {
    for (const c of clouds) {
      const x = (((c.baseX + t * c.speed + HALF) % SPAN) + SPAN) % SPAN - HALF;
      c.cloud.position.set(x, c.y + Math.sin(t * 0.2 + c.bob) * 0.3, c.z);
    }
  }

  return { group, tick };
}
