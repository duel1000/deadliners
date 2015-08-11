defineClass('Consoloid.Interpreter.DialogLauncher', 'Consoloid.Base.Object',
  {
    __constructor: function(options)
    {
      this.__base($.extend({
        fallbackSentence: 'default_fallback_sentence',
        ambiguousityAvoiderSentence: 'default_ambiguousity_avoider_sentence',
        argumentFixerSentence: 'default_argument_fixer_sentence'
      }, options));

      if (!('advisor' in this)) {
        this.advisor = this.get('autocomplete_advisor');
      }
    },

    startFromText: function(text)
    {
      if (!text) {
        return;
      }

      var sentence;
      var options = [];

      try {
        options = this.__getAllAutocompleteOptions(text);
      } catch (error) {
        window.alert(error);
        return false;
      }

      switch (options.length) {
        case 0:
          return this.__startFallbackDialog(text);
        case 1:
          return this.__startDialog(options[0]);
        default:
          if (options[0].score > options[1].score) {
            return this.__startDialog(options[0]);
          }

          sentence = this.get(this.ambiguousityAvoiderSentence);
          return this.__startDialog({
            sentence: sentence,
            expression: sentence.getExpressions()[0],
            arguments: { options: options, text: text },
            value: text
          });
      }
    },

    __getAllAutocompleteOptions: function(text)
    {
      var input = this.__parseInput(text);
      return this.advisor.autocomplete(input.text, input.arguments);
    },

    autocompleteExpression: function(text)
    {
      var options = this.__getAllAutocompleteOptions(text);

      return options.filter(function(option) {
        return !Object.keys(option.arguments).some(function(key) {
          return option.arguments[key].erroneous;
        });
      });
    },

    __parseInput: function(text)
    {
      var elements = $.map(text.split(','), function(str) {
        return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
      });

      var text = elements.shift();
      return {
        text: text,
        arguments: elements
      };
    },

    __startFallbackDialog: function(text)
    {
      sentence = this.get(this.fallbackSentence);
      return this.__startDialog({
        sentence: sentence,
        expression: sentence.getExpressions()[0],
        arguments: { text: text },
        value: text
      });
    },

    __startDialog: function(options)
    {
      options.arguments = options.arguments || {};
      if (!options.expression.areArgumentsValid(options.arguments)) {
        var expression = this.get(this.argumentFixerSentence).getExpressions()[0];
        return expression.doIt({ text: options.value, options: options });
      }

      try {
        this.lastSentence = options.sentence;
        this.get('logger').log('info', 'Launching dialog', {
          text: options.value,
          arguments: this.getSimpleArgumentKeyValuePairs(options.arguments),
          service: options.sentence.service
        });
        return options.expression.doIt(options.arguments);
      } catch (err) {
        this.trigger('Consoloid.Interpreter.DialogLauncher.FailedToStartDialog', {
          exception: err,
          selectedOption: options
        });
        throw err;
      }
    },

    getSimpleArgumentKeyValuePairs: function(args)
    {
      var keyValue = {};

      for (key in args) {
        keyValue[key] = args[key].entity ? args[key].entity.toString() : args[key].value;
      }

      return keyValue;
    },

    getLastSentence: function()
    {
      return this.lastSentence;
    },

    startFromService: function(serviceName, arguments)
    {
      var sentence = this.get(serviceName);
      return this.__startDialog({
        sentence: sentence,
        arguments: arguments,
        expression: sentence.getExpressions()[0]
      });
    },
  }
);
