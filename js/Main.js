var viewport, propertiesPane, codeEditor, editor, game, renderer, inputHandler;
var disableEdit;

$(document).ready(function() {

    $("#loading-cover").show();

    // Initialize splitter panes
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

    // Create renderer
    viewport = $("#view-pane");
    var width = viewport.innerWidth();
    var height = viewport.innerHeight();
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(width, height);
    viewport.append(renderer.domElement);

    // Create editor
    editor = new Editor(renderer, width, height);
    
    // Create game
    game = new Game(renderer, width, height);

    // Create properties pane
    propertiesPane = new PropertiesPane();
    $("#properties-pane").append(propertiesPane.gui.domElement);

    // Create code
    codeEditor = ace.edit("code-editor");
    codeEditor.setTheme("ace/theme/monokai");
    codeEditor.getSession().setMode("ace/mode/javascript");
    codeEditor.setShowPrintMargin(false);
    codeEditor.$blockScrolling = Infinity;
    
    codeEditor.on('change', function(){
        if(disableEdit) return;
        var contents = codeEditor.getSession().getValue();
        editor.editScript(contents);
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
        if(game.active) {
            console.log("stopping game");
            game.stop();
            editor.resume();
            $("#screen-cover").hide();
            $("#play-button").attr("src", "img/play.png")
        } else {
            console.log("starting game");
            game.start(editor.data);
            editor.pause();
            $("#screen-cover").show();
            $("#play-button").attr("src", "img/stop.png")
        }
    });

    $("#screen-cover").hide();
    UI.selectObject(null);
    UI.setUndoRedo(false, false);
    $("#translate-button").addClass("selected");
    editor.init();
    inputHandler = new InputHandler();
});

$(window).load(function() {

    // Final initialize step once the window is loaded
    $("#loading-cover").hide();

});

function onViewResize() {
    var width = viewport.innerWidth();
    var height = viewport.innerHeight();
    renderer.setSize(width, height);
    editor.viewResize(width, height);
    game.viewResize(width, height);

    propertiesPane.resize($("#properties-pane").innerWidth());
    codeEditor.resize();
}


// Functions called by Editor that update the UI
var UI = {};

UI.populateLibrary = function(assets) {

    var template = $("#library-item-template").html();

    for(var i = 0; i < assets.length; i++) {
        var asset = assets[i];
        var item = $("#library").append(template).children().last();
        item.find(".library-item-name").html(asset.name);
        var image = item.find(".library-item-image");
        image.attr("src", asset.icon);
        image.attr("id", asset.name);
        image.attr("draggable", "true");
        image.get(0).addEventListener("dragstart", function(event){
            event.dataTransfer.setData("text", event.target.id);
        });
    }
};

UI.selectObject = function(object) {

    if(object === null) {
        $("#remove-button").addClass("disabled");
        $("#code-editor").hide();
    } else {
        $("#remove-button").removeClass("disabled");
        $("#code-editor").show();

        // Show script in code editor pane
        if(object.script === null) {
            codeEditor.getSession().setValue("");
        } else {
            var scriptRef = object.script;
            var script = editor.getScriptByName(scriptRef);
            var contents = script.contents;
            codeOld = contents;
            disableEdit = true; // Prevent saving the script when you initially open it
            codeEditor.getSession().setValue(contents);
            disableEdit = false;
        }
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
