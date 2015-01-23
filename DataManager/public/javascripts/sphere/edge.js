var Edge = function (verticeA, verticeB, parent) {

    var STATE = {
        HIDDEN: 0,
        SHOWN: 1
    };

    this.state = STATE.HIDDEN;


	this.verticeA = verticeA;
	this.verticeB = verticeB;
	//console.log(verticeA, verticeB);
	var geometry = new THREE.Geometry();
    geometry.vertices.push(this.verticeA.position);
    geometry.vertices.push(this.verticeB.position);

    this.line = new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: 0x0000ff }));
    parent.add(this.line);

    this.update = function () {


		this.line.geometry.vertices[0] = this.verticeA.position;
		this.line.geometry.vertices[1] = this.verticeB.position;
		this.line.geometry.verticesNeedUpdate = true;
        this.line.visible = true;
	    this.state = STATE.SHOWN;
	};
	this.remove = function () {

	    if (this.state == STATE.HIDDEN) {
	        return;
	    }

	    this.line.visible = false;
	    this.line.parent.remove(this.line);
	    this.state = STATE.HIDDEN;
	};
};