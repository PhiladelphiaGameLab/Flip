function Aimer(data) {
    var self = this;
    ObjectGame.call(self, data);
}

Aimer.prototype = Object.create(ObjectGame.prototype);
Aimer.prototype.constructor = Aimer;

Aimer.prototype.loaded = function() {
    var self = this;
    
    // Create camera attached to player
    self.camera = new THREE.PerspectiveCamera(70, game.width / game.height, 1, 1000);
    self.cameraControls = new CameraControls(self.camera);
    game.setCamera(self.camera);

    self.visual.visible = false;

    ObjectGame.prototype.loaded.call(self);
}

Aimer.prototype.update = function() {
    var self = this;
    ObjectGame.prototype.update.call(self);
};

Aimer.prototype.onClick = function(x, y) {
    // Throw ball
}

Aimer.prototype.onMouseDrag = function(x, y, xmove, ymove) {
    var self = this;
    self.cameraControls.rotate(xmove, ymove);
}

Aimer.prototype.onKeyDown = function(keyCode) {
    var self = this;
    var speed = 1.0;

    if(keyCode == 87) { // w
        self.cameraControls.zoom(speed);
    }

    if(keyCode == 65) { // a
        self.cameraControls.rotate(-speed, 0);
    }

    if(keyCode == 83) { // s
        self.cameraControls.zoom(-speed);
    }

    if(keyCode == 68) { // d
        self.cameraControls.rotate(speed, 0);
    }
}