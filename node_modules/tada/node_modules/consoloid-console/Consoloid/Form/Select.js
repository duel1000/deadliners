defineClass('Consoloid.Form.Select', 'Consoloid.Form.AutoValidatingField',
  {
    __constructor: function(options)
    {
      this.__base($.extend({
        templateId: 'Consoloid-Form-Select',
        autoValidateTimeout: 600
      }, options));

      this.addEventListener('select[id=' + this.id + ']', 'blur', this.autoValidate.bind(this));
      this.addEventListener('select[id=' + this.id + ']', 'change', this.autoValidate.bind(this));
    },

    parseUserInput: function()
    {
      this.value = $("#" + this.id + ' :selected').val();
    }
});
