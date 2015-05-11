function PropertiesPane() {

    var self = this;

    var Controls = function() {

        // Basic folder
        this.name = "Name";
        this.x = 0;
        this.y = 0;
        this.z = 0;
        this.visible = true;
        this.physics = true;

        // Physics folder
        this.type = "dynamic";
        this.friction = 0.5;
        this.restitution = 0.5;
        this.shape = "sphere";
        this.mass = 1.0;


        // Test folder
        this.title = "My Name";
        this.message = "hello";
        this.speed = 0.4;
        this.velocity = 0.5;
        this.alive = false;
        this.explode = function(){alert("explode")};
        this.color1 = "#000000";
    };

    var controls = new Controls();
    var gui = new dat.GUI({ autoPlace: false });
    
    // Basic Folder
    var basicFolder = gui.addFolder("Properties");

    // Set name
    basicFolder.add(controls, "name").onFinishChange(function(value){
        if(editor.isNameUnique(value)) {
            self.selectedObject.setName(value);
            editor.editObject(self.selectedObject);
        } else {
            alert("The name " + value + " is already taken");
            self.controls["name"] = self.selectedObject.name;
            self.updateVisual();
        }
    });

    // Set x
    basicFolder.add(controls, "x").onChange(function(value){
        self.selectedObject.setPosition(value, controls["y"], controls["z"]);
    }).onFinishChange(function(value){
        editor.editObject(self.selectedObject);
    });

    // Set y
    basicFolder.add(controls, "y").onChange(function(value){
        self.selectedObject.setPosition(controls["x"], value, controls["z"]);
    }).onFinishChange(function(value){
        editor.editObject(self.selectedObject);
    });

    // Set z
    basicFolder.add(controls, "z").onChange(function(value){
        self.selectedObject.setPosition(controls["x"], controls["y"], value);
    }).onFinishChange(function(value){
        editor.editObject(self.selectedObject);
    });

    // Set visible
    basicFolder.add(controls, "visible").onFinishChange(function(value){
        self.selectedObject.setVisible(value);
        editor.editObject(self.selectedObject);
    });

    // Set physics enabled
    basicFolder.add(controls, "physics").listen().onFinishChange(function(value){
        if(value == true) {
            self.selectedObject.addPhysics();
        } else {
            self.selectedObject.removePhysics();
        }

        editor.editObject(self.selectedObject);
    });



    // Physics folder
    var physicsFolder = gui.addFolder("Physics");

    // Set type
    physicsFolder.add(controls, "type", ["static", "dynamic"]).onFinishChange(function(value){
        self.selectedObject.physics.type = value;
        editor.editObject(self.selectedObject);
    });
    
    // Set friction
    physicsFolder.add(controls, "friction", 0, 1, 0.5).onFinishChange(function(value){
        self.selectedObject.physics.friction = value;
        editor.editObject(self.selectedObject);
    });
    
    // Set restitution
    physicsFolder.add(controls, "restitution", 0, 1, 0.5).onFinishChange(function(value){
        self.selectedObject.physics.restitution = value;
        editor.editObject(self.selectedObject);
    });
    
    // Set shape
    physicsFolder.add(controls, "shape", ["sphere", "cube"]).onFinishChange(function(value){
        self.selectedObject.physics.shape = value;
        editor.editObject(self.selectedObject);
    });
    
    // Set mass
    physicsFolder.add(controls, "mass", 0, 10, 1).onFinishChange(function(value){
        self.selectedObject.physics.mass = value;
        editor.editObject(self.selectedObject);
    });


    // Test folder
    var testFolder = gui.addFolder('Test Folder');
    testFolder.add(controls, "title");
    testFolder.add(controls, "message", [ "hello", "goodbye", "wonderful" ] );
    testFolder.add(controls, "speed");
    testFolder.add(controls, "velocity", 0, 1, 0.5);
    testFolder.add(controls, "alive");
    testFolder.add(controls, "explode");
    testFolder.add(controls, "color1");

    self.gui = gui;
    self.controls = controls;
    self.selectObject(null);
    self.basicFolder = basicFolder;
    self.physicsFolder = physicsFolder;
    self.physicsFolderVisual = $(physicsFolder.domElement).parent();
    self.physicsFolderVisual.hide();
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
    self.physicsFolder.open();

    self.updateSelectedObject();
};

PropertiesPane.prototype.updateSelectedObject = function() {
    var self = this;
    var object = self.selectedObject;
    if(object === null) return;

    var hasPhysics = object.physics !== null;

    self.controls["name"] = object.name;
    self.controls["x"] = object.position[0];
    self.controls["y"] = object.position[1];
    self.controls["z"] = object.position[2];
    self.controls["visible"] = object.visible;
    self.controls["physics"] = hasPhysics;
    console.log("has physics: " + hasPhysics);

    if(hasPhysics) {
        self.controls["type"] = object.physics.type;
        self.controls["friction"] = object.physics.friction;
        self.controls["restitution"] = object.physics.restitution;
        self.controls["shape"] = object.physics.shape;
        self.controls["mass"] = object.physics.mass;
        self.physicsFolderVisual.show();
    } else {
        self.physicsFolderVisual.hide();
    }

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
