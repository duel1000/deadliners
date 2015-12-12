function DeathParticle(length)
{
	this.P = VectorFactory.EmptyVector();
	this.dP = VectorFactory.EmptyVector();
	this.Color = "#000000";
	this.MaxLength = length;
	this.CurrentLength = 0;
	this.SizeX = 3;
	this.SizeY = 3;
};

function DeathParticleEmitter(particleAmount)
{
	this.P = VectorFactory.EmptyVector();
	this.Particles = [];
	this.Direction = 0;
	this.IsRunning = false;
	this.CheckForColor = true;

	for(var i = 0; i < particleAmount; i++)
	{
		this.Particles.push(new DeathParticle(30));
	}

	this.Init = function(x, y, direction)
	{
		this.P.x = x;
		this.P.y = y;

		this.Direction = direction;
		this.IsRunning = true;

		var length = this.Particles.length;
		for(var i = 0; i < length; i++)
		{
			var Particle = this.Particles[i];
			Particle.P.x = this.P.x;
			Particle.P.y = this.P.y;
			Particle.CurrentLength = 0; 
		}
	}

	this.UpdateAndRender = function()
	{
		if(!this.IsRunning)
		{
			return;
		}

		var numberOfParticles = this.Particles.length;
		for(var i = 0; i < numberOfParticles; i++)
		{
			var Particle = this.Particles[i];
			Particle.CurrentLength++;
			CreateNewAcceleration(Particle.dP, this.Direction);

			Particle.P.Add(Particle.dP);

			var alpha = 1-(Particle.CurrentLength / Particle.MaxLength);
			ctxDeathParticles.globalAlpha = alpha * 0.8;

			if(this.CheckForColor)
			{
				var xPos = Math.floor(Particle.P.x / 3);
				var yPos = Math.floor(Particle.P.y / 3);

				var gridValue = gridFunctions.GetGridValue(GameState.Grid, xPos, yPos);

				if(gridValue == map_values.Empty)
				{
					Particle.Color = '#000000';
				}
				else
				{
					Particle.Color = '#FFFFFF';
				}
			}

			ctxDeathParticles.fillStyle = Particle.Color;
			ctxDeathParticles.fillRect(Particle.P.x,Particle.P.y, Particle.SizeX, Particle.SizeY);
		}

		if(this.Particles[1].CurrentLength >= this.Particles[1].MaxLength)
		{
			this.IsRunning = false;
		}
	};
}

function HeadshotEmitter(particleAmount)
{
	this.P = VectorFactory.EmptyVector();
	this.Particles = [];
	this.IsRunning = false;

	for(var i = 0; i < particleAmount; i++)
	{
		this.Particles.push(new DeathParticle(35));
	}

	this.Init = function(x, y)
	{
		this.P.x = x;
		this.P.y = y;

		this.IsRunning = true;

		var length = this.Particles.length;
		for(var i = 0; i < length; i++)
		{
			var Particle = this.Particles[i];
			Particle.P.x = this.P.x;
			Particle.P.y = this.P.y;
			Particle.CurrentLength = 0; 
		}
	}

	this.UpdateAndRender = function()
	{
		if(!this.IsRunning)
		{
			return;
		}

		var numberOfParticles = this.Particles.length;
		for(var i = 0; i < numberOfParticles; i++)
		{
			var Particle = this.Particles[i];
			Particle.CurrentLength++;
			CreateSpreadAcceleration(Particle.dP, 6);

			Particle.P.Add(Particle.dP);

			var alpha = 1-(Particle.CurrentLength / Particle.MaxLength);
			ctxDeathParticles.globalAlpha = alpha * 0.8;

			
			var xPos = Math.floor(Particle.P.x / 3);
			var yPos = Math.floor(Particle.P.y / 3);

			var gridValue = gridFunctions.GetGridValue(GameState.Grid, xPos, yPos);

			if(gridValue == map_values.Empty)
			{
				Particle.Color = '#000000';
			}
			else
			{
				Particle.Color = '#FFFFFF';
			}

			ctxDeathParticles.fillStyle = Particle.Color;
			ctxDeathParticles.fillRect(Particle.P.x,Particle.P.y, Particle.SizeX, Particle.SizeY);
		}

		if(this.Particles[1].CurrentLength >= this.Particles[1].MaxLength)
		{
			this.IsRunning = false;
		}
	}
}

function TargetDestroyedEmitter(particleAmount)
{
	this.P = VectorFactory.EmptyVector();
	this.Particles = [];
	this.IsRunning = false;

	for(var i = 0; i < particleAmount; i++)
	{
		this.Particles.push(new DeathParticle(20));
	}

	this.Init = function(x, y)
	{
		this.P.x = x;
		this.P.y = y;

		this.IsRunning = true;

		var length = this.Particles.length;
		for(var i = 0; i < length; i++)
		{
			var Particle = this.Particles[i];

			xDiff = Math.floor((Math.random() * 15) + 0) - Math.floor((Math.random() * 15) + 0);
			yDiff = Math.floor((Math.random() * 15) + 0) - Math.floor((Math.random() * 15) + 0);

			Particle.P.x = this.P.x + xDiff;
			Particle.P.y = this.P.y + yDiff;
			Particle.CurrentLength = 0; 

			if(i % 2 == 0)
			{
				Particle.Color = "#FFFFFF";
			}
		}
	}

	this.UpdateAndRender = function()
	{
		if(!this.IsRunning)
		{
			return;
		}
		
		var numberOfParticles = this.Particles.length;
		for(var i = 0; i < numberOfParticles; i++)
		{
			var Particle = this.Particles[i];
			Particle.CurrentLength++;
			CreateSpreadAcceleration(Particle.dP, 5);

			Particle.P.Add(Particle.dP);

			var alpha = 1-(Particle.CurrentLength / Particle.MaxLength);
			ctxDeathParticles.globalAlpha = alpha * 0.8;

			var xPos = Math.floor(Particle.P.x / 3);
			var yPos = Math.floor(Particle.P.y / 3);

			ctxDeathParticles.fillStyle = Particle.Color;
			ctxDeathParticles.fillRect(Particle.P.x, Particle.P.y, Particle.SizeX, Particle.SizeY);
		}

		if(this.Particles[1].CurrentLength >= this.Particles[1].MaxLength)
		{
			this.IsRunning = false;
		}
	}
}

function CreateNewAcceleration(acceleration, direction)
{
	switch(direction)
	{
		case variables.directions.Right:
			acceleration.x = Math.floor((Math.random() * 5) + 0) - Math.floor((Math.random() * 2) + 0);
			acceleration.y = Math.floor((Math.random() * 4) + 0) - Math.floor((Math.random() * 4) + 0);
			break;
		case variables.directions.Left:
			acceleration.x = -(Math.floor((Math.random() * 5) + 0) - Math.floor((Math.random() * 2) + 0));
			acceleration.y = Math.floor((Math.random() * 4) + 0) - Math.floor((Math.random() * 4) + 0);
			break;
		case variables.directions.Up:
			acceleration.x = Math.floor((Math.random() * 4) + 0) - Math.floor((Math.random() * 4) + 0);
			acceleration.y = -(Math.floor((Math.random() * 5) + 0) - Math.floor((Math.random() * 2) + 0));
			break;
		case variables.directions.Down:
			acceleration.x = Math.floor((Math.random() * 4) + 0) - Math.floor((Math.random() * 4) + 0);
			acceleration.y = Math.floor((Math.random() * 5) + 0) - Math.floor((Math.random() * 2) + 0);
			break;
	}
}

function CreateSpreadAcceleration(acceleration, speed)
{
	acceleration.x = Math.floor((Math.random() * speed) + 0) - Math.floor((Math.random() * speed) + 0);
	acceleration.y = Math.floor((Math.random() * speed) + 0) - Math.floor((Math.random() * speed) + 0);
}

function particle_system()
{
	this.DeathParticleEmitters = [];
	this.HeadshotEmitters = [];
	this.TargetDestroyedEmitters = [];

	this.DeathParticleEmitters.push(new DeathParticleEmitter(16));
	this.DeathParticleEmitters.push(new DeathParticleEmitter(16));
	this.DeathParticleEmitters.push(new DeathParticleEmitter(16));
	this.DeathParticleEmitters.push(new DeathParticleEmitter(16));
	this.DeathParticleEmitters.push(new DeathParticleEmitter(16));
	this.DeathParticleEmitters.push(new DeathParticleEmitter(16));
	this.HeadshotEmitters.push(new HeadshotEmitter(100));
	this.HeadshotEmitters.push(new HeadshotEmitter(100));
	this.HeadshotEmitters.push(new HeadshotEmitter(100));
	this.HeadshotEmitters.push(new HeadshotEmitter(100));
	this.HeadshotEmitters.push(new HeadshotEmitter(100));
	this.HeadshotEmitters.push(new HeadshotEmitter(100));
	this.HeadshotEmitters.push(new HeadshotEmitter(100));
	this.HeadshotEmitters.push(new HeadshotEmitter(100));
	this.HeadshotEmitters.push(new HeadshotEmitter(100));
	this.HeadshotEmitters.push(new HeadshotEmitter(100));
	this.HeadshotEmitters.push(new HeadshotEmitter(100));
	this.HeadshotEmitters.push(new HeadshotEmitter(100));
	this.HeadshotEmitters.push(new HeadshotEmitter(100));
	this.TargetDestroyedEmitters.push(new TargetDestroyedEmitter(200));
	this.TargetDestroyedEmitters.push(new TargetDestroyedEmitter(200));
	this.TargetDestroyedEmitters.push(new TargetDestroyedEmitter(200));
	this.TargetDestroyedEmitters.push(new TargetDestroyedEmitter(200));

	this.CurrentDPemitter = 0;
	this.SpawnDeathParticleEmitter = function(position, direction)
	{
		this.DeathParticleEmitters[this.CurrentDPemitter].Init(position.x*map_values.TileSize,
															   position.y*map_values.TileSize, 
															   direction);
		this.CurrentDPemitter = (this.CurrentDPemitter + 1) % this.DeathParticleEmitters.length;
	}
	
	this.CurrentHSemitter = 0;
	this.SpawnHeadshotEmitter = function(position)
	{
		this.HeadshotEmitters[this.CurrentHSemitter].Init(position.x*map_values.TileSize,
														  position.y*map_values.TileSize);
		this.CurrentHSemitter = (this.CurrentHSemitter + 1) % this.HeadshotEmitters.length;
	}
	
	this.CurrentTDemitter = 0;
	this.SpawnTargetDestroyedEmitter = function(position)
	{
		this.TargetDestroyedEmitters[this.CurrentTDemitter].Init(position.x*map_values.TileSize,
														  		 position.y*map_values.TileSize);
		this.CurrentTDemitter = (this.CurrentTDemitter + 1) % this.TargetDestroyedEmitters.length;
	}

	this.UpdateAndRender = function()
	{
		var DPemitterAmount = this.DeathParticleEmitters.length; 
		for(var i = 0; i < DPemitterAmount; i++)
		{
			this.DeathParticleEmitters[i].UpdateAndRender();
		}

		var HSemitterAmount = this.HeadshotEmitters.length; 
		for(var i = 0; i < HSemitterAmount; i++)
		{
			this.HeadshotEmitters[i].UpdateAndRender();
		}

		var TDemitterAmount = this.TargetDestroyedEmitters.length; 
		for(var i = 0; i < TDemitterAmount; i++)
		{
			this.TargetDestroyedEmitters[i].UpdateAndRender();
		}
	}
}

