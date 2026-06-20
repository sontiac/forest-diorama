import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createWorld } from './engine/world';
import { runScene } from './engine/engine';
import type { Ctx, Env } from './engine/types';
import { manifest } from './components/manifest';

// ---- Renderer ----
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// ---- Scene + base sky/fog (the day-night component overrides these once revealed) ----
const scene = new THREE.Scene();
scene.background = new THREE.Color('#87b9e0');
scene.fog = new THREE.Fog('#9fc6e6', 28, 70);

// ---- Camera ----
const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 200);
camera.position.set(10, 7, 14);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.maxPolarAngle = Math.PI / 2 - 0.04;
controls.minDistance = 5;
controls.maxDistance = 45;
controls.target.set(0, 1, 0);
controls.autoRotate = true;
controls.autoRotateSpeed = 0.35;

// ---- Base lighting (day-night drives these later) ----
const hemi = new THREE.HemisphereLight('#cfe8ff', '#3a5a32', 0.85);
scene.add(hemi);

const sun = new THREE.DirectionalLight('#fff4d6', 1.5);
sun.position.set(14, 20, 8);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.near = 1;
sun.shadow.camera.far = 60;
sun.shadow.camera.left = -25;
sun.shadow.camera.right = 25;
sun.shadow.camera.top = 25;
sun.shadow.camera.bottom = -25;
sun.shadow.bias = -0.0004;
scene.add(sun);

// ---- Ground ----
const ground = new THREE.Mesh(
  new THREE.CircleGeometry(40, 64),
  new THREE.MeshStandardMaterial({ color: '#5a8c3e', roughness: 1 }),
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// ---- Shared context ----
const env: Env = { daylight: 1, night01: 0, elevation: 1 };
const texLoader = new THREE.TextureLoader();
const world = createWorld();
const ctx: Ctx = { THREE, scene, camera, renderer, sun, hemi, texLoader, env, world };

// ---- Log panel ----
const logEl = document.getElementById('log');
function logEntry(text: string): void {
  if (!logEl) return;
  const el = document.createElement('div');
  el.className = 'entry';
  el.textContent = text;
  const header = logEl.querySelector('h1');
  logEl.insertBefore(el, header ? header.nextSibling : logEl.firstChild);
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ---- Mode: ?timelapse[&step=1.1] reveals features one at a time for recording ----
const params = new URLSearchParams(location.search);
const timelapse = params.has('timelapse');
const stepSeconds = Number.parseFloat(params.get('step') ?? '') || 1.1;
if (timelapse) controls.autoRotateSpeed = 0.5;

// Dev helper: ?cam=x,y,z and ?look=x,y,z frame a component for inspection.
const camParam = params.get('cam');
const lookParam = params.get('look');
if (camParam) {
  const [cx, cy, cz] = camParam.split(',').map(Number);
  camera.position.set(cx, cy, cz);
}
if (lookParam) {
  const [lx, ly, lz] = lookParam.split(',').map(Number);
  controls.target.set(lx, ly, lz);
}
if (camParam || lookParam) controls.autoRotate = false;

runScene(ctx, manifest, {
  mode: timelapse ? 'timelapse' : 'instant',
  stepSeconds,
  onFrame: () => controls.update(),
  onReveal: (component) => logEntry(component.title),
});
