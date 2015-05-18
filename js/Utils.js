var Utils = {};

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
            if(material.transparent) material.opacity = 1.0; // If transparent and it has a texture, set opacity to 1.0
        }
        
        if(material.transparent) {
            material.depthWrite = false;
            material.side = THREE.DoubleSide;
        }
    }

    return meshMaterial;
}
