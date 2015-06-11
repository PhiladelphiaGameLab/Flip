// An Observer is created when there is no player in the scene.
// Lets you fly through the scene.

function Observer(object) {
    Script.call(this, object);    
}

Observer.prototype = Object.create(Script.prototype);
Observer.prototype.constructor = Observer;

Observer.prototype.init = function() {
    var self = this;
    self.camera = new THREE.PerspectiveCamera(70, game.width / game.height, 1, 1000);
    self.cameraControls = new CameraControls(self.camera);
    game.setCamera(self.camera);
};

Observer.prototype.update = function() {
    var self = this;
};

Observer.prototype.onMouseDrag = function(x, y, xmove, ymove) {
    var self = this;
    self.cameraControls.rotate(xmove, ymove)
};

Observer.prototype.onKeyDown = function(keyCode) {
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
};
