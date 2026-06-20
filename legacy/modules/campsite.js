// A cozy campsite for the forest clearing: an A-frame tent, a
// crackling campfire (flickering flames, embers, and a warm light),
// and a couple of fallen-log seats. The fire light makes this the
// heart of the scene after dark.
//
// Usage:
//   const { group, tick } = createCampsite(THREE, { x: 6, z: -6 });
//   scene.add(group); tickers.push(tick);

export function createCampsite(THREE, { x = 0, z = 0 } = {}) {
  const group = new THREE.Group();

  // ---------- Tent ----------
  const tentMat = new THREE.MeshStandardMaterial({
    color: '#c0533b', roughness: 0.9, side: THREE.DoubleSide, flatShading: true,
  });
  const tw = 1.0, th = 1.35, len = 2.6;
  const tentShape = new THREE.Shape();
  tentShape.moveTo(-tw, 0);
  tentShape.lineTo(tw, 0);
  tentShape.lineTo(0, th);
  tentShape.lineTo(-tw, 0);
  const tentGeo = new THREE.ExtrudeGeometry(tentShape, { depth: len, bevelEnabled: false });
  tentGeo.translate(0, 0, -len / 2);
  const tent = new THREE.Mesh(tentGeo, tentMat);
  tent.castShadow = true;
  tent.position.set(-1.9, 0, 0);
  tent.rotation.y = Math.PI / 2; // turn the door face toward the fire
  group.add(tent);

  // Dark door triangle on the fire-facing side.
  const doorShape = new THREE.Shape();
  doorShape.moveTo(-0.42, 0);
  doorShape.lineTo(0.42, 0);
  doorShape.lineTo(0, 0.8);
  doorShape.lineTo(-0.42, 0);
  const door = new THREE.Mesh(
    new THREE.ShapeGeometry(doorShape),
    new THREE.MeshStandardMaterial({ color: '#3a1d16', roughness: 1, side: THREE.DoubleSide })
  );
  door.position.set(-1.9 + Math.sin(Math.PI / 2) * (len / 2 + 0.01), 0, 0);
  door.rotation.y = Math.PI / 2;
  group.add(door);

  // ---------- Fire ring (stones) ----------
  const stoneMat = new THREE.MeshStandardMaterial({ color: '#8a8d92', roughness: 1, flatShading: true });
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const stone = new THREE.Mesh(new THREE.DodecahedronGeometry(0.18, 0), stoneMat);
    stone.position.set(Math.cos(a) * 0.62, 0.12, Math.sin(a) * 0.62);
    stone.rotation.set(a, a * 2, a);
    stone.castShadow = true;
    group.add(stone);
  }

  // ---------- Logs (teepee stack) ----------
  const logMat = new THREE.MeshStandardMaterial({ color: '#5a3a22', roughness: 0.95, flatShading: true });
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    const log = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 1.0, 6), logMat);
    log.position.set(Math.cos(a) * 0.22, 0.4, Math.sin(a) * 0.22);
    log.rotation.set(Math.cos(a) * 0.5, 0, Math.sin(a) * 0.5 + 0.35);
    log.castShadow = true;
    group.add(log);
  }

  // ---------- Flames (additive cones) ----------
  const flames = new THREE.Group();
  flames.position.y = 0.25;
  group.add(flames);
  const flameOuter = new THREE.Mesh(
    new THREE.ConeGeometry(0.34, 1.1, 12),
    new THREE.MeshBasicMaterial({ color: '#ff6a1a', transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false, fog: false })
  );
  flameOuter.position.y = 0.55;
  flames.add(flameOuter);
  const flameInner = new THREE.Mesh(
    new THREE.ConeGeometry(0.18, 0.75, 10),
    new THREE.MeshBasicMaterial({ color: '#ffd24a', transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false, fog: false })
  );
  flameInner.position.y = 0.42;
  flames.add(flameInner);

  // ---------- Embers ----------
  const eCount = 24;
  const ember = [];
  const ePos = new Float32Array(eCount * 3);
  for (let i = 0; i < eCount; i++) {
    ember.push({
      a: Math.random() * Math.PI * 2,
      r: Math.random() * 0.22,
      speed: 0.5 + Math.random() * 0.7,
      yoff: Math.random() * 2.2,
      sway: Math.random() * 6.28,
    });
  }
  const eGeo = new THREE.BufferGeometry();
  eGeo.setAttribute('position', new THREE.BufferAttribute(ePos, 3));
  const eMat = new THREE.PointsMaterial({
    color: '#ff9a3a', size: 0.09, sizeAttenuation: true, transparent: true,
    opacity: 0.9, depthWrite: false, fog: false, blending: THREE.AdditiveBlending,
  });
  const embers = new THREE.Points(eGeo, eMat);
  group.add(embers);

  // ---------- Fire light ----------
  const fireLight = new THREE.PointLight('#ff7a2a', 1.8, 13, 2);
  fireLight.position.set(0, 0.6, 0);
  group.add(fireLight);

  // ---------- Log seats ----------
  const seatMat = new THREE.MeshStandardMaterial({ color: '#6b4a2b', roughness: 0.95, flatShading: true });
  const seatA = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 1.4, 8), seatMat);
  seatA.rotation.x = Math.PI / 2;
  seatA.position.set(1.5, 0.2, 0.2);
  seatA.castShadow = true;
  group.add(seatA);
  const seatB = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 1.3, 8), seatMat);
  seatB.rotation.z = Math.PI / 2;
  seatB.position.set(0.3, 0.2, 1.5);
  seatB.castShadow = true;
  group.add(seatB);

  group.position.set(x, 0, z);

  function tick(t) {
    // Flicker from a few summed sines so it reads as fire, not a sine wave.
    const flick = Math.sin(t * 13) * 0.5 + Math.sin(t * 23 + 1) * 0.3 + Math.sin(t * 7 + 2) * 0.2;
    fireLight.intensity = 1.9 + flick * 0.6;
    flameOuter.scale.set(1 + flick * 0.08, 1 + flick * 0.18, 1 + flick * 0.08);
    flameInner.scale.set(1 + flick * 0.1, 1 + flick * 0.22, 1 + flick * 0.1);
    flames.rotation.z = flick * 0.05;

    // Embers rise and recycle.
    const arr = eGeo.attributes.position.array;
    for (let i = 0; i < eCount; i++) {
      const e = ember[i];
      const life = (t * e.speed + e.yoff) % 2.4;     // 0..2.4 height
      arr[i * 3 + 0] = Math.cos(e.a) * e.r + Math.sin(t * 2 + e.sway) * 0.12 * life;
      arr[i * 3 + 1] = 0.3 + life;
      arr[i * 3 + 2] = Math.sin(e.a) * e.r + Math.cos(t * 2 + e.sway) * 0.12 * life;
    }
    eGeo.attributes.position.needsUpdate = true;
  }

  return { group, tick };
}
