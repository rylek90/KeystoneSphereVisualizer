//Point on the sphere - image + caption + action on doubleclick(TBD)
var SphereVertex = function (texture) {
    this.aspect = 1.0;
    this.aspectSet = false;
    var this_pointer = this;
    var loadAspect = function (ptr, loaded_tex) {
        //console.log('Texture loaded');
        //console.log(lodaded_tex);
        //console.log(ptr);
        //console.log("H: " + loaded_tex.image.height);
        //console.log("W: " + loaded_tex.image.width);
        
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
    }
    
    //new THREE.Mesh( new THREE.PlaneGeometry( 0.5, 0.5 ), material );
    this.object3d.spherevertex = this;
    //this.object3d.scale.set(0.5, 0.5, 1);
    this.id = -1;
    this.expertises = [];
    this.action = '';
    this.action_url = '';
    this.object3d.position.x = 0;
    this.object3d.position.y = 0;
    this.object3d.position.z = 0;
    this.caption = null;
    this._addCaption = function (caption) {
        //console.log(caption);
        var tsprite = makeTextSprite(caption, 
			{
            fontsize: 20

				//borderColor: {r:255, g:0, b:0, a:1.0}
				//backgroundColor: {r:255, g:100, b:100, a:0.8} 
        } 
        );
        //var box = new THREE.Box3().setFromObject(this.object3d);
        tsprite.scale.set(1, 1, 1);
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
    this.update = function () {
        if (this.aspectSet) {
            this.object3d.scale.set(this.aspect, 1, 1);
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
            opacity = (vector.z + 3) / 6;
            this.object3d.material.opacity = opacity * opacity;
        }
		
    };
    this.rearrange = function () {
        this._addCaption(this.caption);
    };
};


