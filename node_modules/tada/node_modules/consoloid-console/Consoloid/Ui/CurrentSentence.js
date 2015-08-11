defineClass('Consoloid.Ui.CurrentSentence', 'Consoloid.Base.Object',
  {
    __constructor: function(options)
    {
      this.__base($.extend({
      }, options));
    },

    set: function(expression)
    {
      this.expression = expression;
      this.pattern = new RegExp(expression.pattern.replace(/ <[^>]+>/g, '\\s?(.*)'));
    },

    clear: function()
    {
      this.expression = undefined;
      this._isMatching = false;
    },

    parse: function(text)
    {
      if (!this.expression) {
        this._isMatching = false;
        return;
      }

      if (!this.expression.getSentence().hasArguments()) {
        this._isMatching = text == this.expression.pattern;
      } else {
        this.text = text;
        this.argumentValues = this.pattern.exec(text);
        this._isMatching = this.argumentValues ? true : false;
        if (this._isMatching) {
          this.argumentValues.shift();
          this.__buildArguments();
        }
      }
    },

    __buildArguments: function()
    {
      this.arguments = [];
      var sentence = this.expression.getSentence();
      var expressionTokens = this.expression.getTokens();
      var cursorPosition = 0;
      var argumentIndex = 0;
      var word;
      for (var i = 0, len = expressionTokens.length; i < len; i++) {
        word = expressionTokens[i].text;
        if (expressionTokens[i].type != Consoloid.Interpreter.Token.LITERAL) {
          word = this.argumentValues[argumentIndex];
          this.arguments.push({
            value: word,
            name: expressionTokens[i].text,
            entity: sentence.getArgument(expressionTokens[i].text),
            selection: [cursorPosition, cursorPosition + word.length]
          });
          argumentIndex++;
        }
        cursorPosition += word.length + 1;
      }
    },

    isMatching: function()
    {
      return this._isMatching;
    },

    getArgument: function(cursorPosition)
    {
      if (!this.__isHandleableCursorPosition(cursorPosition)) {
        return;
      }

      var argumentValue;
      for (var i = 0, len = this.arguments.length; i < len; i++) {
        argumentValue = this.arguments[i];
        if (cursorPosition >= argumentValue.selection[0] && cursorPosition <= argumentValue.selection[1]) {
          return argumentValue;
        }
      }
    },

    __isHandleableCursorPosition: function(cursorPosition)
    {
      if (!this._isMatching || cursorPosition < 0 || cursorPosition > this.text.length || !this.expression.getSentence().hasArguments()) {
        return false;
      }
      return true;
    },

    getNextArgumentSelection: function(cursorPosition)
    {
      if (!this.__isHandleableCursorPosition(cursorPosition)) {
        return [0,0];
      }

      for (var i = 0, len = this.arguments.length; i < len; i++) {
        var argumentValue = this.arguments[i];
        if (cursorPosition < argumentValue.selection[0]) {
          return this.arguments[i].selection;
        }
      }

      return this.arguments[0].selection;
    },

    getPrevArgumentSelection: function(cursorPosition)
    {
      if (!this.__isHandleableCursorPosition(cursorPosition)) {
        return [0,0];
      }

      for (var i = this.arguments.length - 1; i >= 0; i--) {
        var argumentValue = this.arguments[i];
        if (cursorPosition > argumentValue.selection[1]) {
          return this.arguments[i].selection;
        }
      }

      return this.arguments[this.arguments.length - 1].selection;
    },

    getSentence: function()
    {
      return this.expression.getSentence();
    },

    getNamedArguments: function()
    {
      var
        argument,
        arguments = {};

      for (var i = 0, len = this.arguments.length; i < len; i++) {
        argument = this.arguments[i];
        arguments[argument.name] = {
          name: argument.name,
          entity: this.__getContextObject(argument.value, argument.entity),
          value: argument.value,
          cls: argument.entity.getType()
        }
      }

      return arguments;
    },

    __getContextObject: function(value, argumentEntity)
    {
      if (!argumentEntity.isComplexType()) {
        return;
      }

      return this.get('context').getByClassAndString(argumentEntity.getType(), value);
    },
  }
);