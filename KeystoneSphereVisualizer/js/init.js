var scene;
var camera;
var renderer;
var raycaster;

function initialize() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    raycaster = new THREE.Raycaster();

    if (window.WebGLRenderingContext)
        renderer = new THREE.WebGLRenderer({ alpha: true });
    else
        renderer = new THREE.CanvasRenderer({ alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    camera.position.z = 5;
}

initialize(); //scene, camera, renderer
var spheres_object3d = new THREE.Object3D();
SPHERE.CENTER.sphere = new Sphere(SPHERE.CENTER);
SPHERE.INNER.sphere = new Sphere(SPHERE.INNER);
SPHERE.OUTER.sphere = new Sphere(SPHERE.OUTER);
SPHERE.SURFACE.sphere = new Sphere(SPHERE.SURFACE);

//var axes = buildAxes( 1000 );
//spheres_object3d.add(axes);

//for iterations
var spheres = {
    0: SPHERE.CENTER.sphere,
    1: SPHERE.INNER.sphere,
    2: SPHERE.OUTER.sphere,
    3: SPHERE.SURFACE.sphere
};
var edges = [];

$.each(spheres, function(i, o) {
    spheres_object3d.add(o.object3d)
});

//add TEST objs to sphere
function addTestObjs() {
    var material = [];
    material[0] = new THREE.SpriteMaterial(
        {
            color: 0x500050,
            map: THREE.ImageUtils.loadTexture('http://www.html5canvastutorials.com/demos/assets/crate.jpg')
        }
    );
    material[1] = new THREE.SpriteMaterial(
        {
            color: 0x000033,
            map: THREE.ImageUtils.loadTexture('http://www.html5canvastutorials.com/demos/assets/crate.jpg')
        }
    );
    material[2] = new THREE.SpriteMaterial(
        {
            color: 0x003300,
            map: THREE.ImageUtils.loadTexture('http://www.html5canvastutorials.com/demos/assets/crate.jpg')
        }
    );
    material[3] = new THREE.SpriteMaterial(
        {
            color: 0x330000,
            map: THREE.ImageUtils.loadTexture('http://www.html5canvastutorials.com/demos/assets/crate.jpg')
        }
    );

    SPHERE.CENTER.sphere.addObject(new SphereVertex(material[0]));

    SPHERE.CENTER.sphere.getObjects3d()[0].material = new THREE.SpriteMaterial({
        map: THREE.ImageUtils.loadTexture('http://www.html5canvastutorials.com/demos/assets/crate.jpg')
    });

    for (var i = 0; i < 100; i++) {
        for (var j = 1; j < 4; j++) {
            spheres[j].addObject(new SphereVertex(material[j]));
        }
    }
    $.each(spheres, function(i, sphere) {
        console.log(sphere);
    });
    for (var i = 0; i < 4; i++) {
        //console.log("rearrange " + i);
        //console.log(spheres[i]);
        spheres[i].rearrangeObjects();
    }
};

//render threejs in progress
scene.add(spheres_object3d);
var render = function() {
    requestAnimationFrame(render);
    renderer.render(scene, camera);
};
render();

var OnDataLoaded = function (nodes) {

    var isAnyHiding = false;

    $.each(spheres, function(i, sphere) {
        if (/*SPHERE.SURFACE.*/sphere.animation == ANIMATION.HIDING) {
            isAnyHiding = true;
        }
    });

    if (isAnyHiding) {
        window.setTimeout(function () {
            console.log("On Data Loaded....");
            OnDataLoaded(nodes);
        }, 100);
        return;
    }

    
    //console.log(nodes);
    $.each(nodes, function(i, iterNode) {
            //console.log('Id: ' + iterNode.id);
            //console.log('Label: ' + iterNode.label);
            var tex = null;
            var category = null;
            var action = null;
            var action_url = null;
            if (iterNode.hasOwnProperty('position')) {
                //console.log('Position: ' + iterNode.position);
            }
            if (iterNode.hasOwnProperty('img_src')) {
                //kind of debug....
                //console.log("DODAJE FOTE");
                tex = THREE.ImageUtils.loadTexture(iterNode.img_src);
                //console.log('Image: ' + iterNode.image);
            }

            if (iterNode.hasOwnProperty('actions')) {
                //console.log('Action: ' + iterNode.actions.action);
                action = iterNode.actions.action.target;
                action_url = iterNode.actions.action.text;
                if (action == null) {
                    action_url = iterNode.actions.action;
                }
                //console.log("Action saved: " + action, "Action url: " + action_url);
            }

            if (iterNode.hasOwnProperty('category')) {
                //console.log('Category: ' + iterNode.category);
                category = iterNode.category;
            }
            var sphere = SPHERE.SURFACE.sphere;
            var color = 0x990000;
            if (category != null) {
                console.log(category);
                if (category == 'position') {
                    sphere = SPHERE.INNER.sphere;
                    color = 0x500050;
                } else if (category == 'faculty') {
                    sphere = SPHERE.CENTER.sphere;
                    color = 0x000099;
                } else if (category == 'degree') {
                    sphere = SPHERE.OUTER.sphere;
                    color = 0x009900;
                }
            }
            if (tex == null)
                tex = THREE.ImageUtils.loadTexture('crate.png');

            var sv = sphere.addObject(
                new SphereVertex(
                    new THREE.SpriteMaterial(
                        {
                            map: tex
//                            color: color
                        }
                    )
                )
            );
            sv.id = iterNode.id;
            sv.caption = iterNode.name;
            sv.action = action;
            sv.action_url = action_url;
        }
    );
    SPHERE.SURFACE.sphere.rearrangeObjects();
    SPHERE.OUTER.sphere.rearrangeObjects();
    SPHERE.INNER.sphere.rearrangeObjects();
    edges = [];
    //add edges
    var surface_obj_nr = SPHERE.SURFACE.sphere.objects.length;
    var outer_obj_nr = SPHERE.OUTER.sphere.objects.length;
    for (var i = 0; i < surface_obj_nr; i++) {
        for (var j = 0; j < outer_obj_nr; j++) {
            var edge = new Edge(SPHERE.SURFACE.sphere.objects[i].object3d,
                SPHERE.OUTER.sphere.objects[j].object3d,
                spheres_object3d);
            //console.log(edge);
            edges.push(edge);
        }
    }
    $.each(spheres, function(i, sphere) {
        sphere.setAnimation(ANIMATION.GROWING);
    });
};
var data_manager = new DataManager(OnDataLoaded);

document.addEventListener('dblclick', onDocumentDblClick, false);
document.addEventListener('mousedown', onDocumentDown, false);
document.addEventListener('mouseup', onDocumentUp, false);
document.addEventListener('mousemove', onDocumentMove, false);

function performAction(obj) {
    if (!obj.hasOwnProperty('spherevertex')) return;
    console.log("Action:");
    console.log(obj.spherevertex);
    console.log(obj.spherevertex.action);
    console.log(obj.spherevertex.action_url);
    var url = obj.spherevertex.action_url;
    if (obj.spherevertex.action == 'new_page') {
        if (url != null) {
            console.log("Calling an new page action on url: " + url);
            window.open(url, '_blank');
        }
    } else if (obj.spherevertex.action == null) {
        if (url != null) {
            var index = url.indexOf("file://");
            if (index > -1) {
                console.log("File load action");
                url = url.substring(index + "file://".length, url.length);
                console.log("URL: " + url);
                $.each(spheres, function(i, sphere) {
                    sphere.setAnimation(ANIMATION.HIDING);
                });
                data_manager.loadObjects(url);
            }
        }
    }
}

function onDocumentDblClick(event) {
    event.preventDefault();
    var vector = new THREE.Vector3();
    vector.set((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1, 0.5);
    vector.unproject(camera);
    raycaster.ray.set(camera.position, vector.sub(camera.position).normalize());
    //on any sphere...

    //sphere obj?
    var all_objs = [];
    var objects = {};
    for (var it = 3; it >= 0; it--) {
        //console.log('Getting  objs');
        //console.log(spheres);
        objects[it] = spheres[it].getObjects3d();
        all_objs = all_objs.concat(objects[it]);
    }
    //console.log(objects);
    var intersects = raycaster.intersectObjects(all_objs);
    if (intersects.length > 0) {
        //console.log("Intersection click!");
        var io = intersects[0].object;
        performAction(io);
    }
};

var movingStarted = false;
var startMouseMoving = { "x": 0, "y": 0 };
var oldMouse = { "x": 0, "y": 0 };

function onDocumentUp(event) {
    event.preventDefault();

    if (movingStarted) {
        movingStarted = false;
    }
    //console.log("Moving stopped");
}

function onDocumentDown(event) {
    event.preventDefault();
    movingStarted = true;

    //console.log("Moving started");
    oldMouse = { "x": event.pageX, "y": event.pageY };
    startMouseMoving = oldMouse;

    //clicked? center the vert
    var vector = new THREE.Vector3();
    vector.set((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1, 0.5);
    vector.unproject(camera);
    raycaster.ray.set(camera.position, vector.sub(camera.position).normalize());
    var PI2 = Math.PI * 2;

    var particleMaterial = new THREE.MeshBasicMaterial(
        { color: 0xFFFFFF, side: THREE.DoubleSide }
    );
    //sphere obj?
    var all_objs = [];
    var objects = {};
    for (var it = 3; it >= 0; it--) {
        //console.log('Getting  objs');
        //console.log(spheres);
        objects[it] = spheres[it].getObjects3d();
        all_objs = all_objs.concat(objects[it]);
    }
    //console.log(objects);
    var intersects = raycaster.intersectObjects(all_objs);
    if (intersects.length > 0) {
        //console.log("Intersection click!");
        var io = intersects[0].object;
        //intersects[ 0 ].object.material.color.setHex( Math.random() * 0xffffff );
        //WHAT DO
        for (var it = 3; it >= 0; it--) {
            if (objects[it].contains(io)) {
                spheres[it].setAnimation(ANIMATION.CENTER, io);
                return;
            }
        }
    }
}

function onDocumentMove(event) {
    //console.log("moving");
    if (movingStarted) {
        //should we cancel animation?
        var nowMouse = { "x": event.pageX, "y": event.pageY };
        var deltaX = oldMouse.x - nowMouse.x;
        var deltaY = oldMouse.y - nowMouse.y;
        oldMouse = nowMouse;

        var mpi = Math.PI / 180;
        //rotation
        var xAxis = new THREE.Vector3(1, 0, 0);
        var yAxis = new THREE.Vector3(0, 1, 0);
        rotateAroundWorldAxis(spheres_object3d, yAxis, -0.3 * deltaX * mpi);
        rotateAroundWorldAxis(spheres_object3d, xAxis, -0.3 * deltaY * mpi);
        //spheres_object3d.rotation.y-=0.3*deltaX*mpi;
        //spheres_object3d.rotation.x-=0.3*deltaY*mpi;

        //if moved more than 13 px, turn of centering animation
        var moved = Math.abs(startMouseMoving.x - nowMouse.x) + Math.abs(startMouseMoving.y - nowMouse.y);
        //console.log(moved);
        if (moved > 30) {
            $.each(spheres, function (i, sphere) {
                if (sphere.animation !== ANIMATION.HIDING && sphere.animation !== ANIMATION.GROWING) {
                    sphere.setAnimation(ANIMATION.NONE, null, true);
                    console.log("kakalaczek");
                }
            });
        }
    }
}

//main update loop
var ONE_FRAME_TIME = 1000 / 20;

var mainloop = function () {
    $.each(spheres, function(i, sphere) {
        sphere.update(ONE_FRAME_TIME, spheres_object3d);
    });
    $.each(edges, function(i, edge) {
        if ($(document).find('.js-show-edges').is(':checked')) {
            edge.update();
        } else {
            edge.remove();
        }
    });
};
setInterval(mainloop, ONE_FRAME_TIME);

//INITIAL DATA LOAD
//data_manager.loadObjects('graphKASK.xml');
data_manager.loadObjects('keystone.xml')
//clike between evrythng