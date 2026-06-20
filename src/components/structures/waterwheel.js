// A turning water wheel at the pond's edge. Twin rims joined by radial
// paddles and spokes on a central axle, held by A-frame supports; the
// wheel rotates slowly so its lower paddles dip toward the water.
//
// Usage:
//   const { group, tick } = createWaterWheel(THREE, { x: -6, z: 0.6, facing: 0.9, R: 1.4 });
//   scene.add(group); tickers.push(tick);

export function createWaterWheel(THREE, { x = 0, z = 0, facing = 0, R = 1.4 } = {}) {
  const group = new THREE.Group();
  const box = (w, h, d, mat) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  const woodMat = new THREE.MeshStandardMaterial({ color: '#6b4a2b', roughness: 0.9, flatShading: true });
  const darkMat = new THREE.MeshStandardMaterial({ color: '#4a3320', roughness: 0.9, flatShading: true });

  const hubY = R * 0.72;
  const widthZ = 0.7; // distance between the two rims

  // ---- Spinning wheel ----
  const wheel = new THREE.Group();
  wheel.position.set(0, hubY, 0);

  // Hub axle (along z).
  const hubGeo = new THREE.CylinderGeometry(0.12, 0.12, widthZ + 0.5, 10);
  hubGeo.rotateX(Math.PI / 2);
  const hub = new THREE.Mesh(hubGeo, darkMat);
  wheel.add(hub);

  // Twin rims.
  for (const zz of [widthZ / 2, -widthZ / 2]) {
    const rim = new THREE.Mesh(new THREE.TorusGeometry(R, 0.07, 8, 32), woodMat);
    rim.position.z = zz;
    wheel.add(rim);
  }

  // Spokes (between hub and rim, mid-plane).
  const spokeN = 6;
  for (let i = 0; i < spokeN; i++) {
    const a = (i / spokeN) * Math.PI * 2;
    const spoke = box(R, 0.05, 0.05, woodMat);
    spoke.position.set(Math.cos(a) * R / 2, Math.sin(a) * R / 2, 0);
    spoke.rotation.z = a;
    wheel.add(spoke);
  }

  // Radial paddles around the rim.
  const paddleN = 10;
  for (let i = 0; i < paddleN; i++) {
    const a = (i / paddleN) * Math.PI * 2;
    const paddle = box(0.34, 0.04, widthZ + 0.1, woodMat);
    paddle.position.set(Math.cos(a) * R, Math.sin(a) * R, 0);
    paddle.rotation.z = a;
    paddle.castShadow = true;
    wheel.add(paddle);
  }
  group.add(wheel);

  // ---- A-frame supports (static) ----
  for (const zz of [widthZ / 2 + 0.25, -(widthZ / 2 + 0.25)]) {
    for (const sx of [-1, 1]) {
      const legTop = new THREE.Vector3(0, hubY, zz);
      const legBot = new THREE.Vector3(sx * (R * 0.6), 0, zz);
      const mid = legTop.clone().add(legBot).multiplyScalar(0.5);
      const len = legTop.distanceTo(legBot);
      const leg = box(0.1, len, 0.1, darkMat);
      leg.position.copy(mid);
      leg.rotation.z = Math.atan2(legBot.x - legTop.x, -(legBot.y - legTop.y));
      leg.castShadow = true;
      group.add(leg);
    }
  }

  group.position.set(x, 0, z);
  group.rotation.y = facing;

  function tick(t) {
    wheel.rotation.z = t * 0.5;
  }

  return { group, tick };
}
