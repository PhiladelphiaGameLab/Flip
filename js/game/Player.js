function Player(data) {
    var self = this;
    ObjectGame.call(self, data);

    self.camera = new THREE.PerspectiveCamera(70, game.width / game.height, 1, 1000);
    self.cameraControls = new CameraControls(self.camera);
    game.setCamera(self.camera);
}

Player.prototype = Object.create(ObjectGame.prototype);
Player.prototype.constructor = Player;

Player.prototype.update = function() {
    var self = this;
    ObjectGame.prototype.update.call(self);
};

Player.prototype.onMouseDrag = function(x, y, xmove, ymove) {
    var self = this;
    self.cameraControls.rotate(xmove, ymove)
}

Player.prototype.onKeyDown = function(keyCode) {
    var self = this;
    
    if(keyCode == 87) { // w
        self.cameraControls.zoom(1);
    }

    if(keyCode == 65) { // a
        self.cameraControls.pan(2, 0);
    }

    if(keyCode == 83) { // s
        self.cameraControls.zoom(-1);
    }

    if(keyCode == 68) { // d
        self.cameraControls.pan(-2, 0);
    }
}