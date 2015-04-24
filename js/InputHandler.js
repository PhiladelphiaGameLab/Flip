function InputHandler() {
    this.pressedKeys = {};
    var viewport = document.getElementById("view-pane");
    viewport.ondrop = function(event) { onDrop(event); };
    viewport.ondragover = function(event) { event.preventDefault(); };
    viewport.onclick = function(event) { onClick(event); };
    viewport.onmousedown = function(event) { onMouseDown(event); };
    window.addEventListener( 'keydown', this.onKeyDown.bind(this), false );
    window.addEventListener( 'keyup', this.onKeyUp.bind(this), false );
}
InputHandler.prototype.onKeyUp = function(event) {
	delete this.pressedKeys[event.keyCode];
    editor.orbitControls.onKeyUp();
};
InputHandler.prototype.onKeyDown = function(event) {
    var keyCode = event.keyCode;
    this.pressedKeys[keyCode] = true;
    editor.orbitControls.onKeyDown(keyCode);
};

// Return mouse position in [0,1] range relative to bottom-left of viewport (screen space)
function convertToScreenSpace(pageX, pageY) {
    var x = (pageX - viewport.offset().left)/viewport.innerWidth();
    var y = -(pageY - viewport.offset().top)/viewport.innerHeight() + 1.0;
    return [x,y];
}

function onDrag(event) {
    event.dataTransfer.setData("text", event.target.id);
}

function onDrop(event) {
    event.preventDefault();

    var mouse = convertToScreenSpace(event.pageX, event.pageY);
    var id = event.dataTransfer.getData("text");
    editor.dropAsset(id, mouse[0], mouse[1]);
}

function onClick(event) {
    // Ignore click if mouse moved too much between mouse down and mouse click
    if(Math.abs(mouseX - event.pageX) > 3 || Math.abs(mouseY - event.pageY) > 3) return;

    var mouse = convertToScreenSpace(event.pageX, event.pageY);
    editor.click(mouse[0], mouse[1]);
    viewport.focus();
}

function onMouseDown(event) {
    mouseX = event.pageX;
    mouseY = event.pageY;
}