defineClass('Consoloid.I18n.ServerSideTranslator', 'Consoloid.I18n.Translator',
  {
    __constructor: function(options)
    {
      this.__base(options);
      require('js-yaml');
    },

    retrieveDomainHavingMessage: function(message)
    {
      var domain = this._getFirstDomainHaving(message);
      if (domain === null) {
        this.resolveMissing(message);
        this.container.get('logger').log("debug", 'Message "' + message + '" was not found in any domain');
        return { messageNotInDomain: true };
      }
      return domain;
    },

    addYamlCatalog: function(fileName)
    {
      var catalog = require(fileName);
      if (!('domain' in catalog)) {
        throw new Error('domain key is missing from catalog ' + fileName);
      }
      if (!('messages' in catalog)) {
        throw new Error('messages key is missing from catalog ' + fileName);
      }

      for (var i in catalog.messages) {
        var item = catalog.messages[i];

        if (!('source' in item)) {
          throw new Error('source key is missing from translation item ' + i);
        }
        if (!('target' in item)) {
          throw new Error('target key is missing from translation item ' + i);
        }

        // Note: multiline yaml strings automatically end with newline
        //       that has to be removed.
        this.addMessage(
          item.source.replace(/\n$/, ''),
          item.target.replace(/\n$/, ''),
          item.domain || catalog.domain
        );
      }
    }
  }
);
