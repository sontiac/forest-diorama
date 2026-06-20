// A scarecrow standing guard by the garden. A cross-frame post with a
// stuffed plaid shirt, straw-tuft cuffs, a burlap-sack head with button
// eyes and a stitched mouth, and a straw hat; it creaks gently in the
// breeze. Pure geometry.
//
// Usage:
//   const { group, tick } = createScarecrow(THREE, { x: -3, z: 4.5, facing: 2.5 });
//   scene.add(group); tickers.push(tick);

export function createScarecrow(THREE, { x = 0, z = 0, facing = 0 } = {}) {
  const group = new THREE.Group();
  const woodMat = new THREE.MeshStandardMaterial({ color: '#6b4a2b', roughness: 0.95, flatShading: true });
  const shirtMat = new THREE.MeshStandardMaterial({ color: '#b6473c', roughness: 0.9, flatShading: true });
  const burlapMat = new THREE.MeshStandardMaterial({ color: '#d8c39a', roughness: 0.95, flatShading: true });
  const strawMat = new THREE.MeshStandardMaterial({ color: '#dcb456', roughness: 0.9, flatShading: true });
  const dark = new THREE.MeshStandardMaterial({ color: '#2b2b2b', roughness: 0.6 });

  const sway = new THREE.Group(); // everything sways from the base
  group.add(sway);

  // Post + crossbar.
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 2.3, 6), woodMat);
  post.position.y = 1.15;
  post.castShadow = true;
  sway.add(post);
  const cross = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.9, 6), woodMat);
  cross.rotation.z = Math.PI / 2;
  cross.position.y = 1.6;
  sway.add(cross);

  // Stuffed shirt.
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.8, 0.34), shirtMat);
  torso.position.y = 1.35;
  torso.castShadow = true;
  sway.add(torso);
  // Sleeves.
  for (const sx of [-1, 1]) {
    const sleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.08, 0.8, 6), shirtMat);
    sleeve.rotation.z = Math.PI / 2;
    sleeve.position.set(sx * 0.6, 1.6, 0);
    sway.add(sleeve);
    // Straw tuft at the cuff.
    const tuft = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.28, 6), strawMat);
    tuft.rotation.z = sx * -Math.PI / 2;
    tuft.position.set(sx * 1.02, 1.6, 0);
    sway.add(tuft);
  }
  // Straw at the waist.
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    const straw = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.3, 4), strawMat);
    straw.position.set(Math.cos(a) * 0.18, 0.95, Math.sin(a) * 0.12);
    straw.rotation.x = Math.PI;
    sway.add(straw);
  }

  // Burlap head.
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.24, 12, 10), burlapMat);
  head.scale.set(1, 1.1, 1);
  head.position.y = 2.05;
  head.castShadow = true;
  sway.add(head);
  for (const sx of [-0.09, 0.09]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 8), dark);
    eye.position.set(sx, 2.1, 0.21);
    sway.add(eye);
  }
  // Stitched mouth.
  const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.025, 0.02), dark);
  mouth.position.set(0, 1.96, 0.22);
  sway.add(mouth);

  // Straw hat (brim + cone).
  const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.04, 14), strawMat);
  brim.position.y = 2.24;
  sway.add(brim);
  const crown = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.26, 12), strawMat);
  crown.position.y = 2.38;
  sway.add(crown);

  group.position.set(x, 0, z);
  group.rotation.y = facing;

  function tick(t) {
    sway.rotation.z = Math.sin(t * 0.6) * 0.03;
    sway.rotation.x = Math.cos(t * 0.5) * 0.02;
  }

  return { group, tick };
}
