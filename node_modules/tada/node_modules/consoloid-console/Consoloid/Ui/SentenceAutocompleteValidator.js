defineClass('Consoloid.Ui.SentenceAutocompleteValidator', 'Consoloid.Form.Validator.BaseValidator',
  {
    __constructor: function(options)
    {
      this.__base(options);
      this.requireProperty('expression');
    },

    validate: function(field)
    {
      this.__getFirstAutocompleteResultFromDialogLauncher();

      if (!this.autocompleteResult) {
        this.__handleNonMatchingArguments();
        return false;
      } else {
        this.__handleMatchingArguments();
      }

      var result = true;

      this.fieldNames.forEach(function(name) {
        var argument = this.autocompleteResult.arguments[name];
        if (argument.erroneous) {
          this.get('form').getField(name).setErrorMessage(argument.message);
          if (!field || field.getName() == name) {
            result = false;
          }
        }
        this.get('form').getField(name).renderErrorMessage();
      }.bind(this));

      return result;
    },

    validateField: function(field)
    {
      return this.validate(field);
    },

    __handleNonMatchingArguments: function()
    {
      this.fields.forEach(function(field) {
        field.setErrorMessage(__("Arguments do not match."));
        field.renderErrorMessage();
      });
    },

    __handleMatchingArguments: function()
    {
      this.fields.forEach(function(field) {
        field.clearError();
      });
    },

    __getFirstAutocompleteResultFromDialogLauncher: function() {
      var args = {};
      this.fieldNames.forEach(function(key) {
        this.get('form').getField(key).parseUserInput();
        args[key] = {
          value: this.get('form').getField(key).getValue()
        };
      }.bind(this));
      this.autocompleteResult = this.get("autocomplete_advisor").matchArgumentsToExpression(this.expression.getTextWithArguments(args), this.expression, this.get('form').getValue())[0];
    }
  }
);