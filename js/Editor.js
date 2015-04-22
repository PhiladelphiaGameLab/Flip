function Editor(width, height) {
    var self = this;

    // Undo/redo
    self.actionStack = [];
    self.actionStackPos = -1;
    self.actionLimit = 20;

    // Assets in the library
    self.assets = [
        {name:"MultiMat", icon:"img/cube.png", assetId:0, mesh:"data/assets/multimat/multimat.json"},
        {name:"Chair", icon:"img/cube.png", assetId:1, mesh:"data/assets/chair/chair.json"},
        {name:"Tree", icon:"img/cube.png", assetId:2}
    ];

    // Objects in the scene
    self.objects = [];
    self.visuals = []; // ThreeJS objects

    self.objectId = 0; // Used to assign id's to new objects

    self.renderer = null;
    self.scene = null;
    self.loader = null;
    self.camera = null;
    self.raycaster = null;
    self.mouse = new THREE.Vector2();
    self.selected = null;
    self.transformMode = 0; // Translate = 0 | Rotate = 1 | Scale = 2

    self.init(width, height);
}

Editor.prototype.init = function(width, height) {
    var self = this;

    self.renderer = new THREE.WebGLRenderer();
    self.renderer.setSize(width, height);

    self.scene = new THREE.Scene();

    self.camera = new THREE.PerspectiveCamera(70, width / height, 1, 1000);
    self.camera.position.x = 0;
    self.camera.position.y = 0;
    self.camera.position.z = 10;
    self.scene.add(self.camera);
    var controls = new THREE.OrbitControls( self.camera, self.renderer.domElement );
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
    self.animate();
};

Editor.prototype.animate = function() {
    var self = this;

    requestAnimationFrame(this.animate.bind(this));
    self.renderer.render(self.scene, self.camera);
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

Editor.prototype.getAssetById = function(id) {
    var self = this;

    for (var i = 0; i < self.assets.length; i++) {
        if(self.assets[i].assetId == id) {
            return self.assets[i];
        }
    }
    return null;
};

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

        var object = self.getObjectById(action.data.id);
        object.setData(action.data.oldData);

    } else if(action.type == "create") {

        var object = self.getObjectById(action.data.id);
        self.destroyObject(object);

    } else if(action.type == "destroy") {

        var object = new ObjectEdit(action.data);
        self.createObject(object);
    }

    UI.setUndoRedo(self.hasUndos(), self.hasRedos());

    console.log("Undo action: " + action.type);
};

Editor.prototype.redoAction = function() {
    var self = this;

    if (!self.hasRedos()) return;
    self.actionStackPos++;
    var action = self.actionStack[self.actionStackPos];

    if(action.type == "edit") {

        var object = self.getObjectById(action.data.id);
        object.setData(action.data.newData);

    } else if(action.type == "create") {

        var object = new ObjectEdit(action.data);
        self.createObject(object);

    } else if(action.type == "destroy") {

        var object = self.getObjectById(action.data.id);
        self.destroyObject(object);
    }

    UI.setUndoRedo(self.hasUndos(), self.hasRedos());

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

    console.log("Add action: " + action.type);
    //console.log(action.data);
    //console.log("Current stack:");
    //console.log(self.actionStack);
    //console.log(self.actionStackPos);
};

Editor.prototype.editObject = function(object) {
    var self = this;

    var newData = object.getData();
    var oldData = object.data;
    self.addAction("edit", {id:object.id, newData:newData, oldData:oldData});
    object.data = newData;
};

Editor.prototype.addObject = function(object) {
    var self = this;

    self.addAction("create", object.getData());
    self.createObject(object);
};

Editor.prototype.removeObject = function(object) {
    var self = this;

    self.select(null); // Deselect before removing
    self.addAction("destroy", object.getData());
    self.destroyObject(object);
};

// Do not call directly. Call addObject instead
Editor.prototype.createObject = function(object) {
    var self = this;

    self.objects.push(object);

    if(object.mesh !== undefined) {
        self.loader.load(object.mesh, function(geometry, materials) {
            var material = (materials.length == 1) ? materials[0] : new THREE.MeshFaceMaterial(materials);
            var mesh = new THREE.Mesh(geometry, material);
            object.setVisual(mesh);
            self.visuals.push(mesh);
            self.scene.add(mesh);
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

Editor.prototype.duplicateObject = function(object) {
    var self = this;

    var data = object.getData();
    data.id = self.getNewId();
    data.position[0] = 0;
    data.position[1] = 0;
    data.position[2] = 0;
    var object = new ObjectEdit(data);
    self.addObject(object);
};

Editor.prototype.createAsset = function(assetId, x, y, z) {
    var self = this;

    var asset = self.getAssetById(assetId);
    var data = ObjectEdit.createData(asset);
    data.position[0] = x || 0;
    data.position[1] = y || 0;
    data.position[2] = z || 0;
    data.id = self.getNewId();
    var object = new ObjectEdit(data);
    self.addObject(object);
};

Editor.prototype.dropAsset = function(assetId, x, y) {
    var self = this;

    var worldPosition = self.unprojectMousePosition(x, y);
    var worldX = Math.round(worldPosition.x);
    var worldY = Math.round(worldPosition.y);
    var worldZ = 0;

    self.createAsset(assetId, worldX, worldY, worldZ);
};

Editor.prototype.getNewId = function() {
    var self = this;
    return self.objectId++;
}

Editor.prototype.viewResize = function(width, height) {
    var self = this;

    self.camera.aspect = width / height;
    self.camera.updateProjectionMatrix();
    self.renderer.setSize(width, height);
};

Editor.prototype.click = function(x, y) {
    var self = this;

    if(self.objects.length == 0) return;

    var selected = null;

    // Get the selected object
    self.mouse.x = x*2-1;
    self.mouse.y = y*2-1;
    self.raycaster.setFromCamera( self.mouse, self.camera );                
    var intersections = self.raycaster.intersectObjects( self.visuals );
    if (intersections.length > 0) {
        var mesh = intersections[0].object;
        var object = self.getObjectById(mesh.userData);
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
    }

    // Show outline on selected object
    if(object) {

        if(object.outline) {
            object.outline.visible = true;
        } else {
            var outline = new THREE.BoxHelper( object.visual, 0x00ffff );
            object.outline = outline;
            self.scene.add(outline);
        }
    }

    self.selected = object;
    UI.selectObject(object);
};

Editor.prototype.unprojectMousePosition = function(x, y) {
    var self = this;
    var camera = self.camera;
    var vector = new THREE.Vector3();
    vector.set(x*2-1, y*2-1, 0.5); // NDC space
    vector.unproject(camera);
    var dir = vector.sub(camera.position).normalize();
    var distance = - camera.position.z / dir.z;
    var worldPosition = camera.position.clone().add(dir.multiplyScalar(distance));
    return worldPosition;
};

Editor.prototype.keyPress = function(key, ctrl) {
    // TO-DO: ctrl-z doesn't work now because sometimes the code editor takes focus for no reason

    var self = this;

    if(key == 90) { // z
        self.undoAction();
    } else if(key == 89) { // y
        self.redoAction();
    } else if(key == 46) { // DEL
        self.removeSelected();
    }
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
    self.transformMode = 0;
}

Editor.prototype.setModeRotate = function() {
    var self = this;
    self.transformMode = 1;
}

Editor.prototype.setModeScale = function() {
    var self = this;
    self.transformMode = 2;
}

Editor.prototype.play = function() {

}