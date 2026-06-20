// A flock of low-poly birds flying a V-formation over the clearing.
// Each bird is a small body plus two flapping wings; the flock
// circles slowly and banks into the turn. Pure geometry.
//
// Usage:
//   const { group, tick } = createBirds(THREE, { count: 7, radius: 15, height: 12 });
//   scene.add(group); tickers.push(tick);

function wingGeometry(THREE) {
  // A swept wing extending toward +x (in the XY plane), laid flat later.
  const s = new THREE.Shape();
  s.moveTo(0, 0);
  s.lineTo(0.58, 0.06);
  s.lineTo(0.5, -0.13);
  s.lineTo(0.12, -0.06);
  s.lineTo(0, 0);
  return new THREE.ShapeGeometry(s);
}

export function createBirds(THREE, { count = 7, radius = 15, height = 12 } = {}) {
  const group = new THREE.Group();
  const wingGeo = wingGeometry(THREE);
  const bodyMat = new THREE.MeshStandardMaterial({ color: '#39414f', roughness: 0.8, flatShading: true });
  const wingMat = new THREE.MeshStandardMaterial({ color: '#2f3743', roughness: 0.8, side: THREE.DoubleSide, flatShading: true });

  // Formation offsets (back, side) for a loose V behind the leader.
  const formation = [
    { b: 0.0, s: 0.0 },
    { b: 0.9, s: 0.7 }, { b: 0.9, s: -0.7 },
    { b: 1.8, s: 1.4 }, { b: 1.8, s: -1.4 },
    { b: 2.7, s: 2.1 }, { b: 2.7, s: -2.1 },
  ];

  const birds = [];
  for (let i = 0; i < count; i++) {
    const bird = new THREE.Group();

    const body = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.5, 6), bodyMat);
    body.rotation.x = Math.PI / 2; // point the nose toward +z (flight forward)
    bird.add(body);

    const leftPivot = new THREE.Group();
    const leftWing = new THREE.Mesh(wingGeo, wingMat);
    leftWing.rotation.x = -Math.PI / 2; // lay the wing flat into the XZ plane
    leftPivot.add(leftWing);
    bird.add(leftPivot);

    const rightPivot = new THREE.Group();
    const rightWing = new THREE.Mesh(wingGeo, wingMat);
    rightWing.rotation.x = -Math.PI / 2;
    rightWing.scale.x = -1; // mirror to the left side
    rightPivot.add(rightWing);
    bird.add(rightPivot);

    bird.scale.setScalar(i === 0 ? 1.15 : 1.0); // leader a touch bigger
    group.add(bird);
    birds.push({ bird, leftPivot, rightPivot, off: formation[i % formation.length], flapPhase: i * 0.6 });
  }

  function tick(t) {
    const lead = t * 0.12;                 // flock travels around a slow circle
    const Hx = -Math.sin(lead), Hz = Math.cos(lead); // heading (tangent)
    const Rx = Math.cos(lead), Rz = Math.sin(lead);  // right vector
    const yaw = Math.atan2(Hx, Hz);
    const bank = Math.sin(lead) * 0.12;    // gentle roll into the turn

    const Lx = Math.cos(lead) * radius;
    const Lz = Math.sin(lead) * radius;

    for (let i = 0; i < birds.length; i++) {
      const o = birds[i];
      const x = Lx - Hx * o.off.b + Rx * o.off.s;
      const z = Lz - Hz * o.off.b + Rz * o.off.s;
      const y = height + Math.sin(t * 0.8 + i) * 0.4;
      o.bird.position.set(x, y, z);
      o.bird.rotation.set(0, yaw, bank);

      // Wing flap — leader and trailers slightly out of phase.
      const flap = 0.15 + (Math.sin(t * 6 + o.flapPhase) * 0.5 + 0.5) * 0.9;
      o.leftPivot.rotation.z = flap;
      o.rightPivot.rotation.z = -flap;
    }
  }

  return { group, tick };
}
