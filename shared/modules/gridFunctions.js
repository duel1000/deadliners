/*var variables = require('./variables.js');
var map_values = variables.map_values;
var entities = require('./entities.js');
var entityFunctions = require('./entityFunctions.js');
var math = require('./math.js');*/

(function (exports) 
{
	exports.Create2DGrid = function(width, height, initValue)
	{
		var grid = [];
		for (var x = 0; x < width; x++) 
		{
			grid.push([]);
			for (var y = 0; y < height; y++)
			{
				grid[x].push(initValue);
			}	
		}
		return(grid);
	};

	//TODO(Martin): Could be a V2
	function InsideGrid(x, y)
	{
		if(x < map_values.ColumnNumber && 
		   x > 0 && 
		   y < map_values.RowNumber && 
		   y > 0)	
		{
			return(true);
		}
		else
		{
			return(false);
		}
	}

	exports.SetGridValue = function(value, x, y)
	{
		if(InsideGrid(x,y)) 	{ GameState.Grid[x][y] = value; }
	}

	exports.GetGridValue = function(x, y)
	{
		if(InsideGrid(x,y)) { return(GameState.Grid[x][y]); }
	}

	//TODO(Martin): Hardcoded flag size
	exports.SetFlagOntoGrid = function(flagnumber)
	{
		if(flagnumber == map_values.Flag1)
		{
			for(var x = 0; x < map_values.FlagSize; x++)
			{
				for(var y = 0; y < map_values.FlagSize; y++)
				{
					GameState.Grid[map_values.Flag1Position[0]+x-2][map_values.Flag1Position[1]+y-2] = map_values.Flag1;	
				}
			}
		}
		else if(flagnumber == FLAG2)
		{
			for(var x = 0; x < map_values.FlagSize; x++)
			{
				for(var y = 0; y < map_values.FlagSize; y++)
				{
					GameState.Grid[FLAG_2_POSITION[0]+x-2][FLAG_2_POSITION[1]+y-2] = FLAG2;	
				}
			}
		}
	}

	exports.RemoveFlagFromGrid = function(flagnumber)
	{
		var flagPosition = flagnumber == map_values.Flag1 ? map_values.Flag1Position : map_values.Flag2Position;

		for(var x = 0; x < map_values.FlagSize; x++)
		{
			for(var y = 0; y < map_values.FlagSize; y++)
			{
				GameState.Grid[flagPosition[0]+x-2][flagPosition[1]+y-2] = map_values.RemoveFlag;	
			}
		}
	}

	exports.RemoveWormPathFromGrid = function(worm)
	{
		var positions = worm.Path;
		var length = positions.length;

		for(var i = 0; i < length; i++)
		{
			GameState.Grid[positions[i].x][positions[i].y] = map_values.RemoveWorm;
		}
	}

	exports.RemoveWormHolesFromGrid = function(holePositions)
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
					if((x < map_values.ColumnNumber && x > 0) && GameState.Grid[x][y] == map_values.DrawnHole)
					{
						GameState.Grid[x][y] = map_values.RemoveHole;	
					}
				}
			}	
		}
	}

	//TODO(Martin): Hardcoded values.
	exports.ClearSpawnpointFromGrid = function(position)
	{
		for (var x = position.x - 4; x < position.x + 5; x++) 
		{
			for (var y = position.y - 4; y < position.y + 5; y++) 
			{
				GameState.Grid[x][y] = map_values.ClearAll;	
			}
		}	
	}

	//TODO(Martin): Pattern problems + it does a lot different stuff
	exports.SetHoleInGrid = function(worm)
	{
		var centerpoint = worm.HolePosition;

		if(GameState.GameMode == game_modes.FreeForAll || GameState.GameMode == game_modes.TwoOnTwo)
		{
			for (var x = 0; x < map_values.HoleSize; x++) 
			{
				for (var y = 0; y < map_values.HoleSize; y++) 
				{
					var leftSideOfHolePosition = Math.round(centerpoint.x + x - (map_values.HoleSize/2));
					var topSideOfHolePosition = Math.round(centerpoint.y + y - (map_values.HoleSize/2));

					if(InsideGrid(leftSideOfHolePosition, topSideOfHolePosition))
					{
						var gridValue = GameState.Grid[leftSideOfHolePosition][topSideOfHolePosition];
						
						for(var i = 0; i < GameState.NumberOfWorms; i++)
						{
							if(gridValue == GameState.Worms[i].HeadID)
							{
								entityFunctions.AddKill(worm);
								GameState.Worms[i].CollisionType = entities.collisions.HeadShotCollision;
								entityFunctions.HandleWormCollision(GameState.Worms[i]);
							}
						}

						GameState.Grid[leftSideOfHolePosition][topSideOfHolePosition] = map_values.Hole;
					}
				}
			}	
		}
		else if(GameState.GameMode == game_modes.CaptureTheFlag)
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
		}
	}

	//TODO(Martin): Game_MODE pattern problems.
	exports.SetWhiteHoleInGrid = function(centerpoint)
	{	

		if(GameState.GameMode == game_modes.FREE_FOR_ALL || GameState.GameMode == game_modes.TWO_ON_TWO)
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
		{
			for (var x=0; x<WHITE_HOLE_SIZE; x++) 
			{
				for (var y=0; y<WHITE_HOLE_SIZE; y++) 
				{
					var leftSideOfHolePosition = Math.round(centerpoint.x+x-WHITE_HOLE_SIZE/2);
					var topSideOfHolePosition =  Math.round(centerpoint.y+y-WHITE_HOLE_SIZE/2);

					if(InsideGrid(leftSideOfHolePosition, topSideOfHolePosition))
					{
						var value = GetGridValue(leftSideOfHolePosition, topSideOfHolePosition); 
						
						if(value != STATIC_WALL_DRAWN && 
						   value != FLAG1 && 
						   value != FLAG2) 
						{
							GameState.Grid[leftSideOfHolePosition][topSideOfHolePosition] = WHITE_HOLE;
						}
					}
				}
			}
		}
	}

	exports.MakeStartingPositions = function(amount)
	{
		var result = [];

		//TODO(Martin): This is written as a TWO_ON_TWO mode cheat. 
		if(GameState.GameMode == variables.game_modes.TwoOnTwo)
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
		}

		//TODO(martin): refactor this to constants so we can adjust them globally
		var edgeDistance = 20 + 40; // TODO(Martin): This is Map Threshold
		var middleDistance = 40;
		var Xmax = variables.ColumnNumber;
		var Ymax = variables.RowNumber;

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

		if(amount >= 1)	
		{ 
			result[0] = new math.V2(xCor, yCor); 
		}
		if(amount >= 2)
		{	
			result[1] = new math.V2(Xmax - xCor, Ymax - yCor);
		}
		if(amount >= 3)
		{
			//TODO(martin): Needs its own algorithm for 3 player
			result[2] = new math.V2(Xmax - yCor, xCor); 
		}
		if(amount == 4)
		{
			result[3] = new math.V2(yCor, Ymax - xCor);
		}

		return(result);
	}

	//TODO(Martin): This loooks bad.
	exports.SetWormCollision = function(worm)
	{
		var xPos = worm.HeadPosition.x;
		var yPos = worm.HeadPosition.y;

		//TODO(Martin): This works with modules? Maybe use 'this.'
		var gridValue = GetGridValue(xPos, yPos); 

		if(gridValue == map_values.Worm1Head || 
		   gridValue == map_values.Worm2Head || 
		   gridValue == map_values.Worm3Head || 
		   gridValue == map_values.Worm4Head)
		{
			worm.CollisionType = entities.collisions.HeadCollision;	

			for(var i = 0; i < GameState.NumberOfWorms; i++)
			{
				if(gridValue == GameState.Worms[i].HeadID && GameState.Worms[i].Alive)
				{
					GameState.Worms[i].CollisionType = entities.collisions.HeadCollision;
					entities.HandleWormCollision(GameState.Worms[i]);
				} 
			}
		}
		else if(gridValue == map_values.DrawnWall)
		{	
			worm.Path.pop();
			worm.CollisionType = entities.collisions.WALL_COLLISION;
		}
		else if(gridValue == map_values.DrawnHole)
		{	
			worm.Path.pop();
			worm.CollisionType = entities.collisions.HOLE_COLLISION;	
		}
		else if(GameState.GameMode == variables.game_modes.CaptureTheFlag && 
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
		}
		else if(gridValue > 0)
		{
			worm.Path.pop();
			worm.CollisionType = entities.collisions.Collision;	
		}
		else
		{
			worm.CollisionType = entities.collisions.NoCollision;
		}
	}

	exports.SetWallsInGrid = function()
	{
		for(var x = 0; x < map_values.ColumnNumber; x++)
		{
			for(var y=0; y < map_values.RowNumber; y++)
			{
				if((y < map_values.MapThreshold) || (y > map_values.RowNumber - map_values.MapThreshold) || 
				   (x < map_values.MapThreshold) || (x > map_values.ColumnNumber - map_values.MapThreshold))
				{
					this.SetGridValue(WALL, x, y);
				}

				GameState.Grid[1][y] = map_values.StaticWall;
				GameState.Grid[map_values.ColumnNumber-1][y] = map_values.StaticWall;
			}
			GameState.Grid[x][1] = map_values.StaticWall;
			GameState.Grid[x][map_values.RowNumber-1] = map_values.StaticWall;
		}
	}
}(typeof exports === 'undefined' ? this.gridFunctions = {} : exports));