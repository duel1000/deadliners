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

function keys(left, up, right, down, shot, special)
{
	this.LeftKey = left;
	this.UpKey = up;
	this.RightKey = right;
	this.DownKey = down;
	this.ShotKey = shot;
	this.SpecialKey = special;
};

var Player1Keys = new keys(37,38,39,40,189,190);
var Player2Keys = new keys(68,82,71,70,88,90);
var Player3Keys = new keys(97,101,99,98,34,35);
var Player4Keys = new keys(74,73,76,75,66,86);

var GeneralKeys = {
	NewRound: 13	
}
