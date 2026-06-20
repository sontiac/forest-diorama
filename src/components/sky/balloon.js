// Hot-air balloon: a procedurally striped envelope, a wicker basket,
// and rigging lines. Drifts in a slow circle. Returns { group, tick }.

export function makeBalloon(THREE, { x = 0, z = 0, height = 16, colors = ['#e84c3d', '#f4d03f'] } = {}) {
  // Striped "gore" texture — vertical bands wrapping the sphere.
  const c = document.createElement('canvas');
  c.width = 256; c.height = 8;
  const ctx = c.getContext('2d');
  const gores = 12;
  for (let i = 0; i < gores; i++) {
    ctx.fillStyle = colors[i % colors.length];
    ctx.fillRect((i / gores) * c.width, 0, c.width / gores + 1, c.height);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;

  const group = new THREE.Group();

  const envelope = new THREE.Mesh(
    new THREE.SphereGeometry(2.2, 24, 20),
    new THREE.MeshStandardMaterial({ map: tex, roughness: 0.6, metalness: 0 })
  );
  envelope.scale.set(1, 1.25, 1);
  envelope.position.y = 2.6;
  envelope.castShadow = true;
  group.add(envelope);

  const throat = new THREE.Mesh(
    new THREE.ConeGeometry(0.9, 1.1, 16, 1, true),
    new THREE.MeshStandardMaterial({ map: tex, side: THREE.DoubleSide, roughness: 0.6 })
  );
  throat.position.y = 0.55;
  throat.rotation.x = Math.PI;
  group.add(throat);

  const basket = new THREE.Mesh(
    new THREE.BoxGeometry(0.85, 0.7, 0.85),
    new THREE.MeshStandardMaterial({ color: '#9c6b3f', roughness: 1 })
  );
  basket.position.y = -0.35;
  basket.castShadow = true;
  group.add(basket);

  const rigMat = new THREE.LineBasicMaterial({ color: '#3a2a1a' });
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const geo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(sx * 0.4, -0.1, sz * 0.4),
      new THREE.Vector3(sx * 0.3, 1.0, sz * 0.3),
    ]);
    group.add(new THREE.Line(geo, rigMat));
  }

  group.position.set(x, height, z);

  const tick = (t) => {
    group.position.y = height + Math.sin(t * 0.6) * 0.6;
    group.position.x = x + Math.cos(t * 0.08) * 6;
    group.position.z = z + Math.sin(t * 0.08) * 6;
    group.rotation.z = Math.sin(t * 0.5) * 0.04;
    group.rotation.y = t * 0.05;
  };
  return { group, tick };
}
