function V2(x,y)
{
	this.x = x;
	this.y = y;
};

V2.prototype.Add = function(V2)
{
	this.x += V2.x;
	this.y += V2.y;
};

V2.prototype.Invert = function(V2)
{
	this.x = -this.x;
	this.y = -this.y;	
};

V2.prototype.Clear = function()
{
	this.x = null;
	this.y = null;
};

V2.prototype.getLength = function () 
{
	return(Math.sqrt(this.x * this.x + this.y * this.y));
};

function V2Factory(amount)
{
	var that = {};

	var Vectors = [];
	var NextInProduction = 0;

	for(var i = 0; i < amount; i++)
	{
		Vectors[i] = new V2(0,0);
	}

	that.CustomVector = function(x,y)
	{
		/*var result = 0;
		NextInProduction++;

		result = Vectors[NextInProduction]; 
		result.x = x;
		result.y = y;*/
		
		return(new V2(x,y));
	};

	that.EmptyVector = function()
	{
		//return(Vectors[NextInProduction++]);
		return(new V2(0,0));
	};

	that.Reboot = function()
	{
		var EarlierLimit = Vectors.length;
		Vectors = [];
		for(var i = 0; i < EarlierLimit; i++)
		{
			Vectors[i] = new V2(0,0);
		}
	};

	return(that);
}

function CanvasBox(canvas, xLeft, xRight, yTop, yBot)
{
	this.canvas = canvas;
	this.xLeft = xLeft;
	this.xRight = xRight;
	this.yTop = yTop;
	this.yBot = yBot;
}