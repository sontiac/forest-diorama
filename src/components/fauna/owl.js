// An owl roosting on a branch. Egg-shaped body, ear tufts, a face disc
// with big eyes that glow at night (env.night01), and a head that turns
// to look around every few seconds. Pure geometry.
//
// Usage:
//   const { group, tick } = createOwl(THREE, { x: 7, y: 4, z: 3.2, facing: -2.0, env });
//   scene.add(group); tickers.push(tick);

export function createOwl(THREE, { x = 0, y = 0, z = 0, facing = 0, env = { night01: 0 } } = {}) {
  const group = new THREE.Group();
  const featherMat = new THREE.MeshStandardMaterial({ color: '#7a5a3c', roughness: 0.9, flatShading: true });
  const bellyMat = new THREE.MeshStandardMaterial({ color: '#cbb089', roughness: 0.9, flatShading: true });
  const dark = new THREE.MeshStandardMaterial({ color: '#241a12', roughness: 0.7 });

  // Perch branch.
  const branch = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 1.2, 6), new THREE.MeshStandardMaterial({ color: '#5a3a22', roughness: 0.95, flatShading: true }));
  branch.rotation.z = Math.PI / 2;
  branch.position.y = -0.02;
  group.add(branch);

  // Body.
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.34, 14, 12), featherMat);
  body.scale.set(1, 1.25, 1);
  body.position.y = 0.42;
  body.castShadow = true;
  group.add(body);

  // Belly patch.
  const belly = new THREE.Mesh(new THREE.SphereGeometry(0.26, 12, 10), bellyMat);
  belly.scale.set(0.8, 1.1, 0.5);
  belly.position.set(0, 0.4, 0.18);
  group.add(belly);

  // Wings (folded).
  for (const sx of [-1, 1]) {
    const wing = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 8), featherMat);
    wing.scale.set(0.45, 1.1, 0.7);
    wing.position.set(sx * 0.3, 0.42, 0.02);
    group.add(wing);
  }

  // Feet.
  for (const sx of [-0.12, 0.12]) {
    const foot = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 6), new THREE.MeshStandardMaterial({ color: '#d9a24a', roughness: 0.7 }));
    foot.position.set(sx, 0.06, 0.12);
    group.add(foot);
  }

  // ---- Head (turns) ----
  const head = new THREE.Group();
  head.position.y = 0.82;
  group.add(head);

  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.27, 14, 12), featherMat);
  head.add(skull);

  // Ear tufts.
  for (const sx of [-0.16, 0.16]) {
    const tuft = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.22, 6), featherMat);
    tuft.position.set(sx, 0.24, 0);
    tuft.rotation.z = sx < 0 ? 0.3 : -0.3;
    head.add(tuft);
  }

  // Face disc.
  const disc = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 10), bellyMat);
  disc.scale.set(1, 1, 0.4);
  disc.position.set(0, -0.02, 0.16);
  head.add(disc);

  // Eyes (glow at night).
  const eyeMat = new THREE.MeshStandardMaterial({ color: '#ffd24a', emissive: '#ffcf3a', emissiveIntensity: 0.1, roughness: 0.5 });
  for (const sx of [-0.1, 0.1]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 12), eyeMat);
    eye.position.set(sx, 0.02, 0.26);
    head.add(eye);
    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), dark);
    pupil.position.set(sx, 0.02, 0.33);
    head.add(pupil);
  }

  // Beak.
  const beak = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.12, 5), new THREE.MeshStandardMaterial({ color: '#d9a24a', roughness: 0.6 }));
  beak.position.set(0, -0.08, 0.28);
  beak.rotation.x = Math.PI / 2;
  head.add(beak);

  group.position.set(x, y, z);
  group.rotation.y = facing;

  let headCur = 0;
  function tick(t) {
    // Glance to a new direction every ~2.5s, easing the head toward it.
    const step = Math.floor(t / 2.5);
    const tgt = (((step * 73) % 100) / 100 - 0.5) * 1.8;
    headCur += (tgt - headCur) * 0.08;
    head.rotation.y = headCur;
    head.rotation.z = Math.sin(t * 0.7) * 0.04;

    const n = env.night01 || 0;
    eyeMat.emissiveIntensity = 0.1 + n * 1.3;
  }

  return { group, tick };
}
