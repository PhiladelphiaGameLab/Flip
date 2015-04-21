var viewport, propertiesPane, codeEditor, editor;
var mouseX, mouseY;

$(document).ready(function() {
    $("#vertical").kendoSplitter({
        orientation: "vertical",
        panes: [
            { collapsible: false, resizable: false, size: "50px"},
            { collapsible: false},
            { collapsible: true, resizable: true, size: "200px"},
        ]
    });

    $("#horizontal").kendoSplitter({
        panes: [
            { collapsible: true, size: "200px" },
            { collapsible: false },
            { collapsible: true, size: "250px" }
        ]
    });

    // Add resize events to splitters
    var splitter;
    splitter = $("#vertical").data("kendoSplitter");
    splitter.bind("resize", onViewResize);
    splitter = $("#horizontal").data("kendoSplitter");
    splitter.bind("resize", onViewResize);

    viewport = $("#view-pane");
    editor = new Editor(viewport.innerWidth(), viewport.innerHeight());
    viewport.append(editor.renderer.domElement);
    propertiesPane = new PropertiesPane();
    $("#properties-pane").append(propertiesPane.gui.domElement);

    codeEditor = ace.edit("code-editor");
    codeEditor.setTheme("ace/theme/monokai");
    codeEditor.getSession().setMode("ace/mode/javascript");
    codeEditor.setShowPrintMargin(false);
    codeEditor.$blockScrolling = Infinity;
    codeEditor.getSession().setValue("function test(){\n\talert(\"flip\");\n}");

    $(document).on('keydown', function(e) {
        var tag = e.target.tagName.toLowerCase();
        var key = e.which;
        var ctrl = e.ctrlKey;
        if (tag != 'input' && tag != 'textarea'){
            editor.keyPress(key, ctrl);
        }
    });

});

// Return mouse position in [0,1] range relative to bottom-left of viewport (screen space)
function getMousePos(ev) {
    var x = (ev.pageX - viewport.offset().left)/viewport.innerWidth();
    var y = -(ev.pageY - viewport.offset().top)/viewport.innerHeight() + 1.0;
    return [x,y];
}

function allowDrop(ev) {
    ev.preventDefault();
}

function onDrag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
}

function onDrop(ev) {
    ev.preventDefault();

    var mouse = getMousePos(ev);
    var id = ev.dataTransfer.getData("text");
    editor.dropAsset(id, mouse[0], mouse[1]);
}

function onClick(ev) {
    // Ignore click if mouse moved too much between mouse down and mouse click
    if(Math.abs(mouseX - ev.pageX) > 3 || Math.abs(mouseY - ev.pageY) > 3) return;

    var mouse = getMousePos(ev);
    editor.click(mouse[0], mouse[1]);
    viewport.focus();
}

function onMouseDown(ev) {
    mouseX = ev.pageX;
    mouseY = ev.pageY;
}

function onViewResize() {
    editor.viewResize(viewport.innerWidth(), viewport.innerHeight());
    propertiesPane.resize($("#properties-pane").innerWidth());
    codeEditor.resize();
}


var UI = {};

UI.populateLibrary = function(assets) {

    var template = $("#library-item-template").html();

    for(var i = 0; i < assets.length; i++) {
        var asset = assets[i];
        var item = $("#library").append(template).children().last();
        item.find(".library-item-name").html(asset.name);
        var image = item.find(".library-item-image");
        image.attr("src", asset.icon);
        image.attr("id", asset.assetId);
    }
};

UI.selectObject = function(object) {
    propertiesPane.selectObject(object);
};
