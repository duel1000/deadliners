defineClass('Consoloid.Form.Validator.NonEmpty', 'Consoloid.Form.Validator.BaseValidator',
  {
    __constructor: function(options)
    {
      this.__base($.extend({
        message: "This field is required."
      }, options));
    },

    validateField: function(field)
    {
      if (field.getValue() == "" || field.getValue() == null) {
        field.setErrorMessage(this.get('translator').trans(this.message));
        return false;
      }

      return true;
    }
  }
);