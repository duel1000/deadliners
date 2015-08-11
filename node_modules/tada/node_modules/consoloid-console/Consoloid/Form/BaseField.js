defineClass('Consoloid.Form.BaseField', 'Consoloid.Widget.Widget',
  {
    __constructor: function(options)
    {
      this.__base($.extend({
        templateId: 'Consoloid-Form-BaseField',
        value: undefined,
        enabled: true,
        title: undefined,
        description: undefined,
        errorMessage: undefined,
        focusable: true
      }, options));

      this.requireProperty('name');
      this.requireProperty('prefix');
      this.id = this.prefix + '-' + this.name;
      this.validators = [];
    },

    disable: function()
    {
      this.enabled = false;
    },

    enable: function()
    {
      this.enabled = true;
    },

    parseUserInput: function()
    {
    },

    getId: function()
    {
      return this.id;
    },

    getValue: function()
    {
      return this.value;
    },

    setValue: function(value)
    {
      this.value = value;
    },

    getTitle: function()
    {
      return this.title;
    },

    setTitle: function(title)
    {
      this.title = title;
    },

    getErrorMessage: function()
    {
      return this.errorMessage;
    },

    setErrorMessage: function(message)
    {
      this.errorMessage = message;
    },

    hasError: function()
    {
      return this.errorMessage !== undefined;
    },

    clearError: function()
    {
      this.errorMessage = undefined;
    },

    addValidator: function(validator)
    {
      this.validators.push(validator);
    },

    validate: function()
    {
      var result = true;

      this.clearError();

      var $this = this;
      this.validators.forEach(function(validator) {
        result &= validator.validateField($this);
      });

      return result ? true : false;
    },

    isFocusable: function()
    {
      return this.focusable;
    },

    focus: function()
    {
    },

    renderErrorMessage: function()
    {
      if (this.errorMessage) {
        this.node.find('.error').html('<span class="error">' + this.errorMessage + '</span>');
      } else {
        this.node.find('.error').empty();
      }
    },

    getName: function()
    {
      return this.name;
    }
});
