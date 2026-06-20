import type { Component, Ctx } from '../../engine/types';

// Mallard ducks gliding on the pond in slow arcs, each trailing a V-wake
// and occasionally dabbling (tipping forward). Click one to make it flap.
// Reads ctx.world.pond for placement. Native TypeScript component.
export const ducks: Component = {
  id: 'ducks',
  title: 'Ducks on the pond (click to make one flap)',
  create(ctx: Ctx) {
    const { THREE } = ctx;
    const pond = ctx.world.pond;
    const group = new THREE.Group();

    const bodyMat = new THREE.MeshStandardMaterial({ color: '#7a5a3c', roughness: 0.8, flatShading: true });
    const headMat = new THREE.MeshStandardMaterial({ color: '#1f7a4d', roughness: 0.5, metalness: 0.2, flatShading: true });
    const ringMat = new THREE.MeshStandardMaterial({ color: '#f3f3f3', roughness: 0.8 });
    const billMat = new THREE.MeshStandardMaterial({ color: '#e0a020', roughness: 0.6 });
    const wakeMat = new THREE.MeshBasicMaterial({ color: '#eaf6ff', transparent: true, opacity: 0.22, side: THREE.DoubleSide, depthWrite: false });
    const dark = new THREE.MeshStandardMaterial({ color: '#161616', roughness: 0.5 });

    interface Duck {
      d: THREE.Group; wings: THREE.Mesh[];
      phase: number; speed: number; rr: number; flapT: number; dabblePhase: number;
    }
    const ducks: Duck[] = [];

    for (let i = 0; i < 2; i++) {
      const d = new THREE.Group(); // forward +x

      const body = new THREE.Mesh(new THREE.SphereGeometry(0.22, 14, 10), bodyMat);
      body.scale.set(1.6, 0.8, 0.95);
      body.position.y = 0.12;
      body.castShadow = true;
      d.add(body);

      const tail = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.18, 6), bodyMat);
      tail.rotation.z = -Math.PI / 2 - 0.5;
      tail.position.set(-0.34, 0.18, 0);
      d.add(tail);

      const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.22, 8), headMat);
      neck.position.set(0.26, 0.26, 0);
      neck.rotation.z = 0.3;
      d.add(neck);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.018, 6, 12), ringMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.set(0.3, 0.34, 0);
      d.add(ring);
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 10), headMat);
      head.position.set(0.34, 0.42, 0);
      head.castShadow = true;
      d.add(head);
      const bill = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.14, 8), billMat);
      bill.rotation.z = -Math.PI / 2;
      bill.position.set(0.46, 0.41, 0);
      d.add(bill);
      for (const sz of [-0.045, 0.045]) {
        const eye = new THREE.Mesh(new THREE.SphereGeometry(0.018, 6, 6), dark);
        eye.position.set(0.4, 0.45, sz);
        d.add(eye);
      }

      const wings: THREE.Mesh[] = [];
      for (const sz of [1, -1]) {
        const wing = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 8), bodyMat);
        wing.scale.set(1.2, 0.35, 0.7);
        wing.position.set(-0.05, 0.16, sz * 0.18);
        d.add(wing);
        wings.push(wing);
      }

      // V-wake trailing behind, on the water surface.
      const wakeGeo = new THREE.BufferGeometry();
      wakeGeo.setAttribute('position', new THREE.Float32BufferAttribute([
        -0.2, 0, 0, -1.1, 0, 0.3, -1.1, 0, -0.3,
      ], 3));
      wakeGeo.computeVertexNormals();
      const wake = new THREE.Mesh(wakeGeo, wakeMat);
      wake.position.y = -0.05; // sit at world water level (duck floats at ~0.08)
      d.add(wake);

      group.add(d);
      ducks.push({ d, wings, phase: i * Math.PI, speed: 0.16 + i * 0.04, rr: 1.2 + i * 0.35, flapT: -1, dabblePhase: i * 3 });
      d.userData.__duck = ducks[ducks.length - 1];
    }

    function update(t: number, dt: number) {
      for (const dk of ducks) {
        const ang = t * dk.speed + dk.phase;
        const x = pond.center.x + Math.cos(ang) * dk.rr;
        const z = pond.center.z + Math.sin(ang) * dk.rr;
        const vx = -Math.sin(ang), vz = Math.cos(ang);
        const yaw = Math.atan2(vx, vz);

        // Occasional dabble: tip forward briefly.
        const dab = Math.max(0, Math.sin(t * 0.5 + dk.dabblePhase) - 0.85) / 0.15; // 0..1 spikes
        dk.d.position.set(x, 0.08 + Math.sin(t * 2 + dk.phase) * 0.01, z);
        dk.d.rotation.set(0, yaw, -dab * 0.6);

        // Flap on click.
        let lift = 0.0;
        if (dk.flapT >= 0) {
          dk.flapT += dt || 0.016;
          if (dk.flapT > 1.0) dk.flapT = -1;
          else lift = Math.abs(Math.sin(dk.flapT * Math.PI * 4)) * 1.1;
        }
        dk.wings[0].rotation.x = -lift;
        dk.wings[1].rotation.x = lift;
      }
    }

    function onPointerDown(_ctx: Ctx, hit: { object: THREE.Object3D }) {
      let o: THREE.Object3D | null = hit.object;
      while (o && !o.userData.__duck) o = o.parent;
      const dk = o?.userData.__duck as Duck | undefined;
      if (dk && dk.flapT < 0) dk.flapT = 0;
    }

    return { object: group, update, onPointerDown };
  },
};
