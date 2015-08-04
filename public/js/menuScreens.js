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
		init();
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
		case game_modes.FREE_FOR_ALL:
			GameState.GameMode = game_modes.TWO_ON_TWO;
			$(this).text('2 vs 2');
			$("body").addClass("team");
			break;
		case game_modes.TWO_ON_TWO:
			GameState.GameMode = game_modes.CAPTURE_THE_FLAG;
			$(this).text('capture the flag');
			$("body").addClass("team");
			break;
		case game_modes.CAPTURE_THE_FLAG:
			GameState.GameMode = game_modes.FREE_FOR_ALL;
			$(this).text('free for all');
			$("body").removeClass("team");
			break;
	}
	ValidateGameSetup();
});

var NextButton = $('#nextButton1');
var NextButtonIsValid = true;
function ValidateGameSetup()
{
	if(GameState.NumberOfWorms == 4 || GameState.GameMode == game_modes.FREE_FOR_ALL)
	{
		NextButtonIsValid = true;
		NextButton.text('next');
		NextButton.css('border-color', 'white');
	}
	else if(GameState.NumberOfWorms < 4 && 
	  (GameState.GameMode == game_modes.TWO_ON_TWO || GameState.GameMode == game_modes.CAPTURE_THE_FLAG))
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

//OLD MENUS BELOW


/*
var inputScreenText = 'local game \r \\\ \r 1-4 players \r \\\ \r  input player names \r \\\ \r start racing!';
var customizeScreenText = 'customize game';

var gameScreen = $("#gameScreen");
var startGameButton = $("#startGameButton");
startGameButton.on('click', function()
{
	EnterGame();
});

$('#customizeButton').on('click', function()
{
	SoundSystem.PlayInputEffect();
	$('#titleScreenText').text(customizeScreenText);
	$('#nameInputScreen').hide();
	$('#customizeScreen').show();
});

$('#backButton').on('click', function()
{
	SoundSystem.PlayInputEffect();
	$('#titleScreenText').text(inputScreenText);
	$('#customizeScreen').hide();
	$('#nameInputScreen').show();
});

var speedCounter = 0;
$('#gameSpeedButton').on('click', function()
{
	SoundSystem.PlayInputEffect();
	$(this).text('game speed: ' + GAME_SPEED_TEXT[speedCounter]);
	CHOSEN_GAME_SPEED = GAME_SPEEDS[speedCounter];
	speedCounter = (speedCounter + 1) % GAME_SPEEDS.length;
});

//TODO(Martin): Column number and row number are used totally random throughout the code.
var mapSizeCounter = 0;
$('#mapSizeButton').on('click', function()
{
	SoundSystem.PlayInputEffect();
	$(this).text('map size: ' + MAP_SIZE_TEXT[mapSizeCounter]);
	CHOSEN_MAP_SIZE = MAP_SIZES[mapSizeCounter];
	mapSizeCounter = (mapSizeCounter + 1) % MAP_SIZES.length;
	
	COLUMN_NUMBER = CHOSEN_MAP_SIZE + MAP_THRESHOLD*2;
	ROW_NUMBER = CHOSEN_MAP_SIZE + MAP_THRESHOLD*2;
});

var shotAmountCounter = 2;
$('#shotAmountButton').on('click', function()
{
	SoundSystem.PlayInputEffect();
	$(this).text('shot amount: ' + HOLE_COUNTS[shotAmountCounter]);
	HOLE_AMOUNT = HOLE_COUNTS[shotAmountCounter];
	shotAmountCounter = (shotAmountCounter + 1) % HOLE_COUNTS.length;
});

var specialShotCounter = 1;
$('#specialAmountButton').on('click', function()
{
	SoundSystem.PlayInputEffect();
	$(this).text('special amount: ' + SPECIAL_COUNTS[specialShotCounter]);
	WHITE_HOLE_AMOUNT = SPECIAL_COUNTS[specialShotCounter];
	specialShotCounter = (specialShotCounter + 1) % SPECIAL_COUNTS.length;
});

var victoryPointsCounter = 0;
$('#gameScoreButton').on('click', function()
{
	SoundSystem.PlayInputEffect();
	$(this).text('victory points: ' + VICTORY_VALUES[victoryPointsCounter]);
	CHOSEN_VICTORY_POINTS = VICTORY_VALUES[victoryPointsCounter];
	victoryPointsCounter = (victoryPointsCounter + 1) % VICTORY_VALUES.length;
})

$('#startGameButton2').on('click', function()
{
	startGameButton.click();
});


$('#restartGameButton').on('click', function()
{
	gameFinished = false;

	init();
	$(this).hide();
});

function NoMatchingNames()
{
	if(player1name.length > 0 && (player1name == player2name || player1name == player3name || player1name == player4name))
	{
		return(false);
	}
	else if(player2name.length > 0 && (player2name == player3name || player2name == player4name))
	{
		return(false);
	}
	else if(player3name.length > 0 && (player3name == player4name))
	{
		return(false);
	}
	else
	{
		return(true);
	}
}

function EvaluatePlayerName()
{
	var regex = /^[a-zA-Z0-9~@#$^*()_+=[\]{}|\\,.?: -]*$/;
	var result1 = regex.exec(player1name);
	var result2 = regex.exec(player2name);
	var result3 = regex.exec(player3name);
	var result4 = regex.exec(player4name);

	if(result1 == null || result2 == null || result3 == null || result4 == null)
	{
		return(false);
	}
	else
	{
		return(true);
	}
}

function ValidateNames()
{
	if($("#player1name").val().length > 0 && $("#player2name").val().length == 0 && 
	   $("#player3name").val().length == 0 && $("#player4name").val().length == 0 && NoMatchingNames() && EvaluatePlayerName())
	{	
		NUMBER_OF_WORMS = 1;
		CheckGameMode();
		startGameButton.show();

		$("body").removeClass("players1").removeClass("players2").removeClass("players3").removeClass("players4");
		$("body").addClass("players1");

		return;
	}
	else
	{
		//startGameButton.hide();
		//$('.twoPlayerWrap').hide();	
		$("body").removeClass("players1").removeClass("players2").removeClass("players3").removeClass("players4");
	}

	if($("#player1name").val().length > 0 && $("#player2name").val().length > 0 && 
	   $("#player3name").val().length == 0 && $("#player4name").val().length == 0 && NoMatchingNames() && EvaluatePlayerName())
	{
		NUMBER_OF_WORMS = 2;
		CheckGameMode();
		startGameButton.show();

		$("body").addClass("players2");

		return;
	}
	else
	{
		startGameButton.hide();
		//$('.twoPlayerWrap').hide();	
		$("body").removeClass("players1").removeClass("players2").removeClass("players3").removeClass("players4");
	}

	if($("#player1name").val().length > 0 && $("#player2name").val().length > 0 && 
	   $("#player3name").val().length > 0 && $("#player4name").val().length == 0 && NoMatchingNames() && EvaluatePlayerName())
	{
		NUMBER_OF_WORMS = 3;
		startGameButton.show();
		CheckGameMode();
		$("body").addClass("players3");

		return;
	}
	else
	{
		startGameButton.hide();
		//$('.twoPlayerWrap').hide();	
		$("body").removeClass("players1").removeClass("players2").removeClass("players3").removeClass("players4");
	}

	if($("#player1name").val().length > 0 && $("#player2name").val().length > 0 && 
	   $("#player3name").val().length > 0 && $("#player4name").val().length > 0 && NoMatchingNames() && EvaluatePlayerName())
	{
		NUMBER_OF_WORMS = 4;
		startGameButton.show();
		CheckGameMode();

		$("body").addClass("players4");
		$('.twoPlayerWrap').show();

		return;
	}
	else
	{

		startGameButton.hide();
		//$('.twoPlayerWrap').hide();		
		$("body").removeClass("players1").removeClass("players2").removeClass("players3").removeClass("players4");
	}
}

function CheckGameMode()
{
	if((GAME_MODE == TWO_ON_TWO || GAME_MODE == CAPTURE_THE_FLAG) && NUMBER_OF_WORMS == 0)
	{
		$('#startGameButton').text('enter four players');
		$('#startGameButton').off('click');
	}
	else if((GAME_MODE == TWO_ON_TWO || GAME_MODE == CAPTURE_THE_FLAG) && NUMBER_OF_WORMS != 4)
	{
		$('#startGameButton').text('enter four players');
		$('#startGameButton').off('click');
	}
	else if(NUMBER_OF_WORMS == 1 && GAME_MODE == FREE_FOR_ALL)
	{
		$('#startGameButton').text('start training');
		$('#startGameButton').off('click');
		$('#startGameButton').on('click', function()
		{
			EnterGame();			
		});
	}
	else if(NUMBER_OF_WORMS > 1 && GAME_MODE == FREE_FOR_ALL)
	{
		$('#startGameButton').text('start race');
		$('#startGameButton').off('click');
		$('#startGameButton').on('click', function()
		{
			EnterGame();			
		});
	}
	else if(NUMBER_OF_WORMS == 4 && (GAME_MODE == CAPTURE_THE_FLAG || GAME_MODE == TWO_ON_TWO))
	{
		$('#startGameButton').text('start race');
		$('#startGameButton').off('click');
		$('#startGameButton').on('click', function()
		{
			EnterGame();			
		});
	}
}

$('#ModeButton').on('click', function()
{
	SoundSystem.PlayWhiteShotEffect();

	if(GAME_MODE == FREE_FOR_ALL)
	{
		$(this).text('2 vs 2');
		$("body").addClass("team");
		GAME_MODE = TWO_ON_TWO;

		CheckGameMode();
	}
	else if(GAME_MODE == TWO_ON_TWO)
	{
		$(this).text('capture the flag');
		$("body").addClass("team");
		GAME_MODE = CAPTURE_THE_FLAG;

		CheckGameMode();

	}
	else if(GAME_MODE == CAPTURE_THE_FLAG)
	{
		$(this).text('free for all');
		$("body").removeClass("team");
		GAME_MODE = FREE_FOR_ALL;

		CheckGameMode();
	}
});

$("#player1name").on('keyup', function(event)
{
	this.value = this.value.toLowerCase();
	player1name = this.value;
	ValidateNames();
})
 $("#player2name").on('keyup', function(event)
 {
 	this.value = this.value.toLowerCase();
	player2name = this.value;
	ValidateNames();
})
$("#player3name").on('keyup', function(event)
{
	this.value = this.value.toLowerCase();
	player3name = this.value;
	ValidateNames();
})
$("#player4name").on('keyup', function(event)
{
	this.value = this.value.toLowerCase();
	player4name = this.value;
	ValidateNames();
})*/