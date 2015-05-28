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

                var object = new Physijs.BoxMesh(geometry, physicsMat, mass);
                object.position.fromArray(data.position);
                object.rotation.fromArray(data.rotation);
                object.scale.fromArray(data.scale);
                object.visible = data.visible;
                game.addObject(object);
            
            } else {
                var object = new THREE.Mesh(geometry, material);
                object.position.fromArray(data.position);
                object.rotation.fromArray(data.rotation);
                object.scale.fromArray(data.scale);
                object.visible = data.visible;
                game.addObject(object);
            }
        });
    }


    if(data.light !== null) {

        if(data.light.type == "point") {

            var object = new THREE.PointLight(data.light.color, 1.0, data.light.distance);
            object.position.fromArray(data.position);
            object.visible = data.visible;
            game.addObject(object);

        } else if(data.light.type == "dir") {

            var object = new THREE.DirectionalLight(data.light.color, 1.0);
            var position = Utils.getDirLightPosition(data.rotation);
            object.position.copy(position);
            object.visible = data.visible;
            game.addObject(object);
        }
    }
}

