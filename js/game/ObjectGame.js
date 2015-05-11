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
            
            // Create material
            var material;
            if(materials === undefined) material = new THREE.MeshLambertMaterial();
            else if(materials.length == 1) material = materials[0];
            else material = new THREE.MeshFaceMaterial(materials);

            if(data.physics) {

                var static = data.physics.type == "static";
                var mass = static ? 0.0 : data.physics.mass;

                var physicsMat = Physijs.createMaterial(
                    material,
                    data.physics.friction,
                    data.physics.restitution
                );

                console.log(data.physics.friction, data.physics.restitution);


                var shape = new Physijs.BoxMesh(geometry, physicsMat, mass);
                shape.position.fromArray(data.position);
                shape.rotation.fromArray(data.rotation);
                shape.scale.fromArray(data.scale);

                game.scene.add( shape );
            }
        });
    }
}

