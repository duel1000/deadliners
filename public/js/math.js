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

function CanvasBox(canvas, xLeft, xRight, yTop, yBot)
{
	this.canvas = canvas;
	this.xLeft = xLeft;
	this.xRight = xRight;
	this.yTop = yTop;
	this.yBot = yBot;
}