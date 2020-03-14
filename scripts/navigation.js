// for the navigation element 
var Navigation = (
	function()
	{
		var canvasId = "navigation";
		
		var backgroundColor = "#222222";
		var lineColour = "#ffffff";
		var starColour = "#ffffff";
		
		var canvas = null;	
		var canvasContext = null;
		var backgroundObjects = [];
		var lastTime;
		
		
		function Star(x,y,radius = 1)
		{
			this.x = x;
			this.y = y;
			this.displayX = this.x;
			this.displayY = this.y;
			this.radius = radius;
			this.colour = this.getRandomColour(); 
			this.speed = this.getRandomSpeed();
		}
		
		Star.prototype.getRandomColour = function()
		{
			// certified by RFC 1149.6 as IEEE-vetted random colour 
			return starColour;
		}
		
		Star.prototype.getRandomSpeed = function()
		{
			var speed = randomNumber(0.1,2);
			return new Point(speed,speed);
		}
		
		Star.prototype.draw = function(context)
		{
			// main body
			context.globalAlpha = 1.0;
			fillCircle(context,this.x,this.y,this.radius,this.colour);
			
			// faint outer shadows
			context.globalAlpha = 0.5;
			fillCircle(context,this.x,this.y,this.radius+1,this.colour);
			context.globalAlpha = 0.05;
			fillCircle(context,this.x,this.y,this.radius+3,this.colour);
		}
		
		Star.prototype.tick = function(lapse)
		{
			this.x += this.speed.x;
			this.y += this.speed.y;
			this.wrapRestitute();
		}
		
		// over x or under x? no problem! we wrap around!
		Star.prototype.wrapRestitute = function()
		{
			if(this.x > canvas.width) this.x = 0;
			if(this.x < 0) this.x = canvas.width;
			if(this.y > canvas.height) this.y = 0
			if(this.y < 0) this.y = canvas.height;
		}
		
		function Constellation(stars)
		{
			this.stars = stars;
		}
		
		Constellation.prototype.draw = function(context)
		{
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
						,2
						,lineColour);
				}
			}
		}
		
		Constellation.prototype.tick = function(lapse)
		{
			
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
				//Navigation.generateConstellations();
				
				// we make sure the canvas is SCALABLE
				window.addEventListener("resize", Navigation.onresize);
				window.requestAnimationFrame(Navigation.draw);
			},
			
			onresize: function()
			{
				canvas.width = window.innerWidth;
				canvas.height = window.innerHeight;
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
				
				window.requestAnimationFrame(Navigation.draw);
			},
			
			drawBackground: function(context)
			{
				context.fillStyle = backgroundColor;
				context.fillRect(0,0,canvas.width,canvas.height);
			},
			
			generateStars: function(count = 200)
			{
				for(var i = 0; i < count; i++)
				{
					backgroundObjects.push(Navigation.generateRandomStar());
				}
			},
			
			generateRandomStar: function()
			{
				return new Star(randomInteger(0,canvas.width)
						,randomInteger(0,canvas.height)
						,randomInteger(0,1));
			},
			
			generateConstellations: function(count = 5)
			{
				for(var i = 0; i < count; i++)
				{
					// we choose a starting point
					backgroundObjects.push(Navigation.generateConstellation(randomInteger(5,10)));					
				}
			},
			
			generateConstellation: function(count = 5)
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
				return new Constellation(stars);
			},
		}
	}
)();