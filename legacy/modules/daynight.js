// Day-night cycle for the forest clearing.
// Drives the existing sun + hemisphere lights, lerps the sky/fog
// colors through day -> sunset -> night, raises a moon, fades in a
// starfield, and lets a swarm of fireflies drift out after dark.
//
// Publishes the current time-of-day onto a shared `env` object each
// frame (env.daylight 0..1, env.night01 0..1, env.elevation -1..1) so
// other modules (e.g. the cottage) can react to dusk/dawn.
//
// Usage:
//   const env = { daylight: 1, night01: 0, elevation: 1 };
//   const { group, tick } = createDayNight(THREE, { scene, sun, hemi, env, periodSeconds: 60 });
//   scene.add(group); tickers.push(tick);

const smoothstep = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

function softDot(THREE, inner = 'rgba(255,255,255,1)') {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d');
  const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grd.addColorStop(0.0, inner);
  grd.addColorStop(0.4, inner);
  grd.addColorStop(1.0, 'rgba(255,255,255,0)');
  g.fillStyle = grd;
  g.fillRect(0, 0, 64, 64);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createDayNight(THREE, { scene, sun, hemi, env = {}, periodSeconds = 60 } = {}) {
  const group = new THREE.Group();
  const dot = softDot(THREE);

  // ---- Color palette ----
  const C = {
    day: new THREE.Color('#87b9e0'),
    sunset: new THREE.Color('#ff9d5c'),
    night: new THREE.Color('#0a1230'),
    white: new THREE.Color('#ffffff'),
    warmLight: new THREE.Color('#ffd29a'),
    moonLight: new THREE.Color('#9fb3ff'),
  };
  const skyTmp = new THREE.Color();

  // ---- Starfield (fades in at night) ----
  const starCount = 700;
  const starPos = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    const y = Math.random() * 0.9 + 0.05;       // upper hemisphere
    const r = Math.sqrt(1 - y * y);
    const a = Math.random() * Math.PI * 2;
    starPos[i * 3 + 0] = Math.cos(a) * r * 90;
    starPos[i * 3 + 1] = y * 90;
    starPos[i * 3 + 2] = Math.sin(a) * r * 90;
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  const starMat = new THREE.PointsMaterial({
    map: dot, size: 1.3, sizeAttenuation: true, transparent: true,
    opacity: 0, depthWrite: false, fog: false, blending: THREE.AdditiveBlending,
    color: new THREE.Color('#eaf2ff'),
  });
  const stars = new THREE.Points(starGeo, starMat);
  group.add(stars);

  // ---- Sun & moon discs ----
  const sunDisc = new THREE.Mesh(
    new THREE.SphereGeometry(3, 24, 24),
    new THREE.MeshBasicMaterial({ color: '#fff2c0', fog: false })
  );
  group.add(sunDisc);

  const sunGlow = new THREE.Sprite(new THREE.SpriteMaterial({
    map: dot, color: '#ffd98a', transparent: true, opacity: 0.6,
    depthWrite: false, fog: false, blending: THREE.AdditiveBlending,
  }));
  sunGlow.scale.setScalar(16);
  group.add(sunGlow);

  const moonDisc = new THREE.Mesh(
    new THREE.SphereGeometry(2.2, 24, 24),
    new THREE.MeshBasicMaterial({ color: '#d6deff', fog: false })
  );
  group.add(moonDisc);

  // ---- Fireflies (come out at night) ----
  const fcount = 30;
  const fBase = [];
  const fPos = new Float32Array(fcount * 3);
  for (let i = 0; i < fcount; i++) {
    const a = Math.random() * Math.PI * 2;
    const rad = 2 + Math.random() * 9;
    fBase.push({
      x: Math.cos(a) * rad,
      z: Math.sin(a) * rad,
      y: 0.5 + Math.random() * 2.2,
      px: Math.random() * 6.28,
      py: Math.random() * 6.28,
      sp: 0.4 + Math.random() * 0.6,
    });
  }
  const fGeo = new THREE.BufferGeometry();
  fGeo.setAttribute('position', new THREE.BufferAttribute(fPos, 3));
  const fMat = new THREE.PointsMaterial({
    map: dot, size: 0.5, sizeAttenuation: true, transparent: true,
    opacity: 0, depthWrite: false, fog: false, blending: THREE.AdditiveBlending,
    color: new THREE.Color('#ffe08a'),
  });
  const fireflies = new THREE.Points(fGeo, fMat);
  group.add(fireflies);

  function tick(t) {
    const phase = (t / periodSeconds) % 1;
    const angle = phase * Math.PI * 2;
    const elev = Math.sin(angle);                 // sun elevation, -1..1
    const daylight = smoothstep(-0.12, 0.25, elev);
    const horizon = Math.max(0, 1 - Math.abs(elev) / 0.33) * (elev > -0.28 ? 1 : 0);
    const night01 = 1 - daylight;

    // Publish time-of-day for other modules to react to.
    env.daylight = daylight;
    env.night01 = night01;
    env.elevation = elev;

    // Sky + fog
    skyTmp.copy(C.night).lerp(C.day, daylight).lerp(C.sunset, horizon * 0.55);
    scene.background.copy(skyTmp);
    scene.fog.color.copy(skyTmp);

    // Lights
    sun.intensity = 0.04 + daylight * 1.6;
    sun.color.copy(C.white).lerp(C.warmLight, horizon * 0.8);
    hemi.intensity = 0.22 + daylight * 0.7;
    hemi.color.copy(C.night).lerp(new THREE.Color('#cfe8ff'), daylight);

    // Sun / moon placement
    sun.position.set(Math.cos(angle) * 35, Math.sin(angle) * 45, 8);
    sunDisc.position.copy(sun.position).multiplyScalar(1.3);
    sunGlow.position.copy(sunDisc.position);
    const sunUp = elev > -0.12;
    sunDisc.visible = sunUp;
    sunGlow.visible = sunUp;
    moonDisc.position.copy(sun.position).multiplyScalar(-1.3);
    moonDisc.visible = elev < 0.12;

    // Stars + fireflies fade in after dark
    starMat.opacity = Math.min(1, night01 * 1.3);
    fMat.opacity = Math.min(1, night01 * 1.4);

    // Drift the fireflies
    const arr = fGeo.attributes.position.array;
    for (let i = 0; i < fcount; i++) {
      const b = fBase[i];
      arr[i * 3 + 0] = b.x + Math.sin(t * b.sp + b.px) * 0.8;
      arr[i * 3 + 1] = b.y + Math.sin(t * b.sp * 1.7 + b.py) * 0.5;
      arr[i * 3 + 2] = b.z + Math.cos(t * b.sp + b.px) * 0.8;
    }
    fGeo.attributes.position.needsUpdate = true;
  }

  return { group, tick };
}
