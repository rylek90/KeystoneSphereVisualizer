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
    camera.position.z = 10;
}

initialize(); //scene, camera, renderer
var spheres_object3d = new THREE.Object3D();
SPHERE.CENTER.sphere = new Sphere(SPHERE.CENTER);
SPHERE.INNER.sphere = new Sphere(SPHERE.INNER);
SPHERE.OUTER.sphere = new Sphere(SPHERE.OUTER);
SPHERE.SURFACE.sphere = new Sphere(SPHERE.SURFACE);

//for iterations
var spheres = {
    0: SPHERE.CENTER.sphere,
    1: SPHERE.INNER.sphere,
    2: SPHERE.OUTER.sphere,
    3: SPHERE.SURFACE.sphere
};
var edges = [];

$.each(spheres, function (i, o) {
    spheres_object3d.add(o.object3d)
});

var IntelligentManager = function(spheres_object3d){
	this.surfaceFeature = null;
	this.surfaceObject = null;
	this.outerFeature = null;
	this.outerObject = null;
	this.innerFeature = null;
	this.innerObject = null;
	this.features = null;
	this.spheres_object3d = spheres_object3d;
	this.init = function(features, root){
	//START, typy ficzerów na najwyższej sferze
		this.features = features;
		var ssphere = SPHERE.SURFACE.sphere;
		$.each(parsed_data, function(i, feature){
			//initially - only surface sphere & features, and no edges
			var tex = 'img/placeholder.png';
			//var color = 0x000099;
			//console.log(i);
			//console.log(feature);
			var sv = ssphere.addObject(
				new SphereVertex(tex)
			);
			sv.caption = i.toLowerCase().capitalize();
			//save obj as feature
			sv.feature = i;
			sv.node = feature;
			}
		);
		ssphere.rearrangeObjects({'grouped':true});
		$.each(spheres, function (i, sphere) {
			sphere.setAnimation(ANIMATION.GROWING);
		});
	};
	
	this.swapSpheres = function(sphere_pos, sphere_pos_2){
		//swap positions and sphere.positions attr.
		console.log("SWAP SPHERES");
		console.log("BEFORE");
		console.log(sphere_pos);
		console.log(sphere_pos_2);
		
		var temp = sphere_pos.sphere;
		sphere_pos.sphere = sphere_pos_2.sphere;
		sphere_pos_2.sphere = temp;
		console.log("1st part swap");
		sphere_pos.sphere.position = sphere_pos;
		sphere_pos_2.sphere.position = sphere_pos_2;
		
		console.log("Animations");
		sphere_pos.sphere.setAnimation(ANIMATION.GROWING);
		sphere_pos_2.sphere.setAnimation(ANIMATION.GROWING);
		
		console.log("AFTER");
		console.log(sphere_pos);
		console.log(sphere_pos_2);
	};
	
	this.handle = function(sphere, obj){
		console.log(SPHERE);
		console.log(spheres);
		if(obj == this.root){
			//reinit?
		}
		if(sphere != SPHERE.SURFACE.sphere) return; //nie handluje z klikami na nizsze sfery
		console.log(sphere);
		console.log(obj);
		if(sphere.isCenteredOn(obj)){
			//MAGIC HAPPENS - klik na wycentrowanym obiekcie, wszystko idzie na 2ga sfere, a na 1sza rzeczy zwiazane z featurem
			console.log('WAS CENTERED!');
			var node = obj.node;
			var feature = obj.feature;
			/*console.log("OBJ:");
			console.log(obj);
			console.log("FEATURE:");
			console.log(feature);
			console.log("FEATURE OBJS:");
			console.log(this.features[feature]);
			console.log("NODE:");
			console.log(node);*/
			//change spheres
			var working_sphere = SPHERE.OUTER.sphere;
			var concrete_features = this.features[feature];
			var elems = concrete_features[0][concrete_features[1]];
			switch(feature){
					case "countries":
						console.log("COUNTRIES!!!");
						$.each(elems, function(i, country){
							//console.log(country.id);
							var tex = null;
							if(country.text){
								//console.log(country.text);
								var sv = working_sphere.addObject(
									new SphereVertex(tex)
								);
								sv.caption = country.text.toLowerCase().capitalize();
								//save obj as feature
								sv.feature = i;
								sv.node = country;
							}
						});
					break;
					case "people":
						console.log("PEOPLE!");
						$.each(elems, function(i, person){
							var tex = person['img_src'];
							//console.log(country.text);
						
							var sv = working_sphere.addObject(
								new SphereVertex(tex)
							);
							sv.caption = person['name'].toLowerCase().capitalize();
							//save obj as feature
							sv.feature = i;
							sv.node = person;
							
						});
					break;
			}
			
			SPHERE.OUTER.sphere.rearrangeObjects();
			this.swapSpheres(SPHERE.SURFACE, SPHERE.OUTER);
			this.makeEdges(SPHERE.SURFACE.sphere.objects, [obj]);
		}else{
			console.log("NOT CENTERED - ANIMATION");
		}
		if(sphere == SPHERE.SURFACE.sphere){
			sphere.setAnimation(ANIMATION.CENTER, obj.object3d);
		}
		/*if (it == SPHERE.SURFACE.value) {
		/*if (it == SPHERE.SURFACE.value) {
		   reloadInnerSphereFor(io.spherevertex);
		} else if (it == SPHERE.INNER.value) {
			reloadOuterSphereFor(io.spherevertex);
		}*/
	};
	
	this.handleDoubleClick = function(obj){
		if (!obj.hasOwnProperty('spherevertex')) return;
		console.log("Action");
		console.log(obj.spherevertex);
		var url = obj.spherevertex.href;
		if (url) {
			console.log("Calling an new page action on url: " + url);
			window.open(url, '_blank');
		}else{
			console.log("No url specified");
		}
	};
	
	this.makeEdges = function(objects1, objects2){
		//clear edges...??
		//add edges
		$.each(edges, function(i, e){
			e.remove();
			this.spheres_object3d.removeChild(e);
		});
		edges = [];
		var surface_obj_nr = objects1.length;
		var outer_obj_nr = objects2.length;
		for (var i = 0; i < surface_obj_nr; i++) {
			for (var j = 0; j < outer_obj_nr; j++) {
				var edge = new Edge(objects1[i].object3d,
					objects2[j].object3d,
					this.spheres_object3d);
				//console.log(edge);
				edges.push(edge);
			}
		}
	};
	this.reloadOuterSphereFor = function (experObject) {
		var id = experObject.id;
		
		$.each(SPHERE.SURFACE.sphere.object3d.children, function (i, sphereObj) {
			var scientistObj = sphereObj.spherevertex;
			if (scientistObj.hasOwnProperty('expertises') 
				&& scientistObj.expertises.hasOwnProperty('expertise')) {
				var expertisesIds = [];
				
				for (var i = 0; i < scientistObj.expertises.expertise.length; i++) {
					expertisesIds[i] = scientistObj.expertises.expertise[i].id;
				}
				
				if (!expertisesIds.contains(id)) {
					scientistObj.object3d.visible = false;
				}
			} else {
				scientistObj.object3d.visible = false;
			}
			
		});
	};
	this.reloadInnerSphereFor = function(scientistObj) {
		if (scientistObj.hasOwnProperty('expertises') 
			&& scientistObj.expertises.hasOwnProperty('expertise')) {
			var expertisesIds = [];
			
			for (var i = 0; i < scientistObj.expertises.expertise.length; i++) {
				expertisesIds[i] = scientistObj.expertises.expertise[i].id;
			}
			
			$.each(SPHERE.INNER.sphere.object3d.children, function (i, child) {
				if (!expertisesIds.contains(child.spherevertex.id)) {
					child.visible = false;
				}
			});
		}
	};
};

//render threejs in progress
scene.add(spheres_object3d);
var render = function () {
    requestAnimationFrame(render);
    renderer.render(scene, camera);
};
render();

var intelligentManager = new IntelligentManager(spheres_object3d);

var OnDataLoaded = function (nodes) {
    var isAnyHiding = false;
    $.each(spheres, function (i, sphere) {
        if ( /*SPHERE.SURFACE.*/sphere.animation == ANIMATION.HIDING) {
            isAnyHiding = true;
        }
    });
    
    if (isAnyHiding) {
        window.setTimeout(function () {
           // console.log("On Data Loaded....");
            OnDataLoaded(nodes);
        }, 100);
        return;
    }
    
    //console.log(nodes);
	parsed_data = {};
    $.each(nodes.features.feature, 
		function (i, feature) {
			//console.log(feature);
			parsed_data[feature['name']] = [ nodes[feature['name']], feature['single_name']];
		}
	);
	//console.log(parsed_data);
	intelligentManager.init(parsed_data);

};


var data_manager = new DataManager(OnDataLoaded);

document.addEventListener('dblclick', onDocumentDblClick, false);
document.addEventListener('mousedown', onDocumentDown, false);
document.addEventListener('mouseup', onDocumentUp, false);
document.addEventListener('mousemove', onDocumentMove, false);
window.addEventListener('mousewheel', onDocumentScroll, false);



function onDocumentScroll(evt) {
    evt.preventDefault();
    evt.stopPropagation();
    if (evt.wheelDeltaY > 0 && camera.position.z >= 3) {
        camera.position.z -= 0.1;
    } else if (evt.wheelDeltaY < 0 && camera.position.z <= 13) {
        camera.position.z += 0.1;
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
		intelligentManager.handleDoubleClick(io);
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
                if (io.spherevertex.object3d.visible) {
                    intelligentManager.handle(spheres[it], io.spherevertex);
                }
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
        
        //if moved more than 13 px, turn of centering animation
        var moved = Math.abs(startMouseMoving.x - nowMouse.x) + Math.abs(startMouseMoving.y - nowMouse.y);
        //console.log(moved);
        if (moved > 30) {
            $.each(spheres, function (i, sphere) {
                if (sphere.animation !== ANIMATION.HIDING && sphere.animation !== ANIMATION.GROWING) {
                    sphere.setAnimation(ANIMATION.NONE, null, true);
                }
            });
        }
    }
}

//main update loop
var ONE_FRAME_TIME = 1000 / 20;

var mainloop = function () {
    $.each(spheres, function (i, sphere) {
        sphere.update(ONE_FRAME_TIME, spheres_object3d);
    });
	$.each(edges, function (i, edge) {
		edge.update();
    });
};
setInterval(mainloop, ONE_FRAME_TIME);

//INITIAL DATA LOAD
//data_manager.loadObjects('graphKASK.xml');
data_manager.loadObjects('keystone.xml')
//clike between evrythng