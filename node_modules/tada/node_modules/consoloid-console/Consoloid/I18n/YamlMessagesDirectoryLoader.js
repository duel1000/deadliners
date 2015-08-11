defineClass('Consoloid.I18n.YamlMessagesDirectoryLoader', 'Consoloid.Base.Object',
  {
    __constructor: function(options)
    {
      this.__base(options);
      this.requireProperty('directoryName');
      this.translatorRepository = this.translatorRepository || this.container.get('translator_repository');

      this.container.get('resource_loader').getFinder().globSync(this.directoryName + '/*.yml').forEach(function(resourceName) {
        var lang = require('path').basename(resourceName, '.yml');
        this.translatorRepository.getOrCreateTranslator(lang).addYamlCatalog(resourceName);
      }, this);
    }
  }
);
