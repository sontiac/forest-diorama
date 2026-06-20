// A small half-timbered cottage with a gable roof and a chimney.
// Its windows glow warm and an interior light switches on after dusk,
// driven by the shared `env.night01` value from the day-night cycle.
// Smoke drifts up from the chimney.
//
// Usage:
//   const { group, tick } = createCottage(THREE, { x: -6, z: 5, facing: 2.2, env });
//   scene.add(group); tickers.push(tick);

export function createCottage(THREE, { x = 0, z = 0, facing = 0, env = { night01: 0 }, texLoader = null, plasterUrl = './assets/cottage-plaster.png' } = {}) {
  const group = new THREE.Group();
  const box = (w, h, d, mat) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);

  const W = 3.0, H = 2.2, D = 2.6;
  const glowMats = []; // window panes that light up at night

  // ---- Walls (plaster texture, falls back to flat cream) ----
  let wallMat = new THREE.MeshStandardMaterial({ color: '#e9e1d1', roughness: 0.95, flatShading: true });
  if (texLoader) {
    const plaster = texLoader.load(plasterUrl);
    plaster.colorSpace = THREE.SRGBColorSpace;
    plaster.wrapS = THREE.RepeatWrapping;
    plaster.wrapT = THREE.RepeatWrapping;
    plaster.repeat.set(1.6, 1.2);
    wallMat = new THREE.MeshStandardMaterial({ map: plaster, roughness: 0.95 });
  }
  const walls = box(W, H, D, wallMat);
  walls.position.y = H / 2;
  walls.castShadow = true;
  walls.receiveShadow = true;
  group.add(walls);

  // Half-timber beams on the front (+z) face.
  const beamMat = new THREE.MeshStandardMaterial({ color: '#5a3a22', roughness: 0.9, flatShading: true });
  const beamZ = D / 2 + 0.02;
  for (const bx of [-W / 2 + 0.15, 0, W / 2 - 0.15]) {
    const beam = box(0.12, H, 0.06, beamMat);
    beam.position.set(bx, H / 2, beamZ);
    group.add(beam);
  }
  const midBeam = box(W, 0.12, 0.06, beamMat);
  midBeam.position.set(0, H * 0.55, beamZ);
  group.add(midBeam);

  // ---- Gable roof (extruded triangle running along X) ----
  const roofMat = new THREE.MeshStandardMaterial({ color: '#7a3b2e', roughness: 0.9, flatShading: true });
  const rh = 1.15, ov = 0.32;
  const roofShape = new THREE.Shape();
  roofShape.moveTo(-(D / 2 + ov), 0);
  roofShape.lineTo(D / 2 + ov, 0);
  roofShape.lineTo(0, rh);
  roofShape.lineTo(-(D / 2 + ov), 0);
  const roofGeo = new THREE.ExtrudeGeometry(roofShape, { depth: W + 2 * ov, bevelEnabled: false });
  roofGeo.translate(0, 0, -(W + 2 * ov) / 2);
  roofGeo.rotateY(Math.PI / 2); // ridge runs along X
  const roof = new THREE.Mesh(roofGeo, roofMat);
  roof.position.y = H;
  roof.castShadow = true;
  group.add(roof);

  // ---- Door ----
  const door = box(0.72, 1.3, 0.1, new THREE.MeshStandardMaterial({ color: '#4a2e1c', roughness: 0.9 }));
  door.position.set(-0.85, 0.65, D / 2 + 0.03);
  group.add(door);
  const knob = new THREE.Mesh(
    new THREE.SphereGeometry(0.05, 8, 8),
    new THREE.MeshStandardMaterial({ color: '#d9b35a', metalness: 0.6, roughness: 0.4 })
  );
  knob.position.set(-0.6, 0.65, D / 2 + 0.09);
  group.add(knob);

  // ---- Windows (frame + glowing pane) ----
  function addWindow(px, py, pz, ry) {
    const win = new THREE.Group();
    const frame = box(0.62, 0.7, 0.08, beamMat);
    win.add(frame);
    const paneMat = new THREE.MeshStandardMaterial({
      color: '#fff4c2', emissive: '#ffce7a', emissiveIntensity: 0, roughness: 1,
    });
    const pane = box(0.5, 0.58, 0.06, paneMat);
    pane.position.z = 0.02;
    win.add(pane);
    // muntins
    const bar = new THREE.MeshStandardMaterial({ color: '#3a281a', roughness: 1 });
    const v = box(0.04, 0.58, 0.08, bar); v.position.z = 0.03; win.add(v);
    const h = box(0.5, 0.04, 0.08, bar); h.position.z = 0.03; win.add(h);
    win.position.set(px, py, pz);
    win.rotation.y = ry;
    group.add(win);
    glowMats.push(paneMat);
  }
  addWindow(0.7, 1.25, D / 2 + 0.03, 0);          // front-right
  addWindow(W / 2 + 0.03, 1.25, 0.4, Math.PI / 2); // right side
  addWindow(-W / 2 - 0.03, 1.25, -0.2, -Math.PI / 2); // left side

  // ---- Chimney ----
  const chimney = box(0.42, 1.0, 0.42, new THREE.MeshStandardMaterial({ color: '#9a6b52', roughness: 1, flatShading: true }));
  chimney.position.set(0.9, H + 0.7, 0.5);
  chimney.castShadow = true;
  group.add(chimney);

  // ---- Chimney smoke (soft puffs that swell and fade as they rise) ----
  const chimneyTop = new THREE.Vector3(0.9, H + 1.2, 0.5);
  const puffLife = 3.6;
  const puffs = [];
  const puffGeo = new THREE.SphereGeometry(0.16, 8, 7);
  for (let i = 0; i < 12; i++) {
    const mat = new THREE.MeshStandardMaterial({ color: '#cfd3d8', transparent: true, opacity: 0, roughness: 1, depthWrite: false });
    const puff = new THREE.Mesh(puffGeo, mat);
    puff.position.copy(chimneyTop);
    group.add(puff);
    puffs.push({ puff, mat, speed: 0.5 + Math.random() * 0.3, yoff: (i / 12) * puffLife, sway: Math.random() * 6.28 });
  }

  // ---- Interior light (on at night) ----
  const inLight = new THREE.PointLight('#ffcf87', 0, 7, 2);
  inLight.position.set(0, 1.2, 0);
  group.add(inLight);

  group.position.set(x, 0, z);
  group.rotation.y = facing;

  function tick(t) {
    const n = env.night01 || 0;
    for (const m of glowMats) m.emissiveIntensity = n * 1.4;
    inLight.intensity = n * 1.8;

    // Chimney smoke: each puff rises, swells, and fades, then recycles.
    for (const p of puffs) {
      const life = (t * p.speed + p.yoff) % puffLife;
      const k = life / puffLife;
      p.puff.position.set(
        chimneyTop.x + Math.sin(t * 0.7 + p.sway) * 0.45 * k,
        chimneyTop.y + life * 0.95,
        chimneyTop.z + Math.cos(t * 0.6 + p.sway) * 0.45 * k,
      );
      p.puff.scale.setScalar(0.4 + k * 1.7);
      p.mat.opacity = 0.55 * Math.max(0, 1 - k);
    }
  }

  return { group, tick };
}
