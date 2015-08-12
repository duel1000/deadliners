var variables = require('./variables.js');
var gridFunctions = require('./gridFunctions.js');
var entities = require('./entities.js');

(function (exports) 
{
	exports.GameState = function()
	{
		this.PlayerNames = ["player1","player2","player3","player4"];
		this.NumberOfWorms = 2;
		this.GameMode = variables.game_modes.FreeForAll;
		
		this.StartCounter = variables.StartCounter;
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

		this.hole_count = new variables.hole_count();

		this.Grid = gridFunctions.Create2DGrid(variables.map_values.ColumnNumber, 
								 			   variables.map_values.RowNumber);
		this.Worms = [];

		this.Team1 = new entities.Team(1);
		this.Team2 = new entities.Team(2);

		//Handles for Render()	
		this.SpriteAnimations = [];
		this.DeathParticles = [];
		this.PaintWalls = false;
		this.PaintWhiteCanvasses = false;
		this.DrawWhite = [];
		this.DrawStartCounter = false;
		this.RenderWinnerText = false;

		//TODO(Martin): Handles for Music
	};

}(typeof exports === 'undefined' ? this.FILENAME = {} : exports));