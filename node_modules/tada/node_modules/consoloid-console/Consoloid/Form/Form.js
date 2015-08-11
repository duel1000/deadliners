defineClass('Consoloid.Form.Form', 'Consoloid.Form.FieldSet',
  {
    __constructor: function(options)
    {
      options.prefix = options.name || undefined;

      // call grandparent constructor
      Consoloid.Form.BaseField.prototype.__constructor.apply(this, [ $.extend({
        templateId: 'Consoloid-Form-FieldSet',
        fieldDefinitions: {},
        validatorDefinitions: {},
      }, options) ]);

      this.container = this.create('Consoloid.Service.ChainedContainer', { fallback: options.container || undefined });
      this.container.addSharedObject('form', this);

      this.fields = {};
      this.fieldsCreated = false;
    },

    validate: function()
    {
      this.__createFields();
      this.clearError();

      var result = true;
      $.each(this.validators, function(name, validator) {
        result &= validator.validate();
      });

      return result ? true : false;
    },

    __createFields: function()
    {
      if (this.fieldsCreated) {
        return;
      }

      this.id = this.prefix + '-' + this.name;
      this.createFieldsFromDefinitions();
      this.__createValidatorsFromDefinitions();
      this.fieldsCreated = true;
    },

    __createValidatorsFromDefinitions: function()
    {
      var $this = this;
      this.validators = {};
      $.each(this.validatorDefinitions, function(name, definition) {
        $this.validators[name] = $this.create(definition.cls, $this.__extendFieldOptions(name, definition.options || {}));
      });
    },

    getFieldValue: function(name)
    {
      this.__createFields();
      return this.getField(name).getValue();
    },

    setFieldValue: function(name, value)
    {
      this.__createFields();
      this.getField(name).setValue(value);
      return this;
    },

    getValue: function()
    {
      this.__createFields();
      return this.__base();
    },

    setValue: function(value)
    {
      this.__createFields();
      return this.__base(value);
    },

    render: function()
    {
      this.__createFields();
      return this.__base();
    }
  }
);