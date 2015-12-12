function SetupTrainingGameUI()
{
	$("#player1points .name").text(GameState.PlayerNames[0]);
}

function SetupPlayerPointsUI()
{
	if(GameState.GameMode == variables.game_modes.FreeForAll)
	{
		$("#player1points .name").text(GameState.PlayerNames[0]);
		$("#player1points .points").text('0');
		$("#player2points .name").text(GameState.PlayerNames[1]);
		$("#player2points .points").text('0');
		$("#player3points .name").text(GameState.PlayerNames[2]);
		$("#player3points .points").text('0');
		$("#player4points .name").text(GameState.PlayerNames[3]);
		$("#player4points .points").text('0');		
	}
	else if(GameState.GameMode == variables.game_modes.CaptureTheFlag)
	{
		$("#player1points .name").text("TEAM 1");
		$("#player1points .points").text('0');
		$("#player2points .name").text("TEAM 2");
		$("#player2points .points").text('0');
	}
}

function PaintWhiteCanvasses()
{
	ctxBack.clearRect(0,0, map_values.ColumnNumber*map_values.TileSize, map_values.RowNumber*map_values.TileSize);
	ctxMiddle.clearRect(0,0, map_values.ColumnNumber*map_values.TileSize, map_values.RowNumber*map_values.TileSize);
	ctxFront.clearRect(0,0, map_values.ColumnNumber*map_values.TileSize, map_values.RowNumber*map_values.TileSize);
	ctxDeathParticles.clearRect(0,0, map_values.ColumnNumber*map_values.TileSize, map_values.RowNumber*map_values.TileSize);
}

function PaintWalls()
{
	ctxBack.fillStyle = "#FFFFFF";
	ctxBack.fillRect(0, 0, map_values.ColumnNumber*map_values.TileSize, map_values.RowNumber*map_values.TileSize);
}

function DrawWhiteBox(canvasBox)
{
	var canvas = 0;

	switch(canvasBox.zPosition)
	{
		case 0:
			canvas = ctxBack;
			break;
		case 1:
			canvas = ctxMiddle;
			break;
		case 2:
			canvas = ctxFront;
			break;
		case 3:
			canvas = ctxDeathParticles;
			break;
		
	}

	for (var x = canvasBox.xLeft; x < canvasBox.xRight; x++) 
	{
		for (var y = canvasBox.yBot; y < canvasBox.yTop; y++) 
		{
			canvas.fillStyle = "#FFFFFF";
			canvas.fillRect(x*map_values.TileSize, y*map_values.TileSize, map_values.TileSize, map_values.TileSize);
		}
	}
}