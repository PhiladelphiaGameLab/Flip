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

        // Dir Light folder
        this["DirLightColor"] = "#ffffff";
        this["Cast Shadow"] = false;

        // Point Light folder
        this["PointLightColor"] = "#ffffff";
        this["Distance"] = 10;

        // Settings folder
        this["Scene Name"] = "My Scene";
        this["Ambient Color"] = "#000000";
        this["Background Color"] = "#000000";
        this["Skybox"] = "clouds";
        this["Grid Visible"] = true;
        this["Clear Scene"] = function() { editor.clearScene() };
        this["Clear Saved Data"] = function() { editorUI.clearLocalStorage(); };
        this["Save To File"] = function() { editorUI.saveToFile(editor.sceneData, editor.sceneName)};

        //Particle system Folder
        this["Count"] = 500;
        this["pvx"] = 0;
        this["pvy"] = 0;
        this["pvz"] = 0;
        this["pax"] = 0;
        this["pay"] = 0;
        this["paz"] = 0;
        this["Shape"] = "sphere";
        this["Speed"] = 4;
        this["Size"] =1;
        this["PartColor"] ="#ffffff";
        this["Radius"] = 1;
        


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

        if(value == self.selectedObject.data.name) return;

        if(editor.isNameUnique(value)) {
            self.selectedObject.data.name = value;
            editor.editObject(self.selectedObject);
        } else {
            alert("The name " + value + " is already taken");
            self.controls["Name"] = self.selectedObject.data.name;
            self.refreshUI();
        }
    });

    // Set x
    var xControl = basicFolder.add(controls, "x").onChange(function(value){
        self.selectedObject.data.position[0] = value;
        self.selectedObject.updateObject();
    }).onFinishChange(function(value){
        editor.editObject(self.selectedObject);
    });

    // Set y
    var yControl = basicFolder.add(controls, "y").onChange(function(value){
        self.selectedObject.data.position[1] = value;
        self.selectedObject.updateObject();
    }).onFinishChange(function(value){
        editor.editObject(self.selectedObject);
    });

    // Set z
    var zControl = basicFolder.add(controls, "z").onChange(function(value){
        self.selectedObject.data.position[2] = value;
        self.selectedObject.updateObject();
    }).onFinishChange(function(value){
        editor.editObject(self.selectedObject);
    });

    // Set rx
    var rxControl = basicFolder.add(controls, "rx").onChange(function(value){
        self.selectedObject.data.rotation[0] = toRadians(value);
        self.selectedObject.updateObject();
    }).onFinishChange(function(value){
        editor.editObject(self.selectedObject);
    });

    // Set ry
    var ryControl = basicFolder.add(controls, "ry").onChange(function(value){
        self.selectedObject.data.rotation[1] = toRadians(value);
        self.selectedObject.updateObject();
    }).onFinishChange(function(value){
        editor.editObject(self.selectedObject);
    });

    // Set rz
    var rzControl = basicFolder.add(controls, "rz").onChange(function(value){
        self.selectedObject.data.rotation[2] = toRadians(value);
        self.selectedObject.updateObject();
    }).onFinishChange(function(value){
        editor.editObject(self.selectedObject);
    });

    // Set sx
    var sxControl = basicFolder.add(controls, "sx").min(0.01).onChange(function(value){
        self.selectedObject.data.scale[0] = value;
        self.selectedObject.updateObject();
    }).onFinishChange(function(value){
        editor.editObject(self.selectedObject);
    });

    // Set sy
    var syControl = basicFolder.add(controls, "sy").min(0.01).onChange(function(value){
        self.selectedObject.data.scale[1] = value;
        self.selectedObject.updateObject();
    }).onFinishChange(function(value){
        editor.editObject(self.selectedObject);
    });

    // Set sz
    var szControl = basicFolder.add(controls, "sz").min(0.01).onChange(function(value){
        self.selectedObject.data.scale[2] = value;
        self.selectedObject.updateObject();
    }).onFinishChange(function(value){
        editor.editObject(self.selectedObject);
    });

    // Set visible
    basicFolder.add(controls, "Visible").onFinishChange(function(value){
        self.selectedObject.data.visible = value;
        self.selectedObject.updateObject();
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

      //Partcile Folder
    var particleFolder = gui.addFolder("Particle System");
    
    particleFolder.add(controls, "Count", 0, 1000, 100).onFinishChange(function(value){
        self.selectedObject.data.emitter.alive = value/1000;
        self.selectedObject.updateObject();
        editor.editObject(self.selectedObject);
    });

    var pvxControl = particleFolder.add(controls, "pvx").min(0).onChange(function(value){
        self.selectedObject.data.emitter.velocity[0] = value;
        self.selectedObject.updateObject();
    }).onFinishChange(function(value){
        editor.editObject(self.selectedObject);
    });

     var pvyControl = particleFolder.add(controls, "pvy").min(0).onChange(function(value){
        self.selectedObject.data.emitter.velocity[1] = value;
        self.selectedObject.updateObject();
    }).onFinishChange(function(value){
        editor.editObject(self.selectedObject);
    });

     var pvzControl = particleFolder.add(controls, "pvz").min(0).onChange(function(value){
        self.selectedObject.data.emitter.velocity[2] = value;
        self.selectedObject.updateObject();
    }).onFinishChange(function(value){
        editor.editObject(self.selectedObject);
    });

     var paxControl = particleFolder.add(controls, "pax").min(0).onChange(function(value){
        self.selectedObject.data.emitter.acceleration[0] = value;
        self.selectedObject.updateObject();
    }).onFinishChange(function(value){
        editor.editObject(self.selectedObject);
    });

     var payControl = particleFolder.add(controls, "pay").min(0).onChange(function(value){
        self.selectedObject.data.emitter.acceleration[1] = value;
        self.selectedObject.updateObject();
    }).onFinishChange(function(value){
        editor.editObject(self.selectedObject);
    });

     var pazControl = particleFolder.add(controls, "paz").min(0).onChange(function(value){
        self.selectedObject.data.emitter.acceleration[2] = value;
        self.selectedObject.updateObject();
    }).onFinishChange(function(value){
        editor.editObject(self.selectedObject);
    });

     // Set  Speed of particle
    particleFolder.add(controls, "Speed", 0, 100, 10).onFinishChange(function(value){
        self.selectedObject.data.emitter.speed = value;
        self.selectedObject.updateObject();
        editor.editObject(self.selectedObject);
    });

    // Set  Size of particle
    particleFolder.add(controls, "Size", 0, 10, 1).onFinishChange(function(value){
        self.selectedObject.data.emitter.size =value;
        self.selectedObject.updateObject();   
        editor.editObject(self.selectedObject);
    });

    //Set Radius for Sphere and Disk
    var radiusControl = particleFolder.add(controls, "Radius", 0, 50, 1).onFinishChange(function(value){
        self.selectedObject.data.emitter.radius = value;
        self.selectedObject.updateObject();
        editor.editObject(self.selectedObject);
    });
    
    // Set  Color of particle
    var particleColorControl = particleFolder.addColor(controls,"PartColor").onChange(function(value){
       self.selectedObject.data.emitter.color = stringToColor(value);
       self.selectedObject.updateObject();
    }).onFinishChange(function(value){
        editor.editObject(self.selectedObject);
    });

    setControllerName(particleColorControl, "Color");
    
    
    var velocityVisual = combineNumberControllers([pvxControl, pvyControl, pvzControl], "Velocity");
    var accelerationVisual =  combineNumberControllers([paxControl, payControl, pazControl], "Acceleration");
    
    

    // Set shape of particle
    particleFolder.add(controls, "Shape", ["sphere", "cube", "disk"]).onFinishChange(function(value){
        self.selectedObject.data.emitter.type = value;
        self.selectedObject.updateObject();
        editor.editObject(self.selectedObject);
    });
    
    var translateVisual = combineNumberControllers([xControl, yControl, zControl], "Position");
    var rotateVisual = combineNumberControllers([rxControl, ryControl, rzControl], "Rotation");
    var scaleVisual = combineNumberControllers([sxControl, syControl, szControl], "Scale");
    

    //Material Folder 
    var materialFolder = gui.addFolder("Material") ;

    //Set Material Color
    var matColorControl = materialFolder.addColor(controls,"MatColor").onChange(function(value){
        self.selectedObject.data.material.color = stringToColor(value);
        self.selectedObject.updateObject();
    }).onFinishChange(function(value){
        editor.editObject(self.selectedObject);
    });

    setControllerName(matColorControl, "Color");


    // Physics folder
    var physicsFolder = gui.addFolder("Physics");

    // Set type
    physicsFolder.add(controls, "Type", ["static", "dynamic"]).onFinishChange(function(value){
        self.selectedObject.data.physics.type = value;
        editor.editObject(self.selectedObject);
    });
    
    // Set friction
    physicsFolder.add(controls, "Friction", 0, 1, 0.5).onFinishChange(function(value){
        self.selectedObject.data.physics.friction = value;
        editor.editObject(self.selectedObject);
    });
    
    // Set restitution
    physicsFolder.add(controls, "Restitution", 0, 1, 0.5).onFinishChange(function(value){
        self.selectedObject.data.physics.restitution = value;
        editor.editObject(self.selectedObject);
    });
    
    // Set shape
    physicsFolder.add(controls, "Shape", ["sphere", "cube", "capsule"]).onFinishChange(function(value){
        self.selectedObject.data.physics.shape = value;
        editor.editObject(self.selectedObject);
    });
    
    // Set mass
    physicsFolder.add(controls, "Mass", 0, 10, 1).onFinishChange(function(value){
        self.selectedObject.data.physics.mass = value;
        editor.editObject(self.selectedObject);
    });

    // Dir Light folder
    var dirLightFolder = gui.addFolder("Directional Light");
    
    // Set color
    var dirLightColorControl = dirLightFolder.addColor(controls, "DirLightColor").onChange(function(value){
        self.selectedObject.data.light.color = stringToColor(value);
        self.selectedObject.updateObject();
    }).onFinishChange(function(value){
        editor.editObject(self.selectedObject);
    });
    setControllerName(dirLightColorControl, "Color");

    // Set cast shadow
    dirLightFolder.add(controls, "Cast Shadow").onFinishChange(function(value){
        self.selectedObject.data.light.castShadow = value;
        self.selectedObject.updateObject();
        editor.editObject(self.selectedObject);
    });


    // Point Light folder
    var pointLightFolder = gui.addFolder("Point Light");

    // Set color
    var pointLightColorControl = pointLightFolder.addColor(controls, "PointLightColor").onChange(function(value){
        self.selectedObject.data.light.color = stringToColor(value);
        self.selectedObject.updateObject();
    }).onFinishChange(function(value){
        editor.editObject(self.selectedObject);
    });
    setControllerName(pointLightColorControl, "Color");

    // Set distance
    pointLightFolder.add(controls, "Distance").min(0.01).onChange(function(value){
        self.selectedObject.data.light.distance = value;
        self.selectedObject.updateObject();
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
            editor.editSceneSettings();
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
        editor.editSceneSettings();
    });

    // Background color
    settingsFolder.addColor(controls, "Background Color").onChange(function(value){
        editor.setBackgroundColor(stringToColor(value));
    }).onFinishChange(function(value){
        editor.editSceneSettings();
    });

    // Skybox
    settingsFolder.add(controls, "Skybox", ["none", "clouds"]).onFinishChange(function(value){
        editor.setSkybox(value);
        editor.editSceneSettings();
    });

    // Grid
    settingsFolder.add(controls, "Grid Visible").onFinishChange(function(value){
        editor.setGridVisible(value);
        editor.editSceneSettings();
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
    self.dirLightFolder = dirLightFolder;
    self.dirLightFolderVisual = $(dirLightFolder.domElement).parent();
    self.pointLightFolder = pointLightFolder;
    self.pointLightFolderVisual = $(pointLightFolder.domElement).parent();
    self.materialFolder = materialFolder;
    self.materialFolderVisual = $(materialFolder.domElement).parent();
    self.translateVisual = translateVisual;
    self.rotateVisual = rotateVisual;
    self.scaleVisual = scaleVisual;
    self.settingsFolder = settingsFolder;
    self.settingsFolderVisual = $(settingsFolder.domElement).parent();
    self.particleFolder = particleFolder;
    self.particleFolderVisual = $(particleFolder.domElement).parent();
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
    self.dirLightFolderVisual.toggle(visible);
    self.pointLightFolderVisual.toggle(visible);
    self.particleFolderVisual.toggle(visible);

    if(visible) {
        self.basicFolder.open();
        self.materialFolder.open();
        self.physicsFolder.open();
        self.dirLightFolder.open();
        self.pointLightFolder.open();
        self.particleFolder.open();
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

    var hasPhysics = object.data.physics !== null;
    var hasMesh = object.data.mesh !== null;
    var hasLight = object.data.light !== null;
    var hasDirLight = hasLight && object.data.light.type == "dir";
    var hasPointLight = hasLight && object.data.light.type == "point";
    var hasParticle = object.data.particle !== false;

    // Hide folders (but open later if applicable)
    self.physicsFolderVisual.hide();
    self.materialFolderVisual.hide();
    self.dirLightFolderVisual.hide();
    self.pointLightFolderVisual.hide();
    self.particleFolderVisual.hide();

    // Update general properties
    self.controls["Name"] = object.data.name;
    self.controls["x"] = object.data.position[0];
    self.controls["y"] = object.data.position[1];
    self.controls["z"] = object.data.position[2];
    self.controls["rx"] = toDegrees(object.data.rotation[0]);
    self.controls["ry"] = toDegrees(object.data.rotation[1]);
    self.controls["rz"] = toDegrees(object.data.rotation[2]);
    self.controls["sx"] = object.data.scale[0];
    self.controls["sy"] = object.data.scale[1];
    self.controls["sz"] = object.data.scale[2];
    self.controls["Visible"] = object.data.visible;
    self.controls["Physics"] = hasPhysics;

    if(hasPhysics) {
        self.controls["Type"] = object.data.physics.type;
        self.controls["Friction"] = object.data.physics.friction;
        self.controls["Restitution"] = object.data.physics.restitution;
        self.controls["Shape"] = object.data.physics.shape;
        self.controls["Mass"] = object.data.physics.mass;
        self.physicsFolderVisual.show();
    }

    if(hasDirLight) {

        self.controls["DirLightColor"] = colorToString(object.data.light.color);
        self.controls["Cast Shadow"] = object.data.light.castShadow;
        self.dirLightFolderVisual.show();
    }

    if(hasPointLight) {
        self.controls["PointLightColor"] = colorToString(object.data.light.color);
        self.controls["Distance"] = object.data.light.distance;
        self.pointLightFolderVisual.show();
    }
 
    if(hasMesh) {
        // A mesh always has a material
        self.controls["MatColor"] = colorToString(object.data.material.color);
        self.materialFolderVisual.show();
    }

    if(hasParticle) {
        
        self.controls["PartColor"] = colorToString(object.data.emitter.color);
        self.controls["Speed"] = object.data.emitter.speed;
        self.controls["Shape"] = object.data.emitter.type;
        self.controls["Radius"] = object.data.emitter.radius;
        self.controls["Size"] = object.data.emitter.size;
        self.controls["Count"] = object.data.emitter.alive*1000;
        self.controls["pax"] = object.data.emitter.acceleration[0];
        self.controls["pay"] = object.data.emitter.acceleration[1];
        self.controls["paz"] = object.data.emitter.acceleration[2];
        self.controls["pvx"] = object.data.emitter.velocity[0];
        self.controls["pvy"] = object.data.emitter.velocity[1];
        self.controls["pvz"] = object.data.emitter.velocity[2];
        self.particleFolderVisual.show();
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
