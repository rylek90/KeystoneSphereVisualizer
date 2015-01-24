/*
    Sphere positions
            *		)		)		)
            ^center ^inner	^outer	^surface
*/
var SPHERE = {
    CENTER: { name: "center", value: 0, radius: 0, objects: 1, sphere: 0 },
    INNER: { name: "inner", value: 1, radius: 1.8 * 2, objects: 6, sphere: 0 },
    OUTER: { name: "outer", value: 2, radius: 2.4 * 2, objects: 10, sphere: 0 },
    SURFACE: { name: "surface", value: 3, radius: 3 * 2, objects: 30, sphere: 0 }
};

var Sphere = function (position) {
    //constructor
    this.object3d = new THREE.Object3D();
    this.position = position;
    this.objects = [];
    this.nr_of_objects = 0;
    this.animation = ANIMATION.NONE;
    this.center_obj = null;
    this.getInfo = function () {
        return "Sphere pos: " + this.position.name;
    };
    
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
        } else if (this.animation == ANIMATION.NONE) {
            this.animation = animation;
            if (animation == ANIMATION.CENTER) {
                
                /*if (this.center_obj !== null && this.center_obj.id === animationObj.id) {
                    showAllObjects();
                }*/
                
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
		var obj = obj.object3d;
		if (this.center_obj == null) {
            return false;
		}
		if(this.center_obj != obj){
			return false;
		}
		var vector = new THREE.Vector3();
        var io = this.center_obj;
		vector.setFromMatrixPosition(io.matrixWorld);
                
		var absx = Math.abs(vector.x);
        var absy = Math.abs(vector.y);
        if (absx <= 0.05 && absy <= 0.05) {
			return true;
		}
		return false;
	};
    
    
    this.update = function (deltaTime, spheres_object3d) {
        var anim_speed = 0.002;
        
        $.each(this.objects, function (i, obj) {
            obj.update();
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
				var diff = r * r - rkw;
				var sign = Math.sign(diff);
				console.log(sign);
				if(sign<0){
					console.log(diff);
					console.log(sign);
				}
                if (Math.abs(diff) > 0.01) {
                    $.each(this.objects, function (i, o) {
                        obj3d = o.object3d;
                        var normvec = new THREE.Vector3(obj3d.position.x, obj3d.position.y, obj3d.position.z).normalize();
                        normvec.multiplyScalar(deltaTime * anim_speed);
                        obj3d.position.x += normvec.x*sign;
                        obj3d.position.y += normvec.y*sign;
                        obj3d.position.z += normvec.z*sign;
                        o.update();
                    });
                //animate!
                } else {
                    console.log("ANIMATION.GROWING finished");
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
                        o.update();
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
                
                
                spheres_object3d.rotation.y %= 2 * Math.PI;
                spheres_object3d.rotation.x %= 2 * Math.PI;
				spheres_object3d.rotation.z %= 2 * Math.PI;
                spheres_object3d.updateMatrixWorld();
                var vector = new THREE.Vector3();
                var io = this.center_obj;
                vector.setFromMatrixPosition(io.matrixWorld);
                
                var absx = Math.abs(vector.x);
                var absy = Math.abs(vector.y);
                if (absx > 0.005) {
                    var sign = vector.x > 0 ? -1 : 1;
                    spheres_object3d.updateMatrixWorld();
                    vector = new THREE.Vector3();
                    vector.setFromMatrixPosition(io.matrixWorld);
                    var step = anim_speed * deltaTime * absx;
                    spheres_object3d.rotation.y += step * sign;
                    still = true;
                } else if (absy > 0.005) {
                    var sign = vector.y > 0 ? 1 : -1;
                    spheres_object3d.updateMatrixWorld();
                    vector = new THREE.Vector3();
                    vector.setFromMatrixPosition(io.matrixWorld);
                    var step = anim_speed * deltaTime * absy;
                    spheres_object3d.rotation.x += step * sign;
                    still = true;
                } else {
                    this.animation = ANIMATION.NONE;
                }
                
                break;
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
    }
    
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
		
		if(params){
			if(params['grouped']){
				N = 10;
			}
		}
		
        for (var i = 0; i < this.nr_of_objects; i++) {
            //var point = this.calculateSpiralCoordinates(i, 0.005);
            var point = this.sphereCalculate(N, i);
            var working_obj = this.objects[i];
            var obj3d = working_obj.object3d;
            
            obj3d.position.x = point.x;
            obj3d.position.y = point.y;
            obj3d.position.z = point.z;
            obj3d.updateMatrixWorld();
            working_obj.rearrange();
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
    
    this.clear = function () {
        //zonk NAT £ERKING
        var parent = this;
        $.each(this.objects, function (i, o) {
            //console.log("Removing:");
            //console.log(o.object3d);
            
            this.object3d.removeChild(o.object3d);
        });
        this.nr_of_objects = 0;
        this.objects = [];
    };
};