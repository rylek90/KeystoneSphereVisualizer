var globalscale = 100;

var ANIMATION = {
    NONE : 0,
    GROWING : 1,
    HIDING : 2,
    CENTER: 3
};

function buildAxis(src, dst, colorHex, dashed) {
    var geom = new THREE.Geometry(),
        mat;
    
    if (dashed) {
        mat = new THREE.LineDashedMaterial({ linewidth: 3, color: colorHex, dashSize: 3, gapSize: 3 });
    } else {
        mat = new THREE.LineBasicMaterial({ linewidth: 3, color: colorHex });
    }
    
    geom.vertices.push(src.clone());
    geom.vertices.push(dst.clone());
    geom.computeLineDistances(); // This one is SUPER important, otherwise dashed lines will appear as simple plain lines
    
    var axis = new THREE.Line(geom, mat, THREE.LinePieces);
    
    return axis;

};

function distance3d_sqr(vector1, vector2){
		/*console.log(vector1);
		console.log(vector2);*/
		var x = (vector1['x']*vector2['x']);
		var y = (vector1['y']*vector2['y']);
		var z = (vector1['z']*vector2['z']);
		var distance = x+y+z;
		return distance;
};

function buildAxes(length) {
    var axes = new THREE.Object3D();
    
    axes.add(buildAxis(new THREE.Vector3(0, 0, 0), new THREE.Vector3(length, 0, 0), 0xFF0000, false)); // +X
    axes.add(buildAxis(new THREE.Vector3(0, 0, 0), new THREE.Vector3(-length, 0, 0), 0xFF0000, true)); // -X
    axes.add(buildAxis(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, length, 0), 0x00FF00, false)); // +Y
    axes.add(buildAxis(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, -length, 0), 0x00FF00, true)); // -Y
    axes.add(buildAxis(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, length), 0x0000FF, false)); // +Z
    axes.add(buildAxis(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, -length), 0x0000FF, true)); // -Z
    
    return axes;
};

// TODO KAKALAK
function showAllObjects() {
    $.each(spheres, function (i, sphere) {
        $.each(sphere.objects, function (i, child) {
            child.object3d.visible = true;
        });
    });
};

function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
};

function wrapText(context, text, x, y, maxWidth, lineHeight) {
	try{
	if(text === undefined || text == null) return;
	var words = text.split(' ');
	var line = '';
	var lines_count = 0;
	for(var n = 0; n < words.length; n++) {
	  var testLine = line + words[n] + ' ';
	  var metrics = context.measureText(testLine);
	  var testWidth = metrics.width;
	  if (testWidth > maxWidth && n > 0) {
		context.fillText(line, x, y);
		lines_count++;
		line = words[n] + ' ';
		y += lineHeight;
	  }
	  else {
		line = testLine;
	  }
	}
	context.fillText(line, x, y);
	lines_count++;
	}catch(err){
		console.log("EXCEPTION");
		console.log(err);
		console.log(text);
	}
	return lines_count;
}

function makeTextSprite(message, parameters) {
    if (parameters === undefined) parameters = {};
    
    var fontface = parameters.hasOwnProperty("fontface") ? 
		parameters["fontface"] : "Arial";
    
    var fontsize = parameters.hasOwnProperty("fontsize") ? 
		parameters["fontsize"] : 36;
    
    var borderThickness = parameters.hasOwnProperty("borderThickness") ? 
		parameters["borderThickness"] : 2;
    
    var borderColor = parameters.hasOwnProperty("borderColor") ?
		parameters["borderColor"] : { r: 0, g: 0, b: 0, a: 1.0 };
    
    var backgroundColor = parameters.hasOwnProperty("backgroundColor") ?
		parameters["backgroundColor"] : { r: 255, g: 255, b: 255, a: 1.0 };
	
    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    context.font = "Bold " + fontsize + "px " + fontface;
    
    // get size data (height depends only on font size)
    var metrics = context.measureText(message);
    var textWidth = metrics.width;
    
    // background color
    context.fillStyle = "rgba(" + backgroundColor.r + "," + backgroundColor.g + "," 
								  + backgroundColor.b + "," + backgroundColor.a + ")";
    // border color
    context.strokeStyle = "rgba(" + borderColor.r + "," + borderColor.g + "," 
								  + borderColor.b + "," + borderColor.a + ")";
    var maxWidth = 300;
    context.lineWidth = borderThickness;
	context.textAlign = "center";
	lines_count = wrapText(context, message, 150, fontsize+borderThickness, maxWidth, fontsize);
    roundRect(context, borderThickness / 2, borderThickness / 2, maxWidth-borderThickness/*textWidth + borderThickness*/, lines_count*(fontsize) + borderThickness*2, 6);
    // 1.4 is extra height factor for text below baseline: g,j,p,q.
    
    // text color
    context.fillStyle = "rgba(0, 0, 0, 1.0)";
    
	lines_count = wrapText(context, message, 150, fontsize+borderThickness, maxWidth, fontsize);
    //context.fillText(message, borderThickness, fontsize + borderThickness);
    
    // canvas contents will be used for a texture
    var texture = new THREE.Texture(canvas);
	//texture.magFilter = THREE.NearestFilter; texture.minFilter = THREE.NearestFilter; texture.generateMipmaps = false;
    texture.needsUpdate = true;
    
    var spriteMaterial = new THREE.SpriteMaterial( 
        { map: texture }
	);
	
    var sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(globalscale/2, globalscale/2, globalscale/2);
    return sprite;
};

Array.prototype.contains = function (obj) {
    var index = this.indexOf(obj);
    return (index >= 0);
};

//3=o
THREE.Object3D.prototype.removeChild = function (child) {
    var scene = this;
    //    child.visible = false;
    child.parent.remove(child);

};


function addNewParticle(pos, scale)
{
    if( !scale )
    {
        scale = 16;
    }
    /*var particle = new THREE.Sprite( particleMaterial );
    particle.position = pos;
	particle.scale.set(50,50,50);
    //particle.scale.x = particle.scale.y = scale;*/
	console.log("addNewParticle: ");
	console.log(pos);
	var particle = new THREE.Object3D();
	var mat = new THREE.MeshBasicMaterial( { color: 0x660000, wireframe: true } );
	var mesh = new THREE.Mesh( new THREE.SphereGeometry( 1, 1, 1), mat );
	particle.add(mesh);
	particle.position.x=pos.x;
	particle.position.y=pos.y;
	particle.position.z=pos.z;
    scene.add( particle );
	
}

function getFactorPos( val, factor, step )
{
    return step / factor * val;                
}

function drawParticleLine(pointA,pointB)
{
    var factor = 50;
    for( var i = 0; i < factor; i++ )
    {
        var x = getFactorPos( pointB.x - pointA.x, factor, i );
        var y = getFactorPos( pointB.y - pointA.y, factor, i );
        var z = getFactorPos( pointB.z - pointA.z, factor, i );
        addNewParticle( new THREE.Vector3( pointA.x+x,pointA.y+y,pointA.z+z ), Math.max(2, initialWidth / 500 ) );
    }
}

function drawRayLine(rayCaster)
{
	console.log("Drawing ray...");
    var scale = initialWidth*2;
    var rayDir = new THREE.Vector3(rayCaster.ray.direction.x*scale,rayCaster.ray.direction.y*scale,rayCaster.ray.direction.z*scale);
    var rayVector = new THREE.Vector3(camera.position.x + rayDir.x, camera.position.y + rayDir.y, camera.position.z + rayDir.z);
    drawParticleLine(camera.position, rayVector);
}          


/*

THREE.Object3D.prototype.removeChildRecurse = function(child){
	this.removeChild(child);
};
*/
//<

function rotateAroundWorldAxis(object, axis, radians) {
    var rotWorldMatrix = new THREE.Matrix4();
    rotWorldMatrix.makeRotationAxis(axis.normalize(), radians);
    rotWorldMatrix.multiply(object.matrix);
    object.matrix = rotWorldMatrix;
    object.rotation.setFromRotationMatrix(object.matrix);
}

String.prototype.capitalize = function(){
       return this.replace( /(^|\s)([a-z])/g , function(m,p1,p2){ return p1+p2.toUpperCase(); } );
}



function findFirstIntersection(event){
	var raycaster = new THREE.Raycaster();
	var vector = new THREE.Vector3();
	vector.set((event.clientX / initialWidth) * 2 - 1, -(event.clientY / initialHeight) * 2 + 1, 1);
	vector.unproject(camera);
	raycaster.ray.set(camera.position, vector.sub(camera.position).normalize());
	raycaster.ray.linePrecision = 0.0000001;
	raycaster.ray.precision = 0.0000001;
	
	var all_objs = [];
	var objects = {};
	var len = Object.size(spheres)-1;
	for (var it = len; it >= 0; it--) {
	  //console.log('Getting  objs');
		//console.log(spheres);
		objects[it] = spheres[it].getObjects3d();
		all_objs = all_objs.concat(objects[it]);
	}
	
	spheres_object3d.updateMatrixWorld();
	var intersects = raycaster.intersectObjects(all_objs);
	intersects_filtered = [];
	$.each(intersects, function(i, inter){
		if(inter.object.spherevertex.object3d.visible){
			intersects_filtered.push(inter);
		}
	});
	intersects = intersects_filtered;
	if(intersects.length > 0){
		return intersects[0].object.spherevertex;
	}
	return null;
}

Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

