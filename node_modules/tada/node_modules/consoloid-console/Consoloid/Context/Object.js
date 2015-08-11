defineClass('Consoloid.Context.Object', 'Consoloid.Interpreter.Tokenizable',
  {
    __constructor: function(options)
    {
        this.__base(options);

        this.requireProperty('name');

        this._tokenize(this.toString());
    },

    toString: function()
    {
        return ''+this.name;
    },

    isCastable: function(cls)
    {
        if (typeof cls == 'string') {
            cls = getClass(cls);
        }

        if (this instanceof cls) {
            return true;
        }

        return false;
    },

    isSameClass: function(cls)
    {
        if (typeof cls == 'string') {
            cls = getClass(cls);
        }

        if (this.__self == cls) {
            return true;
        }

        return false;
    },

    cast: function(cls)
    {
        if (this.isCastable(cls)) {
            return this;
        }

        throw new Error('Unable to cast');
    },

    _tokenize: function(text)
    {
      getClass('Consoloid.Interpreter.Token');
      var $this = this;
      var token = new Consoloid.Interpreter.Token({
        type: Consoloid.Interpreter.Token.LITERAL,
        text: text,
        index: 0,
        entity: $this
      })
      this.tokens = [ token ];
    },

    mention: function()
    {
        this.get('context').add(this);
    }
  },
  {
    fromString: function(str, container)
    {
      return null;
    }
  }
);
