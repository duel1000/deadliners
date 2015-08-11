defineClass('Consoloid.Ui.List.View.Kinetic', 'Consoloid.Ui.List.View.Mousewheel',
  {
    __loadResources: function()
    {
      this.__base();
      var resourceLoader = this.get('resource_loader');

      if ($.fn.kinetic === undefined) {
        eval(resourceLoader.getJs('Consoloid/Ui/List/jquery.kinetic'));
      }
    },

    __renderCompleteList: function(data, fromIndex) {
      this.__base(data, fromIndex);

      this.list
        .kinetic({
          y: true,
          x: false,
          stopped: this.__adjustScrolledList.bind(this),
          started:
            function() {
              if (this.scrollState == 'none') {
                this.scrollState = 'kinetic';
              }
            }.bind(this),
          cancelled:
            function() {
              this.scrollState = 'none';
            }.bind(this)
        });
    },

    __setScrollState: function(state)
    {
      this.__base(state);

      switch(state) {
        case 'none':
          this.list.kinetic('attach');
          break;
        case 'mousewheel':
        case 'adjusting':
          this.list.kinetic('detach');
          break;
      }
    },

    __detachEventListenersDrawThrobber: function()
    {
      this.__base();
      this.list.kinetic('detach');
    },
  }
);