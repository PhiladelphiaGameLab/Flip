var gameSpace;

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
});
