defineClass('Consoloid.Speech.InputButton', 'Consoloid.Base.Object',
  {
    __constructor: function(options)
    {
      this.__base(options);
      this.requireProperty('recognizer');

      if (options.buttonNode) {
        this.setButtonNode(options.buttonNode);
      }
    },

    setOutputNode: function(node)
    {
      this.outputNode = node;
    },

    setButtonNode: function(node)
    {
      this.buttonNode = node;
      this.buttonNode.click(this.clicked.bind(this));
    },

    clicked: function(event)
    {
      if (this.recognitionId) {
        this.__abort();
        return;
      }

      this.recognitionId = this.recognizer.start({
        result: this.handleRecognitionCompleted.bind(this),
        nomatch: this.handleRecognitionFailed.bind(this),
        end: this.handleRecognitionFailed.bind(this),
        error: this.handleRecognitionFailed.bind(this),
        soundstart: this.handleSoundPulse.bind(this)
      });

      if (!this.recognitionId) {
        // another recognition is pending.
        return;
      }

      this.__disableButtonClick();
    },

    __abort: function()
    {
      this.recognizer.abort(this.recognitionId);
      this.__enableButtonClick();
    },

    __disableButtonClick: function()
    {
      this.buttonNode.css('opacity', '0.55');
    },

    handleRecognitionCompleted: function(event)
    {
      this.__enableButtonClick();
      this.outputNode.val(this.__tryTofixGrammer(event.options[0].text));
    },

    __enableButtonClick: function()
    {
      this.buttonNode.css('opacity', '1');
      this.recognitionId = undefined;
    },

    __tryTofixGrammer: function(text)
    {
      if (!this.grammerFixer) {
        return text;
      }

      return this.grammerFixer.fix(text);
    },

    handleRecognitionFailed: function(event)
    {
      this.__enableButtonClick();
    },

    handleSoundPulse: function(event)
    {
    }
  }
);
