function ObjectGame (data, onLoad) {

    var self = this;
    self.object3js = null; // ThreeJS object
    self.script = null;
    self.physicsObject = null;
    self.loaded = false;

    var data = Utils.unpackData(data);
    self.data = data;

    function loaded() {
        self.loaded = true;
        if(self.script) self.script.init();
        game.addObject(self);
        if(onLoad) onLoad(self);
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
            
            // Set material
            var meshMaterials = Utils.getMaterials(material);
            for(var i = 0; i < meshMaterials.length; i++) {
                var material = meshMaterials[i];
                material.color.setHex(data.material.color);
            }

            function initMesh(mesh) {
                mesh.userData = self;
                mesh.position.fromArray(data.position);
                mesh.rotation.fromArray(data.rotation);
                mesh.scale.fromArray(data.scale);
                mesh.visible = data.visible;
                mesh.castShadow = data.castShadow;
                mesh.receiveShadow = data.receiveShadow;
            }

            if(data.physics) {

                var static = data.physics.type == "static";
                var mass = static ? 0.0 : data.physics.mass;
                var shape = data.physics.shape;

                var physicsMat = Physijs.createMaterial(
                    material,
                    data.physics.friction,
                    data.physics.restitution
                );

                var physicsObject = null;

                if(shape == "sphere") {
                    physicsObject = new Physijs.SphereMesh(geometry, physicsMat, mass);
                } else if(shape == "cube") {
                    physicsObject = new Physijs.BoxMesh(geometry, physicsMat, mass);
                } else if(shape == "capsule") {
                    physicsObject = new Physijs.CapsuleMesh(geometry, physicsMat, mass);
                }

                initMesh(physicsObject);
                self.object3js = physicsObject;
                self.physicsObject = physicsObject;

                if(self.script && self.script.hasOnCollide) {
                    physicsObject.addEventListener('collision', function(other, v, r, n) {
                        self.script.onCollide(other, v, r, n);
                    });
                }
                

                physicsObject.addEventListener('ready', function() {
                    //console.log("ready");
                });

                loaded();

            } else {
                var mesh = new THREE.Mesh(geometry, material);
                initMesh(mesh);
                self.object3js = mesh;
                loaded();
            }
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
