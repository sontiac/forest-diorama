// Festoon string lights draped between trees around the clearing.
// A sagging wire strung through anchor points, hung with warm
// multicolor bulbs that light up and twinkle at night (env.night01).
//
// Usage:
//   const { group, tick } = createStringLights(THREE, { anchors: [{x,y,z}], env });
//   scene.add(group); tickers.push(tick);

export function createStringLights(THREE, { anchors = [], env = { night01: 0 }, sag = 1.4 } = {}) {
  const group = new THREE.Group();
  const colors = ['#ffd27a', '#ff8a8a', '#7adfff', '#b6ff7a', '#ff8ad4'];
  const bulbGeo = new THREE.SphereGeometry(0.09, 8, 8);
  const bulbs = [];
  const linePts = [];

  let colorIdx = 0;
  for (let s = 0; s < anchors.length - 1; s++) {
    const p0 = anchors[s], p1 = anchors[s + 1];
    const S = 14;
    for (let k = s === 0 ? 0 : 1; k <= S; k++) {
      const tt = k / S;
      const x = p0.x + (p1.x - p0.x) * tt;
      const z = p0.z + (p1.z - p0.z) * tt;
      const baseY = p0.y + (p1.y - p0.y) * tt;
      const y = baseY - sag * (4 * tt * (1 - tt)); // parabolic sag
      linePts.push(new THREE.Vector3(x, y, z));

      if (k % 2 === 0 && k !== S) {
        const color = colors[colorIdx++ % colors.length];
        const mat = new THREE.MeshStandardMaterial({
          color, emissive: color, emissiveIntensity: 0, roughness: 0.5,
        });
        const bulb = new THREE.Mesh(bulbGeo, mat);
        bulb.position.set(x, y - 0.1, z);
        group.add(bulb);
        bulbs.push({ mat, phase: colorIdx * 1.3 });
      }
    }
  }

  // The wire.
  const wire = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(linePts),
    new THREE.LineBasicMaterial({ color: '#2a2a2a' })
  );
  group.add(wire);

  // A couple of soft glow lights at night.
  const glowLights = [];
  for (let i = 1; i < anchors.length - 1; i += 2) {
    const a = anchors[i];
    const light = new THREE.PointLight('#ffce8a', 0, 9, 2);
    light.position.set(a.x, a.y - sag * 0.5, a.z);
    group.add(light);
    glowLights.push(light);
  }

  function tick(t) {
    const n = env.night01 || 0;
    for (const b of bulbs) {
      b.mat.emissiveIntensity = n * (0.7 + 0.5 * Math.sin(t * 3 + b.phase));
    }
    for (const l of glowLights) l.intensity = n * 0.9;
  }

  return { group, tick };
}
