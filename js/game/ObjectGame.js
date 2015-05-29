function ObjectGame (data) {

    var self = this;
    self.name = "";
    self.tag = "";
    self.visual = null; // ThreeJS object

    function loaded() {
        game.addObject(self);
    }

    if(data == null) {
        loaded();
        return;
    }

    self.name = data.name;
    self.tag = data.tag;

    // Load the ThreeJS mesh
    if(data.mesh !== null) {
        game.loader.load(data.mesh, function(geometry, materials) {
            
            var material = Utils.createMaterial(materials);

            if(data.physics) {

                var static = data.physics.type == "static";
                var mass = static ? 0.0 : data.physics.mass;

                var physicsMat = Physijs.createMaterial(
                    material,
                    data.physics.friction,
                    data.physics.restitution
                );

                var visual = new Physijs.BoxMesh(geometry, physicsMat, mass);
                visual.position.fromArray(data.position);
                visual.rotation.fromArray(data.rotation);
                visual.scale.fromArray(data.scale);
                visual.visible = data.visible;
                self.visual = visual;
                loaded();
            } else {
                var visual = new THREE.Mesh(geometry, material);
                visual.position.fromArray(data.position);
                visual.rotation.fromArray(data.rotation);
                visual.scale.fromArray(data.scale);
                visual.visible = data.visible;
                self.visual = visual;
                loaded();
            }
        });
    }
    else if(data.light !== null) {

        if(data.light.type == "point") {

            var visual = new THREE.PointLight(data.light.color, 1.0, data.light.distance);
            visual.position.fromArray(data.position);
            visual.visible = data.visible;
            self.visual = visual;
            loaded();

        } else if(data.light.type == "dir") {

            var visual = new THREE.DirectionalLight(data.light.color, 1.0);
            var position = Utils.getDirLightPosition(data.rotation);
            visual.position.copy(position);
            visual.visible = data.visible;
            self.visual = visual;
            loaded();
        }
    }
    else { loaded(); }
}

ObjectGame.prototype.getPosition = function() {
    var self = this;
    if(!self.visual) return null;

    return self.visual.position.clone(); // Make a copy in case it's not safe to return the vector directly
};

ObjectGame.prototype.setPosition = function(position) {
    var self = this;
    if(!self.visual) return;

    self.visual.position.copy(position);
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


ObjectGame.prototype.update = function() {
    var self = this;

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
