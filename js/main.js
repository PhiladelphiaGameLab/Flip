$(document).ready(function() {
    console.log("got here");
    $("#vertical").kendoSplitter({
        orientation: "vertical",
        panes: [
            { collapsible: false },
            { collapsible: false, size: "100px" },
            { collapsible: false, resizable: false, size: "100px" }
        ]
    });

    $("#horizontal").kendoSplitter({
        panes: [
            { collapsible: true, size: "220px" },
            { collapsible: false },
            { collapsible: true, size: "220px" }
        ]
    });
});
