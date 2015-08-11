defineClass('Consoloid.Topic.LoadDialog', 'Consoloid.Ui.Dialog',
  {
    __constructor: function(options)
    {
      this.__base($.extend({
        responseTemplateId: 'Consoloid-Topic-Load',
      }, options));
    },

    setup: function()
    {
      var console = this.get('console');
      this.topicLoaded = console.isTopicLoaded(this.arguments.name.value)

      if (!this.topicLoaded) {
        console.loadTopic(this.arguments.name.value);
      }
    }
  }
);