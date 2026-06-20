// A raised flower-garden bed: a wooden border framing a ground quad
// surfaced with a codex-generated top-down flower texture, plus a few
// low-poly 3D flowers poking up and swaying in the breeze.
//
// Usage:
//   const { group, tick } = createGarden(THREE, { x: -4.6, z: 3.4, texLoader });
//   scene.add(group); tickers.push(tick);

export function createGarden(THREE, { x = 0, z = 0, w = 3.2, d = 2.2, texLoader } = {}) {
  texLoader = texLoader || new THREE.TextureLoader();
  const group = new THREE.Group();

  // ---- Textured bed ----
  const tex = texLoader.load('./assets/garden.png');
  tex.colorSpace = THREE.SRGBColorSpace;
  const bed = new THREE.Mesh(
    new THREE.PlaneGeometry(w, d),
    new THREE.MeshStandardMaterial({ map: tex, roughness: 1 })
  );
  bed.rotation.x = -Math.PI / 2;
  bed.position.y = 0.05;
  bed.receiveShadow = true;
  group.add(bed);

  // ---- Wooden border ----
  const woodMat = new THREE.MeshStandardMaterial({ color: '#7a5031', roughness: 0.9, flatShading: true });
  const bh = 0.22, bt = 0.16;
  const rail = (lw, ld, px, pz) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(lw, bh, ld), woodMat);
    m.position.set(px, bh / 2, pz);
    m.castShadow = true;
    group.add(m);
  };
  rail(w + bt, bt, 0, d / 2);
  rail(w + bt, bt, 0, -d / 2);
  rail(bt, d + bt, w / 2, 0);
  rail(bt, d + bt, -w / 2, 0);

  // ---- Low-poly 3D flowers poking up ----
  const petalColors = ['#e8413a', '#ffd23f', '#ff7ab0', '#a06bff', '#ffffff'];
  const stemMat = new THREE.MeshStandardMaterial({ color: '#3f8a3a', roughness: 0.8, flatShading: true });
  const coreMat = new THREE.MeshStandardMaterial({ color: '#ffd23f', roughness: 0.7, flatShading: true });

  function makeFlower(color, scale) {
    const pivot = new THREE.Group();
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.03, 0.34, 5), stemMat);
    stem.position.y = 0.17;
    pivot.add(stem);

    const head = new THREE.Group();
    head.position.y = 0.36;
    const petalMat = new THREE.MeshStandardMaterial({ color, roughness: 0.6, flatShading: true });
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      const petal = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 6), petalMat);
      petal.scale.set(1, 0.4, 1.5);
      petal.position.set(Math.cos(a) * 0.09, 0, Math.sin(a) * 0.09);
      head.add(petal);
    }
    const core = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), coreMat);
    core.scale.y = 0.5;
    head.add(core);
    pivot.add(head);
    pivot.scale.setScalar(scale);
    return pivot;
  }

  // Deterministic scatter inside the bed.
  let seed = 7.13;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  const flowers = [];
  for (let i = 0; i < 9; i++) {
    const f = makeFlower(petalColors[i % petalColors.length], 0.8 + rnd() * 0.5);
    f.position.set((rnd() - 0.5) * (w - 0.5), 0, (rnd() - 0.5) * (d - 0.5));
    group.add(f);
    flowers.push({ f, phase: rnd() * 6.28, amp: 0.05 + rnd() * 0.06 });
  }

  group.position.set(x, 0, z);

  function tick(t) {
    for (const fl of flowers) {
      fl.f.rotation.z = Math.sin(t * 1.3 + fl.phase) * fl.amp;
      fl.f.rotation.x = Math.cos(t * 1.1 + fl.phase) * fl.amp * 0.6;
    }
  }

  return { group, tick };
}
