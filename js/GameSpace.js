function GameSpace(viewPort) {
    var width = viewPort.width();
    var height = viewPort.height();
    
    var renderer = new THREE.WebGLRenderer();
    renderer.setSize(width, height);
    viewPort.append(renderer.domElement);
    
    var scene = new THREE.Scene();

    var camera = new THREE.PerspectiveCamera(70, width / height, 1, 1000);
    camera.position.z = 10;
    var controls = new THREE.OrbitControls( camera, renderer.domElement );
    scene.add(camera);

    var pointLight = new THREE.PointLight(0xFFFFFF);
    pointLight.position.y = 1000;
    pointLight.position.z = 1000;
    pointLight.intensity = 1.0;
    pointLight.distance = 10000;
    scene.add(pointLight);
    var ambientLight = new THREE.AmbientLight( 0x404040 );
    scene.add(ambientLight);
    
    var jsonLoader = new THREE.JSONLoader();

    this.camera = camera;
    this.scene = scene;
    this.renderer = renderer;
    this.viewPort = viewPort;
    this.jsonLoader = jsonLoader;
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
GameSpace.prototype.pan = function(offsetX, offsetY) {
    this.camera.position.x += offsetX;
    this.camera.position.y += offsetY;
};
GameSpace.prototype.zoom = function(offset) {
    this.camera.position.z += offset;
};
GameSpace.prototype.resetCamera = function() {
    this.camera.position.x = 0;
    this.camera.position.y = 0;
    this.camera.position.z = 10;
};
GameSpace.prototype.animate = function() {
    requestAnimationFrame(this.animate.bind(this));
    this.render();
};
GameSpace.prototype.add = function(obj) {
    this.scene.add(obj.mesh);
};
GameSpace.prototype.remove = function(obj) {
    this.scene.remove(obj.mesh);
};
GameSpace.prototype.drop = function(entity, x, y) {
    var object = this.create(entity);
}

GameSpace.prototype.create = function(entity) {

    var self = this;

    // Load mesh
    if(entity.mesh !== undefined) {
        self.jsonLoader.load(entity.mesh, function(geometry, materials) {
            var material = (materials.length == 1) ? materials[0] : new THREE.MeshFaceMaterial(materials);
            var mesh = new THREE.Mesh(geometry, material);
            self.scene.add(mesh);
        } );
    }

    // // Example object
    // var material = new THREE.MeshLambertMaterial( { color: 0xff0000 } );
    // var geometry = new THREE.BoxGeometry( 200, 200, 200 );
    // var mesh = new THREE.Mesh( geometry, material );
    // self.scene.add(mesh);
}
