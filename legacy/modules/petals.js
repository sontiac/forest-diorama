// Drifting cherry-blossom petals over the whole clearing. Each petal
// is a small plane that flutters (tumbling on several axes) and swirls
// as it falls, wrapping back to the top. Pure geometry.
//
// Usage:
//   const { group, tick } = createPetals(THREE, { count: 70, area: 18, top: 16 });
//   scene.add(group); tickers.push(tick);

export function createPetals(THREE, { count = 70, area = 18, top = 16 } = {}) {
  const group = new THREE.Group();
  const geo = new THREE.PlaneGeometry(0.2, 0.13);
  const colors = ['#ffd1e8', '#ffb3d1', '#ffffff', '#ffc8dd'];
  const mats = colors.map((c) => new THREE.MeshStandardMaterial({
    color: c, roughness: 0.7, side: THREE.DoubleSide, transparent: true, opacity: 0.95, flatShading: true,
  }));

  let seed = 33.7;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };

  const petals = [];
  for (let i = 0; i < count; i++) {
    const mesh = new THREE.Mesh(geo, mats[i % mats.length]);
    group.add(mesh);
    petals.push({
      mesh,
      baseX: (rnd() - 0.5) * area * 2,
      baseZ: (rnd() - 0.5) * area * 2,
      fallSpeed: 0.7 + rnd() * 0.8,
      yoff: rnd() * (top + 2),
      swirlR: 0.6 + rnd() * 1.6,
      swirlSpeed: 0.4 + rnd() * 0.7,
      phase: rnd() * 6.28,
      rx: 0.6 + rnd() * 1.4,
      ry: 0.5 + rnd() * 1.5,
    });
  }

  const range = top + 2; // fall distance before wrapping back up

  function tick(t) {
    for (const p of petals) {
      const fallen = (t * p.fallSpeed + p.yoff) % range;
      const y = top - fallen;
      const x = p.baseX + Math.sin(t * p.swirlSpeed + p.phase) * p.swirlR;
      const z = p.baseZ + Math.cos(t * p.swirlSpeed * 0.8 + p.phase) * p.swirlR;
      p.mesh.position.set(x, y, z);
      // Tumble/flutter on multiple axes.
      p.mesh.rotation.set(t * p.rx + p.phase, t * p.ry, Math.sin(t * 2 + p.phase) * 0.8);
    }
  }

  return { group, tick };
}
