// Frogs perched on lily pads. They breathe and puff their throats idly;
// click one and it leaps. Positions come from the lilypads component
// (passed in by the manifest via ctx.world.get('lilypads').positions).
// Returns { group, tick, onPointerDown }.

export function createFrogs(THREE, { pads = [], maxFrogs = 3, surfaceY = 0.08 } = {}) {
  const group = new THREE.Group();
  const skinMat = new THREE.MeshStandardMaterial({ color: '#4caf50', roughness: 0.6, flatShading: true });
  const darkSkin = new THREE.MeshStandardMaterial({ color: '#3a8f3e', roughness: 0.6, flatShading: true });
  const throatMat = new THREE.MeshStandardMaterial({ color: '#d7eaa0', roughness: 0.6, flatShading: true });
  const dark = new THREE.MeshStandardMaterial({ color: '#161616', roughness: 0.5 });

  const frogs = [];
  pads.slice(0, maxFrogs).forEach((p, i) => {
    const f = new THREE.Group();

    const body = new THREE.Mesh(new THREE.SphereGeometry(0.13, 12, 10), skinMat);
    body.scale.set(1.2, 0.8, 1.4);
    body.position.y = 0.1;
    f.add(body);

    // Eye bumps + pupils on top-front.
    for (const sx of [-0.07, 0.07]) {
      const bump = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), skinMat);
      bump.position.set(sx, 0.19, 0.07);
      f.add(bump);
      const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.026, 8, 8), dark);
      pupil.position.set(sx, 0.2, 0.11);
      f.add(pupil);
    }

    // Throat (puffs).
    const throat = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), throatMat);
    throat.position.set(0, 0.05, 0.12);
    f.add(throat);

    // Folded back legs.
    for (const sx of [-1, 1]) {
      const leg = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), darkSkin);
      leg.scale.set(1.4, 0.6, 1.1);
      leg.position.set(sx * 0.13, 0.06, -0.06);
      f.add(leg);
    }

    f.position.set(p.x, surfaceY, p.z);
    f.rotation.y = i * 1.7;
    f.userData.__frog = { base: surfaceY, body, throat, phase: i * 1.3, puffPhase: i * 2.0, hopT: -1 };
    group.add(f);
    frogs.push(f);
  });

  function tick(t, dt) {
    for (const f of frogs) {
      const s = f.userData.__frog;
      const breathe = 1 + Math.sin(t * 2 + s.phase) * 0.04;
      s.body.scale.set(1.2 * breathe, 0.8 * breathe, 1.4 * breathe);
      const puff = 1 + Math.max(0, Math.sin(t * 0.8 + s.puffPhase)) * 0.6;
      s.throat.scale.setScalar(puff);

      if (s.hopT >= 0) {
        s.hopT += dt;
        const k = s.hopT / 0.5;
        if (k >= 1) {
          s.hopT = -1;
          f.position.y = s.base;
          f.rotation.x = 0;
        } else {
          f.position.y = s.base + Math.sin(k * Math.PI) * 0.4;
          f.rotation.x = -Math.sin(k * Math.PI) * 0.3;
        }
      }
    }
  }

  // Click a frog → it leaps.
  function onPointerDown(_ctx, hit) {
    let o = hit.object;
    while (o && !o.userData.__frog) o = o.parent;
    if (o && o.userData.__frog && o.userData.__frog.hopT < 0) o.userData.__frog.hopT = 0;
  }

  return { group, tick, onPointerDown };
}
