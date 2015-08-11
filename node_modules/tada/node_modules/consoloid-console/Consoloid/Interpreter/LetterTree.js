defineClass('Consoloid.Interpreter.LetterTree', 'Consoloid.Interpreter.Letter',
  {
    addEntity: function(entity)
    {
      entity.getTokens().forEach(function(token) {
        if (token.getType() == Consoloid.Interpreter.Token.LITERAL) {
          this.__addToken(token);
        }
      }, this);
    },

    __addToken: function(token)
    {
      var node = this;
      var text = token.getText();
      text.toLowerCase().split('').forEach(function(letter){
        node = node.getOrCreateChild(letter);
        node.addEntity(token);
      });
    },

    removeEntity: function(entity)
    {
      entity.getTokens().forEach(function(token) {
        if (token.getType() == Consoloid.Interpreter.Token.LITERAL) {
          this.__removeToken(token);
        }
      }, this);
    },

    __removeToken: function(token)
    {
      var node = this;
      var text = token.getText();
      text.toLowerCase().split('').forEach(function(letter){
        try {
          var child = node.getChild(letter);
          child.removeEntity(token);
          if (child.getEntities().length == 0) {
            delete node.children[letter];
          }
        } catch (err) {
        }

        node = child;
      });
    },

    /**
     * Search for entities matching given text.
     *
     * @param String text Text to match.
     * @return Array Array of added entities matching given text.
     */
    autocomplete: function(text)
    {
      var words = [];
      try {
        words = this.getWords(text);
      } catch(error) {
        return [];
      }

      var word = words.shift();
      var result = this.__initializeAutocompleteResults(word);

      words.forEach(function(word) {
        result = this.__filterAutocompleteResults(word, result);
      }, this);

      result = this.__removeDuplicateEntites(result);
      return result;
    },

    getWords: function(text)
    {
      return this.get('tokenizer').parse(text);
    },

   /**
   * Initializes autocomplete result set by searching for the first word.
   *
   * @param {Object} word
   * @return Array [{ entity: entity, tokens: [ token, ... ], values: { argument_name: value } }, ...]
   */
    __initializeAutocompleteResults: function(word)
    {
      var result = [];
      this._findTokens(word).forEach(function(token) {
        result.push({
          entity: token.getEntity(),
          tokens: [ token ],
          values: {}
        });
      });

      return result;
    },

    _findTokens: function(word)
    {
      var result = [];
      var node = this;

      try {
        word.split('').forEach(function(letter){
          node = node.getChild(letter.toLowerCase());
        });
        node.getEntities().forEach(function(token){
          if (!this.__isEntityIsReferredInTokens(token, result)) {
            result.push(token);
          }
        }, this);
      } catch(err) {
      }

      return result;
    },

    __isEntityIsReferredInTokens: function(currentToken, tokens)
    {
      return tokens.some(function(token) {
        if (token.getEntity() === currentToken.getEntity() && token.getIndex() === currentToken.getIndex()) {
          return true;
        }
      });
    },

    __filterAutocompleteResults: function(word, result)
    {
      if (!word.length) {
        return result;
      }

      var tokens = this._findTokens(word);
      var length = result.length;
      for (var index = 0; index < length ; index++) {
        var hit = result[index];
        var token = this.__getNextMatchingTokenForAutocompleteResult(hit, tokens);

        if (token) {
          result[index].tokens.push(token);
          if (token.getType() == Consoloid.Interpreter.Token.ARGUMENT_VALUE) {
            result[index].values[token.getText()] = word;
          }
        } else {
          result.splice(index, 1);
          index--;
          length--;
        }
      };

      return result;
    },

    __getNextMatchingTokenForAutocompleteResult: function(hit, tokens)
    {
      var lastTokenIndex = hit.tokens[hit.tokens.length - 1].getIndex();
      var nextLiteralToken = null;

      tokens.forEach(function(token) {
        if (token.getEntity() == hit.entity &&
            token.getIndex() > lastTokenIndex &&
            token.getType() == Consoloid.Interpreter.Token.LITERAL &&
            (nextLiteralToken === null || nextLiteralToken.getIndex() > token.getIndex())
        ) {
          nextLiteralToken = token;
        }
      });

      return nextLiteralToken ? nextLiteralToken : this.__getNextMatchingArgumentValueToken(hit, tokens);
    },

    __getNextMatchingArgumentValueToken: function(hit, tokens)
    {
      var lastTokenIndex = hit.tokens[hit.tokens.length - 1].getIndex();

      var nextArgumentValueToken = null;
      var hitEntityTokens = hit.entity.getTokens();
      var length = hitEntityTokens.length;
      for (var i = lastTokenIndex + 1 ; i < length ; i++) {
        var token = hitEntityTokens[i];
        if (token.getType() == Consoloid.Interpreter.Token.ARGUMENT_VALUE) {
          nextArgumentValueToken = token;
          break;
        }
      }

      return nextArgumentValueToken;
    },

    __removeDuplicateEntites: function(elements) {
      var result = [], needsInsertion;
      elements.forEach(function(element) {
        needsInsertion = true;
        result.forEach(function (resultElement, resultIndex) {
          if (element.entity === resultElement.entity) {
            needsInsertion = false;
            if (element.tokens.length > resultElement.tokens.length) {
              result[resultIndex] = element;
            }
          }
        });
        if (needsInsertion) {
          result.push(element);
        }
      })

      return result;
    }
  }
);
