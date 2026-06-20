import type { Component, Ctx } from '../../engine/types';

// A wrought-iron garden lamppost whose lantern glows warm at night,
// driven by the shared env.night01 (with a faint flicker). Native TS.
export const lamppost: Component = {
  id: 'lamppost',
  title: 'A garden lamppost (lights up at night)',
  create(ctx: Ctx) {
    const { THREE, env } = ctx;
    const group = new THREE.Group();
    const iron = new THREE.MeshStandardMaterial({ color: '#23242a', roughness: 0.6, metalness: 0.4, flatShading: true });

    // Base + post.
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.26, 0.18, 10), iron);
    base.position.y = 0.09;
    base.castShadow = true;
    group.add(base);
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 2.4, 10), iron);
    post.position.y = 1.3;
    post.castShadow = true;
    group.add(post);
    const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.08, 10), iron);
    collar.position.y = 2.46;
    group.add(collar);

    // Lantern housing.
    const lantern = new THREE.Group();
    lantern.position.y = 2.5;
    const floor = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.04, 8), iron);
    lantern.add(floor);
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
      const bar = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.36, 0.025), iron);
      bar.position.set(Math.cos(a) * 0.12, 0.2, Math.sin(a) * 0.12);
      lantern.add(bar);
    }
    const cap = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.18, 4), iron);
    cap.rotation.y = Math.PI / 4;
    cap.position.y = 0.48;
    lantern.add(cap);
    const finial = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), iron);
    finial.position.y = 0.6;
    lantern.add(finial);

    // Glowing bulb + light.
    const bulbMat = new THREE.MeshStandardMaterial({ color: '#fff0cf', emissive: '#ffcf87', emissiveIntensity: 0, roughness: 0.4 });
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 10), bulbMat);
    bulb.position.y = 0.2;
    lantern.add(bulb);
    const light = new THREE.PointLight('#ffcf87', 0, 7, 2);
    light.position.y = 0.2;
    lantern.add(light);
    group.add(lantern);

    group.position.set(-2.0, 0, 6.2);

    function update(t: number) {
      const n = env.night01 ?? 0;
      const flicker = 0.92 + 0.08 * Math.sin(t * 9.0) * Math.sin(t * 3.3);
      bulbMat.emissiveIntensity = n * 1.5 * flicker;
      light.intensity = n * 1.7 * flicker;
    }

    return { object: group, update };
  },
};
