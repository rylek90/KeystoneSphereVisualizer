var scene;
var camera;
var renderer;
var particleMaterial; 
var initialWidth;
var initialHeight;

var camera_tween = 0;

function initialize() {
	reinitXY();
    scene = new THREE.Scene();
	
	//camera = new THREE.OrthographicCamera( width / - 2, width / 2, height / 2, height / - 2, 0.1, 2000 );
    renderer = new THREE.WebGLRenderer({ alpha: true,  antialias: true } );
    //renderer.shadowMapType = THREE.PCFSoftShadowMap;
	
	$(renderer.domElement).attr('id', 'js-canvas');
	camera = new THREE.PerspectiveCamera(75, initialWidth / initialHeight, 0.1, 20000);
	var width = initialWidth;
	var height = initialHeight;
	//camera = new THREE.OrthographicCamera( -width , width , height, -height, 0.1, 20000 );
    //document.body.appendChild(renderer.domElement);
    
    
    renderer.setSize(initialWidth, initialHeight);
    
	
	/*var canvas = document.createElement('canvas-part');
	var context = canvas.getContext('2d');
		context.beginPath();
		context.arc( 0, 0, 0.5, 0, Math.PI2, true );
        context.fill();
	var texture = new THREE.Texture(canvas);
	*/
	
	particleMaterial = new THREE.MeshBasicMaterial( { color: 0x006666, wireframe: true } );
	/*new THREE.SpriteMaterial( 
		{ map: texture }
	);
	texture.needsUpdate = true;*/
	
    $(document.getElementById("js-canvas")).replaceWith($(renderer.domElement));
    camera.position.z = 150;
}

function reinitXY() {
    $(document.getElementById("js-canvas")).width('100%');
    $(document.getElementById("js-canvas")).height('100%');
    initialWidth = $(document.getElementById("js-canvas")).width();
    initialHeight = $(document.getElementById("js-canvas")).height();	
}

$(document).ready(function () {
    
    reinitSelectors();
});

initialize(); //scene, camera, renderer


var spheres_object3d = new THREE.Object3D();
var spheres_geometries = new THREE.Object3D();

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
	this._sphereMaxChangedEventHandlers = [];
	this.AddSphereMaxChangedEventHandler = function(callback){
		this._sphereMaxChangedEventHandlers.push(callback);
	};
	this.setSphereMax = function(new_max){
		this.sphere_max = new_max;
		$.each(this._sphereMaxChangedEventHandlers, function(i, o){
			if(o!=null){
				o(new_max);
			}
		});
	};
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
	
        var sphere = null;
		if(this.sphere_max==3)
			sphere=spheres[this.sphere_max-1];
		else
			sphere=spheres[this.sphere_max];
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
			//console.log(type);
			if((type==='entity' || type==='country' || type==='workgroup' || type==='expertise')){
				console.log("GO TO PEOPLE TEST - special case");
				if(this.sphere_max == 3){
					//this.commands.push(new Command('handle_sphere_click_special_case_1', obj.node, obj));
					console.log("People attrib click ");
					
				}else if(this.sphere_max == 2){
					this.commands.push(new Command('handle_sphere_click_special_case', obj.node, obj));
					console.log("Attrib click - show ppl");
					this.setSphereMax(1);
					
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
				this.setSphereMax(this.sphere_max+1);//sphere_max++;
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
					var tex = 'img/placeholder_node.png';
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
						var tex = 'img/placeholder_node.png';
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
				this.setSphereMax(this.sphere_max-2);//this.sphere_max-=2;
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
				this.setSphereMax(this.sphere_max-3);
				//this.sphere_max-=3;
				this.handle(sphere, obj);
			}
		}
		reinitSelectors();
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
			this.setSphereMax(parent_sphere);//this.sphere_max = parent_sphere;
			
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
			
			this.setSphereMax(this.sphere_max);
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
		reinitSelectors();
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
var t = new THREE.Object3D();
t.add(spheres_object3d);
t.add(spheres_geometries);
//scene.add(spheres_object3d);
scene.add(t);
//
//t.scale.set(1,1,1.5);
//t.scale.set(1,1,1.5);
var render = function () {
    requestAnimationFrame(render);
    renderer.render(scene, camera);
};
render();

var intelligentManager = new IntelligentManager(spheres_object3d);

intelligentManager.AddSphereMaxChangedEventHandler(function(max){
	camera_tween = max;
});

$.each(spheres, function(i,o){
	o.setManager(intelligentManager);
});

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
document.getElementById("js-canvas").addEventListener('resize', onWindowResize, false);

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
//    event.preventDefault();
    console.log('right click');
	//intelligentManager.handleRightClick();
};

function onDocumentScroll(evt) {
    evt.preventDefault();
    evt.stopPropagation();
    if (evt.wheelDeltaY > 0 && camera.position.z >= 3) {
        camera.position.z -= 0.1*(globalscale);
    } else if (evt.wheelDeltaY < 0 && camera.position.z <= 20000) {
        camera.position.z += 0.1*globalscale;
    }
	console.log("Scroll z: " + camera.position.z);
}

function onDocumentDblClick(event) {
    event.preventDefault();
    console.log("Double click event!");
    //clicked? center the vert
	var raycaster = new THREE.Raycaster();
    var vector = new THREE.Vector3();
    vector.set((event.clientX / initialWidth) * 2 - 1, -(event.clientY / initialHeight) * 2 + 1, 0.0);
    vector.unproject(camera);
    raycaster.ray.set(camera.position, vector.sub(camera.position).normalize());
    var PI2 = Math.PI * 2;
    
   
    //sphere objs
    var all_objs = [];
    var objects = {};
	var len = Object.size(spheres)-1;
    for (var it = len; it >= 0; it--) {
        //console.log('Getting  objs');
        //console.log(spheres);
        objects[it] = spheres[it].getObjects3d();
        all_objs = all_objs.concat(objects[it]);
    }
    //console.log(objects);
	spheres_object3d.updateMatrixWorld();
	//drawRayLine( raycaster );
    var intersects = raycaster.intersectObjects(all_objs);
	/*intersects.sort(function(a,b){
		var vectora = new THREE.Vector3();
        vectora.setFromMatrixPosition(a.object.matrixWorld);
		var vectorb = new THREE.Vector3();
        vectorb.setFromMatrixPosition(b.object.matrixWorld);
		
		if(vectora.z < vectora.z) return -1;
		if(vectorb.z > vectorb.z) return 1;
		return 0;
	});*/
    if (intersects.length > 0) {
        //console.log("Intersection click!");
        //intersects[ 0 ].object.material.color.setHex( Math.random() * 0xffffff );
        //WHAT DO
		for(var i=0; i<intersects.length; i++){
			var io = intersects[i].object;
			var len = Object.size(spheres)-1;
			for (var it = len; it >= 0; it--) {
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
	var raycaster = new THREE.Raycaster();
    //clicked? center the vert
    var vector = new THREE.Vector3();
    vector.set((event.clientX / initialWidth) * 2 - 1, -(event.clientY / initialHeight) * 2 + 1, 1);
    vector.unproject(camera);
    raycaster.ray.set(camera.position, vector.sub(camera.position).normalize());
	raycaster.ray.linePrecision = 0.0000001;
    raycaster.ray.precision = 0.0000001;
	
    //drawRayLine( raycaster );
	
	
	var PI2 = Math.PI * 2;
    
    /*var particleMaterial = new THREE.MeshBasicMaterial(
        { color: 0xFFFFFF, side: THREE.DoubleSide }
    );*/
    //sphere obj?
    var all_objs = [];
    var objects = {};
    var len = Object.size(spheres)-1;
	console.log('len');
	console.log(len);
    for (var it = len; it >= 0; it--) {
        //console.log('Getting  objs');
        //console.log(spheres);
        objects[it] = spheres[it].getObjects3d();
        all_objs = all_objs.concat(objects[it]);
    }
    //console.log(objects);
	
	spheres_object3d.updateMatrixWorld();
    var intersects = raycaster.intersectObjects(all_objs);
	var num = 1;
	
    for (var i = 0; i < intersects.length; i++) {
        console.log(intersects[i].object.spherevertex.node['name']);
        console.log(intersects[i]);
        
    }

	intersects_filtered = [];
	$.each(intersects, function(i, inter){
		if(inter.object.spherevertex.object3d.visible){
			intersects_filtered.push(inter);
		}
	});
    intersects = intersects_filtered;
	/*
	intersects = intersects.sort(function(a,b){
		var vectora = new THREE.Vector3();
        vectora.setFromMatrixPosition(a.object.matrixWorld);
		var vectorb = new THREE.Vector3();
        vectorb.setFromMatrixPosition(b.object.matrixWorld);
        // if object a is farther screen
	   if (raycaster.ray.origin.distanceTo(a) < raycaster.ray.origin.distanceTo(b))
           return 1;
        //if(vectora.z > vectorb.z) return -1
		return -1;
		
		//if(a.z < b.z) return 1;
		//else return -1;
    });
	*/
    /*for (var i = 0; i < intersects.length; i++) {
        console.log(intersects[i].object.spherevertex.node['name']);
        console.log(intersects[i]);
    }*/
	console.log("Intersection loop");
    if (intersects.length > 0) {
        //console.log("Intersection click!");
        
        //intersects[ 0 ].object.material.color.setHex( Math.random() * 0xffffff );
        //WHAT DO
		for(var i=0; i<intersects.length; i++){
			/*console.log(intersects[i]);
			var pos = intersects[i].point;
			var o = new THREE.Object3D();
			var mat = new THREE.MeshBasicMaterial( { color: 0x660000, wireframe: true } );
			var mesh = new THREE.Mesh( new THREE.SphereGeometry( 50, 16, 16), mat );
			o.add(mesh);
			spheres_object3d.add( o );
			o.position.x = pos.x;
			o.position.y = pos.y;
			o.position.z = pos.z;*/
			
			var io = intersects[i].object;
			var len = Object.size(spheres)-1;
			for (var it = len; it >= 0; it--) {
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
      /* $.each(spheres, function(i,sphere){
			var objs = sphere.objects;
			$.each(objs, function(j, obj){
				rotateAroundWorldAxis(obj, yAxis, -0.3 * deltaX * mpi);
				rotateAroundWorldAxis(obj, xAxis, -0.3 * deltaY * mpi);
			});
		});*/
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

var last_surf = 0;
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
	
	//camera update
	var camera_goto;
	var movement_speed = 0.4;
	var delta = ONE_FRAME_TIME;
	if(camera_tween!=-1){
		switch(camera_tween){
			case 0:
			 camera_goto = 150;
			break;
			case 1:
			 movement_speed*=2;
			 camera_goto = 330;
			break;
			case 2:
			 camera_goto = 380;
			break;
			case 3:
			default:
			 camera_goto = 480;
			break;
		}
		var pos = camera.position.z;
		var diff = camera.position.z - camera_goto;
		var diffs = Math.sign(diff);
		var mov = diffs*movement_speed*delta;
		if(Math.abs(mov) > Math.abs(diff)){
			mov -= diff;
			camera_tween = -1;
		}
		camera.position.z -= mov;
	}
};
setInterval(mainloop, ONE_FRAME_TIME);

//INITIAL DATA LOAD
//data_manager.loadObjects('graphKASK.xml');
data_manager.loadObjects('keystone.xml');
//clike between evrythng

function reinitSelectors() {
	var results_obj = null;
	/*if(intelligentManager.sphere_max==3){
		results_obj = spheres[intelligentManager.sphere_max-1].objects;
	}else{*/
		results_obj = spheres[intelligentManager.sphere_max].objects;
	var final_res = [];
	
	$.each(results_obj, function(i, res){
		if(res.object3d.visible === true){
			final_res.push(res);
		}
	});
	//}
    $(".js-data-array").select2({
        data: function () {
            return {
                results: final_res, text: function (dat) {
                    return dat.node.name;
                }
            };
        },
       // allowClear: true,
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

(function ($, window) {

    $.fn.contextMenu = function (settings) {

        return this.each(function () {

            // Open context menu
            $(this).on("contextmenu", function (e) {
                //open menu
                $(settings.menuSelector)
                    .data("invokedOn", $(e.target))
                    .show()
                    .css({
                        position: "absolute",
                        left: getLeftLocation(e),
                        top: getTopLocation(e)
                    })
                    .off('click')
                    .on('click', function (e) {
                        $(this).hide();
                
                        var $invokedOn = $(this).data("invokedOn");
                        var $selectedMenu = $(e.target);
                        var $rayOn = findFirstIntersection(e);
                        settings.menuSelected.call(this, $invokedOn, $selectedMenu, $rayOn);
                });
                
                return false;
            });

            //make sure menu closes on any click
            $(document).click(function () {
                $(settings.menuSelector).hide();
            });
        });

        function getLeftLocation(e) {
            var mouseWidth = e.pageX;
            var pageWidth = $(window).width();
            var menuWidth = $(settings.menuSelector).width();
            
            // opening menu would pass the side of the page
            if (mouseWidth + menuWidth > pageWidth &&
                menuWidth < mouseWidth) {
                return mouseWidth - menuWidth;
            } 
            return mouseWidth;
        }        
        
        function getTopLocation(e) {
            var mouseHeight = e.pageY;
            var pageHeight = $(window).height();
            var menuHeight = $(settings.menuSelector).height();

            // opening menu would pass the bottom of the page
            if (mouseHeight + menuHeight > pageHeight &&
                menuHeight < mouseHeight) {
                return mouseHeight - menuHeight;
            } 
            return mouseHeight;
        }

    };
})(jQuery, window);

$("#js-canvas").contextMenu({
    menuSelector: "#contextMenu",
    menuSelected: function (invokedOn, selectedMenu, intersect) {
        var msg = "You selected the menu item '" + selectedMenu.text() +
            "' on the value '" + invokedOn.text() + "'";
		if(intersect){
			msg += "\n intersection with:" + JSON.stringify(intersect, null, 2);
		}
        alert(msg);
    }
});
