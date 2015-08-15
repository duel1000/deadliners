var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var uuid = require('node-uuid');
var express = require('express');
var port = process.env.PORT || 3000;
app.use(express.static('client'));
app.use(express.static('shared'));

app.get('/', function(req, res)
{
	res.sendFile(__dirname + '/index.html');
});

app.get('/todo', function(req, res)
{
	res.sendFile(__dirname + '/TODO.txt');
});

http.listen(port, function()
{
	console.log('listening on *:' + port);
});

var playersJoined = 0;
io.on('connection', function(newClient)
{	
	newClient.userid = uuid.v4();
	console.log('\t socket.io:: player ' + newClient.userid + ' connected');

	newClient.on('join', function(data)
	{
		console.log(data.msg);
		playersJoined++;
		console.log(playersJoined + ' players joined the game..');
		if(playersJoined == 2)
		{
			init();
			//NewGame();
			io.emit('gamefromserver', { NewGameState: GameState });
		}
	});

	newClient.on('newGamePlease', function()
	{
		console.log("newGamePlease");
		NewGame();
		io.emit('newGame', { NewGame: GameState });
	});

	newClient.on('update', function(data)
	{
		//console.log(data.direction);
	});

	newClient.on('disconnect', function () 
	{	
		console.log('\t socket.io:: newClient disconnected ' + newClient.userid );
	});
});

var entities = require('./shared/modules/entities.js');
var entityFunctions = require('./shared/modules/entityFunctions.js');
var gridFunctions = require('./shared/modules/gridFunctions.js');
var math = require('./shared/modules/math.js');
var variables = require('./shared/modules/variables.js');

var map_values = variables.map_values;
var collisions = entities.collisions;

var VectorFactory = new math.V2Factory(100);

function GameState()
{
	this.ServerGame = true;
	this.LocalGame = false;

	this.PlayerNames = ["","","",""];
	this.NumberOfWorms = 2;
	this.GameMode = variables.game_modes.FreeForAll;
	
	this.StartCounter = map_values.StartCounter;
	this.GameStarted = false;
	this.GameFinished = false;
	this.StartGameButtonPressed = false;

	this.SecondsCounter = 0;

	this.WormsDiedThisRound = [];
	this.DeadWormsCounter = 0;

	this.CurrentGamePoints = 0;
	this.RoundWinningTeam = 0;
	this.WinnerText = "";

	this.hole_count = new variables.hole_count();

	this.Grid = new entities.grid_2D(map_values.ColumnNumber, map_values.RowNumber);
	
	this.Worms = [];

	this.Team1 = new entities.team(1);
	this.Team2 = new entities.team(2);

	this.Flag1 = new entities.flag(map_values.Flag1, map_values.FlagSize, 
					      map_values.FlagSize, map_values.Flag1Position);

	this.Flag2 = new entities.flag(map_values.Flag2, map_values.FlagSize, 
						  map_values.FlagSize, map_values.Flag2Position);

	//NOTE(Martin): for Render()	
	this.SpriteAnimations = [];
	this.DeathParticles = [];
	this.PaintWalls = true;
	this.PaintWhiteCanvasses = true;
	this.DrawWhiteBox = [];
	this.DrawStartCounter = false;
	this.RenderWinnerText = false;

	//NOTE(Martin): Handles for Music
	this.CrashEffects = [];
	this.DeniedEffects = [];
	this.ShotEffects = [];
	this.WhiteShotEffects = [];
	this.HeadShotEffects = [];
	this.CountDownEffects = [];
}
var GameState = new GameState();
gridFunctions.Initiate2Dgrid(GameState.Grid, map_values.Empty);

function init()
{	
	gridFunctions.SetWallsInGrid(GameState.Grid, map_values);

	if(GameState.NumberOfWorms >= 1)
	{
		GameState.Worms[0] = new entities.worm(GameState.PlayerNames[0], null, 1, map_values.Worm1Head);
	}
	if(GameState.NumberOfWorms >= 2)
	{
		GameState.Worms[1] = new entities.worm(GameState.PlayerNames[1], null, 2, map_values.Worm2Head);
	}
	if(GameState.NumberOfWorms >= 3)
	{		
		GameState.Worms[2] = new entities.worm(GameState.PlayerNames[2], null, 3, map_values.Worm3Head);
	}
	if(GameState.NumberOfWorms == 4)
	{
		GameState.Worms[3] = new entities.worm(GameState.PlayerNames[3], null, 4, map_values.Worm4Head);
	}

	if(GameState.GameMode == variables.game_modes.TwoOnTwo || 
	          GameState.GameMode == variables.game_modes.CaptureTheFlag)
	{
		GameState.Team1.Member1 = GameState.Worms[0];
		GameState.Team1.Member2 = GameState.Worms[1];
		GameState.Team2.Member1 = GameState.Worms[2];
		GameState.Team2.Member2 = GameState.Worms[3];
	}

	//gameloop();
	//NewGame();
}

function NewGame()
{
	VectorFactory.Reboot();

	GameState.CurrentGamePoints = 0;
	GameState.DeadWormsCounter = 0;

	//TODO(Martin): This is like a re-init function.
	gridFunctions.Initiate2Dgrid(GameState.Grid, map_values.Empty);

	gridFunctions.SetWallsInGrid(GameState.Grid, map_values);
	//GameState.PaintWhiteCanvasses = true;
	//GameState.PaintWalls = true;

	if(GameState.GameMode == variables.game_modes.CaptureTheFlag)
	{
		gridFunctions.SetFlagOntoGrid(GameState.Flag1, GameState.Grid);
		gridFunctions.SetFlagOntoGrid(GameState.Flag2, GameState.Grid);
	}

	if(GameState.GameMode == variables.game_modes.CaptureTheFlag)
	{
		//flag1animation.init(FLAG_1_POSITION[0], FLAG_1_POSITION[1], -6);
		//flag2animation.init(FLAG_2_POSITION[0], FLAG_2_POSITION[1], -6);
	}	

	//STUDY(martin): Understand new and when to use it.
	var vectorGroup = [];
	vectorGroup[0] = VectorFactory.EmptyVector();
	vectorGroup[1] = VectorFactory.EmptyVector();
	vectorGroup[2] = VectorFactory.EmptyVector();
	vectorGroup[3] = VectorFactory.EmptyVector();
	var startingPositions = [];

	switch(GameState.GameMode)
	{
		case variables.game_modes.FreeForAll:
			startingPositions = gridFunctions.FFAstartingPositions(vectorGroup, GameState.Grid);
			break;
		case variables.game_modes.TwoOnTwo:
			startingPositions = gridFunctions.TOTstartingPositions(vectorGroup, GameState.Grid);
			break;
		case variables.game_modes.CaptureTheFlag:
			startingPositions = gridFunctions.CTFstartingPositions(vectorGroup, GameState.Grid);
			break;
	}

	GameState.RoundWinningTeam = 0;

	for (var i=0; i < GameState.NumberOfWorms; i++) 
	{
		//TODO(martin): This is pretty bad :)
		if(i == 0)
		{
			entityFunctions.InitializeWorm(GameState.Worms[i], startingPositions[i],
			 			   variables.directions.Down, GameState.Team1.ID,
			 			   VectorFactory, GameState.hole_count.Amount);
		}
		else if(i == 1)
		{
			entityFunctions.InitializeWorm(GameState.Worms[i], startingPositions[i],
			 			   variables.directions.Up, GameState.Team1.ID,
			 			   VectorFactory, GameState.hole_count.Amount);
		}
		else if(i == 2)
		{
			entityFunctions.InitializeWorm(GameState.Worms[i], startingPositions[i],
						   variables.directions.Down, GameState.Team2.ID,
						   VectorFactory, GameState.hole_count.Amount);
		}
		else if(i == 3)
		{
			entityFunctions.InitializeWorm(GameState.Worms[i], startingPositions[i], 
						   variables.directions.Up, GameState.Team2.ID,
						   VectorFactory, GameState.hole_count.Amount);
		}
	}

	//TODO(Martin): Should not be WORM1CELL but different heads.
	for(var i = 0; i < GameState.NumberOfWorms; i++)
	{
		gridFunctions.SetGridValue(GameState.Grid, map_values.Worm1Cell, 
								   GameState.Worms[i].HeadPosition.x, 
								   GameState.Worms[i].HeadPosition.y);
	}


	GameState.GameStarted = false;
	//GameState.StartGameButtonPressed = true;
	
}

//STUDY(martin): Get comfortable with this.
//NOTE(martin): http://codeincomplete.com/posts/2013/12/4/javascript_game_foundations_the_game_loop/
//var now, dt = 0, last = timestamp(), step = variables.game_speeds.CurrentSpeed;
//var TimesRun = 0;
function gameloop()
{	
	/*now = timestamp();
	dt = dt + Math.min(1, (now - last) / 1000);
	
	//TODO(Martin): Maybe the game loop should be initialized with init() method.
	if(step != variables.game_speeds.CurrentSpeed)
	{
		step = variables.game_speeds.CurrentSpeed;
	}

	if(TimesRun > 0)
	{
		gridFunctions.ClearGridBuffer(GameState, map_values);
	}

	while(dt > step) 
	{
		dt = dt - step;
		update(step);
	}

	//render(dt); //NOTE(martin): Used for LERP.
	SoundSystem.PlaySoundEffects(GameState);
	Render();
	TimesRun++;
	last = now;
	
	requestAnimationFrame(gameloop);*/
}

function HandleWormCollision(worm)
{
	if(worm.CollisionType > collisions.NoCollision)
	{
		entityFunctions.Kill(worm);
		GameState.CrashEffects.push(1);
		GameState.WormsDiedThisRound.push(worm);
	}	
}

function update(step)
{
	GameState.SecondsCounter += step;
	
	if(GameState.GameFinished) { return; }

	if(GameState.GameStarted)
	{
		GameState.StartGameButtonPressed = false;

		for(var i = 0; i < GameState.NumberOfWorms; i++)
		{
			if(GameState.Worms[i].Alive)
			{
				entityFunctions.UpdateWormPosition(GameState.Worms[i], variables.directions, VectorFactory);

				if(GameState.Worms[i].JustShotHole)
				{	
					GameState.ShotEffects.push(1);
					GameState.Worms[i].JustShotHole = false;
					gridFunctions.SetHoleInGrid(GameState.Worms[i], GameState.Grid, map_values);
				}

				if(GameState.Worms[i].JustShotWhiteHole)
				{	
					GameState.WhiteShotEffects.push(1);
					GameState.Worms[i].JustShotWhiteHole = false;
					gridFunctions.SetWhiteHoleInGrid(GameState.Worms[i].WhiteHolePosition, GameState.Grid, map_values);
				}
			}
		}		

		for(var i = 0; i < GameState.NumberOfWorms; i++)
		{
			if(GameState.Worms[i].Alive)
			{
				if(gridFunctions.CheckHeadShotCollision(GameState.Worms[i], GameState.Grid, 
													 	map_values))
				{
					GameState.Worms[i].CollisionType = collisions.HeadShotCollision;
					GameState.HeadShotEffects.push(1);
				}
				else
				{
					gridFunctions.SetWormCollision(GameState.Worms[i], GameState.Grid, 
												   map_values, collisions, GameState);
				}

			}
		}		

		for(var i = 0; i < GameState.NumberOfWorms; i++)
		{
			if(GameState.Worms[i].Alive)
			{
				HandleWormCollision(GameState.Worms[i]);
				gridFunctions.SetGridValue(GameState.Grid, GameState.Worms[i].HeadID, 
												   GameState.Worms[i].HeadPosition.x, 
												   GameState.Worms[i].HeadPosition.y);
			}
		}

		for(var i = 0; i < GameState.WormsDiedThisRound.length; i++)
		{
			GameState.DeadWormsCounter++;
			entityFunctions.ScorePoint(GameState.WormsDiedThisRound[i], GameState.CurrentGamePoints);
		}
		GameState.CurrentGamePoints += GameState.WormsDiedThisRound.length;
		GameState.WormsDiedThisRound = [];

		if(GameState.GameMode == variables.game_modes.FreeForAll)
		{
			if(GameState.NumberOfWorms > 1 && ((GameState.DeadWormsCounter == GameState.NumberOfWorms - 1) || (GameState.DeadWormsCounter == GameState.NumberOfWorms)))
			{
				GameState.GameStarted = false;

				for(var w = 0; w<GameState.NumberOfWorms; w++)
				{
					if(GameState.Worms[w].Alive)
					{
						entityFunctions.Kill(GameState.Worms[w]);
						GameState.CrashEffects.push(1);
						GameState.DeadWormsCounter++;
						entityFunctions.ScorePoint(GameState.Worms[w], GameState.CurrentGamePoints);
					}
				}

				//TODO(Martin): Bad to sort because then worms[0] is not player 1.
				//GameState.Worms.sort(function(a, b) {return b.Points - a.Points });

				/*if(GameState.Worms[0].Points >= variables.VictoryPoints.CurrentValue)
				{
					GameState.StartGameButtonPressed = false;
					GameState.GameFinished = true;
					$('#restartGameButton').show();
					GameState.WinnerText = GameState.Worms[0].Name + ' won the game!';
					GameState.RenderWinnerText = true;
				}*/		
			}
			else if(GameState.NumberOfWorms == 1 && GameState.DeadWormsCounter == 1)
			{
				GameState.GameStarted = false;
			}

		}
	}
	else if(GameState.StartGameButtonPressed)
	{
		if(GameState.SecondsCounter > 1)
		{
			if(GameState.StartCounter == 0)
			{
				GameState.GameStarted = true;
				GameState.StartCounter = map_values.StartCounter;

				var box = new math.canvas_box(0, 
										      map_values.ColumnNumber/2-25,
										      map_values.ColumnNumber/2+25,
										      map_values.RowNumber/2+25, 
										      map_values.RowNumber/2-25);

				GameState.DrawWhiteBox.push(box); 
			}
			else
			{
				//NOTE(martin): puts in the players in order of the counter
				if(GameState.StartCounter == 4 && GameState.NumberOfWorms > 3)
				{
				}
				else if(GameState.StartCounter == 3 && GameState.NumberOfWorms > 2)
				{
				}
				else if(GameState.StartCounter == 2 && GameState.NumberOfWorms > 1)
				{
				}
				else if(GameState.StartCounter == 1 && GameState.NumberOfWorms > 0)
				{
				}


				var box = new math.canvas_box(0, 
										      map_values.ColumnNumber/2-halfTextWidth, 
										      map_values.ColumnNumber/2+halfTextWidth,
										      map_values.RowNumber/2+halfTextHeight, 
										      map_values.RowNumber/2-halfTextHeight);

				GameState.DrawWhiteBox.push(box); 

				GameState.DrawStartCounter = true;
				GameState.StartCounter--;					
			}

			GameState.SecondsCounter = 0;
		}
	}	
}