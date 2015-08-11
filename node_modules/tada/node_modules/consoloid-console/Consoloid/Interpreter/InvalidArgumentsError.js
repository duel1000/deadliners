defineClass('Consoloid.Interpreter.InvalidArgumentsError', 'Consoloid.Base.Object',
{
  __constructor: function(options)
  {
    this.__base(options);
    this.requireProperty('message');
    this.requireProperty('arguments');
  },

  getArguments: function()
  {
    return this.arguments;
  },

  toString: function()
  {
    return this.message;
  }
});
