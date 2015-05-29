CameraControls = function(camera) {

    var self = this;
    self.camera = camera;

    self.angleHorizontal = 0.0;
    self.angleVertical = 0.0;
}

CameraControls.prototype.update = function() {
    //var self = this;

    // Doesn't work all the time
    //var euler = self.camera.getWorldRotation();
    //self.setRotation(euler.y, euler.x, euler.z);
}

CameraControls.prototype.setRotation = function(x, y) {

    var self = this;
    self.angleHorizontal = x;
    self.angleVertical = y;

    var quatHorizontal = quaternion1;
    var quatVertical = quaternion2;
    var quatFinal = quaternion1;

    quatHorizontal.setFromAxisAngle(vector.set(0, 1, 0), self.angleHorizontal);
    quatVertical.setFromAxisAngle(vector.set(1, 0, 0), self.angleVertical);
    quatFinal.multiplyQuaternions(quatHorizontal, quatVertical);

    // TO-DO: deal with Z so that camera isn't inverted sometimes when loading

    self.camera.quaternion.copy(quatFinal);
}

CameraControls.prototype.rotate = function(x, y) {
    var self = this;

    var angleHorizontal = self.angleHorizontal + x * -0.005;
    var angleVertical = self.angleVertical + y * -0.005;

    self.setRotation(angleHorizontal, angleVertical);
}

CameraControls.prototype.zoom = function(scroll) {
    var self = this;

    var viewDir = vector.set(0, 0, -1).applyQuaternion(self.camera.quaternion);

    self.camera.position.add(viewDir.multiplyScalar(4.0 * scroll));
}

CameraControls.prototype.pan = function(x, y) {
    var self = this;

    var rightDir = vector1;
    var upDir = vector2;
    var pan = vector1;

    rightDir.set(1, 0, 0).applyQuaternion(self.camera.quaternion);
    upDir.set(0, 1, 0).applyQuaternion(self.camera.quaternion);

    pan = rightDir.multiplyScalar(-x).add(upDir.multiplyScalar(y));
    self.camera.position.add(pan);
}
