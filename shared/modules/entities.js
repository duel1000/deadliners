(function (exports) 
{
	exports.grid_2D = function(width, height)
	{
		this.Width = width;
		this.Height = height;
		this.System = [];
		this.GridBuffer = [];
	};

	exports.flag = function(id, width, height, pos)
	{
		this.ID = id;
		this.Width = width;
		this.Height = height;
		this.Position = pos;
		this.PickedUp = false;
	};

	exports.worm = function(name, keys, playerID, 
							holeAnimations, deployAnimation, deployOutAnimation, 
							fullDeployAnimation,  wormHeadID) 
	{
		this.Name = name;
		this.Keys = keys;
		this.HeadID = wormHeadID;
		this.PlayerID = playerID;
		this.TeamID = null;
		
		this.Alive = true;
		this.HeadPosition = null;
		this.CollisionType = null;
		
		this.HoleCount = null;
		this.WhiteHoleCount = null;
		this.JustShotHole = null;
		this.JustShotWhiteHole = null;
		this.HolePosition = null;
		this.HolePositions = null;
		this.WhiteHolePosition = null;
		
		this.CurrentDirection = null;
		this.Path = [this.HeadPosition];
		this.HoldsFlag = 0
		this.SpawnPoint = null;
		this.IsRespawning = false;

		this.RecentPoints = 0;
		this.Points = 0;
		
		this.KillCount = 0;
		this.TotalKills = 0;

		//TODO(Martin): Refactor this into some kind of animation object.
		this.deployAnimation = deployAnimation;
		this.deployOutAnimation = deployOutAnimation;
		this.fullDeployAnimation = fullDeployAnimation;
		this.holeAnimations = holeAnimations;
		this.currentHoleAnimation = null;

		this.getHoleAnimation = function()
		{
			if(this.currentHoleAnimation > 0)
			{
				var result = this.holeAnimations[this.currentHoleAnimation-1];
				this.currentHoleAnimation--;

				return(result);
			}
		};
	};

	exports.DeathParticle = function()
	{
		this.P = null;
		this.dP = null;
		this.Color = null;
		this.Direction = null;
		this.MaxLength = 30;
		this.CurrentLength = 0;
		this.CheckForColor = false;
		this.SizeX = 1;
		this.SizeY = 1;
	};

	exports.team = function(id)
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

}(typeof exports === 'undefined' ? this.entities = {} : exports));