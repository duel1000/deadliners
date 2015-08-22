//TODO(Martin): All this should be put in a struct.

var player1spritesheetWhite = new Image();
player1spritesheetWhite.src = 'sprites/player1_white.png';
var player1spritesheet = new Image();
player1spritesheet.src = 'sprites/player1.png';

var player2spritesheetWhite = new Image();
player2spritesheetWhite.src = 'sprites/player2_white.png';
var player2spritesheet = new Image();
player2spritesheet.src = 'sprites/player2.png';

var player3spritesheetWhite = new Image();
player3spritesheetWhite.src = 'sprites/player3_white.png';
var player3spritesheet = new Image();
player3spritesheet.src = 'sprites/player3.png';

var player4spritesheetWhite = new Image();
player4spritesheetWhite.src = 'sprites/player4_white.png';
var player4spritesheet = new Image();
player4spritesheet.src = 'sprites/player4.png';

var shotSpritesheet = new Image();
shotSpritesheet.src = "sprites/shots.png";

var whiteHoleSpritesheet = new Image();
whiteHoleSpritesheet.src = "sprites/whiteholesprite.png";

var flagspritesheet = new Image();
flagspritesheet.src = "sprites/flag1.png";

var deathparticle = new Image();
deathparticle.src = "sprites/deathparticle.png"

function hole_animations()
{
	var that = {};

	var Worm1HoleAnimations = [];
	var Worm2HoleAnimations = [];
	var Worm3HoleAnimations = [];
	var Worm4HoleAnimations = [];

	for(var i = 0; i < 9; i++)
	{
		var worm1HoleAnimation = new SpriteAnimation({
			spritesheet: shotSpritesheet,
			width: 145,
			height: 29,
			columns: 5,
			rows: 1,
			animationSpeed: 1,
			frameOrder: [1,5,1,5],
			timesToRun: 1,
			clearCanvasAfterAnimation: true
		});
		Worm1HoleAnimations.push(worm1HoleAnimation);

		var worm2HoleAnimation = new SpriteAnimation({
			spritesheet: shotSpritesheet,
			width: 145,
			height: 29,
			columns: 5,
			rows: 1,
			animationSpeed: 1,
			frameOrder: [2,5,2,5],
			timesToRun: 1,
			clearCanvasAfterAnimation: true
		});
		Worm2HoleAnimations.push(worm2HoleAnimation);

		var worm3HoleAnimation = new SpriteAnimation({
			spritesheet: shotSpritesheet,
			width: 145,
			height: 29,
			columns: 5,
			rows: 1,
			animationSpeed: 1,
			frameOrder: [3,5,3,5],
			timesToRun: 1,
			clearCanvasAfterAnimation: true
		});
		Worm3HoleAnimations.push(worm3HoleAnimation);

		var worm4HoleAnimation = new SpriteAnimation({
			spritesheet: shotSpritesheet,
			width: 145,
			height: 29,
			columns: 5,
			rows: 1,
			animationSpeed: 1,
			frameOrder: [4,5,4,5],
			timesToRun: 1,
			clearCanvasAfterAnimation: true
		});
		Worm4HoleAnimations.push(worm4HoleAnimation);
	}

	var Worm1CurrentHoleAnimation = 0;
	var Worm2CurrentHoleAnimation = 0;
	var Worm3CurrentHoleAnimation = 0;
	var Worm4CurrentHoleAnimation = 0;

	that.GetHoleAnimation = function(wormID)
	{
		var result = 0;
		switch(wormID)
		{
			case 1:
				result = Worm1HoleAnimations[Worm1CurrentHoleAnimation];
				Worm1CurrentHoleAnimation = (Worm1CurrentHoleAnimation + 1) % Worm1HoleAnimations.length;
				break;

			case 2:
				result = Worm2HoleAnimations[Worm2CurrentHoleAnimation];
				Worm2CurrentHoleAnimation = (Worm2CurrentHoleAnimation + 1) % Worm2HoleAnimations.length;
				break;

			case 3:
				result = Worm3HoleAnimations[Worm3CurrentHoleAnimation];
				Worm3CurrentHoleAnimation = (Worm3CurrentHoleAnimation + 1) % Worm3HoleAnimations.length;
				break;

			case 4:
				result = Worm4HoleAnimations[Worm4CurrentHoleAnimation];
				Worm4CurrentHoleAnimation = (Worm4CurrentHoleAnimation + 1) % Worm4HoleAnimations.length;
				break;
		}

		return(result);
	};

	return(that);
}

var HoleAnimations = new hole_animations();

var deathAnimationPoolSize = 12;
var deathAnimations = [];
for(var i = 0; i < deathAnimationPoolSize; i++)
{
	var animation = new SpriteAnimation({
		spritesheet: player1spritesheet,
		width: 162,
		height: 189,
		columns: 6,
		rows: 7,
		animationSpeed: 1,
		frameOrder: [2,3,33,34,35],
		timesToRun: 1,
		clearCanvasAfterAnimation: true
	});

	deathAnimations[i] = animation;
}

//TODO(Martin): Delete?
var currentDeathAnimation = 0;
function GetDeathAnimation(x,y)
{
	deathAnimations[currentDeathAnimation].init(x,y,-12); 
	var result = deathAnimations[currentDeathAnimation];
	currentDeathAnimation = (currentDeathAnimation + 1 ) % deathAnimationPoolSize;
	return(result);
}

function deploy_animations()
{	
	var that = {};

	var deployAnimation1 = new SpriteAnimation({
		spritesheet: player1spritesheet,
		width: 162,
		height: 189,
		columns: 6,
		rows: 7,
		animationSpeed: 1,
		frameOrder: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,18,42,16,17,42,17,15,42,15],
		timesToRun: 1,
		clearCanvasAfterAnimation: false
	});

	var deployAnimation2 = new SpriteAnimation({
		spritesheet: player2spritesheet,
		width: 162,
		height: 189,
		columns: 6,
		rows: 7,
		animationSpeed: 1,
		frameOrder: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,18,42,16,17,42,17,15,42,15],
		timesToRun: 1,
		clearCanvasAfterAnimation: false
	});

	var deployAnimation3 = new SpriteAnimation({
		spritesheet: player3spritesheet,
		width: 162,
		height: 189,
		columns: 6,
		rows: 7,
		animationSpeed: 1,
		frameOrder: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,18,42,16,17,42,17,15,42,15],
		timesToRun: 1,
		clearCanvasAfterAnimation: false
	});

	var deployAnimation4 = new SpriteAnimation({
		spritesheet: player4spritesheet,
		width: 162,
		height: 189,
		columns: 6,
		rows: 7,
		animationSpeed: 1,
		frameOrder: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,18,42,16,17,42,17,15,42,15],
		timesToRun: 1,
		clearCanvasAfterAnimation: false
	});

	that.GetAnimation = function(playerID)
	{
		var result = 0;

		switch(playerID)
		{
			case 1:
				result = deployAnimation1;
				break;
			case 2:
				result = deployAnimation2;
				break;
			case 3:
				result = deployAnimation3;
				break;
			case 4:
				result = deployAnimation4;
				break;
		}
		return(result);	
	};

	return(that);
}

var DeployAnimations = new deploy_animations();

function deploy_out_animations()
{
	var that = {};

	var deployOutAnimation1 = new SpriteAnimation({
		spritesheet: player1spritesheet,
		width: 162,
		height: 189,
		columns: 6,
		rows: 7,
		animationSpeed: 1,
		frameOrder: [15,16,15,19,20,21,22,23,24,25,26,27,28,29,30],
		timesToRun: 1,
		clearCanvasAfterAnimation: true
	});

	var deployOutAnimation2 = new SpriteAnimation({
		spritesheet: player2spritesheet,
		width: 162,
		height: 189,
		columns: 6,
		rows: 7,
		animationSpeed: 1,
		frameOrder: [15,16,15,19,20,21,22,23,24,25,26,27,28,29,30],
		timesToRun: 1,
		clearCanvasAfterAnimation: true
	});

	var deployOutAnimation3 = new SpriteAnimation({
		spritesheet: player3spritesheet,
		width: 162,
		height: 189,
		columns: 6,
		rows: 7,
		animationSpeed: 1,
		frameOrder: [15,16,15,19,20,21,22,23,24,25,26,27,28,29,30],
		timesToRun: 1,
		clearCanvasAfterAnimation: true
	});

	var deployOutAnimation4 = new SpriteAnimation({
		spritesheet: player4spritesheet,
		width: 162,
		height: 189,
		columns: 6,
		rows: 7,
		animationSpeed: 1,
		frameOrder: [15,16,15,19,20,21,22,23,24,25,26,27,28,29,30],
		timesToRun: 1,
		clearCanvasAfterAnimation: true
	});

	that.GetAnimation = function(playerID)
	{
		var result = 0;

		switch(playerID)
		{
			case 1:
				result = deployOutAnimation1;
				break;
			case 2:
				result = deployOutAnimation2;
				break;
			case 3:
				result = deployOutAnimation3;
				break;
			case 4:
				result = deployOutAnimation4;
				break;
		}
		return(result);	
	};

	return(that);
}

var DeployOutAnimations = new deploy_out_animations();

function full_deployAnimations()
{
	var that = {};

	var fullDeployAnimation1 = new SpriteAnimation({
		spritesheet: player1spritesheet,
		width: 162,
		height: 189,
		columns: 6,
		rows: 7,
		animationSpeed: 1,
		frameOrder: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,18,42,16,17,42,17,15,42,15,15,16,15,19,20,21,22,23,24,25,26,27,28,29,30],
		timesToRun: 1,
		clearCanvasAfterAnimation: true
	});

	var fullDeployAnimation2 = new SpriteAnimation({
		spritesheet: player2spritesheet,
		width: 162,
		height: 189,
		columns: 6,
		rows: 7,
		animationSpeed: 1,
		frameOrder: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,18,42,16,17,42,17,15,42,15,15,16,15,19,20,21,22,23,24,25,26,27,28,29,30],
		timesToRun: 1,
		clearCanvasAfterAnimation: true
	});

	var fullDeployAnimation3 = new SpriteAnimation({
		spritesheet: player3spritesheet,
		width: 162,
		height: 189,
		columns: 6,
		rows: 7,
		animationSpeed: 1,
		frameOrder: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,18,42,16,17,42,17,15,42,15,15,16,15,19,20,21,22,23,24,25,26,27,28,29,30],
		timesToRun: 1,
		clearCanvasAfterAnimation: true
	});

	var fullDeployAnimation4 = new SpriteAnimation({
		spritesheet: player4spritesheet,
		width: 162,
		height: 189,
		columns: 6,
		rows: 7,
		animationSpeed: 1,
		frameOrder: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,18,42,16,17,42,17,15,42,15,15,16,15,19,20,21,22,23,24,25,26,27,28,29,30],
		timesToRun: 1,
		clearCanvasAfterAnimation: true
	});

	that.GetAnimation = function(playerID)
	{
		var result = 0;

		switch(playerID)
		{
			case 1:
				result = fullDeployAnimation1;
				break;
			case 2:
				result = fullDeployAnimation2;
				break;
			case 3:
				result = fullDeployAnimation3;
				break;
			case 4:
				result = fullDeployAnimation4;
				break;
		}
		return(result);	
	};

	return(that);
} 

var FullDeployAnimations = new full_deployAnimations();

var whiteHoleSpritePoolSize = 30;
var WhiteHoleAnimations = [];
for(var i = 0; i < whiteHoleSpritePoolSize; i++)
{
	var whiteHoleAnimation = new SpriteAnimation({
		spritesheet: whiteHoleSpritesheet,
		width: 432,
		height: 72,
		columns: 6,
		rows: 1,
		animationSpeed: 1,
		frameOrder: [6,1,2,3,4,5,6],
		timesToRun: 1,
		clearCanvasAfterAnimation: true
	});

	WhiteHoleAnimations[i] = whiteHoleAnimation;
}

var currentWhiteHoleAnimation = 0;
function GetWhiteHoleAnimation()
{
	currentWhiteHoleAnimation = (currentWhiteHoleAnimation + 1) % whiteHoleSpritePoolSize;
	return(WhiteHoleAnimations[currentWhiteHoleAnimation]);
}

function target_animations()
{
	var that = {};
	var animations = [];
	
	that.Init = function(amount)
	{
		for(var i = 0; i < amount; i++)
		{
			var targetAnimation = new SpriteAnimation({
				spritesheet: player4spritesheet,
				width: 162,
				height: 189,
				columns: 6,
				rows: 7,
				animationSpeed: 1,
				frameOrder: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,18,42,16,17,42,17,15,42,15],
				timesToRun: 1,
				clearCanvasAfterAnimation: false
			});
			
			animations.push(targetAnimation);
		}
	};

	var currentAnimation = 0;
	that.GetAnotherAnimation = function()
	{
		currentAnimation = (currentAnimation + 1) % animations.length;
		return(animations[currentAnimation]);
	}

	return(that);
}

var TargetAnimations = new target_animations();

//TODO(Martin): This will crash after when training hits lvl 101
TargetAnimations.Init(100);

var flag1animation = new SpriteAnimation({
		spritesheet: flagspritesheet,
		width: 90,
		height: 30,
		columns: 6,
		rows: 2,
		animationSpeed: 2,
		frameOrder: [1,2,3,4,5,6,7,8,9,10,11,12],
		timesToRun: 1,
		clearCanvasAfterAnimation: true
});

var flag2animation = new SpriteAnimation({
		spritesheet: flagspritesheet,
		width: 90,
		height: 30,
		columns: 6,
		rows: 2,
		animationSpeed: 2,
		frameOrder: [12,11,10,9,8,7,6,5,4,3,2,1],
		timesToRun: 1,
		clearCanvasAfterAnimation: true
});

function InitializeAnimations(gameState)
{
	var animation = 0;

	for(var i = 0; i < gameState.NumberOfWorms; i++)
	{
		var Worm = gameState.Worms[i];
		
		animation = DeployAnimations.GetAnimation(Worm.PlayerID);
		animation.init(Worm.HeadPosition, -12);

		animation = DeployOutAnimations.GetAnimation(Worm.PlayerID);
		animation.init(Worm.HeadPosition, -12);

		animation = FullDeployAnimations.GetAnimation(Worm.PlayerID);
		animation.init(Worm.HeadPosition, -12);
	}
}