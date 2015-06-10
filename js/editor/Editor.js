var editor = null;

function Editor(renderer, width, height, loader) {
    var self = this;

    // Assets in the library
    self.assets = [
        {name:"Chair", icon:"img/cube.png", mesh:"data/assets/chair/chair.json"},
        {name:"Cube", icon:"img/cube.png", mesh:"data/assets/shapes/cube.json"},
        {name:"Sphere", icon:"img/cube.png", imesh:"data/assets/shapes/sphere.json"},
        {name:"Tree", icon:"img/cube.png", mesh:"data/assets/tree/tree.json"},
        {name:"Rock", icon:"img/cube.png", mesh:"data/assets/rock/rock.json"},
        {name:"Point Light", icon:"img/light.png", light:{color:0xFFF000, distance:50, type:"point"}},
        {name:"Dir Light", icon:"img/light.png", light:{color:0xffffff, type:"dir"}},

        // Physics Demo Assets
        {name:"Grass", icon:"img/cube.png", mesh:"data/assets/physics_demo/environment.json", castShadow:false},
        {name:"Steel Plank", icon:"img/cube.png", mesh:"data/assets/physics_demo/plank_steel.json", physics:{enabled:true,type:"static",friction:0.2,restitution:0.9,shape:"cube",mass:1.0}},
        {name:"Wood Plank", icon:"img/cube.png", mesh:"data/assets/physics_demo/plank_wood.json", physics:{enabled:true,type:"dynamic",friction:1.0,restitution:0.5,shape:"cube",mass:3.0}},
        {name:"Steel Box", icon:"img/cube.png", mesh:"data/assets/physics_demo/cube_steel.json", physics:{enabled:true,type:"static",friction:0.2,restitution:0.9,shape:"cube",mass:1.0}},
        {name:"Wood Box", icon:"img/cube.png", mesh:"data/assets/physics_demo/cube_wood.json", physics:{enabled:true,type:"dynamic",friction:1.0,restitution:0.5,shape:"cube",mass:2.0}},
        {name:"Steel Ball", icon:"img/cube.png", mesh:"data/assets/physics_demo/sphere_steel.json", physics:{enabled:true,type:"static",friction:0.2,restitution:0.9,shape:"sphere",mass:1.0}},
        {name:"Wood Ball", icon:"img/cube.png", mesh:"data/assets/physics_demo/sphere_wood.json", physics:{enabled:true,type:"dynamic",friction:1.0,restitution:0.5,shape:"sphere",mass:2.0}},
       
        //{name:"Glass Ball", icon:"img/cube.png", mesh:"data/assets/physics_demo/sphere_glass.json"},
        //{name:"Aimer", icon:"img/cube.png", tag:"aimer", mesh:"data/assets/shapes/sphere.json"}
        //{name:"MultiMat", icon:"img/cube.png", mesh:"data/assets/multimat/multimat.json"},
        //{name:"Skinning Simple", icon:"img/cube.png", mesh:"data/assets/skinning_simple/skinning_simple.js"},
        //{name:"Terrain", icon:"img/cube.png", mesh:"data/assets/terrain/terrain.json"},
        //{name:"Player", icon:"img/cube.png", tag:"player", mesh:"data/assets/capsule/capsule.json"},
        //{name:"Camera", icon:"img/camera.png", camera:{fov:70}},
        //{name:"Stones", icon:"img/cube.png", mesh:"data/assets/physics_demo/stones.json", castShadow:false, receiveShadow:false},
        //{name:"Glass Plank", icon:"img/cube.png", mesh:"data/assets/physics_demo/plank_glass.json"},
        //{name:"Glass Box", icon:"img/cube.png", mesh:"data/assets/physics_demo/cube_glass.json"},

        //Particle System
        {name:"Particle System", icon:"img/cube.png", particle:true, particlemesh:null}

    ];

    self.objects = []; // Objects in the scene
    self.raycastDetectors = []; // ThreeJS objects. Need this array for doing raycasting.
    self.scripts = []; // Scripts used by objects. Each object may store a reference to one of these

    self.objectId = 0; // Used to assign unique id's to new objects

    self.width = width;
    self.height = height;
    self.renderer = renderer;
    self.loader = loader;
    self.scene = null;
    self.camera = null;
    self.ambientLight = null;
    self.cameraControls = null;
    self.transformControls = null;
    self.raycaster = null;
    self.mouse = new THREE.Vector2();
    self.undoHandler = new UndoHandler(self);

    self.isCurrentlyTransforming = false; // TransformControls
    self.copiedObjectData = null;

    self.skyboxCamera = null;
    self.skyboxScene = null;
    self.skyboxMesh = null;
    self.skyboxTexture = null;
    self.skyboxEnabled = false;
    self.skybox = "none"; // Name
    self.skyboxUrl = "";

    self.ambientColor = 0x000000;
    self.backgroundColor = 0x000000;
    self.grid = null;
    self.gridVisible = true;
    self.sceneName = "My Scene";

    self.selected = null; // The currently selected object
    self.sceneData = null; // Stores the scene data, updated after every change

    editor = self;
}

Editor.prototype.init = function() {
    var self = this;

    self.scene = new THREE.Scene();

    self.camera = new THREE.PerspectiveCamera(70, self.width / self.height, 1, 1000);
    self.scene.add(self.camera);
    self.cameraControls = new CameraControls(self.camera);
    self.transformControls = new THREE.TransformControls(self.camera, self.renderer.domElement, self);
    self.raycaster = new THREE.Raycaster();

    self.ambientLight = new THREE.AmbientLight( 0x404040 );
    self.scene.add(self.ambientLight);

    // Skybox
    self.skyboxCamera = new THREE.PerspectiveCamera( 70, self.width / self.height, 1, 1000 );
    self.skyboxScene = new THREE.Scene();

    var shader = THREE.ShaderLib[ "cube" ];
    var skyboxMat = new THREE.ShaderMaterial({
        fragmentShader: shader.fragmentShader,
        vertexShader: shader.vertexShader,
        uniforms: shader.uniforms,
        depthWrite: false,
        side: THREE.BackSide
    });

    self.skyboxMesh = new THREE.Mesh( new THREE.BoxGeometry( 100, 100, 100 ), skyboxMat );
    self.skyboxScene.add(self.skyboxMesh);

   


    // Grid
    var grid = new THREE.GridHelper( 200, 10 );
    grid.setColors( 0x0000ff, 0x808080 );
    grid.visible = self.gridVisible;
    self.scene.add(grid);
    self.grid = grid;

    // Position camera
    self.camera.position.set(-40, 30, 40);
    self.cameraControls.setRotation(-0.76, -0.43);

    editorUI.populateLibrary(self.assets);

    //editorUI.clearLocalStorage();
    //editorUI.loadFromFile("data/scenes/TerrainScene.txt", function(data){self.load(data);});


    // This gets called after the scene data is retrieved below
    function loadScene(data) {
        self.load(data, function(){
            self.save(); // Save the scene right after loading it
        });
    }

    // Load scene data
    editorUI.loadFromLocalStorage(function(data){

        // Found saved data in local storage, load scene
        if(data) loadScene(data);

        // Did not find saved data, load a pre-built scene
        if(data === null) {
            editorUI.openHelpWindow();
            editorUI.loadFromFile("data/scenes/PhysicsDemoScene.txt", function(data){
                loadScene(data);
            });
        }
    });
};

Editor.prototype.setDefaultSettings = function() {
    var self = this;
    self.setAmbientColor(0x404040);
    self.setBackgroundColor(0x97a7b2);
    self.setSkybox("none");
    self.setGridVisible(true);
}

Editor.prototype.onViewResize = function(width, height) {
    var self = this;

    self.width = width;
    self.height = height;
    self.camera.aspect = width / height;
    self.camera.updateProjectionMatrix();

    self.skyboxCamera.aspect = width / height;
    self.skyboxCamera.updateProjectionMatrix();
};

Editor.prototype.render = function() {
    var self = this;

    if(self.skyboxEnabled) {   
        self.skyboxCamera.rotation.copy(self.camera.rotation);
        self.renderer.render(self.skyboxScene, self.skyboxCamera);
    }

    self.renderer.render(self.scene, self.camera);
    self.transformControls.update();
}

Editor.prototype.update = function() {
    var self = this;
    for(var i = 0; i < self.objects.length; i++) {
        var object = self.objects[i];
        if(object.object3js instanceof THREE.PointCloud) {
            object.update();
        }
    }

}

Editor.prototype.clear = function() {
    var self = this;
    self.setDefaultSettings();
    while(self.objects.length > 0) {
        self.destroyObject(self.objects[0]);
    }
}

Editor.prototype.load = function(sceneData, callback) {

    var self = this;
    if(sceneData === null) return;
    self.clear(); // Clears the scene if there's anything in it

    console.log(sceneData);
    self.sceneData = sceneData;
    self.sceneName = sceneData.sceneName;
    console.log("loading scene:", sceneData.sceneName);

    var objectsLoaded = 0;
    var objectsToLoad = sceneData.objects.length;
    var skyboxLoaded = false;

    function checkLoaded() {
        if(objectsLoaded == objectsToLoad && skyboxLoaded) {
            if(callback) callback();
        }
    }

    // Set camera position and rotation
    //self.camera.position.fromArray(data.editor.cameraPos);
    //self.camera.rotation.fromArray(data.editor.cameraRot);

    self.setBackgroundColor(sceneData.backgroundColor);
    self.setAmbientColor(sceneData.ambientColor);
    self.setGridVisible(sceneData.editor.gridVisible);
    self.setSkybox(sceneData.skybox.name, function(){
        skyboxLoaded = true;
        checkLoaded();
    });

    self.scripts = sceneData.scripts; // TO-DO: is it ok not to deep copy?

    // Create objects
    for(var i = 0; i < objectsToLoad; i++) {
        self.createObject(sceneData.objects[i], function(object){
            objectsLoaded++;
            checkLoaded();
        });
    }
}

Editor.prototype.save = function() {
    
    var self = this;

    var sceneCameraPos = self.camera.position.toArray();
    var sceneCameraRot = self.camera.rotation.toArray();

    var sceneData = {
        sceneName : self.sceneName,
        objects : [],
        scripts : [],
        backgroundColor: self.backgroundColor,
        ambientColor: self.ambientColor,
        skybox: {name:self.skybox, url:self.skyboxUrl},
        editor : {
            cameraPos : sceneCameraPos,
            cameraRot : sceneCameraRot,
            gridVisible : self.gridVisible
        }
    };

    for(var i = 0; i < self.objects.length; i++) {

        var object = self.objects[i];
        sceneData.objects.push(object.getData());

        // If there is a script attached to this object, save it
        if(object.data.script !== null) {
            var script = self.getScriptByName(object.data.script);
            sceneData.scripts.push(script);
        }
    }

    self.sceneData = sceneData;
    editorUI.saveToLocalStorage(sceneData);

    console.log("saving scene");

    return sceneData;
}

Editor.prototype.getObjectByName = function(name) {
    var self = this;

    for (var i = 0; i < self.objects.length; i++) {
        if(self.objects[i].data.name == name) {
            return self.objects[i];
        }
    }
    return null;
};

Editor.prototype.getObjectById = function(id) {
    var self = this;

    for (var i = 0; i < self.objects.length; i++) {
        if(self.objects[i].data.id == id) {
            return self.objects[i];
        }
    }
    return null;
};

Editor.prototype.getAssetByName = function(name) {
    var self = this;

    for (var i = 0; i < self.assets.length; i++) {
        if(self.assets[i].name == name) {
            return self.assets[i];
        }
    }
    return null;
};

Editor.prototype.getScriptByName = function(name) {
    var self = this;

    for (var i = 0; i < self.scripts.length; i++) {
        if(self.scripts[i].name == name) {
            return self.scripts[i];
        }
    }
    return null;
}

Editor.prototype.clearScene = function() {
    var self = this;
    self.clear();
    self.undoHandler.clearScene(self.sceneData);
}

Editor.prototype.editSceneSettings = function() {
    var self = this;
    self.undoHandler.editScene();
}

Editor.prototype.editObject = function(object) {
    var self = this;
    self.undoHandler.editObject(object);
};

Editor.prototype.addObject = function(data, callback) {
    var self = this;    

    self.createObject(data, function(object) {
        self.undoHandler.addObject(object);
        if(callback) callback(object);
    });
};

Editor.prototype.removeObject = function(object) {
    var self = this;
    self.destroyObject(object);
    self.undoHandler.removeObject(object);
};

Editor.prototype.createObject = function(data, callback) {
    var self = this;

    // Always set objectId to be higher than any object's id
    // For example when you load a scene the objects already have id's, so objects created after should have higher id's.
    self.objectId = Math.max(self.objectId, data.id+1);

    new ObjectEdit(data, function(object){
        self.objects.push(object);
        self.scene.add(object.object3js);
        self.raycastDetectors.push(object.visual);

        if(object.data.light) {
            self.scene.add(object.visual);
            self.updateThreeJS(); // Need to update the scene when a new light is created
        }

        if(callback) callback(object);
    });

}

Editor.prototype.destroyObject = function(object) {
    var self = this;

    self.selectObject(null); // Deselect before destroying

    object.dispose();

    // Remove object
    self.objects.splice(self.objects.indexOf(object), 1);

    // Remove ThreeJS object
    if(object.object3js) {
        self.scene.remove(object.object3js);
    }

    if(object.visual) {
        // Visual may be the same as object (like for meshes), so this step might be redundant
        self.scene.remove(object.visual);

        // Remove from raycast detector list
        self.raycastDetectors.splice(self.raycastDetectors.indexOf(object.visual), 1);
    }

    // Turn off shadow mapping if the light casts shadows
    if(object.data.light && object.data.light.castShadow) {
        self.enableShadowMap(false);
    }
    
    if(object.data.particlemesh) {
        //Empty all the particle groups in the editor window
        object.data.particlemesh = null;
    }

};

Editor.prototype.getUniqueId = function() {
    // objectId is updated in createObject()
    var self = this;
    return self.objectId;
}

Editor.prototype.isNameUnique = function(name) {
    var self = this;
    var object = self.getObjectByName(name);
    return object === null;
}

Editor.prototype.getUniqueName = function(name) {
    var self = this;
    
    // Check if an object with this name exists. If not, return the name as it is
    if(self.isNameUnique(name)) return name;

    // Get the copy count (if it exists)
    var count = 0;
    var base = name;
    var hyphenIndex = name.lastIndexOf("-");
    if(hyphenIndex >= 0) {
        var beforeHyphen = name.substring(0, hyphenIndex);
        var afterHyphen = name.substring(hyphenIndex+1);
        var numerical = /^\d+$/.test(afterHyphen);
        
        // The count is valid only if there's a hyphen followed by digits
        if(numerical) {
            count = parseInt(afterHyphen, 10); // base 10
            base = beforeHyphen;
        }
    }

    // Keep incrementing the copy count and look for an open name
    var unique = false;
    while(!unique) {
        count++;
        name = base + "-" + count;
        unique = self.isNameUnique(name);
    }

    return name;
    //var regex = /\.0*([0-9]+)$/gm;
}

Editor.prototype.copyObject = function() {
    var self = this;
    
    if(self.selected) {
        self.copiedObjectData = self.selected.getData();
    }
};

Editor.prototype.pasteObject = function() {
    var self = this;
    
    if(self.copiedObjectData) {
        var data = self.copiedObjectData;
        data.id = self.getUniqueId();
        data.name = self.getUniqueName(data.name);
        self.addObject(data, self.selectObject.bind(self));
    }
};

Editor.prototype.duplicateObject = function(object) {
    var self = this;

    var data = object.getData();
    data.id = self.getUniqueId();
    data.name = self.getUniqueName(data.name);
    data.position[0] = 0;
    data.position[1] = 0;
    data.position[2] = 0;
    self.addObject(data, self.selectObject.bind(self));
};

Editor.prototype.createAsset = function(assetName, x, y, z) {
    var self = this;

    var asset = self.getAssetByName(assetName);
    if(asset == null) return;

    var data = Utils.clone(asset);
    data.id = self.getUniqueId();
    data.name = self.getUniqueName(assetName);
    data.assetName = asset.name;
    data.position = [x || 0, y || 0, z || 0]; // x,y,z are optional, so default to 0 is they don't exist

    self.addObject(data, self.selectObject.bind(self));
};

Editor.prototype.dropAsset = function(assetName, x, y) {
    var self = this;

    var position = self.unprojectMousePosition(x, y);
    self.createAsset(assetName, position.x, position.y, position.z);
};

Editor.prototype.onClick = function(x, y) {
    var self = this;

    var selected = null;

    // Get the selected object
    self.mouse.x = x*2-1;
    self.mouse.y = y*2-1;
    self.raycaster.setFromCamera( self.mouse, self.camera );
    var intersections = self.raycaster.intersectObjects( self.raycastDetectors );
    if (intersections.length > 0) {
        var mesh = intersections[0].object;
        var object = self.getObjectById(mesh.userData);
        selected = object;
    }

    self.selectObject(selected);
}

Editor.prototype.onMouseDown = function(x, y, mouseButton) {

}

Editor.prototype.onMouseMove = function(x, y, xmove, ymove, mouseButton) {
    var self = this;
    if(self.isCurrentlyTransforming) return;
    if(mouseButton == 1) { // left button
        self.cameraControls.rotate(xmove, ymove);
    } else if(mouseButton == 2) { // middle button
        self.cameraControls.pan(xmove, ymove)
    } else if(mouseButton == 3) { // right button
        self.cameraControls.pan(xmove, ymove);
    }
}

Editor.prototype.onScroll = function(scroll) {
    var self = this;
    self.cameraControls.zoom(scroll);
}

Editor.prototype.onKeyPress = function(key, ctrl) {
    // TO-DO: ctrl-z doesn't work now because sometimes the code editor takes focus for no reason

    var self = this;

    if(key == 90) { // z
        self.undoHandler.undoAction();
    } else if(key == 89) { // y
        self.undoHandler.redoAction();
    } else if(key == 46) { // DEL
        self.removeSelected();
    } else if(key == 49) { // 1
        editorUI.setTransformMode(0);
    } else if(key == 50) { // 2
        editorUI.setTransformMode(1);
    } else if(key == 51) { // 3
        editorUI.setTransformMode(2);
    } else if(key == 67) { // c
        self.copyObject();
    } else if(key == 86) { // v
        self.pasteObject();
    }
};

Editor.prototype.onKeyDown = function(key, ctrl) {
    var self = this;

    if(key == 87) { // w
        self.cameraControls.zoom(1/3);
    }

    if(key == 65) { // a
        self.cameraControls.pan(1, 0);
    }

    if(key == 83) { // s
        self.cameraControls.zoom(-1/3);
    }

    if(key == 68) { // d
        self.cameraControls.pan(-1, 0);
    }
}

Editor.prototype.selectObject = function(object) {

    // When object is null, it counts as a deselect

    var self = this;

    // Don't reselect
    if(self.selected == object) {
        return;
    }

    // Unselect previous object
    if(self.selected) {
        self.scene.remove(self.transformControls);
        self.transformControls.detach(self.selected.visual);
    }

    // Select object
    if(object) {
        self.transformControls.attach(object.visual);
        self.scene.add(self.transformControls);
    }

    self.selected = object;
    editorUI.selectObject(object);
};

Editor.prototype.unprojectMousePosition = function(x, y) {
    var self = this;
    var camera = self.camera;
    var vector = new THREE.Vector3();
    vector.set(x*2-1, y*2-1, 0.5); // NDC space
    vector.unproject(camera); // World space
    var dir = vector.sub(camera.position).normalize();
    //var distance = - camera.position.z / dir.z;
    var distance = 15;
    var worldPosition = camera.position.clone().add(dir.multiplyScalar(distance));
    return worldPosition;
};

Editor.prototype.removeSelected = function() {
    var self = this;
    if(self.selected === null) return;

    self.removeObject(self.selected);
};

Editor.prototype.duplicateSelected = function() {
    var self = this;
    if(self.selected === null) return;

    self.duplicateObject(self.selected);
};

Editor.prototype.setTransformMode = function(mode) {
    var self = this;

    if(mode == 0) { // translate
        self.transformControls.setMode("translate");
        self.transformControls.setSpace("world");
    } else if (mode == 1) { // rotate
        self.transformControls.setMode("rotate");
        self.transformControls.setSpace("world");
    } else if(mode == 2) { // scale
        self.transformControls.setMode("scale");
        self.transformControls.setSpace("local");
    }
};

Editor.prototype.editScript = function(contents) {
    var self = this;
    var object = self.selected;
    if(object === null) return;

    if(object.data.script === null) {

        if(contents.length > 0) {
            // Create new script. Use the id of the object to make the script name
            var scriptObj = {
                name:"script" + object.data.id,
                contents:contents
            };

            self.scripts.push(scriptObj);
            object.data.script = scriptObj.name;
            self.save();
        }
    } else {
        var script = self.getScriptByName(object.data.script);
        script.contents = contents;
        self.save();
    }
};

Editor.prototype.setAmbientColor = function(color) {
    var self = this;
    self.ambientColor = color;
    self.ambientLight.color.setHex(color);
    editorUI.updateSettings();
}

Editor.prototype.setBackgroundColor = function(color) {
    var self = this;
    self.backgroundColor = color;
    self.renderer.setClearColor(color, 1);
    editorUI.updateSettings();
};

Editor.prototype.setSkybox = function(skybox, callback) {
    var self = this;

    // Disable skybox
    if(skybox == "none") {
        self.skyboxEnabled = false;
        self.renderer.autoClear = true;
        self.skybox = skybox;
        self.skyboxUrl = "";
        editorUI.updateSettings();
        if(callback) callback();
        return;
    }

    // Get skybox image path based on the selection
    var path = "";
    if(skybox == "clouds") {
        path = "data/skybox/"
    } else {
        return;
    }

    self.skyboxUrl = path;

    var format = '.jpg';
    var urls = [
        path + 'px' + format, path + 'nx' + format,
        path + 'py' + format, path + 'ny' + format,
        path + 'pz' + format, path + 'nz' + format
    ];

    self.loader.loadTextureCube(urls, function(texture) {
        self.skyboxTexture = texture;
        self.skyboxMesh.material.uniforms["tCube"].value = self.skyboxTexture;
        self.skybox = skybox;
        self.skyboxEnabled = true;
        self.renderer.autoClear = false;
        editorUI.updateSettings();
        if(callback) callback();
    });
};

Editor.prototype.setGridVisible = function(visible) {
    var self = this;

    self.gridVisible = visible;
    self.grid.visible = visible;
    editorUI.updateSettings();
};


Editor.prototype.enableShadowMap = function(enabled) {
    var self = this;

    self.renderer.shadowMapEnabled = enabled;
    self.renderer.shadowMapType = THREE.PCFShadowMap;
    //self.renderer.shadowMapType = THREE.BasicShadowMap;
    //self.renderer.shadowMapType = THREE.PCFSoftShadowMap;
    self.updateThreeJS();

};

Editor.prototype.setShadowCaster = function(object, enabled) {
    var self = this;

    self.enableShadowMap(enabled);

    // Loop over other lights
    for(var i = 0; i < self.objects.length; i++) {
        var other = self.objects[i];
        if(other == object) continue; // This object
        if(other.data.light === null) continue; // Not a light
        
        if(enabled) {
            // Turn off other lights
            other.data.light.castShadow = false;
            other.object3js.castShadow = false;
        } else if(other.data.light.castShadow) {
            self.enableShadowMap(true);
        }
    }
};

Editor.prototype.updateThreeJS = function() {
    var self = this;

    // Need to update all the materials when certain aspects of the renderer change, such as addings lights or enabling shadow mapping
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
};