var Assets = {};

Assets.assets = [
    {name:"Chair", icon:"img/cube.png", mesh:"data/assets/chair/chair.json"},
    {name:"Cube", icon:"img/cube.png", mesh:"data/assets/shapes/cube.json"},
    {name:"Sphere", icon:"img/cube.png", imesh:"data/assets/shapes/sphere.json"},
    {name:"Tree", icon:"img/cube.png", mesh:"data/assets/tree/tree.json"},
    {name:"Rock", icon:"img/cube.png", mesh:"data/assets/rock/rock.json"},
    {name:"Point Light", icon:"img/light.png", light:{color:0xFFF000, distance:50, type:"point"}},
    {name:"Dir Light", icon:"img/light.png", light:{color:0xffffff, type:"dir"}},

    // Physics Demo Assets
    {name:"Grass", icon:"img/cube.png", mesh:"data/assets/physics_demo/environment.json", castShadow:false},
    {name:"Steel Plank", icon:"img/cube.png", mesh:"data/assets/physics_demo/plank_steel.json", physics:{enabled:true,type:"static",friction:0.2,restitution:0.9,shape:"cube",mass:1.0}},
    {name:"Wood Plank", icon:"img/cube.png", mesh:"data/assets/physics_demo/plank_wood.json", physics:{enabled:true,type:"dynamic",friction:1.0,restitution:0.5,shape:"cube",mass:3.0}},
    {name:"Steel Box", icon:"img/cube.png", mesh:"data/assets/physics_demo/cube_steel.json", physics:{enabled:true,type:"static",friction:0.2,restitution:0.9,shape:"cube",mass:1.0}},
    {name:"Wood Box", icon:"img/cube.png", mesh:"data/assets/physics_demo/cube_wood.json", physics:{enabled:true,type:"dynamic",friction:1.0,restitution:0.5,shape:"cube",mass:2.0}},
    {name:"Steel Ball", icon:"img/cube.png", mesh:"data/assets/physics_demo/sphere_steel.json", physics:{enabled:true,type:"static",friction:0.2,restitution:0.9,shape:"sphere",mass:1.0}},
    {name:"Wood Ball", icon:"img/cube.png", mesh:"data/assets/physics_demo/sphere_wood.json", physics:{enabled:true,type:"dynamic",friction:1.0,restitution:0.5,shape:"sphere",mass:2.0}},
    //{name:"Glass Ball", icon:"img/cube.png", mesh:"data/assets/physics_demo/sphere_glass.json"},
    //{name:"Aimer", icon:"img/cube.png", tag:"aimer", mesh:"data/assets/shapes/sphere.json"}
    //{name:"MultiMat", icon:"img/cube.png", mesh:"data/assets/multimat/multimat.json"},
    //{name:"Skinning Simple", icon:"img/cube.png", mesh:"data/assets/skinning_simple/skinning_simple.js"},
    //{name:"Terrain", icon:"img/cube.png", mesh:"data/assets/terrain/terrain.json"},
    //{name:"Player", icon:"img/cube.png", tag:"player", mesh:"data/assets/capsule/capsule.json"},
    //{name:"Camera", icon:"img/camera.png", camera:{fov:70}},
    //{name:"Stones", icon:"img/cube.png", mesh:"data/assets/physics_demo/stones.json", castShadow:false, receiveShadow:false},
    //{name:"Glass Plank", icon:"img/cube.png", mesh:"data/assets/physics_demo/plank_glass.json"},
    //{name:"Glass Box", icon:"img/cube.png", mesh:"data/assets/physics_demo/cube_glass.json"},
];

Assets.getAssetByName = function(name) {

    for (var i = 0; i < Assets.assets.length; i++) {
        if(Assets.assets[i].name == name) {
            return Assets.assets[i];
        }
    }
    return null;
};
