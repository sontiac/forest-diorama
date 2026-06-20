import type { Component, Ctx } from '../../engine/types';

// A hedgehog snuffling through the grass on a slow waddle. Click it and it
// curls into a spiky ball (face tucks, spikes bristle) for a moment, then
// unrolls. Native TypeScript component.
export const hedgehog: Component = {
  id: 'hedgehog',
  title: 'A hedgehog (click to make it curl up)',
  create(ctx: Ctx) {
    const { THREE } = ctx;
    const root = new THREE.Group();
    const body = new THREE.Group();
    root.add(body);

    const furMat = new THREE.MeshStandardMaterial({ color: '#7a5230', roughness: 0.9, flatShading: true });
    const spikeMat = new THREE.MeshStandardMaterial({ color: '#574029', roughness: 0.9, flatShading: true });
    const snoutMat = new THREE.MeshStandardMaterial({ color: '#caa882', roughness: 0.85, flatShading: true });
    const dark = new THREE.MeshStandardMaterial({ color: '#161616', roughness: 0.5 });

    // Domed body.
    const dome = new THREE.Mesh(
      new THREE.SphereGeometry(0.22, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.6),
      furMat,
    );
    dome.scale.set(1.1, 1, 1.3);
    dome.position.y = 0.16;
    dome.castShadow = true;
    body.add(dome);

    // Spikes spread over the upper hemisphere (golden-angle spiral).
    const spikes = new THREE.Group();
    spikes.position.y = 0.16;
    const up = new THREE.Vector3(0, 1, 0);
    const tmp = new THREE.Vector3();
    const N = 34;
    for (let i = 0; i < N; i++) {
      const yy = 0.25 + (i / N) * 0.72;
      const rr = Math.sqrt(Math.max(0, 1 - yy * yy));
      const theta = i * 2.399963;
      tmp.set(Math.cos(theta) * rr, yy, Math.sin(theta) * rr).normalize();
      const spike = new THREE.Mesh(new THREE.ConeGeometry(0.025, 0.13, 5), spikeMat);
      spike.position.copy(tmp).multiply(new THREE.Vector3(0.24, 0.2, 0.3));
      spike.quaternion.setFromUnitVectors(up, tmp);
      spikes.add(spike);
    }
    body.add(spikes);

    // Face (snout, nose, eyes, ears) — tucks away when curled.
    const face = new THREE.Group();
    face.position.set(0, 0.13, 0.18);
    const snout = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.22, 10), snoutMat);
    snout.rotation.x = Math.PI / 2;
    snout.position.z = 0.05;
    face.add(snout);
    const nose = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 8), dark);
    nose.position.set(0, 0, 0.17);
    face.add(nose);
    for (const sx of [-0.06, 0.06]) {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.022, 8, 8), dark);
      eye.position.set(sx, 0.05, 0);
      face.add(eye);
      const ear = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 8), furMat);
      ear.scale.set(1, 1, 0.5);
      ear.position.set(sx * 1.6, 0.1, -0.04);
      face.add(ear);
    }
    body.add(face);

    // Little feet.
    for (const [fx, fz] of [[0.12, 0.08], [-0.12, 0.08], [0.12, -0.1], [-0.12, -0.1]]) {
      const foot = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 6), snoutMat);
      foot.scale.set(1, 0.6, 1.2);
      foot.position.set(fx, 0.02, fz);
      body.add(foot);
    }

    const center = { x: 1.5, z: -3 };
    const pathR = 1.3;
    root.position.set(center.x, 0, center.z);

    let moveT = 0;   // waddle phase (pauses while curled)
    let curlT = -1;  // -1 = uncurled; >=0 curl timer

    function update(_t: number, dt: number) {
      const d = dt || 0.016;
      if (curlT < 0) {
        moveT += d;
        const a = moveT * 0.5;
        const x = center.x + Math.cos(a) * pathR;
        const z = center.z + Math.sin(a) * pathR;
        root.position.set(x, Math.abs(Math.sin(moveT * 6)) * 0.015, z);
        const vx = -Math.sin(a), vz = Math.cos(a);
        root.rotation.y = Math.atan2(vx, vz);
        body.rotation.z = Math.sin(moveT * 6) * 0.07;      // waddle
        face.rotation.x = Math.sin(moveT * 9) * 0.12;       // snuffle
        face.scale.setScalar(1);
        spikes.scale.setScalar(1);
        return;
      }
      // Curled: tuck the face, bristle the spikes, hold still.
      curlT += d;
      let curl: number;
      if (curlT < 0.25) curl = curlT / 0.25;
      else if (curlT < 1.8) curl = 1;
      else if (curlT < 2.1) curl = 1 - (curlT - 1.8) / 0.3;
      else { curlT = -1; curl = 0; }
      face.scale.setScalar(1 - curl);
      spikes.scale.setScalar(1 + curl * 0.18);
      body.rotation.z = 0;
    }

    function onPointerDown() {
      if (curlT < 0) curlT = 0;
    }

    return { object: root, update, onPointerDown };
  },
};
