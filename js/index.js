// File: js/index.js
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js';
import { RGBELoader } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/RGBELoader.js';

// 1. Setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111); 

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 0, 5);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
renderer.toneMapping = THREE.ACESFilmicToneMapping; 
renderer.toneMappingExposure = 1.0;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const wineGlassMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,        
    metalness: 0.0,         
    roughness: 0.05,     
    transmission: 1.0,      
    thickness: 1.5,         
    ior: 1.5,            
    side: THREE.DoubleSide,
    clearcoat: 1.0,         
    clearcoatRoughness: 0.1
});

const geometry = new THREE.TorusKnotGeometry(1, 0.3, 200, 32);
const mesh = new THREE.Mesh(geometry, wineGlassMaterial);
scene.add(mesh);

const hdriUrl = '../HDR/studio_small_09_4k.hdr';

const pmremGenerator = new THREE.PMREMGenerator(renderer);
pmremGenerator.compileEquirectangularShader();

const loaderElement = document.getElementById('loader');
const fillRect = document.getElementById('fill-level');
const percentText = document.getElementById('percent');
const infoText = document.getElementById('info');

new RGBELoader().load(hdriUrl, function (texture) {

    const envMap = pmremGenerator.fromEquirectangular(texture).texture;
    scene.environment = envMap; 
    scene.background = new THREE.Color(0x050505);
    scene.backgroundBlurriness = 0.5;
    texture.dispose();
    pmremGenerator.dispose();
    
    loaderElement.style.opacity = '0';
    infoText.style.opacity = '1';
    setTimeout(() => {
        loaderElement.style.display = 'none';
    }, 800);
},
function (xhr) {
    if (xhr.lengthComputable) {
        const percentComplete = xhr.loaded / xhr.total;
        percentText.innerText = Math.round(percentComplete * 100) + '%';
        const newY = 100 - (percentComplete * 100);
        fillRect.setAttribute('y', newY);
    }
}
);

function animate() {
    requestAnimationFrame(animate);
    controls.update();
            
    mesh.rotation.x += 0.005;
    mesh.rotation.y += 0.005;

    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});