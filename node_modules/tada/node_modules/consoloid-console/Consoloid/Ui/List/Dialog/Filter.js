defineClass('Consoloid.Ui.List.Dialog.Filter', 'Consoloid.Ui.Volatile.Dialog',
  {
    setup: function()
    {
      $this = this;
      var contextObject = ('name' in this.arguments && this.arguments.name) ?
                           this.arguments.name :
                           this.__lookupContextObject(
                               'Consoloid.Ui.List.Dialog.ContextObject',
                               0,
                               "There isn't any list to filter on");

      this.list = contextObject.entity.getList();

      try {
        this._applyFilterString(this.arguments.filter.value)
        this.message = this.get('translator').trans('Successful filter.');
      } catch(e) {
        this.activeState = "error";
        this.message = this.get('translator').trans('Could not filter.');
      }

      this.__base();
    },

    _applyFilterString: function(filterString)
    {
      this.list.setFilterString(this.arguments.filter.value);
    }
  }
);