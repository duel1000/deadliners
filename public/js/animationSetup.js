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

var worm1HoleAnimations = [];
var worm2HoleAnimations = [];
var worm3HoleAnimations = [];
var worm4HoleAnimations = [];

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
	worm1HoleAnimations.push(worm1HoleAnimation);

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
	worm2HoleAnimations.push(worm2HoleAnimation);

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
	worm3HoleAnimations.push(worm3HoleAnimation);

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
	worm4HoleAnimations.push(worm4HoleAnimation);
}

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

var currentDeathAnimation = 0;
function GetDeathAnimation(x,y)
{
	deathAnimations[currentDeathAnimation].init(x,y,-12); 
	var result = deathAnimations[currentDeathAnimation];
	currentDeathAnimation = (currentDeathAnimation + 1 ) % deathAnimationPoolSize;
	return(result);
}

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