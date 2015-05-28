var viewport, game, renderer, inputHandler;

$(document).ready(function() {

    // Create game
    var data = loadFromLocalStorage();
    if(data == null) {
        alert("No game data found");
        return;
    }


    // Create renderer
    viewport = $("#view-pane");
    var width = viewport.innerWidth();
    var height = viewport.innerHeight();
    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
    viewport.append(renderer.domElement);
    
    inputHandler = new InputHandler(viewport);
    game = new Game(renderer, width, height, inputHandler);
    inputHandler.target = game;
    game.start(data);


    window.onresize = function(event){onViewResize();};
});

$(window).load(function() {

});

function onViewResize() {

    console.log("view resize");

    var width = viewport.innerWidth();
    var height = viewport.innerHeight();
    renderer.setSize(width, height);
    game.onViewResize(width, height);
}

function loadFromLocalStorage() {
    if(!$("html").hasClass("localstorage")) return null;

    var json = localStorage.getItem("editor");
    if(json == null) return null;

    var data = JSON.parse(json);
    return data;
}