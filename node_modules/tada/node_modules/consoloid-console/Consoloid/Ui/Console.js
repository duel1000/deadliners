defineClass('Consoloid.Ui.Console', 'Consoloid.Widget.Widget',
  {
    __constructor: function(options)
    {
      this.__base($.extend({
        css: 'Consoloid-Ui-base',
        templateId: 'Consoloid-Ui-Console',
        welcomeMessage: ''
      }, options));

      this.node = this.container.get('dom').baseNode;
      this.prompt = this.container.get('prompt');
      this.dialogs = {};
      this.nextId = 0;
      this.loadedTopics = [];
    },

    startWithDialog: function(serviceName)
    {
      var dialog = this.container.get(serviceName);

      this.start();
      dialog.startWithoutExpression();
    },

    start: function(renderNew)
    {
      var servicesRequiredForBootstrap = this.container.getAllTagged('console-bootstrap');

      $(document).trigger('Consoloid.Ui.Console.starting');

      if (renderNew || this.node.find('.dialogs').length < 1) {
        this.render();
      } else {
        this.bindToDom();
      }

      this.__show();
      this.prompt.focus();
      $(document).trigger('Consoloid.Ui.Console.started');

      this.__sendStartedToServer();
    },

    render: function()
    {
      this.__preRender();
      this.__base();
      this.__postRender();
    },

    __preRender: function()
    {
      this.get('css_loader')
        .load('Consoloid-Ui-semantic-css-semantic.min')
        .load(this.css);
    },

    __postRender: function()
    {
      this._bindEventListeners();

      this.prompt.render();
      this.prompt.node.appendTo(this.node);

      $(window).resize(this.__handleWindowResizing.bind(this));
    },

    __handleWindowResizing: function()
    {
      if (this.node.height() < window.innerHeight) {
        this.node.css('padding-top', window.innerHeight - this.node.height()+'px');
      } else {
        this.node.css('padding-top', 0);
      }
    },

    bindToDom: function()
    {
      this.__preRender();
      this.__bindExistingDialogsToDom();
      this.__postRender();
    },

    __bindExistingDialogsToDom: function()
    {
      var $this = this;
      $('.dialog').each(function(index){
        var
          dialogNode = $(this),
          responseDiv = dialogNode.find('.response'),
          id = parseInt($(this).attr('id').replace('conv-', '')),
          dialog;

        if (!responseDiv.data('cls')) {
          throw new Error('dialog with id: ' + id + ' has not data-cls attribute');
        }

        try {
          dialog = $this.create(responseDiv.data('cls'), {
            container: $this.container
          });
          dialog.bindToDom(dialogNode);
          $this.dialogs[id] = dialog;
        } catch (err) {
          $this.get('logger').log('debug', 'Unable to bind dialog to dom', {
            index: index,
            cls: responseDiv.data('cls')
          });
        }

        $this.nextId = id + 1;
      });
    },

    __show: function()
    {
      setTimeout(
        function(){
          this.node.css('display', 'block').find('.dialogs').css('padding-bottom', this.prompt.node.outerHeight());
          this.__handleWindowResizing();
          this.node.delay(50).animate({opacity: 1}, 500, 'swing');
        }.bind(this),
      100);
    },

    __sendStartedToServer: function()
    {
      if (!global.CACHE_IS_BOOTED) {
        $.ajax({
          type: 'POST',
          async: false,
          data: {},
          url: this.container.get('server').url + "/f"
        });
      }
    },

    animateMarginTopIfNecessary: function(offset)
    {
      if (this.node.height() + offset < window.innerHeight) {
        $('html').css('overflow-y', 'hidden');
        this.node.animate(
          { 'padding-top': window.innerHeight - (this.node.height() + offset)+'px' },
          { queue: false },
          'swing',
          function() {
            $('html').css('overflow-y', 'scroll');
          });
      } else {
        $('html').css('overflow-y', 'scroll');
        this.node.animate({'padding-top':0}, {queue: false});
      }
    },

    createNewDialog: function(dialog)
    {
      var id = this.__getNewDialogId();
      var result = $('<div id="conv-' + id + '" class="dialog" />').appendTo(this.node.find('.dialogs'));

      this.dialogs[id] = dialog;
      return result;
    },

    __getNewDialogId: function()
    {
      while($('#conv-' + this.nextId).length) {
        this.nextId++;
      }

      this.nextId++;
      return this.nextId - 1;
    },

    removeDialog: function(dialog)
    {
      for (var i = 0; i < this.nextId; i++) {
        if (this.dialogs[i] == dialog) {
          delete this.dialogs[i];
        }
      }
    },

    loadTopics: function(topics)
    {
      for(var i = 0, len = topics.length; i < len; i++) {
        if (!topics[i]) {
          continue;
        }
        this.loadTopic(topics[i]);
      }
      return this;
    },

    loadTopic: function(topic)
    {
      if (this.isTopicLoaded(topic)) {
        return;
      }

      this.loadedTopics.push(topic);
      this.get('application').loadTopics([ topic ]);

      var builder = this.create('Consoloid.Interpreter.TreeBuilder', {
        tree: this.get('letter_tree'),
        container: this.container
      });
      builder.append(this.container.getAllTagged([ 'sentence', 'topic.' + topic ]));

      return this;
    },

    getLoadedTopics: function()
    {
      return this.loadedTopics;
    },

    isTopicLoaded: function(topic)
    {
      return ($.inArray(topic, ['framework', 'console']) != -1 || $.inArray(topic, this.loadedTopics) != -1);
    },

    getLastDialog: function()
    {
      var maxId = 0;
      for(var i = 0; i < this.nextId; i++) {
        if (this.dialogs[i] != undefined) {
          maxId = i;
        }
      }

      return this.dialogs[maxId];
    },

    getVisibleDialogsHeight: function()
    {
      return window.innerHeight - this.prompt.node.outerHeight();
    }
  }
);
