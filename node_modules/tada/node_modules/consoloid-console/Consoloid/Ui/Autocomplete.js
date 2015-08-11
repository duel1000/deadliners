defineClass('Consoloid.Ui.Autocomplete', 'Consoloid.Widget.Widget',
  {
  __constructor: function(options)
  {
    this.__base($.extend({
      options: [],
      focusedIndex: 0,
      idleTimeout: 1000,
      idleTimeoutID: undefined,
      ruler: $('<div class="ruler"></div>'),
      templateId: 'Consoloid-Ui-Autocomplete',
      node: $('<div class="ui-autocomplete"></div>')
    }, options));

    this.requireProperty('inputfield');
    this.requireProperty('gatherOptions');

    this.setHeight(this.height);
    this.forceAutocompleteOnTab = true;

    $('body').append(this.node);
    this.ruler.appendTo(this.inputfield.parent());
    this.node.css('display', 'none');

    $('html').bind('click', this.__clickListener.bind(this));
    this.node.bind('keydown', this.__keyDownListener.bind(this));
    this.inputfield.bind('keydown', this.__keyDownListener.bind(this));
    this.node.delegate('div', 'click', this.__clickOnOptionListener.bind(this));

    this.setLeftPositionToCursor(false);
    this.__setTopPosition();
    this.setOptions = this.setOptions.bind(this);
    this.__keyUpListener = this.__keyUpListener.bind(this);
    this.__setOptionsWithAutoSelect = this.__setOptionsWithAutoSelect.bind(this);
  },

  setHeight: function(maxHeight)
  {
    if (maxHeight)
      this.node.css('max-height', maxHeight+'px');
    else
      this.node.css('max-height', '');
  },

  setForceAutocompleteOnTab: function(value)
  {
    this.forceAutocompleteOnTab = value;
  },

  __clickOnOptionListener: function(event)
  {
    var target = $(event.target);
    this.__triggerOption(target.index(), true);
  },

  __triggerOption: function(index, isSelect)
  {
    if (index < 0 || index > this.options.length) {
      return;
    }
    this.node.trigger(jQuery.Event(isSelect ? 'select' : 'focus', { option: this.options[index] }));
    if (isSelect) {
      this.clearOptions();
    } else {
      this.__setFocusedIndex(index);
    }
  },

  clearOptions: function()
  {
    this.setOptions();
  },

  setOptions: function(options, autoSelectWhenOnlyOneOption)
  {
    if (!options || options.length == 0) {
        this.options = [];
        this.node.empty();
        this.inputfield.unbind('keyup', this.__keyUpListener);
        this.node.css('display', 'none');
    } else {
        if (!this.hasOptions()) {
          this.node.css('display', 'block');
          this.inputfield.bind('keyup', this.__keyUpListener);
        }
        options.reverse();
        this.options = options;

        if (options.length == 1 && autoSelectWhenOnlyOneOption) {
          this.__triggerOption(this.options.length - 1, true);
        } else {
          this.render();
        }
    }
    this.__setFocusedIndex(this.options.length - 1);
    this.__setTopPosition();
  },

  __keyUpListener: function(event)
  {
    if (!this.__isFunctionKey(event.keyCode)) {
      this.gatherOptions(this.setOptions);
    }
  },

  __isFunctionKey: function(keyCode)
  {
    if (
        keyCode == Consoloid.Ui.Autocomplete.ESC ||
        keyCode == Consoloid.Ui.Autocomplete.TAB ||
        keyCode == Consoloid.Ui.Autocomplete.UP ||
        keyCode == Consoloid.Ui.Autocomplete.DOWN ||
        keyCode == Consoloid.Ui.Autocomplete.ENTER
      ) {
        return true;
    }
    return false;
  },

  hasOptions: function()
  {
    return (this.options && this.options.length != 0);
  },

  __setFocusedIndex: function(index)
  {
    if (index >=0 && index < this.options.length) {
      this.node.children().removeClass('focused');
      this.focusedIndex = index;
      var target = this.node.children().eq(this.focusedIndex).addClass('focused')[0];
      if (target.offsetTop+target.offsetHeight > this.node[0].scrollTop || this.node[0].scrollTop > target.offsetTop) {
        this.node.scrollTop(target.offsetTop);
      }
    }
  },

  __setTopPosition: function()
  {
    this.node.css('top', this.inputfield.offset().top - this.node.height());
  },

  __clickListener: function(event)
  {
    var target = $(event.target);
    if (target[0] != this.inputfield[0] && target.parent()[0] != this.node[0]) {
      this.clearOptions();
    }
  },

  __keyDownListener: function(event)
  {
    if (this.hasOptions()) {
      switch(event.keyCode) {
        case Consoloid.Ui.Autocomplete.DOWN:
          if (this.focusedIndex >= this.options.length -1) {
            this.focusedIndex = -1;
          }
          this.__triggerOption(this.focusedIndex + 1);
          event.preventDefault();
          event.stopImmediatePropagation();
          break;

        case Consoloid.Ui.Autocomplete.UP:
        case Consoloid.Ui.Autocomplete.TAB:
          if (this.options.length != 1) {
            if (this.focusedIndex <= 0) {
              this.focusedIndex = this.options.length;
            }
            this.__triggerOption(this.focusedIndex - 1);
          } else {
            this.__triggerOption(this.focusedIndex, true);
          }
          event.preventDefault();
          event.stopImmediatePropagation();
          break;

        case Consoloid.Ui.Autocomplete.ENTER:
          this.__triggerOption(this.focusedIndex, true);
          event.stopImmediatePropagation();
          break;

        case Consoloid.Ui.Autocomplete.ESC:
          this.clearOptions();
          break;
      }
    } else {
      if (this.forceAutocompleteOnTab && event.keyCode == Consoloid.Ui.Autocomplete.TAB) {
        this.gatherOptions(this.__setOptionsWithAutoSelect);
      } else {
        if (!this.__isFunctionKey(event.keyCode)) {
          this.gatherOptionsAfterIdle();
        }
      }
    }
  },

  gatherOptionsAfterIdle: function()
  {
    if (this.idleTimeoutID) {
      clearTimeout(this.idleTimeoutID);
    }

    var $this = this;
    this.idleTimeoutID = setTimeout(function(){
      $this.gatherOptions($this.setOptions);
      $this.idleTimeoutID = undefined;
    }, this.idleTimeout);
  },

  __setOptionsWithAutoSelect: function(options)
  {
    this.setOptions(options, true);
  },

  setLeftPositionToCursor: function(bool)
  {
    if (bool) {
      this.node.css('left', this.__convertCursorPositionToPixelPosition()+'px');
    } else {
      this.node.css('left', this.inputfield.offset().left+'px');
    }
  },

  __convertCursorPositionToPixelPosition: function()
  {
    var pos = this.inputfield.offset().left;
    var textWidth = this.ruler.text(this.__getTextBeforeCursor()).width();

    return pos + textWidth;
  },

  __getTextBeforeCursor: function()
  {
    var last = this.inputfield[0].selectionStart;
    return this.inputfield.val().substr(0,last);
  }
},{
  TAB: 9,
  ENTER: 13,
  ESC: 27,
  UP: 38,
  DOWN: 40
});