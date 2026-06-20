// Butterfly swarm for the forest clearing.
// Pure geometry (THREE.Shape wings), no external assets.
// Usage:  const { group, tick } = createButterflies(THREE, { count: 7 });
//         scene.add(group); tickers.push(tick);

function makeWingGeometry(THREE) {
  // A single wing lobe in the XY plane, extending toward +x.
  const s = new THREE.Shape();
  s.moveTo(0, 0);
  s.bezierCurveTo(0.05, 0.28, 0.38, 0.34, 0.44, 0.06);
  s.bezierCurveTo(0.47, -0.08, 0.34, -0.30, 0.12, -0.24);
  s.bezierCurveTo(0.04, -0.16, 0.0, -0.08, 0, 0);
  return new THREE.ShapeGeometry(s);
}

export function createButterflies(THREE, { count = 7 } = {}) {
  const group = new THREE.Group();
  const wingGeo = makeWingGeometry(THREE);
  const palette = ['#ff5e8a', '#ffd23f', '#5ec6ff', '#a06bff', '#ff8c42', '#6bff9e', '#ff4d4d'];

  const flutterers = [];

  for (let i = 0; i < count; i++) {
    const color = palette[i % palette.length];
    const wingMat = new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.15,
      roughness: 0.55,
      side: THREE.DoubleSide,
      flatShading: true,
    });

    const bf = new THREE.Group();

    // Two wing pivots, hinged along the body (forward/Z axis).
    const leftPivot = new THREE.Group();
    const leftWing = new THREE.Mesh(wingGeo, wingMat);
    leftWing.rotation.x = -Math.PI / 2; // lay the wing flat into the XZ plane
    leftPivot.add(leftWing);

    const rightPivot = new THREE.Group();
    const rightWing = new THREE.Mesh(wingGeo, wingMat);
    rightWing.rotation.x = -Math.PI / 2;
    rightWing.scale.x = -1; // mirror to the other side
    rightPivot.add(rightWing);

    // Small dark body running along Z.
    const body = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.022, 0.2, 4, 8),
      new THREE.MeshStandardMaterial({ color: '#2b2b2b', roughness: 0.8 })
    );
    body.rotation.x = Math.PI / 2;

    bf.add(leftPivot, rightPivot, body);
    bf.scale.setScalar(0.9 + (i % 3) * 0.25);
    group.add(bf);

    flutterers.push({
      bf, leftPivot, rightPivot,
      phase: i * 1.7,
      R: 3.4 + (i % 4) * 0.9,          // wander radius
      ox: Math.cos(i * 2.1) * 2.5,      // per-butterfly center offset
      oz: Math.sin(i * 1.3) * 2.5,
      height: 1.3 + (i % 3) * 0.5,
      flapSpeed: 11 + (i % 4) * 2.5,
    });
  }

  function tick(t) {
    for (const f of flutterers) {
      const a = t * 0.5 + f.phase;
      const b = t * 0.37 + f.phase;
      const x = Math.sin(a) * f.R + f.ox;
      const z = Math.cos(b) * f.R + f.oz;
      const y = f.height + Math.sin(t * 1.3 + f.phase) * 0.5;
      f.bf.position.set(x, y, z);

      // Face roughly along the flight tangent.
      const vx = Math.cos(a) * 0.5 * f.R;
      const vz = -Math.sin(b) * 0.37 * f.R;
      f.bf.rotation.y = Math.atan2(vx, vz);

      // Wing flap (dihedral about the forward axis).
      const flap = 0.2 + (Math.sin(t * f.flapSpeed + f.phase) * 0.5 + 0.5) * 1.0;
      f.leftPivot.rotation.z = flap;
      f.rightPivot.rotation.z = -flap;
    }
  }

  return { group, tick };
}
