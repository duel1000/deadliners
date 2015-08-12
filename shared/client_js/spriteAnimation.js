function SpriteAnimation(options)
{
	var spritesheet = options.spritesheet,
		width = options.width,
		height = options.height,
		columns = options.columns,
		rows = options.rows,
		animationSpeed = options.animationSpeed,
		frameOrder = options.frameOrder,
		_timesToRun = options.timesToRun,
		clearCanvasAfterAnimation = options.clearCanvasAfterAnimation;

	var stopped = false; 

	var frameWidth = width/columns;
	var frameHeight = height/rows;

	var currentFrameColumn = 0;
	var currentFrameRow = 0;

	var tickCount = 0;
	var frameIndex = 0;

	var Position = 0;
	var _threshhold = 0;
	
	this.initiated = false;
	this.runCount = 0;
	this.timesToRun = _timesToRun;
	this.NumberOfFrames = frameOrder.length;

	this.init = function(positionVector, threshold)
	{
		Position = new V2(positionVector.x*map_values.TileSize + threshold, positionVector.y*map_values.TileSize + threshold);
		this.initiated = true;
		stopped = false;
		_threshold = threshold;
	};

	this.setNewPosition = function(positionVector)
	{
		Position = new V2(positionVector.x*map_values.TileSize + _threshold, positionVector.y*map_values.TileSize + _threshold);
	};

	this.Stop = function()
	{
		stopped = true;
	};

	this.Start = function()
	{
		stopped = false;
	};

	this.UpdateAndRender = function(context)
	{
		if(!this.initiated)
		{
			log("NOT INITATED!");
			return;
		}

		if(stopped)
		{
			this.Clear(context);
			return;
		}

		tickCount += 1;
		if(tickCount > animationSpeed && frameIndex != frameOrder.length)
		{
			tickCount = 0;
			var frameNumber = frameOrder[frameIndex];
			frameIndex += 1;

			for(var i = 1; i <= rows; i++)
			{
				if(frameNumber <= (columns*i))
				{
					currentFrameColumn = frameNumber;

					if(currentFrameColumn == 0)
					{
						currentFrameColumn = 1;
					}
					else if(currentFrameColumn > columns)
					{
						currentFrameColumn = currentFrameColumn - (columns*(i-1));
					}

					currentFrameRow = i;
					this.Render(context);
					break;
				}
			}

		}
		else if(frameIndex == frameOrder.length)
		{
			this.runCount += 1;
			tickCount = 0;
			frameIndex = 0;
		}
	};

	this.Render = function(context)
	{
		context.clearRect(Position.x, Position.y, frameWidth, frameHeight);
		context.drawImage(
			spritesheet,
			(currentFrameColumn-1)*frameWidth, //X-coordinate to start clipping
			(currentFrameRow-1)*frameHeight, //Y-coordinate to start clipping
			frameWidth,
			frameHeight,
			Position.x,
			Position.y,
			frameWidth,
			frameHeight);
	};

	this.Clear = function(context)
	{
		frameIndex = 0;
		tickCount = 0;
		this.runCount = 0;
		
		if(clearCanvasAfterAnimation)
		{
			context.clearRect(Position.x, Position.y, frameWidth, frameHeight);
		}
	};
}

