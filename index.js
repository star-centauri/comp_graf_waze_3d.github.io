// Find the latest version by visiting https://cdn.skypack.dev/three.
import * as THREE from 'https://cdn.skypack.dev/pin/three@v0.138.0-zvVD8VzksUZ5anXAslX5/mode=imports/optimized/three.js';
var scene, camera, renderer;
var meshFloor, ambientLight, light;
var exit;
var collmeshList = [];

var keyboard = {};
var player = { height: 1.8, speed: 0.2 };

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

function build () {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(90, 1280/720, 0.1, 1000);

    buildFloor();
    buildCrate();
    buildWall();
    buildExit();

    ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    light = new THREE.PointLight(0xffffff, 0.8, 18);
    light.position.set(-3, 6, -3);
    light.castShadow = true;
    light.shadow.camera.near = 0.1;
    light.shadow.camera.far = 25;
    scene.add(light);

    camera.position.set(17.5, player.height, -17.5);
    camera.lookAt(new THREE.Vector3(17.4, player.height, 0));

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(1280, 720);

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.BasicShadowMap;

    document.body.appendChild(renderer.domElement);

    animate();
}

function buildWall() {
    const createWall = (tamX, tamY, tamZ, posX, posY, posZ) => {

        let textureLoader = new THREE.TextureLoader();
        let crateTexture = textureLoader.load("texture/bush/EvergreenBush2_S.jpg");
        let crateNormalMap = textureLoader.load("texture/bush/EvergreenBush2_N.jpg");
    
        crateTexture.wrapS = crateTexture.wrapT = THREE.RepeatWrapping;
        crateTexture.repeat.set( 15, 10 );
    
        crateNormalMap.wrapS = crateNormalMap.wrapT = THREE.RepeatWrapping;
        crateNormalMap.repeat.set( 20, 20 );
    
        var crate = new THREE.Mesh(
            new THREE.BoxGeometry(tamX, tamY, tamZ),
            new THREE.MeshPhongMaterial({ 
                color: 0xffffff, 
                wireframe: false,
                map: crateTexture,
                normalMap: crateNormalMap 
            })
        );
    
        scene.add(crate);
        collmeshList.push(crate);
        crate.position.set(posX, posY, posZ);
        crate.receiveShadow = true;
        crate.castShadow = true;
    }
    
    // Paredes laterais
    createWall(0.5, 10, 40, 20, 3/2, 0);
    createWall(0.5, 10, 40, -20, 3/2, 0);
    createWall(40, 10, 0.5, 0, 3/2, 20);
    createWall(40, 10, 0.5, 0, 3/2, -20);

    //Paredes do labirinto
    createWall(0.5, 10, 30, 15, 3/2, -5);
    createWall(20, 10, 0.5, 10, 3/2, 15);
    createWall(0.5, 10, 30, 10, 3/2, 0.3);
    createWall(25, 10, 0.5, -2.6, 3/2, 0);
    createWall(0.5, 10, 5, 5, 3/2, -17.5);
    createWall(20, 10, 0.5, -4.6, 3/2, -15);
    createWall(25, 10, 0.5, -8, 3/2, -10);
    createWall(25, 10, 0.5, -8, 3/2, 10);
    createWall(0.5, 10, 5, -10, 3/2, 12.5);
    createWall(0.5, 10, 5, -6, 3/2, 7.5);
}

function buildFloor () {
    let groundTexture = new THREE.TextureLoader().load("texture/floor.png");
    groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
    groundTexture.repeat.set( 20, 20 );

    meshFloor = new THREE.Mesh(
        new THREE.PlaneGeometry(40, 40, 40, 40),
        new THREE.MeshPhongMaterial({ 
            color: 0xffffff, 
            wireframe: false,
            map: groundTexture
        })
    );

    meshFloor.rotation.x -= Math.PI / 2;
    meshFloor.receiveShadow = true;
    scene.add(meshFloor);
}

function buildCrate () {
    let textureLoader = new THREE.TextureLoader();
    let crateTexture = textureLoader.load("texture/crate0/crate0_diffuse.png");
    let crateBumpMap = textureLoader.load("texture/crate0/crate0_bump.png");
    let crateNormalMap = textureLoader.load("texture/crate0/crate0_normal.png");

    var crate = new THREE.Mesh(
        new THREE.BoxGeometry(3, 3, 3),
        new THREE.MeshPhongMaterial({ 
            color: 0xffffff, 
            map: crateTexture, 
            bumpMap: crateBumpMap,
            normalMap: crateNormalMap 
        })
    );

    scene.add(crate);
    collmeshList.push(crate);
    crate.position.set(2.5, 3/2, 2.5);
    crate.receiveShadow = true;
    crate.castShadow = true;
}

function buildExit() {
    let textureLoader = new THREE.TextureLoader();
    let crateTexture = textureLoader.load("texture/exit.png");

    exit = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 1, 3),
        new THREE.MeshPhongMaterial({ 
            color: 0xffffff, 
            map: crateTexture
        })
    );

    scene.add(exit);
    exit.position.set(16, 2, 17.5);
    exit.receiveShadow = true;
    exit.castShadow = true;
}

function animate () {
    requestAnimationFrame(animate);

    exit.rotation.y += 0.03;

    //console.log(keyboard);
    if( keyboard["front"] ) {
        camera.position.x -= Math.sin(camera.rotation.y) * 1.5;
        camera.position.z -= -Math.cos(camera.rotation.y) * 1.5;
        keyboard["front"] = false;
    }

    if ( keyboard["right"] ) {
        camera.rotation.y += 90 * THREE.Math.DEG2RAD;
        keyboard["right"] = false;
    }
    
    if ( keyboard["left"] ) {
        camera.rotation.y -= 90 * THREE.Math.DEG2RAD;
        keyboard["left"] = false;
    }

    if( keyboard[38] ) { //up key
        camera.position.x -= Math.sin(camera.rotation.y) * player.speed;
        camera.position.z -= -Math.cos(camera.rotation.y) * player.speed;
    }

    if( keyboard[40] ) { //down key
        camera.position.x += Math.sin(camera.rotation.y) * player.speed;
        camera.position.z += -Math.cos(camera.rotation.y) * player.speed;
    }

    if( keyboard[37] ) { //left arrow
        camera.rotation.y -= Math.PI * 0.01;
    }
    if( keyboard[39] ) { //right arrow
        camera.rotation.y += Math.PI * 0.01;
    }

    renderer.render(scene, camera);
}

function keyDown(event) {
    keyboard[event.keyCode] = true;
}

function keyUp(event) {
    keyboard[event.keyCode] = false;
}

function onClick (event) {
    let mouseX = event.clientX;

    pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

    if( mouseX >= 0 && mouseX <= 426 ) {
        keyboard["left"] = true;
    } 
    else if ( mouseX >= 427 && mouseX <= 852 ) {
        keyboard["front"] = true;
    }
    else if ( mouseX >= 853 && mouseX <= 1280 ) {
        keyboard["right"] = true;
    }

    raycaster.setFromCamera( pointer, camera );
    const intersects = raycaster.intersectObjects( collmeshList, true );

    if (intersects.length > 0) {
        alert("Bateu!")
    }
}

window.addEventListener('keydown', keyDown);
window.addEventListener('keyup', keyUp);
document.body.addEventListener('click', onClick);

window.onload = build;