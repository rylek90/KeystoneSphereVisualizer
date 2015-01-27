var TexturePooler = function(){
	this.textures = {};
	this.getTexture = function(texture, afterLoad, params){
		if(!this.textures.hasOwnProperty(texture)){
			this.textures[texture] = THREE.ImageUtils.loadTexture(texture, {}, 
				function(tex) { 
					if(afterLoad)
						afterLoad(tex, params);
				}
			);
		}
		return this.textures[texture];
	};
};