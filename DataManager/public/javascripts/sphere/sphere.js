/*
    Sphere positions
            *		)		)		)
            ^center ^inner	^outer	^surface
*/

var _inner =  1.4 * 1 * globalscale;
var _outer = 2.3 * 1 * globalscale;
var _surface = 3.5 * 1 * globalscale;
var SPHERE = {
    CENTER: { name: "center", value: 0, initialradius: 0, radius: 0, objects: 1, sphere: 0 },
    INNER: { name: "inner", value: 1, initialradius: _inner , radius: _inner , objects: 6, sphere: 0 },
    OUTER: { name: "outer", value: 2, initialradius: _outer, radius: _outer, objects: 10, sphere: 0 },
    SURFACE: { name: "surface", value: 3, initialradius: _surface, radius: _surface, objects: 30, sphere: 0 }
};

var Sphere = function (position) {
    //constructor
	this.object3d = new THREE.Object3D();
    this.position = position;
    this.objects = [];
    this.nr_of_objects = 0;
    this.animation = ANIMATION.NONE;
    this.center_obj = null;
	var sc = position.value;
	var mat;
	this.mesh;
	if(sc>1){
		//var ob = new THREE.Object3D();
		mat = new THREE.MeshNormalMaterial( { color: 0xFFFFFF, wireframe: true, opacity: 0.1, depthTest: true, shading: THREE.SmoothShading} );
		//wireframe: true 
		//mat = new THREE.MeshNormalMaterial( { color: 0x000060*sc, opacity: 0.1 } );
		mat.opacity = 0;
		var densh = 8*sc;
		var densw = 8*sc;
		//this.mesh = new THREE.Mesh( new THREE.SphereGeometry( position.radius, densw, densh ), mat );
		//this.mesh.overdraw = true;
		//scene.add(ob);
		//ob.scale.set(1,1,2.5);
		//this.object3d.add( this.mesh );
		//this.mesh = new THREE.Mesh(
			//	new THREE.CircleGeometry( position.radius, densh ), 
		//		mat 
			//);
		
		var color = 0x003300;
		if(sc>2) 
			color= 0x333333;
		var material = new THREE.LineBasicMaterial({ opacity:0.3, color: color });
		var lines = new THREE.Object3D();
		var segmentCount = 64;
		var radius = position.radius;
		var segmentHCount = 3;
		var xAxis = new THREE.Vector3(1, 0, 0);
        var yAxis = new THREE.Vector3(0, 1, 0);
		for(var j=-segmentHCount*3; j<segmentHCount*2; j++){
			var geometry = new THREE.Geometry();
			var h = radius - (Math.cos(j/segmentHCount)*radius);
			var newr = Math.sqrt((2*radius-h)*h);
			for (var i = 0; i <= segmentCount; i++) {
				var theta = (i / segmentCount) * Math.PI * 2;
				
				geometry.vertices.push(
					new THREE.Vector3(
						Math.cos(theta) * newr,
						Math.sin(theta) * newr,
						Math.cos(j/segmentHCount)*radius
					)
				);            
			}
			var line = new THREE.Line(geometry, material); 
			lines.add(line);
		}
		
		segmentHCount = 4;
		for(var j=0; j<segmentHCount; j++){
			var geometry = new THREE.Geometry();
			for (var i = 0; i <= segmentCount; i++) {
				var theta = (i / segmentCount) * Math.PI * 2;
				geometry.vertices.push(
					new THREE.Vector3(
						Math.cos(theta)* radius,
						Math.sin(theta) * radius,
						0
					)
				);            
			}
			var line = new THREE.Line(geometry, material); 
			//line.scale.set(1,1,2.5);
			rotateAroundWorldAxis(line, yAxis, (j/segmentHCount)*Math.PI + Math.PI/8);
			rotateAroundWorldAxis(line, xAxis, Math.PI/2);
			lines.add(line);
		}
		
		/*if(position.value%2){
			rotateAroundWorldAxis(lines, yAxis, Math.PI/4);
			rotateAroundWorldAxis(lines, xAxis, Math.PI/4);
		}*/
		
		rotateAroundWorldAxis(lines, xAxis, Math.PI/2);
		
		//lines.position.z = radius*0.5;
		//lines.scale.set(1,2.5,1);
		scene.add(lines);
		
		//spheres_object3d.add(lines);
		//spheres_object3d.add(this.mesh);
		//scene.add(lines);
		//spheres_geometries.add(lines);
		
	}
	
	this.setManager = function(manager){
		if(!this.mesh) return;
		var pos = this.position;
		console.log(this.mesh);
		var mat = this.mesh.material;
		manager.AddSphereMaxChangedEventHandler(function(max){
			console.log("Visible sphere!");
			
			if(max>=pos){
				//mat.opacity=0.1;
			}else{
				//mat.opacity = 0;
			}
		});
	};
    this.getInfo = function () {
        return "Sphere pos: " + this.position.name;
    };
    this.stackedCenter = null;
    this.setAnimation = function (animation, animationObj, force) {
        //console.log(this.center_obj);
        
        if (force && animation === ANIMATION.NONE) {
            this.animation = animation;
            return;
        }
        
        if (this.animation == ANIMATION.GROWING) return;
        else if (this.animation == ANIMATION.HIDING) return;
        else if (this.animation == ANIMATION.CENTER && force === true) return;
        else if (this.animation == ANIMATION.CENTER && animation == ANIMATION.CENTER) {
            //this.animation = ANIMATION.CENTER;
            this.center_obj = animationObj;
			spheres_object3d.rotation.x %= 2 * Math.PI;
                spheres_object3d.rotation.y %= 2 * Math.PI;
				spheres_object3d.rotation.z %= 2 * Math.PI;
                spheres_object3d.updateMatrixWorld();
                var vector = new THREE.Vector3();
                vector.setFromMatrixPosition(animationObj.matrixWorld);
                //console.log("START ROTATING");
				//console.log(spheres_object3d.rotation);
				//console.log(vector);
        } else if (this.animation == ANIMATION.NONE) {
            this.animation = animation;
            if (animation == ANIMATION.CENTER) {
                
                /*if (this.center_obj !== null && this.center_obj.id === animationObj.id) {
                    showAllObjects();
                }*/
                spheres_object3d.rotation.x %= 2 * Math.PI;
                spheres_object3d.rotation.y %= 2 * Math.PI;
				spheres_object3d.rotation.z %= 2 * Math.PI;
                spheres_object3d.updateMatrixWorld();
                var vector = new THREE.Vector3();
                vector.setFromMatrixPosition(animationObj.matrixWorld);
                //console.log("START ROTATING");
				//console.log(spheres_object3d.rotation);
				//console.log(vector);
                this.center_obj = animationObj;
            }
        } else {
            throw "Another animation in progress: " + this.animation + " animation not set: " + animation;
        }
    };
    this.getObjects3d = function () {
        //console.log('Copying objs to array');
        var obj3ds = [];
        for (var i = 0; i < this.nr_of_objects; i++) {
            //console.log('copying obj: ' + i);
            obj3ds.push(this.objects[i].object3d);
        }
        return obj3ds;
    };
    
	this.isCenteredOn = function(obj){
		console.log("IS CENTERED ON?");
		spheres_object3d.updateMatrixWorld();
		var obj = obj.object3d;
		//console.log(this.position);
		if(this.position == SPHERE.CENTER) {
			return true;
		}
		if (this.center_obj == null) {
            return false;
		}
		
		if (this.center_obj != obj) {
            return false;
		}
		
		var vector = new THREE.Vector3();
        var io = this.center_obj;
		vector.setFromMatrixPosition(io.matrixWorld);
                
		var absx = Math.abs(vector.x);
        var absy = Math.abs(vector.y);
		//console.log("absx: " + absx + " absy: " + absy);
        if (absx <= 0.05*globalscale && absy <= 0.05*globalscale) {
			return true;
		}
		return false;
	};
    
    
    this.update = function (deltaTime, spheres_object3d) {
        var anim_speed = 0.004;
        var position = this.position;
        $.each(this.objects, function (i, obj) {
            obj.update(position);
        }
        );
        
        switch (this.animation) {
            case ANIMATION.NONE:
                break;
            case ANIMATION.GROWING:
                if (this.objects.length < 1) return;
                //grow as long as objs are closer than r
                //r depends on position
                var r = this.position.radius;
                //check r for any obj on sphere
                var obj3d = this.objects[0].object3d;
                //console.log(obj3d.position);
                var rkw = obj3d.position.x * obj3d.position.x +
                obj3d.position.y * obj3d.position.y +
                obj3d.position.z * obj3d.position.z;
                //console.log("rkw: " + rkw + " r: " + r);
				var diff = r - Math.sqrt(rkw);
				var sign = Math.sign(diff);
				
				//console.log(sign);
				if(sign<0){
					//console.log(diff);
					//console.log(sign);
				}
                if (Math.abs(diff) > 0.01*globalscale) {
					//console.log("diff: " + diff);
                    $.each(this.objects, function (i, o) {
                        obj3d = o.object3d;
                        var normvec = new THREE.Vector3(obj3d.position.x, obj3d.position.y, obj3d.position.z).normalize();
						var mul = deltaTime * anim_speed * diff;
                        normvec.multiplyScalar(mul);
						if(normvec.length() > Math.abs(diff)){
							normvec.multiplyScalar( Math.abs(diff) / normvec.length() );
						}
					if(false) {
						console.log("norm: ");
						console.log(normvec);
						console.log("pos:");
						console.log(obj3d.position);
					}
                        obj3d.position.x += normvec.x;
                        obj3d.position.y += normvec.y;
                        obj3d.position.z += normvec.z;
                        o.update(position);
                    });
                //animate!
                } else {
                    //console.log("ANIMATION.GROWING finished");
                    this.animation = ANIMATION.NONE;
                }
                break;
            case ANIMATION.HIDING:
                if (this.objects.length == 0) {
                    this.animation = ANIMATION.NONE;
                    this.clear();
                    return;
                }
                var obj3d = this.objects[0].object3d;
                var rkw = obj3d.position.x * obj3d.position.x +
                obj3d.position.y * obj3d.position.y +
                obj3d.position.z * obj3d.position.z;
                if (rkw > 0.01) {
                    $.each(this.objects, function (i, o) {
                        obj3d = o.object3d;
                        var normvec = new THREE.Vector3(obj3d.position.x, obj3d.position.y, obj3d.position.z).normalize();
                        normvec.multiplyScalar(deltaTime * anim_speed);
                        obj3d.position.x -= normvec.x;
                        obj3d.position.y -= normvec.y;
                        obj3d.position.z -= normvec.z;
                        o.update(position);
                    });
                } else {
                    this.animation = ANIMATION.NONE;
                    console.log("ANIMATION.HIDING finished");
                    this.clear();
                }
                break;
            case ANIMATION.CENTER:
				
                if (this.center_obj == null) {
                    return; //let's do it only once.
                }
                
                spheres_object3d.rotation.x %= 2 * Math.PI;
                spheres_object3d.rotation.y %= 2 * Math.PI;
				spheres_object3d.rotation.z %= 2 * Math.PI;
                spheres_object3d.updateMatrixWorld();
                var vector = new THREE.Vector3();
                var io = this.center_obj;
                vector.setFromMatrixPosition(io.matrixWorld);
               // console.log("START ROTATING");
				//console.log(spheres_object3d.rotation);
				//console.log(vector);
				
                var absx = Math.abs(vector.x);
                var absy = Math.abs(vector.y);
                var stepMultiplier = 1.2;
				
				/*var absz = camera.position.z - this.position.initialradius;
				console.log("ABSZ: " + absz);
				if(camera.position.z < this.position.initialradius){
					camera.position.z = camera.position.z - Math.sign(absz)*0.1; 
				}*/
				 //rotation
				var xAxis = new THREE.Vector3(1, 0, 0);
				var yAxis = new THREE.Vector3(0, 1, 0);
				//rotateAroundWorldAxis(spheres_object3d, yAxis, -0.3 * deltaX * mpi);
				//rotateAroundWorldAxis(spheres_object3d, xAxis, -0.3 * deltaY * mpi);
				
				if (absx > 0.005*globalscale) {
                    var sign = vector.x > 0 ? -1 : 1;
                    spheres_object3d.updateMatrixWorld();
                    vector = new THREE.Vector3();
                    vector.setFromMatrixPosition(io.matrixWorld);
                    if (absx > 1) {
                        stepMultiplier = 1.3;
                    }
                    var step = stepMultiplier * anim_speed * deltaTime * absx/globalscale;
                    //console.log(step);
					rotateAroundWorldAxis(spheres_object3d, yAxis, step * sign);
                    
					//console.log("absx: " + step*sign);
                } else if (absy > 0.005*globalscale) {
                    var sign = vector.y > 0 ? 1 : -1;
                    spheres_object3d.updateMatrixWorld();
                    vector = new THREE.Vector3();
                    vector.setFromMatrixPosition(io.matrixWorld);
                    
                    if (absy > 1) {
                        stepMultiplier = 1.3;
                    }

                    var step = anim_speed * deltaTime * absy/globalscale * stepMultiplier;
                    //spheres_object3d.rotation.x += step * sign;
					rotateAroundWorldAxis(spheres_object3d, xAxis, step * sign);
                    still = true;
					//console.log("absy: " + step*sign);
                } 
				else {
                    this.animation = ANIMATION.NONE;
                }
                
                break;
        }
		if(this.animation==ANIMATION.NONE){
			if(this.stackedCenter != null){
				this.setAnimation(ANIMATION.CENTER, this.stackedCenter);
				this.stackedCenter = null;
			}
		}
    };
    
    this.sphereCalculate = function (N, k) {
        var inc = Math.PI * (3 - Math.sqrt(5));
        var off = 2 / N;
        var y = k * off - 1 + (off / 2);
        var r = Math.sqrt(1 - y * y);
        var phi = k * inc;
        
        var aX = Math.cos(phi) * r;
        var aY = y;
        var aZ = Math.sin(phi) * r;
        
        return { "x": aX, "y": aY, "z": aZ };
    };
	
    this.rearrangeObjects = function (params) {
        var radius = this.position.radius;
        var yrotate = true;
        /*
            ____
          /      \     
         /        \
        |	       |
        |          |
        |          |
         \        /
          \______/
          
        */
        if (this.nr_of_objects == 1) {
            var working_obj = this.objects[0];
            var obj3d = working_obj.object3d;
            obj3d.position.x = 0;
            obj3d.position.y = 0;
            obj3d.position.z = 0;
            obj3d.rotation.x = 0;
            obj3d.rotation.y = 0;
            obj3d.rotation.z = 0;
        }
        
        var mpi = Math.PI / 180;
        var N = this.nr_of_objects;
		if(N<15*(this.position.value+1)) N = 15*(this.position.value+1);
		
		var positions = [];
		for(var i=0; i<N;i++){
			positions.push(this.sphereCalculate(N,i));
		}
		
		if(params){
			/*if(params['grouped']){
				N = 10;
			}*/
			if(params['close_to']){
				if(params['show_them_close_to']){
					//specify which elems should be closer (moved from outer sphere?)
					var they_should_be_close = params['show_them_close_to'];
					this.objects.sort(function(a,b){
						//is on list? then it's smaller
						if(they_should_be_close.contains(a)){
							return -1;
						}
						return 1;
						});
				}
				var centerobj = params['close_to'];
				positions.sort(function(a,b){
					/*console.log("sort");
					console.log(centerobj.object3d.position);
					console.log(a);
					console.log(b);*/
					var distance_ac = distance3d_sqr(centerobj.object3d.position, a);
					var distance_bc = distance3d_sqr(centerobj.object3d.position, b);
					//console.log(distance_ac);
					//console.log(distance_bc);
					if(distance_ac > distance_bc){
						return -1;
					}
					if(distance_ac < distance_bc) {
						return 1;
					}
					return 0;
				});
			}
		}
		
        for (var i = 0; i < this.nr_of_objects; i++) {
            //var point = this.calculateSpiralCoordinates(i, 0.005);
            var point = positions[i];
			if(params && params['alreadyGrown']){
				point.normalize();
				point = point.multiplyScalar(this.position.radius);
			}
            var working_obj = this.objects[i];
            var obj3d = working_obj.object3d;
            
            obj3d.position.x = point.x;
            obj3d.position.y = point.y;
            obj3d.position.z = point.z;
            obj3d.updateMatrixWorld();
			working_obj.rearrange();
        }
		if(params && params['show_them_close_to']){
			//grow extra fast
			this.setAnimation(ANIMATION.GROWING);
		}
    };
    
    this.addObject = function (object) {
        //console.log("Adding obj to " + this.position.name);
        this.objects[this.nr_of_objects] = object;
        this.nr_of_objects++;
        this.object3d.add(object.object3d);
        return object;
    };
    
    this.addObjects = function (objects) {
        //for every object, add and finally rearrange
        $.each(objects, function (i, o) {
            this.objects[this.nr_of_objects] = o;
            this.nr_of_objects++;
            this.object3d.add(o.object3d);
        });
        this.rearrangeObjects();
    };
    
    this.clear = function (no_delete) {
        console.log("clear()");
        var parent = this;
		var nr_of_left = 0;
		var new_array = [];
        $.each(this.objects, function (i, o) {
            //console.log("Removing:");
            //console.log(o.object3d);
			var delete_obj = true;
			if(no_delete){
				$.each(no_delete, function(i, nd){
					if(nd==o){ 
						delete_obj = false;
					}
				});
			}
			if(delete_obj){
				this.object3d.removeChild(o.object3d);
			}else {
				nr_of_left++;
				new_array.push(o);
			}
        });
        this.nr_of_objects = nr_of_left;
        this.objects = new_array;
    };
};