﻿var scene;
var camera;
var renderer;
var raycaster;

function initialize() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
	//var width = window.innerWidth/50;
	//var height = window.innerHeight/50;
	//camera = new THREE.OrthographicCamera( width / - 2, width / 2, height / 2, height / - 2, 0.1, 1000 );
				
    raycaster = new THREE.Raycaster();
	
	renderer = new THREE.WebGLRenderer({ alpha: true,  antialias: true } );
    //renderer.shadowMapType = THREE.PCFSoftShadowMap;
    renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);
    camera.position.z = 10*globalscale;
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

var Command = function(name, node, obj){
	this.name = name;
	this.commandNode = node;
	this.commandObj = obj;
};

var IntelligentManager = function(spheres_object3d){
	this.nodes = null;
	this.edges = null;
	this.spheres_object3d = spheres_object3d;
	this.occupied = {};
	this.commands = [];
	this.sphere_max = 0;
	this.handleRightClick = function(){
		/*var n = this.commands.length;
		if(n>0){
			console.log("Commands in the stack");
			//UNDO
			console.log(this.commands[n-1].name);
			switch(this.commands[n-1].name){
				case 'init':
					console.log("Init command was last");
					break;
				case 'handle_sphere_click_with_children':
					SPHERE.SURFACE.sphere.clear();
					this.swapSpheres(SPHERE.SURFACE, SPHERE.OUTER);
					this.swapSpheres(SPHERE.INNER, SPHERE.OUTER);
					this.swapSpheres(SPHERE.CENTER, SPHERE.INNER);
					$.each(spheres, function(i,s){ s.setAnimation(ANIMATION.GROWING); });
					this.makeEdges(SPHERE.SURFACE.sphere.objects,[this.commands[n-1].commandObj], true);
					
					this.commands.pop();
					break;
				case 'handle_sphere_click_with_parents':
				    this.commands.pop();
					var parents = this._findParents(this.commands[n-1].commandNode);
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
					
					this.commands.pop();
					break;
				case 'handle_outer_click':
					
					break;
			}
		}*/
	};
	this._findChildren = function(node){
		//console.log("Find children");
		node_edges = [];
		$.each(this.edges, function(i, e){
			if(e['source'] == node['id']){
				node_edges.push(e);
			}
		});
		//console.log("Node edges:");
		//console.log(node_edges.length);
		//console.log(node_edges);
		children = [];
		$.each(this.nodes, function(i, n){
			$.each(node_edges, function(j, ne){
				if(ne['target'] == n['id']){
					children.push(n);
				}
			});
		});
		//console.log(children);
		return children;
	};
	
	this._findParents = function(node){
		//console.log("Find parents");
		node_edges = [];
		$.each(this.edges, function(i, e){
			if(e['target'] == node['id']){
				node_edges.push(e);
			}
		});
		//console.log("Node edges:");
		//console.log(node_edges.length);
		//console.log(node_edges);
		parents = [];
		$.each(this.nodes, function(i, n){
			$.each(node_edges, function(j, ne){
				if(ne['source'] == n['id']){
					parents.push(n);
				}
			});
		});
		//console.log(parents);
		return parents;
	};

	this.init = function(nodes){
	//START, typy ficzerów na najwyższej sferze
		//console.log("Nodes:");
		//console.log(nodes);
		this.nodes = nodes.nodes.node;
		this.edges = nodes.edges.edge;
		
		var root_node = null;
		$.each(this.nodes, function(i,n){
			if(n['id'] == nodes['root_node_id']){
				root_node = n;
			}
		});
		//console.log("Root node:");
		//console.log(root_node);
		//add root node to center...
		var sv = SPHERE.CENTER.sphere.addObject(
				new SphereVertex(root_node['img_src'])
		);
		sv.caption = root_node['name'];
		sv.node = root_node;
		this.commands.push('init', root_node, sv);
		/*SPHERE.SURFACE.sphere.rearrangeObjects();
		//ssphere.rearrangeObjects();
		$.each(spheres, function (i, sphere) {
			sphere.setAnimation(ANIMATION.GROWING);
		});*/
	};
	
	this.swapSpheres = function(sphere_pos, sphere_pos_2){
		//swap positions and sphere.positions attr.
		//console.log("SWAP SPHERES");
		//console.log("BEFORE");
		//console.log(sphere_pos);
		//console.log(sphere_pos_2);
		
		var temp = sphere_pos.sphere;
		sphere_pos.sphere = sphere_pos_2.sphere;
		sphere_pos_2.sphere = temp;
		console.log("1st part swap");
		sphere_pos.sphere.position = sphere_pos;
		sphere_pos_2.sphere.position = sphere_pos_2;
		
		//console.log("Animations");
		sphere_pos.sphere.setAnimation(ANIMATION.GROWING);
		sphere_pos_2.sphere.setAnimation(ANIMATION.GROWING);
		
		//console.log("AFTER");
		//console.log(sphere_pos);
		//console.log(sphere_pos_2);
	};
	
	this.joinNodes = function(nodes1, nodes2, comp){
		join = [];
		$.each(nodes1, function(i, node1){
			$.each(nodes2, function(i, node2){
				if(comp(node1,node2)){
					join.push(node2);
				}
			});
		});
		return join;
	};
	this.handle = function(sphere, obj){
		//testing
		switch(sphere.position){
			case SPHERE.CENTER:
				console.log("Center clicked");
			break;
			case SPHERE.INNER:
				console.log("Inner clicked");
			break;
			case SPHERE.OUTER:
				console.log("Outer clicked");
			break;
			case SPHERE.SURFACE:
				console.log("Surface clicked");
			break;
		};
		if(!sphere.isCenteredOn(obj)){
			//console.log("NOT CENTERED -> ANIMATION");
			sphere.setAnimation(ANIMATION.CENTER, obj.object3d);
			return;
		}else{
			console.log("Centered...");
		}
		//surface click
		console.log("Sphere max == " + this.sphere_max);
		if(sphere.position.value == this.sphere_max){
			console.log("Surface clicked");
			//MAGIC HAPPENS - klik na wycentrowanym obiekcie, wszystko idzie na 2ga sfere, a na 1sza rzeczy zwiazane z featurem
			
			var children = this._findChildren(obj.node);
			
			if(children.length>0){ //mozna dalej rozwijac graf - wchodzic w glab
				this.sphere_max++;
				console.log('handle_sphere_click_with_children');
				this.commands.push(new Command('handle_sphere_click_with_children', obj.node, obj));
				//this.swapSpheres(SPHERE.CENTER, SPHERE.INNER);
				//this.swapSpheres(SPHERE.INNER, SPHERE.OUTER);
				//this.swapSpheres(SPHERE.SURFACE, SPHERE.OUTER);
			
				console.log("OBJECT:");
				console.log(obj);
				console.log("OBJECT ELEMS:");
				console.log(children);
				var working_sphere = spheres[this.sphere_max];
				console.log(working_sphere.position);
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
				
				working_sphere.rearrangeObjects({'close_to' : obj});
				$.each(spheres[this.sphere_max-1].objects, function(i, o){
						o.object3d.visible = false;
					});
				obj.object3d.visible = true;
				
				working_sphere.setAnimation(ANIMATION.GROWING);
				console.log(working_sphere);
				this.makeEdges(working_sphere.objects, [obj], true);
				
				try{
					var sph = this.sphere_max-1;
					var par = this._findParents(obj.node);
					var parents_objs = this.joinNodes(par, spheres[sph].objects, function(p, o){ //pushes o to array if ===
							return p === o.node;
					});
					while(parents_objs[0]){
						edges.push(new Edge(parents_objs[0], obj.node, this.spheres_object3d));
						sph--;
						par = this._findParents(par[0]);
						parents_objs = this.joinNodes(par, spheres[sph].objects, function(p, o){ //pushes o to array if ===
							return p === o.node;
						});
					};
				}catch(e){ console.log(e); }
			}else{
				this.commands.push(new Command('handle_sphere_click_with_parents', obj.node, obj));
				//trzeba szukac czegos ciekawego na outer zeby polaczyc... ?
				var parents = this._findParents(obj.node);
				var parents_objs = [];
				
				parents_objs = this.joinNodes(parents, spheres[this.sphere_max-1].objects, function(p, o){ //pushes o to array if ===
					return p === o.node;
				});
				$.each(spheres[this.sphere_max-1].objects, function(i, so){
					so.object3d.visible = false;
				});
				$.each(parents_objs, function(i, po){
					po.object3d.visible = true;
				});
				
				spheres[this.sphere_max].clear([obj]);
				//spheres[this.sphere_max-1].rearrangeObjects({'close_to' : obj, 'show_them_close_to': parents_objs});
				this.makeEdges(parents_objs, [obj], true);
			}
		}else if(this.sphere_max > 0){
			if(sphere.position.value == this.sphere_max-1){
				//outer
				if(spheres[this.sphere_max].objects.length>0){
					this.commands.push(new Command('handle_outer_click', obj.node, obj));
					spheres[this.sphere_max].clear();
					
					$.each(spheres[this.sphere_max-1].objects, function(i, o){
						o.object3d.visible = false;
					});
					obj.object3d.visible = true;
					console.log("OBJECT:");
					console.log(obj);
					var children = this._findChildren(obj.node);
					console.log("OBJECT ELEMS:");
					console.log(children);
					var working_sphere = spheres[this.sphere_max];
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
				
					working_sphere.rearrangeObjects({'close_to' : obj});
					working_sphere.setAnimation(ANIMATION.GROWING);
					this.makeEdges(working_sphere.objects, [obj], true);
				}
			}else if(sphere.position.value == this.sphere_max-2){
				//inner
				this.commands.push(new Command('handle_inner_click', obj.node, obj));
				console.log("Clicked inner");
				console.log("Clean sphere_max");
				spheres[this.sphere_max].clear();
				console.log("Clean sphere_max-1");
				spheres[this.sphere_max-1].clear();
				console.log("Cleared (this and +1 sphere)....: " + this.sphere_max);
				this.sphere_max-=2;
				this.handle(sphere, obj);
			}else if(sphere.position.value == this.sphere_max-3){
				//center ze sfery
				this.commands.push(new Command('handle_center_click', obj.node, obj));
				console.log("Clicked inner");
				console.log("Clean sphere_max");
				spheres[this.sphere_max].clear();
				console.log("Clean sphere_max-1");
				spheres[this.sphere_max-1].clear();
				console.log("Cleared (this and +1 sphere)....: " + this.sphere_max);
				console.log("Clean sphere_max-2");
				spheres[this.sphere_max-2].clear();
				this.sphere_max-=3;
				this.handle(sphere, obj);
			}
		}
	};
	
	this.handleDoubleClick = function(obj){
		if (!obj.hasOwnProperty('spherevertex')) return;
		console.log("Action");
		//console.log(obj.spherevertex);
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
};

//render threejs in progress
scene.add(spheres_object3d);
var render = function () {
    requestAnimationFrame(render);
    renderer.render(scene, camera);
};
render();

var intelligentManager = new IntelligentManager(spheres_object3d);


var texturePooler = new TexturePooler();

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
    
    console.log(nodes);
	//preload - antylag
    $.each(nodes.nodes.node,
		function (i, node) {
			//console.log(feature);
			if(node.hasOwnProperty('img_src')){
				var texture = node['img_src'];
				//tex = THREE.ImageUtils.loadTexture(texture);
				tex = texturePooler.getTexture(texture);
			}
		}
	);
	//console.log(parsed_data);
	intelligentManager.init(nodes);

};

var data_manager = new DataManager(OnDataLoaded);

document.addEventListener('dblclick', onDocumentDblClick, false);
document.addEventListener('mousedown', onDocumentDown, false);
document.addEventListener('mouseup', onDocumentUp, false);
document.addEventListener('mousemove', onDocumentMove, false);
document.addEventListener('contextmenu', onDocumentDownRight, false);
window.addEventListener('mousewheel', onDocumentScroll, false);
window.addEventListener('resize', onWindowResize, false);

function onWindowResize(e) {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect	= window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();  
}

function onDocumentDownRight(event){
    event.preventDefault();
    console.log('right click');
	intelligentManager.handleRightClick();
};

function onDocumentScroll(evt) {
    evt.preventDefault();
    evt.stopPropagation();
    if (evt.wheelDeltaY > 0 && camera.position.z >= 3) {
        camera.position.z -= 0.1;
    } else if (evt.wheelDeltaY < 0 && camera.position.z <= 13*4) {
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