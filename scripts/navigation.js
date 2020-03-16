/**
	Code for the home page splash navigation that makes stars.
	Deprecated.
	@author laifrank2002
	@date 2020-03-14
 */

// for the navigation element 
var Navigation = (
	function()
	{
		var canvasId = "navigation";
		
		var backgroundColor = "#222222";
		var lineColour = "#ffffff";
		var starColour = "#ffffff";
		
		var constellations = [
			{
				xPercent: 10,
				yPercent: 20,
				stars: [{x:0,y:0,radius:2}
					,{x:80,y:20,radius:3}
					,{x:120,y:70,radius:1}
					,{x:180,y:110,radius:2}
					,{x:170,y:160,radius:3}
					,{x:270,y:190,radius:3}
					,{x:300,y:140,radius:3}],
				name: "about",
				onmouseclick: function(){window.location.href = "about.html"}
			},
			{
				xPercent: 50,
				yPercent: 10,
				stars: [{x:0,y:0,radius:2}
					,{x:-10,y:30,radius:3}
					,{x:10,y:70,radius:4}
					,{x:30,y:150,radius:3}
					,{x:170,y:160,radius:3}
					,{x:190,y:70,radius:2}
					,{x:160,y:20,radius:1}],
				name: "projects",
				onmouseclick: function(){window.location.href = "projects.html"}
			},
			{
				xPercent: 70,
				yPercent: 60,
				stars: [{x:0,y:0,radius:2}
					,{x:-10,y:30,radius:3}
					,{x:50,y:20,radius:4}
					,{x:130,y:150,radius:3}
					,{x:170,y:40,radius:3}],
				name: "contact",
				onmouseclick: function(){window.location.href = "contact.html"}
			}
		];
		
		var canvas = null;	
		var canvasContext = null;
		var canvasBoundingRectangle = null;
		var backgroundObjects = [];
		var foregroundObjects = [];
		var lastTime;
		
		// for scrollin'
		var underX = -100;
		var underY = -100;
		var overX = 100;
		var overY = 100;
		
		function Star(x,y,radius = 1, fixed = false)
		{
			this.x = x;
			this.y = y;
			this.displayX = this.x;
			this.displayY = this.y;
			this.radius = radius;
			this.colour = this.getRandomColour(); 
			this.speed = this.getRandomSpeed();
			this.fixed = fixed;
		}
		
		Star.prototype.getRandomColour = function()
		{
			/*
			 // certified by RFC 1149.6 as IEEE-vetted random colour 
			 return starColour;
			*/
			var r = randomInteger(100,255);
			var g = r > 170 ? randomInteger(170,255) : randomInteger(50,150);
			var b = r > 200 ? randomInteger(0,255) : r - randomInteger(100,255);
			return RGBToHex(r,g,b);
		}
		
		Star.prototype.getRandomSpeed = function()
		{
			var speed = randomNumber(0.1,2);
			return new Point(speed,speed);
		}
		
		Star.prototype.draw = function(context)
		{
			// if x and y ain't visible, we ain't draw'in nuthin
			if(this.x + this.radius < 0 || this.y + this.radius < 0 || this.x + this.radius > canvas.width || this.y + this.height > canvas.height) return false;
			
			// main body
			context.globalAlpha = 1.0;
			fillCircle(context,this.x,this.y,this.radius,this.colour);
			
			// faint outer shadows
			context.globalAlpha = 0.5;
			fillCircle(context,this.x,this.y,this.radius*2,this.colour);
			context.globalAlpha = 0.02;
			fillCircle(context,this.x,this.y,this.radius*2+5,this.colour);
		}
		
		Star.prototype.move = function(x,y)
		{
			this.x += x;
			this.y += y;
		}
		
		Star.prototype.setPosition = function(x,y)
		{
			this.x = x;
			this.y = y;
		}
		
		Star.prototype.tick = function(lapse)
		{
			if(this.fixed) return false;
			this.move(this.speed.x, this.speed.y);
			this.wrapRestitute();
		}
		
		// over x or under x? no problem! we wrap around!
		Star.prototype.wrapRestitute = function()
		{
			if(this.x > canvas.width + overX) this.x = 0 + underX;
			if(this.x < 0 + underX) this.x = canvas.width + overX;
			if(this.y > canvas.height + overY) this.y = 0 + underY;
			if(this.y < 0 + underY) this.y = canvas.height + overY;
		}
		
		function Constellation(stars, name = "")
		{
			this.stars = stars;
			this.name = name;
			if(this.stars.length < 1) 
			{
				return false;
				console.log("Unable to create a constellation with no stars in it.");
			}
			// derived from stars (since a constellation itself is nothing)
			this.calculateSize();
			
			this.mousedown = false;
			this.hover = false;
		}
		
		// changes EVERYTHING (not really)
		Constellation.prototype.move = function(x,y)
		{
			this.x += x;
			this.y += y;
			
			this.stars.forEach(star => star.move(x,y));
			
			this.centerX += x;
			this.centerY += y;
		}
		
		Constellation.prototype.setPosition = function(x,y, center = false)
		{
			// we cheat... a little... by using .move(x,y)
			var deltaX;
			var deltaY;
			if(!center)
			{
				
				deltaX = x - this.x;
				deltaY = y - this.y;
			}
			else 
			{
				deltaX = x - this.centerX;
				deltaY = y - this.centerY;
			}
			this.move(deltaX,deltaY);
		}
		
		Constellation.prototype.calculateSize = function()
		{
			// reduce to a box 
			this.x = this.getMinX();
			this.y = this.getMinY();
			
			// max - min
			this.width = this.getMaxX() - this.getMinX();
			this.height = this.getMaxY() - this.getMinY();
			
			this.centerX = this.x + this.width/2;
			this.centerY = this.y + this.height/2;
			this.radius = Math.hypot(this.width/2,this.height/2);
		}
		
		Constellation.prototype.onmousedown = function(mouseX, mouseY)
		{
			if(this.isInRadius(mouseX,mouseY)) 
			{
				this.mousedown = true;
			}
		}
		
		Constellation.prototype.onmouseup = function(mouseX, mouseY)
		{
			if(this.isInRadius(mouseX,mouseY) && this.mousedown) 
			{
				this.onmouseclick();
			}
			this.mousedown = null;
		}
		
		Constellation.prototype.onmousemove = function(mouseX, mouseY)
		{
			if(this.isInRadius(mouseX,mouseY)) 
			{
				this.hover = true;
			}
			else 
			{
				this.hover = false;
			}
		}
		
		Constellation.prototype.isInBounds = function(x,y)
		{
			if(x >= this.x && x < this.x + this.width 
				&& y > this.y && y < this.y + this.height)
			{
				return true;
			}
			return false;
		}
		
		Constellation.prototype.isInRadius = function(x,y)
		{
			if(Math.hypot(Math.abs(this.centerX - x), Math.abs(this.centerY - y)) < this.radius) return true;
			return false;
		}
		
		Constellation.prototype.getMinX = function()
		{
			return this.stars.reduce((min,star) =>  star.x < min ? star.x : min, this.stars[0].x);
		}
		
		Constellation.prototype.getMinY = function()
		{
			return this.stars.reduce((min,star) =>  star.y < min ? star.y : min, this.stars[0].y);
		}
		
		Constellation.prototype.getMaxX = function()
		{
			return this.stars.reduce((max,star) =>  star.x > max ? star.x : max, this.stars[0].x);
		}
		
		Constellation.prototype.getMaxY = function()
		{
			return this.stars.reduce((max,star) =>  star.y > max ? star.y : max, this.stars[0].y);
		}
		
		Constellation.prototype.draw = function(context)
		{
			context.globalAlpha = this.hover ? 0.1 : 0.05;
			context.fillStyle = "#ffffff";
			//context.fillRect(this.x,this.y,this.width,this.height);
			
			// we CIRCLE the SQUARE!
			fillCircle(context, this.centerX, this.centerY, this.radius, starColour);
			
			for(var i = 0, count = this.stars.length; i < count; i++)
			{
				//this.stars[i].draw(context);
				// make a thin line from somewhere to another where after we started
				if(i > 0)
				{
					context.globalAlpha = 1.0;
					drawLine(context
						,this.stars[i].x 
						,this.stars[i].y 
						,this.stars[i-1].x 
						,this.stars[i-1].y 
						,1
						,lineColour);
					context.globalAlpha = 0.5;
					drawLine(context
						,this.stars[i].x 
						,this.stars[i].y 
						,this.stars[i-1].x 
						,this.stars[i-1].y 
						,3
						,lineColour);
				}
			}
			context.globalAlpha = 1.00;
			context.fillStyle = "#ffffff";
			// and write its name among the stars 
			context.font = "24pt Arial";
			var metric = context.measureText(this.name);
			context.fillText(this.name,this.centerX - metric.width/2,this.y + this.radius * 2);
		}
		
		Constellation.prototype.tick = function(lapse)
		{
			this.calculateSize();
		}
		
		function RGBToHex(r,g,b)
		{
			return `#${padString(r.toString(16),2,"0")}${padString(g.toString(16),2,"0")}${padString(b.toString(16),2,"0")}`;
		}
		
		// pads in front 
		function padString(string, places, character = "0")
		{
			for(var index = string.length; index < places; index++)
			{
				string = character + string;
			}
			return string;
		}
		
		function Point(x,y)
		{
			this.x = x;
			this.y = y;
		}
		
		function fillCircle(context,x,y,radius,colour)
		{
			context.fillStyle = colour;
			
			context.beginPath();
			context.arc(x,y,radius,0,Math.PI*2,false);
			context.closePath()
			context.fill();
		}
		
		function drawLine(context,x1,y1,x2,y2,width,colour)
		{
			context.strokeStyle = colour;
			context.lineWidth = width;
			
			context.beginPath();
			context.lineTo(x1,y1);
			context.lineTo(x2,y2);
			context.stroke();
		}
		
		
		return {
			initialize: function()
			{
				canvas = document.getElementById(canvasId);
				canvasContext = canvas.getContext("2d");
				
				Navigation.onresize();
				Navigation.generateStars();
				Navigation.generateConstellations();
				Navigation.onresize();
				
				canvas.addEventListener("mousedown",Navigation.onmousedown, false);
				canvas.addEventListener("mouseup",Navigation.onmouseup, false);
				canvas.addEventListener("mousemove",Navigation.onmousemove, false);
				
				// we make sure the canvas is SCALABLE
				window.addEventListener("resize", Navigation.onresize);
				window.requestAnimationFrame(Navigation.draw);
			},
			
			onresize: function()
			{
				canvas.width = window.innerWidth;
				canvas.height = window.innerHeight;
				canvasBoundingRectangle = canvas.getBoundingClientRect();
				
				// resize the buttons!
				foregroundObjects.forEach(object =>
					{
						if(object.data)
						{
							object.setPosition(object.data.xPercent * canvas.width / 100
								,object.data.yPercent * canvas.height / 100);
						}
					});
			},
			
			onmousedown: function(event)
			{
				var mouseX = event.clientX - canvasBoundingRectangle.x;
				var mouseY = event.clientY - canvasBoundingRectangle.y;
				
				//console.log(`${mouseX},${mouseY}`);
				for(var i = 0, count = foregroundObjects.length; i < count; i++)
				{
					foregroundObjects[i].onmousedown(mouseX,mouseY);
				}
			},
			
			onmouseup: function(event)
			{
				var mouseX = event.clientX - canvasBoundingRectangle.x;
				var mouseY = event.clientY - canvasBoundingRectangle.y;
				
				//console.log(`${mouseX},${mouseY}`);
				for(var i = 0, count = foregroundObjects.length; i < count; i++)
				{
					foregroundObjects[i].onmouseup(mouseX,mouseY);
				}
			},
			
			onmousemove: function(event)
			{
				var mouseX = event.clientX - canvasBoundingRectangle.x;
				var mouseY = event.clientY - canvasBoundingRectangle.y;
				
				//console.log(`${mouseX},${mouseY}`);
				for(var i = 0, count = foregroundObjects.length; i < count; i++)
				{
					foregroundObjects[i].onmousemove(mouseX,mouseY);
				}
			},
			
			draw: function(time)
			{
				if(!lastTime)
				{
					lastTime = time;
				}
				var lapse = time - lastTime;
				lastTime = time;
				
				var context = canvasContext;
				context.clearRect(0,0,canvas.width,canvas.height);
				context.globalAlpha = 1.0;
				Navigation.drawBackground(context);
				
				for(var i = 0, count = backgroundObjects.length; i < count; i++)
				{
					backgroundObjects[i].draw(canvasContext);
					backgroundObjects[i].tick(lapse);
				}
				
				for(var i = 0, count = foregroundObjects.length; i < count; i++)
				{
					foregroundObjects[i].draw(canvasContext);
				}
				
				window.requestAnimationFrame(Navigation.draw);
			},
			
			drawBackground: function(context)
			{
				context.fillStyle = backgroundColor;
				context.fillRect(0,0,canvas.width,canvas.height);
			},
			
			generateStars: function(count = 500)
			{
				for(var i = 0; i < count; i++)
				{
					backgroundObjects.push(Navigation.generateRandomStar());
				}
			},
			
			generateRandomStar: function()
			{
				return new Star(randomInteger(0 + underX,canvas.width + overX)
						,randomInteger(0 + underY,canvas.height + overY)
						,randomNumber(0,1));
			},
			
			generateConstellations: function()
			{
				for(var i = 0, count = constellations.length; i < count; i++)
				{
					foregroundObjects.push(Navigation.generateConstellationFromData(constellations[i]));
				}
			},
			
			generateConstellationFromData: function(data)
			{
				var stars = [];
				for(var i = 0, count = data.stars.length; i < count; i++)
				{
					var star = new Star(data.stars[i].x
						,data.stars[i].y 
						,data.stars[i].radius
						,true);
					backgroundObjects.push(star);
					stars.push(star);
				}
				var constellation = new Constellation(stars, data.name);
				constellation.data = data;
				if(data.onmouseclick) constellation.onmouseclick = data.onmouseclick;
				return constellation;
			},
			
			generateConstellationWithStars: function(stars)
			{
				for(var i = 0, count = stars.length; i < count; i++)
				{
					backgroundObjects.push(star);
				}
				return new Constellation(stars);
			},
			
			generateRandomConstellationWithStars: function(count = 5)
			{
				var stars = [];
				for(var i = 0; i < count; i++)
				{
					var star;
					if(i > 0)
					{
						var previousStar = stars[i - 1];
						var star = new Star(randomInteger(previousStar.x - 50,previousStar.x + 50)
							,randomInteger(previousStar.y - 50,previousStar.y + 50)
							,randomInteger(0,1));
					}
					else 
					{
						star = Navigation.generateRandomStar();
					}
					backgroundObjects.push(star);
					stars.push(star);
				}
				return new Constellation(stars, randomString(5));
			},
		}
	}
)();