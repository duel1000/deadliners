defineClass('Consoloid.Context.Tree', 'Consoloid.Interpreter.LetterTree',
  {
    autocomplete: function(text, cls)
    {
      this.requestedClass = cls;
      this.includeSameNames = false;
      this.requestedSentence = undefined;
      this.requestedArgument = undefined;
      this.requestedArgumentValues = undefined;
      return this.__initializeAutocompleteResults(text);
    },

    autocompleteWithSentence: function(text, argumentName, sentence, argumentValues)
    {
      this.includeSameNames = false;
      this.requestedSentence = sentence;
      this.requestedArgumentValues = argumentValues;
      this.requestedArgument = argumentValues[argumentName];
      this.requestedClass = argumentValues[argumentName].cls;
      return this.__initializeAutocompleteResults(text);
    },

    findTokens: function(word, cls)
    {
      this.requestedClass = cls;
      this.includeSameNames = true;
      this.requestedSentence = undefined;
      this.requestedArgument = undefined;
      this.requestedArgumentValues = undefined;
      return this._findTokens(word, true);
    },

    __initializeAutocompleteResults: function(word)
    {
      var result = [];
      var hit;
      var exactHit;
      this._findTokens(word).forEach(function(token) {
        var entity = token.getEntity().cast(this.requestedClass);

        if (this.requestedArgument) {
          this.requestedArgument.value = entity.toString();
          this.requestedArgument.entity = entity;
          if (!this.requestedSentence.validateArguments(this.requestedArgumentValues)) {
            return;
          }
        }

        hit = {
          entity: entity,
          value: entity.toString(),
          tokens: [ token ],
          exactMatch: word == token.getText()
        };

        if (hit.exactMatch) {
          exactHit = hit;
        } else {
          result.unshift(hit);
        }

      }, this);
      if (exactHit) {
        result.unshift(exactHit);
      }
      return result;
    },

    __isEntityIsReferredInTokens: function(currentToken, tokens)
    {
      if (!currentToken.getEntity().isCastable(this.requestedClass)) {
        return true;
      };

      if (this.includeSameNames) {
        return this.__base(currentToken, tokens);
      }

      var result = false;
      tokens.some(function(token) {
        if (token.getText() == currentToken.getEntity().toString() || token.getEntity() === currentToken.getEntity()) {
          result = true;
        }
        return result;
      });
      return result;
    }
  }
);
