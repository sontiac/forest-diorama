// A fox trotting a gentle loop through the clearing. Orange body with
// white chest and tail-tip, pointed ears and snout, and a four-leg
// trotting gait with a swaying bushy tail. Pure geometry.
//
// Usage:
//   const { group, tick } = createFox(THREE, { center: { x: 0, z: 6 }, radius: 2.5 });
//   scene.add(group); tickers.push(tick);

export function createFox(THREE, { center = { x: 0, z: 0 }, radius = 2.5, speed = 0.45 } = {}) {
  const group = new THREE.Group();
  const orange = new THREE.MeshStandardMaterial({ color: '#e0792e', roughness: 0.85, flatShading: true });
  const white = new THREE.MeshStandardMaterial({ color: '#f3ece0', roughness: 0.85, flatShading: true });
  const dark = new THREE.MeshStandardMaterial({ color: '#2b2b2b', roughness: 0.7 });

  const fox = new THREE.Group(); // forward = +x

  // Body.
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.3, 12, 10), orange);
  body.scale.set(1.7, 0.9, 0.85);
  body.position.y = 0.6;
  body.castShadow = true;
  fox.add(body);

  // White chest/belly.
  const belly = new THREE.Mesh(new THREE.SphereGeometry(0.24, 10, 8), white);
  belly.scale.set(1.3, 0.7, 0.6);
  belly.position.set(0.15, 0.45, 0);
  fox.add(belly);

  // Head + snout.
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 10), orange);
  head.position.set(0.62, 0.74, 0);
  head.castShadow = true;
  fox.add(head);
  const snout = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.26, 8), white);
  snout.rotation.z = -Math.PI / 2;
  snout.position.set(0.84, 0.7, 0);
  fox.add(snout);
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 6), dark);
  nose.position.set(0.97, 0.7, 0);
  fox.add(nose);

  // Ears.
  for (const sz of [-0.1, 0.1]) {
    const ear = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.18, 5), orange);
    ear.position.set(0.55, 0.94, sz);
    fox.add(ear);
    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.08, 5), dark);
    tip.position.set(0.55, 1.03, sz);
    fox.add(tip);
  }
  // Eyes.
  for (const sz of [-0.1, 0.1]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.025, 6, 6), dark);
    eye.position.set(0.7, 0.8, sz);
    fox.add(eye);
  }

  // Legs (pivots at the hips, swinging fore-aft about z).
  const legs = [];
  const hips = [
    { x: 0.42, z: 0.2, ph: 0 }, { x: 0.42, z: -0.2, ph: Math.PI },
    { x: -0.42, z: 0.2, ph: Math.PI }, { x: -0.42, z: -0.2, ph: 0 },
  ];
  for (const h of hips) {
    const pivot = new THREE.Group();
    pivot.position.set(h.x, 0.5, h.z);
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.045, 0.5, 6), orange);
    leg.position.y = -0.25;
    pivot.add(leg);
    const paw = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 6), dark);
    paw.position.y = -0.5;
    pivot.add(paw);
    fox.add(pivot);
    legs.push({ pivot, ph: h.ph });
  }

  // Bushy tail with white tip.
  const tailPivot = new THREE.Group();
  tailPivot.position.set(-0.5, 0.65, 0);
  const tail = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.7, 8), orange);
  tail.rotation.z = Math.PI / 2 + 0.5;
  tail.position.set(-0.25, 0.12, 0);
  tailPivot.add(tail);
  const tailTip = new THREE.Mesh(new THREE.SphereGeometry(0.13, 8, 8), white);
  tailTip.position.set(-0.5, 0.24, 0);
  tailPivot.add(tailTip);
  fox.add(tailPivot);

  group.add(fox);

  const gait = 8;
  function tick(t) {
    const ang = t * speed;
    const x = center.x + Math.cos(ang) * radius;
    const z = center.z + Math.sin(ang) * radius;
    const dx = -Math.sin(ang), dz = Math.cos(ang); // travel direction
    fox.position.set(x, 0.02 + Math.abs(Math.sin(t * gait)) * 0.03, z);
    fox.rotation.y = Math.atan2(-dz, dx); // forward is +x

    for (const l of legs) l.pivot.rotation.z = Math.sin(t * gait + l.ph) * 0.5;
    tailPivot.rotation.y = Math.sin(t * 3) * 0.3;
  }

  return { group, tick };
}
