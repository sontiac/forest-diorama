// Dragonflies darting and hovering low over the pond. Slender
// iridescent bodies with big eyes and four fast-fluttering translucent
// wings; they move in erratic darts and face their travel direction.
//
// Usage:
//   const { group, tick } = createDragonflies(THREE, { center: { x: -4.5, z: -1.5 }, count: 4 });
//   scene.add(group); tickers.push(tick);

export function createDragonflies(THREE, { center = { x: 0, z: 0 }, radius = 1.8, count = 4, baseY = 1.0 } = {}) {
  const group = new THREE.Group();
  const bodyColors = ['#2bb0a8', '#3a7bd5', '#7a4bd5', '#21c7a8'];
  const dark = new THREE.MeshStandardMaterial({ color: '#1a2230', roughness: 0.5 });

  // Horizontal wing geometry (extends laterally in z, normal +y).
  const wingGeo = new THREE.PlaneGeometry(0.18, 0.5);
  wingGeo.rotateX(-Math.PI / 2);

  const flies = [];
  for (let i = 0; i < count; i++) {
    const color = bodyColors[i % bodyColors.length];
    const bodyMat = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.15, roughness: 0.4, flatShading: true });

    const fly = new THREE.Group(); // forward = +x

    // Thorax + long abdomen.
    const thorax = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), bodyMat);
    fly.add(thorax);
    const abdomen = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.015, 0.55, 6), bodyMat);
    abdomen.rotation.z = Math.PI / 2;
    abdomen.position.x = -0.3;
    fly.add(abdomen);

    // Head + eyes.
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), bodyMat);
    head.position.x = 0.1;
    fly.add(head);
    for (const sz of [-0.04, 0.04]) {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 8), new THREE.MeshStandardMaterial({ color: '#9fe8d0', emissive: '#3a8', emissiveIntensity: 0.3, roughness: 0.3 }));
      eye.position.set(0.13, 0.01, sz);
      fly.add(eye);
    }

    // Four wings on individual flap pivots.
    const wingMat = new THREE.MeshStandardMaterial({ color: '#cfe9ff', transparent: true, opacity: 0.4, side: THREE.DoubleSide, roughness: 0.2 });
    const wings = [];
    for (const [xoff, side] of [[0.04, 1], [0.04, -1], [-0.08, 1], [-0.08, -1]]) {
      const pivot = new THREE.Group();
      pivot.position.set(xoff, 0.03, 0);
      const wing = new THREE.Mesh(wingGeo, wingMat);
      wing.position.z = side * 0.28;
      pivot.add(wing);
      fly.add(pivot);
      wings.push({ pivot, side });
    }

    group.add(fly);
    flies.push({
      fly, wings,
      phase: i * 1.9,
      lastX: center.x, lastZ: center.z,
      flap: 34 + i * 3,
    });
  }

  function tick(t) {
    for (const f of flies) {
      // Slow drift + fast jitter = erratic darting.
      const x = center.x + Math.sin(t * 0.6 + f.phase) * radius + Math.sin(t * 3.1 + f.phase * 2) * 0.4;
      const z = center.z + Math.cos(t * 0.5 + f.phase) * radius + Math.cos(t * 2.7 + f.phase * 3) * 0.4;
      const y = baseY + Math.sin(t * 1.3 + f.phase) * 0.3;
      f.fly.position.set(x, y, z);

      const dx = x - f.lastX, dz = z - f.lastZ;
      if (dx * dx + dz * dz > 1e-6) f.fly.rotation.y = Math.atan2(-dz, dx);
      f.lastX = x; f.lastZ = z;

      const flap = Math.sin(t * f.flap + f.phase) * 0.5;
      for (const w of f.wings) w.pivot.rotation.x = flap * w.side;
    }
  }

  return { group, tick };
}
