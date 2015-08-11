defineClass('Consoloid.Interpreter.Token', 'Consoloid.Base.Object',
  {
    __constructor: function(options)
    {
      this.__base(options);

      this.requireProperty('type');
      this.requireProperty('text');
      this.requireProperty('index');
      this.requireProperty('entity');
    },

    getText: function()
    {
      return this.text;
    },

    getType: function()
    {
      return this.type;
    },

    getIndex: function()
    {
      return this.index;
    },

    getEntity: function()
    {
      return this.entity;
    }
  },
  {
    ARGUMENT_VALUE: 1,
    LITERAL: 2
  }
);
