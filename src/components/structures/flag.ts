import type { Component, Ctx } from '../../engine/types';

// A striped flag on a pole, rippling in the wind via per-vertex sine-wave
// displacement (more movement toward the free end). Native TS component.
export const flag: Component = {
  id: 'flag',
  title: 'A flag rippling in the wind',
  create(ctx: Ctx) {
    const { THREE } = ctx;
    const group = new THREE.Group();

    // Pole + finial.
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.06, 3.2, 8),
      new THREE.MeshStandardMaterial({ color: '#8a8d92', metalness: 0.4, roughness: 0.5 }),
    );
    pole.position.y = 1.6;
    pole.castShadow = true;
    group.add(pole);
    const finial = new THREE.Mesh(
      new THREE.SphereGeometry(0.1, 12, 10),
      new THREE.MeshStandardMaterial({ color: '#e0b53a', metalness: 0.6, roughness: 0.3 }),
    );
    finial.position.y = 3.25;
    group.add(finial);

    // Flag cloth with vertex-colored stripes.
    const fw = 1.5, fh = 0.95;
    const flagGeo = new THREE.PlaneGeometry(fw, fh, 24, 10);
    const pos = flagGeo.attributes.position;
    const colors = new Float32Array(pos.count * 3);
    const origX = new Float32Array(pos.count);
    const stripe = [new THREE.Color('#2bb8a8'), new THREE.Color('#f3ead6'), new THREE.Color('#ff7a5c')];
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), y = pos.getY(i);
      origX[i] = x;
      const s = y > fh / 6 ? 0 : (y < -fh / 6 ? 2 : 1);
      const c = stripe[s];
      colors[i * 3] = c.r; colors[i * 3 + 1] = c.g; colors[i * 3 + 2] = c.b;
    }
    flagGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    const flag = new THREE.Mesh(
      flagGeo,
      new THREE.MeshStandardMaterial({ vertexColors: true, side: THREE.DoubleSide, roughness: 0.75 }),
    );
    flag.position.set(fw / 2, 2.65, 0); // hoist edge sits at the pole
    flag.castShadow = true;
    group.add(flag);

    group.position.set(13.6, 0, -0.85);
    group.rotation.y = -0.5;

    function update(t: number) {
      const p = flagGeo.attributes.position;
      for (let i = 0; i < p.count; i++) {
        const u = (origX[i] + fw / 2) / fw; // 0 at hoist .. 1 at free end
        const z = Math.sin(u * 6 + t * 6) * 0.13 * u + Math.sin(u * 10 - t * 4) * 0.04 * u;
        p.setZ(i, z);
      }
      p.needsUpdate = true;
    }

    return { object: group, update };
  },
};
