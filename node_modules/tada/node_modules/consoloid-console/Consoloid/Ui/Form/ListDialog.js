defineClass('Consoloid.Ui.Form.ListDialog', 'Consoloid.Ui.MultiStateDialog',
  {
    __constructor: function(options)
    {
      this.__base($.extend({
        states: {
          'hasItems': 'Consoloid-Ui-Form-ListDialogHasItems',
          'empty': 'Consoloid-Ui-Form-ListDialogEmpty'
        },
        activeState: 'hasItems',
      }, options));

      this.addEventListener('ul li a', 'click', this.clickItem.bind(this));
    },

    setup: function()
    {
      this.dialogNames = this.__lookupNamesFromContext();

      this.activeState = (this.dialogNames.length == 0) ? 'empty' : 'hasItems';
    },

    __lookupNamesFromContext: function()
    {
      var formDialogs = this.container.get('context')
                                .findByClass('Consoloid.Form.ContextObject');

      var result = [];
      formDialogs.forEach(function(contextObject) {
        result.push(contextObject.entity.name);
      });

      return result;
    },

    clickItem: function(event)
    {
      var name = $(event.target).data('name');
      var contextObject = this.container.get('context')
        .getByClassAndString('Consoloid.Form.ContextObject', name);

      contextObject.dialog.focus();
      return false;
    }
  }
);