defineClass('Consoloid.Ui.List.Dialog.Dialog', 'Consoloid.Ui.Dialog',
  {
    __constructor: function(options)
    {
      this.__base($.extend({
        responseTemplateId: 'Consoloid-Ui-List-Dialog',
      }, options));

      this.requireProperty('name');
      this.requireProperty('list');

      this.__createUniqueName();

      this.list.getEventDispatcher().bind("size-changed", this.__onSizeChanged.bind(this));
    },

    __onSizeChanged: function()
    {
      this._animateDialogResize(this.baseHeight);
      this.baseHeight = this.node.height();
    },

    __createUniqueName: function()
    {
      this.__self.index[this.name] = this.__self.index[this.name]+1 || 1;
      this.name = this.get('translator').trans(this.name) + ': ' + this.__self.index[this.name];
    },

    render: function()
    {
      this.__createReferenceInContext();

      this.__base();

      this.__addListWidgetToResponse();

      this.baseHeight = this.node.height();
    },

    __createReferenceInContext: function()
    {
      this.contextObject = this.create('Consoloid.Ui.List.Dialog.ContextObject', {
        name: this.name,
        list: this.list,
        container: this.container
      });
      this.container.get('context').add(this.contextObject);

      this.expression.setReferenceText(this.name);
    },

    __addListWidgetToResponse: function()
    {
      this.list.setNode(this.node.find(".response .list-dialog"));
      this.list.render();
    }
  }, {
    index: {}
  }
);