var editorUI = new EditorUI();

$(document).ready(function() {
    editorUI.init();
});

$(window).load(function() {
    editorUI.load();
});

function EditorUI() {

    var self = this;

    self.viewport = null;
    self.propertiesPane = null;
    self.codeEditor = null;
    self.workspace = null;
    self.editor = null;
    self.game = null;
    self.renderer = null;
    self.inputHandler = null;
    self.loader = null;
    self.inGame = false;

    self.disableEdit = false;
    self.inWorkspace = false;
    self.loaded = false;
}

EditorUI.prototype.init = function() {

    var self = this;

    $("#loading-cover").show();

    // Initialize splitter panes
    $("#vertical").kendoSplitter({
        orientation: "vertical",
        panes: [
            { collapsible: false, resizable: false, size: "50px"},
            { collapsible: false},
            { collapsible: true, resizable: true, size: "110px"},
        ],
        resize: function(e) {self.onViewResize();}
    });

    $("#horizontal").kendoSplitter({
        panes: [
            { collapsible: true, size: "200px" },
            { collapsible: false },
            { collapsible: true, size: "250px" }
        ],
        resize: function(e) {self.onViewResize();}
    });

    var helpWindow = $("#help-window");
    if (!helpWindow.data("kendoWindow")) {
        helpWindow.kendoWindow({
            visible: false,
            animation: false,
            width: "500px",
            title: "Instructions",
            actions: [
                "Close"
            ]
        });
    }


    // Create renderer
    var viewport = $("#view-pane");
    var width = viewport.width();
    var height = viewport.height();
    var renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
    viewport.append(renderer.domElement);

    // Create loader
    var loader = new Loader();

    // Create editor
    var editor = new Editor(renderer, width, height, loader);

    // Input handler
    var inputHandler = new InputHandler(viewport);
    inputHandler.target = editor;
    
    // Create properties pane
    var propertiesPane = new PropertiesPane(editor);
    $("#properties-pane").append(propertiesPane.gui.domElement);

    // Create code editor
    var codeEditor = ace.edit("code-editor");
    codeEditor.setTheme("ace/theme/monokai");
    codeEditor.getSession().setMode("ace/mode/javascript");
    codeEditor.setShowPrintMargin(false);
    codeEditor.$blockScrolling = Infinity;
    
    codeEditor.on('change', function(){
        if(self.disableEdit) return;
        var contents = codeEditor.getSession().getValue();
        editor.editScript(contents);
        console.log("edit script");
    });

    // Create Blockly workspace
    var workspace = new Workspace();

    // Bind events to buttons
    $("#undo-button").click(function() {
        editor.undoHandler.undoAction();
    });

    $("#redo-button").click(function() {
        editor.undoHandler.redoAction();
    });

    $("#remove-button").click(function() {
        editor.removeSelected();
    });

    $("#translate-button").click(function() {
        self.setTransformMode(0);
    });

    $("#rotate-button").click(function() {
        self.setTransformMode(1);
    });

    $("#scale-button").click(function() {
        self.setTransformMode(2);
    });

    $("#play-button").click(function() {
        if(self.inGame) {
            self.stopGame();
        } else {
            self.startGame();
        }
    });

    $("#settings-button").click(function() {
        editor.selectObject(null);
        propertiesPane.openSettings();
    });

    $("#help-button").click(function() {
        self.openHelpWindow();
    })

    $("#puzzle-button").click(function() {
        if(self.inWorkspace) self.showCodeEditor();
        else self.showWorkspace();
    });

    $("#puzzle-button").hide(); // Hide for now because it doesn't do anything

    $("#screen-cover").hide();
    self.setUndoRedo(false, false);
    $("#translate-button").addClass("selected");

    self.viewport = viewport;
    self.propertiesPane = propertiesPane;
    self.codeEditor = codeEditor;
    self.workspace = workspace;
    self.editor = editor;
    self.renderer = renderer;
    self.loader = loader;
    self.inputHandler = inputHandler;
    self.helpWindow = helpWindow;
    self.editor.init();

    $("#library-pane").mCustomScrollbar({
        scrollInertia:0,
        theme:"light"
    });
    
    $("#properties-pane").mCustomScrollbar({
        scrollInertia:0,
        theme:"light",
        callbacks:{
            onUpdate: function(){self.resizePropertiesPane();},
        }
    });
};

EditorUI.prototype.load = function() {
    var self = this;
    self.showCodeEditor();

    self.collapseCodePane();

    self.selectObject(null);
    self.propertiesPane.openSettings();
    self.loaded = true;
    self.onViewResize();
    self.animate();

    $("#loading-cover").hide();    
};

EditorUI.prototype.animate = function() {
    var self = this;

    // console.log(
    //     self.renderer.info.memory.geometries,
    //     self.renderer.info.memory.programs,
    //     self.renderer.info.memory.textures
    // );

    requestAnimationFrame(self.animate.bind(self));

    self.inputHandler.update();

    if(self.inGame) {
        self.game.update();
        self.game.render();
    } else {
        self.editor.update();
        self.editor.render();
    }
};

EditorUI.prototype.onViewResize = function() {
    var self = this;
    if(!self.loaded) return;

    var width = self.viewport.width();
    var height = self.viewport.height();
    self.renderer.setSize(width, height);
    self.workspace.resize();
    
    self.resizePropertiesPane();
    self.codeEditor.resize();
    self.editor.onViewResize(width, height);
    if(self.inGame) self.game.onViewResize(width, height);    
};

EditorUI.prototype.resizePropertiesPane = function() {
    var self = this;

    var pane = $("#properties-pane");
    var container = pane.find(".mCSB_container").first();

    // Resize scrollbar container to fit the pane, this prevents the color input box from being clipped
    var paneHeight = pane.height();
    var containerHeight = container.height();
    var spacing = paneHeight - containerHeight;

    if(paneHeight > containerHeight) {
        container.css("padding-bottom", spacing + "px");
    } else {
        container.css("padding-bottom", "0");
    }
    
    var width = container.width();

    self.propertiesPane.resize(width);
};

EditorUI.prototype.openHelpWindow = function() {
    var self = this;
    var helpWindow = self.helpWindow;
    var viewport = self.viewport;
    var window = helpWindow.data("kendoWindow");
    window.open();
    var x = viewport.offset().left + viewport.width()/2 - helpWindow.outerWidth()/2;
    var y = viewport.offset().top + 50;
    helpWindow.parent().css("left", x);
    helpWindow.parent().css("top", y);

};

EditorUI.prototype.startGame = function() {
    var self = this;
    console.log("starting game");
    var width = self.viewport.width();
    var height = self.viewport.height();
    self.game = new Game(self.renderer, width, height, self.loader, self.editor.sceneData);
    self.inputHandler.target = game;
    self.inGame = true;
    $("#screen-cover").show();
    $("#play-button").attr("src", "img/stop.png")
    $("#help-window").data("kendoWindow").close();
};

EditorUI.prototype.stopGame = function() {
    var self = this;
    console.log("stopping game");
    self.inputHandler.target = self.editor;
    self.game.stop();
    self.inGame = false;
    self.game = null;
    $("#screen-cover").hide();
    $("#play-button").attr("src", "img/play.png")
};

EditorUI.prototype.populateLibrary = function(assets) {
    var self = this;
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

EditorUI.prototype.selectObject = function(object) {
    var self = this;

    if(object === null) {
        $("#remove-button").addClass("disabled");
        $("#code-editor").hide();
        //self.collapseCodePane();
    } else {
        $("#remove-button").removeClass("disabled");
        
        if(!self.inWorkspace) $("#code-editor").show();

        self.disableEdit = true; // Prevents saving the script when you initially open it

        // Show script in code editor pane
        if(object.data.script === null) {
            self.codeEditor.getSession().setValue("");
            //self.collapseCodePane();
        } else {
            var scriptRef = object.data.script;
            var script = self.editor.getScriptByName(scriptRef);
            var contents = script.contents;
            self.codeEditor.getSession().setValue(contents);
            self.expandCodePane();
        }

        self.disableEdit = false;
    }

    self.propertiesPane.selectObject(object);
};

EditorUI.prototype.updateSelectedObject = function() {
    var self = this;
    self.propertiesPane.updateSelectedObject();
};

EditorUI.prototype.updateSettings = function() {
    var self = this;
    self.propertiesPane.updateSettings();
};

EditorUI.prototype.setUndoRedo = function(hasUndos, hasRedos) {
    var self = this;
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

EditorUI.prototype.collapseCodePane = function() {
    var self = this;
    var splitter = $("#horizontal").data("kendoSplitter");
    splitter.collapse(".k-pane:first");
};

EditorUI.prototype.expandCodePane = function() {
    var self = this;
    var splitter = $("#horizontal").data("kendoSplitter");
    splitter.expand(".k-pane:first");
};

EditorUI.prototype.showWorkspace = function() {
    var self = this;
    $("#code-editor").hide();
    $("#blockly-div").show();
    self.inWorkspace = true;
    self.onViewResize();
};

EditorUI.prototype.showCodeEditor = function() {
    var self = this;
    $("#code-editor").show();
    $("#blockly-div").hide();
    self.inWorkspace = false;
    self.onViewResize();
};

EditorUI.prototype.setTransformMode = function(mode) {
    var self = this;

    if(mode == 0) { // translate
        $("#translate-button").addClass("selected");
        $("#rotate-button").removeClass("selected");
        $("#scale-button").removeClass("selected");
    } else if (mode == 1) { // rotate
        $("#translate-button").removeClass("selected");
        $("#rotate-button").addClass("selected");
        $("#scale-button").removeClass("selected");
    } else if(mode == 2) { // scale
        $("#translate-button").removeClass("selected");
        $("#rotate-button").removeClass("selected");
        $("#scale-button").addClass("selected");
    }

    self.editor.setTransformMode(mode);
};

EditorUI.prototype.saveToLocalStorage = function(data) {
    var self = this;
    if(!$("html").hasClass("localstorage")) return;

    var json = JSON.stringify(data);
    localStorage.setItem("editor", json);
};

EditorUI.prototype.loadFromLocalStorage = function(callback) {
    if(!$("html").hasClass("localstorage")) {
        callback(null);
        return;
    }

    var json = localStorage.getItem("editor");
    if(json == null) {
        callback(null);
        return;
    }

    var data = JSON.parse(json);
    callback(data);
};

EditorUI.prototype.clearLocalStorage = function() {
    var self = this;
    if(!$("html").hasClass("localstorage")) return;
    localStorage.removeItem("editor");
};

EditorUI.prototype.saveToFile = function(data, filename) {
    var self = this;
    var json = JSON.stringify(data, null, '\t');
    console.log(json);
    var blob = new Blob([json], {type: "text/plain;charset=" + document.characterSet});
    saveAs(blob, filename + ".txt");
};

EditorUI.prototype.loadFromFile = function(filename, callback) {
    var request = $.ajax({
        url : filename,
        dataType: "text"
    }).done(function(text){
        var data = JSON.parse(text);
        callback(data);
    }).fail(function(jqXHR, textStatus){
        console.log(textStatus);
        alert("Could not find file");
        callback(null);
    });
};
