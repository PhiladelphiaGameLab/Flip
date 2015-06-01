function ObjectEdit (data) {

    this.visual = null;
    this.outline = null; // ThreeJS box that is shown when an object is selected
    this.raycastDetector = null; // Object that checks for raycasts
    this.position = [0,0,0];
    this.rotation = [0,0,0];
    this.scale = [1,1,1];
    this.setData(data);
}

ObjectEdit.prototype.setData = function(data) {
    var self = this;

    self.name = data.name;
    self.id = data.id;
    self.tag = data.tag;
    self.asset = data.asset;
    self.visible = data.visible;
    self.castShadow = data.castShadow;
    self.receiveShadow = data.receiveShadow;
    self.script = data.script;
    self.mesh = data.mesh;
    self.material = self.copyMaterialData(data.material);
    self.physics = self.copyPhysicsData(data.physics);
    self.light = self.copyLightData(data.light);
    self.camera = self.copyCameraData(data.camera);

    self.position[0] = data.position[0];
    self.position[1] = data.position[1];
    self.position[2] = data.position[2];
    self.rotation[0] = data.rotation[0];
    self.rotation[1] = data.rotation[1];
    self.rotation[2] = data.rotation[2];
    self.scale[0] = data.scale[0];
    self.scale[1] = data.scale[1];
    self.scale[2] = data.scale[2];
    
    self.data = self.getData(); // Used for undo/redo
    self.updateVisual();
};

ObjectEdit.prototype.getData = function() {
    var self = this;

    var data = {
        name: self.name,
        id: self.id,
        tag: self.tag,
        asset: self.asset,
        visible: self.visible,
        castShadow: self.castShadow,
        receiveShadow: self.receiveShadow,
        script: self.script,
        mesh: self.mesh,
        material: self.copyMaterialData(self.material),
        physics: self.copyPhysicsData(self.physics),
        light: self.copyLightData(self.light),
        camera: self.copyCameraData(self.camera),
        position: [self.position[0], self.position[1], self.position[2]],
        rotation: [self.rotation[0], self.rotation[1], self.rotation[2]],
        scale: [self.scale[0], self.scale[1], self.scale[2]]
    };

    return data;
};

// Static function.
// Create object data from asset data
ObjectEdit.createFromAsset = function(asset) {

    // If the asset has a mesh, create the default material
    var castShadow = (asset.castShadow === undefined) ? true : asset.castShadow;
    var receiveShadow = (asset.receiveShadow === undefined) ? true : asset.receiveShadow;

    var data = {
        name: asset.name,
        id: 0,
        tag: asset.tag || "",
        asset: asset.name,
        visible: true,
        castShadow: castShadow,
        receiveShadow: receiveShadow,
        script: asset.script || null,
        mesh: asset.mesh || null,
        material: asset.material || null,
        physics: asset.physics || null,
        light: asset.light || null,
        camera: asset.camera || null,
        position: [0,0,0],
        rotation: [0,0,0],
        scale: [1,1,1]
    };

    return data;
};

ObjectEdit.prototype.copyMaterialData = function(material) {
    if(material === null || material === undefined) return null;

    return {
        color: material.color
    }
}

ObjectEdit.prototype.copyPhysicsData = function(physics) {
    if(physics === null || physics === undefined) return null;

    return {
        enabled: physics.enabled,
        type: physics.type,
        friction: physics.friction,
        restitution: physics.restitution,
        shape : physics.shape,
        mass : physics.mass
    };
}

ObjectEdit.prototype.copyLightData = function(light) {
    if(light === null || light === undefined) return null;

    return {
        color: light.color,
        distance: light.distance || 0.0,
        type: light.type,
        castShadow: light.castShadow || false
    }
}

ObjectEdit.prototype.copyCameraData = function(camera) {
    if(camera === null || camera === undefined) return null;

    return {
        fov: camera.fov
    }
}

ObjectEdit.prototype.addPhysics = function() {
    var self = this;
    self.physics = {
        enabled: true,
        type: "dynamic",
        friction: 0.5,
        restitution: 0.5,
        shape: "sphere",
        mass : 1.0
    };
}

ObjectEdit.prototype.removePhysics = function() {
    var self = this;
    self.physics = null;
}

ObjectEdit.prototype.addMaterial = function() {
    var self = this;
    self.material = {
        color: 0xffffff
    }
}

ObjectEdit.prototype.setVisual = function(visual, outline, raycastDetector, transformTarget) {
    var self = this;
    self.visual = visual; // Actual ThreeJS object being modified (mesh, light, etc)
    self.outline = outline; // Outline around object
    self.raycastDetector = raycastDetector; // Thing that detects raycasts (usually the outline for lights)
    self.transformTarget = transformTarget; // Object that is visually transformed (outline for dir lights)
    self.updateVisual();

    self.visual.userData = self.id; // May not need this
    self.raycastDetector.userData = self.id;
    self.data = self.getData(); // Used for undo/redo
};

// Called when the transform controls move the object
ObjectEdit.prototype.updateFromVisual = function() {
    var self = this;

    if(self.transformTarget) {
        self.position[0] = self.transformTarget.position.x;
        self.position[1] = self.transformTarget.position.y;
        self.position[2] = self.transformTarget.position.z;

        self.rotation[0] = self.transformTarget.rotation.x;
        self.rotation[1] = self.transformTarget.rotation.y;
        self.rotation[2] = self.transformTarget.rotation.z;

        self.scale[0] = self.transformTarget.scale.x;
        self.scale[1] = self.transformTarget.scale.y;
        self.scale[2] = self.transformTarget.scale.z;
    }

    self.updateVisual();
};

ObjectEdit.prototype.updateVisual = function() {
    var self = this;

    if(self.transformTarget) {

        self.transformTarget.position.fromArray(self.position);
        self.transformTarget.rotation.fromArray(self.rotation);
        self.transformTarget.scale.fromArray(self.scale);

        if(self.mesh) {

            self.visual.castShadow = self.castShadow;
            self.visual.receiveShadow = self.receiveShadow;

            var materials = Utils.getMaterials(self.visual.material);
            for(var i = 0; i < materials.length; i++) {
                var material = materials[i];
                
                material.color.setHex(self.material.color);

                if(self.visible) {
                    material.transparent = material.transparentOld;
                    material.opacity = material.opacityOld;
                } else {
                    material.transparent = true;
                    material.opacity = material.opacityOld * 0.4;
                    self.visual.castShadow = false;
                    self.visual.receiveShadow = false;
                } 
            } 
        }

        if(self.light) {
            self.visual.visible = self.visible;
            self.visual.color.setHex(self.light.color);

            if(self.light.type == "point") {
                self.visual.distance = self.light.distance;
            } else {
                // Dir light treat their position as their direction, so convert rotation to position
                var position = Utils.getDirLightPosition(self.rotation);
                self.visual.position.copy(position);
                self.visual.target.position.set(0, 0, 0);
            }
            
            self.visual.updateMatrixWorld();
            self.outline.update(); // Light helpers have this function
        }
    }    

    if(self.outline) {
        //self.outline.visible = !self.visible;
    }
};