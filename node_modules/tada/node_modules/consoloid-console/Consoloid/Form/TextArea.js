defineClass('Consoloid.Form.TextArea', 'Consoloid.Form.AutoValidatingField',
  {
    __constructor: function(options)
    {
      this.__base($.extend({
        templateId: 'Consoloid-Form-TextArea',
        autoValidateTimeout: 600
      }, options));
      
      this.addEventListener('textarea[id=' + this.id + ']', 'blur', this.autoValidate.bind(this));
      this.addEventListener('textarea[id=' + this.id + ']', 'keydown', this.autoValidate.bind(this));
    },

    parseUserInput: function()
    {
      this.value = $("#" + this.id).val();
    }
});
