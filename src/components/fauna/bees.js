// Bees buzzing low over the flower garden. Small striped bodies with
// fast-fluttering wings, darting erratically among the blooms and
// turning to face their travel direction. Pure geometry.
//
// Usage:
//   const { group, tick } = createBees(THREE, { center: { x: -4.6, z: 3.4 }, area: { x: 1.4, z: 0.9 }, count: 6 });
//   scene.add(group); tickers.push(tick);

export function createBees(THREE, { center = { x: 0, z: 0 }, area = { x: 1.4, z: 0.9 }, count = 6, baseY = 0.8 } = {}) {
  const group = new THREE.Group();
  const yellow = new THREE.MeshStandardMaterial({ color: '#f4c430', roughness: 0.6, flatShading: true });
  const black = new THREE.MeshStandardMaterial({ color: '#2b2b2b', roughness: 0.6, flatShading: true });
  const wingMat = new THREE.MeshStandardMaterial({ color: '#e8f4ff', transparent: true, opacity: 0.5, side: THREE.DoubleSide, roughness: 0.2 });

  const wingGeo = new THREE.PlaneGeometry(0.07, 0.16);
  wingGeo.rotateX(-Math.PI / 2);

  const bees = [];
  for (let i = 0; i < count; i++) {
    const bee = new THREE.Group(); // forward = +x

    const body = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), yellow);
    body.scale.set(1.5, 1, 1);
    bee.add(body);
    // Dark stripes + tail.
    for (const bx of [0.02, -0.04]) {
      const band = new THREE.Mesh(new THREE.SphereGeometry(0.061, 8, 8), black);
      band.scale.set(0.18, 1.02, 1.02);
      band.position.x = bx;
      bee.add(band);
    }
    const tail = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.06, 6), black);
    tail.rotation.z = Math.PI / 2;
    tail.position.x = -0.1;
    bee.add(tail);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), black);
    head.position.x = 0.09;
    bee.add(head);

    const wings = [];
    for (const side of [1, -1]) {
      const pivot = new THREE.Group();
      pivot.position.set(0.0, 0.05, 0);
      const wing = new THREE.Mesh(wingGeo, wingMat);
      wing.position.z = side * 0.09;
      pivot.add(wing);
      bee.add(pivot);
      wings.push({ pivot, side });
    }

    group.add(bee);
    bees.push({ bee, wings, phase: i * 1.7, lastX: center.x, lastZ: center.z });
  }

  function tick(t) {
    for (const b of bees) {
      const x = center.x + Math.sin(t * 1.1 + b.phase) * area.x + Math.sin(t * 4.3 + b.phase * 2) * 0.25;
      const z = center.z + Math.cos(t * 0.9 + b.phase) * area.z + Math.cos(t * 3.7 + b.phase * 3) * 0.25;
      const y = baseY + Math.sin(t * 2 + b.phase) * 0.22;
      b.bee.position.set(x, y, z);

      const dx = x - b.lastX, dz = z - b.lastZ;
      if (dx * dx + dz * dz > 1e-6) b.bee.rotation.y = Math.atan2(-dz, dx);
      b.lastX = x; b.lastZ = z;

      const flap = Math.sin(t * 60 + b.phase) * 0.6;
      for (const w of b.wings) w.pivot.rotation.x = flap * w.side;
    }
  }

  return { group, tick };
}
