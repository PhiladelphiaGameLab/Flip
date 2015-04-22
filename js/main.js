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
    editor = new Editor();
    editor.init(viewport.innerWidth(), viewport.innerHeight());
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


    $("#undo-button").click(function() {
        editor.undoAction();
    });

    $("#redo-button").click(function() {
        editor.redoAction();
    });

    $("#remove-button").click(function() {
        editor.removeSelected();
    });

    $("#translate-button").click(function() {
        editor.setModeTranslate();
        $("#translate-button").addClass("selected");
        $("#rotate-button").removeClass("selected");
        $("#scale-button").removeClass("selected");
    });

    $("#rotate-button").click(function() {
        editor.setModeRotate();
        $("#translate-button").removeClass("selected");
        $("#rotate-button").addClass("selected");
        $("#scale-button").removeClass("selected");
    });

    $("#scale-button").click(function() {
        editor.setModeScale();
        $("#translate-button").removeClass("selected");
        $("#rotate-button").removeClass("selected");
        $("#scale-button").addClass("selected");
    });

    $("#play-button").click(function() {
        editor.play();
    });

    UI.setUndoRedo(false, false);
    UI.selectObject(null);
    $("#translate-button").addClass("selected");

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
    if(object === null) {
        $("#remove-button").addClass("disabled");
    } else {
        $("#remove-button").removeClass("disabled");
    }

    propertiesPane.selectObject(object);
};

UI.updateSelectedObject = function() {
    propertiesPane.updateSelectedObject();
}

UI.setUndoRedo = function(hasUndos, hasRedos) {
    if(hasUndos) {
        $("#undo-button").removeClass("disabled");
    } else {
        $("#undo-button").addClass("disabled");
    }

    if(hasRedos) {
        $("#redo-button").removeClass("disabled");
    } else {
        $("#redo-button").addClass("disabled");
    }

};

UI.saveToLocalStorage = function(data) {

    if(!$("html").hasClass("localstorage")) return;

    var json = JSON.stringify(data);
    localStorage.setItem("editor", json);
};

UI.loadFromLocalStorage = function() {
    if(!$("html").hasClass("localstorage")) return;

    var json = localStorage.getItem("editor");
    if(json == null) return;

    var data = JSON.parse(json);
    editor.load(data);
};

UI.clearLocalStorage = function() {
    if(!$("html").hasClass("localstorage")) return;

    localStorage.removeItem("editor");
}
