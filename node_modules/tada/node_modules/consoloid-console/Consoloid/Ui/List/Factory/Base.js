defineClass('Consoloid.Ui.List.Factory.Base', 'Consoloid.Base.Object',
  {
    __constructor: function(options)
    {
      this.__base($.extend({
        template: null,
      }, options));
      if ('templateId' in this && this.templateId) {
        this.template = this.create('Consoloid.Widget.JQoteTemplate', {
          id: this.templateId,
          container: this.container
        });
      }

      if (this.template == undefined) {
        throw new Error("No template given.")
      }
    },

    render: function(element)
    {
      return $($.jqote(this.template.get(), element));
    },

  }
);
