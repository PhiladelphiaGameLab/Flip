function ObjectGame (data, onLoad) {

    var self = this;
    self.object3js = null; // ThreeJS object
    self.script = null;

    var data = Utils.unpackData(data);
    self.data = data;

    function loaded() {

        // Add a short timer before being loaded.
        // This allows scripts to be initialized if they are added after the object is created 
        window.setTimeout(function(){
            game.addObject(self);
            self.loaded(); // Handled by subclasses
            if(onLoad) onLoad(self);
        }, 10);
    }

    if(data == null) {
        loaded();
        return;
    }

    self.name = data.name;
    self.tag = data.tag;

    // Create the script
    if(data.script !== null) {
        self.script = new window[data.script](self);
    }

    // Load the ThreeJS mesh
    if(data.mesh !== null) {
        game.loader.loadMesh(data.mesh, function(geometry, material) {
            
            var object3js = null;

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
                    object3js = new Physijs.SphereMesh(geometry, physicsMat, mass);
                } else if(shape == "cube") {
                    object3js = new Physijs.BoxMesh(geometry, physicsMat, mass);
                } else if(shape == "capsule") {
                    object3js = new Physijs.CapsuleMesh(geometry, physicsMat, mass);
                } 
            } else {
                object3js = new THREE.Mesh(geometry, material);
            }

            // Set material
            var meshMaterials = Utils.getMaterials(material);
            for(var i = 0; i < meshMaterials.length; i++) {
                var material = meshMaterials[i];
                material.color.setHex(data.material.color);
            }

            object3js.position.fromArray(data.position);
            object3js.rotation.fromArray(data.rotation);
            object3js.scale.fromArray(data.scale);
            object3js.visible = data.visible;
            object3js.castShadow = data.castShadow;
            object3js.receiveShadow = data.receiveShadow;
            self.object3js = object3js;
            loaded();
        });
    }
    else if(data.light !== null) {

        if(data.light.type == "point") {

            var object3js = new THREE.PointLight(data.light.color, 1.0, data.light.distance);
            object3js.position.fromArray(data.position);
            object3js.visible = data.visible;
            self.object3js = object3js;
            loaded();

        } else if(data.light.type == "dir") {

            var object3js = new THREE.DirectionalLight(data.light.color, 1.0);
            var position = Utils.getDirLightPosition(data.rotation);
            object3js.position.copy(position);
            object3js.visible = data.visible;
            self.object3js = object3js;
            loaded();
        }
    }
    else { loaded(); }
}

ObjectGame.prototype.loaded = function() {
    var self = this;

    if(self.script !== null) self.script.init();
};

ObjectGame.prototype.update = function() {
    var self = this;

    if(self.script !== null) self.script.update();
};

ObjectGame.prototype.getPosition = function() {
    var self = this;
    if(!self.object3js) return null;

    return self.object3js.position.clone(); // Make a copy in case it's not safe to return the vector directly
};

ObjectGame.prototype.move = function(x, y, z) {
    var self = this;
    if(!self.object3js) return;

    var pos = self.object3js.position;
    self.setPosition(pos.x + x, pos.y + y, pos.z + z);
};

ObjectGame.prototype.moveVector = function(vector) {
    var self = this;
    self.move(vector.x, vector.y, vector.z);
};

ObjectGame.prototype.setPosition = function(x, y, z) {
    var self = this;
    if(!self.object3js) return;

    self.object3js.position.set(x, y, z);
    self.object3js.__dirtyPosition = true; // For physijs purposes
};

ObjectGame.prototype.getRotation = function() {
    var self = this;
    if(!self.object3js) return null;

    return self.object3js.rotation.clone(); // Make a copy in case it's not safe to return the vector directly

};

ObjectGame.prototype.setRotation = function(rotation) {
    var self = this;
    if(!self.object3js) return;

    self.object3js.rotation.copy(rotation);
    self.object3js.__dirtyRotation = true;
};
