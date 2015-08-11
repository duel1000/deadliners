defineClass('Consoloid.Ui.List.Factory.Collapsing', 'Consoloid.Base.Object',
  {
    __constructor: function(options)
    {
      this.__base($.extend({
        templateId: 'Consoloid-Ui-List-Factory-CollapsingElement'
      }, options));

      this.__requireParameters();
    },

    __requireParameters: function()
    {
      this.requireProperty('collapsedTemplateId');
      this.requireProperty('extendedTemplateId');
      this.requireProperty('eventDispatcher');
    },

    render: function(data)
    {
      var element =  this.create("Consoloid.Ui.List.Factory.CollapsingElement", {
        eventDispatcher: this.eventDispatcher,
        templateId: this.templateId,
        collapsedTemplateId: this.collapsedTemplateId,
        extendedTemplateId: this.extendedTemplateId,
        data: data,
        container: this.container
      });
      element.render();
      return element.node;
    }
  }
);