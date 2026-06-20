// A brick wishing well: a round brick wall (codex-generated texture) with
// dark water inside, a stone capstone rim, two posts holding a peaked
// roof, a crank axle, and a bucket on a rope that sways gently.
//
// Usage:
//   const { group, tick } = createWell(THREE, { x: 1.5, z: 4.5, facing: 0, texLoader });
//   scene.add(group); tickers.push(tick);

export function createWell(THREE, { x = 0, z = 0, facing = 0, texLoader = null, brickUrl = './assets/well-brick.png' } = {}) {
  const group = new THREE.Group();
  const stoneMat = new THREE.MeshStandardMaterial({ color: '#8d9094', roughness: 1, flatShading: true });
  const woodMat = new THREE.MeshStandardMaterial({ color: '#6b4423', roughness: 0.9, flatShading: true });
  const roofMat = new THREE.MeshStandardMaterial({ color: '#8a4a32', roughness: 0.9, flatShading: true });
  const ropeMat = new THREE.MeshStandardMaterial({ color: '#cbb487', roughness: 1 });
  const waterMat = new THREE.MeshStandardMaterial({ color: '#1d3a4a', roughness: 0.3, metalness: 0.1 });

  // Brick wall material (falls back to stone if no loader provided).
  let wallMat = stoneMat;
  if (texLoader) {
    const brick = texLoader.load(brickUrl);
    brick.colorSpace = THREE.SRGBColorSpace;
    brick.wrapS = THREE.RepeatWrapping;
    brick.wrapT = THREE.RepeatWrapping;
    brick.repeat.set(4, 1.5); // courses wrap around the cylinder
    wallMat = new THREE.MeshStandardMaterial({ map: brick, roughness: 0.95 });
  }

  // Brick wall + stone capstone rim + water.
  const wall = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.86, 0.8, 24), wallMat);
  wall.position.y = 0.4;
  wall.castShadow = true;
  wall.receiveShadow = true;
  group.add(wall);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.8, 0.08, 8, 16), stoneMat);
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 0.8;
  group.add(rim);
  const water = new THREE.Mesh(new THREE.CircleGeometry(0.72, 16), waterMat);
  water.rotation.x = -Math.PI / 2;
  water.position.y = 0.55;
  group.add(water);

  // Posts.
  for (const sx of [-0.66, 0.66]) {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.25, 0.12), woodMat);
    post.position.set(sx, 1.42, 0);
    post.castShadow = true;
    group.add(post);
  }

  // Peaked roof (extruded triangle spanning the posts).
  const rs = new THREE.Shape();
  rs.moveTo(-0.95, 0); rs.lineTo(0.95, 0); rs.lineTo(0, 0.7); rs.lineTo(-0.95, 0);
  const roofGeo = new THREE.ExtrudeGeometry(rs, { depth: 1.5, bevelEnabled: false });
  roofGeo.translate(0, 0, -0.75);
  const roof = new THREE.Mesh(roofGeo, roofMat);
  roof.position.y = 2.05;
  roof.castShadow = true;
  group.add(roof);

  // Crank axle + handle.
  const axle = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 1.5, 8), woodMat);
  axle.rotation.z = Math.PI / 2;
  axle.position.y = 1.55;
  group.add(axle);
  const crankGroup = new THREE.Group();
  crankGroup.position.set(0.75, 1.55, 0);
  const crankArm = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 0.28), woodMat);
  crankArm.position.z = 0.14;
  crankGroup.add(crankArm);
  const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.16, 6), woodMat);
  grip.position.set(0.12, 0, 0.28);
  grip.rotation.z = Math.PI / 2;
  crankGroup.add(grip);
  group.add(crankGroup);

  // Bucket on a rope (sways).
  const bucketPivot = new THREE.Group();
  bucketPivot.position.set(0, 1.55, 0);
  const rope = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.7, 5), ropeMat);
  rope.position.y = -0.35;
  bucketPivot.add(rope);
  const bucket = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.1, 0.2, 10), woodMat);
  bucket.position.y = -0.78;
  bucket.castShadow = true;
  bucketPivot.add(bucket);
  group.add(bucketPivot);

  // ---- Tossed coin + splash ripple (click to make a wish) ----
  const coin = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.06, 0.015, 12),
    new THREE.MeshStandardMaterial({ color: '#f2c84b', metalness: 0.7, roughness: 0.35 })
  );
  coin.visible = false;
  group.add(coin);

  const rippleMat = new THREE.MeshBasicMaterial({
    color: '#bfe3ff', transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false,
  });
  const ripple = new THREE.Mesh(new THREE.RingGeometry(0.45, 0.55, 24), rippleMat);
  ripple.rotation.x = -Math.PI / 2;
  ripple.position.y = 0.56;
  ripple.visible = false;
  group.add(ripple);

  let tossT = -1; // -1 = idle

  group.position.set(x, 0, z);
  group.rotation.y = facing;

  function tick(t, dt) {
    bucketPivot.rotation.x = Math.sin(t * 0.9) * 0.12;
    crankGroup.rotation.x = Math.sin(t * 0.5) * 0.25; // gentle idle wobble of the crank

    if (tossT >= 0) {
      tossT += dt || 0.016;
      if (tossT < 0.6) {
        // Coin arcs from the rim down into the water.
        const k = tossT / 0.6;
        coin.visible = true;
        coin.position.set(0.3 * (1 - k), 1.05 - (1.05 - 0.56) * k + Math.sin(k * Math.PI) * 0.15, 0.3 * (1 - k));
        coin.rotation.x += (dt || 0.016) * 16;
        coin.rotation.z += (dt || 0.016) * 9;
      } else if (tossT < 1.5) {
        // Splash: an expanding, fading ripple.
        coin.visible = false;
        const k = (tossT - 0.6) / 0.9;
        ripple.visible = true;
        ripple.scale.setScalar(0.25 + k * 0.7);
        rippleMat.opacity = (1 - k) * 0.6;
      } else {
        tossT = -1;
        ripple.visible = false;
      }
    }
  }

  function onPointerDown() {
    if (tossT < 0) tossT = 0; // make a wish
  }

  return { group, tick, onPointerDown };
}
