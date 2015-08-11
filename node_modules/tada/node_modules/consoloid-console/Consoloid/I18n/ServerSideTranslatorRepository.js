defineClass('Consoloid.I18n.ServerSideTranslatorRepository', 'Consoloid.Base.Object',
  {
    __constructor: function(options)
    {
      this.__base($.extend({
        language: 'en',
        translators: {}
      }, options));

      var $this = this;
      this.bind('Consoloid.Server.Cache.Boot.started', function(event) {
        $this.retrieveDomainHavingMessage = $this.__retrieveDomainHavingMessageAndStoreToBoot;
      });
      this.bind('Consoloid.Server.Cache.Boot.finished', function(event) {
        $this.retrieveDomainHavingMessage = $this.__retrieveDomainHavingMessage;
      });
    },

    setLanguage: function(language)
    {
      this.language = language;
      return this;
    },

    getLanguage: function()
    {
      return this.language;
    },

    addYamlCatalogsFromDirectory: function(directoryName)
    {
      var fs = require('fs');
      var path = require('path');
      var fileNames = fs.readdirSync(directoryName);
      fileNames.forEach(function(fileName) {
        this.getOrCreateTranslator(path.basename(fileName, '.yml'))
          .addYamlCatalog(path.join(directoryName, fileName));
      }, this);
    },

    getOrCreateTranslator: function(language)
    {
      if (!(language in this.translators)) {
        this.translators[language] = this.create('Consoloid.I18n.ServerSideTranslator', { container: this.container });
      }

      return this.translators[language];
    },

    trans: function(message)
    {
      return this.getOrCreateTranslator(this.language).trans(message);
    },

    retrieveDomainHavingMessage: function(language, message)
    {
      return this.__retrieveDomainHavingMessage(language, message);
    },

    __retrieveDomainHavingMessage: function(language, message)
    {
      return this.getOrCreateTranslator(language).retrieveDomainHavingMessage(message);
    },

    __retrieveDomainHavingMessageAndStoreToBoot: function(language, message)
    {
      var domain = this.__retrieveDomainHavingMessage(language, message);
      this.get('boot_cache_builder').addJS("global.Consoloid.I18n.ClientSideTranslator.CACHED_DOMAINS['"+domain.name+"'] = " + JSON.stringify(domain.messages));
      return domain;
    }
  }
);
