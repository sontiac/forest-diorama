// A waterfall tumbling off a rocky outcrop into the pond.
// The falling sheet uses a custom GLSL shader (downward-scrolling
// procedural noise + foam); a cloud of mist rises at the base.
//
// Usage:
//   const { group, tick } = createWaterfall(THREE, { x: -7.5, z: -2.7, facing: 1.2, height: 2.9 });
//   scene.add(group); tickers.push(tick);

export function createWaterfall(THREE, { x = 0, z = 0, facing = 0, height = 2.9 } = {}) {
  const group = new THREE.Group();

  // ---- Rocky outcrop ----
  const rockMat = new THREE.MeshStandardMaterial({ color: '#7d8186', roughness: 1, flatShading: true });
  const rockDark = new THREE.MeshStandardMaterial({ color: '#5f6469', roughness: 1, flatShading: true });
  const rocks = [
    { p: [0, 0.5, -0.2], s: 1.5, m: rockMat },
    { p: [0.6, 1.1, -0.4], s: 1.1, m: rockDark },
    { p: [-0.7, 0.9, -0.3], s: 1.0, m: rockDark },
    { p: [0, 1.7, -0.5], s: 1.2, m: rockMat },
    { p: [0.2, 2.4, -0.6], s: 0.8, m: rockDark },
    { p: [0.45, 0.35, 0.55], s: 0.6, m: rockMat },
    { p: [-0.5, 0.3, 0.5], s: 0.55, m: rockMat },
  ];
  for (const r of rocks) {
    const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.7, 0), r.m);
    rock.position.set(r.p[0], r.p[1], r.p[2]);
    rock.scale.setScalar(r.s);
    rock.rotation.set(r.p[0], r.p[1], r.p[2]);
    rock.castShadow = true;
    rock.receiveShadow = true;
    group.add(rock);
  }

  // ---- Falling water sheet (custom shader) ----
  const uniforms = { uTime: { value: 0 } };
  const waterMat = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    vertexShader: /* glsl */`
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */`
      uniform float uTime;
      varying vec2 vUv;
      float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float noise(vec2 p){
        vec2 i = floor(p), f = fract(p);
        float a = hash(i), b = hash(i + vec2(1.0, 0.0));
        float c = hash(i + vec2(0.0, 1.0)), d = hash(i + vec2(1.0, 1.0));
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
      }
      void main(){
        vec2 uv = vUv;
        float flow = uv.y * 6.0 - uTime * 3.2;        // scroll downward
        float streaks = noise(vec2(uv.x * 10.0, flow));
        float fine = noise(vec2(uv.x * 24.0, flow * 1.7));
        float water = 0.5 * streaks + 0.5 * fine;
        vec3 deep = vec3(0.20, 0.47, 0.64);
        vec3 foam = vec3(0.92, 0.98, 1.0);
        vec3 col = mix(deep, foam, smoothstep(0.55, 0.92, water));
        col = mix(col, foam, smoothstep(0.8, 1.0, 1.0 - uv.y) * 0.6); // froth at the bottom
        float edge = smoothstep(0.0, 0.13, uv.x) * smoothstep(0.0, 0.13, 1.0 - uv.x);
        float alpha = (0.55 + 0.45 * water) * edge;
        gl_FragColor = vec4(col, alpha);
      }
    `,
  });
  const sheet = new THREE.Mesh(new THREE.PlaneGeometry(1.3, height, 1, 1), waterMat);
  sheet.position.set(0, height * 0.5 + 0.1, 0.78);
  sheet.rotation.x = 0.07;
  group.add(sheet);

  // ---- Mist / spray at the base ----
  const mCount = 30;
  const mist = [];
  const mPos = new Float32Array(mCount * 3);
  for (let i = 0; i < mCount; i++) {
    mist.push({
      a: Math.random() * Math.PI * 2,
      r: 0.2 + Math.random() * 0.7,
      speed: 0.5 + Math.random() * 0.8,
      yoff: Math.random() * 1.6,
      sway: Math.random() * 6.28,
    });
  }
  const mGeo = new THREE.BufferGeometry();
  mGeo.setAttribute('position', new THREE.BufferAttribute(mPos, 3));
  const mMat = new THREE.PointsMaterial({
    color: '#eaf6ff', size: 0.35, sizeAttenuation: true, transparent: true,
    opacity: 0.5, depthWrite: false,
  });
  const mistPoints = new THREE.Points(mGeo, mMat);
  group.add(mistPoints);

  group.position.set(x, 0, z);
  group.rotation.y = facing;

  function tick(t) {
    uniforms.uTime.value = t;
    const arr = mGeo.attributes.position.array;
    for (let i = 0; i < mCount; i++) {
      const m = mist[i];
      const life = (t * m.speed + m.yoff) % 1.6;   // rise then recycle
      arr[i * 3 + 0] = Math.cos(m.a) * m.r + Math.sin(t * 1.5 + m.sway) * 0.1;
      arr[i * 3 + 1] = 0.15 + life * 1.1;
      arr[i * 3 + 2] = 0.8 + Math.sin(m.a) * m.r * 0.6;
    }
    mGeo.attributes.position.needsUpdate = true;
  }

  return { group, tick };
}
