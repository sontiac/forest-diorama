// An aurora borealis high in the night sky: undulating green-to-purple
// light curtains rendered with a custom GLSL shader on a curved sky
// band. Fades in only at night, driven by the shared env.night01.
//
// Usage:
//   const { group, tick } = createAurora(THREE, { env });
//   scene.add(group); tickers.push(tick);

export function createAurora(THREE, { env = { night01: 0 } } = {}) {
  const group = new THREE.Group();

  const uniforms = {
    uTime: { value: 0 },
    uNight: { value: 0 },
  };

  const material = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    fog: false,
    vertexShader: /* glsl */`
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */`
      uniform float uTime;
      uniform float uNight;
      varying vec2 vUv;
      float hash(float n){ return fract(sin(n) * 43758.5453); }
      float noise1(float x){
        float i = floor(x), f = fract(x);
        return mix(hash(i), hash(i + 1.0), f * f * (3.0 - 2.0 * f));
      }
      void main(){
        vec2 uv = vUv;
        float col1 = noise1(uv.x * 12.0 + uTime * 0.25);
        float col2 = noise1(uv.x * 26.0 - uTime * 0.15);
        float curtain = mix(col1, col2, 0.5);
        // Wavy upper edge of the bright band.
        float top = 0.55 + 0.20 * sin(uv.x * 25.0 + uTime * 0.4) + 0.12 * curtain;
        float band = smoothstep(top, top - 0.45, uv.y) * smoothstep(0.02, 0.22, uv.y);
        float rays = pow(curtain, 1.6);
        float glow = band * (0.35 + 0.65 * rays);
        vec3 green = vec3(0.20, 0.95, 0.55);
        vec3 purple = vec3(0.55, 0.30, 1.0);
        vec3 col = mix(green, purple, clamp(uv.y * 1.4, 0.0, 1.0));
        float alpha = glow * uNight * 0.85;
        gl_FragColor = vec4(col * glow * 1.6, alpha);
      }
    `,
  });

  // A curved band of sky (open partial cylinder) high overhead.
  const geo = new THREE.CylinderGeometry(50, 50, 22, 80, 1, true, 0, Math.PI * 1.15);
  const curtain = new THREE.Mesh(geo, material);
  curtain.position.y = 12;
  group.add(curtain);
  group.rotation.y = Math.PI * 0.55; // swing the arc toward the back of the scene

  function tick(t) {
    uniforms.uTime.value = t;
    uniforms.uNight.value = env.night01 || 0;
  }

  return { group, tick };
}
