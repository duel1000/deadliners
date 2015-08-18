(function (exports) 
{
	exports.Initiate2Dgrid = function(grid, emptyValue)
	{
		grid.System = [];
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

	exports.ClearGridBuffer = function(gameState, map_values)
	{
		var GridBuffer = gameState.Grid.GridBuffer;
		var BufferLength = GridBuffer.length;

		for(var i = 0; i < BufferLength; i++)
		{
			var x = GridBuffer[i][0];
			var y = GridBuffer[i][1];
			var value = gameState.Grid.System[x][y];

			if(value == map_values.Worm1Head ||
			   value == map_values.Worm2Head ||
			   value == map_values.Worm3Head ||
			   value == map_values.Worm4Head)
			{
				gameState.Grid.System[x][y] = value-1;
			}
			else if(value == map_values.Worm1Cell ||
					value == map_values.Worm2Cell ||
					value == map_values.Worm3Cell ||
					value == map_values.Worm4Cell)
			{
				gameState.Grid.System[x][y] = value+1;
			}
			else if(value == map_values.Wall)
			{	
				gameState.Grid.System[x][y] = map_values.DrawnWall;
			}
			else if(value == map_values.Hole)
			{
				gameState.Grid.System[x][y] = map_values.DrawnHole;	
			}
			else if(value == map_values.WhiteHole)
			{
				gameState.Grid.System[x][y] = map_values.Empty;	
			}
			else if(value == map_values.StaticWall)
			{
				gameState.Grid.System[x][y] = map_values.StaticWallDrawn;	
			}
			/*else if(value == map_values.Flag1 ||
					value == map_values.Flag2)
			{
				gameState.Grid.System[x][y] = map_values.Empty;	
			}*/
			else if(value < 0)
			{
				gameState.Grid.System[x][y] = map_values.Empty;	
			}
		}

		gameState.Grid.GridBuffer = [];
	};

	exports.SetGridValue = function(grid, value, x, y)
	{
		if(InsideGrid(grid, x, y)) 
		{ 
			grid.System[x][y] = value;
			grid.GridBuffer.push([x,y]); 
		}
	}

	exports.GetGridValue = function(grid, x, y)
	{
		if(InsideGrid(grid, x, y)) { return(grid.System[x][y]); }
	}

	//TODO(Martin): Hardcoded flag size and should be vectors
	exports.SetFlagOntoGrid = function(flag, grid)
	{
		for(var x = 0; x < flag.Width; x++)
		{
			for(var y = 0; y < flag.Height; y++)
			{
				this.SetGridValue(grid, flag.ID, 
								  flag.Position[0] + x-2, 
								  flag.Position[1] + y-2)
			}
		}
	}

	exports.RemoveFlagFromGrid = function(flag, grid, map_values)
	{
		for(var x = 0; x < flag.Width; x++)
		{
			for(var y = 0; y < flag.Height; y++)
			{
				var PosX = flag.Position[0]+x-2;
				var PosY = flag.Position[1]+y-2;
				var GridValue = this.GetGridValue(grid, PosX, PosY); 

				if(GridValue == flag.ID)
				{
					this.SetGridValue(grid, map_values.RemoveFlag, PosX, PosY);
				}
			}
		}
	}

	exports.RemoveWormPathFromGrid = function(wormPath, grid, removeWormValue)
	{
		var PathLengthWithoutHead = wormPath.length-1; 
		for(var i = 0; i < PathLengthWithoutHead; i++)
		{
			var PosX = wormPath[i].x;
			var PosY = wormPath[i].y;

			this.SetGridValue(grid, removeWormValue, PosX, PosY);
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
						this.SetGridValue(grid, map_values.RemoveHole, x, y);
					}
				}
			}	
		}
	}

	//TODO(Martin): Hardcoded values.
	exports.ClearSpawnpointFromGrid = function(spawnPoint, grid, clearAllValue)
	{
		for (var x = spawnPoint.x - 4; x < spawnPoint.x + 5; x++) 
		{
			for (var y = spawnPoint.y - 4; y < spawnPoint.y + 5; y++) 
			{
				this.SetGridValue(grid, clearAllValue, x, y);
			}
		}	
	}

	exports.RemoveTargetFromGrid = function(target, grid, map_values)
	{
		var leftSide = Math.floor(target.Position.x - map_values.TargetSize/2);
		var rightSide = Math.round(target.Position.x + map_values.TargetSize/2);

		for (var x = leftSide; x < rightSide; x++) 
			{
				var upperSide = Math.floor(target.Position.y - map_values.TargetSize/2);
				var lowerSide = Math.round(target.Position.y + map_values.TargetSize/2);
				
				for (var y = upperSide; y < lowerSide; y++) 
				{
					this.SetGridValue(grid, map_values.ClearAll, x, y);
				}
			}	
	};

	exports.SetTargetInGrid = function(target, grid, map_values)
	{
		for (var x = target.Position.x - 4; x < target.Position.x + 5; x++) 
		{
			for (var y = target.Position.y - 4; y < target.Position.y + 5; y++) 
			{
				this.SetGridValue(grid, map_values.Target, x, y);
			}
		}	
	}

	//TODO(Martin): Check all these values.
	exports.CheckForTargetHit = function(holePosition, targets)
	{
		var result = 0;
		var targetAmount = targets.length;
		
		for(var i = 0; i < targetAmount; i++)
		{
			var xDistance = Math.abs(holePosition.x - targets[i].Position.x);

			if(xDistance < 10)
			{
				var yDistance = Math.abs(holePosition.y - targets[i].Position.y);
				if(yDistance < 10)
				{
					result = targets[i];
				}
			}
		}

		return(result);
	};

	//TODO(Martin): Pattern problems + it does a lot different stuff
	exports.SetHoleInGrid = function(worm, grid, map_values)
	{
		var centerpoint = worm.HolePosition;

		for(var x = 0; x < map_values.HoleSize; x++) 
		{
			for (var y = 0; y < map_values.HoleSize; y++) 
			{
				var leftSideOfHolePosition = Math.round(centerpoint.x + x - (map_values.HoleSize/2));
				var topSideOfHolePosition = Math.round(centerpoint.y + y - (map_values.HoleSize/2));

				if(InsideGrid(grid, leftSideOfHolePosition, topSideOfHolePosition))
				{
					var gridValue = grid.System[leftSideOfHolePosition][topSideOfHolePosition];
					
					if(gridValue != map_values.Flag1 && 
					   gridValue != map_values.Flag2)
					{
						//TODO(Martin): Double call to InsideGrid.
						this.SetGridValue(grid, map_values.Hole, leftSideOfHolePosition, topSideOfHolePosition);
					}
				}
			}
		}	
	}

	exports.CheckHeadShotCollision = function(worm, grid, map_values)
	{
		var gridValue = grid.System[worm.HeadPosition.x][worm.HeadPosition.y]; 

		if(gridValue == map_values.Hole)
		{
			return(true);
		}
		else
		{
			return(false);
		}
	}

	exports.SetWhiteHoleInGrid = function(centerpoint, grid, map_values)
	{	
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
						//TODO(Martin): Double call to InsideGrid();
						this.SetGridValue(grid, map_values.WhiteHole, leftSideOfHolePosition, topSideOfHolePosition);
					}
				}
			}
		}
	}

	exports.TOTstartingPositions = function(vectorGroup, grid)
	{
		var result = vectorGroup;

		vectorGroup[0].x = 60;
		vectorGroup[0].y = (grid.Height/2) + 10; 

		vectorGroup[1].x = 60;
		vectorGroup[1].y = (grid.Height/2) - 10; 

		vectorGroup[2].x = grid.Width - 60;
		vectorGroup[2].y = (grid.Height/2) + 10; 

		vectorGroup[3].x = grid.Width - 60;
		vectorGroup[3].y = (grid.Height/2) - 10; 
		
		return(result);
	}

	exports.CTFstartingPositions = function(vectorGroup, grid)
	{
		var result = vectorGroup;

		vectorGroup[0].x = 60;
		vectorGroup[0].y = (grid.Height/2) + 30; 

		vectorGroup[1].x = 60;
		vectorGroup[1].y = (grid.Height/2) - 30; 

		vectorGroup[2].x = grid.Width - 60;
		vectorGroup[2].y = (grid.Height/2) + 30; 

		vectorGroup[3].x = grid.Width - 60;
		vectorGroup[3].y = (grid.Height/2) - 30; 

		return(result);
	}

	exports.FFAstartingPositions = function(vectorGroup, grid)
	{
		var result = vectorGroup;

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
	exports.SetWormCollision = function(worm, grid, map_values, collisions, gameState)
	{
		var xPos = worm.HeadPosition.x;
		var yPos = worm.HeadPosition.y;

		var gridValue = this.GetGridValue(grid, xPos, yPos);

		if(gridValue == map_values.Worm1Head || 
		   gridValue == map_values.Worm2Head || 
		   gridValue == map_values.Worm3Head || 
		   gridValue == map_values.Worm4Head)
		{
			worm.CollisionType = collisions.HeadCollision;	

			for(var i = 0; i < gameState.NumberOfWorms; i++)
			{
				if(gridValue == gameState.Worms[i].HeadID && gameState.Worms[i].Alive)
				{
					gameState.Worms[i].CollisionType = collisions.HeadCollision;
				} 
			}
		}
		
		if(gridValue == map_values.DrawnWall)
		{	
			worm.CollisionType = collisions.WallCollision;
		}
		else if(gridValue == map_values.DrawnHole)
		{	
			worm.CollisionType = collisions.HoleCollision;	
		}
		else if(gameState.GameMode == 3 && 
			   (gridValue == gameState.Flag1.ID || gridValue == gameState.Flag2.ID))
		{	
			if(gridValue == gameState.Flag1.ID && worm.TeamID == map_values.Team2ID)
			{
				worm.HoldsFlag = gameState.Flag1;
				this.RemoveFlagFromGrid(gameState.Flag1, grid, map_values);
				//SoundSystem.PlayFlagEffect();
			}
			else if(gridValue == gameState.Flag2.ID && worm.TeamID == map_values.Team1ID)
			{
				worm.HoldsFlag = gameState.Flag2;
				this.RemoveFlagFromGrid(gameState.Flag2, grid, map_values);
				//SoundSystem.PlayFlagEffect();
			}
			else if(gridValue == gameState.Flag1.ID && worm.TeamID == map_values.Team1ID && worm.HoldsFlag != 0)
			{
				gameState.RoundWinningTeam = map_values.Team1ID;
				worm.HoldsFlag = 0;
				//SoundSystem.PlayFlagEffect();
			}
			else if(gridValue == gameState.Flag2.ID && worm.TeamID == map_values.Team2ID && worm.HoldsFlag != 0)
			{
				gameState.RoundWinningTeam = map_values.Team2ID;
				worm.HoldsFlag = 0;
				//SoundSystem.PlayFlagEffect();
			}
			else
			{	
				worm.CollisionType = collisions.FlagCollision;
			}
		}
		else if(gridValue > 0)
		{
			//worm.Path.pop();
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