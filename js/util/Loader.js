function Loader() {
    var self = this;
    self.cache = {}; // Filename -> {Geometry, Material, [callbacks]}
    self.textureCache = {}; // Filename -> Texture
    self.loader = new THREE.JSONLoader();
}

Loader.prototype.loadTexture = function(filename, callback) {
    var self = this;

    var texture = self.textureCache[filename];
    if(texture === undefined) {
        texture = THREE.ImageUtils.loadTexture(filename, undefined, callback);
        self.textureCache[filename] = texture;
    }
    return texture;
};

Loader.prototype.loadTextureCube = function(filenames, callback) {
    var self = this;

    var filename = filenames[0]; // Use the first texture as the lookup name
    var texture = self.textureCache[filename];
    if(texture === undefined) {
        texture = THREE.ImageUtils.loadTextureCube(filenames, undefined, callback);
        self.textureCache[filename] = texture;
    } else {
        callback(texture);
    }
};

Loader.prototype.loadMesh = function(filename, callback) {
    var self = this;

    // Don't worry about texture caching because ThreeJS caches all loaded images
    // and material.clone creates shallow copies of textures.

    var cacheData = self.cache[filename];
    if(cacheData === undefined) {

        // Not found in cache, load now

        // Add initial entry to cache
        var cacheData = {
            loaded: false,
            geometry: null,
            material: null,
            callbacks: []
        };
        self.cache[filename] = cacheData;

        // Load the json file
        self.loader.load(filename, function(geometry, materials) {

            // Finished loading

            // Update the cache
            var material = self.createMaterial(materials);
            cacheData.geometry = geometry;
            cacheData.material = material;
            cacheData.loaded = true;

            // Call the callback on this
            callback(geometry, self.cloneMaterial(material));

            // Call the callbacks for all other objects created before this finished loading
            for(var i = 0; i < cacheData.callbacks.length; i++) {
                var callbackCached = cacheData.callbacks[i];
                callbackCached(geometry, self.cloneMaterial(material));
            }
        });

    } else {

        // Check if the cache data is loaded. If not add the callback
        if(cacheData.loaded) {
            var geometry = cacheData.geometry;
            var material = self.cloneMaterial(cacheData.material);
            callback(geometry, material);
        } else {
            cacheData.callbacks.push(callback);
        }

    }
};

Loader.prototype.createMaterial = function(materials) {

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
};

Loader.prototype.cloneMaterial = function(material) {
    var newMaterial = material.clone();
    newMaterial.transparentOld = material.transparentOld;
    newMaterial.opacityOld = material.opacityOld;
    return newMaterial;
};

Loader.prototype.dispose = function() {

    // Not really necessary to call this function since the memory will be reused elsewhere

    var self = this;
    
    // Dispose geometries
    var geometryKeys = Object.keys(self.geometryCache);
    for(var i = 0; i < geometryKeys.length; i++) {
        var key = geometryKeys[i];
        var geometry = self.geometryCache[key];
        geometry.dispose();
    }
    self.geometryCache = {};


    // Dispose materials
    // No listeners are attached in the ThreeJS source, so this doesn't do anything
    var materialKeys = Object.keys(self.materialCache);
    for(var i = 0; i < materialKeys.length; i++) {
        var key = materialKeys[i];
        var material = self.matericalCache[key];
        var materials = Util.getMaterials(material); // Get all the materials in the material (e.g. MeshFaceMaterial)
        for(var j = 0; j < materials.length; j++) {
            var material = materials[j];
            material.dispose();
        }
    }
    self.materialCache = {};

    // TO-DO: Dispose textures.
    // Find all the textures on all the materials
    // or go directly to WebGLTextures.js and manually delete there
};
