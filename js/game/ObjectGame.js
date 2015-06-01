function ObjectGame (data) {

    var self = this;
    self.name = "";
    self.tag = "";
    self.visual = null; // ThreeJS object
    self.data = data

    if(data == null) {
        self.loaded();
        return;
    }

    self.name = data.name;
    self.tag = data.tag;

    // Load the ThreeJS mesh
    if(data.mesh !== null) {
        game.loader.load(data.mesh, function(geometry, materials) {
            
            var material = Utils.createMaterial(materials);
            var visual = null;

            if(data.physics) {

                var static = data.physics.type == "static";
                var mass = static ? 0.0 : data.physics.mass;
                var shape = data.physics.shape;

                var physicsMat = Physijs.createMaterial(
                    material,
                    data.physics.friction,
                    data.physics.restitution
                );

                if(shape == "sphere") {
                    visual = new Physijs.SphereMesh(geometry, physicsMat, mass);
                } else if(shape == "cube") {
                    visual = new Physijs.BoxMesh(geometry, physicsMat, mass);
                } else if(shape == "capsule") {
                    visual = new Physijs.CapsuleMesh(geometry, physicsMat, mass);
                } 
            } else {
                visual = new THREE.Mesh(geometry, material);
            }

            visual.position.fromArray(data.position);
            visual.rotation.fromArray(data.rotation);
            visual.scale.fromArray(data.scale);
            visual.visible = data.visible;
            visual.castShadow = data.castShadow;
            visual.receiveShadow = data.receiveShadow;
            self.visual = visual;
            self.loaded();

        });
    }
    else if(data.light !== null) {

        if(data.light.type == "point") {

            var visual = new THREE.PointLight(data.light.color, 1.0, data.light.distance);
            visual.position.fromArray(data.position);
            visual.visible = data.visible;
            self.visual = visual;
            self.loaded();

        } else if(data.light.type == "dir") {

            var visual = new THREE.DirectionalLight(data.light.color, 1.0);
            var position = Utils.getDirLightPosition(data.rotation);
            visual.position.copy(position);
            visual.visible = data.visible;
            self.visual = visual;
            self.loaded();
        }
    }
    else { loaded(); }
}

ObjectGame.prototype.loaded = function() {
    var self = this;
    game.addObject(self);
}

ObjectGame.prototype.update = function() {
    var self = this;
};

ObjectGame.prototype.getPosition = function() {
    var self = this;
    if(!self.visual) return null;

    return self.visual.position.clone(); // Make a copy in case it's not safe to return the vector directly
};

ObjectGame.prototype.move = function(x, y, z) {
    var self = this;
    if(!self.visual) return;

    var pos = self.visual.position;
    self.setPosition(pos.x + x, pos.y + y, pos.z + z);
}

ObjectGame.prototype.moveVector = function(vector) {
    var self = this;
    self.move(vector.x, vector.y, vector.z);
}

ObjectGame.prototype.setPosition = function(x, y, z) {
    var self = this;
    if(!self.visual) return;

    self.visual.position.set(x, y, z);
    self.visual.__dirtyPosition = true; // For physijs purposes
};

ObjectGame.prototype.getRotation = function() {
    var self = this;
    if(!self.visual) return null;

    return self.visual.rotation.clone(); // Make a copy in case it's not safe to return the vector directly

};

ObjectGame.prototype.setRotation = function(rotation) {
    var self = this;
    if(!self.visual) return;

    self.visual.rotation.copy(rotation);
    self.visual.__dirtyRotation = true;
};

// Input events
ObjectGame.prototype.onClick = function(x, y) {
}

ObjectGame.prototype.onKeyPress = function(keyCode) {
}

ObjectGame.prototype.onKeyDown = function(keyCode) {
}

ObjectGame.prototype.onMouseDrag = function(x, y, xmove, ymove) {
}

ObjectGame.prototype.onMouseMove = function(x, y, xmove, ymove) {
}

ObjectGame.prototype.onScroll = function(scroll) {
}
