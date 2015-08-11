defineClass('Consoloid.Form.Text', 'Consoloid.Form.AutoValidatingField',
  {
    __constructor: function(options)
    {
      this.__base($.extend({
        templateId: 'Consoloid-Form-Text',
        type: "text",
        autoValidateTimeout: 600
      }, options));

      var allowedTypes = ["text", "password", "color", "date", "datetime", "datetime-local", "email", "month", "number", "range", "search", "tel", "time", "url", "week"];

      if (allowedTypes.indexOf(this.type) == -1) {
        throw new Error("Unknown input type; name='" + this.name + "', prefix='" + this.prefix + "'");
      }

      this.addEventListener('input[id=' + this.id + ']', 'blur', this.autoValidate.bind(this));
      this.addEventListener('input[id=' + this.id + ']', 'keydown', this.autoValidate.bind(this));
    },

    parseUserInput: function()
    {
      this.value = $("#" + this.id).val();
    },

    focus: function()
    {
      this.node.find('input[id=' + this.id + ']').focus();
    }
});
