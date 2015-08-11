defineClass('Consoloid.Speech.RecognizerEngine.Webkit', 'Consoloid.Speech.RecognizerEngine.Base',
  {
    __constructor: function(options)
    {
      this.__base(options);
      this.__createRecognizer();
    },

    __createRecognizer: function()
    {
      if (window['webkitSpeechRecognition']) {
        this.recognizer = new webkitSpeechRecognition();
      }
    },

    setLanguage: function(language)
    {
      this.__base(language);
      if (this.recognizer) {
        this.recognizer.lang = language;
      }
      return this;
    },

    isSupportedBySystem: function()
    {
      return this.recognizer != undefined;
    },

    setListeners: function(listeners)
    {
      this.__checkRecognizerCreated();

      $.each(listeners, function(type, handler) {
        if (type == 'result') {
          this.recognizer.addEventListener(type, function(event) {
            this.handleRecognitionResult(event, handler);
          }.bind(this));
        } else {
          this.recognizer.addEventListener(type, handler);
        }
      }.bind(this));
    },

    __checkRecognizerCreated: function()
    {
      if (!this.recognizer) {
        throw this.create('Consoloid.Error.UserMessage', { message: 'Webkit speech recognizer is not available' });
      }
    },

    handleRecognitionResult: function(event, recognizerHandler)
    {
      var result = event.results[0][0];

      recognizerHandler({
        type: 'result',
        options: [
          {
            confidence: result.confidence,
            text: result.transcript
          }
        ]
      });
    },

    start: function()
    {
      this.__checkRecognizerCreated();
      this.recognizer.start();
    },

    abort: function()
    {
      this.__checkRecognizerCreated();
      this.recognizer.abort();
    }
  }
);
