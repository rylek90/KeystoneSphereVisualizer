var scene;
var camera;
var renderer;
var raycaster;

function initialize() {
    scene = new THREE.Scene();
	//var width = initialWidth/50;
	//var height = initialWidth/50;
	//camera = new THREE.OrthographicCamera( width / - 2, width / 2, height / 2, height / - 2, 0.1, 1000 );
    reinitXY()
    raycaster = new THREE.Raycaster();
	
	renderer = new THREE.WebGLRenderer({ alpha: true,  antialias: true } );
    //renderer.shadowMapType = THREE.PCFSoftShadowMap;
	
	$(renderer.domElement).attr('id', 'js-canvas');
	camera = new THREE.PerspectiveCamera(75, initialWidth / initialHeight, 0.1, 1000);
    //document.body.appendChild(renderer.domElement);
    
    
    renderer.setSize(initialWidth, initialHeight);
    
    $(document.getElementById("js-canvas")).replaceWith($(renderer.domElement));
    camera.position.z = 10*globalscale;
}

function reinitXY() {
    $(document.getElementById("js-canvas")).width('100%');
    $(document.getElementById("js-canvas")).height('95%');
    initialWidth = $(document.getElementById("js-canvas")).width();
    initialHeight = $(document.getElementById("js-canvas")).height();	
}

var initialWidth = '';
var initialHeight = '';
$(document).ready(function () {
    
    reinitSelectors();
});

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

    this.findNode = function (name) {
        var sphere = spheres[this.sphere_max];
        $.each(sphere.objects, function(i, obj) {
            if (obj.node.name === name) {
                if (!sphere.isCenteredOn(obj)) {
                    sphere.setAnimation(ANIMATION.CENTER, obj.object3d);
                    return;
                }
            }
        });
        
    };

	this.handle = function(sphere, obj, force){
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
			console.log("NOT CENTERED -> ANIMATION");
			sphere.setAnimation(ANIMATION.CENTER, obj.object3d);
			if(!force){
				return;
			}
		}else{
			console.log("Centered...");
		}
		//surface click
		console.log("Sphere max == " + this.sphere_max);
		
		//SPECIAL
		
		if(sphere.position.value >= this.sphere_max-1){
			var type = obj.node['type'];
			console.log(type);
			if((type==='entity' || type==='country' || type==='workgroup' || type==='expertise')){
				console.log("GO TO PEOPLE TEST - special case");
				if(this.sphere_max == 3){
					//this.commands.push(new Command('handle_sphere_click_special_case_1', obj.node, obj));
					console.log("People attrib click ");
					
				}else if(this.sphere_max == 2){
					this.commands.push(new Command('handle_sphere_click_special_case', obj.node, obj));
					console.log("Attrib click - show ppl");
					this.sphere_max = 1;
					var obj_n = obj.node;
					console.log("obj_n:");
					console.log(obj_n);
					spheres[2].clear();
					//open people
					var people_obj = null;
					$.each(spheres[1].objects, function(i,o){
						if(o.node['name']==='people') {
							people_obj = o; 
						}else{
							o.object3d.visible = false;
						}
					});
					people_obj.object3d.visible = true;
					console.log("people_obj:");
					console.log(people_obj);
					this.handle(spheres[1], people_obj, true);
					
					//find anyone with country obj_n
					var somebody = null;
					var self = this;
					$.each(spheres[2].objects, function(i, per){
						var countries = self._findChildren(per.node);
						if(countries.contains(obj_n)){
							somebody = per;
						}
					});
					var obj2 = somebody;
					console.log("obj2");
					console.log(obj2);
					this.handle(spheres[2], obj2, true);
					var attrib = null;
					$.each(spheres[3].objects, function(i, o){
						if(o.node === obj_n){
							attrib = o;
						}
					});
					console.log("attrib:");
					console.log(attrib);
					$.each(spheres, function(i, sph){ if(sph.animation===ANIMATION.CENTER) sph.animation = ANIMATION.NONE; });
					this.handle(spheres[3], attrib, true);
					console.log("FINAL CENTER");
					spheres[3].stackedCenter = attrib.object3d;
					console.log(spheres[3].center_obj);
					var temp = spheres[3].position.radius;
					spheres[3].position.radius = spheres[2].position.radius;
					spheres[2].position.radius = temp;
					return;
				}
			}
		}
		
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
			
				//console.log("OBJECT:");
				//console.log(obj);
				//console.log("OBJECT ELEMS:");
				//console.log(children);
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
				if(this.sphere_max==1){
					var vector = new THREE.Vector3(0,0,10);
					spheres_object3d.rotation.set(0,0,0);
					spheres_object3d.updateMatrixWorld();
					//spheres_object3d.rotation.set(new THREE.Vector3(0,0,0));
					working_sphere.rearrangeObjects({'close_to' : { 'object3d' : {'position' : vector} }});
				}else{
					working_sphere.rearrangeObjects({'close_to' : obj});
				}
				$.each(spheres[this.sphere_max-1].objects, function(i, o){
						o.object3d.visible = false;
					});
				obj.object3d.visible = true;
				
				working_sphere.setAnimation(ANIMATION.GROWING);
				//console.log(working_sphere);
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
				console.log("outer click");
				if(spheres[this.sphere_max].objects.length>0){
					this.commands.push(new Command('handle_outer_click', obj.node, obj));
					console.log('handle_outer_click');
					spheres[this.sphere_max].clear();
					
					$.each(spheres[this.sphere_max-1].objects, function(i, o){
						o.object3d.visible = false;
					});
					obj.object3d.visible = true;
				//	console.log("OBJECT:");
				//	console.log(obj);
					var children = this._findChildren(obj.node);
				//	console.log("OBJECT ELEMS:");
				//	console.log(children);
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
					if(this.sphere_max==1){
						console.log("Actually center click");
						var vector = new THREE.Vector3(0,0,10);
						spheres_object3d.rotation.set(0,0,0);
						spheres_object3d.updateMatrixWorld();
						//spheres_object3d.rotation.set(new THREE.Vector3(0,0,0));
						working_sphere.rearrangeObjects({'close_to' : { 'object3d' : {'position' : vector} }});
					}else{
						working_sphere.rearrangeObjects({'close_to' : obj});
					}
					working_sphere.setAnimation(ANIMATION.GROWING);
					this.makeEdges(working_sphere.objects, [obj], true);
				}
			}else if(sphere.position.value == this.sphere_max-2){
				//inner
				this.commands.push(new Command('handle_inner_click', obj.node, obj));
				console.log('handle_inner_click');
			//	console.log("Clicked inner");
			//	console.log("Clean sphere_max");
				spheres[this.sphere_max].clear();
			//	console.log("Clean sphere_max-1");
				spheres[this.sphere_max-1].clear();
			//	console.log("Cleared (this and +1 sphere)....: " + this.sphere_max);
				this.sphere_max-=2;
				this.handle(sphere, obj);
			}else if(sphere.position.value == this.sphere_max-3){
				//center ze sfery
				this.commands.push(new Command('handle_center_click', obj.node, obj));
				console.log('handle_center_click');
			//	console.log("Clicked inner");
			//	console.log("Clean sphere_max");
				spheres[this.sphere_max].clear();
			//	console.log("Clean sphere_max-1");
				spheres[this.sphere_max-1].clear();
			//	console.log("Cleared (this and +1 sphere)....: " + this.sphere_max);
			//	console.log("Clean sphere_max-2");
				spheres[this.sphere_max-2].clear();
				this.sphere_max-=3;
				this.handle(sphere, obj);
			}
		}
	};
	
	this.handleDoubleClick = function(sphere, obj){
		console.log("Double click on sphere!");
		console.log(obj);
		var obj_n = obj.node;
		//if(sphere.position.value == this.sphere_max){
			console.log("pos == sphere_max // surface");
			//find children
			var children = this._findChildren(obj.node);
			/*if(children.length>0 && sphere.position.value!=3){
				console.log('redirect(1) to handle');
				this.handle(sphere,obj, true);
				return;
			}*/
			
			var parents = this._findParents(obj.node);
			var parentsOfType = [];
			console.log(parents);
			$.each(parents, function(i, par){
				if(par['type'] === "category"){
					parentsOfType.push(par);
				}
			});
			console.log(parentsOfType);
			if(parentsOfType.length <= 0) {
				console.log("No parent category");
				this.handle(sphere, obj, true);
				console.log('redirect(2) to handle');
				return;
			}
			console.log('handle_surface_dblclick');
			this.commands.push(new Command('handle_surface_dblclick', obj.node, obj));
			var parent_obj = null;
			var parent_sphere = -1;
			var obj_clicked = null
			for(var i=0; i<this.sphere_max; i++){
				$.each(spheres[i].objects, function(j,o){
					if(o.node === parentsOfType[0]){
						parent_sphere = i;
						parent_obj = o;
					}
				});
				if(parent_sphere!=-1){
					break;
				}
			}
			console.log("parent sph:" + parent_sphere);
			for(var i=parent_sphere+1; i<=this.sphere_max; i++){
				spheres[i].clear();
			}
			$.each(spheres[parent_sphere].objects, function(i,o) { 
				o.object3d.visible = false; 
			});
			parent_obj.object3d.visible = true;
			this.sphere_max = parent_sphere;
			
			this.handle(spheres[parent_sphere], parent_obj, true);
			//spheres_object3d.updateMatrixWorld();
			var doloop = true;
			$.each(spheres[parent_sphere+1].objects, function(i,obj){
				if(!doloop) return;
				if(obj.node === obj_n){
					//console.log("NODE FOUND!!!");
					//console.log(obj.node);
					$.each(spheres, function(i, sph){ if(sph.animation===ANIMATION.CENTER) sph.animation = ANIMATION.NONE; });
					spheres[parent_sphere+1].stackedCenter=obj.object3d;
					doloop = false;
				}
			});
			
			
		/*}
		else if(sphere.position.value == this.spehere_max-1){
			console.log("pos == sphere_max-1 // outer");
		//outer
		}else if(sphere.position.value == this.sphere_max-2){
			console.log("pos == sphere_max-2 // inner");
		//inner
		}else if(sphere.position.value == this.sphere_max-3){
			console.log("pos == sphere_max-3 // center");
			this.handle(sphere, obj);
		}else{
			console.log("DbClick - what should I do?");
			
			console.log(sphere);
			console.log(obj);
		}*/
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

document.getElementById("js-canvas").addEventListener('dblclick', dblclick, false);
document.getElementById("js-canvas").addEventListener('click', click, false);
document.getElementById("js-canvas").addEventListener('mousedown', onDocumentDown, false);
document.getElementById("js-canvas").addEventListener('mouseup', onDocumentUp, false);
document.getElementById("js-canvas").addEventListener('mousemove', onDocumentMove, false);
document.getElementById("js-canvas").addEventListener('contextmenu', onDocumentDownRight, false);
document.getElementById("js-canvas").addEventListener('mousewheel', onDocumentScroll, false);

window.addEventListener('resize', onWindowResize, false);

function click(e) {
    var that = this;
    setTimeout(function() {
        var dblclick = parseInt($(that).data('double'), 10);
        if (dblclick > 0) {
            $(that).data('double', dblclick-1);
        } else {
            onDocumentClick(e);
        }
    }, 300);
};

function dblclick(e){
	 $(this).data('double', 2);
	 onDocumentDblClick(e);
};

function onWindowResize(e) {
reinitXY();
  renderer.setSize(initialWidth, initialHeight);
  camera.aspect	= initialWidth / initialHeight;
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
    console.log("Double click event!");
    //clicked? center the vert
    var vector = new THREE.Vector3();
    vector.set((event.clientX / initialWidth) * 2 - 1, -(event.clientY / initialHeight) * 2 + 1, 0.5);
    vector.unproject(camera);
    raycaster.ray.set(camera.position, vector.sub(camera.position).normalize());
    var PI2 = Math.PI * 2;
    
   
    //sphere objs
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
	intersects.sort(function(a,b){
		var vectora = new THREE.Vector3();
        vectora.setFromMatrixPosition(a.object.matrixWorld);
		var vectorb = new THREE.Vector3();
        vectorb.setFromMatrixPosition(b.object.matrixWorld);
		
		if(vectora.z < vectora.z) return -1;
		if(vectorb.z > vectorb.z) return 1;
		return 0;
	});
    if (intersects.length > 0) {
        //console.log("Intersection click!");
        //intersects[ 0 ].object.material.color.setHex( Math.random() * 0xffffff );
        //WHAT DO
		for(var i=0; i<intersects.length; i++){
			var io = intersects[i].object;
			for (var it = 3; it >= 0; it--) {
				if (objects[it].contains(io)) {
					if (io.spherevertex.object3d.visible) {
						intelligentManager.handleDoubleClick(spheres[it], io.spherevertex);
					}
					return;
				}
			}
		};
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

function onDocumentClick(event){
	console.log("Click event!");
	var nowMouse = { "x": event.pageX, "y": event.pageY };
	var moved = Math.abs(startMouseMoving.x - nowMouse.x) + Math.abs(startMouseMoving.y - nowMouse.y);
	console.log(moved);
	if(moved > 40){
		console.log("Moved hard");
		movingStarted = false;
		return;
	}
	
    //clicked? center the vert
    var vector = new THREE.Vector3();
    vector.set((event.clientX / initialWidth) * 2 - 1, -(event.clientY / initialHeight) * 2 + 1, 0.5);
    vector.unproject(camera);
    raycaster.ray.set(camera.position, vector.sub(camera.position).normalize());
    var PI2 = Math.PI * 2;
    
    /*var particleMaterial = new THREE.MeshBasicMaterial(
        { color: 0xFFFFFF, side: THREE.DoubleSide }
    );*/
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
	var num = 1;
	
	/*for(var i=0; i<intersects.length; i++){
			console.log(intersects[i].object.spherevertex.node['name']);
			console.log(intersects[i]);
	}*/
	intersects.sort(function(a,b){
		var vectora = new THREE.Vector3();
        vectora.setFromMatrixPosition(a.object.matrixWorld);
		var vectorb = new THREE.Vector3();
        vectorb.setFromMatrixPosition(b.object.matrixWorld);
		
		if(vectora.z < vectora.z) return -1;
		if(vectorb.z > vectorb.z) return 1;
		return 0;
	});
    if (intersects.length > 0) {
        //console.log("Intersection click!");
        
        //intersects[ 0 ].object.material.color.setHex( Math.random() * 0xffffff );
        //WHAT DO
		for(var i=0; i<intersects.length; i++){
			var io = intersects[i].object;
			for (var it = 3; it >= 0; it--) {
				if (objects[it].contains(io)) {
					if (io.spherevertex.object3d.visible) {
						intelligentManager.handle(spheres[it], io.spherevertex);
					}
					return;
				}
			}
		};
    }
}

function onDocumentDown(event) {
    event.preventDefault();
    movingStarted = true;
    
    //console.log("Moving started");
    oldMouse = { "x": event.pageX, "y": event.pageY };
    startMouseMoving = oldMouse;
    
}

function onDocumentMove(event) {
    //console.log("moving");
    if (movingStarted) {
		if(event.which==1){
			console.log("Button hold");
		}else{
			console.log("BUG");
			movingStarted = false;
			return;
		}
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
	/*if(intelligentManager.sphere_max==3){
		//console.log("SWITCH RADIUS 2 & 3");
		spheres[3].position.radius = spheres[2].position.initialradius;
		spheres[2].position.radius = spheres[3].position.initialradius;
	}else{
		$.each(spheres, function(i, sphere){
			sphere.position.radius = sphere.position.initialradius;
		});
	}*/
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
data_manager.loadObjects('keystone.xml');
//clike between evrythng

function reinitSelectors() {
    $(".js-data-array").select2({
        data: function () {
            return {
                results: SPHERE.OUTER.sphere.objects, text: function (dat) {
                    return dat.node.name;
                }
            };
        },
        allowClear: true,
        placeholder: 'Select',
        id: function (e) { return e.node.id; },
        formatResult: function (dat) {
            return dat.node.name;
        },
        formatSelection: function (item) {
            intelligentManager.findNode(item.node.name);
            return item.node.name;
        },
        change: function (e) {
            console.dir(e);
        }
    });
}

