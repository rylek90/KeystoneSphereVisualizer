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
	return lines_count;
}

function makeTextSprite(message, parameters) {
    if (parameters === undefined) parameters = {};
    
    var fontface = parameters.hasOwnProperty("fontface") ? 
		parameters["fontface"] : "Times New Roman";
    
    var fontsize = parameters.hasOwnProperty("fontsize") ? 
		parameters["fontsize"] : 18;
    
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
    roundRect(context, borderThickness / 2, borderThickness / 2, maxWidth-borderThickness/*textWidth + borderThickness*/, lines_count*(fontsize * 1.4) + borderThickness, 6);
    // 1.4 is extra height factor for text below baseline: g,j,p,q.
    
    // text color
    context.fillStyle = "rgba(0, 0, 0, 1.0)";
    
	lines_count = wrapText(context, message, 150, fontsize+borderThickness, maxWidth, fontsize);
    //context.fillText(message, borderThickness, fontsize + borderThickness);
    
    // canvas contents will be used for a texture
    var texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    
    var spriteMaterial = new THREE.SpriteMaterial( 
        { map: texture }
	);
    var sprite = new THREE.Sprite(spriteMaterial);
    //sprite.scale.set(1, 1, 1.0);
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
};
