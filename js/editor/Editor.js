function Editor(renderer, width, height) {
    var self = this;
    
    self.isCurrentlyTransforming = false;
    self.copiedObjectData = null;

    // Undo/redo
    self.actionStack = [];
    self.actionStackPos = -1;
    self.actionLimit = 20;

    // Assets in the library
    self.assets = [
        {name:"MultiMat", icon:"img/cube.png", id:0, mesh:"data/assets/multimat/multimat.json"},
        {name:"Chair", icon:"img/cube.png", id:1, mesh:"data/assets/chair/chair.json"},
        {name:"Skinning Simple", icon:"img/cube.png", id:2, mesh:"data/assets/skinning_simple/skinning_simple.js"},
        {name:"Cube", icon:"img/cube.png", id:3, mesh:"data/assets/shapes/cube.json"},
        {name:"Sphere", icon:"img/cube.png", id:4, mesh:"data/assets/shapes/sphere.json"},
        {name:"Terrain", icon:"img/cube.png", id:5, mesh:"data/assets/terrain/terrain.json"},
        {name:"Tree", icon:"img/cube.png", id:5, mesh:"data/assets/tree/tree.json"},
        {name:"Rock", icon:"img/cube.png", id:5, mesh:"data/assets/rock/rock.json"},
        {name:"Player", icon:"img/cube.png", tag:"player", id:5, mesh:"data/assets/capsule/capsule.json"},
        {name:"Point Light", icon:"img/light.png", id:6, light:{color:0xFFF000, distance:10, type:"point"}},
        {name:"Dir Light", icon:"img/light.png", id:7, light:{color:0xffffff, type:"dir"}},
        {name:"Camera", icon:"img/camera.png", id:8, camera:{fov:70}},

        // Temp assets
        {name:"Grass", icon:"img/cube.png", id:0, mesh:"data/assets/physics_demo/environment.json", castShadow:false},
        {name:"Stones", icon:"img/cube.png", id:1, mesh:"data/assets/physics_demo/stones.json", castShadow:false, receiveShadow:false},
        {name:"Steel Plank", icon:"img/cube.png", id:1, mesh:"data/assets/physics_demo/plank_steel.json"},
        {name:"Wood Plank", icon:"img/cube.png", id:1, mesh:"data/assets/physics_demo/plank_wood.json"},
        {name:"Glass Plank", icon:"img/cube.png", id:1, mesh:"data/assets/physics_demo/plank_glass.json"},
        {name:"Steel Box", icon:"img/cube.png", id:1, mesh:"data/assets/physics_demo/cube_steel.json"},
        {name:"Wood Box", icon:"img/cube.png", id:1, mesh:"data/assets/physics_demo/cube_wood.json"},
        {name:"Glass Box", icon:"img/cube.png", id:1, mesh:"data/assets/physics_demo/cube_glass.json"},
        {name:"Steel Ball", icon:"img/cube.png", id:1, mesh:"data/assets/physics_demo/sphere_steel.json"},
        {name:"Wood Ball", icon:"img/cube.png", id:1, mesh:"data/assets/physics_demo/sphere_wood.json"},
        {name:"Glass Ball", icon:"img/cube.png", id:1, mesh:"data/assets/physics_demo/sphere_glass.json"},


    ];

    self.objects = []; // Objects in the scene
    self.raycastDetectors = []; // ThreeJS objects. Need this array for doing raycasting.
    self.scripts = []; // Scripts used by objects. Each object stores a reference to one of these, or null.

    self.objectId = 0; // Used to assign id's to new objects

    self.width = width;
    self.height = height;
    self.renderer = renderer;
    self.scene = null;
    self.loader = null;
    self.camera = null;
    self.ambientLight = null;
    self.cameraControls = null;
    self.transformControls = null;
    self.raycaster = null;
    self.mouse = new THREE.Vector2();

    self.shadowMapSize = 2048;

    self.skyboxCamera = null;
    self.skyboxScene = null;
    self.skyboxMesh = null;
    self.skyboxEnabled = false;
    self.skybox = "none"; // Name
    self.skyboxUrl = "";
    self.ambientColor = 0x000000;
    self.backgroundColor = 0x000000;
    self.grid = null;
    self.gridVisible = true;
    self.sceneName = "My Scene";

    self.selected = null; // The currently selected object
    self.data = null; // Stores the game data
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

    self.loader = new THREE.JSONLoader();

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

    self.setDefaultSettings();

    // Position camera
    self.camera.position.set(-20, 15, 20);
    self.cameraControls.setRotation(-0.76, -0.43);

    editorUI.populateLibrary(self.assets);

    //editorUI.clearLocalStorage();
    //editorUI.loadFromFile("data/scenes/TerrainScene.txt", function(data){self.load(data);});

    // Load scene
    editorUI.loadFromLocalStorage(function(data){

        // Found saved data, load it
        if(data) self.load(data);

        // Did not find saved data, load a pre-built scene
        if(data == null) {
            editorUI.loadFromFile("data/scenes/PhysicsDemoScene.txt", function(data){
                self.load(data);
            });
        }
    });
};

Editor.prototype.loaded = function() {
    self.load(data);
}

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
}

// Do not call directly. Call clearScene instead
Editor.prototype.clear = function() {
    var self = this;
    self.setDefaultSettings();
    while(self.objects.length > 0) {
        self.destroyObject(self.objects[0]);
    }
}

Editor.prototype.fixData = function(data) {
    // This is a helper function that lets you fix the data in case you made any changes to the json format

    // // Create objects
    // for(var i = 0; i < data.objects.length; i++) {
    //     var objData = data.objects[i];
    //     if(objData.mesh !== null) objData.material = {color:0xffffff};
    //     else objData.material = null;
    // }
}

Editor.prototype.load = function(data) {
    // Assume that scene is empty when you load.

    var self = this;
    if(data === null) return;

    self.fixData(data);

    console.log(data);
    self.data = data;
    self.sceneName = data.sceneName;
    console.log("loading scene:", data.sceneName);

    self.scripts = data.scripts; // TO-DO: is it ok not to deep copy?

    // Create objects
    for(var i = 0; i < data.objects.length; i++) {
        var object = new ObjectEdit(data.objects[i]);
        self.createObject(object);
    }

    // Set camera position and rotation
    //self.camera.position.fromArray(data.editor.cameraPos);
    //self.camera.rotation.fromArray(data.editor.cameraRot);

    self.setBackgroundColor(data.backgroundColor);
    self.setAmbientColor(data.ambientColor);
    self.setSkybox(data.skybox.name);
    self.setGridVisible(data.editor.gridVisible);
}

Editor.prototype.save = function() {
    
    // TO-DO: it may be overkill to call getData() on every object like this when only 1 object is affected at a time
    // An alternative is to keep a save-state variable and modify it when actions occur and for undo/redo
    // Once we have saving to a server, this whole process may need to be rethought

    var self = this;

    console.log("saving scene");

    var sceneCameraPos = self.camera.position.toArray();
    var sceneCameraRot = self.camera.rotation.toArray();

    var data = {
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
        data.objects.push(object.getData());

        // If there is a script attached to this object, save it
        if(object.script !== null) {
            var script = self.getScriptByName(object.script);
            data.scripts.push(script);
        }
    }

    self.data = data;
    editorUI.saveToLocalStorage(data);
}

Editor.prototype.getObjectByName = function(name) {
    var self = this;

    for (var i = 0; i < self.objects.length; i++) {
        if(self.objects[i].name == name) {
            return self.objects[i];
        }
    }
    return null;
};

Editor.prototype.getObjectById = function(id) {
    var self = this;

    for (var i = 0; i < self.objects.length; i++) {
        if(self.objects[i].id == id) {
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

Editor.prototype.hasUndos = function() {
    var self = this;
    return (self.actionStackPos != -1);
};

Editor.prototype.hasRedos = function() {
    var self = this;
    return (self.actionStackPos != self.actionStack.length - 1);
};

Editor.prototype.doAction = function(action, reverse) {
    var self = this;

    if(action.type == "edit") {

        if(reverse) {
            var object = self.getObjectByName(action.data.name);
            object.setData(action.data.oldData);
        } else {
            var object = self.getObjectByName(action.data.name);
            object.setData(action.data.newData);
        }

    } else if(action.type == "add") {

        if(reverse) {
            var object = self.getObjectByName(action.data.name);
            self.destroyObject(object);
        } else {
            var object = new ObjectEdit(action.data);
            self.createObject(object);
        }

    } else if(action.type == "remove") {

        if(reverse) {
            var object = new ObjectEdit(action.data);
            self.createObject(object);
        } else {
            var object = self.getObjectByName(action.data.name);
            self.destroyObject(object);
        }

    } else if(action.type == "clear") {

        if(reverse) {
            self.load(action.data);
        } else {
            self.clear();
        }
    }
}

Editor.prototype.undoAction = function() {
    var self = this;

    if (!self.hasUndos()) return;
    var action = self.actionStack[self.actionStackPos];
    self.actionStackPos--;
    
    self.doAction(action, true);

    editorUI.setUndoRedo(self.hasUndos(), self.hasRedos());
    self.save();
    editorUI.updateSelectedObject();

    console.log("Undo action: " + action.type);
};

Editor.prototype.redoAction = function() {
    var self = this;

    if (!self.hasRedos()) return;
    self.actionStackPos++;
    var action = self.actionStack[self.actionStackPos];

    self.doAction(action, false);

    editorUI.setUndoRedo(self.hasUndos(), self.hasRedos());
    self.save();
    editorUI.updateSelectedObject();

    console.log("Redo action: " + action.type);
};

Editor.prototype.addAction = function(actionType, actionData) {
    var self = this;

    var action = {
        type: actionType,
        data: actionData,
    }

    // Remove the redo states
    self.actionStack.splice(self.actionStackPos + 1, self.actionStack.length);

    // Push action
    self.actionStack.push(action);
    self.actionStackPos++;
            
    // Don't let the stack get too big. Remove oldest.
    if (self.actionStack.length > self.actionLimit){
        self.actionStack.shift();
        self.actionStackPos--;
    }

    editorUI.setUndoRedo(true, false);
    self.save();
    editorUI.updateSelectedObject();

    console.log("Add action " + action.type);
};


Editor.prototype.clearScene = function() {
    var self = this;
    self.clear();
    self.addAction("clear", self.data);
}

Editor.prototype.editObject = function(object) {
    
    // TO-DO: is it a good idea for the edit action to save the the entire state of the object,
    // or should the edit action only contain the property name, old value, and current value?

    var self = this;

    // Save the old state of the object and the new state of the object
    var newData = object.getData();
    var oldData = object.data;
    self.addAction("edit", {name:object.name, newData:newData, oldData:oldData});
    object.data = newData;
};

Editor.prototype.addObject = function(object, callback) {
    var self = this;

    self.createObject(object, callback);
    self.addAction("add", object.getData());
};

Editor.prototype.removeObject = function(object) {
    var self = this;

    self.destroyObject(object);
    self.addAction("remove", object.getData());
};

// Do not call directly. Call addObject instead
Editor.prototype.createObject = function(object, callback) {
    var self = this;

    self.objects.push(object);

    // Always set objectId to be higher than any object's id
    // For example when you load a scene the objects already have id's, so objects created after should have higher id's.
    self.objectId = Math.max(self.objectId, object.id+1);

    // Load the ThreeJS mesh
    if(object.mesh !== null) {
        self.loader.load(object.mesh, function(geometry, materials) {

            var material = Utils.createMaterial(materials);

            // Create mesh
            var mesh = new THREE.Mesh(geometry, material);
            if(mesh.material.color) object.material.color = mesh.material.color.getHex();
            self.scene.add(mesh);

            // Create outline
            var outline = new THREE.BoxHelper(mesh, 0x00ffff);
            outline.visible = false;
            self.scene.add(outline);

            // Create raycast detector (which is the mesh)
            var raycastDetector = mesh;
            self.raycastDetectors.push(raycastDetector);

            // Transform target
            var transformTarget = mesh;

            object.setVisual(mesh, outline, raycastDetector, transformTarget);
            if(callback) callback(object);

        } );
    }
    else if(object.light !== null) {

        var light, outline, raycastDetector, transformTarget;

        if(object.light.type == "point") {

            light = new THREE.PointLight();
            light.distance = 10;
            outline = new THREE.PointLightHelper(light, 0.5);
            raycastDetector = outline;
            transformTarget = light;

        } else if(object.light.type == "dir") {

            light = new THREE.DirectionalLight();
            outline = new THREE.DirectionalLightHelper(light, 1);
            outline.matrix = new THREE.Matrix4();
            outline.matrixAutoUpdate = true;
            raycastDetector = outline.lightPlane;
            transformTarget = outline;
        }

        self.raycastDetectors.push(raycastDetector);
        object.setVisual(light, outline, raycastDetector, transformTarget);
        self.scene.add(light);
        self.scene.add(outline);

        if(object.light.castShadow) self.setShadowCaster(object, true);

        self.updateThreeJS();

        if(callback) callback(object);
    }
};

// Do not call directly. Call removeObject instead
Editor.prototype.destroyObject = function(object) {
    var self = this;

    self.selectObject(null); // Deselect before destroying

    // Remove object
    self.objects.splice(self.objects.indexOf(object), 1);

    // Remove visual
    if(object.visual) {
        self.scene.remove(object.visual);
    }

    // Remove outline
    if(object.outline) {
        self.scene.remove(object.outline);
    }

    // Remove raycast detector
    if(object.raycastDetector) {
        self.raycastDetectors.splice(self.raycastDetectors.indexOf(object.raycastDetector), 1);
        self.scene.remove(object.raycastDetector); // Since the raycast detector is often the visual or outline, this step could be redundant
    }

    // Turn off shadow mapping if the light casts shadows
    if(object.light !== null && object.light.castShadow) {
        self.enableShadowMap(false);
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
        var object = new ObjectEdit(data);
        self.addObject(object, self.selectObject.bind(self));
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
    var object = new ObjectEdit(data);
    self.addObject(object);
};

Editor.prototype.createAsset = function(assetName, x, y, z) {
    var self = this;

    var asset = self.getAssetByName(assetName);
    if(asset == null) return;
    var data = ObjectEdit.createFromAsset(asset);
    data.id = self.getUniqueId();
    data.name = self.getUniqueName(assetName);
    data.position[0] = x || 0; // x,y,z params are optional
    data.position[1] = y || 0;
    data.position[2] = z || 0;
    var object = new ObjectEdit(data);
    self.addObject(object);
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
        self.undoAction();
    } else if(key == 89) { // y
        self.redoAction();
    } else if(key == 46) { // DEL
        self.removeSelected();
    } else if(key == 49) { // 1
        self.setModeTranslate();
        $("#translate-button").addClass("selected");
        $("#rotate-button").removeClass("selected");
        $("#scale-button").removeClass("selected");
    } else if(key == 50) { // 2
        self.setModeRotate();
        $("#translate-button").removeClass("selected");
        $("#rotate-button").addClass("selected");
        $("#scale-button").removeClass("selected");
    } else if(key == 51) { // 3
        self.setModeScale();
        $("#translate-button").removeClass("selected");
        $("#rotate-button").removeClass("selected");
        $("#scale-button").addClass("selected");
    } else if(key == 67) { // c
        self.copyObject();
    } else if(key == 86) { // v
        self.pasteObject();
    }
};

Editor.prototype.onKeyDown = function(key, ctrl) {
    var self = this;

    if(key == 87) { // w
        self.cameraControls.zoom(1);
    }

    if(key == 65) { // a
        self.cameraControls.pan(2, 0);
    }

    if(key == 83) { // s
        self.cameraControls.zoom(-1);
    }

    if(key == 68) { // d
        self.cameraControls.pan(-2, 0);
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
        //self.selected.outline.visible = false;
        self.scene.remove(self.transformControls);
        self.transformControls.detach(self.selected.transformTarget);
    }

    // Select object
    if(object) {
        self.transformControls.attach(object.transformTarget);
        self.scene.add(self.transformControls);
        // Only show outline on invisible objects
        //object.outline.visible = true;
        //object.outline.visible = !object.visible;
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
}

Editor.prototype.duplicateSelected = function() {
    var self = this;
    if(self.selected === null) return;

    self.duplicateObject(self.selected);
}

Editor.prototype.setModeTranslate = function() {
    var self = this;
    self.transformControls.setMode("translate");
    self.transformControls.setSpace("world");
}

Editor.prototype.setModeRotate = function() {
    var self = this;
    self.transformControls.setMode("rotate");
    self.transformControls.setSpace("world");
}

Editor.prototype.setModeScale = function() {
    var self = this;
    self.transformControls.setMode("scale");
    self.transformControls.setSpace("local");
}

Editor.prototype.editScript = function(contents) {
    var self = this;
    var object = self.selected;
    if(object === null) return;

    if(object.script === null) {

        if(contents.length > 0) {
            // Create new script. Use the id of the object to make the script name
            var scriptObj = {
                name:"script" + object.id,
                contents:contents
            };

            self.scripts.push(scriptObj);
            object.script = scriptObj.name;
            self.save();
        }
    } else {
        var script = self.getScriptByName(object.script);
        script.contents = contents;
        self.save();
    }
}

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

}

Editor.prototype.setSkybox = function(skybox) {
    var self = this;

    // Disable skybox
    if(skybox == "none") {
        self.skyboxEnabled = false;
        self.renderer.autoClear = true;
        self.skybox = skybox;
        self.skyboxUrl = "";
        editorUI.updateSettings();
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

    // TO-DO: does threejs cache the image in case you load the same skybox again?
    var skyboxTexture = THREE.ImageUtils.loadTextureCube(urls, undefined, function(texture){
        self.skyboxMesh.material.uniforms["tCube"].value = skyboxTexture;
        self.skybox = skybox;
        self.skyboxEnabled = true;
        self.renderer.autoClear = false;
        editorUI.updateSettings();
    });
}

Editor.prototype.setGridVisible = function(visible) {
    var self = this;

    self.gridVisible = visible;
    self.grid.visible = visible;
    editorUI.updateSettings();
}


Editor.prototype.enableShadowMap = function(enabled) {
    var self = this;

    self.renderer.shadowMapEnabled = enabled;
    self.renderer.shadowMapType = THREE.PCFShadowMap;
    //self.renderer.shadowMapType = THREE.BasicShadowMap;
    //self.renderer.shadowMapType = THREE.PCFSoftShadowMap;
    self.updateThreeJS();

}

Editor.prototype.setShadowCaster = function(object, enabled) {
    var self = this;

    // Edit object
    object.light.castShadow = enabled;

    // TO-DO: handle multiple or none lights that shadow cast

    var light = object.visual;
    light.castShadow = enabled;
    
    //light.shadowCameraVisible = true;
    light.shadowCameraNear = 50;
    light.shadowCameraFar = 300;
    // light.shadowCameraFov = 10;
    
    var shadowWidth = 100;
    light.shadowCameraRight =  shadowWidth;
    light.shadowCameraLeft = -shadowWidth;
    light.shadowCameraTop =  shadowWidth;
    light.shadowCameraBottom = -shadowWidth;
    light.shadowBias = 0.0001;
    light.shadowDarkness = 0.3;
    light.shadowMapWidth = self.shadowMapSize;
    light.shadowMapHeight = self.shadowMapSize;

    self.enableShadowMap(enabled);
}

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
}