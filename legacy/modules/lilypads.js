// Lily pads floating on the pond: flat notched green pads, some crowned
// with a pink water lily, bobbing gently and drifting on the surface.
// Pure geometry.
//
// Usage:
//   const { group, tick } = createLilyPads(THREE, { center: { x: -4.5, z: -1.5 }, count: 6 });
//   scene.add(group); tickers.push(tick);

export function createLilyPads(THREE, { center = { x: 0, z: 0 }, radius = 2.0, count = 6 } = {}) {
  const group = new THREE.Group();
  const padMat = new THREE.MeshStandardMaterial({ color: '#3f8f46', roughness: 0.8, side: THREE.DoubleSide, flatShading: true });
  const petalMat = new THREE.MeshStandardMaterial({ color: '#ff9ec7', roughness: 0.6, flatShading: true });
  const coreMat = new THREE.MeshStandardMaterial({ color: '#ffe066', roughness: 0.6 });

  let seed = 67.9;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };

  const pads = [];
  for (let i = 0; i < count; i++) {
    const pad = new THREE.Group();

    // Notched round pad (a circle with a wedge gap).
    const r = 0.32 + rnd() * 0.22;
    const disc = new THREE.Mesh(
      new THREE.CircleGeometry(r, 18, 0.5, Math.PI * 2 - 0.9),
      padMat
    );
    disc.rotation.x = -Math.PI / 2;
    pad.add(disc);

    // Some pads carry a water lily.
    if (rnd() < 0.5) {
      const flower = new THREE.Group();
      flower.position.y = 0.04;
      for (let k = 0; k < 6; k++) {
        const a = (k / 6) * Math.PI * 2;
        const petal = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 6), petalMat);
        petal.scale.set(1, 0.4, 1.6);
        petal.position.set(Math.cos(a) * 0.08, 0, Math.sin(a) * 0.08);
        petal.rotation.y = -a;
        flower.add(petal);
      }
      const core = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), coreMat);
      core.scale.y = 0.5;
      flower.add(core);
      pad.add(flower);
    }

    const a = rnd() * Math.PI * 2;
    const rad = 0.6 + rnd() * radius;
    pad.position.set(center.x + Math.cos(a) * rad, 0.045, center.z + Math.sin(a) * rad);
    pad.rotation.y = rnd() * Math.PI * 2;
    group.add(pad);
    pads.push({ pad, baseY: 0.045, phase: rnd() * 6.28, speed: 0.6 + rnd() * 0.5, drift: (rnd() - 0.5) * 0.1 });
  }

  function tick(t) {
    for (const p of pads) {
      p.pad.position.y = p.baseY + Math.sin(t * p.speed + p.phase) * 0.025;
      p.pad.rotation.y += p.drift * 0.01;
      p.pad.rotation.z = Math.sin(t * p.speed * 0.7 + p.phase) * 0.04;
    }
  }

  return { group, tick };
}
