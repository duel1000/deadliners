defineClass('Consoloid.Topic.SentenceListing.DataSource', 'Consoloid.Ui.List.DataSource.Array',
  {
    __constructor: function(options)
    {
      this.__base($.extend({
        data: []
      }, options));

      this.__fillData();
      this._clearFilters();
    },

    __fillData: function()
    {
      this.data = [];
      $.each(this.container.definitions, function(name, definition) {
        var tags = definition['tags'] || [];
        if (tags.indexOf('sentence') != -1 && this.container.get(name).requiredContextIsAvailable()) {
          this.data.push(this.__extractSentenceInfo(definition));
        }
      }.bind(this));
    },

    __extractSentenceInfo: function(definition)
    {
      var alternatives = definition.options.patterns.slice(1).map(function(alternative) {
        return typeof(alternative) == 'string' ? alternative : alternative.pattern;
      });

      return {
        topic: this.__getTopicNameFromDefinition(definition),
        pattern: definition.options.patterns[0] || '-',
        alternatives: alternatives
      };
    },

    __getTopicNameFromDefinition: function(definition)
    {
      var topicTag = undefined;
      definition.tags.forEach(function(tag) {
        if (tag.substr(0, 6) == 'topic.') {
          topicTag = tag;
        }
      });

      return topicTag === undefined ?
        this.container.get('translator').trans('Unknown topic') :
        topicTag.substr(6);
    },

    _setFilterValues: function(callback, filterValues)
    {
      this._clearFilters();
      if ('word' in filterValues) {
        this.__filterDataUsingCallback(this.__itemPatternContainsWord.bind(this), filterValues.word);
      }

      if ('topic' in filterValues) {
        this.__filterDataUsingCallback(this.__itemIsFromTopic.bind(this), filterValues.topic);
      }

      callback(undefined);
    },

    __filterDataUsingCallback: function(callback, expectation)
    {
      var i = 0;
      while (i < this.filteredDataIndexes.length) {
        if (callback(this.data[this.filteredDataIndexes[i]], expectation)) {
          i++;
        } else {
          this.filteredDataIndexes.splice(i, 1);
        }
      }
    },

    __itemPatternContainsWord: function(item, word)
    {
      if (this.container.get('translator').trans(item.pattern).toLowerCase().indexOf(word.toLowerCase()) != -1) {
        return true;
      }

      if (item.alternatives.length > 0) {
        for (var i = 0 ; i < item.alternatives.length ; i++) {
          if (this.container.get('translator').trans(item.alternatives[i].toLowerCase()).indexOf(word.toLowerCase()) != -1) {
            return true;
          }
        }
      }

      return false;
    },

    __itemIsFromTopic: function(item, topic)
    {
      return (item.topic == topic);
    }
  }
);