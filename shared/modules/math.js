(function (exports) 
{
	exports.V2 = function(x,y)
	{
		this.x = x;
		this.y = y;
	};

	exports.V2.prototype.Add = function(V2)
	{
		this.x += V2.x;
		this.y += V2.y;
	};

	exports.V2.prototype.Invert = function(V2)
	{
		this.x = -this.x;
		this.y = -this.y;	
	};

	exports.V2.prototype.Clear = function()
	{
		this.x = null;
		this.y = null;
	};

	exports.V2.prototype.getLength = function() 
	{
		return(Math.sqrt(this.x * this.x + this.y * this.y));
	};

}(typeof exports === 'undefined' ? this.FILENAME = {} : exports));