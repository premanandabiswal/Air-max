import * as THREE from 'https://cdn.skypack.dev/three@0.129.0/build/three.module.js';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js';
import { gsap } from 'https://cdn.skypack.dev/gsap';
import {OrbitControls} from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js';

// scene setup

const camera = new THREE.PerspectiveCamera(
    10,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.z = 13;

const scene = new THREE.Scene();
let bee;
let mixer;
const loader = new GLTFLoader();
loader.load('assets/nike_tn_red.glb',
    function (gltf) {
        bee = gltf.scene;
        bee.rotation.set(0.9, 0.9, 0.9);
        bee.scale.set(3.7, 3.7, 3.7);
        scene.add(bee);

        mixer = new THREE.AnimationMixer(bee);
        mixer.clipAction(gltf.animations[0]).play();
        modelMove();
    },
    function (xhr) {},
    function (error) {}
);
const renderer = new THREE.WebGLRenderer({alpha: true});
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('container').appendChild(renderer.domElement);

// light
const ambientLight = new THREE.AmbientLight(0xffffff, 4);
scene.add(ambientLight);

const topLight = new THREE.DirectionalLight(0xffffff, 4.3);
topLight.position.set(800, 800, 800);
scene.add(topLight);


const reRender3D = () => {
    requestAnimationFrame(reRender3D);
    renderer.render(scene, camera);
    if(mixer) mixer.update(0.02);
};
reRender3D();

let arrPositionModel = [
  { 
    id: 'hero', 
    position: { x: 1.4, y: -1, z: 0 }, 
    rotation: { x: -0.08, y: -1, z: 0 } 
  },
  { 
    id: 'trending', 
    position: { x: -1.4, y: -0.8, z: -1 }, 
    rotation: { x: 0.05, y: -0.5, z: 0 } 
  },
  { 
    id: 'cta', 
    position: { x: 0.9, y: -1, z: -2 }, 
    rotation: { x: 0.1, y: 0.8, z: 0 } 
  },
  { 
    id: 'footer', 
    position: { x: -1.8, y: -0.6, z: -3 }, 
    rotation: { x: 0.2, y: -1.2, z: 0 } 
  }
];

let lastActiveId = null;

// Move the model to the mapping for a given id (if present)
function moveToId(id) {
    if (!bee) return;
    const mapping = arrPositionModel.find((m) => m.id === id);
    if (!mapping) return;
    if (lastActiveId === id) return; // already in place
    lastActiveId = id;
    const new_coordinates = mapping;
    gsap.to(bee.position, {
        x: new_coordinates.position.x,
        y: new_coordinates.position.y,
        z: new_coordinates.position.z,
        duration: 1.2,
        ease: 'power2.out'
    });
    gsap.to(bee.rotation, {
        x: new_coordinates.rotation.x,
        y: new_coordinates.rotation.y,
        z: new_coordinates.rotation.z,
        duration: 1.2,
        ease: 'power2.out'
    });
}

// On scroll, find the mapped element whose center is nearest the viewport center
const modelMove = () => {
    if (!bee) return;
    let best = null;
    let bestDist = Number.POSITIVE_INFINITY;
    arrPositionModel.forEach((mapping) => {
        const el = document.getElementById(mapping.id);
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const elCenter = rect.top + rect.height / 2;
        const viewCenter = window.innerHeight / 2;
        const dist = Math.abs(elCenter - viewCenter);
        if (dist < bestDist) {
            bestDist = dist;
            best = mapping;
        }
    });
    if (best) moveToId(best.id);
};

// Attach click handlers to mapped elements so clicking moves the model instantly
try {
    arrPositionModel.forEach((mapping) => {
        const el = document.getElementById(mapping.id);
        if (el) {
            el.style.cursor = 'pointer';
            el.addEventListener('click', (e) => {
                // avoid stealing clicks from interactive controls
                if (e.target && (e.target.tagName === 'A' || e.target.tagName === 'BUTTON' || e.target.closest('a,button'))) return;
                moveToId(mapping.id);
            });
        }
    });
} catch (e) {
    console.warn('[three] attaching click handlers failed', e);
}
window.addEventListener('scroll', () => {
    if (bee) {
        modelMove();
    }
})
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
})