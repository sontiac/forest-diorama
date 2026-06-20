import type { Component, Ctx } from '../../engine/types';

// A patch of sunflowers whose heads track the day-night sun across the sky
// and nod downward at night. Reads ctx.sun (moved by the day-night
// component) and env.night01. Native TypeScript component.
export const sunflowers: Component = {
  id: 'sunflowers',
  title: 'Sunflowers that follow the sun',
  create(ctx: Ctx) {
    const { THREE, sun, env } = ctx;
    const group = new THREE.Group();

    const stemMat = new THREE.MeshStandardMaterial({ color: '#4f8a3a', roughness: 0.85, flatShading: true });
    const leafMat = new THREE.MeshStandardMaterial({ color: '#5fa047', roughness: 0.85, side: THREE.DoubleSide, flatShading: true });
    const petalMat = new THREE.MeshStandardMaterial({ color: '#ffc41e', roughness: 0.7, flatShading: true });
    const centerMat = new THREE.MeshStandardMaterial({ color: '#5a3a1e', roughness: 0.9, flatShading: true });

    const flowers: Array<{ root: THREE.Group; head: THREE.Group; phase: number }> = [];
    let seed = 12.3;
    const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };

    const center = { x: -2.55, z: 12.75 };
    for (let i = 0; i < 5; i++) {
      const h = 1.2 + rnd() * 0.5;
      const root = new THREE.Group();

      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.05, h, 6), stemMat);
      stem.position.y = h / 2;
      stem.castShadow = true;
      root.add(stem);

      for (let k = 0; k < 2; k++) {
        const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.4, 4), leafMat);
        leaf.scale.z = 0.25;
        const a = rnd() * Math.PI * 2;
        leaf.position.set(Math.cos(a) * 0.05, h * (0.35 + k * 0.2), Math.sin(a) * 0.05);
        leaf.rotation.z = (rnd() - 0.5) * 1.2;
        root.add(leaf);
      }

      // Head pivot (faces +z; we point +z at the sun each frame).
      const head = new THREE.Group();
      head.position.y = h;

      const disc = new THREE.Mesh(new THREE.CircleGeometry(0.16, 18), centerMat);
      disc.position.z = 0.02;
      head.add(disc);
      const petalCount = 14;
      for (let p = 0; p < petalCount; p++) {
        const a = (p / petalCount) * Math.PI * 2;
        const petal = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.2, 0.02), petalMat);
        petal.position.set(Math.cos(a) * 0.26, Math.sin(a) * 0.26, 0);
        petal.rotation.z = a + Math.PI / 2;
        head.add(petal);
      }
      const calyx = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.18, 8), stemMat);
      calyx.rotation.x = -Math.PI / 2;
      calyx.position.z = -0.05;
      head.add(calyx);
      root.add(head);

      root.position.set(center.x + (rnd() - 0.5) * 2.0, 0, center.z + (rnd() - 0.5) * 1.6);
      group.add(root);
      flowers.push({ root, head, phase: rnd() * 6.28 });
    }

    const sunPos = new THREE.Vector3();

    function update(t: number) {
      sunPos.copy(sun.position);
      const night = env.night01 ?? 0;
      for (const f of flowers) {
        f.head.lookAt(sunPos);          // face the sun
        f.head.rotateX(night * 1.3);    // nod down at night
        f.root.rotation.z = Math.sin(t * 0.8 + f.phase) * 0.03; // breeze sway
      }
    }

    return { object: group, update };
  },
};
