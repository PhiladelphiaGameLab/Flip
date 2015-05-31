function PropertiesPane(editor) {

    var self = this;

    var Controls = function() {

        // Basic folder
        this["Name"] = "Name";
        this["x"] = 0;
        this["y"] = 0;
        this["z"] = 0;
        this["rx"] = 0;
        this["ry"] = 0;
        this["rz"] = 0;
        this["sx"] = 1.0;
        this["sy"] = 1.0;
        this["sz"] = 1.0;
        this["Visible"] = true;
        this["Physics"] = true;

        // Material folder
        this["MatColor"] = "#ffffff";

        // Physics folder
        this["Type"] = "dynamic";
        this["Friction"] = 0.5;
        this["Restitution"] = 0.5;
        this["Shape"] = "sphere";
        this["Mass"] = 1.0;

        // Light folder
        this["LightColor"] = "#ffffff";
        this["Distance"] = 10;

        // Settings folder
        this["Scene Name"] = "My Scene";
        this["Ambient Color"] = "#000000";
        this["Background Color"] = "#000000";
        this["Skybox"] = "clouds";
        this["Grid Visible"] = true;
        this["Clear Scene"] = function() { editor.clearScene() };
        this["Clear Saved Data"] = function() { editorUI.clearLocalStorage(); };
        this["Save To File"] = function() { editorUI.saveToFile(editor.data, editor.sceneName)};
    };

    var controls = new Controls();
    var gui = new dat.GUI({ autoPlace: false });
    
    // Normally dat.gui doesn't support multiple controls on the same line, this gets around that (for number controls)
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

    function setControllerName(controller, name) {
        $(controller.__li).find(".property-name").html(name);
    }

    // Basic Folder
    var basicFolder = gui.addFolder("Properties");

    // Set name
    basicFolder.add(controls, "Name").onFinishChange(function(value){

        if(value == self.selectedObject.name) return;

        if(editor.isNameUnique(value)) {
            self.selectedObject.name = value;
            self.selectedObject.updateVisual();
            editor.editObject(self.selectedObject);
        } else {
            alert("The name " + value + " is already taken");
            self.controls["Name"] = self.selectedObject.name;
            self.refreshUI();
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
    basicFolder.add(controls, "Visible").onFinishChange(function(value){
        self.selectedObject.visible = value;
        self.selectedObject.updateVisual();
        editor.editObject(self.selectedObject);
    });

    // Set physics enabled
    basicFolder.add(controls, "Physics").onFinishChange(function(value){
        if(value == true) {
            self.selectedObject.addPhysics();
        } else {
            self.selectedObject.removePhysics();
        }

        editor.editObject(self.selectedObject);
    });

    var translateVisual = combineNumberControllers([xControl, yControl, zControl], "Position");
    var rotateVisual = combineNumberControllers([rxControl, ryControl, rzControl], "Rotation");
    var scaleVisual = combineNumberControllers([sxControl, syControl, szControl], "Scale");

    //Material Folder 
    var materialFolder = gui.addFolder("Material") ;

    //Set Material Color
    var matColorControl = materialFolder.addColor(controls,"MatColor").onChange(function(value){
        self.selectedObject.material.color = stringToColor(value);
        self.selectedObject.updateVisual();
    }).onFinishChange(function(value){
        editor.editObject(self.selectedObject);
    });

    setControllerName(matColorControl, "Color");


    // Physics folder
    var physicsFolder = gui.addFolder("Physics");

    // Set type
    physicsFolder.add(controls, "Type", ["static", "dynamic"]).onFinishChange(function(value){
        self.selectedObject.physics.type = value;
        editor.editObject(self.selectedObject);
    });
    
    // Set friction
    physicsFolder.add(controls, "Friction", 0, 1, 0.5).onFinishChange(function(value){
        self.selectedObject.physics.friction = value;
        editor.editObject(self.selectedObject);
    });
    
    // Set restitution
    physicsFolder.add(controls, "Restitution", 0, 1, 0.5).onFinishChange(function(value){
        self.selectedObject.physics.restitution = value;
        editor.editObject(self.selectedObject);
    });
    
    // Set shape
    physicsFolder.add(controls, "Shape", ["sphere", "cube", "capsule"]).onFinishChange(function(value){
        self.selectedObject.physics.shape = value;
        editor.editObject(self.selectedObject);
    });
    
    // Set mass
    physicsFolder.add(controls, "Mass", 0, 10, 1).onFinishChange(function(value){
        self.selectedObject.physics.mass = value;
        editor.editObject(self.selectedObject);
    });


    // Light folder
    var lightFolder = gui.addFolder("Light");
    
    // Set color
    var lightColorControl = lightFolder.addColor(controls, "LightColor").onChange(function(value){
        self.selectedObject.light.color = stringToColor(value);
        self.selectedObject.updateVisual();
    }).onFinishChange(function(value){
        editor.editObject(self.selectedObject);
    });
    setControllerName(lightColorControl, "Color");
    
    // Set distance
    var lightDistanceControl = lightFolder.add(controls, "Distance").min(0.01).onChange(function(value){
        self.selectedObject.light.distance = value;
        self.selectedObject.updateVisual();
    }).onFinishChange(function(value){
        editor.editObject(self.selectedObject);
    });

    // Settings folder
    var settingsFolder = gui.addFolder("Settings");

    // Scene name
    settingsFolder.add(controls, "Scene Name").onFinishChange(function(value){
        
        if(value == editor.sceneName) return;

        var validName = true;
        if(value.length == 0) validName = false; // Do more checks later

        if(validName) {
            editor.sceneName = value;
            editor.save();
        } else {
            alert("Invalid name");
            self.controls["Scene Name"] = editor.sceneName;
            self.refreshUI();
        }
    });

    // Ambient color
    settingsFolder.addColor(controls, "Ambient Color").onChange(function(value){
        editor.setAmbientColor(stringToColor(value));
    }).onFinishChange(function(value){
        editor.save();
    });

    // Background color
    settingsFolder.addColor(controls, "Background Color").onChange(function(value){
        editor.setBackgroundColor(stringToColor(value));
    }).onFinishChange(function(value){
        editor.save();
    });

    // Skybox
    settingsFolder.add(controls, "Skybox", ["none", "clouds"]).onFinishChange(function(value){
        editor.setSkybox(value);
        editor.save();
    });

    // Grid
    settingsFolder.add(controls, "Grid Visible").onFinishChange(function(value){
        editor.setGridVisible(value);
        editor.save();
    });

    settingsFolder.add(controls, "Clear Scene");
    settingsFolder.add(controls, "Clear Saved Data");
    settingsFolder.add(controls, "Save To File");

    self.editor = editor;
    self.gui = gui;
    self.guiVisual = $(self.gui.domElement);
    self.controls = controls;
    self.selectObject(null);
    self.basicFolder = basicFolder;
    self.basicFolderVisual = $(basicFolder.domElement).parent();
    self.physicsFolder = physicsFolder;
    self.physicsFolderVisual = $(physicsFolder.domElement).parent();
    self.lightFolder = lightFolder;
    self.lightFolderVisual = $(lightFolder.domElement).parent();
    self.lightDistanceControl = $(lightDistanceControl.__li);
    self.materialFolder = materialFolder;
    self.materialFolderVisual = $(materialFolder.domElement).parent();
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

PropertiesPane.prototype.showGUI = function(visible) {
    var self = this;
    self.guiVisual.toggle(visible);
};

PropertiesPane.prototype.showProperties = function(visible) {
    var self = this;
    self.basicFolderVisual.toggle(visible);
    self.materialFolderVisual.toggle(visible);
    self.physicsFolderVisual.toggle(visible);
    self.lightFolderVisual.toggle(visible);

    if(visible) {
        self.basicFolder.open();
        self.materialFolder.open();
        self.physicsFolder.open();
        self.lightFolder.open();
    }
};

PropertiesPane.prototype.showSettings = function(visible) {
    var self = this;
    self.settingsFolderVisual.toggle(visible);
    if(visible) self.settingsFolder.open();
};

PropertiesPane.prototype.openSettings = function() {
    var self = this;
    self.showGUI(true);
    self.showProperties(false);
    self.showSettings(true);
    self.updateSettings();
};

PropertiesPane.prototype.updateSettings = function() {
    var self = this;
    var editor = self.editor;

    self.controls["Scene Name"] = editor.sceneName;
    self.controls["Ambient Color"] = editor.ambientColor;
    self.controls["Background Color"] = editor.backgroundColor;
    self.controls["Skybox"] = editor.skybox;
    self.controls["Grid Visible"] = editor.gridVisible;
    self.refreshUI();
};


PropertiesPane.prototype.selectObject = function(object) {
    var self = this;

    if(object === null) {
        self.selectedObject = null;
        self.showGUI(false);
        return;
    }

    self.showGUI(true);
    self.showSettings(false);
    self.showProperties(true);

    self.selectedObject = object;
    self.updateSelectedObject();
};

PropertiesPane.prototype.updateSelectedObject = function() {
    var self = this;
    var object = self.selectedObject;
    if(object === null) return;

    var hasPhysics = object.physics !== null;
    var hasLight = object.light !== null;
    var hasMesh = object.mesh !== null;

    // Hide folders (but open later if applicable)
    self.physicsFolderVisual.hide();
    self.lightFolderVisual.hide();
    self.materialFolderVisual.hide();

    // Update general properties
    self.controls["Name"] = object.name;
    self.controls["x"] = object.position[0];
    self.controls["y"] = object.position[1];
    self.controls["z"] = object.position[2];
    self.controls["rx"] = toDegrees(object.rotation[0]);
    self.controls["ry"] = toDegrees(object.rotation[1]);
    self.controls["rz"] = toDegrees(object.rotation[2]);
    self.controls["sx"] = object.scale[0];
    self.controls["sy"] = object.scale[1];
    self.controls["sz"] = object.scale[2];
    self.controls["Visible"] = object.visible;
    self.controls["Physics"] = hasPhysics;

    if(hasPhysics) {
        self.controls["Type"] = object.physics.type;
        self.controls["Friction"] = object.physics.friction;
        self.controls["Restitution"] = object.physics.restitution;
        self.controls["Shape"] = object.physics.shape;
        self.controls["Mass"] = object.physics.mass;
        self.physicsFolderVisual.show();
    }

    if(hasLight) {

        self.controls["LightColor"] = colorToString(object.light.color);
        self.controls["Distance"] = object.light.distance;

        var type = object.light.type;
        if(type == "point") {
            self.lightDistanceControl.show();
        } else if(type == "dir") {
            self.lightDistanceControl.hide();
        }

        self.lightFolderVisual.show();
    }

    if(hasMesh) {
        // A mesh always has a material
        self.controls["MatColor"] = colorToString(object.material.color);
        self.materialFolderVisual.show();
    }

    self.refreshUI();
};

PropertiesPane.prototype.refreshUI = function() 
{
    var self = this;
    var gui = self.gui;
    for(var i in gui.__folders) {
        for(var j in gui.__folders[i].__controllers) {
            gui.__folders[i].__controllers[j].updateDisplay();
        }
    }
};
