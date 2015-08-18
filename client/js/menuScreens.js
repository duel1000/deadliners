//SCREEN 1: 
//sæt NUMBER_OF_WORMS mellem 1-4
//GAME_MODE = CAPTURE_THE_FLAG/TWO_ON_TWO/FREE_FOR_ALL
//CONFIRM KNAP

//SCREEN 2:
//input player names 1-4 efter NUMBER_OF_WORMS
//Customize knap -> går til SCREEN 3
//Tilbage knap -> går til SCREEN 1
//Start spillet knap, det kalder EnterGame() -> går til SCREEN 4

//SCREEN 3(customize):
//customization options 
//MAP SIZE
//GAME SPEED
//SHOT AMOUNT
//SPECIAL AMOUNT
//start spillet knap, det kalder EnterGame() -> går til SCREEN 4

//SCREEN 4(gamescreen)
//Viser spillefladen
//Restart game knap
//Tilbage til SCREEN 1 knap
//Controls skal vises somehow
//Stats knap -> Går til SCREEN 5

//SCREEN 5(statistics)
//Viser forskellige stats
//Restart game knap
//Tilbage til SCREEN 1 knap

var titlescreen = $('#titleScreen');
var gameScreen = $('#gamescreen');
function EnterGame()
{
	SoundSystem.PlayStartButtonEffect();

	setTimeout(function()
	{
		//TODO(martin): Juicy animation.
		titlescreen.hide();
		setupGameMenu.show();
		inputNamesMenu.hide();
		gameScreen.show();

		if(GameState.ServerGame)
		{
			initServerGame();	
		}
		else
		{
			initLocalGame();
			gameloop();
		}

	}, 900);
}

$('#serverGameButton').on('click', function()
{
	if(GameState.LocalGame)
	{
		GameState.LocalGame = false;
		GameState.ServerGame = true;

		EnterGame();
	}
});

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
			GameState.GameMode = variables.game_modes.TwoOnTwo;
			$(this).text('2 vs 2');
			$("body").addClass("team");
			break;
		case variables.game_modes.TwoOnTwo:
			GameState.GameMode = variables.game_modes.CaptureTheFlag;
			$(this).text('capture the flag');
			$("body").addClass("team");
			break;
		case variables.game_modes.CaptureTheFlag:
			GameState.GameMode = variables.game_modes.Training;
			$(this).text('training');
			$("body").removeClass("team");
			break;
		case variables.game_modes.Training:
			GameState.GameMode = variables.game_modes.FreeForAll;
			$(this).text('free for all');
			break;z
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
	else if(GameState.NumberOfWorms < 4 && 
	  (GameState.GameMode == variables.game_modes.TwoOnTwo || GameState.GameMode == variables.game_modes.CaptureTheFlag))
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
			//TODO(Martin): Check if names are EQUAL
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

var ShotAmountButton = $('#shotAmountButton');
ShotAmountButton.on('click', function()
{
	GameState.hole_count.ShiftAmountForward();
	$(this).text('shot amount: ' + GameState.hole_count.Amount);
});