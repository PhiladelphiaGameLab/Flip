function PropertiesPane() {

    var self = this;

    var Controls = function() {

        // Basic folder
        this.name = "Name";
        this.x = 0;
        this.y = 0;
        this.z = 0;
        this.rx = 0;
        this.ry = 0;
        this.rz = 0;
        this.sx = 1.0;
        this.sy = 1.0;
        this.sz = 1.0;
        this.visible = true;
        this.physics = true;

        // Physics folder
        this.type = "dynamic";
        this.friction = 0.5;
        this.restitution = 0.5;
        this.shape = "sphere";
        this.mass = 1.0;

        // Light folder
        this.color = "#ffffff";
        this.distance = 10;

        // Settings folder
        this.ambientColor = "#404040";
        this.backgroundColor = "#ffffff";
        this.skybox = "clouds";
    };

    var controls = new Controls();
    var gui = new dat.GUI({ autoPlace: false });
    var waitingForMouseUp = false;
    

    function combineNumberControllers(controllers, name) {
        var master = controllers[0];
        var container = $(master.domElement);
        var li = $(master.__li);
        li.find(".property-name").html(name);

        var margin = 5;
        for(var i = 0; i < controllers.length; i++) {
            var input = $(controllers[i].__input);
            var width = (100.0 - margin*(controllers.length-1))/controllers.length;
            input.css("width", width+"%");
            container.append(input);
            if(i>0){
                $(controllers[i].__li).hide();
                input.css("margin-left", margin+"%");
            }
        }

        return li;
    }

    // Basic Folder
    var basicFolder = gui.addFolder("Properties");

    // Set name
    basicFolder.add(controls, "name").onFinishChange(function(value){

        if(value == self.selectedObject.name) return;

        if(editor.isNameUnique(value)) {
            self.selectedObject.name = value;
            self.selectObject.updateVisual();
            editor.editObject(self.selectedObject);
        } else {
            alert("The name " + value + " is already taken");
            self.controls["name"] = self.selectedObject.name;
            self.updateVisual();
        }
    });

    // Set x
    var xControl = basicFolder.add(controls, "x").onChange(function(value){
        self.selectedObject.position[0] = value;
        self.selectedObject.updateVisual();
    }).onFinishChange(function(value){
        editor.editObject(self.selectedObject);
    });

    // Set y
    var yControl = basicFolder.add(controls, "y").onChange(function(value){
        self.selectedObject.position[1] = value;
        self.selectedObject.updateVisual();
    }).onFinishChange(function(value){
        editor.editObject(self.selectedObject);
    });

    // Set z
    var zControl = basicFolder.add(controls, "z").onChange(function(value){
        self.selectedObject.position[2] = value;
        self.selectedObject.updateVisual();
    }).onFinishChange(function(value){
        editor.editObject(self.selectedObject);
    });

    // Set rx
    var rxControl = basicFolder.add(controls, "rx").onChange(function(value){
        self.selectedObject.rotation[0] = toRadians(value);
        self.selectedObject.updateVisual();
    }).onFinishChange(function(value){
        editor.editObject(self.selectedObject);
    });

    // Set ry
    var ryControl = basicFolder.add(controls, "ry").onChange(function(value){
        self.selectedObject.rotation[1] = toRadians(value);
        self.selectedObject.updateVisual();
    }).onFinishChange(function(value){
        editor.editObject(self.selectedObject);
    });

    // Set rz
    var rzControl = basicFolder.add(controls, "rz").onChange(function(value){
        self.selectedObject.rotation[2] = toRadians(value);
        self.selectedObject.updateVisual();
    }).onFinishChange(function(value){
        editor.editObject(self.selectedObject);
    });

    // Set sx
    var sxControl = basicFolder.add(controls, "sx").min(0.01).onChange(function(value){
        self.selectedObject.scale[0] = value;
        self.selectedObject.updateVisual();
    }).onFinishChange(function(value){
        editor.editObject(self.selectedObject);
    });

    // Set sy
    var syControl = basicFolder.add(controls, "sy").min(0.01).onChange(function(value){
        self.selectedObject.scale[1] = value;
        self.selectedObject.updateVisual();
    }).onFinishChange(function(value){
        editor.editObject(self.selectedObject);
    });

    // Set sz
    var szControl = basicFolder.add(controls, "sz").min(0.01).onChange(function(value){
        self.selectedObject.scale[2] = value;
        self.selectedObject.updateVisual();
    }).onFinishChange(function(value){
        editor.editObject(self.selectedObject);
    });

    // Set visible
    basicFolder.add(controls, "visible").onFinishChange(function(value){
        self.selectedObject.visible = value;
        self.selectedObject.updateVisual();
        editor.editObject(self.selectedObject);
    });

    // Set physics enabled
    basicFolder.add(controls, "physics").onFinishChange(function(value){
        if(value == true) {
            self.selectedObject.addPhysics();
        } else {
            self.selectedObject.removePhysics();
        }

        editor.editObject(self.selectedObject);
    });

    var translateVisual = combineNumberControllers([xControl, yControl, zControl], "position");
    var rotateVisual = combineNumberControllers([rxControl, ryControl, rzControl], "rotation");
    var scaleVisual = combineNumberControllers([sxControl, syControl, szControl], "scale");


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


    // Light folder
    var lightFolder = gui.addFolder("Light");
    
    // Set color
    lightFolder.addColor(controls, "color").onChange(function(value){
        self.selectedObject.light.color = stringToColor(value);
        self.selectedObject.updateVisual();
    }).onFinishChange(function(value){
        editor.editObject(self.selectedObject);
    });
    
    
    // Set distance
    var lightDistanceControl = lightFolder.add(controls, "distance").min(0.01).onChange(function(value){
        self.selectedObject.light.distance = value;
        self.selectedObject.updateVisual();
    }).onFinishChange(function(value){
        editor.editObject(self.selectedObject);
    });


    // Settings folder
    var settingsFolder = gui.addFolder("Settings");

    // Ambient color
    settingsFolder.addColor(controls, "ambientColor").onChange(function(value){
        editor.setAmbientColor(value);
    }).onFinishChange(function(value){
        editor.save();
    });

    // Background color
    settingsFolder.addColor(controls, "backgroundColor").onChange(function(value){
        editor.setBackgroundColor(value);
    }).onFinishChange(function(value){
        editor.save();
    });

    // Skybox
    settingsFolder.add(controls, "skybox", ["none", "clouds"]).onFinishChange(function(value){
        editor.setSkybox(value);
        editor.save();
    });

    self.gui = gui;
    self.guiVisual = $(self.gui.domElement);
    self.controls = controls;
    self.selectObject(null);
    self.basicFolder = basicFolder;
    self.basicFolderVisual = $(basicFolder.domElement).parent();
    self.physicsFolder = physicsFolder;
    self.physicsFolderVisual = $(physicsFolder.domElement).parent();
    self.physicsFolderVisual.hide();
    self.lightFolder = lightFolder;
    self.lightFolderVisual = $(lightFolder.domElement).parent();
    self.lightFolderVisual.hide();
    self.lightDistanceControl = $(lightDistanceControl.__li);
    self.translateVisual = translateVisual;
    self.rotateVisual = rotateVisual;
    self.scaleVisual = scaleVisual;
    self.settingsFolder = settingsFolder;
    self.settingsFolderVisual = $(settingsFolder.domElement).parent();
}


PropertiesPane.prototype.resize = function (width) {
    var self = this;
    self.gui.width = width;
    self.gui.onResize();
};

PropertiesPane.prototype.openSettings = function() {
    var self = this;
    self.guiVisual.show();
    self.basicFolderVisual.hide();
    self.physicsFolderVisual.hide();
    self.lightFolderVisual.hide();
    self.settingsFolderVisual.show();
    self.settingsFolder.open();

    self.updateSettings();
}

PropertiesPane.prototype.closeSettings = function() {
    var self = this;

    self.settingsFolderVisual.hide();
}

PropertiesPane.prototype.updateSettings = function() {
    var self = this;
    self.controls["ambientColor"] = editor.ambientColor;
    self.controls["backgroundColor"] = editor.backgroundColor;
    self.controls["skybox"] = editor.skybox;
    self.updateVisual();
}


PropertiesPane.prototype.selectObject = function(object) {
    var self = this;

    if(object === null) {
        self.selectedObject = null;
        self.guiVisual.hide();
        return;
    }

    self.closeSettings();

    self.guiVisual.show();
    self.selectedObject = object;

    self.basicFolder.open();
    self.physicsFolder.open();
    self.lightFolder.open();

    self.updateSelectedObject();
};

PropertiesPane.prototype.updateSelectedObject = function() {
    var self = this;
    var object = self.selectedObject;
    if(object === null) return;

    var hasPhysics = object.physics !== null;
    var hasLight = object.light != null;

    self.controls["name"] = object.name;
    self.controls["x"] = object.position[0];
    self.controls["y"] = object.position[1];
    self.controls["z"] = object.position[2];
    self.controls["rx"] = toDegrees(object.rotation[0]);
    self.controls["ry"] = toDegrees(object.rotation[1]);
    self.controls["rz"] = toDegrees(object.rotation[2]);
    self.controls["sx"] = object.scale[0];
    self.controls["sy"] = object.scale[1];
    self.controls["sz"] = object.scale[2];
    self.controls["visible"] = object.visible;
    self.controls["physics"] = hasPhysics;
    self.basicFolderVisual.show();

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

    if(hasLight) {

        self.controls["color"] = colorToString(object.light.color);
        self.controls["distance"] = object.light.distance;

        var type = object.light.type;
        if(type == "point") {
            self.lightDistanceControl.show();
            //self.rotateVisual.hide();
        } else if(type == "dir") {
            self.lightDistanceControl.hide();
            //self.rotateVisual.show();
        }

        self.lightFolderVisual.show();
        //self.scaleVisual.hide();
    } else {
        self.lightFolderVisual.hide();
        //self.translateVisual.show();
        //self.rotateVisual.show();
        //self.scaleVisual.show();
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

function toRadians (angle) {
    return angle * (Math.PI / 180);
}

function toDegrees (angle) {
    return angle * (180 / Math.PI);
}

function colorToString(c) 
{
    var val = c.toString(16);
    while(val.length < 6){
        val = "00" + val;
    }

    return "#" + val;
}

function stringToColor(c)
{
    return parseInt(c.substring(1), 16);
}