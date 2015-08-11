defineClass('Consoloid.Interpreter.Tokenizable', 'Consoloid.Base.Object',
  {
    /**
     * Tokenizes given text and stores tokens in this.tokens.
     *
     * This method should be used by descendants to create tokens.
     *
     * @param String text
     * @return void
     */
    _tokenize: function(text)
    {
      var $this = this;
      var words = [];
      this.tokens = [];

      words = this.get('tokenizer').parse(text);

      getClass('Consoloid.Interpreter.Token');
      $.each(words, function(index, word) {
        var isArgumentValue = (word[0] == '<' && word.indexOf(' ') == -1 && word[word.length - 1] == '>');
        $this.tokens.push(new Consoloid.Interpreter.Token({
          type: isArgumentValue ? Consoloid.Interpreter.Token.ARGUMENT_VALUE : Consoloid.Interpreter.Token.LITERAL,
          text: isArgumentValue ? word.substr(1, word.length - 2) : word,
          index: index,
          entity: $this
        }));
      });
    },

    getTokens: function()
    {
      return this.tokens;
    }
  }
);
