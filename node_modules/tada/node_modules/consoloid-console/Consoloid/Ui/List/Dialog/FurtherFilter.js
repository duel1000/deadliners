defineClass('Consoloid.Ui.List.Dialog.FurtherFilter', 'Consoloid.Ui.List.Dialog.Filter',
  {
    _applyFilterString: function(filterString)
    {
      this.list.appendFilterString(this.arguments.filter.value);
    }
  }
);
