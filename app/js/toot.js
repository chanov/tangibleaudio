
var w = window.innerWidth;
var h = window.innerHeight;

// Matter aliases
var Render = Matter.Render;
// var RenderPixi = Matter.RenderPixi;
var World = Matter.World;
var Bounds = Matter.Bounds;
var Vertices = Matter.Vertices;
var Engine = Matter.Engine;
var Events = Matter.Events;
var Composite = Matter.Composite;
// var Composites = Matter.Composites;
var Vector = Matter.Vector;
var Bodies = Matter.Bodies;
var Body = Matter.Body;
var Mouse = Matter.Mouse;
var Constraint = Matter.Constraint;
var Sleeping = Matter.Sleeping;

var mouse;
var mouseConstraint;
var draggingCircle = false;
var isMuted = false;

var containerNode = document.getElementById("container");
var colors = ["#1081de","#fb9920","#5c1f43", "#1cd988"];
var redColor = "#ec2433"; 
// var greyColor = "red";
var greyColor = "#f1eadd";

var isThankYou = window.location.hash ? (window.location.hash.substring(1)=="thankyou") : false;
var iOS = /(iPad|iPhone|iPod)/g.test( navigator.userAgent );
var prevDate = 0;




var shapes = [];
var bounds = [];
var notes = ["c", "d", "e", "g", "a", "c", "d"];

var tiltFB =0;
var tiltLR =0;

var dir =0;
var engine;

/* solids */
var circle;

var startButton = document.getElementById("start");

$('.fa-facebook').on('click', function() {
	ga('send', 'event', 'button', 'click', 'facebook');
});

$('.fa-twitter').on('click', function() {
	ga('send', 'event', 'button', 'click', 'twitter');
});

$('#knowmore').on('click', function() {
	ga('send', 'event', 'button', 'click', 'knowmore');
});





function init() {
	$("#audiobutton i").click(function(event) {
		event.preventDefault();
		isMuted = !isMuted;
		$(this).removeClass("fa-audio-on fa-audio-off").addClass("fa-audio-"+(isMuted ? "off":"on"));
	});

	$("#audiocheck").show();

	/* setup window.tones */
	window.tones.attack = 0;
	window.tones.volume = 0.4;
	window.tones.release = 300;
	window.tones.type = "sine";

	createEngine();

	if(!isThankYou) {
		setupInteraction();
	} else {
		$("#text").html("<h1>Thank you</h1>");
		$("#knowmore").remove();
		start();
	}

}

init();





function setupInteraction() {
	startButton.onclick = startButton.ontouch = start.bind(this);

	if(!iOS) {
		$("#start").hide();
		start();
	} else{
		$("#start").show();
	}
}


function createEngine() {

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

	engine = Engine.create(containerNode, engineOptions);
	engine.render.options.hasBounds = true;

	engine.world = World.create({
		bounds: {
			min:{x:0,y:0},
			max:{x:w,y:h}
		},
		gravity: {
			x: 0,
			y: 0
		}
	});

	engine.render.options.showVelcotiy = false;
	engine.render.options.showAngleIndicator = false;
	engine.render.options.wireframes = false;
	engine.render.options.background = greyColor;



	window.onresize = onResize.bind(this);

	onResize();
	
	
	
	Engine.run(engine);




	if (window.DeviceOrientationEvent) {
		window.addEventListener('deviceorientation', function(eventData) {
			
			tiltLR = eventData.gamma;

			tiltFB = eventData.beta || 0;

			dir = eventData.alpha;
		}, false);
	} 

}


function onResize() {
	w = window.innerWidth;
	h = window.innerHeight;

	$("#audiocheck").css("top", w/30+"px").css("right", w/20+"px");

	engine.world.bounds.max.x = w;
	engine.world.bounds.max.y = h;

	engine.render.context.canvas.width  = window.innerWidth;
	engine.render.context.canvas.height = window.innerHeight;

	if(bounds.length) {
		for (var i = 0; i < bounds.length; i++) {
			World.remove(engine.world, bounds[i]);
		}
	}

	createBounds();

}

function start() {
	
	if(iOS) playTone("c");
			addCircle();
	
	var k = setTimeout(function() {
		$("#start").addClass("hidden");
		setTimeout(function() {
			$("#text").removeClass("hidden");

			setTimeout(function() {
				$("#text").css("opacity", 1);

			}, 1000);

			$("#formcont").removeClass("hidden");
			setTimeout(function() {
				$("#formcont").css("opacity", 1);

			}, 3000);



		}, 1000);
	},200);



}


function addCircle() {
	var size = Math.round(w / 30);
	circle = Bodies.circle ( w/2,h/2,  size, {
		density: 0.0005,
		frictionAir: 0.01,
		restitution: 0.9,
		friction: 0.01,
		render: {
			fillStyle: redColor,
			strokeStyle: redColor
		}
	} );


	Body.setVelocity (circle, {x:(Math.random()*2 -1)*10,y:-10});
	shapes.push(circle);

	mouse = Mouse.create(engine.render.canvas);
	mouseConstraint = Constraint.create({ 
		pointA: mouse.position,
		pointB: { x: 0, y: 0 },
		length: 0.001, 
		stiffness: 0.1,
		angularStiffness: 1,

		render: {
			visible:false
		}
	});


	var c = Composite.create();
	Composite.addBody(c,circle);
	Composite.addConstraint(c, mouseConstraint);
	World.add(engine.world, c);

	Events.on(engine, 'beforeTick',beforeTick.bind(this));
	Events.on(engine, 'tick',tick.bind(this));
	Events.on(engine, 'collisionStart', onCollisionStart.bind(this));

}

function playTone(n) {
	if(!isMuted && new Date() - prevDate > 100) {
		prevDate = new Date();
		window.tones.play(n);
	}
}

function createBounds() {
	var optionsBounds = {
		isStatic: true,
		render: {
			// strokeStyle:  "#fff000",
			strokeStyle:  greyColor,
			fillStyle:  greyColor,
			strokeWidth:0
		}
	};
	var t = w/30;
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

	World.add(engine.world, [left,topi,bottom,right]);

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
			fillAlpha: 0,
			fillStyle: greyColor
		}
	} );
	Body.setVelocity(b, {x:(Math.random()*2 -1)*5,y:(Math.random()*2 -1)*5});
	b.color = b.render.strokeStyle = colors[index];
	b.note =  notes[index];
	shapes.push(b);
	World.add(engine.world, b);
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
		if(pair.bodyA == circle || pair.bodyB == circle ) collide([pair.bodyA, pair.bodyB]);
		// playTone(pair.bodyB.note);
		// playTone(notes[noteIndex]);

	}
}



function collide(a) {

	// console.log("col")
	var noncollider;

	var collidedSolid = (a[0] == circle) ? a[1] : a[0];


	if(collidedSolid.isbounds) { 
		
		fadeColor(collidedSolid, collidedSolid.color, 400, true);
		var t = setTimeout( function() {
			fadeColor(collidedSolid, greyColor, 400, true);
			clearTimeout(t);
		}, 2000);
		addPolygon(colors.indexOf(collidedSolid.color));
		playTone(collidedSolid.note);

	} else  { 
		fadeColor(collidedSolid,  collidedSolid.color, 400, false);
		var t = setTimeout( function() {
			fadeColor(collidedSolid, greyColor, 400, false, function(){
				collidedSolid.fillAlpha = 0;
			});
			clearTimeout(t);
		}, 2000);
		playTone(collidedSolid.note);

	}

}


function fadeColor(boundObject, endColor, duration, alsoStroke, callback) {
	
	boundObject.render.fillAlpha = 1;
	
	var interval = 10;
	var steps =  duration / interval;
	var step_u = 1.0 / steps;
	var u = 0.0;
	var theInterval = setInterval(function() {
		if (u >= 1.0) {
			if(callback) callback();
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
	if(circle.speed > 10) {
		var vel = circle.velocity;
		vel = Vector.normalise(vel);
		vel = Vector.mult(vel, 10);
		Body.setVelocity(circle,vel);
	}
}


function tick(t) {
	updateConstraint();
	var afb = Math.abs(tiltFB);
	var lrb = Math.abs(tiltLR);
	var gx = afb > 1 ? Math.min(afb, 1) : 0;
	var gy = lrb > 1 ? Math.min(lrb, 1) : 0;

	var isContaining =Bounds.contains(circle.bounds, mouse.position);
	containerNode.style.cursor = (isContaining || draggingCircle) ? "pointer" :"auto";

	if(iOS) {
		if(window.innerWidth > window.innerHeight) { 
			engine.world.gravity.y = tiltLR > 0 ? gy : -gy;			
			engine.world.gravity.x = tiltFB < 0 ? gx : -gx; 
			//x is inverted
		} else {
			engine.world.gravity.x = tiltLR > 0 ? gy : -gy;
			engine.world.gravity.y = tiltFB < 0 ? -gx : gx;
		}
	} else {
		engine.world.gravity.x = tiltLR > 0 ? gy : -gy;
		engine.world.gravity.y = tiltFB < 0 ? -gx : gx;
	}

	return;


}


function updateConstraint() {
	if (mouse.button === 0) {
		if (!mouseConstraint.bodyB) {
			var body = circle;
			if (Bounds.contains(body.bounds, mouse.position)  && Vertices.contains(body.vertices, mouse.position)) {
				mouseConstraint.pointA = mouse.position;
				mouseConstraint.bodyB = body;
				mouseConstraint.pointB = { x: mouse.position.x - body.position.x, y: mouse.position.y - body.position.y };
				mouseConstraint.angleB = body.angle;
				draggingCircle =true;
				Sleeping.set(body, false);
			}
		}
	} else {
		draggingCircle =false;
		mouseConstraint.bodyB = null;
		mouseConstraint.pointB = null;
	}

	if (mouseConstraint.bodyB) {
		Sleeping.set(mouseConstraint.bodyB, false);
		mouseConstraint.pointA = mouse.position;
	}
};




