// A tower windmill standing at the edge of the scene, its four sails
// slowly turning. Tapered tower, conical cap, door and windows, and a
// rotating sail cross with cloth sails. Pure geometry.
//
// Usage:
//   const { group, tick } = createWindmill(THREE, { x: -10, z: -8, facing: 0.9 });
//   scene.add(group); tickers.push(tick);

export function createWindmill(THREE, { x = 0, z = 0, facing = 0, height = 5, texLoader = null, stoneUrl = './assets/windmill-stone.png' } = {}) {
  const group = new THREE.Group();
  const box = (w, h, d, mat) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  const trimMat = new THREE.MeshStandardMaterial({ color: '#6b4423', roughness: 0.9, flatShading: true });
  const clothMat = new THREE.MeshStandardMaterial({ color: '#f3ead6', roughness: 0.8, side: THREE.DoubleSide, flatShading: true });

  // Stone tower material (falls back to a flat tan if no loader provided).
  let wallMat = new THREE.MeshStandardMaterial({ color: '#d9cdb6', roughness: 0.95, flatShading: true });
  if (texLoader) {
    const stone = texLoader.load(stoneUrl);
    stone.colorSpace = THREE.SRGBColorSpace;
    stone.wrapS = THREE.RepeatWrapping;
    stone.wrapT = THREE.RepeatWrapping;
    stone.repeat.set(4, 2.5); // stone courses wrap around the tapered tower
    wallMat = new THREE.MeshStandardMaterial({ map: stone, roughness: 0.95 });
  }

  // ---- Tower (tapered) ----
  const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.45, height, 24), wallMat);
  tower.position.y = height / 2;
  tower.castShadow = true;
  tower.receiveShadow = true;
  group.add(tower);

  // ---- Conical cap ----
  const cap = new THREE.Mesh(new THREE.ConeGeometry(1.1, 1.2, 14), trimMat);
  cap.position.y = height + 0.5;
  cap.castShadow = true;
  group.add(cap);

  // ---- Door + windows (front, +z) ----
  const door = box(0.6, 1.2, 0.1, trimMat);
  door.position.set(0, 0.6, 1.32);
  group.add(door);
  for (const [wy, wz] of [[2.2, 1.18], [3.4, 1.02]]) {
    const win = box(0.4, 0.5, 0.1, trimMat);
    win.position.set(0, wy, wz);
    group.add(win);
  }

  // ---- Sail assembly (rotates) ----
  const sails = new THREE.Group();
  sails.position.set(0, height + 0.3, 1.15);

  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.4, 8), trimMat);
  hub.rotation.x = Math.PI / 2;
  sails.add(hub);

  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2;
    // Wooden arm.
    const arm = box(0.1, 3.0, 0.1, trimMat);
    arm.position.set(Math.cos(a) * 1.5, Math.sin(a) * 1.5, 0);
    arm.rotation.z = a - Math.PI / 2;
    sails.add(arm);
    // Cloth sail beside the arm.
    const cloth = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 2.6), clothMat);
    cloth.position.set(Math.cos(a) * 1.5 + Math.cos(a + Math.PI / 2) * 0.5,
                       Math.sin(a) * 1.5 + Math.sin(a + Math.PI / 2) * 0.5, 0.04);
    cloth.rotation.z = a - Math.PI / 2;
    sails.add(cloth);
  }
  group.add(sails);

  group.position.set(x, 0, z);
  group.rotation.y = facing;

  function tick(t) {
    sails.rotation.z = t * 0.7;
  }

  return { group, tick };
}
