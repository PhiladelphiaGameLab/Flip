CameraControls = function(camera) {

    var self = this;
    self.camera = camera;

    self.angleHorizontal = 0.0;
    self.angleVertical = 0.0;

    // Third person camera
    self.thirdPerson = false;
    self.radius = 0;
    self.minRadius = -100000;
    self.maxRadius = 100000;
    self.lookAt = new THREE.Vector3(0,0,0);

    self.maxAngle = 100000;
    self.minAngle = -100000;
}

// CameraControls.prototype.update = function() {
//     //var self = this;

//     // Doesn't work all the time
//     //var euler = self.camera.getWorldRotation();
//     //self.setRotation(euler.y, euler.x, euler.z);
// }

CameraControls.prototype.setRotation = function(x, y) {

    var self = this;

    // Set limits for rotation
    if (y > self.maxAngle) y = self.maxAngle;
    if (y < self.minAngle) y = self.minAngle;

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

    if(self.thirdPerson) {
        self.setZoom(self.radius);
    }
};

CameraControls.prototype.rotate = function(x, y) {
    var self = this;

    var angleHorizontal = self.angleHorizontal + x * -0.005;
    var angleVertical = self.angleVertical + y * -0.005;

    self.setRotation(angleHorizontal, angleVertical);
};

CameraControls.prototype.setZoom = function(zoom) {
    var self = this;

    if(!self.thirdPerson) return;

    zoom = -Math.min(Math.max(zoom, self.minRadius), self.maxRadius);
    self.radius = -zoom;

    var viewDir = vector.set(0, 0, -1).applyQuaternion(self.camera.quaternion);
    var position = viewDir.multiplyScalar(4.0 * zoom).add(self.lookAt);
    self.camera.position.copy(position);
}

CameraControls.prototype.zoom = function(zoom) {
    var self = this;

    if(self.thirdPerson) {
        self.setZoom(self.radius - zoom);
        return;
    }

    var viewDir = vector.set(0, 0, -1).applyQuaternion(self.camera.quaternion);
    self.camera.position.add(viewDir.multiplyScalar(4.0 * zoom));
};

CameraControls.prototype.pan = function(x, y) {
    var self = this;

    var rightDir = vector1;
    var upDir = vector2;
    var pan = vector1;

    rightDir.set(1, 0, 0).applyQuaternion(self.camera.quaternion);
    upDir.set(0, 1, 0).applyQuaternion(self.camera.quaternion);

    pan = rightDir.multiplyScalar(-x).add(upDir.multiplyScalar(y));
    self.camera.position.add(pan);
};


// Turn the camera into a third person camera
CameraControls.prototype.setThirdPerson = function(radius, minRadius, maxRadius, lookAt) {
    var self = this;

    self.thirdPerson = true;
    self.radius = radius;
    self.minRadius = minRadius;
    self.maxRadius = maxRadius;
    self.lookAt = lookAt;

    self.setZoom(radius);
};

CameraControls.prototype.limitRotation = function(minAngle, maxAngle) {
    var self = this;
    self.minAngle = minAngle;
    self.maxAngle = maxAngle;
}