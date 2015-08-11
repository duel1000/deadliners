require('../YamlMessagesDirectoryLoader');
require('consoloid-framework/Consoloid/Test/UnitTest');
describeUnitTest('Consoloid.I18n.YamlMessagesDirectoryLoader', function() {
  describe('#constructor()', function() {
    it('should add message file directory to translator repository', function() {
      var translatorRepository = {
        addYamlCatalog: sinon.spy()
      };
      translatorRepository.getOrCreateTranslator = sinon.stub().returns(translatorRepository);

      var finder = {
        globSync: sinon.stub().returns(['/test/hu.yml'])
      };

      env.container.get('resource_loader').getFinder = sinon.stub().returns(finder);

      env.create('Consoloid.I18n.YamlMessagesDirectoryLoader', {
        translatorRepository: translatorRepository,
        directoryName: 'Consoloid/I18n/test/test-messages'
      });

      translatorRepository.getOrCreateTranslator.calledOnce.should.be.ok;
      translatorRepository.getOrCreateTranslator.alwaysCalledWith('hu');
      translatorRepository.addYamlCatalog.calledOnce.should.be.ok;
      translatorRepository.addYamlCatalog.alwaysCalledWith('/test/hu.yml');

      finder.globSync.alwaysCalledWith('Consoloid/I18n/test/test-messages/*.yml');
    });
  });
});