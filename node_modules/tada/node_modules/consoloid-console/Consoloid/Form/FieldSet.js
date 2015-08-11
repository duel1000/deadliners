defineClass('Consoloid.Form.FieldSet', 'Consoloid.Form.BaseField',
  {
    __constructor: function(options)
    {
      this.__base($.extend({
        templateId: 'Consoloid-Form-FieldSet',
        fieldDefinitions: {}
      }, options));

      this.createFieldsFromDefinitions();
    },

    createFieldsFromDefinitions: function()
    {
      var $this = this;
      this.fields = {};
      $.each(this.fieldDefinitions, function(name, definition) {
        $this.fields[name] = $this.create(definition.cls, $this.__extendFieldOptions(name, definition.options || {}));
      });
    },

    __extendFieldOptions: function(name, options)
    {
      return $.extend({ prefix: this.getId(), name: name, container: this.container }, options);
    },

    getField: function(name)
    {
      var slashPosition = name.indexOf('/');
      var childFieldName = undefined;
      if (slashPosition != -1) {
        childFieldName = name.substr(slashPosition + 1);
        name = name.substr(0, slashPosition);
      }

      if (!(name in this.fields)) {
        throw new Error("No such field; name='" + name + "'");
      }

      if (childFieldName) {
        if (!('getField' in this.fields[name])) {
          throw new Error("getField is not callable on child with name " + name);
        }
        return this.fields[name].getField(childFieldName);
      } else {
        return this.fields[name];
      }
    },

    getValue: function()
    {
      return this.__deepGet('getValue');
    },

    __deepGet: function(method, args)
    {
      args = args || [];

      var result = {};
      $.each(this.fields, function(name, field) {
        result[name] = field[method].apply(field, args);
      });
      return result;
    },

    setValue: function(values)
    {
      this.__deepSet('setValue', values);
    },

    __deepSet: function(method, values)
    {
      var $this = this;
      $.each(values, function(name, value) {
        if (name in $this.fields) {
          $this.fields[name][method](value);
        } else {
          throw new Error('Child field does not exist; name="' + name + '"');
        }
      });
    },

    parseUserInput: function()
    {
      this.__deepGet('parseUserInput');
    },

    disable: function()
    {
      this.__base();
      this.__deepGet('disable');
    },

    enable: function()
    {
      this.__base();
      this.__deepGet('enable');
    },

    render: function()
    {
      this.__base();
      var $this = this;
      $.each(this.fields, function(name, field) {
        field
          .setNode($this.node.find('div.fieldset-item[data-child=' + name + ']'))
          .render();
      });

      return this;
    },

    getErrorMessage: function()
    {
      return this.__deepGet('getErrorMessage');
    },

    setErrorMessage: function(message)
    {
      this.__deepSet('setErrorMessage', message);
    },

    clearError: function()
    {
      this.__deepGet('clearError');
    },

    focus: function()
    {
      var firstChild = Object.keys(this.fields)[0];
      this.fields[firstChild].focus();
    }
  }
);
