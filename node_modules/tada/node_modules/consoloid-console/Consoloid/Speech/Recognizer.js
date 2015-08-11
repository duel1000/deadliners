defineClass('Consoloid.Speech.Recognizer', 'Consoloid.Base.Object',
  {
    __constructor: function(options)
    {
      this.__base($.extend({
        language: 'en',
        engineServiceNames: [ 'webkit_speech_recognition' ]
      }, options));

      this.__createRecognizer();
      this.listenersOfActiveRecognition = null;
      this.pendingRecognitionId = undefined;
      this.nextRecognitionId = 1;
    },

    __createRecognizer: function()
    {
      this.engineServiceNames.some(function(engineServiceName) {
        var engine = this.get(engineServiceName);
        if (engine.isSupportedBySystem()) {
          return this.__setupEngine(engine);
        }
      }.bind(this));
    },

    __setupEngine: function(engine)
    {
      this.engine = engine;
      this.engine.setLanguage(this.language);

      var
        forwarder = this.forwardEventToActiveInput.bind(this),
        completionHandler = this.handleRecognitionCompleted.bind(this);

      this.engine.setListeners({
        'start': forwarder,
        'audiostart': forwarder,
        'soundstart': forwarder,
        'speechstart': forwarder,
        'speechend': forwarder,
        'soundend': forwarder,
        'audioend': forwarder,
        'end': completionHandler,
        'result': completionHandler,
        'nomatch': completionHandler,
        'error': completionHandler
      });

      return true;
    },

    forwardEventToActiveInput: function(event)
    {
      if (this.pendingRecognitionId && event.type in this.listenersOfActiveRecognition) {
        this.listenersOfActiveRecognition[event.type](event);
      }
    },

    handleRecognitionCompleted: function(event)
    {
      this.forwardEventToActiveInput(event);
      this.__clearPendingRecognition();
    },

    __clearPendingRecognition: function()
    {
      this.pendingRecognitionId = undefined;
      this.listenersOfActiveRecognition = null;
    },

    isSpeechRecognitionSupported: function()
    {
      return this.engine !== undefined;
    },

    start: function(listeners)
    {
      if (!this.isSpeechRecognitionSupported()) {
        throw this.create('Consoloid.Error.UserMessage', { message: 'Speech recognition is not supported by your browser. Please use a browser like desktop Chrome!' });
      }

      if (this.isRecognitionPending()) {
        return false;
      }

      this.pendingRecognitionId = this.nextRecognitionId++;
      this.listenersOfActiveRecognition = listeners;

      this.engine.start();

      return this.pendingRecognitionId;
    },

    isRecognitionPending: function()
    {
      return this.pendingRecognitionId !== undefined;
    },

    abort: function(recognitionId)
    {
      if (!this.isRecognitionPending() || recognitionId != this.pendingRecognitionId) {
        return;
      }

      this.__clearPendingRecognition();
      this.engine.abort();

      return this;
    }
  }
);