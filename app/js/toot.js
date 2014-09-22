
var w = window.innerWidth;
var h = window.innerHeight;

// Matter aliases
var Render = Matter.Render;
var RenderPixi = Matter.RenderPixi;
var World = Matter.World;
var Bounds = Matter.Bounds;
var Vertices = Matter.Vertices;
var Engine = Matter.Engine;
var Events = Matter.Events;
var Composite = Matter.Composite;
var Composites = Matter.Composites;
var Vector = Matter.Vector;
var Bodies = Matter.Bodies;
var Body = Matter.Body;
var Mouse = Matter.Mouse;
var Constraint = Matter.Constraint;
var Sleeping = Matter.Sleeping;


var containerNode = document.getElementById("container");
var colors = ["#7eccdd","#fdd052","#f9ab58", "#8dcdb0"];
var redColor = "#e42532"; 
var greyColor = "#f5eee3";

var shapes = [];
var notes = ["c", "d", "e", "g", "a", "c", "d"];

var tiltFB =0;

var renderer = Render.create({
	element: containerNode,
	options: {
		width: w,
		height: h
	}
});

var engineOptions = {
	render: renderer
};


this.engine = Engine.create(containerNode, engineOptions);
this.engine.render.options.hasBounds = true;

this.engine.world = World.create({
	bounds: {
		min:{x:0,y:0},
		max:{x:w,y:h}
	},
	gravity: {
		x: 0,
		y: 0
	}
});

this.engine.render.options.showVelcotiy = false;
this.engine.render.options.showAngleIndicator = false;
this.engine.render.options.wireframes = false;
this.engine.render.options.background = greyColor;


var dir =0;

tones.attack = 0;
tones.volume = .4;
tones.release = 300;
tones.type = "sine";



var t = 40;



var optionsBounds = {
	isStatic: true,
	render: {
		strokeStyle:  "#f5eee3",
		fillStyle:  "#f5eee3",
		strokeWidth:0
	}
};

createBounds();

function createBounds() {

	var left = Bodies.rectangle(t/2, (h-t)/2+t, t, h-t, optionsBounds);
	var topi = Bodies.rectangle((w- t)/2 , t/2, w - t, t, optionsBounds);
	var right = Bodies.rectangle(w-t/2, (h-t)/2, t, h-t, optionsBounds);
	var bottom = Bodies.rectangle((w- t)/2+t, h-t/2, w-t, t, optionsBounds);
	bounds = [left, topi, right, bottom];

	left.color = colors[0];
	topi.color = colors[1];
	bottom.color = colors[2];
	right.color = colors[3];

	left.note = notes[0];
	topi.note = notes[1];
	bottom.note = notes[2];
	right.note = notes[3];


	right.isbounds =true;
	left.isbounds =true;
	topi.isbounds =true;
	bottom.isbounds =true;

	World.add(this.engine.world, [left,topi,bottom,right]);

} 






var self = this;
window.onresize = function() {
	w = window.innerWidth;
	h = window.innerHeight;

	this.engine.world.bounds.max.x = w;
	this.engine.world.bounds.max.y = h;
	
	this.engine.render.context.canvas.width  = window.innerWidth;
	this.engine.render.context.canvas.height = window.innerHeight;


	for (var i = 0; i < bounds.length; i++) {
		World.remove(this.engine.world, bounds[i]);
	}

	createBounds();

	// self.engine.render.options.width =w;
	// self.engine.render.options.height =h;
	// setSolid(right, w-t, 0, t, h-t*2);

	// setSolid(left, t/2, (h-t)/2+t, t, h-t);
	// setSolid(topi, (w- t)/2 , t/2, w - t, t);
	// setSolid(right, w-t/2, (h-t)/2, t, h-t);
	// setSolid(bottom, (w- t)/2+t, h-t/2, w-t, t);


	// setSolid(w-t/2, t/2, t, h-t*2);

}.bind(this);

function setSolid(solid, x,y,w,h) {
	console.log(x,y,w)
	Body.setVertices(solid, [{ x: x, y: y }, { x: x+w, y: y }, { x: x+w, y: h }, { x: x, y: h }]);

}





var i =0;

noise.seed(Math.random());

var size = Math.round(w / 30);
var b = Bodies.circle ( w/2,h/2,  size, {
	density: 0.0005,
	frictionAir: 0.01,
	restitution: 0.9,
	friction: 0.01,

	render: {
		fillStyle: redColor,
		strokeStyle: redColor
	}
} );



b.force = {x:(Math.random()*2 -1)/10,y:(Math.random()*2 -1)/10}
b.collider = true;
shapes.push(b);




var c = Composite.create();

var mouse = Mouse.create(engine.render.canvas);
var mouseConstraint = Constraint.create({ 
	pointA: mouse.position,
	pointB: { x: 0, y: 0 },
	length: 0.001, 
	stiffness: 0.1,
	angularStiffness: 1,

	render: {
		visible:false
	}
});


Composite.addBody(c,b);
Composite.addConstraint(c,mouseConstraint);


World.add(this.engine.world, c);
Engine.run(this.engine);

init();

Events.on(this.engine, 'beforeTick',beforeTick.bind(this));
Events.on(this.engine, 'tick',tick.bind(this));
Events.on(this.engine, 'collisionStart', onCollisionStart.bind(this))



/* ----------------------- */

function init() {
	if (window.DeviceOrientationEvent) {
		window.addEventListener('deviceorientation', function(eventData) {
			tiltLR = eventData.gamma;

			tiltFB = eventData.beta || 0;

			dir = eventData.alpha

			deviceOrientationHandler(tiltLR, tiltFB, dir);
		}, false);
	} else {
	}
}

function addPolygon(index) {
	var sides = 3+index;
	var x = w/2;
	var y = h/2;

	var size=  Math.round(w / 30);
	var b = Bodies.polygon(x,y, sides, size, {
		density: 0.0005,
		frictionAir: 0.01,
		restitution: 0.3,
		friction: 0.01,
		render: {
			lineWidth: 2,
			fillStyle: greyColor
		}
	} );
	b.force = {x:(Math.random()*2 -1)/100,y:(Math.random()*2 -1)/100}
	b.color = b.render.strokeStyle = colors[index];
	b.note =  notes[index];
	shapes.push(b);
	World.add(this.engine.world, b);
}




function onCollisionStart (event) {


	var pairs = event.pairs;
	for (var i = 0; i < pairs.length; i++) {
		var pair = pairs[i];
		// var pen = pair.collision.penetration;
		// var length = Vector.magnitude(pen);
		// length = Math.min(length, 100);
		// var noteIndex = Math.round(length/100*notes.length);
		// console.log(length/100*notes.length)
		collide([pair.bodyA, pair.bodyB]);
		// tones.play(pair.bodyB.note);
		// tones.play(notes[noteIndex]);

	}
}



function collide(a) {
	if(!a[0].collider && !a[1].collider) return;

	// console.log("col")
	var boundObject;
	var collider, noncollider;
	var soundsPLayed =0;

	for (var i = 0; i < a.length; i++) {
		if(a[i].isbounds)  {
			boundObject = a[i];
		} else {
			(a[i].collider) ? collider = a[i] : noncollider =a[i];
		}
	}

	if(boundObject) { 
		
		if(soundsPLayed < 4) {
			tones.play(boundObject.note);
			soundsPLayed++;
		}

		fadeColor(boundObject, boundObject.color, 400, true);
		var t = setTimeout( function() {
			fadeColor(boundObject, greyColor, 400, true);
		}, 2000);

		addPolygon(colors.indexOf(boundObject.color));
	} else  { 

		if(soundsPLayed < 4) {
			tones.play(noncollider.note);
			soundsPLayed++;
		}
		fadeColor(noncollider,  noncollider.color, 400, false);
		var t = setTimeout( function() {
			fadeColor(noncollider, greyColor, 400, false);
		}, 2000);

	}



	// function fadeToWhite(solid) {
	// 	fadeColor(solid, "#f5eee3");
	// 	var t = setTimeout( function() {
	// 		fadeColor(solid, greyColor);
	// 	}, 1000);
	// }

	function fadeToColor(solid, start, end, alsoStroke) {
		fadeColor(solid, start, 400, alsoStroke);
		var t = setTimeout( function() {
			fadeColor(solid, end, 400, alsoStroke);
		}, 2000);
	}

}


function fadeColor(boundObject, endColor, duration, alsoStroke) {
	var interval = 10;
	var steps =  duration / interval;
	var step_u = 1.0 / steps;
	var u = 0.0;
	var theInterval = setInterval(function() {
		if (u >= 1.0) {
			clearInterval(theInterval);
		}
		
		var start = hexToRgb(boundObject.render.fillStyle)
		var end = hexToRgb(endColor);

		var r = Math.round(lerpColor(start.r, end.r, u));
		var g = Math.round(lerpColor(start.g, end.g, u));
		var b = Math.round(lerpColor(start.b, end.b, u));
		var colorname = rgbToHex(r,g,b);
		
		if(alsoStroke) boundObject.render.strokeStyle = colorname;
		boundObject.render.fillStyle = colorname;
		u += step_u;


	}, interval);
}




function lerpColor(a, b, u) {
	return (1 - u) * a + u * b;
};

function componentToHex(c) {
	var hex = c.toString(16);
	return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
	return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function hexToRgb(hex) {
	var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result ? {
		r: parseInt(result[1], 16),
		g: parseInt(result[2], 16),
		b: parseInt(result[3], 16)
	} : null;
}


function beforeTick() {
	if(b.speed > 30) {
		var vel = b.velocity;
		vel = Vector.normalise(vel);
		vel = Vector.mult(vel, 30);
		Body.setVelocity(b,vel)
	}
}


function tick(t) {
	// this.engine.world.gravity.x = Math.cos(t.timestamp)*.9;
	// this.engine.world.gravity.y = Math.sin(t.timestamp)*.9;


	updateConstraint();

	this.engine.world.gravity.y = tiltFB/1000;
	
	var a= t.timestamp/1000;
	// for (var i = 1; i < shapes.length; i++) {
	// 	// n/=1000;
	// 	var n = noise.simplex3(shapes[i].position.x/100, shapes[i].position.y/100, a);
	// 	var a = n*Math.PI*2;
	// 	// shapes[i].force = {x:Math.cos(a)*n,y:Math.sin(a)*n}
	// 	// shapes[i].torque =n/100;// {x:Math.cos(a)*n,y:Math.sin(a)*n}
	// 	Matter.Body.applyForce ( shapes[i], shapes[i].position, {x:Math.cos(a)/10000,y:Math.sin(a)/10000})
	// };

	// console.log(n)

}


function updateConstraint() {

	if (mouse.button === 0) {
		if (!mouseConstraint.bodyB) {
			var body = b;
			if (Bounds.contains(body.bounds, mouse.position)  && Vertices.contains(body.vertices, mouse.position)) {
				mouseConstraint.pointA = mouse.position;
				mouseConstraint.bodyB = body;
				mouseConstraint.pointB = { x: mouse.position.x - body.position.x, y: mouse.position.y - body.position.y };
				mouseConstraint.angleB = body.angle;
				Sleeping.set(body, false);
				console.log(mouseConstraint)
			}
		}
	} else {
		mouseConstraint.bodyB = null;
		mouseConstraint.pointB = null;
	}

	if (mouseConstraint.bodyB) {
		Sleeping.set(mouseConstraint.bodyB, false);
		mouseConstraint.pointA = mouse.position;
	}
};




function deviceOrientationHandler(tiltLR, tiltFB, dir) {
	// document.getElementById("pressed").innerHTML = Math.round(pressed);
	// document.getElementById("doTiltLR").innerHTML = Math.round(tiltLR);
	// document.getElementById("doTiltFB").innerHTML = Math.round(tiltFB);
	// document.getElementById("doDirection").innerHTML = Math.round(dir);

}