require('consoloid-framework/Consoloid/Test/UnitTest');
require('../Translator');

describeUnitTest('Consoloid.I18n.Translator', function(){
  var
    translator;

  beforeEach(function() {
    translator = env.create('Consoloid.I18n.Translator', {});
  });

  describe('#addMessage(message, translation, domain)', function() {
    it('should add message to catalog', function() {
      translator.addMessage('foo', 'bar');
      translator.domains['_default'].foo.should.be.equal('bar');
    })
  });

  describe('#trans(message, arguments, domain)', function() {
    it('should translate message in catalog', function() {
      translator.addMessages({ 'test': 'teszt' });
      translator.trans('test').should.be.equal('teszt');
    });

    it('should translate message from given domain', function() {
      translator.addMessages({ 'test': 'fail' }, 'domain1');
      translator.addMessages({ 'test': 'success' }, 'domain2');
      translator.trans('test', {}, 'domain2').should.be.equal('success');
    });

    it('should use given arguments during translation', function() {
      translator.addMessages({ 'hello %name%!': 'hi %name%!' });
      translator.trans('hello %name%!', { '%name%': 'John'}).should.equal('hi John!');
      translator.trans('hello %name%!').should.be.equal('hi %name%!');
    });

    it('should call resolveMissing() when translation is missing from vocabulary', function() {
      sinon.spy(translator, 'resolveMissing');

      translator.trans('something');

      translator.resolveMissing.calledOnce.should.be.ok;
    });
  });

  afterEach(function() {
    env.shutdown();
  });
});
