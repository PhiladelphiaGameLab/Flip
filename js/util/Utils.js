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
    
    clone.particle = data.particle || false;
    clone.particlemesh = data.particlemesh || null;
    clone.emitter = null;
    if(data.particle) clone.emitter = {
        type: data.emitter.type,
        radius: data.emitter.radius,
        speed: data.emitter.speed,
        size: data.emitter.size,
        color: data.emitter.color,
        alive:data.emitter.alive,
        acceleration:data.emitter.acceleration,
        velocity:data.emitter.velocity
    };

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
    if(data.partilce) {
        clone.emitter.acceleration = data.emitter.acceleration ? [data.emitter.acceleration[0], data.emitter.acceleration[1], data.emitter.acceleration[2]] : [0,0,0];
        clone.emitter.velocity = data.emitter.velocity ? [data.emitter.velocity[0], data.emitter.velocity[1], data.emitter.velocity[2]] : [0,0,0];
    }
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

    if(data.particle) clone.particle = data.particle;
    if(data.particle) clone.particlemesh = data.particlemesh;

    if(data.particle) clone.emitter = {
        type: data.emitter.type,
        radius: data.emitter.radius,
        speed: data.emitter.speed,
        size: data.emitter.size,
        color: data.emitter.color,
        alive: data.emitter.alive,
        acceleration:data.emitter.acceleration,
        velocity:data.emitter.velocity
    };

    if(data.material) clone.material = {
        color: data.material.color
    };

    if(data.physics) clone.physics = {
        type: data.physics.type,
        friction: data.physics.friction,
        restitution: data.physics.restitution,
        shape: data.physics.shape,
        mass : data.physics.mass
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
        fov: data.camera.fov
    };
    if(data.partilce) {
        clone.emitter.acceleration = [data.emitter.acceleration[0], data.emitter.acceleration[1], data.emitter.acceleration[2]];
        clone.emitter.velocity = [data.emitter.velocity[0], data.emitter.velocity[1], data.emitter.velocity[2]];
    }
    clone.position = [data.position[0], data.position[1], data.position[2]];
    clone.rotation = [data.rotation[0], data.rotation[1], data.rotation[2]];
    clone.scale = [data.scale[0], data.scale[1], data.scale[2]];

    return clone;
};
