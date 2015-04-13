var gameSpace, inputHandler;

var entities = [
    {name:"Character", icon:"img/cube.png", id:0},
    {name:"Crate", icon:"img/cube.png", id:1},
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

    $("#toolbar").kendoToolBar({
        items: [
            { type: "button", text: "Menu" },
            { type: "button", text: "Edit" },
            { type: "separator" },
            { type: "button", text: "Play" }
        ]
    });

    $("#dropdown").kendoDropDownList({
        optionLabel: "Paragraph",
        dataTextField: "text",
        dataValueField: "value",
        dataSource: [
            { text: "Heading 1", value: 1 },
            { text: "Heading 2", value: 2 },
            { text: "Heading 3", value: 3 },
            { text: "Title", value: 4 },
            { text: "Subtitle", value: 5 }
        ]
    });


    var viewPane = $("#view-pane");
    gameSpace = new GameSpace(viewPane);
    gameSpace.animate();

    // Add resize events to splitters
    var splitter;
    splitter = $("#vertical").data("kendoSplitter");
    splitter.bind("resize", gameSpace.onViewResize.bind(gameSpace));
    splitter = $("#horizontal").data("kendoSplitter");
    splitter.bind("resize", gameSpace.onViewResize.bind(gameSpace));

    // Add entities to library
    addEntitiesToLibrary(entities);

    inputHandler = new InputHandler();
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


function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
}

function drop(ev) {
    ev.preventDefault();
    var x = ev.pageX - $('#view-pane').offset().left
    var y = $('#view-pane').height() - (ev.pageY - $('#view-pane').offset().top);

    var id = ev.dataTransfer.getData("text");
    var entity = getEntityById(id);
    gameSpace.drop(entity, x, y);
}
