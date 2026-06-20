// A school of koi gliding at the pond's surface, with wagging tails
// and occasional expanding ripple rings. Pure geometry.
//
// Usage:
//   const { group, tick } = createKoi(THREE, { center: { x: -4.5, z: -1.5 }, radius: 1.6, count: 5 });
//   scene.add(group); tickers.push(tick);

export function createKoi(THREE, { center = { x: 0, z: 0 }, radius = 1.6, count = 5 } = {}) {
  const group = new THREE.Group();
  const surfaceY = 0.07;
  const palette = ['#ff7a3c', '#ffffff', '#ff5e3c', '#ffd27a', '#e6e6e6'];

  // Tail fin shape (a small triangle in the XY plane).
  const tailShape = new THREE.Shape();
  tailShape.moveTo(0, 0);
  tailShape.lineTo(-0.28, 0.16);
  tailShape.lineTo(-0.28, -0.16);
  tailShape.lineTo(0, 0);
  const tailGeo = new THREE.ShapeGeometry(tailShape);

  const fish = [];
  for (let i = 0; i < count; i++) {
    const color = palette[i % palette.length];
    const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.5, flatShading: true });

    const koi = new THREE.Group();
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 10), mat);
    body.scale.set(1.7, 0.45, 0.85); // long and flat
    koi.add(body);

    const tailPivot = new THREE.Group();
    tailPivot.position.x = -0.36;
    const tail = new THREE.Mesh(tailGeo, mat);
    tail.rotation.x = -Math.PI / 2; // lay flat to match the body
    tailPivot.add(tail);
    koi.add(tailPivot);

    group.add(koi);
    fish.push({
      koi, tailPivot,
      phase: i * (Math.PI * 2 / count),
      speed: 0.25 + (i % 3) * 0.08,
      rr: 0.55 + (i % 4) * 0.12,    // fraction of radius for this fish's loop
      wag: 5 + (i % 3),
    });
  }

  // Ripple ring pool.
  const ringCount = 5;
  const rings = [];
  for (let i = 0; i < ringCount; i++) {
    const mat = new THREE.MeshBasicMaterial({
      color: '#dff0ff', transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false, fog: false,
    });
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.7, 0.82, 24), mat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.035;
    group.add(ring);
    rings.push({ ring, mat, phase: i * 1.31, last: 0, x: center.x, z: center.z });
  }

  group.position.set(0, 0, 0);

  function fishPos(f, t) {
    const ang = t * f.speed + f.phase;
    const r = radius * f.rr;
    return { x: center.x + Math.cos(ang) * r, z: center.z + Math.sin(ang) * r, ang };
  }

  function tick(t) {
    for (const f of fish) {
      const ang = t * f.speed + f.phase;
      const r = radius * f.rr;
      const x = center.x + Math.cos(ang) * r;
      const z = center.z + Math.sin(ang) * r;
      f.koi.position.set(x, surfaceY + Math.sin(t * 2 + f.phase) * 0.015, z);
      // Face the direction of travel (tangent).
      const tx = -Math.sin(ang), tz = Math.cos(ang);
      f.koi.rotation.y = Math.atan2(tx, tz) + Math.PI / 2; // body's long axis is +x
      f.tailPivot.rotation.y = Math.sin(t * f.wag + f.phase) * 0.6;
    }

    // Ripple rings grow and fade; respawn at a fish when they wrap.
    for (let i = 0; i < rings.length; i++) {
      const rg = rings[i];
      const age = ((t * 0.4 + rg.phase) % 1);
      if (age < rg.last) {
        const f = fish[(i + Math.floor(t)) % fish.length];
        const p = fishPos(f, t);
        rg.x = p.x; rg.z = p.z;
      }
      rg.last = age;
      const s = 0.15 + age * 1.3;
      rg.ring.position.set(rg.x, 0.035, rg.z);
      rg.ring.scale.set(s, s, s);
      rg.mat.opacity = (1 - age) * 0.5;
    }
  }

  return { group, tick };
}
