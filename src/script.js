import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { Timer } from 'three/addons/misc/Timer.js'
import GUI from 'lil-gui'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'
import { gsap } from "gsap";


/**
 * Base
 */
 // Debug
const gui = new GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Overlay
 */
const overlayGeometry = new THREE.PlaneGeometry(2, 2, 1, 1);
const overlayMaterial = new THREE.ShaderMaterial({
    transparent: true,
    uniforms: {
    uAlpha: { value: 1 },
  },
  vertexShader: `
    void main() { gl_Position = vec4(position, 1.0); }
  `,
  fragmentShader: `
    uniform float uAlpha;
    void main() { gl_FragColor = vec4(0.0, 0.0, 0.0, uAlpha); }
  `,
});
const overlay = new THREE.Mesh(overlayGeometry, overlayMaterial);
scene.add(overlay);
/**
 * Loaders
 */
const loadingScreen = document.querySelector(".loading-screen");
const loadingBarFill = document.querySelector(".loading-bar-fill");
const loadingManager = new THREE.LoadingManager(
  () => {
    window.setTimeout(() => {
      gsap.to(overlayMaterial.uniforms.uAlpha, {
        duration: 3,
        value: 0,
        delay: 1,
        onComplete: () => {
            scene.remove(overlay);
        }
      });
      loadingScreen.classList.add("ended");

      window.addEventListener("click", startAudio);
      window.addEventListener("touchend", startAudio);
    }, 500);
  },
  (itemUrl, itemsLoaded, itemsTotal) => {
    const progressRatio = itemsLoaded / itemsTotal;
    loadingBarFill.style.width = `${progressRatio * 100}%`;
  }
);
const gltfLoader = new GLTFLoader(loadingManager)
const rgbeLoader = new RGBELoader(loadingManager)
const audioLoader = new THREE.AudioLoader(loadingManager);

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader(loadingManager)

// Floor
const floorColorTexture = textureLoader.load('./floor/snow/snow_01_rough_4k.jpg')
const floorNormalTexture = textureLoader.load('./floor/snow/snow_01_nor_gl_4k.jpg')
const floorDisplacementTexture = textureLoader.load('./floor/snow/snow_01_diff_4k.jpg')
floorColorTexture.wrapS = THREE.RepeatWrapping
floorNormalTexture.wrapS = THREE.RepeatWrapping
floorDisplacementTexture.wrapS = THREE.RepeatWrapping

floorColorTexture.repeat.set(10, 10)
floorNormalTexture.repeat.set(10, 10)
floorDisplacementTexture.repeat.set(10, 10)

floorColorTexture.wrapT = THREE.RepeatWrapping
floorNormalTexture.wrapT = THREE.RepeatWrapping
floorDisplacementTexture.wrapT = THREE.RepeatWrapping
floorColorTexture.colorSpace = THREE.SRGBColorSpace

//Road

const roadColorTexture = textureLoader.load('./road/cobblestone_floor_001_diff_4k.jpg');
const roadNormalTexture = textureLoader.load('./road/cobblestone_floor_001_nor_gl_4k.png');
const roadDisplacementTexture = textureLoader.load('./road/cobblestone_floor_001_disp_4k.png');
const roadRoughnessTexture = textureLoader.load('./road/cobblestone_floor_001_rough_4k.png');
const roadArmTexture = textureLoader.load('./road/cobblestone_floor_001_arm_4k.jpg'); 
roadColorTexture.colorSpace = THREE.SRGBColorSpace;

[
    roadColorTexture,
    roadNormalTexture,
    roadDisplacementTexture,
    roadRoughnessTexture,
    roadArmTexture
].forEach(tex => {
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(8, 1);
});

// Tower Textures
const towerColorTexture = textureLoader.load('/tower/blue_metal_plate_diff_4k.jpg');
towerColorTexture.colorSpace = THREE.SRGBColorSpace;

const towerNormalTexture = textureLoader.load('/tower/blue_metal_plate_nor_gl_4k.png');
const towerARMTexture = textureLoader.load('/tower/blue_metal_plate_arm_4k.jpg');
const towerAOTexture = textureLoader.load('/tower/blue_metal_plate_ao_4k.jpg');
const towerDisplacementTexture = textureLoader.load('/tower/blue_metal_plate_disp_4k.png');

[
    towerColorTexture,
    towerNormalTexture,
    towerDisplacementTexture,
    towerAOTexture
].forEach(tex => {
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(1, 1);
});

const tableTextures = {
    top: {
        map: textureLoader.load('/picnicTable/wooden_picnic_table_top_diff_4k.png'),
        normalMap: textureLoader.load('/picnicTable/wooden_picnic_table_top_nor_gl_4k.png'),
        roughnessMap: textureLoader.load('/picnicTable/wooden_picnic_table_top_rough_4k.png'),
        metalnessMap: textureLoader.load('/picnicTable/wooden_picnic_table_top_metal_4k.png'),
    },

    bottom: {
        map: textureLoader.load('/picnicTable/wooden_picnic_table_bottom_diff_4k.png'),
        normalMap: textureLoader.load('/picnicTable/wooden_picnic_table_bottom_nor_gl_4k.png'),
        roughnessMap: textureLoader.load('/picnicTable/wooden_picnic_table_bottom_rough_4k.png'),
        metalnessMap: textureLoader.load('/picnicTable/wooden_picnic_table_bottom_metal_4k.png'),
    }
};

tableTextures.top.map.colorSpace = THREE.SRGBColorSpace;
tableTextures.bottom.map.colorSpace = THREE.SRGBColorSpace;

const wallTextures = {
    map: textureLoader.load('/walls/snow_03_diff_4k.jpg'),
    normalMap: textureLoader.load('/walls/snow_03_nor_gl_4k.jpg'),
    roughnessMap: textureLoader.load('/walls/snow_03_rough_4k.jpg')
};
wallTextures.map.colorSpace = THREE.SRGBColorSpace;

[wallTextures.map, wallTextures.normalMap, wallTextures.roughnessMap].forEach(tex => {
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(4, 1); // повторюємо по X/Z, можна підкоригувати
});

const wallMaterialTextured = new THREE.MeshStandardMaterial({
    map: wallTextures.map,
    normalMap: wallTextures.normalMap,
    roughnessMap: wallTextures.roughnessMap,
    metalness: 0,
    roughness: 1
});

/**
 * Tower
 */
gltfLoader.load('/models/Tower.glb', (gltf) => {

    const tower = gltf.scene;
    tower.position.set(0, 0.13, 0);

    tower.traverse((child) => {
        if (child.isMesh) {

            child.material = new THREE.MeshStandardMaterial({
                map: towerColorTexture,
                normalMap: towerNormalTexture,
                aoMap: towerARMTexture,
                roughnessMap: towerARMTexture,
                metalnessMap: towerARMTexture,
                metalness: 1,
                roughness: 1,
                displacementMap: null,
                displacementScale: 0
            });
            if (child.geometry.attributes.uv) {
                child.geometry.setAttribute(
                    'uv2',
                    new THREE.BufferAttribute(child.geometry.attributes.uv.array, 2)
                );
            }
        }
    });

    scene.add(tower);
});

/**
 * Picnic tables around the tower
 */

const picnicLoader = new GLTFLoader();

picnicLoader.load('/picnicTable/wooden_picnic_table_4k.glb', (gltf) => {
    
    const table = gltf.scene;
    table.scale.set(0.2, 0.2, 0.2);

    table.traverse((child) => {
        if (child.isMesh) {
            const bbox = new THREE.Box3().setFromObject(child);
            const height = bbox.max.y - bbox.min.y;

            const isTop = height > 0.05;

            const textures = isTop ? tableTextures.top : tableTextures.bottom;

            child.material = new THREE.MeshStandardMaterial({
                map: textures.map,
                normalMap: textures.normalMap,
                roughnessMap: textures.roughnessMap,
                metalnessMap: textures.metalnessMap,
                metalness: 1,
                roughness: 1
            });

            // UV2 для AO
            if (child.geometry.attributes.uv && !child.geometry.attributes.uv2) {
                child.geometry.setAttribute(
                    "uv2",
                    new THREE.BufferAttribute(child.geometry.attributes.uv.array, 2)
                );
            }
        }
    });

    const positions = [
        { x:  1, z:  1.5 },
        { x: -1, z:  1.5 },
        { x: -1, z: -1.5 },
        { x:  1, z: -1.5 }
    ];

    positions.forEach((pos) => {
        const t = table.clone(true);
        t.position.set(pos.x, 0.14, pos.z); 
        scene.add(t);
    });
});

/**
 * Floor
 */
const boxGeometry = new THREE.BoxGeometry(8, 0.01, 8)
const boxMaterial = new THREE.MeshStandardMaterial({ 
        color: '#ffffffff',
        transparent: true,
        map: floorColorTexture,
        displacementMap: floorDisplacementTexture,
        displacementScale: 0.8,
        displacementBias: - 0.5 })
const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial)
boxMesh.position.set(0, 0.05, 0)
scene.add(boxMesh)

/**
 * Sky
 */
rgbeLoader.load('/background/qwantani_moon_noon_puresky_4k.hdr', (environmentMap) =>
{
    environmentMap.mapping = THREE.EquirectangularReflectionMapping

    scene.background = environmentMap
    scene.environment = environmentMap

    scene.environmentIntensity = 0.05
    scene.backgroundIntensity = 0.1
})

/**
 * Road
 */
const roadGeometry = new THREE.BoxGeometry(8, 0.01, 0.5);

// Needed for AO
roadGeometry.setAttribute(
    'uv2',
    new THREE.BufferAttribute(roadGeometry.attributes.uv.array, 2)
);

// Material
const roadMaterial = new THREE.MeshStandardMaterial({
    map: roadColorTexture,
    normalMap: roadNormalTexture,
    displacementMap: roadDisplacementTexture,
    displacementScale: 0.03,
    displacementBias: -0.01,
    roughnessMap: roadRoughnessTexture,
    aoMap: roadArmTexture,
    aoMapIntensity: 1.0,
    color: '#ffffff'
});

const roadMesh = new THREE.Mesh(roadGeometry, roadMaterial);
roadMesh.position.set(0, 0.15, 0);
roadMesh.rotation.set(0, 0, Math.PI);
scene.add(roadMesh);

/**
 * Trees
 */
const treeGeometry = new THREE.ConeGeometry(0.2, 1, 8)
const treeMaterial = new THREE.MeshStandardMaterial({ color: '#0b6623' })
for(let i = -3; i <= 3; i += 1.5)
{
    const treeMeshFront = new THREE.Mesh(treeGeometry, treeMaterial)
    treeMeshFront.position.set(i, 0.5, -3.5)
    scene.add(treeMeshFront)

    const treeMeshBack = new THREE.Mesh(treeGeometry, treeMaterial)
    treeMeshBack.position.set(i, 0.5, 3.5)
    scene.add(treeMeshBack)
}

const fogGeometry = new THREE.PlaneGeometry(10, 10, 1, 1);

const fogMaterial = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(0xffffff) },
        uHeight: { value: 1.6 },
    },
    vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
            vec4 worldPosition = modelMatrix * vec4(position, 1.0);
            vWorldPosition = worldPosition.xyz;
            gl_Position = projectionMatrix * viewMatrix * worldPosition;
        }
    `,
    fragmentShader: `
        uniform float uTime;
        uniform vec3 uColor;
        uniform float uHeight;
        varying vec3 vWorldPosition;

        void main() {
            float fogFactor = smoothstep(0.0, uHeight, vWorldPosition.y);
            fogFactor = 1.0 - fogFactor;

            // Додаткові хвилі туману
            float wave1 = sin(uTime * 0.5 + vWorldPosition.x * 2.0);
            float wave2 = cos(uTime * 0.3 + vWorldPosition.z * 3.0);
            fogFactor *= 0.6 + 0.4 * (wave1 + wave2); // збільшили амплітуду

            fogFactor = clamp(fogFactor, 0.0, 1.0); // обмежуємо [0,1]

            gl_FragColor = vec4(uColor, fogFactor * 0.8);
        }
    `
});

const fogMesh = new THREE.Mesh(fogGeometry, fogMaterial);
fogMesh.rotation.x = - Math.PI / 2;
fogMesh.position.y = 0.2;
scene.add(fogMesh);

/**
 * Lights
 */
// Ambient light
const ambientLight = new THREE.AmbientLight('#ffffff', 0.5)
scene.add(ambientLight)

// Directional light
const directionalLight = new THREE.DirectionalLight('#ffffff', 1.5)
directionalLight.position.set(3, 2, -8)
scene.add(directionalLight)

//tower lights
const pointLight1 = new THREE.PointLight('#ffffff', 1, 5)
pointLight1.position.set(0, 1, 0)
scene.add(pointLight1)

const pointLight2 = new THREE.PointLight('#ffffff', 1, 5)
pointLight2.position.set(0, 2, 0)
scene.add(pointLight2)

const pointLight3 = new THREE.PointLight('#ffffff', 1, 5)
pointLight3.position.set(0, 3, 0)
scene.add(pointLight3)

const pointLight4 = new THREE.PointLight('#ffffff', 1, 5)
pointLight4.position.set(0, 4, 0)
scene.add(pointLight4)

const pointLight5 = new THREE.PointLight('#ffffff', 1, 5)
pointLight5.position.set(0, 5, 0)
scene.add(pointLight5)


//Walls
const wallGeometry = new THREE.BoxGeometry(8, 0.5, 0.1)
const wallMesh1 = new THREE.Mesh(wallGeometry, wallMaterialTextured)
wallMesh1.position.set(0, 0.25, -4)
scene.add(wallMesh1)

const wallMesh2 = new THREE.Mesh(wallGeometry, wallMaterialTextured)
wallMesh2.position.set(0, 0.25, 4)
scene.add(wallMesh2)

const wallGeometrySide = new THREE.BoxGeometry(0.1, 0.5, 8)
const wallMesh3 = new THREE.Mesh(wallGeometrySide, wallMaterialTextured)
wallMesh3.position.set(-4, 0.25, 0)
scene.add(wallMesh3)

const wallMesh4 = new THREE.Mesh(wallGeometrySide, wallMaterialTextured)
wallMesh4.position.set(4, 0.25, 0)
scene.add(wallMesh4)



/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Particles
 */
//сніг через частинки
const particleSnowTexture = textureLoader.load(
  "/particles/winter_1146899.png"
);
const particlesCount = 1000
const particlesGeometry = new THREE.BufferGeometry()
const positions = new Float32Array(particlesCount * 3)

for(let i = 0; i < particlesCount; i++)
{
    positions[i * 3 + 0] = (Math.random() - 0.5) * 8 //x
    positions[i * 3 + 1] = Math.random() * 5         //y
    positions[i * 3 + 2] = (Math.random() - 0.5) * 8 //z
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

const particlesMaterial = new THREE.PointsMaterial({
    size: 0.05,
    sizeAttenuation: true,
    alphaMap: particleSnowTexture,
    transparent: true,
    depthWrite: false
})
const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial)
scene.add(particlesMesh)

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 4
camera.position.y = 2
camera.position.z = 5
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

controls.minDistance = 2       
controls.maxDistance = 4      

controls.maxPolarAngle = Math.PI / 2.2   
controls.minPolarAngle = 0.1             

controls.target.set(0, 0.14, 0) 
controls.update()

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Sounds setup with lil-gui
 */
const audioListener = new THREE.AudioListener();
camera.add(audioListener);

const emperorAudio = new THREE.PositionalAudio(audioListener);
let isAudioLoaded = false;
let audioStarted = false;

const soundFolder = gui.addFolder("Sound");

// --- 1. Об'єкт для контролерів lil-gui ---
const volumeControl = {
    // Встановлюємо початкову гучність
    volume: 2
};

const soundControls = {
    // Список доступних звуків (відображувана назва: шлях до файлу)
    currentSound: "/music/Cristmas.mp3", // Початкове значення
    sounds: {
        "Christmas Song 1": "/music/Cristmas.mp3",
        "Christmas Song 2 (Last Christmas)": "/music/LastChristmas.mp3"
    },

    /**
     * Завантажує та змінює поточний аудіофайл
     */
    changeSound: function() {
        if (emperorAudio.isPlaying) {
            emperorAudio.stop();
        }
        
        // Встановлюємо isAudioLoaded на false, поки не завантажиться новий буфер
        isAudioLoaded = false; 

        // Завантажуємо новий аудіофайл
        audioLoader.load(soundControls.currentSound, (buffer) => {
            emperorAudio.setBuffer(buffer);
            emperorAudio.setLoop(true);
            
            // Встановлюємо гучність з контролера GUI
            emperorAudio.setVolume(volumeControl.volume); 
            
            isAudioLoaded = true;

            scene.add(emperorAudio); // Додаємо до сцени, якщо не було додано

            // Якщо аудіо вже було запущено, запускаємо його знову
            if (audioStarted) {
                if (audioListener.context.state === "suspended") {
                    audioListener.context.resume();
                }
                emperorAudio.play();
            }
        },
        // Обробник прогресу (залишаємо для прикладу)
        () => {
            // console.log('Audio loading progress...');
        },
        // Обробник помилок завантаження
        (error) => {
            console.error('Error loading audio:', error);
        });
    }
};

// Завантажуємо початковий звук при старті
soundControls.changeSound();


// --- 2. Функція для першого запуску звуку (через інтеракцію) ---
const startAudio = () => {
    if (isAudioLoaded && !audioStarted) {
        // Розблокування контексту аудіо (необхідно у більшості браузерів)
        if (audioListener.context.state === "suspended") {
            audioListener.context.resume();
        }

        emperorAudio.play();
        audioStarted = true;

        // Видаляємо слухачів після першого запуску
        window.removeEventListener("click", startAudio);
        window.removeEventListener("touchend", startAudio);
    }
};

// Додаємо слухачів для запуску (перший клік/дотик)
window.addEventListener("click", startAudio);
window.addEventListener("touchend", startAudio);


// --- 3. Контролери lil-gui ---

// Контролер вибору аудіо
soundFolder
    .add(soundControls, 'currentSound', soundControls.sounds)
    .name('Select Audio')
    .onChange(() => {
        soundControls.changeSound();
    });

// Контролер гучності (виправлення помилки: використовуємо допоміжний об'єкт volumeControl)
soundFolder
    .add(volumeControl, 'volume', 0, 5, 0.1) 
    .name('Volume')
    .onChange((value) => {
        // Оновлюємо гучність безпосередньо через метод PositionalAudio
        emperorAudio.setVolume(value);
    });

// Контролер відтворення/паузи
const playbackControl = {
    togglePlayback: () => {
        if (emperorAudio.isPlaying) {
            emperorAudio.pause();
        } else {
            // Перевіряємо, чи був звук запущений хоча б раз, щоб не порушувати правила браузера
            if (isAudioLoaded) {
                startAudio(); // Перевіряє, чи audioStarted, і відтворює
            }
        }
    }
};

soundFolder.add(playbackControl, 'togglePlayback').name('Play / Pause');
/**
 * Animate
 */
const timer = new Timer()

const tick = () =>
{
    // Timer
    timer.update()
    const elapsedTime = timer.getElapsed()
    fogMaterial.uniforms.uTime.value = timer.getElapsed();
    // Update particles
    for(let i = 0; i < particlesCount; i++)
    {
        positions[i * 3 + 1] -= 0.01
        if(positions[i * 3 + 1] < 0)
        {
            positions[i * 3 + 1] = 5
        }
    }
    particlesGeometry.attributes.position.needsUpdate = true

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()