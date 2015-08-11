require('consoloid-framework/Consoloid/Test/UnitTest');
require('../Translator');
require('../ServerSideTranslator');

describeUnitTest('Consoloid.I18n.ServerSideTranslator', function() {
  var
    translator;

  beforeEach(function() {
    translator = env.create('Consoloid.I18n.ServerSideTranslator', {});
  });

  describe('#retrieveDomainHavingMessage(message)', function() {
    it('should return domain containing given message', function() {
      translator.addMessages({ something: 'anything', foo: 'bar' }, 'package1');
      translator.retrieveDomainHavingMessage('something')
        .should.be.eql({ name: 'package1' , messages: { something: 'anything', foo: 'bar' }});
    });

    it('should throw an error if no domains contain the message, and store it in the _default domain', function() {
      var logger = { log: sinon.stub() };
      env.addServiceMock("logger", logger);

      translator.retrieveDomainHavingMessage('something')
        .should.be.eql({ messageNotInDomain: true });

      logger.log.calledOnce.should.be.ok;
      logger.log.calledWith("debug").should.be.ok;

      translator.retrieveDomainHavingMessage('something')
        .should.be.eql({ name: '_default' , messages: { something: 'something' }});
    });
  });

  describe('#addYamlCatalog(fileName)', function() {
    it('should add file contents to translator', function() {
      translator.addYamlCatalog(__dirname + '/test-messages/hu.yml');
      translator.retrieveDomainHavingMessage('Apply')
        .should.be.eql({ name: 'testpkg', messages: {
          'Apply': 'Alkalmaz',
          'Add': 'Hozzáad',
          'Foo Bar': 'Árvíztűrő tükörfúrógép'
        }});
    });

    it('should check catalog format', function() {
      (function() { translator.addYamlCatalog(__dirname + '/invalid-messages/no_domain.yml'); })
        .should.throwError(/domain key is missing from catalog/);
      (function() { translator.addYamlCatalog(__dirname + '/invalid-messages/no_messages.yml'); })
        .should.throwError(/messages key is missing from catalog/);
      (function() { translator.addYamlCatalog(__dirname + '/invalid-messages/no_source.yml'); })
        .should.throwError(/source key is missing from translation item/);
      (function() { translator.addYamlCatalog(__dirname + '/invalid-messages/no_target.yml'); })
        .should.throwError(/target key is missing from translation item/);
    })
  });

  afterEach(function() {
    env.shutdown();
  });
});
