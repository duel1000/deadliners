defineClass('Consoloid.Topic.FallbackDialog', 'Consoloid.Ui.Dialog',
  {
    __constructor: function(options)
    {
      this.__base($.extend({
        responseTemplateId: 'Consoloid-Topic-FallbackDialog',
      }, options));
    },

    setup: function()
    {
      this.expression.text = this.arguments.text;
    }
  }
);
