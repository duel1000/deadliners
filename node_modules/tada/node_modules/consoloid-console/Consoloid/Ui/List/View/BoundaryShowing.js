defineClass('Consoloid.Ui.List.View.BoundaryShowing', 'Consoloid.Ui.List.View.Kinetic',
  {
    __constructor: function(options)
    {
      this.__base(options);

      this.startPageY = undefined;
    },

    __renderCompleteList: function(data, fromIndex)
    {
      this.__base(data, fromIndex);

      this.list.bind("mousemove.kinetic", this.__addStretchAnimationOnMoveEvent.bind(this));
      this.list.bind("touchmove.kinetic", this.__addStretchAnimationOnTouchEvent.bind(this));

      this.list.bind("mouseup.kinetic touchend.kinetic mouseleave.kinetic", (function(event) {
        this.startPageY = undefined;
      }).bind(this));
    },

    __addStretchAnimationOnMoveEvent: function(event)
    {
      if (this.scrollState == "kinetic") {
        if (this.startPageY == undefined) {
          this.startPageY = event.pageY;
        } else {
          this.__addStretchAnimationsWhenNeeded(event.pageY - this.startPageY);
        }
      }
    },

    __addStretchAnimationOnTouchEvent: function(event)
    {
      event.preventDefault();
      this.__addStretchAnimationOnMoveEvent(event.originalEvent.changedTouches[0]);
    },

    __addStretchAnimationsWhenNeeded: function(scrollDelta)
    {
      var indexOfFirstAndLastElementShown = this.__getIndexOfFirstAndLastElementShown();
      var element = undefined;
      if ((scrollDelta > 0) && (indexOfFirstAndLastElementShown.firstShownIndex == 0)) {
        element = $(this.list.find(".list-element-index-" + indexOfFirstAndLastElementShown.firstShownIndex));
      } else if ((scrollDelta < 0) && (indexOfFirstAndLastElementShown.lastShownIndex == this.count - 1)) {
        element = $(this.list.find(".list-element-index-" + indexOfFirstAndLastElementShown.lastShownIndex));
      }

      if (element) {
        this.__addStretchAnimationToElement(element, scrollDelta);
      }
    },

    __addStretchAnimationToElement: function(element, scrollDelta)
    {
      var neededClass = (scrollDelta > 0) ? "element-stretch-top" : "element-stretch-bottom";
      if (!element.hasClass(neededClass)) {
        element.addClass(neededClass);

        var
          startAnimation = {},
          endAnimation = {},
          targetMargin = (scrollDelta > 0) ? "marginTop" : "marginBottom",
          oldMargin = element.css(targetMargin);
        startAnimation[targetMargin] = oldMargin.replace("px", "") + this.elementHeight;
        endAnimation[targetMargin] = oldMargin;

        element.animate(startAnimation, {
          duration: 700,
          complete: (function() {
            element.animate(endAnimation, {
              duration: 300,
              complete: this.__removeStretchClasses.bind(this)
            });
          }).bind(this)
        });
        if (scrollDelta < 0) {
          this.__startAdditionalScrolling();
        }
      }
    },

    __removeStretchClasses: function()
    {
      this.list.find('.element-stretch-top').removeClass('element-stretch-top');
      this.list.find('.element-stretch-bottom').removeClass('element-stretch-bottom');
    },

    __startAdditionalScrolling: function()
    {
      this.list.kinetic("start", { velocityY: 10 });
      setTimeout((function() {
        this.list.kinetic("stop");
      }).bind(this), 1000);
    },

    __renderElements: function(fromIndex, data)
    {
      this.__base(fromIndex, data);

      this.__removeBoundaryThrobbers();
      this.__addBoundaryThrobbersIfNeeded();
    },

    __removeBoundaryThrobbers: function()
    {
      this.list.find(".list-top-throbber, .list-bottom-throbber").remove();
    },

    __addBoundaryThrobbersIfNeeded: function()
    {
      if (this.pageOffset != 0) {
        $('<div class="list-top-throbber" />').prependTo(this.list);
      }

      var lastPotentiallyLoadedPage = this.pageOffset + this.radius * 2;
      var lastPotentiallyLoadedElementIndex = (lastPotentiallyLoadedPage + 1) * this.numPerPage - 1;
      if (lastPotentiallyLoadedElementIndex < this.count - 1) {
        $('<div class="list-bottom-throbber" />').appendTo(this.list);
      }
    },

    __mouseWheelHandler: function(delta)
    {
      this.__base(delta);
      this.__addStretchAnimationsWhenNeeded(delta);
    }
  }
);