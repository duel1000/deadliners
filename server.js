var stitch  = require('stitch');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var uuid = require('node-uuid');
var express = require('express');
var port = process.env.PORT || 3000;
app.use(express.static('shared'));
var fs = require('fs');

app.get('/', function(req, res)
{
	res.sendFile(__dirname + '/index.html');
});

http.listen(port, function()
{
	console.log('listening on *:' + port);
});

//var foo = require('./shared/modules/foo.js');
//console.log(foo.hello.a);

var variables = require('./shared/modules/variables.js');

var
LOW_GAME_SPEED = 1/20,
MEDIUM_GAME_SPEED = 1/30,
HIGH_GAME_SPEED = 1/40,
GAME_SPEED_TEXT = ['low', 'medium', 'high'],
GAME_SPEEDS = [LOW_GAME_SPEED, MEDIUM_GAME_SPEED, HIGH_GAME_SPEED],
CHOSEN_GAME_SPEED = HIGH_GAME_SPEED,

TINY_MAP_SIZE = 90,
SMALL_MAP_SIZE = 110,
MEDIUM_MAP_SIZE = 140,
LARGE_MAP_SIZE = 170,
HUGE_MAP_SIZE = 200,
MAP_SIZES = [TINY_MAP_SIZE, SMALL_MAP_SIZE, MEDIUM_MAP_SIZE, LARGE_MAP_SIZE, HUGE_MAP_SIZE],
MAP_SIZE_TEXT = ['tiny', 'small', 'medium', 'large', 'huge'],
CHOSEN_MAP_SIZE = HUGE_MAP_SIZE;

function hole_count() 
{
	var holeAmounts = [3,6,9];
	var pointer = 1;
	this.Amount = 6;
	this.ShiftAmountForward = function()
	{
		pointer = (pointer + 1) % holeAmounts.length;
		this.Amount = holeAmounts[pointer]; 
	};
}

var LOW_SPECIALSHOT_COUNT = 1,
MEDIUM_SPECIALSHOT_COUNT = 2,
HIGH_SPECIALSHOT_COUNT = 3,
SPECIAL_COUNTS = [LOW_SPECIALSHOT_COUNT, MEDIUM_SPECIALSHOT_COUNT, HIGH_SPECIALSHOT_COUNT],

LOW_VICTORY_POINTS = 11,
MEDIUM_VICTORY_POINTS = 15,
HIGH_VICTORY_POINTS = 21,
VICTORY_VALUES = [LOW_VICTORY_POINTS, MEDIUM_VICTORY_POINTS, HIGH_VICTORY_POINTS],

CHOSEN_VICTORY_POINTS = HIGH_VICTORY_POINTS;

var
TILE_SIZE = 3,

HOLE_RANGE = 50,
HOLE_SIZE = 9,

FLAG_SIZE = 5,

TEAM1ID = 1,
TEAM2ID = 2,

WHITE_HOLE_SIZE = 24,
WHITE_HOLE_RANGE = 4 + WHITE_HOLE_SIZE/2,
WHITE_HOLE_AMOUNT = LOW_SPECIALSHOT_COUNT,

START_COUNTER = 5,

MAP_THRESHOLD = WHITE_HOLE_SIZE/2 + WHITE_HOLE_RANGE,
COLUMN_NUMBER = CHOSEN_MAP_SIZE + MAP_THRESHOLD*2, 
ROW_NUMBER = CHOSEN_MAP_SIZE + MAP_THRESHOLD*2, 

FLAG_1_POSITION = [60, ROW_NUMBER/2],
FLAG_2_POSITION = [COLUMN_NUMBER - 60, ROW_NUMBER/2];

var EMPTY = 0,
WALL = 1,
DRAWN_WALL = 2,
HOLE = 3,
DRAWN_HOLE = 4,
WORM1CELL = 5,
DRAWN_WORM1CELL = 6,
WORM1HEAD = 7,

WORM2CELL = 8,
DRAWN_WORM2CELL = 9,
WORM2HEAD = 10,

WORM3CELL = 11,
DRAWN_WORM3CELL = 12,
WORM3HEAD = 13,

WORM4CELL = 14,
DRAWN_WORM4CELL = 15,
WORM4HEAD = 16,

WHITE_HOLE = -17,
STATIC_WALL = 18,
STATIC_WALL_DRAWN = 19,

FLAG1 = 20,
FLAG2 = 21,
REMOVE_FLAG = 22,
REMOVE_WORM = 23,
REMOVE_HOLE = 24,
CLEAR_ALL = 25;

var Directions = {
	Left: 0,
	Up: 1,
	Right: 2,
	Down: 3,
	Spread: 5
}

var Keys = {
	Left: 0,
	Up: 1,
	Right: 2,
	Down: 3,
	Shot: 4,
	Special: 5
}

var counts = 0;
function GameLoop() 
{
	counts++;
	update()
	io.emit('update', { worms : GameState.Worms });

	setTimeout(function()
	{
		GameLoop();
	}, 30)
}

var GameState = new GameState();
var connected_clients = new ConnectedClients();
GameState.Worms[0] = new worm(GameState.PlayerNames[0],	WORM1HEAD);
GameState.Worms[1] = new worm(GameState.PlayerNames[1],	WORM2HEAD);

function ConnectedClients()
{
	this.Client1 = 0;
	this.Client2 = 0;

	this.ConnectedClientsCount = 0;

	this.AddClient = function(newClient)
	{
		if(this.Client1 == 0)
		{
			this.Client1 = newClient;
			
			newClient.emit('connected', { id : this.Client1.userid });
			this.ConnectedClientsCount++;
		}
		else if(this.Client2 == 0)
		{
			this.Client2 = newClient;
			
			newClient.emit('connected', { id : this.Client2.userid });
			this.ConnectedClientsCount++;
		}
		else
		{
			Log("Over 2 players");
		}

		if(this.ConnectedClientsCount >= 2)
		{
			setTimeout(function()
			{	
				io.emit('init');
				init();
			}, 1000);
		}
	};

	this.RemoveClient = function(ID)
	{
		this.ConnectedClientsCount--;
		switch(ID)
		{
			case this.Client1.userid:
				this.Client1 = 0;
				break;

			case this.Client2.userid:
				this.Client2 = 0;
				break;
		}
	};
}

io.on('connection', function(newClient)
{	
	newClient.userid = uuid.v4();
	
	connected_clients.AddClient(newClient);	
	console.log('\t socket.io:: player ' + newClient.userid + ' connected');
	
	newClient.on('newgame', function()
	{
		setTimeout(function()
		{	
			io.emit('init');
			init();
		}, 1000);
	});

	newClient.on('keypress', function(data)
	{
		if(data.clientid == connected_clients.Client1.userid)
		{
			var direction = 0;
			switch(data.key)
			{
				case Keys.Left:
					direction = Directions.Left;
					break;
				case Keys.Right:
					direction = Directions.Right;
					break;
				case Keys.Up:
					direction = Directions.Up;
					break;
				case Keys.Down:
					direction = Directions.Down;
					break;
				case Keys.Shot:
					break;
				case Keys.Special:
					break;

			}
			ChangeDirection(GameState.Worms[0], direction);
		}
		else if(data.clientid == connected_clients.Client2.userid)
		{
			var direction = 0;
			switch(data.key)
			{
				case Keys.Left:
					direction = Directions.Left;
					break;
				case Keys.Right:
					direction = Directions.Right;
					break;
				case Keys.Up:
					direction = Directions.Up;
					break;
				case Keys.Down:
					direction = Directions.Down;
					break;
				case Keys.Shot:
					break;
				case Keys.Special:
					break;

			}
			ChangeDirection(GameState.Worms[1], direction);
		}
	});

	newClient.on('disconnect', function () 
	{	
		connected_clients.RemoveClient(newClient.userid);
		console.log('\t socket.io:: newClient disconnected ' + newClient.userid );
	});
});

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

function GameState()
{
	this.PlayerNames = ["player1","player2","player3","player4"];
	this.NumberOfWorms = 2;
	this.GameMode = variables.game_modes.FREE_FOR_ALL;
	
	this.StartCounter = START_COUNTER;
	this.GameStarted = false;
	this.GameFinished = false;
	this.StartGameButtonPressed = false;

	this.SecondsCounter = 0;

	this.WormsDiedThisRound = [];
	this.DeadWormsCounter = 0;

	this.CurrentGamePoints = 0;
	this.RoundWinningTeam = 0;
	this.WinnerText = "";

	this.IsRunning = false;

	this.hole_count = new hole_count();

	this.Grid = Create2DGrid(COLUMN_NUMBER, ROW_NUMBER);
	this.Worms = [];

	this.Team1 = new Team(1);
	this.Team2 = new Team(2);

	//Handles for Render()	
	this.SpriteAnimations = [];
	this.DeathParticles = [];
	this.PaintWalls = false;
	this.PaintWhiteCanvasses = false;
	this.DrawWhite = [];
	this.DrawStartCounter = false;
	this.RenderWinnerText = false;

	//TODO(Martin): Handles for Music
}

function init()
{	
	SetWallsInGrid();
	GameState.PaintWhiteCanvasses = true;
	GameState.PaintWalls = true;

	if(GameState.GameMode == variables.game_modes.TWO_ON_TWO || 
             GameState.GameMode == variables.game_modes.CAPTURE_THE_FLAG)
	{
		GameState.Team1.Member1 = GameState.Worms[0];
		GameState.Team1.Member2 = GameState.Worms[1];
		GameState.Team2.Member1 = GameState.Worms[2];
		GameState.Team2.Member2 = GameState.Worms[3];
	}

	GameState.GameStarted = true;

	NewGame();

	if(!GameState.IsRunning)
	{
		GameLoop();
		GameState.IsRunning = true;	
	}
}

function NewGame()
{
	GameState.CurrentGamePoints = 0;
	GameState.DeadWormsCounter = 0;

	//TODO(Martin): This is like a re-init function.
	//GameState.Grid = Create2DGrid(COLUMN_NUMBER, ROW_NUMBER);
	//SetWallsInGrid();
	//GameState.PaintWhiteCanvasses = true;
	//GameState.PaintWalls = true;

	if(GameState.GameMode == variables.game_modes.CAPTURE_THE_FLAG)
	{
		SetFlagOntoGrid(FLAG1);
		SetFlagOntoGrid(FLAG2);
	}

	var startingPositions = MakeStartingPositions(GameState.NumberOfWorms);

	if(GameState.GameMode == variables.game_modes.CAPTURE_THE_FLAG)
	{
		//flag1animation.init(FLAG_1_POSITION[0], FLAG_1_POSITION[1], -6);
		//flag2animation.init(FLAG_2_POSITION[0], FLAG_2_POSITION[1], -6);
	}

	if(GameState.GameMode == variables.game_modes.TWO_ON_TWO || GameState.GameMode == variables.game_modes.CAPTURE_THE_FLAG)
	{
		GameState.RoundWinningTeam = 0;

		for (var i=0; i < GameState.NumberOfWorms; i++) 
		{
			//TODO(martin): This is pretty bad :)
			if(i == 0)
			{
				InitializeWorm(GameState.Worms[i], startingPositions[i], Directions.Down, GameState.Team1.ID);
			}
			else if(i == 1)
			{
				InitializeWorm(GameState.Worms[i], startingPositions[i], Directions.Up, GameState.Team1.ID);
			}
			else if(i == 2)
			{
				InitializeWorm(GameState.Worms[i], startingPositions[i], Directions.Down, GameState.Team2.ID);
			}
			else if(i == 3)
			{
				InitializeWorm(GameState.Worms[i], startingPositions[i], Directions.Up, GameState.Team2.ID);
			}
		}
	}
	else 
	{
		for (var i=0; i<GameState.NumberOfWorms; i++) 
		{
			//TODO(martin): This is pretty bad :)
			if(i == 0)
			{
				InitializeWorm(GameState.Worms[i], startingPositions[i], null, null);
			}
			else if(i == 1)
			{
				InitializeWorm(GameState.Worms[i], startingPositions[i], null, null);
			}
			else if(i == 2)
			{
				InitializeWorm(GameState.Worms[i], startingPositions[i], null, null);
			}
			else if(i == 3)
			{
				InitializeWorm(GameState.Worms[i], startingPositions[i], null, null);
			}
		};
	}

	//TODO(Martin): Should not be WORM1CELL but different heads.
	for(var i = 0; i < GameState.NumberOfWorms; i++)
	{
		SetGridValue(WORM1CELL, GameState.Worms[i].HeadPosition.x, GameState.Worms[i].HeadPosition.y);
	}

	//GameState.GameStarted = false;
}

function update(step)
{

	GameState.SecondsCounter += step;
	
	if(GameState.GameFinished) { return; }
	
	if(GameState.GameStarted)
	{
		GameState.StartGameButtonPressed = false;

		//HandleWormKeyInput(GameState.GameStarted);		


		for(var i = 0; i < GameState.NumberOfWorms; i++)
		{	
			//if(GameState.Worms[i].Alive)
			//{
				UpdateWormPosition(GameState.Worms[i]);
				
				//SetWormCollision(GameState.Worms[i]);
				//HandleWormCollision(GameState.Worms[i]);

				//if(GameState.Worms[i].Alive)
				//{
					SetGridValue(GameState.Worms[i].HeadID, 
							GameState.Worms[i].HeadPosition.x, 
							GameState.Worms[i].HeadPosition.y);
				//}
			//}
		}		

		for(var i = 0; i < GameState.NumberOfWorms; i++)
		{
			if(GameState.Worms[i].Alive)
			{
				if(GameState.Worms[i].JustShotHole)
				{	
					//SoundSystem.PlayShotEffect();
					GameState.Worms[i].JustShotHole = false;
					//var holeAnimation = GameState.Worms[i].getHoleAnimation();  
					//holeAnimation.init(GameState.Worms[i].HolePosition, -13);
					//GameState.SpriteAnimations.push(holeAnimation);

					SetHoleInGrid(GameState.Worms[i]);
				}

				if(GameState.Worms[i].JustShotWhiteHole)
				{	
					//SoundSystem.PlayWhiteShotEffect();
					GameState.Worms[i].JustShotWhiteHole = false;
					SetWhiteHoleInGrid(GameState.Worms[i].WhiteHolePosition);

					//TODO(martin): Should not be -12, but in the middle calculated somehow.
					//var animation = GetWhiteHoleAnimation();
					//animation.init(GameState.Worms[i].WhiteHolePosition, -36);
					//GameState.SpriteAnimations.push(animation);
				}
			}
		}		

		for(var i = 0; i < GameState.WormsDiedThisRound.length; i++)
		{
			GameState.DeadWormsCounter++;
			ScorePoint(GameState.WormsDiedThisRound[i], GameState.CurrentGamePoints);
		}
		GameState.CurrentGamePoints += GameState.WormsDiedThisRound.length;
		GameState.WormsDiedThisRound = [];

		if(GameState.GameMode == variables.game_modes.FREE_FOR_ALL)
		{
			if(GameState.NumberOfWorms > 1 && ((GameState.DeadWormsCounter == GameState.NumberOfWorms - 1) || (GameState.DeadWormsCounter == GameState.NumberOfWorms)))
			{
				GameState.GameStarted = false;

				for(var w = 0; w<GameState.NumberOfWorms; w++)
				{
					if(GameState.Worms[w].Alive)
					{
						Kill(GameState.Worms[w], true);
						GameState.DeadWormsCounter++;
						ScorePoint(GameState.Worms[w], GameState.CurrentGamePoints);
					}
				}

				GameState.Worms.sort(function(a, b) {return b.Points - a.Points });
				//UpdateScoreboard();

				if(GameState.Worms[0].Points >= CHOSEN_VICTORY_POINTS)
				{
					GameState.StartGameButtonPressed = false;
					GameState.GameFinished = true;
					//$('#restartGameButton').show();
					GameState.WinnerText = GameState.Worms[0].Name + ' won the game!';
					GameState.RenderWinnerText = true;
				}		
			}
			else if(GameState.NumberOfWorms == 1 && GameState.DeadWormsCounter == 1)
			{
				GameState.GameStarted = false;
			}

		}
	}
}

function HandleWormCollision(worm)
{
	if(worm.CollisionType > collisions.NO_COLLISION)
	{
		var numberOfParticles = 0;
		if(worm.CollisionType == collisions.HEADSHOT_COLLISION)
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
}

function Log(text)
{
	console.log(text);
}

function SpriteAnimation(options)
{
	var spritesheet = options.spritesheet,
		width = options.width,
		height = options.height,
		columns = options.columns,
		rows = options.rows,
		animationSpeed = options.animationSpeed,
		frameOrder = options.frameOrder,
		_timesToRun = options.timesToRun,
		clearCanvasAfterAnimation = options.clearCanvasAfterAnimation;

	var stopped = false; 

	var frameWidth = width/columns;
	var frameHeight = height/rows;

	var currentFrameColumn = 0;
	var currentFrameRow = 0;

	var tickCount = 0;
	var frameIndex = 0;

	var Position = 0;
	var _threshhold = 0;
	
	this.initiated = false;
	this.runCount = 0;
	this.timesToRun = _timesToRun;
	this.NumberOfFrames = frameOrder.length;

	this.init = function(positionVector, threshold)
	{
		Position = new V2(positionVector.x*TILE_SIZE + threshold, positionVector.y*TILE_SIZE + threshold);
		this.initiated = true;
		stopped = false;
		_threshold = threshold;
	};

	this.setNewPosition = function(positionVector)
	{
		Position = new V2(positionVector.x*TILE_SIZE + _threshold, positionVector.y*TILE_SIZE + _threshold);
	};

	this.Stop = function()
	{
		stopped = true;
	};

	this.Start = function()
	{
		stopped = false;
	};

	this.UpdateAndRender = function(context)
	{
		if(!this.initiated)
		{
			log("NOT INITATED!");
			return;
		}

		if(stopped)
		{
			this.Clear(context);
			return;
		}

		tickCount += 1;
		if(tickCount > animationSpeed && frameIndex != frameOrder.length)
		{
			tickCount = 0;
			var frameNumber = frameOrder[frameIndex];
			frameIndex += 1;

			for(var i = 1; i <= rows; i++)
			{
				if(frameNumber <= (columns*i))
				{
					currentFrameColumn = frameNumber;

					if(currentFrameColumn == 0)
					{
						currentFrameColumn = 1;
					}
					else if(currentFrameColumn > columns)
					{
						currentFrameColumn = currentFrameColumn - (columns*(i-1));
					}

					currentFrameRow = i;
					this.Render(context);
					break;
				}
			}

		}
		else if(frameIndex == frameOrder.length)
		{
			this.runCount += 1;
			tickCount = 0;
			frameIndex = 0;
		}
	};

	this.Render = function(context)
	{
		context.clearRect(Position.x, Position.y, frameWidth, frameHeight);
		context.drawImage(
			spritesheet,
			(currentFrameColumn-1)*frameWidth, //X-coordinate to start clipping
			(currentFrameRow-1)*frameHeight, //Y-coordinate to start clipping
			frameWidth,
			frameHeight,
			Position.x,
			Position.y,
			frameWidth,
			frameHeight);
	};

	this.Clear = function(context)
	{
		frameIndex = 0;
		tickCount = 0;
		this.runCount = 0;
		
		if(clearCanvasAfterAnimation)
		{
			context.clearRect(Position.x, Position.y, frameWidth, frameHeight);
		}
	};
}

var Player1Keys = null;
var Player2Keys = null;
var Player3Keys = null;
var Player4Keys = null;

var GeneralKeys = {
	NewRound: 13	
}

function worm(name,  wormHeadID) 
{
	this.Name = name;
	//this.Keys = keys;
	this.HeadID = wormHeadID;
	//this.PlayerID = playerID;
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
	this.Path = [];
	this.HoldsFlag = 0
	this.SpawnPoint = null;
	this.IsRespawning = false;

	this.RecentPoints = 0;
	this.Points = 0;
	
	this.KillCount = 0;
	this.TotalKills = 0;
}

function DeathParticle()
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

function Team(id)
{
	this.ID = id;
	this.TeamScore = 0;
	this.TeamMember1 = 0;
	this.TeamMember2 = 0;
};

var collisions = {
	NO_COLLISION: 0,
	COLLISION: 1,
	HEAD_COLLISION: 2,
	WALL_COLLISION: 3,
	HOLE_COLLISION: 4,
	FLAG_COLLISION: 5,
	HEADSHOT_COLLISION: 6
};

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
			//SoundSystem.PlayCrashEffect();
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

var lastText = "";
function log(text)
{
	if(text != lastText)
	{
		console.log('log: ' + text);
		lastText = text;
	}

}

function timestamp() 
{
	return window.performance && window.performance.now ? window.performance.now() : new Date().getTime();
}

function LOGWORMS()
{
	log(worms[0].getName());
	log(worms[1].getName());
	log(worms[2].getName());
	log(worms[3].getName());
}

function V2(x,y)
{
	this.x = x;
	this.y = y;
};

V2.prototype.Add = function(V2)
{
	this.x += V2.x;
	this.y += V2.y;
};

V2.prototype.Invert = function(V2)
{
	this.x = -this.x;
	this.y = -this.y;	
};

V2.prototype.Clear = function()
{
	this.x = null;
	this.y = null;
};

V2.prototype.getLength = function () 
{
	return(Math.sqrt(this.x * this.x + this.y * this.y));
};

function CanvasBox(indexZ, xLeft, xRight, yTop, yBot)
{
	this.indexZ = indexZ;
	this.xLeft = xLeft;
	this.xRight = xRight;
	this.yTop = yTop;
	this.yBot = yBot;
}
