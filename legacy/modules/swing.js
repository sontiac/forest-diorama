// A wooden rope swing hung from a tree branch, gently swinging back and
// forth like it was just used. A supporting branch, two ropes, and a
// plank seat that pendulums about the branch. Pure geometry.
//
// Usage:
//   const { group, tick } = createSwing(THREE, { anchor: { x: 4, y: 2.9, z: 5.6 }, ropeLen: 1.7, fromZ: 7.2 });
//   scene.add(group); tickers.push(tick);

export function createSwing(THREE, { anchor = { x: 0, y: 2.9, z: 0 }, ropeLen = 1.7, fromZ = null } = {}) {
  const group = new THREE.Group();
  const woodMat = new THREE.MeshStandardMaterial({ color: '#7a5a36', roughness: 0.9, flatShading: true });
  const branchMat = new THREE.MeshStandardMaterial({ color: '#5a3a22', roughness: 0.95, flatShading: true });
  const ropeMat = new THREE.MeshStandardMaterial({ color: '#cbb487', roughness: 1 });

  // Supporting branch reaching out from the tree to the anchor.
  if (fromZ !== null) {
    const len = Math.abs(fromZ - anchor.z) + 0.4;
    const branch = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.12, len, 7), branchMat);
    branch.rotation.x = Math.PI / 2;
    branch.position.set(anchor.x, anchor.y + 0.1, (fromZ + anchor.z) / 2);
    branch.castShadow = true;
    group.add(branch);
  }

  // Swinging assembly (pendulums about the anchor).
  const pivot = new THREE.Group();
  pivot.position.set(anchor.x, anchor.y, anchor.z);
  group.add(pivot);

  for (const sz of [0.28, -0.28]) {
    const rope = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, ropeLen, 5), ropeMat);
    rope.position.set(0, -ropeLen / 2, sz);
    pivot.add(rope);
  }

  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.06, 0.74), woodMat);
  seat.position.set(0, -ropeLen, 0);
  seat.castShadow = true;
  pivot.add(seat);

  function tick(t) {
    pivot.rotation.x = Math.sin(t * 0.85) * 0.28;
  }

  return { group, tick };
}
