// A few low-poly rabbits hopping around the clearing. Each wanders a
// gentle loop around a home point, bouncing in little arcs with the
// body leaning into each hop and the ears bobbing. Pure geometry.
//
// Usage:
//   const { group, tick } = createRabbits(THREE, { homes: [{x,z}] });
//   scene.add(group); tickers.push(tick);

export function createRabbits(THREE, { homes = [{ x: 0, z: 0 }] } = {}) {
  const group = new THREE.Group();
  const colors = ['#f0ece4', '#b9a890', '#9a9a9a'];
  const dark = new THREE.MeshStandardMaterial({ color: '#2b2b2b', roughness: 0.7 });

  function makeRabbit(color) {
    const r = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.85, flatShading: true });

    const body = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 10), mat);
    body.scale.set(1.1, 1.0, 1.5); // longer along +z (forward)
    body.position.y = 0.22;
    body.castShadow = true;
    r.add(body);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.15, 12, 10), mat);
    head.position.set(0, 0.32, 0.28);
    head.castShadow = true;
    r.add(head);

    // Ears on bobbing pivots.
    const ears = [];
    for (const sx of [-0.06, 0.06]) {
      const pivot = new THREE.Group();
      pivot.position.set(sx, 0.42, 0.28);
      const ear = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.04, 0.28, 6), mat);
      ear.position.y = 0.14;
      pivot.add(ear);
      pivot.rotation.z = sx < 0 ? 0.18 : -0.18;
      r.add(pivot);
      ears.push(pivot);
    }

    // Eyes.
    for (const sx of [-0.07, 0.07]) {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.025, 6, 6), dark);
      eye.position.set(sx, 0.35, 0.4);
      r.add(eye);
    }

    // Puff tail.
    const tail = new THREE.Mesh(
      new THREE.SphereGeometry(0.08, 8, 8),
      new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 1 })
    );
    tail.position.set(0, 0.24, -0.32);
    r.add(tail);

    return { r, ears };
  }

  const rabbits = [];
  for (let i = 0; i < homes.length; i++) {
    const { r, ears } = makeRabbit(colors[i % colors.length]);
    group.add(r);
    rabbits.push({
      r, ears, home: homes[i],
      phase: i * 2.1,
      wander: 1.4 + (i % 3) * 0.5,
      hopRate: 6 + (i % 3),
    });
  }

  function tick(t) {
    for (const rb of rabbits) {
      const x = rb.home.x + Math.sin(t * 0.3 + rb.phase) * rb.wander;
      const z = rb.home.z + Math.cos(t * 0.22 + rb.phase) * rb.wander;

      // Hop arc.
      const bounce = Math.abs(Math.sin(t * rb.hopRate + rb.phase));
      const y = bounce * 0.32;
      rb.r.position.set(x, y, z);

      // Face direction of travel.
      const vx = Math.cos(t * 0.3 + rb.phase) * 0.3 * rb.wander;
      const vz = -Math.sin(t * 0.22 + rb.phase) * 0.22 * rb.wander;
      rb.r.rotation.y = Math.atan2(vx, vz);

      // Lean into the hop, and bob the ears.
      rb.r.rotation.x = -Math.cos(t * rb.hopRate + rb.phase) * 0.22;
      for (const ear of rb.ears) ear.rotation.x = -bounce * 0.35;
    }
  }

  return { group, tick };
}
