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

Utils.createMaterial = function(materials) {

    var meshMaterial;
    if(materials === undefined){
        meshMaterial = new THREE.MeshLambertMaterial();
        materials = [meshMaterial];
    }
    else if(materials.length == 1) meshMaterial = materials[0];
    else meshMaterial = new THREE.MeshFaceMaterial(materials);

    // Fix materials
    for(var i = 0; i < materials.length; i++) {

        var material = materials[i];

        if(material.map) {
            material.map.wrapS = material.map.wrapT = THREE.RepeatWrapping; // Set repeat wrapping
            //if(material.transparent) material.opacity = 1.0; // If transparent and it has a texture, set opacity to 1.0
        }
        

        if(material.transparent) {
            material.depthWrite = false;
            //material.side = THREE.DoubleSide;
            material.side = THREE.FrontSide;
        } else {
            material.side = THREE.FrontSide;
        }

        // For editor purposes
        material.transparentOld = material.transparent;
        material.opacityOld = material.opacity;
    }

    return meshMaterial;
}

Utils.getMaterials = function(material) {
    if(material.type == "MeshFaceMaterial") {
        return material.materials;
    } else {
        return [material];
    }
}

Utils.getDirLightPosition = function(rotation) {
    var euler = new THREE.Euler(rotation[0], rotation[1], rotation[2], 'XYZ');
    var position = new THREE.Vector3(0, 1, 0);
    position.applyEuler(euler).normalize();
    position.multiplyScalar(200.0); // Add extra position for increasing shadow casting region
    return position;
}
