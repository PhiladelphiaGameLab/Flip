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



    init();
    animate();
});

var camera, scene, renderer;
var mesh;

function init() {

    var width = $("#view-pane").width();
    var height = $("#view-pane").height();

    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( width, height );
    $("#view-pane").append(renderer.domElement);

    camera = new THREE.PerspectiveCamera( 70, width / height, 1, 1000 );
    camera.position.z = 400;

    scene = new THREE.Scene();

    var geometry = new THREE.BoxGeometry( 200, 200, 200 );

    var texture = THREE.ImageUtils.loadTexture( 'data/textures/crate.gif' );
    texture.anisotropy = renderer.getMaxAnisotropy();

    var material = new THREE.MeshBasicMaterial( { map: texture } );

    mesh = new THREE.Mesh( geometry, material );
    scene.add( mesh );

}

function onViewResize() {

    var width = $("#view-pane").width();
    var height = $("#view-pane").height();

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize( width, height );

}

function animate() {

    requestAnimationFrame( animate );

    mesh.rotation.x += 0.005;
    mesh.rotation.y += 0.01;

    renderer.render( scene, camera );

}
