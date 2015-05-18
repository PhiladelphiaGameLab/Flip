function ObjectGame (data) {

    var self = this;

    // Load the ThreeJS mesh
    if(data.mesh !== null) {
        game.loader.load(data.mesh, function(geometry, materials) {
            
            var material = Utils.createMaterial(materials);

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

                game.addObject(shape);
            
            } else {
                var shape = new THREE.Mesh(geometry, material);
                shape.position.fromArray(data.position);
                shape.rotation.fromArray(data.rotation);
                shape.scale.fromArray(data.scale);
               game.addObject(shape);
            }
        });
    }


    if(data.light !== null) {

        if(data.light.type == "point") {

            light = new THREE.PointLight(data.light.color, 1.0, data.light.distance);
            game.addObject(light);

        } else if(data.light.type == "dir") {

            light = new THREE.DirectionalLight(data.light.color, 1.0);
            game.addObject(light);
        }
    }
}

