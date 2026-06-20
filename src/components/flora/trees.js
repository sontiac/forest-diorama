// Low-poly conifer trees and the seed forest ring.
// makeTree builds one tree; makeForest builds the ring and returns the
// individual tree groups so the breeze component can sway them.

export function makeTree(THREE, { x = 0, z = 0, scale = 1, hue = '#2f6d34' } = {}) {
  const tree = new THREE.Group();

  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22, 0.32, 2.2, 7),
    new THREE.MeshStandardMaterial({ color: '#6b4a2b', roughness: 0.9 })
  );
  trunk.position.y = 1.1;
  trunk.castShadow = true;
  tree.add(trunk);

  const foliageMat = new THREE.MeshStandardMaterial({ color: hue, roughness: 0.85, flatShading: true });
  const tiers = [
    { y: 2.5, r: 1.5, h: 1.8 },
    { y: 3.5, r: 1.15, h: 1.5 },
    { y: 4.4, r: 0.8, h: 1.2 },
  ];
  for (const t of tiers) {
    const cone = new THREE.Mesh(new THREE.ConeGeometry(t.r, t.h, 8), foliageMat);
    cone.position.y = t.y;
    cone.castShadow = true;
    tree.add(cone);
  }

  tree.position.set(x, 0, z);
  tree.scale.setScalar(scale);
  tree.rotation.y = (x * 1.7 + z * 0.9) % (Math.PI * 2); // varied, deterministic
  return tree;
}

export function makeForest(THREE, ring) {
  const group = new THREE.Group();
  const trees = [];
  for (const t of ring) {
    const tr = makeTree(THREE, { x: t.x, z: t.z, scale: t.scale, hue: t.hue });
    trees.push(tr);
    group.add(tr);
  }
  return { group, trees };
}
