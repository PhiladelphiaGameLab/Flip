var game = null;

function Game(renderer, width, height, inputHandler) {
    var self = this;

    self.renderer = renderer;
    self.scene = null;
    self.camera = null;
    self.loader = null;
    self.cameraControls = null;
    self.inputHandler = inputHandler;
    self.objectsLoaded = 0;
    self.objectsToLoad = 0;
    self.skyboxEnabled = false;
    self.skyboxCamera = null;
    self.skyboxScene = null;
    self.skyboxMesh = null;
    self.requestAnimationId = 0;
    self.width = width;
    self.height = height;
    self.active = false; // Whether the game is running or not

    game = this;
}


Game.prototype.start = function(data) {
    var self = this;

    console.log(data);

    //self.scene = new THREE.Scene();
    self.scene = new Physijs.Scene();
    self.loader = new THREE.JSONLoader();

    self.camera = new THREE.PerspectiveCamera(70, self.width / self.height, 1, 1000);
    self.camera.position.x = 0;
    self.camera.position.y = 0;
    self.camera.position.z = 10;
    self.scene.add(self.camera);

    self.cameraControls = new CameraControls(self.camera);

    // Load the scene data
    console.log("loading game scene:", data.name);

    // Load objects
    var objectsToLoad = data.objects.length;
    for(var i = 0; i < data.objects.length; i++) {
        var object = new ObjectGame(data.objects[i]);
    }

    // Load scripts
    for(var i = 0; i < data.scripts.length; i++) {
        var script = document.createElement("script");
        script.innerHTML = data.scripts[i].contents;
        script.className = "game-script";
        document.body.appendChild(script);
    }

    // Set ambient color
    var ambientLight = new THREE.AmbientLight(data.ambientColor);
    self.scene.add(ambientLight);

    // Set background color
    self.renderer.setClearColor(data.backgroundColor, 1);
    self.renderer.autoClear = true;

    // Load skybox
    if(data.skybox.url != "") {
        
        // Load image
        var path = data.skybox.url;
        var format = '.jpg';
        var urls = [
            path + 'px' + format, path + 'nx' + format,
            path + 'py' + format, path + 'ny' + format,
            path + 'pz' + format, path + 'nz' + format
        ];

        // TO-DO: does threejs cache the image in case you load the same skybox again?
        var skyboxTexture = THREE.ImageUtils.loadTextureCube(urls);
        self.skyboxCamera = new THREE.PerspectiveCamera( 70, self.width / self.height, 1, 1000 );
        self.skyboxScene = new THREE.Scene();
        self.skyboxEnabled = true;
        self.renderer.autoClear = false;

        var shader = THREE.ShaderLib[ "cube" ];
        shader.uniforms["tCube"].value = skyboxTexture;
        var skyboxMat = new THREE.ShaderMaterial({
            fragmentShader: shader.fragmentShader,
            vertexShader: shader.vertexShader,
            uniforms: shader.uniforms,
            depthWrite: false,
            side: THREE.BackSide
        });

        self.skyboxMesh = new THREE.Mesh( new THREE.BoxGeometry( 100, 100, 100 ), skyboxMat );
        self.skyboxScene.add(self.skyboxMesh);
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
    $(".game-script").remove(); // Remove user-created scripts from the DOM

}

Game.prototype.animate = function() {
    var self = this;
    self.requestAnimationId = requestAnimationFrame(self.animate.bind(self));
    self.render();
    self.update();
};

Game.prototype.render = function() {
    var self = this;

    if(self.skyboxEnabled) {
        self.skyboxCamera.rotation.copy(self.camera.rotation);
        self.renderer.render(self.skyboxScene, self.skyboxCamera);
    }

    self.renderer.render(self.scene, self.camera);
    self.scene.simulate();
}

Game.prototype.update = function() {
    var self = this;

    if(self.inputHandler.isKeyDown(87)) { // w
        self.cameraControls.zoom(1);
    }

    if(self.inputHandler.isKeyDown(65)) { // a
        self.cameraControls.pan(2, 0);
    }

    if(self.inputHandler.isKeyDown(83)) { // s
        self.cameraControls.zoom(-1);
    }

    if(self.inputHandler.isKeyDown(68)) { // d
        self.cameraControls.pan(-2, 0);
    }
}

Game.prototype.onViewResize = function(width, height) {
    var self = this;

    self.width = width;
    self.height = height;

    if(!self.active) return;

    self.camera.aspect = width / height;
    self.camera.updateProjectionMatrix();

    if(self.skyboxEnabled) {
        self.skyboxCamera.aspect = width / height;
        self.skyboxCamera.updateProjectionMatrix();
    }
};


Game.prototype.addObject = function(object) {
    var self = this;

    self.scene.add(object);

    self.objectsLoaded++;
    if(self.objectsLoaded == self.objectsToLoad) {
        loadFinished();
    }
}

Game.prototype.loadFinished = function() {

    console.log("load finished");

    // Need to update all the materials to account for the added lights
    for(var i = 0; i < self.scene.children.length; i++) {
        var material = self.scene.children[i].material;
        if(!material) continue;
        if(material.type == "MeshFaceMaterial") {
            for(var j = 0; j < material.materials; j++) {
                material.materials[j].needsUpdate = true;
            }
        } else {
            material.needsUpdate = true;
        }
    }
}

// User Input events
Game.prototype.onClick = function(x, y) {
    console.log("click:", x, y);
}

Game.prototype.onKeyDown = function(keyCode, ctrl) {
    console.log("key down:", keyCode);
}

Game.prototype.onMouseMove = function(x, y, xmove, ymove, mouseButton) {
    var self = this;
    if(mouseButton == 1) { // left button
        self.cameraControls.rotate(xmove, ymove);
    } else if(mouseButton == 2) { // middle button
        self.cameraControls.pan(xmove, ymove)
    } else if(mouseButton == 3) { // right button
        self.cameraControls.pan(xmove, ymove);
    }
}

Game.prototype.onScroll = function(scroll) {
    var self = this;
    self.cameraControls.zoom(scroll);
}
