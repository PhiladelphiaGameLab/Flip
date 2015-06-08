function Player(data) {
    var self = this;
    ObjectGame.call(self, data);
}

Player.prototype = Object.create(ObjectGame.prototype);
Player.prototype.constructor = Player;

Player.prototype.loaded = function() {
    var self = this;
    
    // Create camera attached to player
    self.camera = new THREE.PerspectiveCamera(70, game.width / game.height, 1, 1000);
    self.cameraControls = new CameraControls(self.camera);
    game.setCamera(self.camera);

    //self.object3js.visible = false;

    ObjectGame.prototype.loaded.call(self);
}

Player.prototype.update = function() {
    var self = this;
    ObjectGame.prototype.update.call(self);

    // Attach camera above player
    self.object3js.rotation.y = self.cameraControls.angleHorizontal;
    self.camera.position.copy(self.object3js.position);
    self.camera.position.y += 10;

};

Player.prototype.onClick = function(x, y) {
    // Throw ball



}

Player.prototype.onMouseDrag = function(x, y, xmove, ymove) {
    var self = this;
    self.cameraControls.rotate(xmove, ymove);
}

Player.prototype.onKeyDown = function(keyCode) {
    var self = this;

    var viewDir = vector1.set(0, 0, -1).applyQuaternion(self.object3js.quaternion);
    var upDir = vector2.set(0, 1, 0);
    var rightDir = vector2.crossVectors(viewDir, upDir);
    var speed = 1.0;

    if(keyCode == 87) { // w
        self.moveVector(viewDir.multiplyScalar(speed));
    }

    if(keyCode == 65) { // a
        self.moveVector(rightDir.multiplyScalar(-speed))
    }

    if(keyCode == 83) { // s
        self.moveVector(viewDir.multiplyScalar(-speed));
    }

    if(keyCode == 68) { // d
        self.moveVector(rightDir.multiplyScalar(speed));
    }
}