function Game(renderer, width, height) {
    var self = this;

    self.renderer = renderer;
    self.scene = null;
    self.camera = null;
    self.loader = null;
    self.requestAnimationId = 0;
    self.width = width;
    self.height = height;
    self.active = false; // Whether the game is running or not
}


Game.prototype.start = function(data) {
    var self = this;

    console.log(data);

    self.scene = new THREE.Scene();
    self.loader = new THREE.JSONLoader();

    self.camera = new THREE.PerspectiveCamera(70, self.width / self.height, 1, 1000);
    self.camera.position.x = 0;
    self.camera.position.y = 0;
    self.camera.position.z = 10;
    self.scene.add(self.camera);
    var controls = new THREE.OrbitControls( self.camera, self.renderer.domElement );

    var pointLight = new THREE.PointLight(0xFF0000);
    pointLight.position.y = 1000;
    pointLight.position.z = 1000;
    pointLight.intensity = 1.0;
    pointLight.distance = 10000;
    self.scene.add(pointLight);

    var ambientLight = new THREE.AmbientLight( 0x404040 );
    self.scene.add(ambientLight);

    // Load the scene data
    console.log("loading game scene:", data.name);

    for(var i = 0; i < data.objects.length; i++) {
        var object = new ObjectGame(data.objects[i]);
    }

    self.active = true;
    self.animate();
}

Game.prototype.stop = function() {
    var self = this;

    // Remove all references to the game so it can be properly garbage collected
    self.camera = null;
    self.scene = null;
    self.loader = null;

    // Stop game loop
    cancelAnimationFrame(self.requestAnimationId);
    self.active = false;
}

Game.prototype.animate = function() {
    var self = this;

    self.requestAnimationId = requestAnimationFrame(self.animate.bind(self));
    self.renderer.render(self.scene, self.camera);
};

Game.prototype.viewResize = function(width, height) {
    var self = this;

    self.width = width;
    self.height = height;

    if(!self.active) return;

    self.camera.aspect = width / height;
    self.camera.updateProjectionMatrix();
};
