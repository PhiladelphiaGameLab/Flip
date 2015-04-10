function InputHandler() {
    this.pressedKeys = {};
    document.onkeydown = this.onKeyDown.bind(this);
    document.onkeyup = this.onKeyUp.bind(this);
}
InputHandler.prototype.onKeyUp = function(event) {
    delete this.pressedKeys[event.keyCode];
};
InputHandler.prototype.onKeyDown = function(event) {
    var keyCode = event.keyCode;
    if(keyCode == 37) {             // left arrow
        this.handleKeyEvent(event, gameSpace.pan.bind(gameSpace, -10, 0));
    } else if(keyCode == 38) {      // up arrow
        this.handleKeyEvent(event, gameSpace.pan.bind(gameSpace, 0, 10));
    } else if(keyCode == 39) {      // right arrow
        this.handleKeyEvent(event, gameSpace.pan.bind(gameSpace, 10, 0));
    } else if(keyCode == 40) {      // down arrow
        this.handleKeyEvent(event, gameSpace.pan.bind(gameSpace, 0, -10));
    } else if(keyCode == 61) {      // plus
        this.handleKeyEvent(event, gameSpace.zoom.bind(gameSpace, -10));
    } else if(keyCode == 173) {     // minus
        this.handleKeyEvent(event, gameSpace.zoom.bind(gameSpace, 10));
    }
};
InputHandler.prototype.handleKeyEvent = function(event, response) {
    event.preventDefault();
    this.pressedKeys[event.keyCode] = true;
    response();
};