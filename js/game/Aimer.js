function Aimer(data) {
    var self = this;
    ObjectGame.call(self, data);
}

Aimer.prototype = Object.create(ObjectGame.prototype);
Aimer.prototype.constructor = Aimer;

Aimer.prototype.loaded = function() {
    var self = this;
    
    // Create camera attached to aimer
    var lookAt = new THREE.Vector3(0,10,0);
    self.camera = new THREE.PerspectiveCamera(70, game.width / game.height, 1, 1000);
    self.cameraControls = new CameraControls(self.camera);
    self.cameraControls.setThirdPerson(13, 6, 18, lookAt);
    self.cameraControls.limitRotation(-Math.PI/2, 0);
    game.setCamera(self.camera);
    self.cameraControls.rotate(0, 100);

    self.object3js.visible = false;

    // Create shootable ball
    // TO-DO: probably better to reference an asset and call the createFromAsset function
    self.ballData = {
        name: "ball",
        id: 0,
        tag: "",
        asset: "Sphere",
        visible: true,
        castShadow: true,
        receiveShadow: true,
        script: null,
        mesh: "data/assets/shapes/sphere.json",
        material : {
            color: 41983
        },
        physics : {
            enabled: true,
            type: "dynamic",
            friction: 1.0,
            restitution: 0.5,
            shape: "sphere",
            mass: 1
        },
        light: null,
        camera: null,
        position: [0,0,0],
        rotation: [0,0,0],
        scale: [2,2,2],
    };

    ObjectGame.prototype.loaded.call(self);
};

Aimer.prototype.update = function() {
    var self = this;
    ObjectGame.prototype.update.call(self);
};

Aimer.prototype.shoot = function(x, y) {
    var self = this;
    var ray = game.getPickingRay(x, y);

    var direction = ray.direction;
    var origin = ray.origin.add(vector.copy(direction).multiplyScalar(5));

    self.ballData.position = origin.toArray();
    
    new ObjectGame(self.ballData, function(object) {
        var impulse = ray.direction.multiplyScalar(150.0);
        object.object3js.applyCentralImpulse(impulse);

    });
}

Aimer.prototype.onClick = function(x, y) {
    var self = this;
    self.shoot(x, y);
};

Aimer.prototype.onMouseDown = function(x, y, mouseButton) {
    var self = this;

    // Right click
    if(mouseButton == 3) {
        self.shoot(x, y);
    }
}

Aimer.prototype.onMouseDrag = function(x, y, xmove, ymove) {
    var self = this;
    self.cameraControls.rotate(xmove, ymove);
};

Aimer.prototype.onKeyDown = function(keyCode) {
    var self = this;
    var speed = 1.0;

    if(keyCode == 87) { // w
        self.cameraControls.zoom(speed/3);
    }

    if(keyCode == 65) { // a
        self.cameraControls.rotate(speed*5, 0);
    }

    if(keyCode == 83) { // s
        self.cameraControls.zoom(-speed/3);
    }

    if(keyCode == 68) { // d
        self.cameraControls.rotate(-speed*5, 0);
    }
};

Aimer.prototype.onScroll = function(scroll) {
    var self = this;
    self.cameraControls.zoom(scroll);
}
