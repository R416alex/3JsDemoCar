import * as THREE from 'three';
import {OBJLoader} from 'three/addons/loaders/OBJLoader.js';
import {MTLLoader} from 'three/addons/loaders/MTLLoader.js';

let controls = [];
let turnAngle = -Math.PI / 2;
let camTheta = Math.PI;
let camPhi = Math.PI / 3;
let camDistance = 75;

const renderer = new THREE.WebGLRenderer();
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.shadowMapBias = 0.0005;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

const scene = new THREE.Scene();
makeScene();
const car = makeCar();
scene.add(car);


let clock = new THREE.Clock(false);
clock.start();
function animate() {
    requestAnimationFrame(animate);
    checkControls();
    car.rotation.y = turnAngle;
    camera.position.set(car.position.x + (Math.sin(camPhi) * Math.cos(camTheta - turnAngle) * camDistance), Math.cos(camPhi) * camDistance, car.position.z + (Math.sin(camPhi) * Math.sin(camTheta - turnAngle) * camDistance));
    camera.lookAt(car.position);
    renderer.render(scene, camera);
}
animate();

function makeScene() {
    const moonlight = new THREE.DirectionalLight(0xc2c5cc, 0.3);
    moonlight.position.set(-100, 150, 100);
    moonlight.castShadow = true;
    moonlight.shadow.camera.top = 350;
    moonlight.shadow.camera.bottom = -350;
    moonlight.shadow.camera.left = 350;
    moonlight.shadow.camera.right = -350;
    moonlight.shadow.mapSize.height = 1024;
    moonlight.shadow.mapSize.width = 1024;
    scene.add(moonlight);
    scene.add(moonlight.target);

    const ambientLight = new THREE.AmbientLight(0xc2c5cc, 0.1);
    scene.add(ambientLight);

    const bumpmap = new THREE.TextureLoader().load('/bumpMap.png');
    let texture = new THREE.TextureLoader().load('/Texture.png');
    let geometry = new THREE.PlaneGeometry(500, 500);
    geometry.rotateX(Math.PI / 180 * 90);
    let material = new THREE.MeshPhongMaterial({side: THREE.DoubleSide, map: texture, bumpMap: bumpmap, shininess: 0});
    const ground = new THREE.Mesh(geometry, material);
    ground.receiveShadow = true;
    scene.add(ground);

    scene.background = new THREE.CubeTextureLoader().setPath('skyBox/').load([
		'skyBox4.png',
		'skyBox2.png',
		'skyBox3.png',
		'skyBox5.png',
		'skyBox6.png',
		'skyBox1.png'
	]);

    let lightPost1 = getLamp();
    lightPost1.position.set(0, lightPost1.position.y, 160);
    scene.add(lightPost1);
    let lightPost2 = getLamp();
    lightPost2.position.set(166, lightPost2.position.y, 160);
    scene.add(lightPost2);
    let lightPost3 = getLamp();
    lightPost3.position.set(-166, lightPost2.position.y, 160);
    scene.add(lightPost3);

    for (let i = 0; i < 35; i++) {
        let tree = getTree();
        tree.position.setZ(Math.random() * (75 + 250) - 250)
        tree.position.setX(Math.random() * (-45 + 250) - 250);
        scene.add(tree);
    }
    for (let i = 0; i < 20; i++) {
        let tree = getTree();
        tree.position.setZ(Math.random() * (170 - 250) + 250)
        tree.position.setX(Math.random() * (250 + 250) - 250);
        scene.add(tree);
    }
    for (let i = 0; i < 20; i++) {
        let tree = getTree();
        tree.position.setZ(Math.random() * (-40 + 250) - 250);
        tree.position.setX(Math.random() * (250 - 45) + 45);
        scene.add(tree);
    }

    const loader = new MTLLoader();
    loader.load('house/house.mtl',
        function(mat) {
            mat.side = THREE.DoubleSide;
            mat.preload();
            const objLoader = new OBJLoader();
            objLoader.setMaterials(mat);
            objLoader.load(
                'house/house.obj',
                function(object) {
                    object.scale.set(0.7, 0.7, 0.7);
                    object.position.set(250, 0, 40);
                    object.rotateY(-0.15 + Math.PI);
					object.traverse(function(node){
						if(node.isMesh){
							node.castShadow = true;
                            node.receiveShadow = true;
						}
					})
					console.log();
                    scene.add(object);
                });
        });
}

function makeCar() {
    let car = new THREE.Group();
    let geometry = new THREE.BoxGeometry(19, 4, 9);
    let material = new THREE.MeshPhongMaterial({color: 0xff0000});
    const carBody = new THREE.Mesh(geometry, material);
    carBody.castShadow = true;
    carBody.receiveShadow = true;
    car.add(carBody);

    const roofVerts = [
		1, 0, 1, 1, 0, -1, -1, 0, -1, -1, 0, 1,
   		1, 1, 0.5, 1, 1, -0.5, -1, 1, -0.5, -1, 1, 0.5,
	];
    const roofIndices = [
		0, 2, 1, 0, 3, 2,
		0, 4, 7, 0, 7, 3,
		0, 1, 5, 0, 5, 4,
		1, 2, 5, 2, 6, 5,
		2, 7, 6, 2, 3, 7,
		4, 5, 6, 4, 6, 7
	];

    geometry = new THREE.PolyhedronGeometry(roofVerts, roofIndices, 6, 0);
    material = new THREE.MeshPhongMaterial({color: 0xff0000});
    const carRoof = new THREE.Mesh(geometry, material);
    carRoof.castShadow = true;
    carRoof.receiveShadow = true;
    carRoof.translateY(carBody.geometry.parameters.height / 2);
    carRoof.rotateY(Math.PI / 180 * 90);
    car.add(carRoof);

    geometry = new THREE.CylinderGeometry(1.75, 1.75, 1, 20, 32);
    material = new THREE.MeshPhongMaterial({color: 0x000000});
    const wheel1 = new THREE.Mesh(geometry, material);
    wheel1.castShadow = true;
    wheel1.rotateX(Math.PI / 180 * 90);
    wheel1.position.set(6.4, -1.1, carBody.geometry.parameters.depth / 2 + 0.25);
    car.add(wheel1);

    const wheel2 = wheel1.clone();
    wheel2.position.set(6.4, -1.1, -carBody.geometry.parameters.depth / 2 - 0.25)
    car.add(wheel2);

    const wheel3 = wheel1.clone();
    wheel3.position.set(-6.4, -1.1, -carBody.geometry.parameters.depth / 2 - 0.25)
    car.add(wheel3);

    const wheel4 = wheel1.clone();
    wheel4.position.set(-6.4, -1.1, carBody.geometry.parameters.depth / 2 + 0.25)
    car.add(wheel4);

    const leftHeadlight = new THREE.SpotLight(0xf9f4d9, 5, 200, Math.PI / 180 * 45, 0.25, 1);
    leftHeadlight.castShadow = true;
    leftHeadlight.position.set(10, 0.2, 2.5);
    leftHeadlight.target.position.set(20, 0.2, 2.5);
    leftHeadlight.name = "leftHeadLight";
    car.add(leftHeadlight);
    car.add(leftHeadlight.target);

    const rightHeadlight = leftHeadlight.clone();
    rightHeadlight.castShadow = true;
    rightHeadlight.position.setZ(-2.5);
    rightHeadlight.target.position.setZ(-2.5);
    rightHeadlight.name = "rightHeadLight";
    car.add(rightHeadlight);
    car.add(rightHeadlight.target);

    geometry = new THREE.CylinderGeometry(1, 1, 0.25);
    material = new THREE.MeshPhongMaterial({color: 0xffffffff, emissive: 0xeedd82, emissiveIntensity: 1});
    let leftHeadBox = new THREE.Mesh(geometry, material);
    leftHeadBox.castShadow = true;
    leftHeadBox.receiveShadow = true;
    leftHeadBox.name = "leftHeadBox";
    leftHeadBox.rotateZ(Math.PI / 2);
    leftHeadBox.position.set(9.5, 0.2, -2.5)
    car.add(leftHeadBox);

    geometry = new THREE.CylinderGeometry(1, 1, 0.25);
    material = new THREE.MeshPhongMaterial({color: 0xffffff, emissive: 0xeedd82, emissiveIntensity: 1});
    let rightHeadBox = new THREE.Mesh(geometry, material);
    rightHeadBox.castShadow = true;
    rightHeadBox.receiveShadow = true;
    rightHeadBox.name = "rightHeadBox";
    rightHeadBox.rotateZ(Math.PI / 2);
    rightHeadBox.position.set(9.5, 0.2, 2.5)
    car.add(rightHeadBox);

    const leftTailLight = new THREE.SpotLight(0xff0000, 0, 200, Math.PI / 180 * 80, 0.25, 1);
    leftTailLight.castShadow = true;
    leftTailLight.position.set(-10, 0.2, -2.5);
    leftTailLight.target.position.set(-20, 0.2, -2.5);
    leftTailLight.name = "leftTailLight";
    car.add(leftTailLight);
    car.add(leftTailLight.target);

    const rightTailLight = leftTailLight.clone();
    rightTailLight.castShadow = true;
    rightTailLight.position.set(-10, 0.2, 2.5);
    rightTailLight.target.position.set(-20, 0.2, 2.5);
    rightTailLight.name = "rightTailLight";
    car.add(rightTailLight);
    car.add(rightTailLight.target);

    geometry = new THREE.CylinderGeometry(1, 1, 0.25);
    material = new THREE.MeshPhongMaterial({color: 0xff0000, emissive: 0xff0000, emissiveIntensity: 0});
    let leftTailBox = new THREE.Mesh(geometry, material);
    leftTailBox.castShadow = true;
    leftTailBox.receiveShadow = true;
    leftTailBox.name = "leftTailBox";
    leftTailBox.rotateZ(Math.PI / 2);
    leftTailBox.position.set(-9.5, 0.2, -2.5)
    car.add(leftTailBox);

    geometry = new THREE.CylinderGeometry(1, 1, 0.25);
    material = new THREE.MeshPhongMaterial({color: 0xff0000, emissive: 0xff0000, emissiveIntensity: 0});
    let rightTailBox = new THREE.Mesh(geometry, material);
    rightTailBox.castShadow = true;
    rightTailBox.receiveShadow = true;
    rightTailBox.name = "rightTailBox";
    rightTailBox.rotateZ(Math.PI / 2);
    rightTailBox.position.set(-9.50, 0.2, 2.5)
    car.add(rightTailBox);

    car.castShadow = true;
    car.receiveShadow = true;
    car.scale.set(1.5, 1.5, 1.5);
    car.translateY(4.5);
    car.translateZ(-200);

    return car;
}

function getLamp() {
    let geometry = new THREE.CylinderGeometry(0.5, 0.5, 25, 20, 32);
    let material = new THREE.MeshPhongMaterial({color: 0x585858});
    const post = new THREE.Mesh(geometry, material);
    post.receiveShadow = true;
    post.castShadow = true;

    geometry = new THREE.SphereGeometry(2, 32, 16);
    material = new THREE.MeshPhongMaterial({color: 0xffe692, transparent: true, emissive: 0xffe692, shadowSide: THREE.FrontSide});
    const lightSphere = new THREE.Mesh(geometry, material);
    lightSphere.translateY((post.geometry.parameters.height / 2) + (lightSphere.geometry.parameters.radius));
    lightSphere.receiveShadow = true;
    lightSphere.castShadow = true;

    const light = new THREE.PointLight(0xffe692, 2, 100, 1);
    light.position.set(0, (post.geometry.parameters.height / 2) + (lightSphere.geometry.parameters.radius / 2), 0);
    light.castShadow = true;
    const lightPost = new THREE.Group();
    lightPost.add(post);
    lightPost.add(lightSphere);
    lightPost.add(light);
    lightPost.position.set(0, post.geometry.parameters.height / 2, 0);
    return lightPost;
}

function getTree() {
    const tree = new THREE.Group();

    let levels = Math.floor(Math.random() * (4 - 2 + 1) + 2);
    let trunkHeight = Math.random() * (15 - 7) + 7;
    let trunkRadius = Math.random() * (3 - 2) + 2;
    let coneHeight = Math.random() * (15 - 8) + 8;

    let geometry = new THREE.CylinderGeometry(trunkRadius, trunkRadius, trunkHeight, 20, 32);
    let material = new THREE.MeshPhongMaterial({color: 0x94633b, shininess: 0});
    const trunk = new THREE.Mesh(geometry, material);
    trunk.name = 'trunk';
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    trunk.position.setY(trunkHeight / 2);
    tree.add(trunk);

    material = new THREE.MeshPhongMaterial({color: 0x135c12, shininess: 0});
    let cone;
    for (let i = 1; i <= levels; i++) {
        geometry = new THREE.ConeGeometry(levels * Math.exp(-0.5 * i) * 6, coneHeight, 32);
        cone = new THREE.Mesh(geometry, material);
        cone.castShadow = true;
        cone.receiveShadow = true;
        cone.shadowSide = THREE.FrontSide;
        cone.name = `cone${i}`;
        let height = trunkHeight - coneHeight / 2 + (coneHeight * i) - (i * coneHeight * 0.25);
        cone.position.setY(height);
        tree.add(cone);
    }
    return tree;
}

function checkControls() {
    let delta = clock.getDelta();
    if (controls[0] && controls[2]) {
        turnAngle += 0.015*delta/0.00694;
    }
    if (controls[0] && controls[3]) {
        turnAngle -= 0.015*delta/0.00694;
    }
    if (controls[1] && controls[2]) {
        turnAngle += 0.015*delta/0.00694;
    }
    if (controls[1] && controls[3]) {
        turnAngle -= 0.015*delta/0.00694;
    }
    if (controls[0]) {
        car.translateX(0.7*delta/0.00694);
    }
    if (controls[1]) {
        car.translateX(-0.7*delta/0.00694);
    }
    if (controls[6]) {
        camTheta += 0.015*delta/0.00694;
    }
    if (controls[7]) {
        camTheta -= 0.015*delta/0.00694;
    }
    if (controls[5]) {
        camPhi += 0.015*delta/0.00694;
    }
    if (controls[4]) {
        camPhi -= 0.015*delta/0.00694;
    }
    if (controls[8]) {
        camDistance += 0.4*delta/0.00694;
    }
    if (controls[9]) {
        camDistance -= 0.4*delta/0.00694;
    }

}

document.onkeydown = function(ev) {
    switch (ev.code) {
        case "KeyW":
            controls[0] = true;
            break;
        case "KeyS":
            controls[1] = true;
            car.getObjectByName("leftTailLight").intensity = 2;
            car.getObjectByName("rightTailLight").intensity = 2;
            car.getObjectByName("leftTailBox").material.emissiveIntensity = 1;
            car.getObjectByName("rightTailBox").material.emissiveIntensity = 1;
            break;
        case "KeyA":
            controls[2] = true;
            break;
        case "KeyD":
            controls[3] = true;
            break;
        case "ArrowUp":
            controls[4] = true;
            break;
        case "ArrowDown":
            controls[5] = true;
            break;
        case "ArrowLeft":
            controls[6] = true;
            break;
        case "ArrowRight":
            controls[7] = true;
            break;
        case "KeyQ":
            controls[8] = true;
            break;
        case "KeyE":
            controls[9] = true;
            break;
        case "KeyR":
            camDistance = 75;
            camPhi = Math.PI / 3;
            camTheta = Math.PI;
            break;
    }
}

document.onkeyup = function(ev) {
    switch (ev.code) {
        case "KeyW":
            controls[0] = false;
            break;
        case "KeyS":
            controls[1] = false;
            car.getObjectByName("leftTailLight").intensity = 0;
            car.getObjectByName("rightTailLight").intensity = 0;
            car.getObjectByName("leftTailBox").material.emissiveIntensity = 0;
            car.getObjectByName("rightTailBox").material.emissiveIntensity = 0;
            break;
        case "KeyA":
            controls[2] = false;
            break;
        case "KeyD":
            controls[3] = false;
            break;
        case "ArrowUp":
            controls[4] = false;
            break;
        case "ArrowDown":
            controls[5] = false;
            break;
        case "ArrowLeft":
            controls[6] = false;
            break;
        case "ArrowRight":
            controls[7] = false;
            break;
        case "KeyQ":
            controls[8] = false;
            break;
        case "KeyE":
            controls[9] = false;
            break;
        case "KeyL":
            if (car.getObjectByName("leftHeadLight").intensity != 0) {
                car.getObjectByName("leftHeadLight").intensity = 0;
                car.getObjectByName("rightHeadLight").intensity = 0;
                car.getObjectByName("leftHeadBox").material.emissiveIntensity = 0;
                car.getObjectByName("rightHeadBox").material.emissiveIntensity = 0;
            } else {
                car.getObjectByName("leftHeadLight").intensity = 6;
                car.getObjectByName("rightHeadLight").intensity = 6;
                car.getObjectByName("leftHeadBox").material.emissiveIntensity = 1;
                car.getObjectByName("rightHeadBox").material.emissiveIntensity = 1;
            }
    }
}