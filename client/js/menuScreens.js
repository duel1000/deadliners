var titlescreen = $('#titleScreen');
var gameScreen = $('#gamescreen');
function EnterGame()
{
	EnableKeyEvents();

	SoundSystem.PlayStartButtonEffect();

	setTimeout(function()
	{
		titlescreen.hide();
		setupGameMenu.show();
		inputNamesMenu.hide();
		gameScreen.show();

		resizeCanvas();
		writeGameMode();

		initGame();
		gameloop();

	}, 900);
}

$(".black-white-button").each(function()
{
	$(this).on('click', function()
	{
		SoundSystem.PlayInputEffect();
	});
});

$('#NumberOfPlayersSelect').on('click', function()
{
	SoundSystem.PlayInputEffect();
	GameState.NumberOfWorms = ++GameState.NumberOfWorms == 5 ? 1 : GameState.NumberOfWorms;
	$(this).text(GameState.NumberOfWorms);
	ValidateGameSetup();
});

$('#GameModeButton').on('click', function()
{
	SoundSystem.PlayInputEffect();
	switch(GameState.GameMode)
	{
		case variables.game_modes.FreeForAll:
			GameState.GameMode = variables.game_modes.CaptureTheFlag;
			$(this).text('capture the flag');
			$("body").addClass("team");
			break;
		case variables.game_modes.CaptureTheFlag:
			GameState.GameMode = variables.game_modes.Training;
			$(this).text('training');
			$("body").removeClass("team").addClass("training");
			break;
		case variables.game_modes.Training:
			GameState.GameMode = variables.game_modes.FreeForAll;
			$(this).text('free for all');
			$("body").removeClass("training");
			break;
	}
	ValidateGameSetup();
});

var NextButton = $('#nextButton1');
var NextButtonIsValid = true;
function ValidateGameSetup()
{

	if(GameState.NumberOfWorms == 1 && GameState.GameMode == variables.game_modes.Training)
	{
		NextButtonIsValid = true;
		NextButton.text('next');
		NextButton.css('border-color', 'white');
		return;	
	}
	else if(GameState.NumberOfWorms > 1 && GameState.GameMode == variables.game_modes.Training)
	{
		NextButtonIsValid = false;
		NextButton.text('1 player game mode');
		NextButton.css('border-color', 'red');
		return;	
	}

	if(GameState.NumberOfWorms == 4 || GameState.GameMode == variables.game_modes.FreeForAll)
	{
		NextButtonIsValid = true;
		NextButton.text('next');
		NextButton.css('border-color', 'white');
	}
	else if(GameState.NumberOfWorms < 4 && GameState.GameMode == variables.game_modes.CaptureTheFlag)
    {
    	NextButtonIsValid = false;
    	NextButton.text('4 player game mode');
		NextButton.css('border-color', 'red');
    }
}

var setupGameMenu = $('#setupGameMenu');
var inputNamesMenu = $('#inputNamesMenu');
var customizeMenu = $('#customizeMenu');
NextButton.on('click', function()
{
	if(NextButtonIsValid)
	{	
		$("body").removeClass("players1").removeClass("players2").removeClass("players3").removeClass("players4").addClass("players" + GameState.NumberOfWorms);
		for(var i = 1; i <= 4; i++)
		{
			$('#player' + i + 'field').hide();
		}
		for(var i = 1; i <= GameState.NumberOfWorms; i++)
		{
			$('#player' + i + 'field').show();
		}

		if(GameState.GameMode == variables.game_modes.Training || GameState.GameMode == variables.game_modes.CaptureTheFlag)
		{
			CustomizeButton.hide();
		}
		else
		{
			CustomizeButton.show();	
		}

		setupGameMenu.hide();
		inputNamesMenu.show();
		ValidateEnteredPlayers();
	}
});

var BackButton1 = $('#backButton1');
BackButton1.on('click', function()
{
	inputNamesMenu.hide();
	setupGameMenu.show();
});

var CustomizeButton = $('#customizeButton');
CustomizeButton.on('click', function()
{
	inputNamesMenu.hide();
	customizeMenu.show();
});

var BackFromCustomizeButton = $('#backFromCustomizeButton');
BackFromCustomizeButton.on('click', function()
{
	customizeMenu.hide();
	inputNamesMenu.show();
});

var StartRaceValidated = false;
var StartRaceButton = $('#startRaceButton');
StartRaceButton.on('click', function()
{
	if(StartRaceValidated)
	{
		EnterGame();
	}
});	

var ExitGameButton = $('#exitGameButton');
ExitGameButton.on('click', function()
{
	DisableKeyEvents();
	ExitGameToTitlescreen();
	gameScreen.hide();
	titlescreen.show();
});

var ShowControlsButton = $('#showControlsButton');
var ControlsDiv = $('#controls');
var ControlsShow = false;
ShowControlsButton.on('click', function()
{
	if(ControlsShow)
	{
		ControlsDiv.hide();
		$(this).text("show controls");
		ControlsShow = false;
	}
	else
	{
		$(this).text("hide controls");
		ControlsDiv.show();
		ControlsShow = true;
	}
});

//NOTE(martin): Typing sound effects
var playersEntered = [];
playersEntered[0] = false;
playersEntered[1] = false;
playersEntered[2] = false;
playersEntered[3] = false;
var inputFields = [];
inputFields[0] = $("#player1name");
inputFields[1] = $("#player2name");
inputFields[2] = $("#player3name");
inputFields[3] = $("#player4name");
SetupInputField(inputFields[0], 0);
SetupInputField(inputFields[1], 1);
SetupInputField(inputFields[2], 2);
SetupInputField(inputFields[3], 3);

function SetupInputField(field, index)
{
	field.on('keydown', function(event)
	{
		if(this.value.length < 12 || event.keyCode == 8 || event.keyCode == 9)
		{
			SoundSystem.PlayInputEffect();
		}
	});

	field.on('keyup', function(event)
	{
		this.value = this.value.toLowerCase();
		GameState.PlayerNames[index] = this.value;

		if(this.value.length >= 1)
		{
			playersEntered[index] = true;			
		}
		else
		{
			playersEntered[index] = false;
		}

		ValidateEnteredPlayers();
	});
}

function ValidateEnteredPlayers()
{
	var counter = 0;
	for(var i = 0; i < GameState.NumberOfWorms; i++)
	{
		if(playersEntered[i] == true) 
		{
			counter++;
		}
	}

	if(counter == GameState.NumberOfWorms)
	{
		StartRaceValidated = true;
		StartRaceButton.show();
	}
	else
	{
		StartRaceValidated = false;
		StartRaceButton.hide();
	}
}

var CurrentGameSpeedIndex = 2;
var GameSpeeds = [1/20, 1/30, 1/40];

var CurrentShotAmountIndex = 1;
var ShotAmounts = [3,6,9];

var CurrentSpecialAmountIndex = 0;
var SpecialAmounts = [1,2,3];

var CurrentGameScoreIndex = 2;
var GameScores = [11, 15, 21];


var GameSpeedCustomButton = $('#gameSpeedButton');
GameSpeedCustomButton.on('click', function()
{
	CurrentGameSpeedIndex++;
	if(CurrentGameSpeedIndex >= GameSpeeds.length)
	{
		CurrentGameSpeedIndex = 0;
	}

	var Speed = GameSpeeds[CurrentGameSpeedIndex]; 
	ChangeGameSpeed(Speed);

	var SpeedText = "";

	switch(CurrentGameSpeedIndex)
	{
		case 0:
		{	
			SpeedText = "low";
			break;
		}

		case 1:
		{	
			SpeedText = "medium";
			break;
		}

		case 2:
		{	
			SpeedText = "high";
			break;
		}
	} 
	$(this).text('game speed: ' + SpeedText);
});

var ShotAmountButton = $('#shotAmountButton');
ShotAmountButton.on('click', function()
{
	CurrentShotAmountIndex++;
	if(CurrentShotAmountIndex >= ShotAmounts.length)
	{
		CurrentShotAmountIndex = 0;
	}

	var ShotAmount = ShotAmounts[CurrentShotAmountIndex];

	$(this).text('shot amount: ' + ShotAmount);
	GameState.hole_count.Amount = ShotAmount;
});

var SpecialAmountCustomButton = $('#specialAmountButton');
SpecialAmountCustomButton.on('click', function()
{
	CurrentSpecialAmountIndex++;
	if(CurrentSpecialAmountIndex >= SpecialAmounts.length)
	{
		CurrentSpecialAmountIndex = 0;
	}

	var SpecialAmount = SpecialAmounts[CurrentSpecialAmountIndex];

	GameState.WhiteHoleAmount = SpecialAmount;

	$(this).text('special amount: ' + SpecialAmount);
});

var GameScoreCustomButton = $('#gameScoreButton');
GameScoreCustomButton.on('click', function()
{
	CurrentGameScoreIndex++;
	if(CurrentGameScoreIndex >= GameScores.length)
	{
		CurrentGameScoreIndex = 0;
	}

	var GameScore = GameScores[CurrentGameScoreIndex]; 
	GameState.VictoryPoints = GameScore;

	$(this).text('victory points: ' + GameScore);
});