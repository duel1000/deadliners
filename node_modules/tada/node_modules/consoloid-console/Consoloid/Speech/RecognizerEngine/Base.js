defineClass('Consoloid.Speech.RecognizerEngine.Base', 'Consoloid.Base.Object',
  {
    __constructor: function(options)
    {
      this.__base($.extend({
        language: 'en',
      }, options));
    },

    setLanguage: function(language)
    {
      this.language = language;
      return this;
    },

    isSupportedBySystem: function()
    {
      return false;
    },

    setListeners: function(listeners)
    {
    },

    start: function()
    {
    },

    abort: function()
    {
    }
  }
);
