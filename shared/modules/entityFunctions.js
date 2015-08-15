(function (exports) 
{
	exports.InitializeWorm = function(worm, position, 
									  startingDirection, teamID,
									  v2Factory, holeAmount)
	{
		worm.HeadPosition = position;		
		worm.SpawnPoint = v2Factory.CustomVector(position.x, position.y);
		worm.WhiteHolePosition = v2Factory.EmptyVector();
		worm.HolePosition = v2Factory.EmptyVector();
		worm.HolePositions = [];
		worm.Path = [];
		worm.Path.push(worm.HeadPosition);
		
		worm.Alive = true;
		worm.CollisionType = 0;
		worm.CurrentDirection = startingDirection; 

		worm.HoleCount = holeAmount;
		
		worm.WhiteHoleCount = 1;

		worm.JustShotHole = false;
		worm.JustShotWhiteHole = false;

		worm.TeamID = teamID;
	}

	exports.AddKill = function(worm)
	{
		worm.KillCount++;
		worm.TotalKills++;
	}

	exports.ScorePoint = function(worm, value)
	{
		worm.RecentPoints = value;
		worm.Points += value;
	};

	exports.ShootHole = function(worm, directions, holeRange, v2Factory)
	{
		if(worm.HoleCount > 0 && worm.Alive)
		{
			worm.HoleCount--;
			worm.JustShotHole = true;

			switch (worm.CurrentDirection)
			{
				case directions.Left:
					worm.HolePosition.x = worm.HeadPosition.x - holeRange;
					worm.HolePosition.y = worm.HeadPosition.y;
					break;

				case directions.Up:
					worm.HolePosition.x = worm.HeadPosition.x;
					worm.HolePosition.y = worm.HeadPosition.y - holeRange;
					break;

				case directions.Right:
					worm.HolePosition.x = worm.HeadPosition.x + holeRange;
					worm.HolePosition.y = worm.HeadPosition.y;
					break;

				case directions.Down:
					worm.HolePosition.x = worm.HeadPosition.x;
					worm.HolePosition.y = worm.HeadPosition.y + holeRange;
					break;
			}

			var newPosition = v2Factory.CustomVector(worm.HolePosition.x, worm.HolePosition.y)
			worm.HolePositions.push(newPosition);
		}
	};

	exports.ShootWhiteHole = function(worm, directions, map_values)
	{
		if(worm.WhiteHoleCount > 0 && worm.Alive)
		{
			worm.JustShotWhiteHole = true;
			worm.WhiteHoleCount--;

			switch (worm.CurrentDirection) 
			{
				case directions.Left:
					worm.WhiteHolePosition.x = worm.HeadPosition.x - map_values.WhiteHoleSize/2 - 1;
					worm.WhiteHolePosition.y = worm.HeadPosition.y;
					break;

				case directions.Up:
					worm.WhiteHolePosition.x = worm.HeadPosition.x;
					worm.WhiteHolePosition.y = worm.HeadPosition.y - map_values.WhiteHoleSize/2 - 1;
					break;

				case directions.Right:
					worm.WhiteHolePosition.x = worm.HeadPosition.x + map_values.WhiteHoleSize/2 + 2;
					worm.WhiteHolePosition.y = worm.HeadPosition.y;
					break;

				case directions.Down:
					worm.WhiteHolePosition.x = worm.HeadPosition.x;
					worm.WhiteHolePosition.y = worm.HeadPosition.y + map_values.WhiteHoleSize/2 + 2;
					break;
			}
		}
	};

	exports.Kill = function(worm)
	{
		if(worm.Alive)
		{
			worm.CurrentDirection = null;
			worm.Alive = false;
			worm.KillCount = 0;
		}
	};

	exports.Respawn = function(worm, ms, holeCount, v2Factory)
	{
		worm.HoleCount = holeCount;
		worm.WhiteHoleCount = 1;
		worm.HeadPosition = v2Factory.CustomVector(worm.SpawnPoint.x, worm.SpawnPoint.y);
		worm.JustShotHole = false;
		worm.JustShotWhiteHole = false;

		worm.HolePosition.Clear();
		worm.WhiteHolePosition.Clear();
		worm.Path = [worm.HeadPosition];
		worm.HolePositions = [];

		setTimeout(function()
		{
			worm.Alive = true;
			worm.IsRespawning = false;
		}, ms);
	};

	exports.ChangeDirection = function(worm, directions, newDirection)
	{
		if(newDirection == directions.Left && worm.CurrentDirection !== directions.Right)
		{
			worm.CurrentDirection = directions.Left;
		}
		else if(newDirection == directions.Down && worm.CurrentDirection !== directions.Up)
		{
			worm.CurrentDirection = directions.Down;
		}
		else if(newDirection == directions.Right && worm.CurrentDirection !== directions.Left)
		{
			worm.CurrentDirection = directions.Right;
		}
		else if(newDirection == directions.Up && worm.CurrentDirection !== directions.Down)
		{
			worm.CurrentDirection = directions.Up;
		}
	};

	exports.UpdateWormPosition = function(worm, directions, v2Factory)
	{
		if(worm.CurrentDirection == null)
		{
			worm.CurrentDirection = Math.floor((Math.random() * 3) + 0);
		}

		if(worm.CurrentDirection == directions.Left)
		{
			worm.HeadPosition.x--;
			var newPathPosition = v2Factory.CustomVector(worm.HeadPosition.x, worm.HeadPosition.y);
			worm.Path.push(newPathPosition);
		}
		if(worm.CurrentDirection == directions.Up)
		{
			worm.HeadPosition.y--;
			var newPathPosition = v2Factory.CustomVector(worm.HeadPosition.x, worm.HeadPosition.y);
			worm.Path.push(newPathPosition);
		}
		if(worm.CurrentDirection == directions.Right)
		{
			worm.HeadPosition.x++;
			var newPathPosition = v2Factory.CustomVector(worm.HeadPosition.x, worm.HeadPosition.y);
			worm.Path.push(newPathPosition);
		}
		if(worm.CurrentDirection == directions.Down)
		{
			worm.HeadPosition.y++;
			var newPathPosition = v2Factory.CustomVector(worm.HeadPosition.x, worm.HeadPosition.y);
			worm.Path.push(newPathPosition);
		}
	};

}(typeof exports === 'undefined' ? this.entityFunctions = {} : exports));