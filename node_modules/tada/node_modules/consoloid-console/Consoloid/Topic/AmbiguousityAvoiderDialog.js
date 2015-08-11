defineClass('Consoloid.Topic.AmbiguousityAvoiderDialog', 'Consoloid.Ui.Dialog',
  {
    __constructor: function(options)
    {
      this.__base($.extend({
        responseTemplateId: 'Consoloid-Topic-AmbiguousityAvoider',
      }, options));
    },

    setup: function()
    {
      this.expression.text = this.arguments.text;
    }
  }
);
