//Type numbers and corresponding shapes
//--------------------
//        oooooooo
//        oooooooo
//     1  oooooooo
//        oooooooo
//--------------------
//              oo
//            oooo
//     2    oooooo
//        oooooooo
//--------------------
//        oo
//        oooo
//     3  oooooo
//        oooooooo
//--------------------
//        oooooooo
//        oooooo
//     4  oooo
//        oo
//--------------------
//        oooooooo
//          oooooo
//     5      oooo
//              oo
//--------------------
function Ground(type) {
    var radius = 1;
    var material = new THREE.MeshLambertMaterial({color: 0x665544});
    var geometry = new THREE.Geometry();
    switch(type) {
        case 1:
            // box
            this.name = "Box";
            geometry.vertices.push(new THREE.Vector3(-radius, -radius, radius));
            geometry.vertices.push(new THREE.Vector3(radius, -radius, radius));
            geometry.vertices.push(new THREE.Vector3(radius, radius, radius));
            geometry.vertices.push(new THREE.Vector3(-radius, radius, radius));
            geometry.vertices.push(new THREE.Vector3(-radius, -radius, -radius));
            geometry.vertices.push(new THREE.Vector3(radius, -radius, -radius));
            geometry.vertices.push(new THREE.Vector3(radius, radius, -radius));
            geometry.vertices.push(new THREE.Vector3(-radius, radius, -radius));
            // front face
            geometry.faces.push(new THREE.Face3(0, 1, 2));
            geometry.faces.push(new THREE.Face3(0, 2, 3));
            // rear face
            geometry.faces.push(new THREE.Face3(6, 5, 4));
            geometry.faces.push(new THREE.Face3(7, 6, 4));
            // top face
            geometry.faces.push(new THREE.Face3(3, 2, 6));
            geometry.faces.push(new THREE.Face3(3, 6, 7));
            // bottom face
            geometry.faces.push(new THREE.Face3(1, 0, 4));
            geometry.faces.push(new THREE.Face3(1, 4, 5));
            // right face
            geometry.faces.push(new THREE.Face3(1, 5, 6));
            geometry.faces.push(new THREE.Face3(6, 2, 1));
            // left face
            geometry.faces.push(new THREE.Face3(4, 0, 3));
            geometry.faces.push(new THREE.Face3(3, 7, 4));
            break;
        case 2:
            // right-slanting floor
            this.name = "Right-Slanting Floor";
            geometry.vertices.push(new THREE.Vector3(-radius, -radius, radius));
            geometry.vertices.push(new THREE.Vector3(radius, -radius, radius));
            geometry.vertices.push(new THREE.Vector3(radius, radius, radius));
            geometry.vertices.push(new THREE.Vector3(-radius, -radius, -radius));
            geometry.vertices.push(new THREE.Vector3(radius, -radius, -radius));
            geometry.vertices.push(new THREE.Vector3(radius, radius, -radius));
            // front face
            geometry.faces.push(new THREE.Face3(0, 1, 2));
            // rear face
            geometry.faces.push(new THREE.Face3(5, 4, 3));
            // slope
            geometry.faces.push(new THREE.Face3(0, 2, 3));
            geometry.faces.push(new THREE.Face3(5, 3, 2));
            // bottom face
            geometry.faces.push(new THREE.Face3(1, 0, 4));
            geometry.faces.push(new THREE.Face3(4, 0, 3));
            // right face
            geometry.faces.push(new THREE.Face3(1, 4, 5));
            geometry.faces.push(new THREE.Face3(5, 2, 1));
            break;
        case 3:
            // left-slanting floor
            this.name = "Left-Slanting Floor";
            geometry.vertices.push(new THREE.Vector3(-radius, -radius, radius));
            geometry.vertices.push(new THREE.Vector3(radius, -radius, radius));
            geometry.vertices.push(new THREE.Vector3(-radius, radius, radius));
            geometry.vertices.push(new THREE.Vector3(-radius, -radius, -radius));
            geometry.vertices.push(new THREE.Vector3(radius, -radius, -radius));
            geometry.vertices.push(new THREE.Vector3(-radius, radius, -radius));
            // front face
            geometry.faces.push(new THREE.Face3(0, 1, 2));
            // rear face
            geometry.faces.push(new THREE.Face3(5, 4, 3));
            // left face
            geometry.faces.push(new THREE.Face3(0, 2, 3));
            geometry.faces.push(new THREE.Face3(5, 3, 2));
            // bottom face
            geometry.faces.push(new THREE.Face3(1, 0, 4));
            geometry.faces.push(new THREE.Face3(4, 0, 3));
            // slope
            geometry.faces.push(new THREE.Face3(1, 4, 5));
            geometry.faces.push(new THREE.Face3(5, 2, 1));
            break;
        case 4:
            // right-slanting ceiling
            this.name = "Right-Slanting Ceiling";
            geometry.vertices.push(new THREE.Vector3(-radius, -radius, radius));
            geometry.vertices.push(new THREE.Vector3(radius, radius, radius));
            geometry.vertices.push(new THREE.Vector3(-radius, radius, radius));
            geometry.vertices.push(new THREE.Vector3(-radius, -radius, -radius));
            geometry.vertices.push(new THREE.Vector3(radius, radius, -radius));
            geometry.vertices.push(new THREE.Vector3(-radius, radius, -radius));
            // front face
            geometry.faces.push(new THREE.Face3(0, 1, 2));
            // rear face
            geometry.faces.push(new THREE.Face3(5, 4, 3));
            // left face
            geometry.faces.push(new THREE.Face3(0, 2, 3));
            geometry.faces.push(new THREE.Face3(5, 3, 2));
            // slope
            geometry.faces.push(new THREE.Face3(1, 0, 4));
            geometry.faces.push(new THREE.Face3(4, 0, 3));
            // top face
            geometry.faces.push(new THREE.Face3(1, 4, 5));
            geometry.faces.push(new THREE.Face3(5, 2, 1));
            break;
        case 5:
            // left-slanting ceiling
            this.name = "Left-Slanting Ceiling";
            geometry.vertices.push(new THREE.Vector3(radius, -radius, radius));
            geometry.vertices.push(new THREE.Vector3(radius, radius, radius));
            geometry.vertices.push(new THREE.Vector3(-radius, radius, radius));
            geometry.vertices.push(new THREE.Vector3(radius, -radius, -radius));
            geometry.vertices.push(new THREE.Vector3(radius, radius, -radius));
            geometry.vertices.push(new THREE.Vector3(-radius, radius, -radius));
            // front face
            geometry.faces.push(new THREE.Face3(0, 1, 2));
            // rear face
            geometry.faces.push(new THREE.Face3(5, 4, 3));
            // slope
            geometry.faces.push(new THREE.Face3(0, 2, 3));
            geometry.faces.push(new THREE.Face3(5, 3, 2));
            // right face
            geometry.faces.push(new THREE.Face3(1, 0, 4));
            geometry.faces.push(new THREE.Face3(4, 0, 3));
            // top face
            geometry.faces.push(new THREE.Face3(1, 4, 5));
            geometry.faces.push(new THREE.Face3(5, 2, 1));
            break;
    }
    geometry.computeFaceNormals();
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.self = this;
}
Ground.prototype.getPosition = function() {
    return this.mesh.position;
};
Ground.prototype.setPosition = function(x, y, z) {
    this.mesh.position.x = x;
    this.mesh.position.y = y;
    this.mesh.position.z = z;
};