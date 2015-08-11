defineClass('Consoloid.Ui.List.Factory.CollapsingElement', 'Consoloid.Widget.Widget',
  {
    __constructor: function(options)
    {
      this.__base(options);
      this.togglingInProgress = false;
      this.__requireParameters();
      this.__generateTemplates();
    },

    __requireParameters: function()
    {
      this.requireProperty('collapsedTemplateId');
      this.requireProperty('extendedTemplateId');
      this.requireProperty('eventDispatcher');
      this.requireProperty('data');
    },

    __generateTemplates: function()
    {
      this.collapsedTemplate = this.create('Consoloid.Widget.JQoteTemplate', {
        id: this.collapsedTemplateId,
        container: this.container
      });

      this.extendedTemplate = this.create('Consoloid.Widget.JQoteTemplate', {
        id: this.extendedTemplateId,
        container: this.container
      });
    },

    render: function()
    {
      this.__base();

      $($.jqote(this.collapsedTemplate.get(), this))
        .addClass("collapsed")
        .appendTo(this.node.find('.collapse-content'));
      $($.jqote(this.extendedTemplate.get(), this))
        .addClass("extended")
        .appendTo(this.node.find('.collapse-content'));

      this.node.find('.collapse-content .extended').hide();
      this.node.find('.less').hide();

      this.__addEventListeners();
    },

    __addEventListeners: function()
    {
      this.node.find('.more').click(this.showMore.bind(this));
      this.node.find('.less').click(this.showLess.bind(this));
      this.eventDispatcher.bind("scroll-state-changed", this.listScrolled.bind(this));
    },

    showMore: function()
    {
      this.toggleFromClick(this.node.find(".collapsed"), this.node.find(".extended"));
      return false;
    },

    toggleFromClick: function(startNode, endNode)
    {
      if (this.togglingInProgress == true) {
        return;
      }

      this.toggle(startNode, endNode);
    },

    toggle: function(startNode, endNode)
    {
      if (endNode.is(":visible")) {
        return;
      }

      this.togglingInProgress = true;
      this.__toggleMoreLessIcons();

      var startHeight = this.node.height(true);
      startNode.fadeOut({
        complete: (function() {
          endNode.show();
          var endHeight = this.node.height(true);
          endNode
            .show()
            .css({ 'opacity': 0, 'height': startHeight })
            .animate(
              {
                opacity: 1,
                height: endHeight
              },
              {
                complete: function() {
                  this.togglingInProgress = false;
                  if (endNode.hasClass('extended')) {
                    this.eventDispatcher.trigger('collapsed-item-opened', endNode);
                  } else {
                    this.eventDispatcher.trigger('collapsed-item-closed', endNode);
                  }
                }.bind(this)
              }
            )
        }).bind(this)
      });
    },

    __toggleMoreLessIcons: function()
    {
      this.node.find('.more').toggle();
      this.node.find('.less').toggle();
    },

    showLess: function()
    {
      this.toggleFromClick(this.node.find(".extended"), this.node.find(".collapsed"));
      return false;
    },

    listScrolled: function()
    {
      this.toggle(this.node.find(".extended"), this.node.find(".collapsed"));
    }
  }
);
