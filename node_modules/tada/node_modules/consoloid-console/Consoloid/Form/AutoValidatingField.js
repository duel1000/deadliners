defineClass('Consoloid.Form.AutoValidatingField', 'Consoloid.Form.BaseField',
  {
    __constructor: function(options)
    {
      this.__base($.extend({
        autoValidateTimeout: undefined,
      }, options));

      this.timer = undefined;
    },

    autoValidate: function()
    {
      if (!this.autoValidateTimeout) {
        return;
      }

      this.__clearTimer();
      this.timer = setTimeout(this._autoValidateField.bind(this), this.autoValidateTimeout);
    },

    __clearTimer: function()
    {
      if (this.timer) {
        clearTimeout(this.timer);
      }
      this.timer = undefined;
    },

    _autoValidateField: function()
    {
      this.__clearTimer();

      this.parseUserInput();

      var hadError = this.hasError();
      var valid = this.validate();

      if (!valid || (valid && hadError)) {
        this.renderErrorMessage();
      }
    }
  }
);