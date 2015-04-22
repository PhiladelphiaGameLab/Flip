function PropertiesPane() {

    var Controls = function() {

        // Basic folder
        this.name = "Name";
        this.x = 0;
        this.y = 0;
        this.z = 0;
        this.visible = true;

        // Extra folder
        this.script = "script";
        this.mesh = "mesh";
        this.physics = "physics";

        // Test folder
        this.title = "My Name";
        this.message = "hello";
        this.speed = 0.4;
        this.mass = 0.5;
        this.enabled = false;
        this.explode = function(){alert("explode")};
        this.color1 = "#000000";
    };

    var self = this;
    var controls = new Controls();
    var gui = new dat.GUI({ autoPlace: false });
    
    // Set name
    var basicFolder = gui.addFolder("Properties");
    basicFolder.add(controls, "name").onFinishChange(function(value){
        self.selectedObject.name = value;
        editor.editObject(self.selectedObject);
    });


    basicFolder.add(controls, "x").onChange(function(value){
        self.selectedObject.setPosition(value, controls["y"], controls["z"]);
    }).onFinishChange(function(value){
        editor.editObject(self.selectedObject);
    });

    basicFolder.add(controls, "y").onChange(function(value){
        self.selectedObject.setPosition(controls["x"], value, controls["z"]);
    }).onFinishChange(function(value){
        editor.editObject(self.selectedObject);
    });

    basicFolder.add(controls, "z").onChange(function(value){
        self.selectedObject.setPosition(controls["x"], controls["y"], value);
    }).onFinishChange(function(value){
        editor.editObject(self.selectedObject);
    });

    basicFolder.add(controls, "visible").onFinishChange(function(value){
        self.selectedObject.setVisible(value);
        editor.editObject(self.selectedObject);
    });


    var extraFolder = gui.addFolder("Extras");
    extraFolder.add(controls, "script");
    extraFolder.add(controls, "mesh");
    extraFolder.add(controls, "physics");

    var testFolder = gui.addFolder('Test Folder');
    testFolder.add(controls, "title");
    testFolder.add(controls, "message", [ "hello", "goodbye", "wonderful" ] );
    testFolder.add(controls, "speed");
    testFolder.add(controls, "mass", 0, 1, 0.5);
    testFolder.add(controls, "enabled");
    testFolder.add(controls, "explode");
    testFolder.add(controls, "color1");

    self.gui = gui;
    self.controls = controls;
    self.selectObject(null);
    self.basicFolder = basicFolder;
    self.extraFolder = extraFolder;
    self.testFolder = testFolder;
}


PropertiesPane.prototype.resize = function (width) {
    var self = this;
    self.gui.width = width;
    self.gui.onResize();
};

PropertiesPane.prototype.selectObject = function(object) {
    var self = this;

    if(object === null) {
        self.selectedObject = null;
        $(self.gui.domElement).hide();
        return;
    }

    $(self.gui.domElement).show();
    self.selectedObject = object;

    self.basicFolder.open();
    self.extraFolder.open();

    self.updateSelectedObject();
};

PropertiesPane.prototype.updateSelectedObject = function() {
    var self = this;
    var object = self.selectedObject;
    if(object === null) return;

    console.log("update selected object");

    self.controls["name"] = object.name;
    self.controls["x"] = object.position[0];
    self.controls["y"] = object.position[1];
    self.controls["z"] = object.position[2];
    self.controls["visible"] = object.visible;

    self.updateVisual();
}


PropertiesPane.prototype.updateVisual = function() 
{
    var self = this;
    var gui = self.gui;
    for(var i in gui.__folders)
    {
        for(var j in gui.__folders[i].__controllers)
        {
            gui.__folders[i].__controllers[j].updateDisplay();
        }
    }
};
