require('consoloid-framework/Consoloid/Test/Environment');
defineClass('Consoloid.Test.ConsoleEnvironment', 'Consoloid.Test.Environment',
  {
    __constructor: function(options)
    {
      $this = this;
      $this.__base($.extend({
      }), options);

      $this.tokenMocks = {};
      $this.__createTokenizerMock();
      $this.__createTranslatorMock();
    },

    setTokenMocks: function(tokenMocks)
    {
      $this.tokenMocks = tokenMocks;
    },

    __createTokenizerMock: function()
    {
      $this.addServiceMock('tokenizer', {
        parse: function(text) {
          if (!text || text == '') {
            throw new Error('Tokenizer mock requires input.');
          }
          if (!$.isEmptyObject($this.tokenMocks)) {
            return $this.tokenMocks[text];
          } else {
            return text.split(" ");
          }
        }
      });
    },

    __createTranslatorMock: function()
    {
      $this.addServiceMock('translator', { trans: function(item) { return item; } });
    },

    shutdown: function() {
      $this.__base();
      $this.tokenMocks = {};
    }
  }
);