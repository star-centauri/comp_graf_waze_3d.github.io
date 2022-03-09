// Find the latest version by visiting https://cdn.skypack.dev/three.
import * as THREE from 'https://cdn.skypack.dev/pin/three@v0.138.0-zvVD8VzksUZ5anXAslX5/mode=imports/optimized/three.js';
//import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
//import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';

var scene, camera, renderer, raycaster;
var meshFloor, ambientLight, light;
var exit;
var collmeshList = [];
var stop = false;

var keyboard = {};
var player = { height: 1.8, speed: 0.2 };

var pointer = new THREE.Vector2();

function build () {
    renderer = new THREE.WebGLRenderer(); //Renderização WebGL
    scene = new THREE.Scene(); // Cena
    camera = new THREE.PerspectiveCamera(90, 1280/720, 0.1, 1000); // Camera
    raycaster = new THREE.Raycaster(); // Colisão
    ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Luz Ambiente
    light = new THREE.PointLight(0xffffff, 0.8, 18); // Luz focal

    buildFloor();
    buildCrate();
    buildWall();
    buildExit();

    scene.add(ambientLight);

    light.position.set(-3, 6, -3);
    light.castShadow = true;
    light.shadow.camera.near = 0.1;
    light.shadow.camera.far = 25;
    scene.add(light);

    camera.position.set(17.5, player.height, -17.5);
    camera.lookAt(new THREE.Vector3(17.4, player.height, 0));

    renderer.setSize(1280, 720);

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.BasicShadowMap;

    document.body.appendChild(renderer.domElement);

    animate();
}

function buildWall() {
    const createWall = (tamX, tamY, tamZ, posX, posY, posZ, id) => {

        let textureLoader = new THREE.TextureLoader();
        let crateTexture = textureLoader.load("texture/bush/EvergreenBush2_S.jpg");
        let crateNormalMap = textureLoader.load("texture/bush/EvergreenBush2_N.jpg");
    
        crateTexture.wrapS = crateTexture.wrapT = THREE.RepeatWrapping;
        crateTexture.repeat.set( 15, 10 );
    
        crateNormalMap.wrapS = crateNormalMap.wrapT = THREE.RepeatWrapping;
        crateNormalMap.repeat.set( 20, 20 );
    
        var wall = new THREE.Mesh(
            new THREE.BoxGeometry(tamX, tamY, tamZ),
            new THREE.MeshPhongMaterial({ 
                color: 0xffffff, 
                wireframe: false,
                map: crateTexture,
                normalMap: crateNormalMap 
            })
        );
    
        scene.add(wall);
        collmeshList.push(wall);
        wall.position.set(posX, posY, posZ);
        wall.receiveShadow = true;
        wall.castShadow = true;

        wall.userData.draggable = true;
        wall.userData.name = `WALL_${id}`;
    }
    
    // Paredes laterais
    createWall(0.5, 10, 40, 20, 3/2, 0, 1);
    createWall(0.5, 10, 40, -20, 3/2, 0, 2);
    createWall(40, 10, 0.5, 0, 3/2, 20, 3);
    createWall(40, 10, 0.5, 0, 3/2, -20, 4);

    //Paredes do labirinto
    createWall(0.5, 10, 30, 15, 3/2, -5, 5);
    createWall(20, 10, 0.5, 10, 3/2, 15, 6);
    createWall(0.5, 10, 30, 10, 3/2, 0.3, 7);
    createWall(25, 10, 0.5, -2.6, 3/2, 0, 8);
    createWall(0.5, 10, 5, 5, 3/2, -17.5, 9);
    createWall(20, 10, 0.5, -4.6, 3/2, -15, 10);
    createWall(25, 10, 0.5, -8, 3/2, -10, 11);
    createWall(25, 10, 0.5, -8, 3/2, 10, 12);
    createWall(0.5, 10, 5, -10, 3/2, 12.5, 13);
    createWall(0.5, 10, 5, -6, 3/2, 7.5, 14);
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

    meshFloor.userData.ground = true
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

    crate.userData.draggable = true;
    crate.userData.name = `CRATE`;
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

    exit.userData.draggable = true;
    exit.userData.name = `EXIT`;
}

function textFim3D() {
    const loader = new THREE.FontLoader();

    loader.load( 'fonts/helvetiker_regular.typeface.json', function ( font ) {

        const geometry = new THREE.TextGeometry( 'Hello three.js!', {
            font: font,
            size: 80,
            height: 5,
            curveSegments: 12,
            bevelEnabled: true,
            bevelThickness: 10,
            bevelSize: 8,
            bevelOffset: 0,
            bevelSegments: 5
        } );

        let textMesh = new THREE.Mesh(geometry, [
            new THREE.MeshPhongMaterial({ color: 0xad4000 }), // front
            new THREE.MeshPhongMaterial({ color: 0x5c2301 }) // side
        ]);
    
        scene.add(textMesh);
        collmeshList.push(textMesh);
        textMesh.position.set(10, 2, 17.5);
        textMesh.receiveShadow = true;
        textMesh.castShadow = true;
    } );
}

function animate () {
    requestAnimationFrame(animate);

    exit.rotation.y += 0.03;

    // update the picking ray with the camera and pointer position
	raycaster.setFromCamera( new THREE.Vector2(), camera );

	// calculate objects intersecting the picking ray
	const intersects = raycaster.intersectObjects( scene.children );

	for ( let i = 0; i < intersects.length; i ++ ) {
        let existCollision = distancia2d(camera.position, intersects[ i ].object.position);
        
        if(existCollision < 1 && intersects[ i ].object.userData.name == "EXIT") {
            clearScene();
        }

        if( (existCollision <= 8 && intersects[ i ].object.userData.name == "WALL_6")
         || (existCollision <= 13.3 && intersects[ i ].object.userData.name == "WALL_4") ) {
            stop = true;
        }
	}

    //console.log(keyboard);
    if( keyboard["front"] && !stop ) {
        camera.position.x -= Math.sin(camera.rotation.y) * 1.5;
        camera.position.z -= -Math.cos(camera.rotation.y) * 1.5;
        keyboard["front"] = false;
    }

    if ( keyboard["right"] ) {
        camera.rotation.y += 90 * THREE.Math.DEG2RAD;
        keyboard["right"] = false;
        stop = false;
    }
    
    if ( keyboard["left"] ) {
        camera.rotation.y -= 90 * THREE.Math.DEG2RAD;
        keyboard["left"] = false;
        stop = false;
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

    if( mouseX >= 0 && mouseX <= 426 ) {
        keyboard["left"] = true;
        stop = false;
    } 
    else if ( mouseX >= 427 && mouseX <= 852 ) {
        keyboard["front"] = true;
    }
    else if ( mouseX >= 853 && mouseX <= 1280 ) {
        keyboard["right"] = true;
        stop = false;
    }
}

function onPointerMove( event ) {

	// calculate pointer position in normalized device coordinates
	// (-1 to +1) for both components

	pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

}

function distancia2d(point1, point2){
    var a = point2.x - point1.x;
    var b = point2.z - point1.z;
    var c = Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2));
    return c;
}

function clearScene() {
    while(scene.children.length > 0){ 
        scene.remove(scene.children[0]); 
    }

    textFim3D();
}

window.addEventListener('keydown', keyDown);
window.addEventListener('keyup', keyUp);
document.body.addEventListener('click', onClick);
window.addEventListener( 'pointermove', onPointerMove );

window.onload = build;