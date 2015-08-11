defineClass('Consoloid.Interpreter.Argument', 'Consoloid.Interpreter.Tokenizable',
  {
    __constructor: function(options)
    {
      this.__base($.extend({
        required: false
      }, options));

      this.requireProperty('type');
      this.requireProperty('pattern');

      this._tokenize(this.pattern);
    },

    isRequired: function()
    {
      return this.required;
    },

    getType: function()
    {
      return this.type;
    },

    hasValue: function()
    {
      return this.pattern.indexOf('<value>') != -1;
    },

    getText: function(value)
    {
      if (value === null) {
        value = '';
      }
      return this.pattern.replace('<value>', value);
    },

    isComplexType: function()
    {
        return this.type != 'string' && this.type != 'boolean' ;
    }
  }
);
