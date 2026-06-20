// A glowing will-o'-the-wisp: a custom GLSL ShaderMaterial orb with an
// animated fresnel rim-glow and a drifting two-color core, plus a point
// light so it illuminates its surroundings. Returns { group, tick }.

export function makeWisp(THREE, { x = 0, y = 2.4, z = 0, colorA = '#7df9ff', colorB = '#b06bff' } = {}) {
  const group = new THREE.Group();

  const uniforms = {
    uTime: { value: 0 },
    uColorA: { value: new THREE.Color(colorA) },
    uColorB: { value: new THREE.Color(colorB) },
  };

  const material = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */`
      varying vec3 vNormal;
      varying vec3 vViewDir;
      void main() {
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vNormal = normalize(normalMatrix * normal);
        vViewDir = normalize(-mvPosition.xyz);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: /* glsl */`
      uniform float uTime;
      uniform vec3 uColorA;
      uniform vec3 uColorB;
      varying vec3 vNormal;
      varying vec3 vViewDir;
      void main() {
        float fres = pow(1.0 - max(dot(vNormal, vViewDir), 0.0), 2.0);
        float pulse = 0.5 + 0.5 * sin(uTime * 2.0);
        vec3 core = mix(uColorA, uColorB, 0.5 + 0.5 * sin(uTime * 0.8 + vNormal.y * 3.0));
        vec3 col = core * (0.35 + 0.25 * pulse) + fres * (0.9 + 0.5 * pulse);
        float alpha = clamp(0.35 + fres, 0.0, 1.0);
        gl_FragColor = vec4(col, alpha);
      }
    `,
  });

  const orb = new THREE.Mesh(new THREE.SphereGeometry(0.55, 32, 32), material);
  group.add(orb);

  const light = new THREE.PointLight(new THREE.Color(colorA), 1.2, 9, 2);
  group.add(light);

  group.position.set(x, y, z);

  const tick = (t) => {
    uniforms.uTime.value = t;
    group.position.y = y + Math.sin(t * 1.1) * 0.35;
    group.position.x = x + Math.sin(t * 0.5) * 0.45;
    light.intensity = 1.0 + Math.sin(t * 2.0) * 0.5;
  };
  return { group, tick };
}
