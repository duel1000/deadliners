defineClass('Consoloid.Ui.List.Dialog.ClearFilters', 'Consoloid.Ui.Volatile.Dialog',
  {
    setup: function()
    {
      $this = this;
      var contextObject = ('name' in this.arguments && this.arguments.name) ?
                           this.arguments.name :
                           this.__lookupContextObject(
                               'Consoloid.Ui.List.Dialog.ContextObject',
                               0,
                               "There isn't any list to change pages on");

      var list = contextObject.entity.getList();

      list.getEventDispatcher().trigger("clear-filters");
      this.message = this.get('translator').trans('Attempted filter clearing.');

      this.__base();
    }
  }
);
