defineClass('Consoloid.Ui.History', 'Consoloid.Base.Object',
  {
    __constructor: function(options)
    {
      this.__base($.extend({
      }, options));

      this.content = [];
    },

    add: function(text)
    {
      if (this.content.length && text == this.content[0].value) {
        return;
      }
      this.content.unshift({value:text});
    },

    get: function()
    {
      if (!this.content.length) {
        return [];
      }

      return this.content.slice(0);
    },

    clear: function()
    {
      this.content = [];
    }
  }
);