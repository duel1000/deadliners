function Create2DGrid(width, height)
{
	var grid = [];
	for (var x = 0; x < width; x++) 
	{
		grid.push([]);
		for (var y = 0; y < height; y++)
		{
			grid[x].push(EMPTY);
		}	
	}
	return(grid);
};

//TODO(Martin): Could be a V2
function InsideGrid(x, y)
{
	if(x < COLUMN_NUMBER && 
	   x > 0 && 
	   y < ROW_NUMBER && 
	   y > 0)	
	{
		return(true);
	}
	else
	{
		return(false);
	}
}

function SetGridValue(value, x, y)
{
	if(InsideGrid(x,y)) 	{ GameState.Grid[x][y] = value; }
}

function GetGridValue(x, y)
{
	if(InsideGrid(x,y)) { return(GameState.Grid[x][y]); }
}

//TODO(Martin): Hardcoded flag size
function SetFlagOntoGrid(flagnumber)
{
	if(flagnumber == FLAG1)
	{
		for(var x = 0; x < FLAG_SIZE; x++)
		{
			for(var y = 0; y < FLAG_SIZE; y++)
			{
				GameState.Grid[FLAG_1_POSITION[0]+x-2][FLAG_1_POSITION[1]+y-2] = FLAG1;	
			}
		}
	}
	else if(flagnumber == FLAG2)
	{
		for(var x = 0; x < FLAG_SIZE; x++)
		{
			for(var y = 0; y < FLAG_SIZE; y++)
			{
				GameState.Grid[FLAG_2_POSITION[0]+x-2][FLAG_2_POSITION[1]+y-2] = FLAG2;	
			}
		}
	}
}

function RemoveFlagFromGrid(flagnumber)
{
	var flagPosition = flagnumber == FLAG1 ? FLAG_1_POSITION : FLAG_2_POSITION;

	for(var x = 0; x < FLAG_SIZE; x++)
	{
		for(var y = 0; y < FLAG_SIZE; y++)
		{
			GameState.Grid[flagPosition[0]+x-2][flagPosition[1]+y-2] = REMOVE_FLAG;	
		}
	}
}

function RemoveWormPathFromGrid(worm)
{
	var positions = worm.Path;
	var length = positions.length;

	for(var i = 0; i < length; i++)
	{
		GameState.Grid[positions[i].x][positions[i].y] = REMOVE_WORM;
	}
}

function RemoveWormHolesFromGrid(holePositions)
{
	for(var i = 0; i < holePositions.length; i++)
	{
		var leftSide = Math.floor(holePositions[i].x - HOLE_SIZE/2);
		var rightSide = Math.round(holePositions[i].x + HOLE_SIZE/2);
		
		for (var x = leftSide; x < rightSide; x++) 
		{
			var upperSide = Math.floor(holePositions[i].y - HOLE_SIZE/2);
			var lowerSide = Math.round(holePositions[i].y + HOLE_SIZE/2);
			
			for (var y = upperSide; y < lowerSide; y++) 
			{
				//TODO(Martin): This does not account for if a shot is shot on top of another shot.
				//it can probably be solved by creating shot values per player.
				if((x < COLUMN_NUMBER && x > 0) && GameState.Grid[x][y] == DRAWN_HOLE)
				{
					GameState.Grid[x][y] = REMOVE_HOLE;	
				}
			}
		}	
	}
}

//TODO(Martin): Hardcoded values.
function ClearSpawnpointFromGrid(position)
{
	for (var x = position.x - 4; x < position.x + 5; x++) 
	{
		for (var y = position.y - 4; y < position.y + 5; y++) 
		{
			GameState.Grid[x][y] = CLEAR_ALL;	
		}
	}	
}

//TODO(Martin): Pattern problems + it does a lot different stuff
function SetHoleInGrid(worm)
{
	var centerpoint = worm.HolePosition;

	if(GameState.GameMode == variables.game_modes.FREE_FOR_ALL || GameState.GameMode == variables.game_modes.TWO_ON_TWO)
	{
		for (var x=0; x<HOLE_SIZE; x++) 
		{
			for (var y=0; y<HOLE_SIZE; y++) 
			{
				var leftSideOfHolePosition = Math.round(centerpoint.x + x - (HOLE_SIZE/2));
				var topSideOfHolePosition = Math.round(centerpoint.y + y - (HOLE_SIZE/2));

				if(InsideGrid(leftSideOfHolePosition, topSideOfHolePosition))
				{
					var gridValue = GameState.Grid[leftSideOfHolePosition][topSideOfHolePosition];
					
					for(var i = 0; i < GameState.NumberOfWorms; i++)
					{
						if(gridValue == GameState.Worms[i].HeadID)
						{
							AddKill(worm);
							GameState.Worms[i].CollisionType = collisions.HEADSHOT_COLLISION;
							HandleWormCollision(GameState.Worms[i]);
						}
					}

					GameState.Grid[leftSideOfHolePosition][topSideOfHolePosition] = HOLE;
				}
			}
		}	
	}
	else if(GameState.GameMode == variables.game_modes.CAPTURE_THE_FLAG)
	{
		for (var x=0; x<HOLE_SIZE; x++) 
		{
			for (var y=0; y<HOLE_SIZE; y++) 
			{
				var leftSideOfHolePosition = Math.round(centerpoint.x + x - (HOLE_SIZE/2));
				var topSideOfHolePosition = Math.round(centerpoint.y + y - (HOLE_SIZE/2));

				if(InsideGrid(leftSideOfHolePosition, topSideOfHolePosition))
				{
					var gridValue = GameState.Grid[leftSideOfHolePosition][topSideOfHolePosition];
					
					if(gridValue != FLAG1 && 
					   gridValue != FLAG2)
					{
						GameState.Grid[leftSideOfHolePosition][topSideOfHolePosition] = HOLE;
					}

					for(var i = 0; i < GameState.NumberOfWorms; i++)
					{
						if(gridValue == GameState.Worms[i].HeadID)
						{
							AddKill(worm);
							GameState.Worms[i].CollisionType = collisions.HEADSHOT_COLLISION;
							HandleWormCollision(GameState.Worms[i]);
						}
					}
				}
			}
		}
	}
}

//TODO(Martin): Game_MODE pattern problems.
function SetWhiteHoleInGrid(centerpoint)
{	

	if(GameState.GameMode == variables.game_modes.FREE_FOR_ALL || GameState.GameMode == variables.game_modes.TWO_ON_TWO)
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
	else if(GameState.GameMode == variables.game_modes.CAPTURE_THE_FLAG)
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

function MakeStartingPositions(amount)
{
	var result = [];

	//TODO(Martin): This is written as a TWO_ON_TWO mode cheat. 
	if(GameState.GameMode == variables.game_modes.TWO_ON_TWO)
	{
		result[0] = new V2(60, (ROW_NUMBER/2) + 10);
		result[1] = new V2(60, (ROW_NUMBER/2) - 10);
		result[2] = new V2(COLUMN_NUMBER - 60, (ROW_NUMBER/2) + 10);
		result[3] = new V2(COLUMN_NUMBER - 60, (ROW_NUMBER/2) - 10);
		return(result);
	}
	else if(GameState.GameMode == variables.game_modes.CAPTURE_THE_FLAG)
	{
		result[0] = new V2(60, (ROW_NUMBER/2) + 30);
		result[1] = new V2(60, (ROW_NUMBER/2) - 30);
		result[2] = new V2(COLUMN_NUMBER - 60, (ROW_NUMBER/2) + 30);
		result[3] = new V2(COLUMN_NUMBER - 60, (ROW_NUMBER/2) - 30);
		return(result);
	}

	//TODO(martin): refactor this to constants so we can adjust them globally
	var edgeDistance = 20 + MAP_THRESHOLD;
	var middleDistance = 40;
	var Xmax = COLUMN_NUMBER;
	var Ymax = ROW_NUMBER;

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
		result[0] = new V2(xCor, yCor); 
	}
	if(amount >= 2)
	{	
		result[1] = new V2(Xmax - xCor, Ymax - yCor);
	}
	if(amount >= 3)
	{
		//TODO(martin): Needs its own algorithm for 3 player
		result[2] = new V2(Xmax - yCor, xCor); 
	}
	if(amount == 4)
	{
		result[3] = new V2(yCor, Ymax - xCor);
	}

	return(result);
}

//TODO(Martin): This loooks bad.
function SetWormCollision(worm)
{
	var xPos = worm.HeadPosition.x;
	var yPos = worm.HeadPosition.y;
	var gridValue = GetGridValue(xPos, yPos); 

	if(gridValue == WORM1HEAD || gridValue == WORM2HEAD || gridValue == WORM3HEAD || gridValue == WORM4HEAD)
	{
		worm.CollisionType = collisions.HEAD_COLLISION;	

		for(var i = 0; i < GameState.NumberOfWorms; i++)
		{
			if(gridValue == GameState.Worms[i].HeadID && GameState.Worms[i].Alive)
			{
				GameState.Worms[i].CollisionType = collisions.HEAD_COLLISION;
				HandleWormCollision(GameState.Worms[i]);
			} 
		}
	}
	else if(gridValue == DRAWN_WALL)
	{	
		worm.Path.pop();
		worm.CollisionType = collisions.WALL_COLLISION;
	}
	else if(gridValue == DRAWN_HOLE)
	{	
		worm.Path.pop();
		worm.CollisionType = collisions.HOLE_COLLISION;	
	}
	else if(GameState.GameMode == variables.game_modes.CAPTURE_THE_FLAG && (gridValue == FLAG1 || gridValue == FLAG2))
	{	
		worm.Path.pop();
		if(gridValue == FLAG1 && worm.TeamID == TEAM2ID)
		{
			worm.HoldsFlag = FLAG1;
			RemoveFlagFromGrid(FLAG1);
			SoundSystem.PlayFlagEffect();
		}
		else if(gridValue == FLAG2 && worm.TeamID == TEAM1ID)
		{
			worm.HoldsFlag = FLAG2;
			RemoveFlagFromGrid(FLAG2);
			SoundSystem.PlayFlagEffect();
		}
		else if(gridValue == FLAG1 && worm.TeamID == TEAM1ID && worm.HoldsFlag > 0)
		{
			GameState.RoundWinningTeam = TEAM1ID;
			worm.HoldsFlag = 0;
			SoundSystem.PlayFlagEffect();
		}
		else if(gridValue == FLAG2 && worm.TeamID == TEAM2ID && worm.HoldsFlag > 0)
		{
			GameState.RoundWinningTeam = TEAM2ID;
			worm.HoldsFlag = 0;
			SoundSystem.PlayFlagEffect();
		}
		else
		{	
			worm.CollisionType = collisions.FLAG_COLLISION;
		}
	}
	else if(gridValue > 0)
	{
		worm.Path.pop();
		worm.CollisionType = collisions.COLLISION;	
	}
	else
	{
		worm.CollisionType = collisions.NO_COLLISION;
	}
}

function SetWallsInGrid()
{
	for(var x = 0; x < COLUMN_NUMBER; x++)
	{
		for(var y=0; y < ROW_NUMBER; y++)
		{
			if((y < MAP_THRESHOLD) || (y > ROW_NUMBER - MAP_THRESHOLD) || 
			   (x < MAP_THRESHOLD) || (x > COLUMN_NUMBER - MAP_THRESHOLD))
			{
				SetGridValue(WALL, x, y);
			}

			GameState.Grid[1][y] = STATIC_WALL;
			GameState.Grid[COLUMN_NUMBER-1][y] = STATIC_WALL;
		}
		GameState.Grid[x][1] = STATIC_WALL;
		GameState.Grid[x][ROW_NUMBER-1] = STATIC_WALL;
	}
}
