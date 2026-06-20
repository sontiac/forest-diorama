// A stone wishing well: a round stone wall with dark water inside, two
// posts holding a peaked roof, a crank axle, and a bucket on a rope that
// sways gently. Pure geometry.
//
// Usage:
//   const { group, tick } = createWell(THREE, { x: 1.5, z: 4.5, facing: 0 });
//   scene.add(group); tickers.push(tick);

export function createWell(THREE, { x = 0, z = 0, facing = 0 } = {}) {
  const group = new THREE.Group();
  const stoneMat = new THREE.MeshStandardMaterial({ color: '#8d9094', roughness: 1, flatShading: true });
  const woodMat = new THREE.MeshStandardMaterial({ color: '#6b4423', roughness: 0.9, flatShading: true });
  const roofMat = new THREE.MeshStandardMaterial({ color: '#8a4a32', roughness: 0.9, flatShading: true });
  const ropeMat = new THREE.MeshStandardMaterial({ color: '#cbb487', roughness: 1 });
  const waterMat = new THREE.MeshStandardMaterial({ color: '#1d3a4a', roughness: 0.3, metalness: 0.1 });

  // Stone wall + rim + water.
  const wall = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.86, 0.8, 16), stoneMat);
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

  group.position.set(x, 0, z);
  group.rotation.y = facing;

  function tick(t) {
    bucketPivot.rotation.x = Math.sin(t * 0.9) * 0.12;
    crankGroup.rotation.x = Math.sin(t * 0.5) * 0.25; // gentle idle wobble of the crank
  }

  return { group, tick };
}
