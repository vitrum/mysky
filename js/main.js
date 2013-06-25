
// Author : Thomas Boch
var colorValues = ["#9bb2ff", "#9bb2ff", "#9eb5ff", "#a3b9ff", "#aabfff", "#b2c5ff", "#bbccff", "#c4d2ff", "#ccd8ff ", "#d3ddff", "#dae2ff", "#dfe5ff", "#e4e9ff", "#e9ecff", "#eeefff", "#f3f2ff", "#f8f6ff", "#fef9ff", "#fff9fb", "#fff7f5", "#fff5ef", "#fff3ea", "#fff1e5", "#ffefe0", "#ffeddb", "#ffebd6", "#ffe9d2", "#ffe8ce", "#ffe6ca", "#ffe5c6", "#ffe3c3", "#ffe2bf", "#ffe0bb", "#ffdfb8", "#ffddb4", "#ffdbb0", "#ffdaad", "#ffd8a9", "#ffd6a5", "#ffd5a1", "#ffd29c", "#ffd096", "#ffcc8f", "#ffc885", "#ffc178", "#ffb765", "#ffa94b", "#ff9523", "#ff7b00", "#ff5200"]
var colorLimits = [-0.4, -0.35, -0.3, -0.25, -0.2, -0.15, -0.1, -0.05, 0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 1, 1.05, 1.1, 1.15, 1.2, 1.25, 1.3, 1.35, 1.4, 1.45, 1.5, 1.55, 1.6, 1.65, 1.7, 1.75, 1.8, 1.85, 1.9, 1.95, 2]
function colorFromB_V(bv) {
    if (bv<colorLimits[0] ) return colorValues[0];

    for (var i=0; i<colorLimits.length-1; i++) {
        if (bv>=colorLimits[i] && bv<colorLimits[i+1]) return colorValues[i+1];
    }

    return colorValues[colorValues.length-1]
}

function sizeFromVMag(mag) {
    if (mag>5) return 0.4;
    if (mag>4) return 0.7;
    if (mag>3) return 1;
    if (mag>2) return 1.5;
    if (mag>1) return 2;
    if (mag>0) return 2.5;

    return 2.9;
}


    function cooToXY(s, lon0, lat0, lon, lat, radius) {
	if (s && s.vmag>5.5) return;

	var cosc = Math.sin(lat0)*Math.sin(lat)+Math.cos(lat0)*Math.cos(lat)*Math.cos(lon-lon0)
	if ( cosc<0 ) {
            return null;
	}
        var x = -radius*Math.cos(lat)*Math.sin(lon-lon0)
	var y = -radius*(Math.cos(lat0)*Math.sin(lat)-Math.sin(lat0)*Math.cos(lat)*Math.cos(lon-lon0))
	return [x, y];
    }

    var lon0 = 120;
    var lat0 = 30;
    var lon0deg, lat0deg;
    var intervalDelay = 80; // temps en ms entre 2 rafraichissements
    var intervalId;
    var drawgrid = true;
    var drawconst = true;
    var drawconstname = true;
    var drawstars = true;
    var odrawgrid = !drawgrid;
    var odrawconst = !drawconst
    var odrawconstname = !drawconstname
    var odrawstars = !drawstars
    var olon0 = 999
    var olat0 = 999
    var ctx;
    var width;
    var height;
    var cx;
    var cy;
    var radius;
    var dragging = false;
    var dragx=null;
    var dragy=null;
    function draw() {
	// adding listeners to checkboxes    
        var cbGrid = document.getElementById("cbGrid");
        cbGrid.onchange = function() {
	    drawgrid = cbGrid.checked;
	    doDraw();
        }

        var cbConst = document.getElementById("cbConst");
        cbConst.onchange = function() {
	    drawconst = cbConst.checked;
	    doDraw();
        }
        var cbConstName = document.getElementById("cbConstName");
        cbConstName.onchange = function() {
	    drawconstname = cbConstName.checked;
	    doDraw();
        }
        var cbStars = document.getElementById("cbStars");
        cbStars.onchange = function() {
	    drawstars = cbStars.checked;
	    doDraw();
        }

        var canvas = document.getElementById("canvas");
	canvas.onmousedown = function(e) {
	    dragx = e.clientX;
	    dragy = e.clientY;
	    dragging = true;
	    intervalId = setInterval("doDraw()", intervalDelay);
	}
	canvas.onmouseup = function(e) {
	    dragx = dragy = null;	
	    dragging = false;
	    clearInterval(intervalId);
	}
	canvas.onmousemove = function(e) {
            if (!dragging) return;

	    var xoffset = e.clientX-dragx;
	    var yoffset = e.clientY-dragy;
	    var dist = xoffset*xoffset+yoffset*yoffset;
	    if (dist<5) return;
	    dragx = e.clientX;
	    dragy = e.clientY;

	    lon0 += xoffset*0.2;
	    lat0 += yoffset*0.2;
	};
	var hammertime = Hammer(canvas).on("drag", function(event) {
        alert(this, event);
    });
	/*canvas.hammer().on("tap", function(event) {
        console.log(this, event);
        alert(this, event);
    });
*/
        width = canvas.width;
        height = canvas.height;
        cx = width/2;
        cy = height/2;
	radius = 300;
        if (canvas.getContext) {
            ctx = canvas.getContext("2d");
	    doDraw();
        }
    }

    function doDraw() {
	    //lon0 = lon0+0.8
	    //lat0 = lat0+0.4

            if (olon0==lon0 && olat0==lat0 && odrawgrid==drawgrid && odrawconst==drawconst
		&& odrawconstname==drawconstname && odrawstars==drawstars) {
		    olon0=lon0;
		    olat0=lat0;
		    odrawgrid=drawgrid;
		    odrawconst=drawconst;
		    odrawconstname=drawconstname;
		    odrawstars=drawstars;

		    return;

	    }

            //ctx.save();
            ctx.clearRect(0,0,width,height);


            lon0deg = lon0*Math.PI/180
            lat0deg = lat0*Math.PI/180

            ctx.fillStyle = "rgb(0,0,0)";
	    ctx.beginPath();
            ctx.arc(cx, cy, radius, 0, 2*Math.PI, true);
	    ctx.fill();
	    //ctx.restore();

	    drawConstellations();
	    drawConstellationsNames();

	    drawStars();

	    drawGrid();

	    olon0=lon0;
	    olat0=lat0;
	    odrawgrid=drawgrid;
	    odrawconst=drawconst;
	    odrawconstname=drawconstname;
	    odrawstars=drawstars;
    }

    function drawStars() {
	if (!drawstars) return;

	//ctx.save();
	for (var i=stars.length-1; i>=0; i--) {
            var s = stars[i];
	    xy = cooToXY(s, lon0deg, lat0deg, s.ra*Math.PI/180, s.dec*Math.PI/180, radius);
	    if (xy) {
		ctx.beginPath();
                ctx.fillStyle = colorFromB_V(s.bv);
	        ctx.arc(cx+xy[0], cy+xy[1], sizeFromVMag(s.vmag), 0, 2*Math.PI, true);
	        ctx.fill();

		// test pour rendre l'aspect blurry des 閠oiles
		/*
		ctx.beginPath();
                ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
	        ctx.arc(cx+xy[0], cy+xy[1], 2*sizeFromVMag(s.vmag), 0, 2*Math.PI, true);
		ctx.fill();
		*/
	    }
	}
	//ctx.restore();
    }

    function drawConstellations() {
	    if (!drawconst) return;

	    //ctx.save();
	    ctx.strokeStyle = "rgba(100,100,200, 0.5)";
	    ctx.lineWidth = 2;
	    ctx.beginPath();

	    var l1, l2;
	    var c;
	    for (var i=0; i<constellations.length; i++) {
		c = constellations[i];
                for (var j=0; j<c.lines.length; j++) {
		    l1 = cooToXY(null, lon0deg, lat0deg, c.lines[j][0]*Math.PI/180, c.lines[j][1]*Math.PI/180, radius);
		    l2 = cooToXY(null, lon0deg, lat0deg, c.lines[j][2]*Math.PI/180, c.lines[j][3]*Math.PI/180, radius);
		    if (l1 && l2) {
			ctx.moveTo(cx+l1[0], cy+l1[1]);
			ctx.lineTo(cx+l2[0], cy+l2[1]);

		    }

		}

	    }
	    ctx.stroke();
	    //ctx.restore();


    }

    function drawConstellationsNames() {
	    if (!drawconstname) return;

	    // testing existence of function
	    if (!ctx.fillText) return;

	    //ctx.save();
	    ctx.beginPath();
	    ctx.fillStyle = "rgba(230,120,250, 0.5)";
	    ctx.textWidth = 2.5;
	    var c;
	    for (var i=0; i<constellations.length; i++) {
		c = constellations[i];
		xy = cooToXY(null, lon0deg, lat0deg, c.namera*Math.PI/180.0, c.namedec*Math.PI/180.0, radius);
		if (xy) {
		    ctx.fillText(c.name, cx+xy[0], cy+xy[1])
		}
	    }

	    ctx.stroke();
	    //ctx.restore();

    }

    function drawGrid() {
	    if (!drawgrid) return;

	    // trac� grille
	    //ctx.save();
	    ctx.strokeStyle = "rgba(100,200,100, 0.5)";
	    ctx.lineWidth = 1;
	    ctx.fillStyle = "white";
	    ctx.beginPath();
	    var ox, oy; 
	    var raIdx=-999;
	    for (var ra=0; ra<360; ra+=20) {
		ox = oy = null;
	        for (var dec=-90; dec<=90; dec=dec+5) {
		    xy = cooToXY(null, lon0deg, lat0deg, ra*Math.PI/180.0, dec*Math.PI/180, radius);
		    if (xy && ox && oy) {
		        ctx.moveTo(cx+ox, cy+oy);
		        ctx.lineTo(cx+xy[0], cy+xy[1]);
		    }
		    if (xy && xy[0]>60 && xy[0]<155 && xy[1]>-65 && xy[1]<65 && raIdx<0) {
			    raIdx = ra;
		    }



		    if (xy) {
		        ox = xy[0];
			oy = xy[1];
		    }
		    else {
			ox = oy = null;
		    }
	        }
		xy = cooToXY(null, lon0deg, lat0deg, ra*Math.PI/180.0, 0, radius);
		if (xy && ctx.fillText) {
		    ctx.fillText(ra, cx+xy[0], cy+xy[1])
		}
            }

	    
	    for (var dec=-90; dec<=90; dec+=20) {
		ox = oy = null;
		var gg = cooToXY(null, lon0deg, lat0deg, raIdx*Math.PI/180.0, dec*Math.PI/180, radius);
		if (gg && ctx.fillText) ctx.fillText(dec, cx+gg[0], cy+gg[1])
	        for (var ra=0; ra<=380; ra=ra+5) {
		    xy = cooToXY(null, lon0deg, lat0deg, ra*Math.PI/180.0, dec*Math.PI/180, radius);
		    if (xy && ox && oy) {
		        ctx.moveTo(cx+ox, cy+oy);
		        ctx.lineTo(cx+xy[0], cy+xy[1]);
		    }
		    if (xy) {
		        ox = xy[0];
			oy = xy[1];
		    }
		    else {
			ox = oy = null;
		    }
	        }
            }
	    
	    
	    ctx.stroke();
	    //ctx.restore();
    }

var increment = 1;
function keyDown(event) {
	if (event.keyCode == 37) {// left
		lon0 -= increment;
	}
	else if (event.keyCode == 39) { // right
		lon0 += increment;
	}
	else if (event.keyCode == 38) { // up
		lat0 -= increment;
	}
	else if (event.keyCode == 40) { // down
		lat0 += increment;
	}
}