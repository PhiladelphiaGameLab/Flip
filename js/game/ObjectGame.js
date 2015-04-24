function ObjectGame (data) {

    var self = this;

    self.name = data.name;
    self.id = data.id;
    self.visible = data.visible;
    self.position = [data.position[0], data.position[1], data.position[2]];
    self.rotation = [data.rotation[0], data.rotation[1], data.rotation[2]];
    self.scale = [data.scale[0], data.scale[1], data.scale[2]];

    self.visual = null;
    self.physics = null;

    console.log(data.mesh);

    // Load the ThreeJS mesh
    if(data.mesh !== null) {
        game.loader.load(data.mesh, function(geometry, materials) {
            var material = (materials.length == 1) ? materials[0] : new THREE.MeshFaceMaterial(materials);
            //var mesh = new THREE.Mesh(geometry, material);
            //mesh.position.fromArray(self.position);
            //mesh.rotation.fromArray(self.rotation);
            //mesh.scale.fromArray(self.scale);
            //mesh.visible = self.visible;
            //self.visual = mesh;
            //game.scene.add(mesh);

            box = new Physijs.BoxMesh(geometry, material);
            game.scene.add( box );

        });
    }
}

