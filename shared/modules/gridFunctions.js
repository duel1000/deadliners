/*var variables = require('./variables.js');
var map_values = variables.map_values;
var entities = require('./entities.js');
var entityFunctions = require('./entityFunctions.js');
var math = require('./math.js');*/

(function (exports) 
{
	exports.Initiate2Dgrid = function(grid, emptyValue)
	{
		for (var x = 0; x < grid.Width; x++) 
		{
			grid.System.push([]);
			for (var y = 0; y < grid.Height; y++)
			{
				grid.System[x].push(emptyValue);
			}
		}
	};

	//TODO(Martin): Could be a V2
	function InsideGrid(grid, x, y)
	{
		if(x < grid.Width && 
		   x > 0 && 
		   y < grid.Height && 
		   y > 0)	
		{
			return(true);
		}
		else
		{
			return(false);
		}
	}

	exports.SetGridValue = function(grid, value, x, y)
	{
		if(InsideGrid(grid, x, y)) { grid.System[x][y] = value; }
	}

	exports.GetGridValue = function(grid, x, y)
	{
		if(InsideGrid(grid, x, y)) { return(grid.System[x][y]); }
	}

	//TODO(Martin): Hardcoded flag size and should be vectors
	exports.SetFlagOntoGrid = function(flag, gridSystem)
	{
		for(var x = 0; x < flag.Width; x++)
		{
			for(var y = 0; y < flag.Height; y++)
			{
				gridSystem[flag.Position[0] + x-2][flag.Position[1] + y-2] = flag.ID;	
			}
		}
	}

	exports.RemoveFlagFromGrid = function(flag, gridSystem, removeFlagValue)
	{
		for(var x = 0; x < flag.Width; x++)
		{
			for(var y = 0; y < flag.Height; y++)
			{
				gridSystem[flag.Position[0]+x-2][flag.Position[1]+y-2] = removeFlagValue;	
			}
		}
	}

	exports.RemoveWormPathFromGrid = function(wormPath, gridSystem, removeWormValue)
	{
		for(var i = 0; i < wormPath.length; i++)
		{
			gridSystem[wormPath[i].x][wormPath[i].y] = removeWormValue;
		}
	}

	//TODO(Martin): This function should not need the holesize
	exports.RemoveWormHolesFromGrid = function(holePositions, grid, map_values)
	{
		for(var i = 0; i < holePositions.length; i++)
		{
			var leftSide = Math.floor(holePositions[i].x - map_values.HoleSize/2);
			var rightSide = Math.round(holePositions[i].x + map_values.HoleSize/2);
			
			for (var x = leftSide; x < rightSide; x++) 
			{
				var upperSide = Math.floor(holePositions[i].y - map_values.HoleSize/2);
				var lowerSide = Math.round(holePositions[i].y + map_values.HoleSize/2);
				
				for (var y = upperSide; y < lowerSide; y++) 
				{
					//TODO(Martin): This does not account for if a shot is shot on top of another shot.
					//it can probably be solved by creating shot values per player.
					if((x < grid.Width && x > 0) && grid.System[x][y] == map_values.DrawnHole)
					{
						grid.System[x][y] = map_values.RemoveHole;	
					}
				}
			}	
		}
	}

	//TODO(Martin): Hardcoded values.
	exports.ClearSpawnpointFromGrid = function(spawnPoint, gridSystem, clearAllValue)
	{
		for (var x = spawnPoint.x - 4; x < spawnPoint.x + 5; x++) 
		{
			for (var y = spawnPoint.y - 4; y < spawnPoint.y + 5; y++) 
			{
				gridSystem[x][y] = clearAllValue;	
			}
		}	
	}

	//TODO(Martin): Pattern problems + it does a lot different stuff
	exports.SetHoleInGrid = function(worm, grid, map_values)
	{
		var centerpoint = worm.HolePosition;

		//if(GameState.GameMode == game_modes.FreeForAll || GameState.GameMode == game_modes.TwoOnTwo)
		//{
			for(var x = 0; x < map_values.HoleSize; x++) 
			{
				for (var y = 0; y < map_values.HoleSize; y++) 
				{
					var leftSideOfHolePosition = Math.round(centerpoint.x + x - (map_values.HoleSize/2));
					var topSideOfHolePosition = Math.round(centerpoint.y + y - (map_values.HoleSize/2));

					if(InsideGrid(grid, leftSideOfHolePosition, topSideOfHolePosition))
					{
						var gridValue = grid.System[leftSideOfHolePosition][topSideOfHolePosition];
						
						//TODO(Martin): Put elsewhere?
						/*for(var i = 0; i < GameState.NumberOfWorms; i++)
						{
							if(gridValue == GameState.Worms[i].HeadID)
							{
								entityFunctions.AddKill(worm);
								GameState.Worms[i].CollisionType = entities.collisions.HeadShotCollision;
								entityFunctions.HandleWormCollision(GameState.Worms[i]);
							}
						}*/

						grid.System[leftSideOfHolePosition][topSideOfHolePosition] = map_values.Hole;
					}
				}
			}	
		//}
		/*else if(GameState.GameMode == game_modes.CaptureTheFlag)
		{
			for (var x=0; x<map_values.HoleSize; x++) 
			{
				for (var y=0; y<map_values.HoleSize; y++) 
				{
					var leftSideOfHolePosition = Math.round(centerpoint.x + x - (map_values.HoleSize/2));
					var topSideOfHolePosition = Math.round(centerpoint.y + y - (map_values.HoleSize/2));

					if(InsideGrid(leftSideOfHolePosition, topSideOfHolePosition))
					{
						var gridValue = GameState.Grid[leftSideOfHolePosition][topSideOfHolePosition];
						
						if(gridValue != map_values.Flag1 && 
						   gridValue != map_values.Flag2)
						{
							GameState.Grid[leftSideOfHolePosition][topSideOfHolePosition] = map_values.Hole;
						}

						for(var i = 0; i < GameState.NumberOfWorms; i++)
						{
							if(gridValue == GameState.Worms[i].HeadID)
							{
								entityFunctions.AddKill(worm);
								GameState.Worms[i].CollisionType = entities.collisions.HeadShotCollision;
								entityFunctions.HandleWormCollision(GameState.Worms[i]);
							}
						}
					}
				}
			}
		}*/
	}

	//TODO(Martin): Game_MODE pattern problems.
	exports.SetWhiteHoleInGrid = function(centerpoint, grid, map_values)
	{	
		/*if(GameState.GameMode == game_modes.FreeForAll || GameState.GameMode == game_modes.TwoOnTwo)
		{
			for (var x=0; x<WHITE_HOLE_SIZE; x++) 
			{
				for (var y=0; y<WHITE_HOLE_SIZE; y++) 
				{
					var leftSideOfHolePosition = Math.round(centerpoint.x+x-WHITE_HOLE_SIZE/2);
					var topSideOfHolePosition = Math.round(centerpoint.y+y-WHITE_HOLE_SIZE/2);

					if(InsideGrid(leftSideOfHolePosition, topSideOfHolePosition))
					{
						if(GameState.Grid[leftSideOfHolePosition][topSideOfHolePosition] != STATIC_WALL_DRAWN)
						{
							GameState.Grid[leftSideOfHolePosition][topSideOfHolePosition] = WHITE_HOLE;
						}
					}
				}
			}
		}
		else if(GameState.GameMode == game_modes.CAPTURE_THE_FLAG)
		{*/
			for (var x=0; x < map_values.WhiteHoleSize; x++) 
			{
				for (var y=0; y < map_values.WhiteHoleSize; y++) 
				{
					var leftSideOfHolePosition = Math.round(centerpoint.x+x-map_values.WhiteHoleSize/2);
					var topSideOfHolePosition =  Math.round(centerpoint.y+y-map_values.WhiteHoleSize/2);

					if(InsideGrid(grid, leftSideOfHolePosition, topSideOfHolePosition))
					{
						var value = grid.System[leftSideOfHolePosition][topSideOfHolePosition]; 
						
						if(value != map_values.StaticWallDrawn && 
						   value != map_values.Flag1 && 
						   value != map_values.Flag2) 
						{
							grid.System[leftSideOfHolePosition][topSideOfHolePosition] = map_values.WhiteHole;
						}
					}
				}
			}
		//}
	}

	exports.MakeStartingPositions = function(vectorGroup, grid)
	{
		var result = vectorGroup;
		//TODO(Martin): This is written as a TWO_ON_TWO mode cheat. 
		/*if(GameState.GameMode == variables.game_modes.TwoOnTwo)
		{
			result[0] = new math.V2(60, (variables.RowNumber/2) + 10);
			result[1] = new math.V2(60, (variables.RowNumber/2) - 10);
			result[2] = new math.V2(variables.ColumnNumber - 60, (variables.RowNumber/2) + 10);
			result[3] = new math.V2(variables.ColumnNumber - 60, (variables.RowNumber/2) - 10);
			return(result);
		}
		else if(GameState.GameMode == variables.game_modes.CaptureTheFlag)
		{
			result[0] = new math.V2(60, (variables.RowNumber/2) + 30);
			result[1] = new math.V2(60, (variables.RowNumber/2) - 30);
			result[2] = new math.V2(variables.ColumnNumber - 60, (variables.RowNumber/2) + 30);
			result[3] = new math.V2(variables.ColumnNumber - 60, (variables.RowNumber/2) - 30);
			return(result);
		}*/

		//TODO(martin): refactor this to constants so we can adjust them globally
		var edgeDistance = 20 + 40; // TODO(Martin): This is Map Threshold
		var middleDistance = 40;
		var Xmax = grid.Width;
		var Ymax = grid.Height;

		var xCor = Math.floor((Math.random() * (Xmax-2*edgeDistance)) + edgeDistance);
		var yCor = 0;

		if(xCor < (Xmax/2 - middleDistance))
		{
			yCor = Math.floor((Math.random() * (Ymax - 2*edgeDistance)) + edgeDistance);
		}		
		else if(xCor > (Xmax/2 + middleDistance))
		{
			yCor = Math.floor((Math.random() * (Ymax - 2*edgeDistance)) + edgeDistance); 
		}
		else
		{
			if(Math.floor((Math.random() * 2) + 1) == 2)
			{
				yCor = Math.floor((Math.random() * (Ymax/2 - middleDistance - edgeDistance)) + edgeDistance); 
			}
			else
			{
				yCor = Math.floor((Math.random() * (Ymax - edgeDistance - (Ymax/2 + middleDistance))) + (Ymax/2 + middleDistance));
			}
		}

		vectorGroup[0].x = xCor;
		vectorGroup[0].y = yCor; 

		vectorGroup[1].x = Xmax - xCor;
		vectorGroup[1].y = Ymax - yCor; 

		vectorGroup[2].x = Xmax - yCor;
		vectorGroup[2].y = xCor; 

		vectorGroup[3].x = yCor;
		vectorGroup[3].y = Ymax - xCor; 

		return(vectorGroup);
	}

	//TODO(Martin): This loooks bad.
	exports.SetWormCollision = function(worm, grid, map_values, collisions)
	{
		var xPos = worm.HeadPosition.x;
		var yPos = worm.HeadPosition.y;

		//TODO(Martin): This works with modules? Maybe use 'this.'
		var gridValue = this.GetGridValue(grid, xPos, yPos); 

		//TODO(Martin): This is a seperation of concerns problem that sucks.
		/*if(gridValue == map_values.Worm1Head || 
		   gridValue == map_values.Worm2Head || 
		   gridValue == map_values.Worm3Head || 
		   gridValue == map_values.Worm4Head)
		{
			worm.CollisionType = collisions.HeadCollision;	

			for(var i = 0; i < GameState.NumberOfWorms; i++)
			{
				if(gridValue == GameState.Worms[i].HeadID && GameState.Worms[i].Alive)
				{
					GameState.Worms[i].CollisionType = collisions.HeadCollision;
					entities.HandleWormCollision(GameState.Worms[i]);
				} 
			}
		}*/
		
		if(gridValue == map_values.DrawnWall)
		{	
			worm.Path.pop();
			worm.CollisionType = collisions.WallCollision;
		}
		else if(gridValue == map_values.DrawnHole)
		{	
			worm.Path.pop();
			worm.CollisionType = collisions.HoleCollision;	
		}
		/*else if(GameState.GameMode == variables.game_modes.CaptureTheFlag && 
			   (gridValue == map_values.Flag1 || gridValue == map_values.Flag2))
		{	
			worm.Path.pop();
			if(gridValue == map_values.Flag1 && worm.TeamID == map_values.Team2ID)
			{
				worm.HoldsFlag = map_values.Flag1;
				RemoveFlagFromGrid(map_values.Flag1);
				SoundSystem.PlayFlagEffect();
			}
			else if(gridValue == map_values.Flag2 && worm.TeamID == map_values.Team1ID)
			{
				worm.HoldsFlag = map_values.Flag2;
				RemoveFlagFromGrid(map_values.Flag2);
				SoundSystem.PlayFlagEffect();
			}
			else if(gridValue == map_values.Flag1 && worm.TeamID == map_values.Team1ID && worm.HoldsFlag > 0)
			{
				GameState.RoundWinningTeam = map_values.Team1ID;
				worm.HoldsFlag = 0;
				SoundSystem.PlayFlagEffect();
			}
			else if(gridValue == map_values.Flag2 && worm.TeamID == map_values.Team2ID && worm.HoldsFlag > 0)
			{
				GameState.RoundWinningTeam = map_values.Team2ID;
				worm.HoldsFlag = 0;
				SoundSystem.PlayFlagEffect();
			}
			else
			{	
				worm.CollisionType = entities.collisions.FlagCollision;
			}
		}*/
		else if(gridValue > 0)
		{
			worm.Path.pop();
			worm.CollisionType = collisions.Collision;	
		}
		else
		{
			worm.CollisionType = collisions.NoCollision;
		}
	}

	exports.SetWallsInGrid = function(grid, map_values)
	{
		for(var x = 0; x < grid.Width; x++)
		{
			for(var y=0; y < grid.Height; y++)
			{
				if((y < map_values.MapThreshold) || (y > grid.Height - map_values.MapThreshold) || 
				   (x < map_values.MapThreshold) || (x > grid.Width - map_values.MapThreshold))
				{
					this.SetGridValue(grid, map_values.Wall, x, y);
				}

				grid.System[1][y] = map_values.StaticWall;
				grid.System[grid.Width-1][y] = map_values.StaticWall;
			}
			grid.System[x][1] = map_values.StaticWall;
			grid.System[x][grid.Height-1] = map_values.StaticWall;
		}
	}
}(typeof exports === 'undefined' ? this.gridFunctions = {} : exports));