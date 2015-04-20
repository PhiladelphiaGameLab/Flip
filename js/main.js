var gameSpace, viewport, propertiesPane, codeEditor;

var entities = [
    {name:"MultiMat", icon:"img/cube.png", id:0, mesh:"data/entities/multimat/multimat.json"},
    {name:"Chair", icon:"img/cube.png", id:1, mesh:"data/entities/chair/chair.json"},
    {name:"Tree", icon:"img/cube.png", id:2}
];

function getEntityById(id) {
    for (var i = 0; i < entities.length; i++) {
        if(entities[i].id == id) {
            return entities[i];
        }
    }
    return null;
}

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

    viewport = $("#view-pane");
    gameSpace = new GameSpace(viewport.innerWidth(), viewport.innerHeight());
    viewport.append(gameSpace.renderer.domElement);
    propertiesPane = new PropertiesPane();
    $("#properties-pane").append(propertiesPane.gui.domElement);

    codeEditor = ace.edit("code-editor");
    codeEditor.setTheme("ace/theme/monokai");
    codeEditor.getSession().setMode("ace/mode/javascript");
    codeEditor.setShowPrintMargin(false);
    codeEditor.getSession().setValue("function test(){\n\talert(\"flip\");\n}");

    // Add resize events to splitters
    var splitter;
    splitter = $("#vertical").data("kendoSplitter");
    splitter.bind("resize", onViewResize);
    splitter = $("#horizontal").data("kendoSplitter");
    splitter.bind("resize", onViewResize);

    // Add entities to library
    addEntitiesToLibrary(entities);
});

function addEntitiesToLibrary(entities) {

    var template = $("#library-item-template").html();

    for(var i = 0; i < entities.length; i++) {
        var entity = entities[i];
        var item = $("#library").append(template).children().last();
        item.find(".library-item-name").html(entity.name);
        var image = item.find(".library-item-image");
        image.attr("src", entity.icon);
        image.attr("id", entity.id);
    }
}

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
    var entity = getEntityById(id);
    gameSpace.drop(entity, mouse[0], mouse[1]);
}

function onClick(ev) {
    var mouse = getMousePos(ev);
    gameSpace.click(mouse[0], mouse[1]);
}

function onViewResize() {
    gameSpace.viewResize(viewport.innerWidth(), viewport.innerHeight());
    propertiesPane.resize($("#properties-pane").innerWidth());
    codeEditor.resize();
}
