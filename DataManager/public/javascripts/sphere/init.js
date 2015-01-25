﻿var scene;
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
	this.nodes = null;
	this.edges = null;
	this.spheres_object3d = spheres_object3d;
	this.occupied = {};
	this._findChildren = function(node){
		console.log("Find children");
		node_edges = [];
		$.each(this.edges, function(i, e){
			if(e['source'] == node['id']){
				node_edges.push(e);
			}
		});
		console.log("Node edges:");
		console.log(node_edges.length);
		console.log(node_edges);
		children = [];
		$.each(this.nodes, function(i, n){
			$.each(node_edges, function(j, ne){
				if(ne['target'] == n['id']){
					children.push(n);
				}
			});
		});
		return children;
	};
	
	this._findParents = function(node){
		console.log("Find children");
		node_edges = [];
		$.each(this.edges, function(i, e){
			if(e['target'] == node['id']){
				node_edges.push(e);
			}
		});
		console.log("Node edges:");
		console.log(node_edges.length);
		console.log(node_edges);
		parents = [];
		$.each(this.nodes, function(i, n){
			$.each(node_edges, function(j, ne){
				if(ne['source'] == n['id']){
					parents.push(n);
				}
			});
		});
		return parents;
	};

	this.init = function(nodes){
	//START, typy ficzerów na najwyższej sferze
		console.log("Nodes:");
		console.log(nodes);
		this.nodes = nodes.nodes.node;
		this.edges = nodes.edges.edge;
		
		var root_node = null;
		$.each(this.nodes, function(i,n){
			if(n['id'] == nodes['root_node_id']){
				root_node = n;
			}
		});
		console.log("Root node:");
		console.log(root_node);
		//add root node to center...
		var sv = SPHERE.SURFACE.sphere.addObject(
				new SphereVertex(root_node['img_src'])
		);
		sv.caption = root_node['name'];
		sv.node = root_node;
		SPHERE.SURFACE.sphere.rearrangeObjects();
		//ssphere.rearrangeObjects();
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
	
	this.joinNodes = function(nodes1, nodes2, comp){
		join = [];
		$.each(nodes1, function(i, node1){
			$.each(nodes2, function(i, node2){
				if(comp(node1,node2)){
					join.push(node1);
				}
			});
		});
		return join;
	};
	this.handle = function(sphere, obj){
		//console.log(SPHERE);
		//console.log(spheres);
		if(obj == this.root){
			//reinit?
		}
		if(!sphere.isCenteredOn(obj)){
			console.log("NOT CENTERED -> ANIMATION");
			sphere.setAnimation(ANIMATION.CENTER, obj.object3d);
			return;
		}
		switch(sphere.position){
			case SPHERE.CENTER:
				console.log("Center clicked");
			break;
			case SPHERE.INNER:
				console.log("Inner clicked");
			break;
			case SPHERE.OUTER:
				console.log("Outer clicked");
				console.log(SPHERE.SURFACE.sphere.objects.length);
				if(SPHERE.SURFACE.sphere.objects.length>0){
					SPHERE.SURFACE.sphere.clear();
					
					console.log("OBJECT:");
					console.log(obj);
					var children = this._findChildren(obj.node);
					console.log("OBJECT ELEMS:");
					console.log(children);
					var working_sphere = SPHERE.SURFACE.sphere;
					$.each(children, function(i, child){
						//console.log(country.id);
						var tex = 'img/placeholder.png';
						if(child.hasOwnProperty('img_src')){
							tex = child['img_src'];
						}
						var sv = working_sphere.addObject(
							new SphereVertex(tex)
						);
						sv.caption = child['name'].toLowerCase().capitalize();
						//save obj as feature
						sv.feature = i;
						sv.node = child;
					});
				
					SPHERE.SURFACE.sphere.rearrangeObjects();
					SPHERE.SURFACE.sphere.setAnimation(ANIMATION.GROWING);
					this.makeEdges(SPHERE.SURFACE.sphere.objects, [obj], true);
				}
			break;
			case SPHERE.SURFACE:
				console.log("Surface clicked");
				//MAGIC HAPPENS - klik na wycentrowanym obiekcie, wszystko idzie na 2ga sfere, a na 1sza rzeczy zwiazane z featurem
				console.log('WAS CENTERED!');
				//przesuniecie
				
				var children = this._findChildren(obj.node);
				
				if(children.length>0){ //mozna dalej rozwijac graf - wchodzic w glab
					this.swapSpheres(SPHERE.CENTER, SPHERE.INNER);
					this.swapSpheres(SPHERE.INNER, SPHERE.OUTER);
					this.swapSpheres(SPHERE.SURFACE, SPHERE.OUTER);
				
					console.log("OBJECT:");
					console.log(obj);
					console.log("OBJECT ELEMS:");
					console.log(children);
					var working_sphere = SPHERE.SURFACE.sphere;
					$.each(children, function(i, child){
						//console.log(country.id);
						var tex = 'img/placeholder.png';
						if(child.hasOwnProperty('img_src')){
							tex = child['img_src'];
						}
						var sv = working_sphere.addObject(
							new SphereVertex(tex)
						);
						sv.caption = child['name'].toLowerCase().capitalize();
						//save obj as feature
						sv.feature = i;
						sv.node = child;
					});
					
					SPHERE.SURFACE.sphere.rearrangeObjects();
					this.makeEdges(SPHERE.SURFACE.sphere.objects, [obj], true);
				}else{
					//trzeba szukac czegos ciekawego na outer zeby polaczyc... ?
					var parents = this._findParents(obj.node);
					var parents_objs = [];
					$.each(parents, function(i, par_node){
						//console.log("Par_node");
						//console.log(par_node);
						$.each(SPHERE.OUTER.sphere.objects, function(i, par_obj){
							//console.log("par obj");
							//console.log(par_obj);
							if(par_node === par_obj.node){
								console.log("THE SAME!");
								parents_objs.push(par_obj);
							}
						});
					});
					SPHERE.SURFACE.sphere.clear([obj]);
					this.makeEdges(parents_objs, [obj], true);
				}
			break;
		}
		
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
	
	this.makeEdges = function(objects1, objects2, delete_edges){
		//clear edges...??
		//add edges
		if(delete_edges){
			$.each(edges, function(i, e){
				e.remove();
				//this.spheres_object3d.removeChild(e);
			});
		}
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
	/*
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
	*/
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
	/*parsed_data = {};
    $.each(nodes.features.feature, 
		function (i, feature) {
			//console.log(feature);
			parsed_data[feature['name']] = [ nodes[feature['name']], feature['single_name']];
		}
	);*/
	//console.log(parsed_data);
	intelligentManager.init(nodes);

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