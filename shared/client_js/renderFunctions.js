//TODO(Martin): This should be put in the Renderer somehow?
function PaintWhiteCanvasses()
{
	ctxBack.clearRect(0,0, map_values.ColumnNumber*map_values.TileSize, map_values.RowNumber*map_values.TileSize);
	ctxMiddle.clearRect(0,0, map_values.ColumnNumber*map_values.TileSize, map_values.RowNumber*map_values.TileSize);
	ctxFront.clearRect(0,0, map_values.ColumnNumber*map_values.TileSize, map_values.RowNumber*map_values.TileSize);
	ctxDeathParticles.clearRect(0,0, map_values.ColumnNumber*map_values.TileSize, map_values.RowNumber*map_values.TileSize);
}

//TODO(Martin): This should be put in the Renderer somehow?
function PaintWalls()
{
	for (var x = 1; x < map_values.ColumnNumber - 1; x++) 
	{
		for (var y = 1; y < map_values.RowNumber - 1; y++) 
		{
			ctxBack.fillStyle = "#FFFFFF"; //FFFFFF
			ctxBack.fillRect(x*map_values.TileSize, y*map_values.TileSize, map_values.TileSize, map_values.TileSize);
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
			canvasBox.canvas.fillRect(x*map_values.TileSize, y*map_values.TileSize, map_values.TileSize, map_values.TileSize);
		}
	}
}