(function (exports) 
{
	exports.grid_2D = function(width, height)
	{
		this.Width = width;
		this.Height = height;
		this.System = [];
		this.GridBuffer = [];
	};

	exports.training_game_mode = {
		CurrentLevel: 1,
		TargetsDeployed: 0,
		TargetsDestroyed: 0,
		Targets: [],

		NewLevel: function(newGame)
		{
			if(newGame)
			{
				this.CurrentLevel = 1;
			}
			else
			{
				this.CurrentLevel++;
			}

			this.TargetsDeployed = 0;
			this.TargetsDestroyed = 0;

			//TODO(Martin): This dont work with my animations..
			//this.Targets = math.ShuffleArray(this.Targets); 

			var amount = this.Targets.length;
			for(var i = 0; i < amount; i++)
			{
				this.Targets[i].IsDestroyed = false;
			}
		}
	};

	exports.target = function()
	{
		ID = 0;
		Position = 0;
		IsDestroyed = false;
		Size = 9;
		Animation = 0;
	};

	exports.flag = function(id, width, height, pos)
	{
		this.ID = id;
		this.Width = width;
		this.Height = height;
		this.Position = pos;
		this.PickedUp = false;
	};

	exports.worm = function(name, keys, playerID,  wormHeadID) 
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