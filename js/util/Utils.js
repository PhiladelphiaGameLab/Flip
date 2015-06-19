var Utils = {};

// Temp objects for use in calculations. This avoids a lot of unneeded allocations.
var vector = new THREE.Vector3();
var vector1 = new THREE.Vector3();
var vector2 = new THREE.Vector3();

var quaternion = new THREE.Quaternion(); 
var quaternion1 = new THREE.Quaternion();
var quaternion2 = new THREE.Quaternion();


function toRadians (angle) {
    return angle * (Math.PI / 180);
}

function toDegrees (angle) {
    return angle * (180 / Math.PI);
}

function colorToString(c) {

    if(c == 0) return "#000000";

    var val = c.toString(16);
    while(val.length < 6){
        val = "00" + val;
    }

    return "#" + val;
}

function stringToColor(c) {
    if(isNaN(c)) return parseInt(c.substring(1), 16);
    else return c; 
}

// String format function using {0}, {1}, and so on
// First, checks if it isn't implemented yet.
if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) { 
      return typeof args[number] != 'undefined'
        ? args[number]
        : match
      ;
    });
  };
}

String.prototype.replaceAll = function(a, b) {
    return this.split(a).join(b);
};

function formatFloat(number) {
    return parseFloat(number.toFixed(3));
}

Utils.getMaterials = function(material) {
    if(material.type == "MeshFaceMaterial") {
        return material.materials;
    } else {
        return [material];
    }
};

Utils.getDirLightPosition = function(rotation) {
    var euler = new THREE.Euler(rotation[0], rotation[1], rotation[2], 'XYZ');
    var position = new THREE.Vector3(0, 1, 0);
    position.applyEuler(euler).normalize();
    position.multiplyScalar(200.0); // Add extra position for increasing shadow casting region
    return position;
};

Utils.clone = function(data) {
    return JSON.parse(JSON.stringify(data));
};

// Convert from the packed format to the unpacked format
Utils.unpackData = function(data) {

    if(data === null) return null;

    var clone = {};

    clone.name = data.name;
    clone.id = data.id;
    clone.asset = data.asset;
    clone.tag = data.tag || "";

    clone.visible = (data.visible === undefined) ? true : data.visible;
    clone.castShadow = (data.castShadow === undefined) ? true : data.castShadow;
    clone.receiveShadow = (data.receiveShadow === undefined) ? true : data.receiveShadow;

    clone.script = data.script || null;
    clone.mesh = data.mesh || null;

    clone.material = null;
    if(data.material) clone.material = {
        color: data.material.color
    };

    clone.physics = null;
    if(data.physics) clone.physics = {
        type: data.physics.type,
        friction: data.physics.friction,
        restitution: data.physics.restitution,
        shape: data.physics.shape,
        mass : data.physics.mass
    };

    clone.light = null;
    if(data.light) clone.light = {
        color: data.light.color,
        distance: data.light.distance || 50.0,
        type: data.light.type,
        castShadow: data.light.castShadow || false
    };

    clone.camera = null;
    if(data.camera) clone.camera = {
        fov: data.camera.fov
    };

    clone.position = data.position ? [data.position[0], data.position[1], data.position[2]] : [0,0,0];
    clone.rotation = data.rotation ? [data.rotation[0], data.rotation[1], data.rotation[2]] : [0,0,0];
    clone.scale = data.scale ? [data.scale[0], data.scale[1], data.scale[2]] : [1,1,1];

    return clone;
};

// Convert from the unpacked format to the packed format
Utils.packData = function(data) {

    // Make a deep copy of the data. Trim out any unused variables to save space
    // TO-DO: save to a more packed format, like an array

    var clone = {};

    clone.name = data.name;
    clone.id = data.id;
    clone.asset = data.asset;

    if(data.tag != "") clone.tag = data.tag;

    if(!data.visible) clone.visible = data.visible;
    if(!data.castShadow) clone.castShadow = data.castShadow;
    if(!data.receiveShadow) clone.receiveShadow = data.receiveShadow;
    if(data.script) clone.script = data.script;
    if(data.mesh) clone.mesh = data.mesh;

    if(data.material) clone.material = {
        color: data.material.color
    };

    if(data.physics) clone.physics = {
        type: data.physics.type,
        friction: formatFloat(data.physics.friction),
        restitution: formatFloat(data.physics.restitution),
        shape: data.physics.shape,
        mass : formatFloat(data.physics.mass)
    };

    if(data.light){
        clone.light = {
            color: data.light.color,
            type: data.light.type
        };

        if(data.light.castShadow) clone.light.castShadow = true;
        if(data.light.type == "point") clone.light.distance = data.light.distance;
    }

    if(data.camera) clone.camera = {
        fov: formatFloat(data.camera.fov)
    };

    clone.position = [formatFloat(data.position[0]), formatFloat(data.position[1]), formatFloat(data.position[2])];
    clone.rotation = [formatFloat(data.rotation[0]), formatFloat(data.rotation[1]), formatFloat(data.rotation[2])];
    clone.scale = [formatFloat(data.scale[0]), formatFloat(data.scale[1]), formatFloat(data.scale[2])];

    return clone;
};

Utils.formatScript = function(code, className) {

    // Convert to the proper format for top-level functions and variables
    //
    // function:
    //
    //      function update(message) { ... }
    //      ScriptClass.prototype.update = function(message) { ... }
    //
    // member variable:
    //
    //      var count = 0;
    //      ScriptClass.prototype.count = 0;

    var final = code;
    var result = jslint(code);
    var hasOnCollide = false;
    //console.log(result);
    
    // Member functions
    for(var i = 0; i < result.functions.length; i++) {

        var f = result.functions[i];
        var level = f.level;
        var name = f.name.id;
        var sig = f.signature;

        if(level !== 1) continue; // Only format top-level functions
        
        if(name === "onCollide") {
            hasOnCollide = true;
        }

        // Get the function header to be replaced
        var header = "function " + name;
        var headerStart = final.indexOf(header);
        var headerEnd = final.indexOf(")", headerStart) + 1;
        header = final.substring(headerStart, headerEnd);

        // Create the new header
        var newHeader = "ScriptClass.prototype." + name + " = function" + sig;

        // Replace in the code
        final = final.replace(header, newHeader);
    }

    // Member variables
    for(var i = 0; i < result.global.live.length; i++) {

        // Get variable name
        var member = result.global.live[i].id;

        var header = "var " + member;
        var newHeader = "ScriptClass.prototype." + member;

        final = final.replace(header, newHeader);
    }

    var classHeader = [
        "function ScriptClass(object) {",
        "    Script.call(this, object);",
        "}",
        "ScriptClass.prototype = Object.create(Script.prototype);",
        "ScriptClass.prototype.constructor = ScriptClass;",
        "ScriptClass.prototype.hasOnCollide = {hasOnCollide};"
    ].join("\n");

    final = classHeader + "\n" + final;
    
    // Replace the fake name with the actual name of the script
    final = final.replaceAll("ScriptClass", className);
    final = final.replaceAll("{hasOnCollide}", hasOnCollide.toString());

    //console.log(final);

    return final;
};
