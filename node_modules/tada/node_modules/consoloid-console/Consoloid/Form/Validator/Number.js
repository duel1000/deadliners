defineClass('Consoloid.Form.Validator.Number', 'Consoloid.Form.Validator.BaseValidator',
  {
    __constructor: function(options)
    {
      this.__base($.extend({
        min: undefined,
        minMessage: "Values less than %min% is not allowed",
        max: undefined,
        maxMessage: "Values greater than %max% is not allowed",
        step: undefined,
        stepMessage: "Allowed stepping is %step%",
        nanMessage: "Number required",
        allowEmpty: false
      }, options));

      if (this.min !== undefined && this.max !== undefined && this.min > this.max) {
        throw new Error("invalid min-max pair");
      }
    },

    validateField: function(field)
    {
      var value = field.getValue().toString() || '';

      if (this.allowEmpty && value == '') {
        return true;
      }

      if (!value.match(/^-?\d+(\.\d+)?$/)) {
        field.setErrorMessage(this.get('translator').trans(this.nanMessage));
        return false;
      }

      value = parseFloat(value);

      if (this.min !== undefined && value < this.min) {
        field.setErrorMessage(this.get('translator').trans(this.minMessage, { '%min%': this.min }));
        return false;
      }

      if (this.max !== undefined && value > this.max) {
        field.setErrorMessage(this.get('translator').trans(this.maxMessage, { '%max%': this.max }));
        return false;
      }

      if (this.step !== undefined && value % this.step != 0) {
        field.setErrorMessage(this.get('translator').trans(this.stepMessage, { '%step%': this.step }));
        return false;
      }

      return true;
    }
  }
);