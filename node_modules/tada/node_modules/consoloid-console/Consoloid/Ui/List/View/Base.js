defineClass('Consoloid.Ui.List.View.Base', 'Consoloid.Widget.Widget',
  {
    __constructor: function(options)
    {
      this.__base($.extend({
        radius: 2,
        templateId: 'Consoloid-Ui-List-View-Base',
        eventDispatcher: $('<div />'),
        emptyMessage: "This list is empty."
      }, options));

      if (this.radius < 0) {
        throw new Error("Invalid radius");
      }

      this.requireProperty('dataSource');
      this.requireProperty('factory');
      this.requireProperty('numPerPage');

      this.currentPage = 0;
      this.count = undefined;
      this.elementHeight = 0;
      this.pageOffset = 0;
      this.scrollState = "none";
      this.farawayJumpFromIndex = undefined;
      this.targetScrollTop = undefined;

      this.__createThrobberAndEmptyTemplates();
    },

    __createThrobberAndEmptyTemplates: function()
    {
      this.throbberTemplate = this.create('Consoloid.Widget.JQoteTemplate', {
        id: "Consoloid-Ui-List-View-Throbber",
        container: this.container
      });

      this.emptyTemplate  = this.create('Consoloid.Widget.JQoteTemplate', {
        id: "Consoloid-Ui-List-View-Empty",
        container: this.container
      });
    },

    render: function()
    {
      this.get('css_loader').load('Consoloid-Ui-List-list');

      this.__base();
      this.setFilterValues({});
    },

    setFilterValues: function(filterValues)
    {
      this.list = this.node.find('.list-wrapper');
      this.__drawThrobber();
      this.__resetPageOffsetAndCurrentPage();

      this.dataSource.setFilterValues(
        this.__renderCompleteListAfterSetFilterValues.bind(this),
        filterValues,
        0,
        (this.radius * 2 + 1) * this.numPerPage - 1
      );
    },

    __drawThrobber: function()
    {
      this.list.jqoteapp(this.throbberTemplate.get(), this);
    },

    __resetPageOffsetAndCurrentPage: function()
    {
      this.pageOffset = 0;
      this.currentPage = 0;
    },

    __renderCompleteListAfterSetFilterValues: function(err, result)
    {
      if (err != undefined) {
        throw new Error(err);
      }
      this.count = result.count;

      this.__renderCompleteList(result.data);
    },

    __renderCompleteList: function(data, fromIndex) {
      this.list.empty();
      this.__renderElements(fromIndex || 0, data);

      this.list.find('> *').hide().fadeIn();

      var pageHeight = this.numPerPage * this.elementHeight;
      var scrollTop = (this.currentPage - this.pageOffset) * pageHeight;
      this.list
        .scrollTop(scrollTop)
        .scroll(this.__listScrolled.bind(this));
    },

    __renderElements: function(fromIndex, data)
    {
      if (data.length == 0) {
        this.__renderEmptyMessage();
        return;
      }

      var numberOfRelevantElements = 0;
      var firstRelavantIndex = undefined;
      for (var i = 0; i < data.length; i++) {
        var dataIndex = fromIndex + i;

        if (this.__dataIndexIsRelevant(dataIndex)) {
          if (!this.__listElementExists(dataIndex)) {
            this.__renderElement(dataIndex, data[i]);
          }
          numberOfRelevantElements++;
          if (firstRelavantIndex == undefined) {
            firstRelavantIndex = dataIndex;
          }
        }
      }

      this.__updatePageOffsetAndRemoveOverflowingElements(firstRelavantIndex, numberOfRelevantElements);
    },

    __renderEmptyMessage: function()
    {
      var message = this.get('translator').trans(this.emptyMessage);
      this.list.jqoteapp(this.emptyTemplate.get(), message);
    },

    __dataIndexIsRelevant: function(dataIndex)
    {
      var relevantRange = this.__getRelevantRange();

      return (dataIndex >= relevantRange.fromIndex && dataIndex <= relevantRange.toIndex);
    },

    __getRelevantRange: function()
    {
      var
        roundedCurrentPage = Math.round(this.currentPage),
        fromPage,
        toPage,
        lastPage = (this.count/this.numPerPage) - 1,
        atStartOfContent = (this.currentPage < this.radius),
        atEndOfContent = (roundedCurrentPage > lastPage - this.radius);

      if (atStartOfContent) {
        fromPage = 0;
        toPage = this.radius * 2 + 1;
      } else if (atEndOfContent) {
        fromPage = lastPage - 2 * this.radius;
        toPage = lastPage + 1;
      } else {
        fromPage = roundedCurrentPage - this.radius;
        toPage = roundedCurrentPage + this.radius + 1;
      }

      var
        fromIndex = Math.round(fromPage * this.numPerPage),
        toIndex = Math.round(toPage * this.numPerPage - 1);

      return { fromIndex: fromIndex, toIndex: toIndex };
    },

    __listElementExists: function(index)
    {
      return (this.list.find('.list-element-index-' + index).length > 0);
    },

    __renderElement: function(index, data)
    {
      var node = this.factory.render(data);
      node.addClass("list-element-index-" + index + " list-element");

      if (!this.__listElementExists(index - 1)) {
        node.prependTo(this.list);
      } else {
        node.insertAfter(this.__getListElement(index - 1));
      }

      if (this.elementHeight == 0) {
        this.__adjustElementHeight(node);
      }
    },

    __adjustElementHeight: function(node)
    {
      setTimeout(function() {
        this.elementHeight = node.outerHeight(true);
        this.list.height(this.numPerPage * this.elementHeight);
        this.eventDispatcher.trigger('size-changed');
      }.bind(this), 0);
    },

    __getListElement: function(index)
    {
      return this.list.find('.list-element-index-' + index);
    },

    __updatePageOffsetAndRemoveOverflowingElements: function(index, length)
    {
      var lastIndex = index + length;
      var potentialTotalElementsRendered = (2 * this.radius + 1) * this.numPerPage;
      var currentFirstIndex = this.pageOffset * this.numPerPage;

      if (index < currentFirstIndex) {
        this.pageOffset = index / this.numPerPage;

        var firstElementToRemove = index + potentialTotalElementsRendered;
        var lastElementToRemove = currentFirstIndex + potentialTotalElementsRendered - 1;
        this.__removeElements(firstElementToRemove, lastElementToRemove);
        this.__updateListScrollTop();
      } else if (lastIndex > currentFirstIndex + potentialTotalElementsRendered) {
        this.pageOffset = (lastIndex - potentialTotalElementsRendered) / this.numPerPage;

        var firstElementToRemove = currentFirstIndex;
        var lastElementToRemove = (lastIndex - potentialTotalElementsRendered) - 1;
        this.__removeElements(firstElementToRemove, lastElementToRemove);
        this.__updateListScrollTop();
      }
    },

    __removeElements: function(from, to)
    {
      if (this.renderingAfterFarawayJump) {
        this.renderingAfterFarawayJump = false;
        return;
      }

      for (var i = from; i <= to; i++) {
        this.list.find('.list-element-index-' + i).remove();
      }
    },

    __updateListScrollTop: function()
    {
      var newScrollTop = (this.currentPage - this.pageOffset) * this.numPerPage * this.elementHeight;
      var scrollTopDelta = newScrollTop - this.list.scrollTop();
      this.list.scrollTop(newScrollTop);

      this.__updateAnimateScrollTarget(scrollTopDelta);
    },

    __updateAnimateScrollTarget: function(scrollTopDelta)
    {
      if (this.targetScrollTop == undefined) {
        return;
      }

      this.targetScrollTop += scrollTopDelta;
      this.__startAnimatedScroll();
    },

    __startAnimatedScroll: function()
    {
      this.list.stop().animate({
        scrollTop: this.targetScrollTop
      }, this.__nearbyJumpFinish.bind(this));
    },

    __adjustScrolledList: function()
    {
      this.__setScrollState('adjusting');

      var topOfFirstElement = Math.round(this.list.scrollTop() / this.elementHeight) * this.elementHeight;

      if (topOfFirstElement == this.list.scrollTop()) {
        this.__setScrollState('none');
      } else {
        this.list.animate({ scrollTop: topOfFirstElement }, {
          complete: function() {
            this.__setScrollState('none');
          }.bind(this)
        });
      }
    },

    __setScrollState: function(state)
    {
      this.scrollState = state;
      this.eventDispatcher.trigger("scroll-state-changed", [state]);
    },

    getScrollState: function()
    {
      return this.scrollState;
    },

    __listScrolled: function(event)
    {
      this.eventDispatcher.trigger('page-changed');

      var pageDelta = this.__updateCurrentPageAndGetPagesToLoad();
      if (!pageDelta) {
        return;
      }

      var startPageRelativeToPageOffset = (pageDelta >= 0) ? (2 * this.radius + 1) : pageDelta;
      var startIndex = (this.pageOffset + startPageRelativeToPageOffset) * this.numPerPage;

      if (startIndex >= 0 && startIndex < this.count) {
        var length = Math.abs(pageDelta) * this.numPerPage;

        this.dataSource.getDataByRange(
          function(err, data) {
            this.__dataSourceRangeReceived(err, data, startIndex);
          }.bind(this),
          startIndex,
          startIndex + length - 1
        );
      }
    },

    __updateCurrentPageAndGetPagesToLoad: function()
    {
      var previousPage = this.currentPage;
      this.__updateCurrentPage();

      var pageDelta = Math.round(this.currentPage) - (this.pageOffset + this.radius);
      return (Math.round(this.currentPage) == Math.round(previousPage) || pageDelta == 0) ? 0 : pageDelta;
    },

    __updateCurrentPage: function()
    {
      var currentScrollTop = this.list.scrollTop();
      var pageInRenderedList = currentScrollTop / (this.numPerPage * this.elementHeight);
      var lastPossiblePage = Math.max((this.count / this.numPerPage) - 1, 0);
      this.currentPage = Math.min(this.pageOffset + pageInRenderedList, lastPossiblePage);
    },

    __dataSourceRangeReceived: function(err, data, startIndex)
    {
      if (this.farawayJumpFromIndex != undefined) {
        return;
      }

      if (err != undefined) {
        throw new Error(err);
      }

      this.__renderElements(startIndex, data);
    },

    getCurrentPage: function()
    {
      return Math.round(this.currentPage * this.numPerPage) / this.numPerPage;
    },

    setPage: function(page)
    {
      var numberOfPages = this.count / this.numPerPage;
      if (page < 0 || (this.count != undefined && page >= numberOfPages)) {
        throw this.create('Consoloid.Error.UserMessage', { message: "Illegal page." });
      }

      this.__cancelScrolling();

      if (this.__pageIsRendered(page)) {
        this.__jumpToNearbyPage(page);
      } else {
        this.__jumpToFarawayPage(page);
      }
    },

    __cancelScrolling: function()
    {
      this.__setScrollState('none');
    },

    __pageIsRendered: function(page)
    {
      var lastPageRendered = this.pageOffset + this.radius * 2;
      return (page >= this.pageOffset) && (page < lastPageRendered + 1);
    },

    __jumpToFarawayPage: function(page)
    {
      this.__detachEventListenersDrawThrobber();
      var lastPossiblePage = this.count / this.numPerPage - 1;
      this.currentPage = Math.min(page, lastPossiblePage);
      this.eventDispatcher.trigger('page-changed');

      var range = this.__getRelevantRange();
      this.farawayJumpFromIndex = range.fromIndex;

      this.dataSource.getDataByRange(
        (function(err, data) {
          this.__renderListAfterJump(err, data, range.fromIndex);
        }).bind(this),
        range.fromIndex,
        range.toIndex
      );
    },

    __renderListAfterJump: function(err, data, fromIndex)
    {
      if (this.farawayJumpFromIndex != fromIndex) {
        return;
      }

      if (err != undefined) {
        throw new Error(err);
      }

      this.renderingAfterFarawayJump = true;
      this.farawayJumpFromIndex = undefined;
      this.__renderCompleteList(data, fromIndex);
      this.__adjustScrolledList();
    },

    __detachEventListenersDrawThrobber: function()
    {
      this.list.empty();
      this.list.unbind("scroll");
      this.__drawThrobber();
    },

    __jumpToNearbyPage: function(page)
    {
      this.targetScrollTop = (page - this.pageOffset) * this.numPerPage * this.elementHeight;
      this.__setScrollState("setpage");
      this.__startAnimatedScroll();
    },

    __nearbyJumpFinish: function()
    {
      this.targetScrollTop = undefined;
      this.__adjustScrolledList();
    },

    getPageCount: function()
    {
      return Math.ceil(this.count / this.numPerPage);
    },

    getLastPossiblePage: function()
    {
      return this.count / this.numPerPage - 1;
    }
  }
);