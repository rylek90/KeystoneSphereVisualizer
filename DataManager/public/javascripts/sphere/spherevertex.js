//Point on the sphere - image + caption + action on doubleclick(TBD)
var SphereVertex = function (texture) {
    this.aspect = 1.0;
    this.aspectSet = false;
    var this_pointer = this;
	this.node = null;
	this.width;
	this.height;
	
    var loadAspect = function (ptr, loaded_tex) {
        //console.log('Texture loaded');
        //console.log(lodaded_tex);
        //console.log(ptr);
        //console.log("H: " + loaded_tex.image.height);
        //console.log("W: " + loaded_tex.image.width);
		ptr.width = loaded_tex.image.width;
		ptr.height = loaded_tex.image.height;
        ptr.aspect = loaded_tex.image.width / loaded_tex.image.height;
        ptr.aspectSet = true;
        ptr.original_width = loaded_tex.image.width;
        ptr.original_height = loaded_tex.image.height;
		//console.log(ptr);
		//console.log(ptr.aspect);
    };
    if (texture) {
        //console.log("TEXTURA");
        //console.log(texture);
        tex = THREE.ImageUtils.loadTexture(texture, {}, 
			function (loaded_tex) {
            loadAspect(this_pointer, loaded_tex);
        }
        );
        sprite_mat = new THREE.SpriteMaterial(
            {
                map: tex
			//color: color
            }
        );
        this.object3d = new THREE.Sprite(sprite_mat);
    } else {
        this.object3d = new THREE.Object3D();//THREE.Sprite(sprite_mat);
		//console.log("Object3d instead of sprite:");
		this.object3d.position.x = 1000;
		this.object3d.position.y = 1000;
		this.object3d.position.z = 1000;
    }
    this.object3d.scale.set(1*globalscale, 1*globalscale, 1*globalscale);
            
    //new THREE.Mesh( new THREE.PlaneGeometry( 0.5, 0.5 ), material );
    this.object3d.spherevertex = this;
    //this.object3d.scale.set(0.5, 0.5, 1);
    this.id = -1;
    this.href = '';
    /*this.object3d.position.x = 0;
    this.object3d.position.y = 0;
    this.object3d.position.z = 0;*/
    this.caption = null;
    this._addCaption = function (caption) {
        //console.log(caption);
        var tsprite = makeTextSprite(caption, 
			{
            fontsize: 30
				//borderColor: {r:255, g:0, b:0, a:1.0}
				//backgroundColor: {r:255, g:100, b:100, a:0.8} 
        } 
        );
        //var box = new THREE.Box3().setFromObject(this.object3d);
        this.caption = tsprite;
        this.object3d.add(tsprite);
        this.object3d.updateMatrixWorld();
        tsprite.updateMatrixWorld();
        var vec = new THREE.Vector3(this.object3d.position.x, this.object3d.position.y, this.object3d.position.z);
        //console.log(vec);
        vec.normalize();
        //console.log(vec);
        var vec2 = vec.multiplyScalar(0.001);
        //console.log(vec2);
        
        this.caption.position.x = vec2.x;
        this.caption.position.y = vec2.y;
        this.caption.position.z = vec2.z;
    };
    this.update = function (position) {
        if (this.aspectSet) {
			//this.object3d.scale.set(this.width, this.height, 1);
            this.object3d.scale.set(this.aspect*globalscale/2, 1*globalscale/2, 1*globalscale);
            //this.object3d.scale.set(0.1, 1, 1);
            //console.log("ASPECT SET:");
            //console.log(this.object3d);
            this.aspectSet = false;
        } else {
			
        }
        if (this.caption == null) return;
        //console.log(this.object3d.position);
        
        //for biggest sphere:
        //-3 - > 0 
        //0 -> 0.5
        //3 -> 1
        if (this.object3d && this.object3d.material) {
            var vector = new THREE.Vector3();
            vector.setFromMatrixPosition(this.object3d.matrixWorld);
			var r = position.radius;//*1.5;
			if(position===SPHERE.CENTER){
				opacity = 1;
			}else{
				if(vector.z<0) 
					opacity = 0;
				else
					opacity = ((vector.z)) / (r);
			}
			if(this.caption && this.caption.material)
				this.caption.material.opacity = Math.pow(opacity,4);
            this.object3d.material.opacity = opacity * opacity;
        }
		
    };
    this.rearrange = function () {
		if(this.caption){
			//console.log(this.caption);
			this._addCaption(this.caption);
		}
    };
};


