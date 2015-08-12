(function (exports) 
{
	exports.game_modes = {
		FreeForAll: 1,
		TwoOnTwo: 2,
		CaptureTheFlag: 3
	};

	exports.game_speeds = {
		Low: 1/20,
		Medium: 1/30,
		High: 1/40,
		CurrentSpeed: 1/40
	};

	exports.map_sizes = {
		Small: 120,
		Medium: 150,
		Large: 200,
		CurrentSize: 200
	};

	exports.VictoryPoints = {
		Low: 7,
		Medium: 15,
		High: 21,
		CurrentValue: 21
	};

	exports.map_values = {
		TileSize: 3,
		HoleRange: 50,
		HoleSize: 9,
		FlagSize: 5,

		Team1ID: 1,
		Team2ID: 2,

		WhiteHoleSize: 24,
		WhiteHoleRange: 16,
		WhiteHoleAmount: 1,

		StartCounter: 5,

		MapThreshold: 28,
		ColumnNumber: 200 + 56, 
		RowNumber: 200 + 56, 

		Flag1Position: [60, 128],
		Flag2Position: [256 - 60, 128],

		Empty: 0,
		Wall: 1,
		DrawnWall: 2,
		Hole: 3,
		DrawnHole: 4,
		Worm1Cell: 5,
		DrawnWorm1Cell: 6,
		Worm1Head: 7,

		Worm2Cell: 8,
		DrawnWorm2Cell: 9,
		Worm2Head: 10,

		Worm3Cell: 11,
		DrawnWorm3Cell: 12,
		Worm3Head: 13,

		Worm4Cell: 14,
		DrawnWorm4cell: 15,
		Worm4Head: 16,

		WhiteHole: -17,
		StaticWall: 18,
		StaticWallDrawn: 19,

		Flag1: 20,
		Flag2: 21,
		RemoveFlag: 22,
		RemoveWorm: 23,
		RemoveHole: 24,
		ClearAll: 25
	};

	exports.directions = {
		Left: 0,
		Up: 1,
		Right: 2,
		Down: 3,
		Spread: 5
	};

	exports.keys = {
		Left: 0,
		Up: 1,
		Right: 2,
		Down: 3,
		Shot: 4,
		Special: 5
	};

	exports.hole_count = function() 
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

	exports.key_package = function(left, up, right, down, shot, special)
	{
		this.LeftKey = left;
		this.UpKey = up;
		this.RightKey = right;
		this.DownKey = down;
		this.ShotKey = shot;
		this.SpecialKey = special;
	}

	exports.GeneralKeys = {
		NewRound: 13
	}

}(typeof exports === 'undefined' ? this.variables = {} : exports));

