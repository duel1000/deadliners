defineClass('Consoloid.Interpreter.Expression', 'Consoloid.Interpreter.Tokenizable',
  {
    __constructor: function(options)
    {
      this.__base(options);

      this.requireProperty('sentence');
      this.requireProperty('pattern');

      this.__validate();
      this._tokenize(this.pattern);
    },

    getText: function()
    {
      return this.pattern;
    },

    __validate: function()
    {
      var words = this.pattern.split(" ");
      var $this = this;

      $.each(words, function(index, word) {
        var isArgumentValue = (word[0] == '<' && word[word.length - 1] == '>');
        if (isArgumentValue) {
          var argumentName = word.substr(1, word.length - 2);
          if (!$this.sentence.hasArgument(argumentName)) {
            throw new Error('No such argument: ' + argumentName);
          }
        }
      });
    },

    hasInlineArguments: function()
    {
      return this.tokens.some(function(token, index){
                if (token.getType() == Consoloid.Interpreter.Token.ARGUMENT_VALUE) {
                  return true;
                }
              });
    },

    hasInlineArgument: function(name)
    {
      return this.tokens.some(function(token, index){
                if (token.getText() == name && token.getType() == Consoloid.Interpreter.Token.ARGUMENT_VALUE) {
                  return true;
                }
              });
    },

    getSentence: function()
    {
      return this.sentence;
    },

    getTextWithArguments: function(values)
    {
      var result = this.pattern;
      var argTexts = [];
      var $this = this;

      $.each(values, function(name, value) {
        if (result.indexOf('<' + name + '>') != -1 ) {
          result = result.replace('<' + name + '>', value.value.indexOf(' ') == -1 ? value.value : '"'+value.value+'"');
        } else if ($this.fixedArguments[name] == undefined) {
          if (!(name in $this.getSentence().arguments)) {
            throw new Error(name + ' is not in arguments of sentence: ' + $this.text);
          }
          argTexts.push($this.getSentence().arguments[name].getText(value.value));
        }
      });

      if (argTexts.length > 0) {
        result += ', ' + argTexts.join(', ');
      }

      return result;
    },

    getAutocompleteScore: function(words, args)
    {
      var $this = this;
      var tokens = this.tokens;
      var exactMatch = (words.length == tokens.length);
      var partialMatch = true;
      var noMatch = true;
      var argumentScore = this.__getAutocompleteScoreForArgument(args);

      $.each(words, function(index, word) {
        if (tokens[index].type == Consoloid.Interpreter.Token.ARGUMENT_VALUE) {
          return;
        }

        if (tokens.length < index + 1 || tokens[index].getText().substr(0, word.length).toLowerCase() != word.toLowerCase()) {
          exactMatch = false;
        }

        if (!$this.__wordMatchesAToken.apply($this, [ word, tokens] )) {
          partialMatch = false;
        } else {
          noMatch = false;
        }
      });

      if (exactMatch) {
        return Consoloid.Interpreter.Expression.EXACT_MATCH + argumentScore;
      } else if (partialMatch) {
        return Consoloid.Interpreter.Expression.PARTIAL_MATCH + argumentScore;
      } else if (noMatch) {
        return Consoloid.Interpreter.Expression.NO_MATCH + argumentScore;
      }

      return Consoloid.Interpreter.Expression.CONTAINS_NONMATCHING_WORDS + argumentScore;
    },

    __getAutocompleteScoreForArgument: function(args)
    {
      var
        score = 0,
        exp = Consoloid.Interpreter.Expression;

      Object.keys(args).forEach(function(arg){
        if (args[arg].erroneous) {
          score += exp.NO_ARGUMENT_MATCH;
          return;
        }

        score += args[arg].exactMatch ? exp.EXACT_ARGUMENT_MATCH : exp.PARTIAL_ARGUMENT_MATCH;
      });

      return score;
    },

    __wordMatchesAToken: function(word, tokens)
    {
      var result = false;
      $.each(tokens, function(index, token) {
        result |= (token.getText().toLowerCase().substr(0, word.length) == word.toLowerCase());
      });

      return result;
    },

    areArgumentsValid: function(args)
    {
      var result = true;
      args = $.extend(args || {}, this.fixedArguments);
      $.each(this.sentence.arguments, function(name, argument) {
        if ((argument.isRequired() && !(name in args)) || (name in args && args[name].erroneous)) {
          result = false;
        }
      });

      return result;
    },

    doIt: function(args)
    {
      args = $.extend(args || {}, this.fixedArguments);
      var service = this.get(this.sentence.service);
      return service[this.sentence.method].apply(service, [ args, this ]);
    }
  },
  {
    EXACT_MATCH: 3,
    PARTIAL_MATCH: 2,
    CONTAINS_NONMATCHING_WORDS: 1,
    NO_MATCH: 0,

    EXACT_ARGUMENT_MATCH: 0.02,
    PARTIAL_ARGUMENT_MATCH: 0.01,
    NO_ARGUMENT_MATCH: 0
  }
);
