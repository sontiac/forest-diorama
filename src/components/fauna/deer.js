// A low-poly deer grazing at the edge of the clearing.
// Pure geometry, no external assets.
// Usage:  const { group, tick } = createDeer(THREE, { x: 5.5, z: 4.5, facing: Math.PI * 0.8 });
//         scene.add(group); tickers.push(tick);

export function createDeer(THREE, { x = 0, z = 0, facing = 0 } = {}) {
  const coat = new THREE.MeshStandardMaterial({ color: '#9c6b43', roughness: 0.85, flatShading: true });
  const light = new THREE.MeshStandardMaterial({ color: '#c79a6d', roughness: 0.85, flatShading: true });
  const dark = new THREE.MeshStandardMaterial({ color: '#2b2b2b', roughness: 0.7 });
  const horn = new THREE.MeshStandardMaterial({ color: '#caa472', roughness: 0.8, flatShading: true });

  const group = new THREE.Group();

  const box = (w, h, d, mat) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);

  // Body (length runs along +x = forward).
  const body = box(1.5, 0.78, 0.7, coat);
  body.position.set(0, 1.5, 0);
  body.castShadow = true;
  group.add(body);

  // Belly highlight.
  const belly = box(1.45, 0.2, 0.66, light);
  belly.position.set(0, 1.18, 0);
  group.add(belly);

  // Legs.
  for (const sx of [0.55, -0.55]) for (const sz of [0.22, -0.22]) {
    const leg = box(0.17, 1.15, 0.17, coat);
    leg.position.set(sx, 0.575, sz);
    leg.castShadow = true;
    group.add(leg);
    const hoof = box(0.19, 0.16, 0.19, dark);
    hoof.position.set(sx, 0.08, sz);
    group.add(hoof);
  }

  // Tail.
  const tail = box(0.16, 0.32, 0.16, coat);
  tail.geometry.translate(0, -0.16, 0); // pivot at top
  tail.position.set(-0.78, 1.7, 0);
  group.add(tail);

  // Head + neck assembly on a pivot at the front-top of the body.
  const headPivot = new THREE.Group();
  headPivot.position.set(0.72, 1.85, 0);
  group.add(headPivot);

  const neck = box(0.34, 0.72, 0.34, coat);
  neck.position.set(0.12, 0.3, 0);
  neck.rotation.z = -0.5;
  neck.castShadow = true;
  headPivot.add(neck);

  const head = box(0.42, 0.4, 0.4, coat);
  head.position.set(0.42, 0.72, 0);
  head.castShadow = true;
  headPivot.add(head);

  const snout = box(0.32, 0.26, 0.3, light);
  snout.position.set(0.66, 0.64, 0);
  headPivot.add(snout);

  const nose = box(0.1, 0.1, 0.16, dark);
  nose.position.set(0.83, 0.6, 0);
  headPivot.add(nose);

  // Eyes.
  for (const sz of [0.18, -0.18]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), dark);
    eye.position.set(0.55, 0.78, sz);
    headPivot.add(eye);
  }

  // Ears (their own small pivots for twitching).
  const ears = [];
  for (const sz of [0.2, -0.2]) {
    const earPivot = new THREE.Group();
    earPivot.position.set(0.34, 0.92, sz);
    const ear = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.32, 6), coat);
    ear.position.set(0, 0.16, 0);
    ear.rotation.z = sz > 0 ? -0.3 : -0.3;
    earPivot.add(ear);
    headPivot.add(earPivot);
    ears.push({ earPivot, sz });
  }

  // Simple forked antlers.
  for (const sz of [0.13, -0.13]) {
    const main = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.05, 0.5, 6), horn);
    main.position.set(0.42, 1.08, sz);
    main.rotation.z = sz > 0 ? -0.25 : -0.25;
    main.rotation.x = sz > 0 ? -0.2 : 0.2;
    headPivot.add(main);
    for (const [dx, dy, rz] of [[0.1, 1.32, 0.6], [-0.02, 1.34, -0.2]]) {
      const tine = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.035, 0.26, 6), horn);
      tine.position.set(0.42 + dx, dy, sz);
      tine.rotation.z = rz;
      headPivot.add(tine);
    }
  }

  group.position.set(x, 0, z);
  group.rotation.y = facing;

  const tick = (t) => {
    // Grazing: head dips toward the grass and lifts back up.
    headPivot.rotation.z = -0.45 + Math.sin(t * 0.5) * 0.5;
    // Ear twitch.
    for (const e of ears) e.earPivot.rotation.x = Math.sin(t * 9 + (e.sz > 0 ? 0 : 1.5)) * 0.12;
    // Lazy tail flick.
    tail.rotation.z = Math.sin(t * 2.5) * 0.35;
  };

  return { group, tick };
}
