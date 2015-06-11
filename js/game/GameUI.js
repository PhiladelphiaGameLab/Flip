var gameUI = new GameUI();

$(document).ready(function() {
    gameUI.init();
});

$(window).load(function() {
    gameUI.load();
});

function GameUI() {

    var self = this;

    self.viewport = null;
    self.renderer = null;
    self.loader = null;
    self.inputHanadler = null;
    self.game = null;
    self.loaded = false;
}

GameUI.prototype.init = function() {
    var self = this;

    // Load game data
    var data = self.loadFromLocalStorage();
    if(data == null) {
        alert("No game data found");
        return;
    }

    // Create renderer
    var viewport = $("#view-pane");
    var width = viewport.innerWidth();
    var height = viewport.innerHeight();
    var renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
    viewport.append(renderer.domElement);
    
    // Create loader
    var loader = new Loader();

    game = new Game(renderer, width, height, loader, data);
    inputHandler = new InputHandler(viewport);
    inputHandler.target = game;

    window.onresize = function(event){self.onViewResize();};

    self.viewport = viewport;
    self.renderer = renderer;
    self.loader = loader;
    self.inputHandler = inputHandler;
    self.game = game;
    self.loaded = true;
};

GameUI.prototype.load = function() {
    var self = this;
    if(!self.loaded) return;
    self.animate();
};

GameUI.prototype.animate = function() {
    var self = this;
    requestAnimationFrame(self.animate.bind(self));
    self.inputHandler.update();
    self.game.update();
    self.game.render();
};

GameUI.prototype.onViewResize = function() {
    var self = this;
    var width = self.viewport.innerWidth();
    var height = self.viewport.innerHeight();
    self.renderer.setSize(width, height);
    self.game.onViewResize(width, height);
};


GameUI.prototype.loadFromLocalStorage = function() {
    if(!$("html").hasClass("localstorage")) return null;

    var json = localStorage.getItem("editor");
    if(json == null) return null;

    var data = JSON.parse(json);
    return data;
};
