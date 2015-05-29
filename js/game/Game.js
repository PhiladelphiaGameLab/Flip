// global variable for ease of use
var game = null;

function Game(renderer, width, height, data) {
    var self = this;

    self.renderer = renderer;
    self.scene = null;
    self.camera = null;
    self.loader = null;
    self.cameraControls = null;

    self.objectsLoaded = 0;
    self.objectsToLoad = 0;
    self.loaded = false;

    self.skyboxEnabled = false;
    self.skyboxCamera = null;
    self.skyboxScene = null;
    self.skyboxMesh = null;

    self.width = width;
    self.height = height;
    self.active = false; // Whether the game is running or not

    self.player = null;
    self.objects = [];

    game = this;

    game.start(data);
}


Game.prototype.start = function(data) {
    var self = this;

    console.log("Loading game: " + data.name);

    //self.scene = new THREE.Scene();
    self.scene = new Physijs.Scene();
    self.loader = new THREE.JSONLoader();

    // Load objects
    self.objectsToLoad = data.objects.length;
    if(self.objectsToLoad == 0) self.loadFinished();
    for(var i = 0; i < data.objects.length; i++) {

        var objectData = data.objects[i];
        var tag = objectData.tag;
        var object = null;

        // Look at the tag to see what type of object to create
        if(tag == "player") {
            object = new Player(objectData);
        } else {
            object = new ObjectGame(objectData);
        }
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
}

Game.prototype.stop = function() {
    var self = this;

    // Remove all references to the game so it can be properly garbage collected
    self.camera = null;
    self.scene = null;
    self.loader = null;

    // Stop game loop
    self.active = false;
    $(".game-script").remove(); // Remove user-created scripts from the DOM
}

Game.prototype.render = function() {
    var self = this;
    if(!self.loaded) return;

    if(self.skyboxEnabled) {
        self.skyboxCamera.rotation.copy(self.camera.rotation);
        self.renderer.render(self.skyboxScene, self.skyboxCamera);
    }

    self.renderer.render(self.scene, self.camera);
    self.scene.simulate();
}

Game.prototype.update = function() {
    var self = this;
    if(!self.loaded) return;

    self.render();

    for(var i = 0; i < self.objects.length; i++) {
        self.objects[i].update();
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

    if(object.visual) self.scene.add(object.visual);
    self.objects.push(object);

    if(object.tag == "player") {
        self.player = object;
    }

    self.objectsLoaded++;
    if(self.objectsLoaded == self.objectsToLoad) {
        self.loadFinished();
    }
}

Game.prototype.setCamera = function(camera) {
    var self = this;
    self.camera = camera;
    self.scene.add(camera);
}

Game.prototype.loadFinished = function() {
    var self = this;
    self.loaded = true;

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

    // No camera was created with the scene, so create one now
    if(self.camera == null) {
        console.log("No camera is scene, creating observer");
        var observer = new Observer();
    }
}

// User Input events
Game.prototype.onClick = function(x, y) {
    var self = this;
    // Call events on game objects
    for(var i = 0; i < self.objects.length; i++) {
        var object = self.objects[i];
        object.onClick(x, y);
    }
}

Game.prototype.onKeyPress = function(keyCode, ctrl) {
    var self = this;
    // Call events on game objects
    for(var i = 0; i < self.objects.length; i++) {
        var object = self.objects[i];
        object.onKeyPress(keyCode);
    }
}

Game.prototype.onKeyDown = function(keyCode, ctrl) {
    var self = this;
    // Call events on game objects
    for(var i = 0; i < self.objects.length; i++) {
        var object = self.objects[i];
        object.onKeyDown(keyCode);
    }
}

Game.prototype.onMouseMove = function(x, y, xmove, ymove, mouseButton) {
    var self = this;

    // Ignore right and middle mouse buttons for now

    if(mouseButton == 1) { // Left mouse down

        // Call events on game objects
        for(var i = 0; i < self.objects.length; i++) {
            var object = self.objects[i];
            object.onMouseDrag(x, y, xmove, ymove);
        }

    } else if(mouseButton == 0) { // No mouse down

        for(var i = 0; i < self.objects.length; i++) {
            var object = self.objects[i];
            object.onMouseMove(x, y, xmove, ymove);
        }
    }
}

Game.prototype.onScroll = function(scroll) {
    var self = this;
    
    for(var i = 0; i < self.objects.length; i++) {
        var object = self.objects[i];
        object.onScroll(scroll);
    }

}
