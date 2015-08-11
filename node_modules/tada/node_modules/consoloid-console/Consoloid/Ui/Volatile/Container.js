defineClass('Consoloid.Ui.Volatile.Container', 'Consoloid.Ui.MultiStateDialog',
  {
    __constructor: function(options)
    {
      this.__base($.extend({
        states: {
          'closed': 'Consoloid-Ui-Volatile-ContainerClosed',
          'opened': 'Consoloid-Ui-Volatile-ContainerOpened'
        },
        activeState: 'closed',
        activeVolatileDialog: undefined,
        dialogs: [],
        newDialogs: [],
        icon: 'normal',
        firstRender: true,
        disappearTimer: undefined
      }, options));

      this.addEventListener('div.expander, div.volatile-convo-number', 'click', this.switchState);
    },

    start: function()
    {
      this.node = this.get('console').createNewDialog(this);
      this.node.css({ overflow: 'hidden'});
      this.render();
    },

    render: function()
    {
      this.get('css_loader').load('Consoloid-Ui-Volatile-volatile');
      this._updateResponseTemplate();

      this._renderExpressionAndResponse();
      if (this.firstRender) {
        this._animateDialogShowup();
        this.firstRender = false;
      }
      this._bindEventListeners();

      this.node.addClass('volatile-container');

      if (this.activeState == "closed") {
        this.node.removeClass("opened");
      } else {
        this.node.removeClass("closed");
      }
      this.node.addClass(this.activeState);

      this.__renderVolatileDialogs();

      return this;
    },

    _renderExpressionAndResponse: function()
    {
      this.node.empty().jqoteapp(this.template.get(), this);

      this.response = this.node.find('div.response');
      this.response.empty().jqoteapp(this.responseTemplate.get(), this);
    },

    __renderVolatileDialogs: function()
    {
      if (this.activeState == "closed") {
        if (this.activeVolatileDialog != undefined) {
          this.__renderNewActiveVolatileDialog();
          this.__hideActiveVolatileDialogAfterTimeOut();
          this.__refreshExpanderPulse();
        }
      } else {
        for (var i = 0; i < this.dialogs.length; i++) {
          this.dialogs[i].node.appendTo(this.node.find('.volatile-convos'));
          this.dialogs[i].render();
          this.dialogs[i].node.show();
        }
        if (this.activeVolatileDialog != undefined) {
          this.__renderNewActiveVolatileDialog();
        }
      }
    },

    __renderNewActiveVolatileDialog: function()
    {
      this.node.find('.volatile-convo-number').hide();
      this.activeVolatileDialog.render();
      this.activeVolatileDialog.node.hide();
      this.activeVolatileDialog.node.appendTo(this.node.find('.volatile-convos'));
      this.activeVolatileDialog.node.fadeIn(1000);
    },

    __hideActiveVolatileDialogAfterTimeOut: function()
    {
      var $this = this;
      this.__clearDisappearTimer();
      this.disappearTimer = setTimeout(function() {
        if ($this.activeState == "closed") {
          var previousActiveVolatileDialog = $this.activeVolatileDialog;
          $this.activeVolatileDialog = undefined;
          previousActiveVolatileDialog.node.fadeOut(1000, function() {
            $this.__dialogCounterFadeIn.apply($this,[]);
          });
          $this.disappearTimer = undefined;
        }
      }, 5000);
    },

    __clearDisappearTimer: function()
    {
      if (this.disappearTimer != undefined) {
        clearTimeout(this.disappearTimer);
        this.disappearTimer = undefined;
      }
    },

    __refreshExpanderPulse: function()
    {
      this.__removeExpanderPulse();
      var pulse = '';
      for (var i = 0; i < this.newDialogs.length; i++) {
        if (this.newDialogs[i].getActiveState() == 'error') {
          if (pulse == 'info' || pulse == 'both') {
            pulse = 'both';
          } else {
            pulse = 'error'
          }
        }
        if (this.newDialogs[i].getActiveState() == 'info') {
          if (pulse == 'error' || pulse == 'both') {
            pulse = 'both';
          } else {
            pulse = 'info';
          }
        }
      }
      if (pulse != '') {
        this.node.find('.expander').addClass('pulse-' + pulse);
      }
    },

    __dialogCounterFadeIn: function()
    {
      if (this.activeVolatileDialog == undefined) {
        this.node.find('.volatile-convo-number').text(this.__getDialogCounterText());
        this.node.find('.volatile-convo-number').fadeIn(1000);
      }
    },

    __getDialogCounterText: function()
    {
      if (this.dialogs.length == 1) {
        return this.get('translator').trans("One dialog");
      }

      return this.get('translator').trans("<number> dialogs", {'<number>': this.dialogs.length});
    },

    switchState: function(state)
    {
      if (state != "closed" || state != "opened") {
        if (this.activeState == "closed") {
          state = "opened";
        } else {
          state = "closed";
        }
      }

      this.__base(state);
      this._animateDialogShowup();
      this.newDialogs = [];
      this.__removeExpanderPulse();
    },

    __removeExpanderPulse: function()
    {
      this.node.find('.expander').removeClass('pulse-both');
      this.node.find('.expander').removeClass('pulse-error');
      this.node.find('.expander').removeClass('pulse-info');
      this.icon = 'normal';
    },

    addVolatileDialog: function(dialog)
    {
      this.dialogs.push(dialog);
      if (this.activeState == "closed") {
        this.newDialogs.push(dialog);
      }
      this.activeVolatileDialog = dialog;
      this.render();
    },

    removeVolatileDialog: function(dialog)
    {
      this.newDialogs.splice(this.newDialogs.indexOf(dialog), 1);
      this.dialogs.splice(this.dialogs.indexOf(dialog), 1);
      if (this.activeVolatileDialog == dialog) {
        this.activeVolatileDialog = undefined;
        if (this.activeState == 'closed') {
          this.__clearDisappearTimer();
          this.__dialogCounterFadeIn();
          this.__refreshExpanderPulse();
        }
      }

      if (this.dialogs.length == 0) {
        this.remove();
      }
    }
  }
);