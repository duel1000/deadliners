defineClass('Consoloid.Ui.Dialog', 'Consoloid.Widget.Widget',
  {
    __constructor: function(options)
    {
      this.__base($.extend({
        node: $('<div />'),
        templateId: 'Consoloid-Ui-Dialog',
        arguments: {}
      }, options));

      this.requireProperty('responseTemplateId');
      this.responseTemplate = this.create('Consoloid.Widget.JQoteTemplate', {
        id: this.responseTemplateId,
        container: this.container
      });

      this.expression = null;
      this.response = null;

      this
        .addEventListener('a.remove', 'click', this.remove);
    },

    start: function(args, expression)
    {
      this.handleArguments(args, expression);
      this.startWithoutExpression();
    },

    startWithoutExpression: function()
    {
      this.node = this.get('console').createNewDialog(this);
      this.setup();
      this.render();
    },

    handleArguments: function(args, expression)
    {
      this.arguments = args;
      this.expression = this.create('Consoloid.Ui.Expression', {
        templateId: this.get('resource_loader').getParameter('dialog.expressionTemplate'),
        model: expression,
        arguments: args,
        container: this.container
      });
    },

    setup: function()
    {
    },

    render: function()
    {
      this._renderExpressionAndResponse();
      this._animateDialogShowup();
      this._bindEventListeners();
      return this;
    },

    _renderExpressionAndResponse: function()
    {
      this.node.empty().jqoteapp(this.template.get(), this);

      if (this.expression) {
        this.expression.node = this.node.find('div.request');
        this.expression.render();
      }

      this.response = this.node.find('div.response');
      this.response.empty().jqoteapp(this.responseTemplate.get(), this);
    },

    _animateDialogShowup: function()
    {
      var responseHeight = this.response.height();

      this.response.height(0).animate({height: responseHeight+'px'}, 400, 'swing', function() {
        this.response.css({ height: '' });
      }.bind(this));
      $('body,html').animate({ scrollTop: this.__getScrollTopForDisplayingWholeDialog() }, 400);
      this.get('console').animateMarginTopIfNecessary(responseHeight);
    },

    __getScrollTopForDisplayingWholeDialog: function()
    {
      var topOfDialog = $('body').height() - this.node.height();
      return topOfDialog - (window.innerHeight - this.get('console').getVisibleDialogsHeight());
    },

    bindToDom: function(node)
    {
      this.node = node;
      this._bindEventListeners();
    },

    remove: function()
    {
      this.get('console').removeDialog(this);
      $('body,html').animate({'scrollTop':$(window).scrollTop()}, 400);
      this.get('console').animateMarginTopIfNecessary(this.node.height()*-1);
      this.node.animate({height:0}, 400, function(){ this.node.remove(); }.bind(this));
      return false;
    },

    __lookupContextObject: function(cls, index, errorMessage)
    {
      var contextObjects = this.container.get('context').findByClass(cls);

      if (contextObjects.length == 0) {
        throw this.create('Consoloid.Error.UserMessage', { message: this.get('translator').trans(errorMessage || "Can't find object.") });
      }

      return contextObjects[index || 0];
    },

    _animateDialogResize: function(baseHeight)
    {
      if (this.get("console").getLastDialog() === this) {
        $('body,html').stop().animate({ scrollTop: this.__getScrollTopForDisplayingWholeDialog() }, 400);
      } else {
        var bottomOfDialog = this.node.position().top + this.node.height();
        var bottomOfPage = $('body,html').scrollTop() + window.innerHeight;
        if (bottomOfDialog < bottomOfPage) {
          var heightDifference = this.node.height() - baseHeight;
          $('body,html').scrollTop($('body,html').scrollTop() + heightDifference);
        }
      }
    },
  }
);
