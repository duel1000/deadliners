defineClass('Consoloid.Ui.Volatile.Dialog', 'Consoloid.Ui.MultiStateDialog',
  {
    __constructor: function(options)
    {
      this.__base($.extend({
        states: {
          'normal': 'Consoloid-Ui-Volatile-DialogNormal',
          'error': 'Consoloid-Ui-Volatile-DialogError',
          'info': 'Consoloid-Ui-Volatile-DialogInfo'
        },
        activeState: 'normal',
        message: undefined,
        node: $('<div class="dialog" />')
      }, options));

    },

    setup: function()
    {
      this.__addToVolatileContainer();
    },

    __addToVolatileContainer: function()
    {
      if (!this.__lastDialogIsContainer()) {
        this.volatileContainer = this.create('Consoloid.Ui.Volatile.Container', { container: this.container });
        this.get('console').createNewDialog(this.volatileContainer);
        this.volatileContainer.start();
      } else {
        this.volatileContainer = this.get('console').getLastDialog();
      }

      this.volatileContainer.addVolatileDialog(this);
    },

    __lastDialogIsContainer: function()
    {
      var lastDialog = this.get('console').getLastDialog();
      if (typeof(lastDialog.addVolatileDialog) == "function") {
        return true;
      }

      return false;
    },

    remove: function()
    {
      var $this = this;
      this.node.animate({
        left: parseInt(this.node.css('left'),10) == 0 ?
            this.node.outerWidth() :
            0
      }, { queue: false });
      this.node.fadeOut({ queue: false, complete: function() {
        $this.volatileContainer.removeVolatileDialog($this);
      }});

      return false;
    },

    render: function()
    {
      this.__base();
      this.node.find('.dialog').addClass(this.activeState);
    },

    getMessage: function()
    {
      return this.message;
    }
  });