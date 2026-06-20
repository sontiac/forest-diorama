// An arched wooden footbridge. Curved deck planks follow a parabolic
// arch, with post-and-rail railings down both sides and foundations
// sunk into the banks at each end. Static geometry (no tick).
//
// Usage:
//   const { group } = createBridge(THREE, { x: -4.5, z: -1.5, facing: Math.PI/2, span: 5.6 });
//   scene.add(group);

export function createBridge(THREE, { x = 0, z = 0, facing = 0, span = 5.6, width = 1.3, archH = 0.9 } = {}) {
  const group = new THREE.Group();
  const box = (w, h, d, mat) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  const deckMat = new THREE.MeshStandardMaterial({ color: '#8a5a34', roughness: 0.9, flatShading: true });
  const railMat = new THREE.MeshStandardMaterial({ color: '#6b4423', roughness: 0.9, flatShading: true });

  const half = span / 2;
  const arch = (xx) => archH * (1 - (xx / half) * (xx / half));
  const slope = (xx) => archH * (-2 * xx / (half * half));

  // ---- Deck planks ----
  const N = 18;
  for (let i = 0; i < N; i++) {
    const px = -half + (i + 0.5) * (span / N);
    const py = arch(px) + 0.06;
    const plank = box((span / N) * 0.92, 0.08, width, deckMat);
    plank.position.set(px, py, 0);
    plank.rotation.z = Math.atan(slope(px));
    plank.castShadow = true;
    plank.receiveShadow = true;
    group.add(plank);
  }

  // ---- Railings (posts + connecting top rail) on both sides ----
  const posts = 8;
  const postH = 0.5;
  for (const side of [width / 2 - 0.06, -(width / 2 - 0.06)]) {
    let prev = null;
    for (let j = 0; j <= posts; j++) {
      const px = -half + (j / posts) * span;
      const py = arch(px) + 0.06;
      const post = box(0.08, postH, 0.08, railMat);
      post.position.set(px, py + postH / 2, side);
      post.castShadow = true;
      group.add(post);

      const top = { x: px, y: py + postH };
      if (prev) {
        const mx = (prev.x + px) / 2;
        const my = (prev.y + top.y) / 2;
        const dx = px - prev.x;
        const dy = top.y - prev.y;
        const len = Math.hypot(dx, dy);
        const seg = box(len, 0.06, 0.06, railMat);
        seg.position.set(mx, my, side);
        seg.rotation.z = Math.atan2(dy, dx);
        group.add(seg);
      }
      prev = top;
    }
  }

  // ---- End foundations ----
  for (const ex of [-half, half]) {
    const found = box(0.55, 0.7, width + 0.25, railMat);
    found.position.set(ex, arch(ex) - 0.22, 0);
    found.receiveShadow = true;
    group.add(found);
  }

  group.position.set(x, 0, z);
  group.rotation.y = facing;
  return { group };
}
