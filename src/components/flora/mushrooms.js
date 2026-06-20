// Clusters of bioluminescent mushrooms on the forest floor. They look
// like ordinary colorful mushrooms by day, but their caps glow and
// softly pulse at night (driven by the shared env.night01), each
// cluster casting a faint colored light.
//
// Usage:
//   const { group, tick } = createMushrooms(THREE, { clusters: [{x,z}], env });
//   scene.add(group); tickers.push(tick);

export function createMushrooms(THREE, { clusters = [{ x: 0, z: 0 }], env = { night01: 0 } } = {}) {
  const group = new THREE.Group();
  const stemMat = new THREE.MeshStandardMaterial({ color: '#ece3d0', roughness: 0.85, flatShading: true });
  const capColors = ['#39e0c8', '#5ec6ff', '#a06bff'];

  const glow = [];   // { mat, flicker }
  const lights = [];

  // Deterministic scatter.
  let seed = 91.7;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };

  function makeMushroom(capColor, scale) {
    const m = new THREE.Group();
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 0.3, 6), stemMat);
    stem.position.y = 0.15;
    m.add(stem);

    const capMat = new THREE.MeshStandardMaterial({
      color: capColor, emissive: capColor, emissiveIntensity: 0, roughness: 0.55, flatShading: true,
    });
    const cap = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.5),
      capMat
    );
    cap.scale.y = 0.75;
    cap.position.y = 0.3;
    m.add(cap);
    glow.push({ mat: capMat, flicker: 0.7 + rnd() * 0.3 });

    // Glowing spots on the cap.
    const spotMat = new THREE.MeshStandardMaterial({
      color: '#eafff9', emissive: '#eafff9', emissiveIntensity: 0, roughness: 0.5,
    });
    for (let i = 0; i < 4; i++) {
      const a = rnd() * Math.PI * 2;
      const rad = 0.06 + rnd() * 0.07;
      const spot = new THREE.Mesh(new THREE.SphereGeometry(0.022, 6, 6), spotMat);
      spot.position.set(Math.cos(a) * rad, 0.33 + rnd() * 0.02, Math.sin(a) * rad);
      m.add(spot);
    }
    glow.push({ mat: spotMat, flicker: 0.8 + rnd() * 0.2 });

    m.scale.setScalar(scale);
    return m;
  }

  for (const c of clusters) {
    const cluster = new THREE.Group();
    const capColor = capColors[Math.floor(rnd() * capColors.length)];
    const n = 3 + Math.floor(rnd() * 3);
    for (let i = 0; i < n; i++) {
      const mush = makeMushroom(
        capColors[Math.floor(rnd() * capColors.length)],
        0.7 + rnd() * 0.7
      );
      mush.position.set((rnd() - 0.5) * 0.9, 0, (rnd() - 0.5) * 0.9);
      mush.rotation.y = rnd() * Math.PI * 2;
      cluster.add(mush);
    }
    const light = new THREE.PointLight(new THREE.Color(capColor), 0, 4.5, 2);
    light.position.set(0, 0.4, 0);
    cluster.add(light);
    lights.push(light);

    cluster.position.set(c.x, 0, c.z);
    group.add(cluster);
  }

  function tick(t) {
    const n = env.night01 || 0;
    const pulse = 0.5 + 0.5 * Math.sin(t * 1.5);
    for (const g of glow) {
      g.mat.emissiveIntensity = n * (0.55 + 0.6 * pulse) * g.flicker;
    }
    for (const l of lights) {
      l.intensity = n * (0.7 + 0.4 * pulse);
    }
  }

  return { group, tick };
}
