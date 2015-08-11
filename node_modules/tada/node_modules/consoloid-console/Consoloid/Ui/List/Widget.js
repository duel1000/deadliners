defineClass('Consoloid.Ui.List.Widget', 'Consoloid.Widget.Widget',
  {
    __constructor: function(options)
    {
      this.__base($.extend({
        templateId: 'Consoloid-Ui-List-Widget',
        eventDispatcher: $('<div />'),
        filterTokenizerClass: 'Consoloid.Ui.List.BaseFilterTokenizer',
        filterTokenizerOptions: {},
        filterWidgetOptions: {},
        scrollbarOptions: {},
        filterStrings: []
      }, options));
      this.__requireOptions();
      this.__createListView();
      this.__createScrollBarAndFilter();
      this.__addEventListeners();
    },

    __requireOptions: function()
    {
      this.requireProperty('dataSourceClass');
      this.requireProperty('dataSourceOptions');
      this.requireProperty('factoryClass');
      this.requireProperty('factoryOptions');
      this.requireProperty('listViewClass');
      this.requireProperty('listViewOptions');
    },

    __createListView: function()
    {
      this.dataSource = this.create(this.dataSourceClass, $.extend(this.dataSourceOptions, {
        container: this.container
      }));

      this.factory = this.create(this.factoryClass, $.extend(this.factoryOptions, {
        container: this.container,
        eventDispatcher: this.eventDispatcher
      }));

      this.listView = this.create(this.listViewClass, $.extend(this.listViewOptions, {
        container: this.container,
        factory: this.factory,
        dataSource: this.dataSource,
        eventDispatcher: this.eventDispatcher
      }));
    },

    __createScrollBarAndFilter: function()
    {
      if (this.scrollbarClass != undefined) {
        this.scrollbar = this.create(this.scrollbarClass, $.extend(this.scrollbarOptions, {
          container: this.container,
          eventDispatcher: this.eventDispatcher
        }));
      }

      if (this.filterWidgetClass != undefined) {
        this.filterWidget = this.create(this.filterWidgetClass, $.extend(this.filterWidgetOptions, {
          container: this.container,
          eventDispatcher: this.eventDispatcher
        }));

        this.filterTokenizer = this.create(this.filterTokenizerClass, $.extend(this.filterTokenizerOptions, {
          container: this.container,
          eventDispatcher: this.eventDispatcher
        }));
      }
    },

    __addEventListeners: function()
    {
      this.eventDispatcher.bind("page-changed", this.__pageChangeEvent.bind(this));
      this.eventDispatcher.bind("first-page", this.__switchToFirstPageEvent.bind(this));
      this.eventDispatcher.bind("previous-page", this.__switchToPreviousPageEvent.bind(this));
      this.eventDispatcher.bind("next-page", this.__switchToNextPageEvent.bind(this));
      this.eventDispatcher.bind("last-page", this.__switchToLastPageEvent.bind(this));

      this.eventDispatcher.bind("clear-filters", this.__clearFiltersEvent.bind(this));
    },

    __pageChangeEvent: function()
    {
      this.scrollbar.setPageInfo(this.listView.getCurrentPage(), this.listView.getLastPossiblePage());
    },

    __switchToFirstPageEvent: function()
    {
      this.__switchPageEvent(0);
    },

    __switchPageEvent: function(pageNumber)
    {
      this.listView.setPage(pageNumber);
    },

    __switchToPreviousPageEvent: function()
    {
      this.__switchPageEvent(Math.max(this.listView.getCurrentPage() - 1, 0));
    },

    __switchToNextPageEvent: function()
    {
      this.__switchPageEvent(this.listView.getCurrentPage() + 1);
    },

    __switchToLastPageEvent: function()
    {
      this.__switchPageEvent(this.listView.getPageCount() - 1);
    },

    __clearFiltersEvent: function()
    {
      this.filterValues = {};
      this.listView.setFilterValues(this.filterValues);
      this.filterStrings = [];
      this.eventDispatcher.trigger("filters-cleared");
    },

    render: function()
    {
      this.__base();

      if (this.scrollbar != undefined) {
        this.scrollbar.render();
        this.scrollbar.node.prependTo(this.node.find('.list-widget'));
      }

      if (this.filterWidget != undefined) {
        this.filterWidget.render();
        this.filterWidget.node.prependTo(this.node.find('.list-widget'));
      }

      this.listView.setNode(this.node.find('.list-widget .list-view'));
      this.listView.render();
    },

    getEventDispatcher: function()
    {
      return this.eventDispatcher;
    },

    setFilterString: function(filterString)
    {
      this.filterStrings = [];
      this.filterValues = this.filterTokenizer.tokenize(filterString);
      this.__callSetFilterValues(filterString);
    },

    __callSetFilterValues: function(filterString)
    {
      this.filterStrings.push(filterString);
      this.listView.setFilterValues(this.filterValues);
      this.eventDispatcher.trigger("filter-values-set", [this.filterStrings, this.filterValues]);
    },

    appendFilterString: function(filterString)
    {
      $.extend(this.filterValues, this.filterTokenizer.tokenize(filterString));
      this.__callSetFilterValues(filterString);
    },

    setPage: function(pageNumber)
    {
      this.listView.setPage(pageNumber);
    },

    getPageCount: function() {
      return this.listView.getPageCount();
    },

    getCurrentPage: function() {
      return this.listView.getCurrentPage();
    }
  }
);
