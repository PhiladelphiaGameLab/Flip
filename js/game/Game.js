// global variable for ease of use
var game = null;
var physicsScene = null; // Physics scene should only be instantiated once

function Game(renderer, width, height, loader, data) {
    var self = this;

    self.renderer = renderer;
    self.loader = loader;
    self.scene = null;
    self.camera = null;
    self.raycaster = null;
    self.mouse = new THREE.Vector2();
    self.cameraControls = null;

    self.objectsLoaded = 0;
    self.objectsToLoad = 0;
    self.loaded = false;

    self.skyboxEnabled = false;
    self.skyboxCamera = null;
    self.skyboxScene = null;
    self.skyboxMesh = null;
    self.skyboxTexture = null;

    self.width = width;
    self.height = height;

    self.objects = [];

    game = this;
    self.start(data);
}


Game.prototype.start = function(data) {
    var self = this;

    console.log("Loading game: " + data.sceneName);

    //self.scene = new THREE.Scene();

    if(physicsScene === null) {
        physicsScene = new Physijs.Scene();
    }
        
    self.scene = physicsScene;
    self.scene.onSimulationResume();
    self.scene.setGravity(new THREE.Vector3(0, -50, 0));

    self.raycaster = new THREE.Raycaster();

    // Create observer
    var observer = new Observer();

    // Load objects
    self.objectsToLoad = data.objects.length;
    if(self.objectsToLoad == 0) self.loadFinished();
    for(var i = 0; i < data.objects.length; i++) {

        var objectData = Utils.unpackData(data.objects[i]);
        var tag = objectData.tag;
        var object = null;

        // Look at the tag to see what type of object to create
        if(tag == "player") {
            object = new Player(objectData);
        } else if(tag == "aimer"){
            object = new Aimer(objectData);
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

        self.loader.loadTextureCube(urls, function(texture) {
           
            self.skyboxTexture = texture;
            self.skyboxCamera = new THREE.PerspectiveCamera( 70, self.width / self.height, 1, 1000 );
            self.skyboxScene = new THREE.Scene();
            self.skyboxEnabled = true;
            self.renderer.autoClear = false;

            var shader = THREE.ShaderLib[ "cube" ];
            shader.uniforms["tCube"].value = self.skyboxTexture;
            var skyboxMat = new THREE.ShaderMaterial({
                fragmentShader: shader.fragmentShader,
                vertexShader: shader.vertexShader,
                uniforms: shader.uniforms,
                depthWrite: false,
                side: THREE.BackSide
            });

            self.skyboxMesh = new THREE.Mesh( new THREE.BoxGeometry( 100, 100, 100 ), skyboxMat );
            self.skyboxScene.add(self.skyboxMesh);
        });
    }
}

Game.prototype.stop = function() {
    var self = this;

    for(var i = 0; i < self.scene.children.length; i++) {
        var object = self.scene.children[i];

        // If the object is a light with a shadow map, dispose it
        if(object.shadowMap) {
            object.shadowMap.dispose();
        }
    }

    // Remove all children from scene
    while(self.scene.children.length > 0) {
        var object = self.scene.children[0];
        self.scene.remove(object);
    }

    if(self.skyboxEnabled) {
        self.skyboxMesh.geometry.dispose();
        self.skyboxMesh.material.dispose();
        // No need to dispose texture because it is shared in the Editor scene
    }

    // Unsetting the global variable should cause everything the game to garbage collect
    game = null;

    // Stop game loop
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

    for(var i = 0; i < self.objects.length; i++) {
        self.objects[i].update();
    }
}

Game.prototype.onViewResize = function(width, height) {
    var self = this;

    self.width = width;
    self.height = height;

    self.camera.aspect = width / height;
    self.camera.updateProjectionMatrix();

    if(self.skyboxEnabled) {
        self.skyboxCamera.aspect = width / height;
        self.skyboxCamera.updateProjectionMatrix();
    }
};


Game.prototype.addObject = function(object) {
    var self = this;

    if(object.object3js) {
        self.scene.add(object.object3js);
        if(object.data.light && object.data.light.castShadow) {
            self.setShadowCaster(object.object3js);
        }
    }

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

Game.prototype.onMouseDown = function(x, y, mouseButton) {
    var self = this;
    // Call events on game objects
    for(var i = 0; i < self.objects.length; i++) {
        var object = self.objects[i];
        object.onMouseDown(x, y, mouseButton);
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

Game.prototype.setShadowCaster = function(light) {
    var self = this;

    var shadowRes = 2048;
    var shadowWidth = 100;

    light.castShadow = true;
    //light.shadowCameraVisisble = true;
    light.shadowCameraNear = 50;
    light.shadowCameraFar = 300;    
    light.shadowCameraRight =  shadowWidth;
    light.shadowCameraLeft = -shadowWidth;
    light.shadowCameraTop =  shadowWidth;
    light.shadowCameraBottom = -shadowWidth;
    light.shadowBias = 0.0001;
    light.shadowDarkness = 0.3;
    light.shadowMapWidth = shadowRes;
    light.shadowMapHeight = shadowRes;

    self.renderer.shadowMapEnabled = true;
    self.renderer.shadowMapType = THREE.PCFShadowMap;
}

Game.prototype.getPickingRay = function(x, y) {
    var self = this;
    self.mouse.x = x*2-1;
    self.mouse.y = y*2-1;
    self.raycaster.setFromCamera(self.mouse, self.camera);
    return self.raycaster.ray;
}