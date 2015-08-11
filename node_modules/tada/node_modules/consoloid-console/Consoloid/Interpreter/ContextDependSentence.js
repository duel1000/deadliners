defineClass('Consoloid.Interpreter.ContextDependSentence', 'Consoloid.Interpreter.Sentence',
  {
    __constructor: function(options)
    {
      this.__base($.extend(true, {
        requiredContextIsAvailable: {
          service: 'context_type_expector',
          method: 'typesIsPresent',
          options: {
            types: []
          }
        },
      }, options));
    },
  }
);
