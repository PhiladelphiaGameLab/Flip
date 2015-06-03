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
}

Utils.getDirLightPosition = function(rotation) {
    var euler = new THREE.Euler(rotation[0], rotation[1], rotation[2], 'XYZ');
    var position = new THREE.Vector3(0, 1, 0);
    position.applyEuler(euler).normalize();
    position.multiplyScalar(200.0); // Add extra position for increasing shadow casting region
    return position;
}
