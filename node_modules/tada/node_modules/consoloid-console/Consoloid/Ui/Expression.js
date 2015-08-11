defineClass('Consoloid.Ui.Expression', 'Consoloid.Widget.Widget',
  {
    __constructor: function(options)
    {
      this.__base($.extend({
        templateId: 'Consoloid-Ui-Expression',
        node: $('<div />'),
        referenceText: undefined
      }, options));

      this.requireProperty('model');
      this.requireProperty('arguments');
      this.text = this.model.getTextWithArguments(this.arguments);
    },

    setReferenceText: function(referenceText)
    {
      this.referenceText = referenceText;
    },

    update: function(name, value)
    {
      this.arguments[name] = value;
      this.text = this.model.getTextWithArguments(this.arguments);
      return this;
    },

    _encodeTagBoundaries: function(text)
    {
      return text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
  }
);
