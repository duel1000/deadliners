defineClass('Consoloid.Topic.ListDialog', 'Consoloid.Ui.Dialog',
  {
    __constructor: function(options)
    {
      this.__base($.extend({
        responseTemplateId: 'Consoloid-Topic-List',
      }, options));
    },

    start: function(args, sentence)
    {
      this.handleArguments(args, sentence);
      if (!this.arguments.loaded && !this.arguments.available) {
        this.arguments.loaded = true;
        this.arguments.available = true;
      }

      this.startWithoutExpression();
    },

    startWithLoadedOnly: function(args, sentence)
    {
      this.handleArguments(args, sentence);
      this.arguments.loaded = true;
      this.arguments.available = false;

      this.startWithoutExpression();
    },

    startWithAvailableOnly: function(args, sentence)
    {
      this.handleArguments(args, sentence);
      this.arguments.loaded = false;
      this.arguments.available = true;

      this.startWithoutExpression();
    },

    setup: function()
    {
      this.loadedTopics = {};
      this.availableTopics = {};

      if (this.arguments.loaded) {
        this.__getDetailsForLoadedTopics();
      }

      if (this.arguments.available) {
        this.__getDetailsForAvailableTopics();
      }
    },

    __getDetailsForLoadedTopics: function()
    {
      var topicNames = this.get('console').getLoadedTopics();
      var resourceLoader = this.get('resource_loader');
      var $this = this;
      $.each(topicNames, function(index, name) {
        $this.loadedTopics[name] = resourceLoader.getTopic(name);
      });
    },

    __getDetailsForAvailableTopics: function() {
      var topics = this.get('resource_loader').getTopics() || [];
      var console = this.get('console');
      var $this = this;
      $.each(topics, function(index, topic) {
        if (!console.isTopicLoaded(topic.name)) {
          $this.availableTopics[topic.name] = topic;
        }
      });
    }
  }
);
