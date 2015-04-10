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

	var viewPane = $("#view-pane");
    gameSpace = new GameSpace(viewPane);
	
    // Add resize events to splitters
    var splitter;
    splitter = $("#vertical").data("kendoSplitter");
    splitter.bind("resize", gameSpace.onViewResize.bind(gameSpace));
    splitter = $("#horizontal").data("kendoSplitter");
    splitter.bind("resize", gameSpace.onViewResize.bind(gameSpace));
	
    gameSpace.animate();
});