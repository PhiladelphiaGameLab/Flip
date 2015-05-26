// Blockly area

function Workspace() {
    this.blocklyArea = $("#blockly-area");
    this.blocklyDiv = $("#blockly-div");
    this.toolbox = $("#toolbox");

    var ele = this.toolbox.get(0);
    console.log(ele);

    this.workspace = Blockly.inject(this.blocklyDiv.get(0), {toolbox: this.toolbox.get(0)});

    this.resize();
}

Workspace.prototype.resize = function() {

    // Compute the absolute coordinates and dimensions of blocklyArea.
    var offset = this.blocklyArea.offset();
    var left = offset.left;
    var top = offset.top;
    var width = this.blocklyArea.innerWidth();
    var height = this.blocklyArea.innerHeight();

    // Position blocklyDiv over blocklyArea.
    this.blocklyDiv.css({"left": left + "px", "top": top + "px", "width": width + "px", "height": height + "px"});
    Blockly.svgResize(this.workspace);
}