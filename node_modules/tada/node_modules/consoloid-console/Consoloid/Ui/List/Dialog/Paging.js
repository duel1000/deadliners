defineClass('Consoloid.Ui.List.Dialog.Paging', 'Consoloid.Ui.Volatile.Dialog',
  {
    setup: function()
    {
      var contextObject = ('name' in this.arguments && this.arguments.name) ?
                           this.arguments.name :
                           this.__lookupContextObject(
                               'Consoloid.Ui.List.Dialog.ContextObject',
                               0,
                               "There isn't any list to change pages on");

      this.list = contextObject.entity.getList();

      var targetPage = this.getTargetPage(this.arguments.page.value);

      if (isNaN(targetPage)) {
        this.showError('Invalid target page');
      } else {
        try {
          this.list.setPage(targetPage);
          this.message = this.get('translator').trans('Successful page change.');
        } catch(e) {
          this.showError('Could not change page.')
        }
      }

      this.__base();
    },

    getTargetPage: function(targetPageString)
    {
      switch(targetPageString) {
        case "first":
        case this.get("translator").trans("first"):
          return 0;
        case "last":
        case this.get("translator").trans("last"):
          return this.list.getPageCount() - 1;
        case "next":
        case this.get("translator").trans("next"):
          return this.list.getCurrentPage() + 1;
          break;
        case "previous":
        case this.get("translator").trans("previous"):
          return this.list.getCurrentPage() - 1;
          break;
        default:
          return parseFloat(targetPageString) - 1;
      }
    },

    showError: function(message)
    {
      this.activeState = "error";
      this.message = this.get('translator').trans(message);
    }
  }
);