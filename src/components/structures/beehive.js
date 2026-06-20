// A coiled-straw skep beehive on a little wooden stand, with a dark
// entrance and a few bees lazily circling it. Pairs with the garden bees.
// Returns { group, tick }.

export function createBeehive(THREE, { x = 0, z = 0, facing = 0 } = {}) {
  const group = new THREE.Group();
  const strawMat = new THREE.MeshStandardMaterial({ color: '#d9a94e', roughness: 0.9, flatShading: true });
  const woodMat = new THREE.MeshStandardMaterial({ color: '#6b4423', roughness: 0.9, flatShading: true });
  const dark = new THREE.MeshStandardMaterial({ color: '#2b2118', roughness: 0.8 });

  // Wooden stand.
  const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.55, 0.14, 14), woodMat);
  stand.position.y = 0.07;
  stand.castShadow = true;
  stand.receiveShadow = true;
  group.add(stand);

  // Coiled-straw dome: stacked rings of shrinking radius.
  const rings = 8;
  const baseY = 0.16;
  const domeH = 0.72;
  for (let i = 0; i < rings; i++) {
    const f = i / (rings - 1);
    const r = 0.46 * (1 - f * 0.88);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(Math.max(0.05, r), 0.075, 8, 18), strawMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = baseY + f * domeH;
    ring.castShadow = true;
    group.add(ring);
  }
  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.08, 10, 8), strawMat);
  knob.position.y = baseY + domeH + 0.02;
  group.add(knob);

  // Entrance hole + landing board (front +z).
  const entrance = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.1, 0.06), dark);
  entrance.position.set(0, 0.24, 0.44);
  group.add(entrance);
  const board = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.03, 0.12), woodMat);
  board.position.set(0, 0.19, 0.5);
  group.add(board);

  // A few bees circling the entrance.
  const beeMat = new THREE.MeshStandardMaterial({ color: '#f4c430', emissive: '#3a2c00', emissiveIntensity: 0.15, roughness: 0.5, flatShading: true });
  const bees = [];
  for (let i = 0; i < 3; i++) {
    const bee = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), beeMat);
    bee.scale.set(1.4, 1, 1);
    group.add(bee);
    bees.push({ bee, phase: i * 2.1, speed: 1.6 + i * 0.4, rad: 0.32 + i * 0.07, h: 0.36 + i * 0.12 });
  }

  group.position.set(x, 0, z);
  group.rotation.y = facing;

  function tick(t) {
    for (const b of bees) {
      const a = t * b.speed + b.phase;
      b.bee.position.set(Math.cos(a) * b.rad, b.h + Math.sin(t * 3 + b.phase) * 0.06, 0.42 + Math.sin(a) * b.rad * 0.7);
    }
  }

  return { group, tick };
}
