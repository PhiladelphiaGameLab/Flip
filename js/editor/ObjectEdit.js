function ObjectEdit (data, callback) {
    var self = this;

    self.object3js = null; // ThreeJS object
    self.visual = null; // Visual representation of the object. For meshes this is the object itself, for lights this is the outline. Used for raycast detection.
    self.data = null;
    self.oldData = null; // Used for undo/redo

    self.setData(data);

    if(self.data.mesh !== null) {

        editor.loader.loadMesh(self.data.mesh, function(geometry, material) {

            var mesh = new THREE.Mesh(geometry, material);

            // If this object has no material, create a material based on the material in the ThreeJS mesh.
            // If this object already has a material, leave it alone
            if(self.data.material === null) {

                self.data.material = {
                    color: 0xffffff
                }

                if(material.color) {
                    self.data.material.color = mesh.material.color.getHex();
                }
            } 

            self.object3js = mesh;
            self.visual = mesh;

            loaded();

        } );
    }
    else if(self.data.light !== null) {

        var lightData = self.data.light;

        if(lightData.type == "point") {

            // Create visual
            var geometry = new THREE.SphereGeometry(0.5, 4, 2);
            var material = new THREE.MeshBasicMaterial({wireframe:true,fog:false});
            var visual = new THREE.Mesh(geometry, material);

            var light = new THREE.PointLight();
            self.object3js = light;
            self.visual = visual;
            loaded();

        } else if(lightData.type == "dir") {

            // Create visual
            var vertices = new Float32Array([-1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, -1, 1, 0, -1, -1, 0, -1, -1, 0, -1, -1, 0, 1, 0, 0, 0, 0, -5, 0]);
            var geometry = new THREE.BufferGeometry();
            geometry.addAttribute("position", new THREE.BufferAttribute(vertices, 3));
            var material = new THREE.LineBasicMaterial({fog:false});
            var visual = new THREE.Line(geometry, material, THREE.LinePieces);

            var light = new THREE.DirectionalLight();
            self.object3js = light;
            self.visual = visual;
            loaded();
            
        }
    }

    // Called once the object loads
    function loaded() {
        self.visual.userData = self.data.id;
        self.updateObject();
        self.oldData = self.getData();
        if(callback) callback(self);
    }
};

ObjectEdit.prototype.setData = function(data) {
    var self = this;

    self.data = Utils.unpackData(data);
    self.oldData = Utils.unpackData(data); // Weird
    self.updateObject();
};

ObjectEdit.prototype.getData = function() {

    var self = this;
    return Utils.packData(self.data);
};

ObjectEdit.prototype.addPhysics = function() {
    var self = this;
    self.data.physics = {
        type: "dynamic",
        friction: 0.5,
        restitution: 0.5,
        shape: "cube",
        mass : 1.0
    };
};

ObjectEdit.prototype.removePhysics = function() {
    var self = this;
    self.data.physics = null;
};


ObjectEdit.prototype.updateObject = function() {
    var self = this;

    if(self.object3js === null) return;

    self.visual.position.fromArray(self.data.position);
    self.visual.rotation.fromArray(self.data.rotation);
    self.visual.scale.fromArray(self.data.scale);

    if(self.data.mesh) {

        self.object3js.castShadow = self.data.castShadow;
        self.object3js.receiveShadow = self.data.receiveShadow;

        var materials = Utils.getMaterials(self.visual.material);
        for(var i = 0; i < materials.length; i++) {
            var material = materials[i];
            
            material.color.setHex(self.data.material.color);

            if(self.data.visible) {
                material.transparent = material.transparentOld;
                material.opacity = material.opacityOld;
            } else {
                material.transparent = true;
                material.opacity = material.opacityOld * 0.4;
                self.object3js.castShadow = false;
                self.object3js.receiveShadow = false;
            } 
        } 
    }

    if(self.data.light) {

        var light = self.object3js;
        var outline = self.visual;
        var lightData = self.data.light;
        var visible = self.data.visible;

        light.visible = visible;
        light.color.setHex(lightData.color);
        outline.material.color.setHex(lightData.color);

        if(lightData.type == "point") {
            light.distance = lightData.distance;
            light.position.fromArray(self.data.position);
        } else if(lightData.type == "dir") {
            // Dir light treat their position as their direction, so convert rotation to position
            var position = Utils.getDirLightPosition(self.data.rotation);
            light.position.copy(position);
            light.target.position.set(0, 0, 0);

            // Set shadow properties
            var shadowRes = 2048;
            var shadowWidth = 100;

            light.shadowCameraNear = 50;
            light.shadowCameraFar = 300;
            light.shadowCameraRight =  shadowWidth;
            light.shadowCameraLeft = -shadowWidth;
            light.shadowCameraTop =  shadowWidth;
            light.shadowCameraBottom = -shadowWidth;
            light.shadowBias = 0.0001;
            light.shadowDarkness = 0.3;
            light.shadowMapWidth = shadowRes;
            light.shadowMapHeight = shadowRes;
            //light.shadowCameraFov = 10;
            //light.shadowCameraVisible = true;

            var castShadow = lightData.castShadow;
            light.castShadow = castShadow;
            editor.setShadowCaster(self, castShadow && visible);
        }
    }    
};

ObjectEdit.prototype.dispose = function() {
    var self = this;
    if(self.data.light) {
        self.visual.geometry.dispose();
        self.visual.material.dispose();
    }
};
