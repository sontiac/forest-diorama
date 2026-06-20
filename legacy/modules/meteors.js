// Shooting stars that streak across the night sky. A small pool of
// meteors, each a bright head plus a tapered fading trail; they spawn
// at random intervals only while it's dark (env.night01) and dart
// across before winking out.
//
// Usage:
//   const { group, tick } = createMeteors(THREE, { env, count: 3 });
//   scene.add(group); tickers.push(tick);

function softDot(THREE) {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d');
  const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grd.addColorStop(0, 'rgba(255,255,255,1)');
  grd.addColorStop(0.4, 'rgba(255,255,255,0.9)');
  grd.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grd;
  g.fillRect(0, 0, 64, 64);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createMeteors(THREE, { env = { night01: 0 }, count = 3 } = {}) {
  const group = new THREE.Group();
  const dot = softDot(THREE);
  const FWD = new THREE.Vector3(0, 0, 1);
  const trailLen = 6;

  const meteors = [];
  for (let i = 0; i < count; i++) {
    const m = new THREE.Group();

    const trailMat = new THREE.MeshBasicMaterial({
      color: '#cfe3ff', transparent: true, opacity: 0,
      blending: THREE.AdditiveBlending, depthWrite: false, fog: false,
    });
    const trailGeo = new THREE.CylinderGeometry(0.16, 0.02, trailLen, 6); // wide head, thin tail
    trailGeo.rotateX(Math.PI / 2);        // lay along z
    trailGeo.translate(0, 0, -trailLen / 2); // head at local origin, trail behind (-z)
    const trail = new THREE.Mesh(trailGeo, trailMat);
    m.add(trail);

    const headMat = new THREE.SpriteMaterial({
      map: dot, color: '#ffffff', transparent: true, opacity: 0,
      blending: THREE.AdditiveBlending, depthWrite: false, fog: false,
    });
    const head = new THREE.Sprite(headMat);
    head.scale.set(1.1, 1.1, 1);
    m.add(head);

    m.visible = false;
    group.add(m);
    meteors.push({
      m, trailMat, headMat,
      active: false,
      nextAt: 1 + Math.random() * 7,
      start: new THREE.Vector3(),
      dir: new THREE.Vector3(),
      dist: 24, dur: 1.2, t0: 0,
    });
  }

  function spawn(o, t) {
    o.start.set((Math.random() * 2 - 1) * 22, 24 + Math.random() * 4, (Math.random() * 2 - 1) * 18);
    o.dir.set((Math.random() * 2 - 1) * 0.8, -0.5 - Math.random() * 0.3, (Math.random() * 2 - 1) * 0.8).normalize();
    o.dist = 22 + Math.random() * 10;
    o.dur = 0.9 + Math.random() * 0.7;
    o.t0 = t;
    o.m.quaternion.setFromUnitVectors(FWD, o.dir);
    o.active = true;
  }

  function tick(t) {
    const night = env.night01 || 0;
    for (const o of meteors) {
      if (!o.active) {
        if (night > 0.5 && t >= o.nextAt) {
          spawn(o, t);
        } else {
          o.m.visible = false;
          continue;
        }
      }
      const progress = (t - o.t0) / o.dur;
      if (progress >= 1) {
        o.active = false;
        o.m.visible = false;
        o.nextAt = t + 4 + Math.random() * 9;
        continue;
      }
      o.m.position.set(
        o.start.x + o.dir.x * o.dist * progress,
        o.start.y + o.dir.y * o.dist * progress,
        o.start.z + o.dir.z * o.dist * progress
      );
      const alpha = Math.sin(Math.PI * progress) * night;
      o.trailMat.opacity = alpha;
      o.headMat.opacity = alpha;
      o.m.visible = true;
    }
  }

  return { group, tick };
}
