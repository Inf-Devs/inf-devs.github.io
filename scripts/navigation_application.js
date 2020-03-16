/**
	Renders navigation using PIXI.
	@author laifrank2002
	@date 2020-03-14
 */

var NavigationApplication = (
	function()
	{
		var app;
		var backgroundObjects = [];
		var foregroundObjects = [];
		var canvasId = "navigation";
		var canvas;
		
		var constellations = [
			{
				xPercent: 20,
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
		];
		
		// for scrollin'
		var underX = -100;
		var underY = -100;
		var overX = 100;
		var overY = 100;
		
		function Star(x=0,y=0,radius=2, fixed=false)
		{
			var circle = new PIXI.Graphics();
			this.circle = circle;
			circle.x = x;
			circle.y = y;
			circle.radius = radius;
			
			var speed = randomNumber(0.1,2);
			circle.vx = speed;
			circle.vy = speed;
			
			this.fixed = fixed;
			// inner loop
			circle.beginFill(0xFFFFFF);
			circle.drawCircle(0,0,radius);
			circle.endFill();
			// outer glow 
			circle.beginFill(0xFFFFFF,0.5);
			circle.drawCircle(0,0,radius*2);
			circle.endFill();
			// wide glow
			circle.beginFill(0xFFFFFF,0.02);
			circle.drawCircle(0,0,radius*2+5);
			circle.endFill();
			
			app.stage.addChild(circle);
		}
		
		Star.prototype.tick = function(lapse)
		{
			if(this.fixed) return;
			var circle = this.circle;
			this.move(circle.vx * lapse, circle.vy * lapse);
			this.wrapRestitute();
		}
		
		Star.prototype.move = function(x,y)
		{
			var circle = this.circle;
			circle.x += x;
			circle.y += y;
		}
		
		// over x or under x? no problem! we wrap around!
		Star.prototype.wrapRestitute = function()
		{
			var circle = this.circle;
			if(circle.x > canvas.width + overX) circle.x = 0 + underX;
			if(circle.x < 0 + underX) circle.x = canvas.width + overX;
			if(circle.y > canvas.height + overY) circle.y = 0 + underY;
			if(circle.y < 0 + underY) circle.y = canvas.height + overY;
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
			
			// make us a pretty circle 
			var circle = new PIXI.Graphics();
			this.circle = circle;
			
			circle.x = this.centerX;
			circle.y = this.centerY;
			circle.beginFill(0xFFFFFF,0.2);
			circle.drawCircle(0,0,this.radius);
			circle.endFill();
			
			var line = new PIXI.Graphics();
			this.line = line;
			line.lineStyle(2, 0xFFFFFF, 0.8);
			
			line.moveTo(this.stars[0].circle.x , this.stars[0].circle.y);
			for(var i = 1, count = this.stars.length; i < count; i++)
			{
				line.lineTo(this.stars[i].circle.x, this.stars[i].circle.y);
			}
			
			app.stage.addChild(circle);
			app.stage.addChild(line);
		}
		
		// changes EVERYTHING (not really)
		Constellation.prototype.move = function(x,y)
		{
			this.x += x;
			this.y += y;
			
			this.stars.forEach(star => star.move(x,y));
			
			this.centerX += x;
			this.centerY += y;
			
			var circle = this.circle;
			circle.x = this.centerX;
			circle.y = this.centerY;
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
			return this.stars.reduce((min,star) =>  star.circle.x < min ? star.circle.x : min, this.stars[0].circle.x);
		}
		
		Constellation.prototype.getMinY = function()
		{
			return this.stars.reduce((min,star) =>  star.circle.y < min ? star.circle.y : min, this.stars[0].circle.y);
		}
		
		Constellation.prototype.getMaxX = function()
		{
			return this.stars.reduce((max,star) =>  star.circle.x > max ? star.circle.x : max, this.stars[0].circle.x);
		}
		
		Constellation.prototype.getMaxY = function()
		{
			return this.stars.reduce((max,star) =>  star.circle.y > max ? star.circle.y : max, this.stars[0].circle.y);
		}
		
		return {
			initialize: function()
			{
				canvas = document.getElementById(canvasId);
				app = new PIXI.Application({
					resizeTo: window,
					view: canvas,
					autoDensity: true,
					antialias: true,
					resolution: 1,
				});
				app.renderer.backgroundColor = 0x222222;
				app.ticker.add(this.tick);
				this.generateStars();
				this.generateConstellations();
			},
			
			generateStars: function(count = 1000)
			{
				for(var i = 0; i < count; i++)
				{
					backgroundObjects.push(new Star(randomInteger(0,canvas.width),randomInteger(0,canvas.height),randomNumber(0.2,1)));
				}
			},
			generateConstellations: function()
			{
				for(var i = 0, count = constellations.length; i < count; i++)
				{
					foregroundObjects.push(this.generateConstellationFromData(constellations[i]));
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
			
			tick: function(lapse)
			{
				for(var i = 0, count = backgroundObjects.length; i < count; i++)
				{
					backgroundObjects[i].tick(lapse);
				}
			},
		}
	}
)();