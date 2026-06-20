// Low-poly conifer trees and the seed forest ring.
// makeTree builds one tree; makeForest builds the ring and returns the
// individual tree groups so the breeze component can sway them.

export function makeTree(THREE, { x = 0, z = 0, scale = 1, hue = '#2f6d34', kind = 'conifer' } = {}) {
  const tree = new THREE.Group();
  const round = kind === 'round';

  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22, 0.34, round ? 1.7 : 2.2, 7),
    new THREE.MeshStandardMaterial({ color: '#6b4a2b', roughness: 0.9 })
  );
  trunk.position.y = round ? 0.85 : 1.1;
  trunk.castShadow = true;
  tree.add(trunk);

  const foliageMat = new THREE.MeshStandardMaterial({ color: hue, roughness: 0.85, flatShading: true });

  if (round) {
    // Broadleaf: a cluster of overlapping low-poly blobs.
    const blobs = [
      { x: 0, y: 2.2, z: 0, r: 1.45 },
      { x: 0.75, y: 2.55, z: 0.25, r: 1.0 },
      { x: -0.65, y: 2.5, z: -0.25, r: 1.05 },
      { x: 0.1, y: 3.1, z: -0.1, r: 0.9 },
    ];
    for (const b of blobs) {
      const blob = new THREE.Mesh(new THREE.IcosahedronGeometry(b.r, 0), foliageMat);
      blob.position.set(b.x, b.y, b.z);
      blob.castShadow = true;
      tree.add(blob);
    }
  } else {
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
    const tr = makeTree(THREE, { x: t.x, z: t.z, scale: t.scale, hue: t.hue, kind: t.kind });
    trees.push(tr);
    group.add(tr);
  }
  return { group, trees };
}
