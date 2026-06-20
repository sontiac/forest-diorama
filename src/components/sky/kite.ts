import type { Component, Ctx } from '../../engine/types';

// A colorful diamond kite drifting high in the wind, tethered by a string
// to a little ground peg, with a fluttering bow tail. Native TS component.
export const kite: Component = {
  id: 'kite',
  title: 'A kite in the wind',
  create(ctx: Ctx) {
    const { THREE } = ctx;
    const group = new THREE.Group();
    const anchor = new THREE.Vector3(3, 0.05, 5);

    // Ground peg the string is tied to.
    const peg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.03, 0.4, 6),
      new THREE.MeshStandardMaterial({ color: '#6b4423', roughness: 0.9 }),
    );
    peg.position.set(anchor.x, 0.2, anchor.z);
    group.add(peg);

    // ---- Kite body: four colored triangular panels ----
    const kiteObj = new THREE.Group();
    const C = new THREE.Vector2(0, 0);
    const T = new THREE.Vector2(0, 0.5);
    const R = new THREE.Vector2(0.35, 0);
    const B = new THREE.Vector2(0, -0.75);
    const L = new THREE.Vector2(-0.35, 0);
    const panel = (a: THREE.Vector2, b: THREE.Vector2, c: THREE.Vector2, color: string) => {
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute([a.x, a.y, 0, b.x, b.y, 0, c.x, c.y, 0], 3));
      g.computeVertexNormals();
      return new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color, side: THREE.DoubleSide, roughness: 0.7, flatShading: true }));
    };
    kiteObj.add(panel(C, T, R, '#e8413a'));
    kiteObj.add(panel(C, R, B, '#ffd23f'));
    kiteObj.add(panel(C, B, L, '#4db4ff'));
    kiteObj.add(panel(C, L, T, '#f3f3f3'));

    // Spars.
    const sparMat = new THREE.LineBasicMaterial({ color: '#3a2a1a' });
    const vSpar = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0.5, 0), new THREE.Vector3(0, -0.75, 0)]), sparMat);
    const hSpar = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-0.35, 0, 0), new THREE.Vector3(0.35, 0, 0)]), sparMat);
    kiteObj.add(vSpar, hSpar);

    // Tail of bows hanging from the bottom.
    const bowColors = ['#ff6a8a', '#7adfff', '#ffd23f', '#b6ff7a', '#ff8ad4'];
    const bows: THREE.Mesh[] = [];
    for (let i = 0; i < 6; i++) {
      const bow = new THREE.Mesh(
        new THREE.BoxGeometry(0.13, 0.05, 0.01),
        new THREE.MeshStandardMaterial({ color: bowColors[i % bowColors.length], side: THREE.DoubleSide, roughness: 0.7 }),
      );
      bow.position.set(0, -0.9 - i * 0.28, 0);
      bow.rotation.z = Math.PI / 4;
      kiteObj.add(bow);
      bows.push(bow);
    }
    group.add(kiteObj);

    // String (peg → kite), updated each frame.
    const strGeo = new THREE.BufferGeometry();
    strGeo.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(6), 3));
    const string = new THREE.Line(strGeo, new THREE.LineBasicMaterial({ color: '#d8d8d8', transparent: true, opacity: 0.6 }));
    group.add(string);

    function update(t: number) {
      const kx = 5 + Math.sin(t * 0.35) * 1.6;
      const ky = 7.5 + Math.sin(t * 0.6) * 0.7;
      const kz = 8 + Math.cos(t * 0.45) * 1.3;
      kiteObj.position.set(kx, ky, kz);
      kiteObj.lookAt(anchor.x, anchor.y, anchor.z); // lean toward the tether

      for (let i = 0; i < bows.length; i++) {
        bows[i].position.x = Math.sin(t * 5 + i * 0.8) * 0.1 * (1 + i * 0.12);
      }

      const p = strGeo.attributes.position.array as Float32Array;
      p[0] = anchor.x; p[1] = anchor.y; p[2] = anchor.z;
      p[3] = kx; p[4] = ky; p[5] = kz;
      strGeo.attributes.position.needsUpdate = true;
    }

    return { object: group, update };
  },
};
