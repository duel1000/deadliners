defineClass('Consoloid.Topic.SentenceListing.Dialog', 'Consoloid.Ui.List.Dialog.Dialog',
  {
    __constructor: function(options)
    {
      this.__base($.extend({
        responseTemplateId: 'Consoloid-Topic-SentenceListing-Dialog',
      }, options));
    },

    start: function(args, expression)
    {
      this.__base(args, expression);
      this.__applyFiltersFromArguments();
    },

    __applyFiltersFromArguments: function()
    {
      var filters = [];
      if (this.arguments.word && this.arguments.word.value) {
        filters.push('word: ' + this.arguments.word.value);
      }

      if (this.arguments.topic && this.arguments.topic.value) {
        filters.push('topic: ' + this.arguments.topic.value);
      }

      if (filters.length) {
        this.list.setFilterString(filters.join(' '));
      }
    }
  }
);