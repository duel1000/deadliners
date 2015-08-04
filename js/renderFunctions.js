//TODO(Martin): This should be put in the Renderer somehow?
function PaintWhiteCanvasses()
{
	ctxBack.clearRect(0,0, COLUMN_NUMBER*TILE_SIZE, ROW_NUMBER*TILE_SIZE);
	ctxMiddle.clearRect(0,0, COLUMN_NUMBER*TILE_SIZE, ROW_NUMBER*TILE_SIZE);
	ctxFront.clearRect(0,0, COLUMN_NUMBER*TILE_SIZE, ROW_NUMBER*TILE_SIZE);
	ctxDeathParticles.clearRect(0,0, COLUMN_NUMBER*TILE_SIZE, ROW_NUMBER*TILE_SIZE);
}

//TODO(Martin): This should be put in the Renderer somehow?
function PaintWalls()
{
	for (var x = 1; x < COLUMN_NUMBER - 1; x++) 
	{
		for (var y = 1; y < ROW_NUMBER - 1; y++) 
		{
			ctxBack.fillStyle = "#FFFFFF"; //FFFFFF
			ctxBack.fillRect(x*TILE_SIZE, y*TILE_SIZE, TILE_SIZE, TILE_SIZE);
		}
	}
}

function DrawWhite(canvasBox)
{
	for (var x = canvasBox.xLeft; x < canvasBox.xRight; x++) 
	{
		for (var y = canvasBox.yBot; y < canvasBox.yTop; y++) 
		{
			canvasBox.canvas.fillStyle = "#FFFFFF";
			canvasBox.canvas.fillRect(x*TILE_SIZE, y*TILE_SIZE, TILE_SIZE, TILE_SIZE);
		}
	}
}