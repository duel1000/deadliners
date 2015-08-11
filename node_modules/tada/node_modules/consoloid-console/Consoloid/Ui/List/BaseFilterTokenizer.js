defineClass('Consoloid.Ui.List.BaseFilterTokenizer', 'Consoloid.Interpreter.Tokenizer',
  {
    __constructor: function(options)
    {
      this.__base(options);
      this.requireProperty('keys');

      this.__translateKeys();
    },

    __translateKeys: function()
    {
      this.translatedKeys = {};
      var translator = this.get("translator");
      $.each(this.keys, (function(index, key) {
        key = key.toLowerCase();
        this.translatedKeys[translator.trans(key)] = key;
      }).bind(this));
    },

    tokenize: function(filterString)
    {
      var response = {};
      var tokens = this.parse(filterString);

      for(var i = 0; i < tokens.length; i++) {
        if (i % 2 == 0) {
          var key = this.__removeTrailingColon(tokens[i]);
          var originalKey = this.__getOriginalKey(key);
          response[originalKey] = tokens[i + 1];
        }
      }

      return response;
    },

    __removeTrailingColon: function(token)
    {
      if (token[token.length - 1] == ":") {
        return token.substring(0, token.length - 1);
      }

      return token;
    },

    __getOriginalKey: function(key)
    {
      key = key.toLowerCase();
      if (this.translatedKeys[key] == undefined) {
        throw this.create("Consoloid.Error.UserMessage", {
          message: this.get('translator').trans("Unknown key: %key%", { '%key%': key })
        });
      }

      return this.translatedKeys[key];
    }

  }
);
