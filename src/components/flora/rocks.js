// Low-poly rocks scattered near the clearing's edge.

export function makeRock(THREE, { x = 0, z = 0, scale = 1 } = {}) {
  const rock = new THREE.Mesh(
    new THREE.DodecahedronGeometry(0.6, 0),
    new THREE.MeshStandardMaterial({ color: '#8a8d92', roughness: 1, flatShading: true })
  );
  rock.position.set(x, 0.3 * scale, z);
  rock.scale.set(scale, scale * 0.7, scale);
  rock.rotation.set(x, z, x + z);
  rock.castShadow = true;
  rock.receiveShadow = true;
  return rock;
}

export function makeRocks(THREE, placements) {
  const group = new THREE.Group();
  for (const p of placements) group.add(makeRock(THREE, p));
  return group;
}
