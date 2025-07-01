import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GUI } from 'dat.gui';
import WebGL from 'three/addons/capabilities/WebGL.js';


//Create Scene, Camera, Renderer

const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(75,window.innerWidth/window.innerHeight,0.1,1000);
const renderer=new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create Stars

function createStars(){
  const starGeometry=new THREE.SphereGeometry(0.5,24,24),starMaterial=new THREE.MeshBasicMaterial({color:0xffffff});
  for(let i=0;i<1000;i++){
    const star=new THREE.Mesh(starGeometry,starMaterial);
    star.position.set((Math.random()-0.5)*1000,(Math.random()-0.5)*1000,(Math.random()-0.5)*1000);
    scene.add(star);
  }
}
createStars();
 
// Create Sun (Center)    
const sunGeometry = new THREE.SphereGeometry(25, 50, 50);
const sunMaterial = new THREE.MeshStandardMaterial({ color: 0xffff00, emissive: 0xffff00, emissiveIntensity: 0.5 });
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sun);
sun.rotation.y += 0.001;

// Add SunLight
const sunLight = new THREE.PointLight(0xffffff, 4, 300);
scene.add(sunLight);
//NOTE - ambient light
const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);


// Planets Data
const planetData = [  
  { name: 'Mercury', radius: 1.3, distance: 35, speed: 0.02, color: 0xaaaaaa,size: 5  },
  { name: 'Venus', radius: 0.5, distance: 45, speed: 0.015, color: 0xffcc99, size: 6 },
  { name: 'Earth', radius: 0.6, distance: 55, speed: 0.012, color: 0x3366ff, size: 7 },
  { name: 'Mars', radius: 0.5, distance: 65, speed: 0.01, color: 0xff3300, size: 8 },
  { name: 'Jupiter', radius: 1.1, distance: 75, speed: 0.008, color: 0xff9966, size: 9 },
  { name: 'Saturn', radius: 1.0, distance: 90, speed: 0.006, color: 0xffcc66,  size: 9.5 },
  { name: 'Uranus', radius: 0.8, distance: 105, speed: 0.004, color: 0x66ccff, size: 7.5 },
  { name: 'Neptune', radius: 0.8, distance: 120, speed: 0.003, color: 0x3333ff, size: 6.5 }
    ];

// Create Planets
const planets = planetData.map((data) => {
const geometry = new THREE.SphereGeometry(data.size, 32, 32);
const material = new THREE.MeshStandardMaterial({ color: data.color});
const planet = new THREE.Mesh(geometry, material);
const pivot = new THREE.Object3D();
pivot.add(planet);
pivot.position.set(0, 0, 0);
planet.position.x = data.distance;
scene.add(pivot);

// Create Orbit Path
const orbitPoints = [];

for (let i = 0; i <= 128; i++) {
  const angle = (i / 128) * Math.PI * 2;
  orbitPoints.push(new THREE.Vector3(Math.cos(angle) * data.distance, 0, Math.sin(angle) * data.distance));
}
      
const orbitGeometry = new THREE.BufferGeometry().setFromPoints(orbitPoints);
const orbitMaterial = new THREE.LineBasicMaterial({ color: 0x888888 });
const orbitPath = new THREE.Line(orbitGeometry, orbitMaterial);
scene.add(orbitPath);

return { pivot, planet, speed: data.speed, angle: 0 };
});

// Camera Position
camera.position.set(-50, 90, 150);

//OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Enable smooth controls
controls.dampingFactor = 0.25; // Set damping factor
controls.enableZoom = true; // Enable zooming
controls.zoomSpeed = 1.2; // Set zoom speed

// Animation Loop
let isPaused = false;

function animate() {
  if (isPaused){
     return; 
   } else{ // Exit the function if paused

  requestAnimationFrame(animate);

  planets.forEach(planet => {
    planet.angle += planet.speed;
    planet.pivot.rotation.y = planet.angle;
    planet.planet.rotation.y += 0.01;
    planet.planet.rotation.x += 1;
  });

  renderer.render(scene, camera);
 }
}
animate();


//add EventListener for pauseButton 
const pauseButton = document.getElementById('pauseButton');
pauseButton.addEventListener('click', () => {
  isPaused = !isPaused;
  pauseButton.textContent = isPaused ? 'Resume' : 'Pause';
});


const gui = new GUI();

planetData.forEach((data, index) => {
  const planetFolder = gui.addFolder(data.name);
  
  // Add a control for the orbital speed
  planetFolder.add(data, 'speed', 0, 0.1, 0.001)
    .name('Orbital Speed')
    .onChange(() => {
      // Update the planet's speed when the slider value changes
      planets[index].speed = parseFloat(data.speed);
    });

  planetFolder.open();
});

   
// Resize Handling
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});



