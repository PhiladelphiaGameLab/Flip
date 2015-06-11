function InputHandler(viewport) {

    var self = this;
    self.pressedKeys = {};
    self.mouseX = 0;
    self.mouseY = 0;
    self.mouseDownX = 0;
    self.mouseDownY = 0;
    self.mouseMoved = false;
    self.mouseDown = false;
    self.mouseButton = 0; // 1 = left | 2 = middle | 3 = right
    self.viewport = viewport;

    var viewportElem = viewport.get(0);
    viewportElem.ondrop = function(event) { self.onDrop(event); };
    viewportElem.ondragover = function(event) { event.preventDefault(); };
    viewportElem.onclick = function(event) { self.onClick(event); };
    viewportElem.onmousedown = function(event) { self.onMouseDown(event); };
    window.onmouseup = function(event) { self.onMouseUp(event); };
    window.onkeydown = function(event) { self.onKeyDown(event); };
    window.onkeyup = function(event) { self.onKeyUp(event); };
    window.onmousemove = function(event) { self.onMouseMove(event); };
    viewportElem.oncontextmenu = function(event) { event.preventDefault();};
    viewport.mousewheel(function(event) { self.onScroll(event); });
}

InputHandler.prototype.update = function(event) {
    for(var key in this.pressedKeys) {
        this.target.onKeyDown(key);
    }
};

InputHandler.prototype.onKeyUp = function(event) {
    delete this.pressedKeys[event.keyCode];
};

InputHandler.prototype.onKeyDown = function(event) {

    // Avoid capturing key events from input boxes and text areas
    var tag = event.target.tagName.toLowerCase();
    if (tag == 'input' || tag == 'textarea') return;

    var keyCode = event.keyCode;
    this.pressedKeys[keyCode] = true;
    var ctrl = event.ctrlKey;
    this.target.onKeyPress(keyCode, ctrl);
};

InputHandler.prototype.isKeyDown = function(key) {
    var isDown = this.pressedKeys[key] !== undefined;
    return isDown;
};

// Return mouse position in [0,1] range relative to bottom-left of viewport (screen space)
InputHandler.prototype.convertToScreenSpace = function(pageX, pageY) {
    var left = this.viewport.offset().left;
    var top = this.viewport.offset().top;
    var width = this.viewport.innerWidth();
    var height = this.viewport.innerHeight();

    var x = (pageX - left)/width;
    var y = -(pageY - top)/height + 1.0;
    return [x,y];
};

InputHandler.prototype.onDrop = function(event) {
    event.preventDefault();

    var mouse = this.convertToScreenSpace(event.pageX, event.pageY);
    var assetName = event.dataTransfer.getData("text");
    this.target.dropAsset(assetName, mouse[0], mouse[1]);
};

InputHandler.prototype.onClick = function(event) {
    if(this.mouseMoved) return;
    var screenSpace = this.convertToScreenSpace(event.pageX, event.pageY);
    this.target.onClick(screenSpace[0], screenSpace[1]);
};

InputHandler.prototype.onMouseDown = function(event) {

    this.viewport.focus();

    if(this.mouseButton > 0) return; // Don't process a mouse down from a different button until the current one is done

    this.mouseButton = event.which;
    this.mouseDown = true;

    var mouseX = event.pageX;
    var mouseY = event.pageY;

    this.mouseDownX = mouseX;
    this.mouseDownY = mouseY;
    this.mouseMoved = false;

    var screenSpace = this.convertToScreenSpace(mouseX, mouseY);

    this.target.onMouseDown(screenSpace[0], screenSpace[1], this.mouseButton)
};

InputHandler.prototype.onMouseUp = function(event) {
    this.mouseDown = false;
    this.mouseButton = 0;
};

InputHandler.prototype.onMouseMove = function(event) {
    
    var mouseX = event.pageX;
    var mouseY = event.pageY;

    // Ignore click if mouse moved too much between mouse down and mouse click
    if(Math.abs(this.mouseDownX - mouseX) > 3 || Math.abs(this.mouseDownY - mouseY) > 3) {
        this.mouseMoved = true;
    }

    if(this.mouseDown) {
        event.preventDefault();
    }

    var mouseMoveX = mouseX - this.mouseX;
    var mouseMoveY = mouseY - this.mouseY;

    this.mouseX = mouseX;
    this.mouseY = mouseY;

    var screenSpace = this.convertToScreenSpace(mouseX, mouseY);

    this.target.onMouseMove(screenSpace[0], screenSpace[1], mouseMoveX, mouseMoveY, this.mouseButton);
};

InputHandler.prototype.onScroll = function(event) {
    this.target.onScroll(event.deltaY);
};
