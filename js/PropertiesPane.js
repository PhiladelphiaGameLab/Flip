function PropertiesPane() {

    var Controls = function() {

        this.name = "My Name";
        this.message = "hello";
        this.speed = 0.4;
        this.mass = 0.5;
        this.enabled = false;
        this.explode = function(){alert("explode")};
        this.color1 = "#000000";
    };

    var controls = new Controls();
    //var gui = new dat.GUI();
    var gui = new dat.GUI({ autoPlace: false });
    

    var f1 = gui.addFolder("Folder1");
    f1.add(controls, "name");
    f1.add(controls, "message", [ "hello", "goodbye", "wonderful" ] );
    f1.add(controls, "speed");
    f1.add(controls, "mass", 0, 1, 0.5);

    var f2 = gui.addFolder('Folder2');
    f2.add(controls, "enabled");
    f2.add(controls, "explode");
    f2.add(controls, "color1");

    this.gui = gui;

    this.resize = function (width) {
        this.gui.width = width;
        this.gui.onResize();
    }

}
