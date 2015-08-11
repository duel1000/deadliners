defineClass('Consoloid.I18n.ClientSideTranslator', 'Consoloid.I18n.Translator',
  {
    __constructor: function(options)
    {
      this.__base($.extend({
        domains: Consoloid.I18n.ClientSideTranslator.CACHED_DOMAINS
      }, options));
      this.requireProperty('language');
      this.translatorRepository = this.translatorRepository || this.container.get('translator_repository');
    },

    setLanguage: function(language)
    {
      this.language = language;
      this.domains = { _default: {} };
    },

    resolveMissing: function(message)
    {
      var domain = this.translatorRepository.retrieveDomainHavingMessage(this.language, message);
      if (domain.messageNotInDomain) {
        this.domains._default[message] = message;
        return this.domains._default;
      }

      this.addMessages(domain.messages, domain.name);
      return domain.messages;
    }
  },
  {
    CACHED_DOMAINS: { _default: {} }
  }
);