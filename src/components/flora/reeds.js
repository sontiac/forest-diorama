// Cattail reeds clustered around the pond's bank. Tall green stems with
// brown seed-heads and arching leaf blades, bending in the breeze.
// Clusters are placed evenly around a ring. Pure geometry.
//
// Usage:
//   const { group, tick } = createReeds(THREE, { center: { x: -4.5, z: -1.5 }, radius: 2.9, count: 8 });
//   scene.add(group); tickers.push(tick);

export function createReeds(THREE, { center = { x: 0, z: 0 }, radius = 2.9, count = 8 } = {}) {
  const group = new THREE.Group();
  const stemMat = new THREE.MeshStandardMaterial({ color: '#4f8a3a', roughness: 0.85, flatShading: true });
  const leafMat = new THREE.MeshStandardMaterial({ color: '#5fa047', roughness: 0.85, side: THREE.DoubleSide, flatShading: true });
  const headMat = new THREE.MeshStandardMaterial({ color: '#7a4a28', roughness: 0.9, flatShading: true });

  let seed = 51.3;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };

  const stems = [];

  function makeCattail(h) {
    const pivot = new THREE.Group(); // bends from the base
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.035, h, 6), stemMat);
    stem.position.y = h / 2;
    pivot.add(stem);

    const head = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.3, 8), headMat);
    head.position.y = h - 0.05;
    pivot.add(head);
    const tipGeo = new THREE.ConeGeometry(0.022, 0.12, 6);
    const tip = new THREE.Mesh(tipGeo, stemMat);
    tip.position.y = h + 0.18;
    pivot.add(tip);

    // A couple of arching leaf blades.
    for (let k = 0; k < 2; k++) {
      const blade = new THREE.Mesh(new THREE.ConeGeometry(0.05, h * 0.8, 4, 1, false), leafMat);
      blade.scale.z = 0.25;
      const a = rnd() * Math.PI * 2;
      blade.position.set(Math.cos(a) * 0.05, h * 0.35, Math.sin(a) * 0.05);
      blade.rotation.z = (rnd() - 0.5) * 0.6;
      pivot.add(blade);
    }
    return pivot;
  }

  for (let c = 0; c < count; c++) {
    const ang = (c / count) * Math.PI * 2 + rnd() * 0.3;
    const cx = center.x + Math.cos(ang) * radius;
    const cz = center.z + Math.sin(ang) * radius;
    const n = 3 + Math.floor(rnd() * 4);
    for (let i = 0; i < n; i++) {
      const h = 1.0 + rnd() * 0.7;
      const reed = makeCattail(h);
      reed.position.set(cx + (rnd() - 0.5) * 0.7, 0, cz + (rnd() - 0.5) * 0.7);
      group.add(reed);
      stems.push({ reed, phase: rnd() * 6.28, freq: 0.7 + rnd() * 0.5, amp: 0.08 + rnd() * 0.08 });
    }
  }

  function tick(t) {
    for (const s of stems) {
      s.reed.rotation.z = Math.sin(t * s.freq + s.phase) * s.amp;
      s.reed.rotation.x = Math.cos(t * s.freq * 0.8 + s.phase) * s.amp * 0.5;
    }
  }

  return { group, tick };
}
