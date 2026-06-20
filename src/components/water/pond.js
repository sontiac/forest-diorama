// A pond surfaced with a codex-generated top-down water texture, sitting
// just above the ground with a subtle shimmer. Returns { mesh, tick }.

export function makePond(THREE, texLoader, { url = './assets/pond.png', x = 0, z = 0, radius = 2.6 } = {}) {
  const tex = texLoader.load(url);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;

  const mesh = new THREE.Mesh(
    new THREE.CircleGeometry(radius, 48),
    new THREE.MeshStandardMaterial({ map: tex, roughness: 0.25, metalness: 0.0 })
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(x, 0.02, z); // just above ground to avoid z-fighting
  mesh.receiveShadow = true;

  const tick = (t) => {
    tex.offset.x = Math.sin(t * 0.3) * 0.01;
    tex.offset.y = Math.cos(t * 0.23) * 0.01;
  };
  return { mesh, tick };
}
