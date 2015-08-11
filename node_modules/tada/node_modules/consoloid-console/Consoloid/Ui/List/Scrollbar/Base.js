defineClass('Consoloid.Ui.List.Scrollbar.Base', 'Consoloid.Widget.Widget',
  {
    __constructor: function(options)
    {
      this.__base($.extend(this, {
        eventDispatcher: $('<div />'),
        pageNumber: 0,
        templateId: 'Consoloid-Ui-List-Scrollbar-Base',
        elementsDisabled: false
      }, options));
      this.addEventListener('.scrollbar-button-first-page', 'click', this.__dispatchFirstPage.bind(this));
      this.addEventListener('.scrollbar-button-previous-page', 'click', this.__dispatchPreviousPage.bind(this));
      this.addEventListener('.scrollbar-button-next-page', 'click', this.__dispatchNextPage.bind(this));
      this.addEventListener('.scrollbar-button-last-page', 'click', this.__dispatchLastPage.bind(this));

      this.eventDispatcher.bind("scroll-state-changed", this.__scrollStateChanged.bind(this));
    },

    __dispatchFirstPage: function()
    {
      if (!this.elementsDisabled) {
        this.eventDispatcher.trigger("first-page");
      }
    },

    __dispatchPreviousPage: function()
    {
      if (!this.elementsDisabled) {
        this.eventDispatcher.trigger("previous-page");
      }
    },

    __dispatchNextPage: function()
    {
      if (!this.elementsDisabled) {
        this.eventDispatcher.trigger("next-page");
      }
    },

    __dispatchLastPage: function()
    {
      if (!this.elementsDisabled) {
        this.eventDispatcher.trigger("last-page");
      }
    },

    __scrollStateChanged: function(event, scrollState)
    {
      switch(scrollState) {
        case "none":
          this.elementsDisabled = false;
          break;
        case "setpage":
          this.elementsDisabled = true;
          break;
      }

      this.__switchButtonEnabledState();
    },

    getEventDispatcher: function()
    {
      return this.eventDispatcher;
    },

    setPageInfo: function(pageNumber, lastPossiblePage)
    {
      this.pageNumber = pageNumber;
      this.lastPossiblePage = lastPossiblePage;
      this.node.find('.scrollbar-pagenumber').html(Math.round(pageNumber) + 1);
      this.__switchButtonEnabledState();
    },

    render: function()
    {
      this.__base();
      this.__switchButtonEnabledState();
    },

    __switchButtonEnabledState: function() {
      this.__enableDisableButtonsAtDataStart();
      this.__enableDisableButtonsAtDataEnd();
    },

    __enableDisableButtonsAtDataStart: function()
    {
      if (this.pageNumber == 0 || this.elementsDisabled) {
        this.node.find('.scrollbar-button-first-page').attr('disabled','disabled');
        this.node.find('.scrollbar-button-previous-page').attr('disabled','disabled');
      } else {
        this.node.find('.scrollbar-button-first-page').removeAttr('disabled');
        this.node.find('.scrollbar-button-previous-page').removeAttr('disabled');
      }
    },

    __enableDisableButtonsAtDataEnd: function()
    {
      if (this.pageNumber >= this.lastPossiblePage || this.elementsDisabled) {
        this.node.find('.scrollbar-button-last-page').attr('disabled','disabled');
        this.node.find('.scrollbar-button-next-page').attr('disabled','disabled');
      } else {
        this.node.find('.scrollbar-button-last-page').removeAttr('disabled');
        this.node.find('.scrollbar-button-next-page').removeAttr('disabled');
      }
    }
  }
);
