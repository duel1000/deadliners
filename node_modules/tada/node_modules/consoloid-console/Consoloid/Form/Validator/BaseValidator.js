defineClass('Consoloid.Form.Validator.BaseValidator', 'Consoloid.Base.Object',
  {
    __constructor: function(options)
    {
      this.__base($.extend({
        fieldNames: []
      }, options));

      this.__lookupFields();
      this.__registerOnFields();
    },

    __lookupFields: function()
    {
      this.fields = [];

      var $this = this;
      var form = this.container.get('form');
      this.fieldNames.forEach(function(name) {
        $this.fields.push(form.getField(name));
      });
    },

    __registerOnFields: function()
    {
      var $this = this;
      this.fields.forEach(function(field) {
        field.addValidator($this);
      });
    },

    /**
     * Validate configured fields.
     *
     * @return true when fields passes validation. False otherwise.
     */
    validate: function()
    {
      var result = true;
      var $this = this;
      this.fields.forEach(function(field) {
        result &= $this.validateField(field);
      });

      return result ? true : false;
    },

    validateField: function(field)
    {
      return false;
    }
  }
);