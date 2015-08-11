defineClass('Consoloid.Ui.ArgumentFixerDialog', 'Consoloid.Ui.MultiStateDialog',
  {
    __constructor: function(options)
    {
      this.__base($.extend({
        states: {
          'active': 'Consoloid-Ui-ArgumentFixerDialogActive',
          'done': 'Consoloid-Ui-ArgumentFixerDialogDone'
        },
        activeState: 'active'
      }, options));

      this
        .addEventListener('a.arguments-read', 'click', this.startDialog);
    },

    startDialog: function()
    {
      this.form.parseUserInput();
      if (!this.form.validate()) {
        return;
      }

      var args = {};

      $.each($.extend({}, this.arguments.options.arguments, this.__getMappedFormValues()), function(name, value) {
        args[name] = value;
      });

      this.argumentsRead = this.form.getValue();
      this.switchState('done');

      this.get('console').prompt.launchDialog(this.arguments.options.expression.getTextWithArguments(args));
    },

    __getMappedFormValues: function()
    {
      var result = {};
      $.each(this.form.getValue(), function(name, value) {
        result[name] = {
          value: value
        };
      });

      return result;
    },

    setup: function()
    {
      this.expression.text = this.arguments.text;
      this.form = this.create('Consoloid.Form.Form', {
        name: 'readArguments' + this.__self.index++,
        fieldDefinitions: this.__getFieldDefinitions(),
        validatorDefinitions: this.__getValidatorDefinitions(),
        container: this.container
      });
      this.__setFieldInitialValues();
    },

    __getFieldDefinitions: function()
    {
      var result = {};
      this.__relevantArgumentNames().forEach(function(name) {
        result[name] = {
          cls: 'Consoloid.Form.Text',
          options: {
            title: name
          }
        };
      });

      return result;
    },

    __relevantArgumentNames: function()
    {
      var result = [];
      $.each(this.arguments.options.sentence.arguments, function(name, argument) {
        if (argument.isRequired() || name in this.arguments.options.arguments) {
          result.push(name);
        }
      }.bind(this));

      return result;
    },

    __getValidatorDefinitions: function()
    {
      var
        requiredFields = [],
        fields = [];
      $.each(this.arguments.options.sentence.arguments, function(name, argument) {
        if (argument.isRequired()) {
          requiredFields.push(name);
        }

        if (argument.isRequired() || name in this.arguments.options.arguments) {
          fields.push(name);
        }
      }.bind(this));

      return {
        nonEmpty: {
          cls: 'Consoloid.Form.Validator.NonEmpty',
          options: {
            fieldNames: requiredFields
          }
        },
        sentenceAutocompleteValidator: {
          cls: 'Consoloid.Ui.SentenceAutocompleteValidator',
          options: {
            fieldNames: fields,
            expression: this.arguments.options.expression
          }
        }
      };
    },

    __setFieldInitialValues: function()
    {
      var values = {};
      var $this = this;

      this.__relevantArgumentNames().forEach(function(name) {
        if (name in $this.arguments.options.arguments) {
          values[name] = $this.arguments.options.arguments[name].value;
        }
      });

      this.form.setValue(values);
    },

    render: function()
    {
      this._updateResponseTemplate();
      this._renderExpressionAndResponse();
      this._renderForm();
      this._animateDialogShowup();
      this._bindEventListeners();
      return this;
    },

    _renderForm: function()
    {
      if (this.activeState != 'active') {
        return;
      }

      this.form
        .setNode(this.node.find('div.form'))
        .render()
        .focus();

      this.__relevantArgumentNames().forEach(function(name) {
        this.form.getField(name).autoValidate();
      }.bind(this));
    }
  },
  {
    index: 0
  }
);
