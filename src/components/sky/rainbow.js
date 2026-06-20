// Seven colored half-torus arcs (red outermost) standing in the sky.
// If an `env` is passed, the rainbow fades out at night (it needs
// sunlight) — a small improvement over the always-on original.
// Returns { group, tick }.

export function makeRainbow(THREE, { x = 0, y = 0, z = -13, radius = 18, env = null } = {}) {
  const colors = ['#ff4b4b', '#ff9a3d', '#ffe14d', '#5ed66b', '#4db4ff', '#5b6bff', '#9a5bff'];
  const bandTube = 0.24;
  const step = 0.46;
  const group = new THREE.Group();
  const mats = [];
  colors.forEach((c, i) => {
    const r = radius + (colors.length - 1 - i) * step; // red (i=0) gets the largest radius
    const geo = new THREE.TorusGeometry(r, bandTube, 12, 96, Math.PI);
    const mat = new THREE.MeshBasicMaterial({
      color: c, transparent: true, opacity: 0.5, fog: false,
      side: THREE.DoubleSide, depthWrite: false,
    });
    const mesh = new THREE.Mesh(geo, mat);
    group.add(mesh);
    mats.push(mat);
  });
  group.position.set(x, y, z);
  group.rotation.y = 0.45;
  group.renderOrder = -1;

  const tick = (t) => {
    const daylight = env ? (env.daylight ?? 1) : 1;
    const o = (0.45 + Math.sin(t * 0.5) * 0.08) * daylight;
    for (const m of mats) m.opacity = o;
  };
  return { group, tick };
}
