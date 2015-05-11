function Editor() {
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
        {name:"Sphere", icon:"img/cube.png", id:4, mesh:"data/assets/shapes/sphere.json"}

    ];

    self.objects = []; // Objects in the scene
    self.visuals = []; // ThreeJS objects. Need this array for doing raycasting.
    self.scripts = []; // Scripts used by objects. Each object stores a reference to one of these, or null.

    self.objectId = 0; // Used to assign id's to new objects

    self.renderer = null;
    self.scene = null;
    self.loader = null;
    self.camera = null;
    self.orbitControls = null;
    self.transformControls = null;
    self.raycaster = null;
    self.mouse = new THREE.Vector2();
    self.selected = null; // The currently selected object
    self.data = null; // Stores the game data
    self.requestAnimationId = 0;
    self.active = true; // Whether the editor is active (not in game)
}

Editor.prototype.init = function(renderer, width, height) {
    var self = this;

    self.renderer = renderer;
    self.scene = new THREE.Scene();

    self.camera = new THREE.PerspectiveCamera(70, width / height, 1, 1000);
    self.camera.position.x = 0;
    self.camera.position.y = 0;
    self.camera.position.z = 10;
    self.scene.add(self.camera);
    self.orbitControls = new THREE.OrbitControls( self.camera, self.renderer.domElement );
    self.transformControls = new THREE.TransformControls( self.camera, self.renderer.domElement );
    self.raycaster = new THREE.Raycaster();

    var pointLight = new THREE.PointLight(0xFFFFFF);
    pointLight.position.y = 1000;
    pointLight.position.z = 1000;
    pointLight.intensity = 1.0;
    pointLight.distance = 10000;
    self.scene.add(pointLight);
    var ambientLight = new THREE.AmbientLight( 0x404040 );
    self.scene.add(ambientLight);

    self.loader = new THREE.JSONLoader();

    UI.populateLibrary(self.assets);
    UI.loadFromLocalStorage();
    self.animate();
};

Editor.prototype.load = function(data) {
    // Assume that scene is empty when you load.

    var self = this;
    self.data = data;
    console.log("loading scene:", data.name);

    for(var i = 0; i < data.objects.length; i++) {
        var object = new ObjectEdit(data.objects[i]);
        self.createObject(object);
    }

    self.scripts = data.scripts; // TO-DO: is it ok not to copy?

    console.log(self.scripts);

}

Editor.prototype.save = function() {
    
    // TO-DO: it may be overkill to call getData() on every object like this when only 1 object is affected at a time
    // An alternative is to keep a save-state variable and modify it when actions occur and for undo/redo
    // Once we have saving to a server, this whole process may need to be rethought

    var self = this;

    console.log("saving scene");

    var data = {
        name : "scene",
        objects : [],
        scripts: []
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
    UI.saveToLocalStorage(data);
}

Editor.prototype.animate = function() {
    var self = this;

    self.requestAnimationId = requestAnimationFrame(self.animate.bind(self));
    self.renderer.render(self.scene, self.camera);
    self.transformControls.update();
};

Editor.prototype.getObjectByName = function(name) {
    var self = this;

    for (var i = 0; i < self.objects.length; i++) {
        if(self.objects[i].name == name) {
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

Editor.prototype.undoAction = function() {
    var self = this;

    if (!self.hasUndos()) return;
    var action = self.actionStack[self.actionStackPos];
    self.actionStackPos--;
    
    if(action.type == "edit") {

        var object = self.getObjectByName(action.data.name);
        object.setData(action.data.oldData);

    } else if(action.type == "add") {

        var object = self.getObjectByName(action.data.name);
        self.destroyObject(object);

    } else if(action.type == "remove") {

        var object = new ObjectEdit(action.data);
        self.createObject(object);
    }

    UI.setUndoRedo(self.hasUndos(), self.hasRedos());
    self.save();
    UI.updateSelectedObject();

    console.log("Undo action: " + action.type);
};

Editor.prototype.redoAction = function() {
    var self = this;

    if (!self.hasRedos()) return;
    self.actionStackPos++;
    var action = self.actionStack[self.actionStackPos];

    if(action.type == "edit") {

        var object = self.getObjectByName(action.data.name);
        object.setData(action.data.newData);

    } else if(action.type == "add") {

        var object = new ObjectEdit(action.data);
        self.createObject(object);

    } else if(action.type == "remove") {

        var object = self.getObjectByName(action.data.name);
        self.destroyObject(object);
    }

    UI.setUndoRedo(self.hasUndos(), self.hasRedos());
    self.save();
    UI.updateSelectedObject();

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

    UI.setUndoRedo(true, false);
    self.save();
    UI.updateSelectedObject();

    console.log("Add action " + action.type);
};

Editor.prototype.editObject = function(object) {
    
    // TO-DO: is it a good idea for the edit action to save the the entire state of the object,
    // or should the edit action only contain the property name, old value, and current value

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

    self.select(null); // Deselect before removing
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
    if(object.mesh !== undefined) {
        self.loader.load(object.mesh, function(geometry, materials) {
            
            var material;
            if(materials === undefined)material = new THREE.MeshLambertMaterial();
            else if(materials.length == 1) material = materials[0];
            else material = new THREE.MeshFaceMaterial(materials);

            // Create mesh
            var mesh = new THREE.Mesh(geometry, material);
            object.setVisual(mesh);
            self.visuals.push(mesh);
            self.scene.add(mesh);

            // Create outline
            var outline = new THREE.BoxHelper( object.visual, 0x00ffff );
            outline.visible = false;
            object.outline = outline;
            self.scene.add(outline);

            if(callback) {
                callback(object);
            }
        } );
    }
};

// Do not call directly. Call removeObject instead
Editor.prototype.destroyObject = function(object) {
    var self = this;

    // Remove object
    self.objects.splice(self.objects.indexOf(object), 1);

    // Remove visual
    if(object.visual) {
        self.visuals.splice(self.visuals.indexOf(object.visual), 1);
        self.scene.remove(object.visual);
    }

    // Remove outline
    if(object.outline) {
        self.scene.remove(object.outline);
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
        self.addObject(object, self.select.bind(self));
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
    var data = ObjectEdit.createData(asset);
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

Editor.prototype.viewResize = function(width, height) {
    var self = this;

    self.camera.aspect = width / height;
    self.camera.updateProjectionMatrix();
};

Editor.prototype.click = function(x, y) {
    var self = this;

    var selected = null;

    // Get the selected object
    self.mouse.x = x*2-1;
    self.mouse.y = y*2-1;
    self.raycaster.setFromCamera( self.mouse, self.camera );                
    var intersections = self.raycaster.intersectObjects( self.visuals );
    if (intersections.length > 0) {
        var mesh = intersections[0].object;
        var object = self.getObjectByName(mesh.userData);
        selected = object;
    }

    self.select(selected);
}

Editor.prototype.select = function(object) {

    // When object is null, it counts as a deselect

    var self = this;

    // Don't reselect
    if(self.selected == object) {
        return;
    }

    // Take away outline from previously selected object
    if(self.selected) {
        self.selected.outline.visible = false;
        self.scene.remove(self.transformControls);
        self.transformControls.detach(self.selected.visual);
    }

    // Show outline on selected object
    if(object) {
        self.transformControls.attach(object.visual);
        self.scene.add(self.transformControls);
        // Only show outline on invisible objects
        //object.outline.visible = true;
        object.outline.visible = !object.visible;
    }

    self.selected = object;
    UI.selectObject(object);
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

Editor.prototype.keyDown = function(key, ctrl) {
    // TO-DO: ctrl-z doesn't work now because sometimes the code editor takes focus for no reason

    var self = this;

    if(key == 90) { // z
        self.undoAction();
    } else if(key == 89) { // y
        self.redoAction();
    } else if(key == 46) { // DEL
        self.removeSelected();
    } else if(key == 68) { // d
        self.duplicateSelected();
    } else if(key == 87) { // w
        self.setModeTranslate();
        $("#translate-button").addClass("selected");
        $("#rotate-button").removeClass("selected");
        $("#scale-button").removeClass("selected");
    } else if(key == 69) { // e
        self.setModeRotate();
        $("#translate-button").removeClass("selected");
        $("#rotate-button").addClass("selected");
        $("#scale-button").removeClass("selected");
    } else if(key == 82) { // r
        self.setModeScale();
        $("#translate-button").removeClass("selected");
        $("#rotate-button").removeClass("selected");
        $("#scale-button").addClass("selected");
    } else if(key == 67) { // c
        self.copyObject();
    } else if(key == 86) { // v
        self.pasteObject();
    }

    self.orbitControls.onKeyDown(key);
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

Editor.prototype.pause = function() {
    var self = this;
    cancelAnimationFrame(self.requestAnimationId); // Stop render loop
    self.active = false;
    self.orbitControls.enabled = false;
}

Editor.prototype.resume = function() {
    var self = this;
    self.animate(); // Restart render loop
    self.active = true;
    self.orbitControls.enabled = true;
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