function ObjectEdit (data) {

    this.visual = null;
    this.outline = null; // ThreeJS box that is shown when an object is selected
    this.position = [0,0,0];
    this.rotation = [0,0,0];
    this.scale = [1,1,1];
    this.setData(data);
}

ObjectEdit.prototype.setData = function(data) {
    var self = this;

    self.name = data.name;
    self.id = data.id;
    self.asset = data.asset;
    self.visible = data.visible;
    self.script = data.script;
    self.physics = self.copyPhysicsData(data.physics);
    self.mesh = data.mesh;

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
        asset: self.asset,
        visible: self.visible,
        script: self.script,
        physics: self.copyPhysicsData(self.physics),
        mesh: self.mesh,
        position: [self.position[0], self.position[1], self.position[2]],
        rotation: [self.rotation[0], self.rotation[1], self.rotation[2]],
        scale: [self.scale[0], self.scale[1], self.scale[2]]
    };

    return data;
};

// Static function.chec
// Create object data from asset data
ObjectEdit.createData = function(asset) {

    var data = {
        name: asset.name,
        id: 0,
        asset: asset.name,
        visible: true,
        script: asset.script || null,
        physics: asset.physics || null,
        mesh: asset.mesh || null,
        position: [0,0,0],
        rotation: [0,0,0],
        scale: [1,1,1]
    };

    return data;
};

ObjectEdit.prototype.copyPhysicsData = function(physics) {
    if(physics === null) return null;

    return {
        enabled : physics.enabled,
        type: physics.type,
        friction: physics.friction,
        restitution: physics.restitution,
        shape : physics.shape,
        mass : physics.mass
    };
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

ObjectEdit.prototype.setVisual = function(visual) {
    var self = this;
    self.visual = visual;
    self.updateVisual();
};

ObjectEdit.prototype.updateVisual = function() {
    var self = this;

    if(self.visual) {
        self.visual.position.fromArray(self.position);
        self.visual.rotation.fromArray(self.rotation);
        self.visual.scale.fromArray(self.scale);
        self.visual.visible = self.visible;
        self.visual.name = self.name;
        self.visual.userData = self.name;
    }

    if(self.outline) {
        self.outline.visible = !self.visible;
    }
};

ObjectEdit.prototype.updateFromVisual = function() {
    var self = this;

    if(self.visual) {
        self.position = [self.visual.position.x, self.visual.position.y, self.visual.position.z];
        self.rotation = [self.visual.rotation.x, self.visual.rotation.y, self.visual.rotation.z];
        self.scale = [self.visual.scale.x, self.visual.scale.y, self.visual.scale.z];
        self.visible = self.visual.visible;
    }
};

ObjectEdit.prototype.setName = function(name) {
    var self = this;

    self.name = name;
    self.updateVisual();
}

ObjectEdit.prototype.setPosition = function(x, y, z) {
    var self = this;

    self.position[0] = x;
    self.position[1] = y;
    self.position[2] = z;
    self.updateVisual();
};

ObjectEdit.prototype.setRotation = function(x, y, z) {
    var self = this;

    self.rotation[0] = x;
    self.rotation[1] = y;
    self.rotation[2] = z;
    self.updateVisual();
};

ObjectEdit.prototype.setScale = function(x, y, z) {
    var self = this;

    self.scale[0] = x;
    self.scale[1] = y;
    self.scale[2] = z;
    self.updateVisual();
};

ObjectEdit.prototype.setVisible = function(visible) {
    var self = this;

    self.visible = visible;
    self.updateVisual();
};