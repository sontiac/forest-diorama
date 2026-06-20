import type { Component, Ctx } from '../../engine/types';

// A turtle sunning itself on a rock at the pond's edge. It breathes and
// sways its head idly; click it and the head tucks into the shell, then
// peeks back out. Written as a native TypeScript component to show the
// fully-typed path (no `as any` needed in the manifest).
export const turtle: Component = {
  id: 'turtle',
  title: 'A turtle sunning on a rock (click to hide its head)',
  create(ctx: Ctx) {
    const { THREE } = ctx;
    const group = new THREE.Group();

    const shellMat = new THREE.MeshStandardMaterial({ color: '#5a7d3a', roughness: 0.7, flatShading: true });
    const shellDark = new THREE.MeshStandardMaterial({ color: '#3f5a28', roughness: 0.7, flatShading: true });
    const skinMat = new THREE.MeshStandardMaterial({ color: '#7faa55', roughness: 0.7, flatShading: true });
    const rockMat = new THREE.MeshStandardMaterial({ color: '#8a8d92', roughness: 1, flatShading: true });
    const dark = new THREE.MeshStandardMaterial({ color: '#1c1c1c', roughness: 0.5 });

    // Sun rock.
    const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.5, 0), rockMat);
    rock.scale.set(1.15, 0.5, 1.15);
    rock.position.y = 0.12;
    rock.castShadow = true;
    rock.receiveShadow = true;
    group.add(rock);

    const turtleGroup = new THREE.Group();
    turtleGroup.position.y = 0.34;

    // Shell dome + belly + scute bumps.
    const shell = new THREE.Mesh(
      new THREE.SphereGeometry(0.26, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.5),
      shellMat,
    );
    shell.scale.set(1.2, 0.85, 1.5);
    shell.position.y = 0.1;
    shell.castShadow = true;
    turtleGroup.add(shell);

    const belly = new THREE.Mesh(new THREE.CircleGeometry(0.3, 16), shellDark);
    belly.rotation.x = -Math.PI / 2;
    belly.position.y = 0.02;
    turtleGroup.add(belly);

    for (const [bx, bz] of [[0, 0.12], [0.14, -0.06], [-0.14, -0.06], [0, -0.22]]) {
      const scute = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), shellDark);
      scute.scale.set(1, 0.5, 1);
      scute.position.set(bx, 0.2, bz);
      turtleGroup.add(scute);
    }

    // Stubby legs + tail.
    for (const [lx, lz] of [[0.2, 0.22], [-0.2, 0.22], [0.2, -0.22], [-0.2, -0.22]]) {
      const leg = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 6), skinMat);
      leg.scale.set(1.2, 0.5, 1.2);
      leg.position.set(lx, 0.02, lz);
      turtleGroup.add(leg);
    }
    const tail = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.12, 6), skinMat);
    tail.rotation.x = -Math.PI / 2;
    tail.position.set(0, 0.06, -0.38);
    turtleGroup.add(tail);

    // Head on a neck (retracts on click).
    const head = new THREE.Group();
    const headOutZ = 0.36;
    head.position.set(0, 0.1, headOutZ);
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.16, 8), skinMat);
    neck.rotation.x = Math.PI / 2;
    neck.position.z = -0.05;
    head.add(neck);
    const skull = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 8), skinMat);
    skull.scale.set(1, 0.9, 1.1);
    head.add(skull);
    for (const sx of [-0.04, 0.04]) {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.02, 6, 6), dark);
      eye.position.set(sx, 0.03, 0.07);
      head.add(eye);
    }
    turtleGroup.add(head);
    group.add(turtleGroup);

    // Tuck against the pond's edge.
    const pond = ctx.world.pond;
    group.position.set(pond.center.x + 2.4, 0, pond.center.z + 1.1);
    group.rotation.y = -0.7;

    let hideT = -1; // -1 = head out; >=0 retract/peek timer

    function update(t: number, dt: number) {
      shell.position.y = 0.1 + Math.sin(t * 1.5) * 0.012; // breathing
      if (hideT < 0) {
        head.position.z = headOutZ;
        head.scale.setScalar(1);
        head.rotation.y = Math.sin(t * 0.8) * 0.4;
        return;
      }
      hideT += dt || 0.016;
      let out: number;
      if (hideT < 0.3) out = 1 - hideT / 0.3;
      else if (hideT < 1.8) out = 0;
      else if (hideT < 2.1) out = (hideT - 1.8) / 0.3;
      else { hideT = -1; out = 1; }
      head.position.z = 0.12 + (headOutZ - 0.12) * out;
      head.scale.setScalar(0.4 + 0.6 * out);
      head.rotation.y = 0;
    }

    function onPointerDown() {
      if (hideT < 0) hideT = 0;
    }

    return { object: group, update, onPointerDown };
  },
};
