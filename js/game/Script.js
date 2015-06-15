function Script (object) {

    var self = this;
    self.object = object;
    if(object.loaded) self.init(); // If script was added after the object was loaded, initialize now
}

Script.prototype.init = function() {
};

Script.prototype.update = function() {
};

Script.prototype.onClick = function(x, y) {
};

Script.prototype.onMouseDown = function(x, y, mouseButton) {
};

Script.prototype.onKeyPress = function(keyCode) {
};

Script.prototype.onKeyDown = function(keyCode) {
};

Script.prototype.onMouseDrag = function(x, y, xmove, ymove) {
};

Script.prototype.onMouseMove = function(x, y, xmove, ymove) {
};

Script.prototype.onScroll = function(scroll) {
};

Script.prototype.onCollide = function(otherObject, relativeVelocity, relativeRotation, contactNormal) {
};
