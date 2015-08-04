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
	
	worm.WhiteHoleCount = WHITE_HOLE_AMOUNT;

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
			case Directions.Left:
				worm.HolePosition.x = worm.HeadPosition.x - HOLE_RANGE;
				worm.HolePosition.y = worm.HeadPosition.y;
				break;

			case Directions.Up:
				worm.HolePosition.x = worm.HeadPosition.x;
				worm.HolePosition.y = worm.HeadPosition.y - HOLE_RANGE;
				break;

			case Directions.Right:
				worm.HolePosition.x = worm.HeadPosition.x + HOLE_RANGE;
				worm.HolePosition.y = worm.HeadPosition.y;
				break;

			case Directions.Down:
				worm.HolePosition.x = worm.HeadPosition.x;
				worm.HolePosition.y = worm.HeadPosition.y + HOLE_RANGE;
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
			case Directions.Left:
				worm.WhiteHolePosition.x = worm.HeadPosition.x - WHITE_HOLE_SIZE/2 - 1;
				worm.WhiteHolePosition.y = worm.HeadPosition.y;
				break;

			case Directions.Up:
				worm.WhiteHolePosition.x = worm.HeadPosition.x;
				worm.WhiteHolePosition.y = worm.HeadPosition.y - WHITE_HOLE_SIZE/2 - 1;
				break;

			case Directions.Right:
				worm.WhiteHolePosition.x = worm.HeadPosition.x + WHITE_HOLE_SIZE/2 + 2;
				worm.WhiteHolePosition.y = worm.HeadPosition.y;
				break;

			case Directions.Down:
				worm.WhiteHolePosition.x = worm.HeadPosition.x;
				worm.WhiteHolePosition.y = worm.HeadPosition.y + WHITE_HOLE_SIZE/2 + 2;
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
	worm.WhiteHoleCount = WHITE_HOLE_AMOUNT;
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
	if(newDirection == Directions.Left && worm.CurrentDirection !== Directions.Right)
	{
		worm.CurrentDirection = Directions.Left;
	}
	else if(newDirection == Directions.Down && worm.CurrentDirection !== Directions.Up)
	{
		worm.CurrentDirection = Directions.Down;
	}
	else if(newDirection == Directions.Right && worm.CurrentDirection !== Directions.Left)
	{
		worm.CurrentDirection = Directions.Right;
	}
	else if(newDirection == Directions.Up && worm.CurrentDirection !== Directions.Down)
	{
		worm.CurrentDirection = Directions.Up;
	}
}

function UpdateWormPosition(worm)
{
	if(worm.CurrentDirection == null)
	{
		worm.CurrentDirection = Math.floor((Math.random() * 3) + 0);
	}

	if(worm.CurrentDirection == Directions.Left)
	{
		worm.HeadPosition.x--;
		worm.Path.push(new V2(worm.HeadPosition.x, worm.HeadPosition.y));
	}
	if(worm.CurrentDirection == Directions.Up)
	{
		worm.HeadPosition.y--;
		worm.Path.push(new V2(worm.HeadPosition.x, worm.HeadPosition.y));
	}
	if(worm.CurrentDirection == Directions.Right)
	{
		worm.HeadPosition.x++;
		worm.Path.push(new V2(worm.HeadPosition.x, worm.HeadPosition.y));
	}
	if(worm.CurrentDirection == Directions.Down)
	{
		worm.HeadPosition.y++;
		worm.Path.push(new V2(worm.HeadPosition.x, worm.HeadPosition.y));
	}
}