defineClass('Consoloid.Form.Validator.Email', 'Consoloid.Form.Validator.BaseValidator',
  {
    __constructor: function(options)
    {
      this.__base($.extend({
        errorMessage: "Invalid email address"
      }, options));
    },

    validateField: function(field)
    {
      var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

      if (re.test(field.getValue())) {
        return true;
      }

      field.setErrorMessage(this.get('translator').trans(this.errorMessage));
      return false;
    }
  }
);
