function InitializeWorm(worm, position, startingDirection, teamID)
{
	worm.HeadPosition = position;
	worm.SpawnPoint = new V2(position.x, position.y);
	worm.WhiteHolePosition = new V2();
	worm.HolePosition = new V2();
	worm.HolePositions = [];
	worm.Path = [];
	worm.Path.push(worm.HeadPosition);
	
	worm.Alive = true;
	worm.CollisionType = 0;
	worm.CurrentDirection = startingDirection; 

	worm.HoleCount = GameState.hole_count.Amount;
	worm.currentHoleAnimation = GameState.hole_count.Amount;
	
	worm.WhiteHoleCount = 1;

	worm.JustShotHole = false;
	worm.JustShotWhiteHole = false;

	worm.deployAnimation.init(worm.HeadPosition, -12);
	worm.deployOutAnimation.init(worm.HeadPosition, -12);
	worm.fullDeployAnimation.init(new V2(0,0), -12);

	worm.TeamID = teamID;
}

function AddKill(worm)
{
	worm.KillCount++;
	worm.TotalKills++;

	switch(worm.KillCount)
	{
		case 1:
			SoundSystem.PlayHeadshotEffect();
			break;
		case 2:
			SoundSystem.PlayDoubleKillEffect();
			break;
		case 3:
			SoundSystem.PlayMultiKillEffect();
			break;
		case 4:
			SoundSystem.PlayMultiKillEffect();
			break;
		case 5:
			SoundSystem.PlayMultiKillEffect();
			break;
		case 6:
			SoundSystem.PlayMultiKillEffect();
			break;
		case 7:
			SoundSystem.PlayMultiKillEffect();
			break;
		case 8:
			SoundSystem.PlayMultiKillEffect();
			break;
	}
}

function ScorePoint(worm, value)
{
	worm.RecentPoints = value;
	worm.Points += value;
}

function ShootHole(worm)
{
	if(worm.HoleCount > 0 && worm.Alive)
	{
		worm.HoleCount--;
		worm.JustShotHole = true;

		switch (worm.CurrentDirection)
		{
			case variables.directions.Left:
				worm.HolePosition.x = worm.HeadPosition.x - map_values.HoleRange;
				worm.HolePosition.y = worm.HeadPosition.y;
				break;

			case variables.directions.Up:
				worm.HolePosition.x = worm.HeadPosition.x;
				worm.HolePosition.y = worm.HeadPosition.y - map_values.HoleRange;
				break;

			case variables.directions.Right:
				worm.HolePosition.x = worm.HeadPosition.x + map_values.HoleRange;
				worm.HolePosition.y = worm.HeadPosition.y;
				break;

			case variables.directions.Down:
				worm.HolePosition.x = worm.HeadPosition.x;
				worm.HolePosition.y = worm.HeadPosition.y + map_values.HoleRange;
				break;
		}

		worm.HolePositions.push(new V2(worm.HolePosition.x, worm.HolePosition.y));
	}
}

function ShootWhiteHole(worm)
{
	if(worm.WhiteHoleCount > 0 && worm.Alive)
	{
		worm.JustShotWhiteHole = true;
		worm.WhiteHoleCount--;

		switch (worm.CurrentDirection) 
		{
			case variables.directions.Left:
				worm.WhiteHolePosition.x = worm.HeadPosition.x - map_values.WhiteHoleSize/2 - 1;
				worm.WhiteHolePosition.y = worm.HeadPosition.y;
				break;

			case variables.directions.Up:
				worm.WhiteHolePosition.x = worm.HeadPosition.x;
				worm.WhiteHolePosition.y = worm.HeadPosition.y - map_values.WhiteHoleSize/2 - 1;
				break;

			case variables.directions.Right:
				worm.WhiteHolePosition.x = worm.HeadPosition.x + map_values.WhiteHoleSize/2 + 2;
				worm.WhiteHolePosition.y = worm.HeadPosition.y;
				break;

			case variables.directions.Down:
				worm.WhiteHolePosition.x = worm.HeadPosition.x;
				worm.WhiteHolePosition.y = worm.HeadPosition.y + map_values.WhiteHoleSize/2 + 2;
				break;
		}
	}
}

function Kill(worm, playSoundEffect)
{
	if(worm.Alive)
	{
		if(playSoundEffect)
		{
			SoundSystem.PlayCrashEffect();
		}
		
		worm.CurrentDirection = null;
		worm.Alive = false;
		worm.KillCount = 0;
	}
}

function DropFlag(worm)
{
	SoundSystem.PlayDeniedEffect();
	worm.HoldsFlag = 0;
}

function Respawn(worm, ms)
{
	worm.HoleCount = GameState.hole_count.Amount;
	worm.currentHoleAnimation = worm.HoleCount;
	worm.WhiteHoleCount = 1;
	worm.HeadPosition = new V2(worm.SpawnPoint.x, worm.SpawnPoint.y);
	worm.JustShotHole = false;
	worm.JustShotWhiteHole = false;

	worm.HolePosition.Clear();
	worm.WhiteHolePosition.Clear();
	worm.Path = [];
	worm.HolePositions = [];

	setTimeout(function()
	{
		worm.Alive = true;
		worm.IsRespawning = false;
	}, ms);
}

function ChangeDirection(worm, newDirection)
{
	if(newDirection == variables.directions.Left && worm.CurrentDirection !== variables.directions.Right)
	{
		worm.CurrentDirection = variables.directions.Left;
	}
	else if(newDirection == variables.directions.Down && worm.CurrentDirection !== variables.directions.Up)
	{
		worm.CurrentDirection = variables.directions.Down;
	}
	else if(newDirection == variables.directions.Right && worm.CurrentDirection !== variables.directions.Left)
	{
		worm.CurrentDirection = variables.directions.Right;
	}
	else if(newDirection == variables.directions.Up && worm.CurrentDirection !== variables.directions.Down)
	{
		worm.CurrentDirection = variables.directions.Up;
	}
}

function UpdateWormPosition(worm)
{
	if(worm.CurrentDirection == null)
	{
		worm.CurrentDirection = Math.floor((Math.random() * 3) + 0);
	}

	if(worm.CurrentDirection == variables.directions.Left)
	{
		worm.HeadPosition.x--;
		worm.Path.push(new V2(worm.HeadPosition.x, worm.HeadPosition.y));
	}
	if(worm.CurrentDirection == variables.directions.Up)
	{
		worm.HeadPosition.y--;
		worm.Path.push(new V2(worm.HeadPosition.x, worm.HeadPosition.y));
	}
	if(worm.CurrentDirection == variables.directions.Right)
	{
		worm.HeadPosition.x++;
		worm.Path.push(new V2(worm.HeadPosition.x, worm.HeadPosition.y));
	}
	if(worm.CurrentDirection == variables.directions.Down)
	{
		worm.HeadPosition.y++;
		worm.Path.push(new V2(worm.HeadPosition.x, worm.HeadPosition.y));
	}
}