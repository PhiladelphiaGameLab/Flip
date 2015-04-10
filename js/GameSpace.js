function GameSpace(viewPort) {
	var width = viewPort.width();
	var height = viewPort.height();
	
	var camera = new THREE.PerspectiveCamera(70, width / height, 1, 1000);
    camera.position.z = 400;
	
	var scene = new THREE.Scene();
	scene.add(camera);
	
	var renderer = new THREE.WebGLRenderer();
	renderer.setSize(width, height);
	renderer.shadowMapEnabled = true;
	viewPort.append(renderer.domElement);
	
	var pointLight = new THREE.PointLight(0xFFFFFF);
	pointLight.position.y = 1000;
	pointLight.position.z = 1000;
	pointLight.intensity = 1.0;
	pointLight.distance = 10000;
	scene.add(pointLight);
	
	var crateGeometry = new THREE.BoxGeometry(200, 200, 200);
	var crateTexture = THREE.ImageUtils.loadTexture('data/textures/crate.gif');
	crateTexture.anisotropy = renderer.getMaxAnisotropy();
	var crateMaterial = new THREE.MeshBasicMaterial( { map: crateTexture } );

    var crate = new THREE.Mesh(crateGeometry, crateMaterial);
    scene.add(crate);
	
	this.camera = camera;
	this.scene = scene;
	this.renderer = renderer;
	this.viewPort = viewPort;
	this.crate = crate;
}
GameSpace.prototype.render = function() {
	this.renderer.render(this.scene, this.camera);
};
GameSpace.prototype.onViewResize = function() {
	var width = this.viewPort.width();
	var height = this.viewPort.height();
	this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
};
GameSpace.prototype.animate = function() {
    requestAnimationFrame(this.animate.bind(this));
    this.crate.rotation.x += 0.005;
    this.crate.rotation.y += 0.01;
    this.render();
};
GameSpace.prototype.add = function(obj) {
	this.scene.add(obj.mesh);
};
GameSpace.prototype.remove = function(obj) {
	this.scene.remove(obj.mesh);
};