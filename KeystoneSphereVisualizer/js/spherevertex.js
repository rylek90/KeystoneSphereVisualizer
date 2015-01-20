//Point on the sphere - image + caption + action on doubleclick(TBD)
var SphereVertex = function(material){
	this.object3d = new THREE.Sprite(material);
	//new THREE.Mesh( new THREE.PlaneGeometry( 0.5, 0.5 ), material );
	this.object3d.spherevertex = this;
	this.id = -1;
	this.action = '';
	this.action_url = '';
	this.object3d.position.x = 0;
	this.object3d.position.y = 0;
	this.object3d.position.z = 0;
	this.caption = null;
	this._addCaption = function(caption){
		//console.log(caption);
		var tsprite = makeTextSprite( caption, 
			{ fontsize: 14, 
				borderColor: {r:255, g:0, b:0, a:1.0}, 
				backgroundColor: {r:255, g:100, b:100, a:0.8} 
			} 
		);
		this.caption = tsprite;
		this.object3d.add(tsprite);
	};
	this.update = function(){
		if(this.caption==null) return;
		//console.log(this.object3d.position);
		var vec = new THREE.Vector3(this.object3d.position.x,
									this.object3d.position.y,
									this.object3d.position.z).multiplyScalar(0.001);
		//console.log(vec);
		this.caption.position.x = vec.x;
		this.caption.position.y = vec.y;
		this.caption.position.z = vec.z;
		
		
	};
	this.rearrange = function(){
		this._addCaption(this.caption);
	};
};
