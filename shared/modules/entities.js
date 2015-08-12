var entities = require('./entities.js');

(function (exports) 
{
	exports.Team = function Team(id)
	{
		this.ID = id;
		this.TeamScore = 0;
		this.TeamMember1 = 0;
		this.TeamMember2 = 0;
	};

	exports.collisions = {
		NoCollision: 0,
		Collision: 1,
		HeadCollision: 2,
		WallCollision: 3,
		HoleCollision: 4,
		FlagCollision: 5,
		HeadshotCollision: 6
	};

	exports.HandleWormCollision = function(worm)
	{
		/*if(worm.CollisionType > entities.collisions.NoCollision)
		{
			var numberOfParticles = 0;
			if(worm.CollisionType == entities.collisions.HeadShotCollision)
			{
				numberOfParticles = Math.floor((Math.random() * 35) + 15);
			}
			else
			{
				numberOfParticles = Math.floor((Math.random() * 500) + 300);
			}

			for(var ParticleSpawnIndex = 0;
				ParticleSpawnIndex < numberOfParticles;
				ParticleSpawnIndex++)
			{
				var particle = new DeathParticle();
				particle.P = new V2(worm.HeadPosition.x*TILE_SIZE, worm.HeadPosition.y*TILE_SIZE);
				
				particle.SizeX = 3;
				particle.SizeY = 3;
				
				if(worm.CollisionType == collisions.HEADSHOT_COLLISION)
				{
					particle.Direction = Directions.Spread;
					particle.dP = new V2(9,9);
				}
				else
				{
					particle.Direction = worm.CurrentDirection;	
					particle.dP = new V2(5,5);
				}

				if(worm.CollisionType == collisions.WALL_COLLISION || 
				   worm.CollisionType == collisions.HOLE_COLLISION ||
				   worm.CollisionType == collisions.HEADSHOT_COLLISION)
				{
					particle.Color = '#FFFFFF';
					particle.CheckForColor = true;
				}
				else
				{
					particle.Color = '#000000';
				}

				GameState.DeathParticles.push(particle);
			}

			Kill(worm, true);
			GameState.WormsDiedThisRound.push(worm);
		}	
	}*/

};

}(typeof exports === 'undefined' ? this.entities = {} : exports));