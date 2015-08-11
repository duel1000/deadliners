defineClass('Consoloid.Ui.List.Dialog.ContextObject', 'Consoloid.Context.Object',
  {
    __constructor: function(options)
    {
      this.__base(options);

      this.requireProperty("list");
    },

    getList: function()
    {
      return this.list;
    }
  }
);