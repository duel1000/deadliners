require('../../Interpreter/Token');
require('../../Interpreter/Tokenizable');
require("../Object");

defineClass('Consoloid.Context.DummyClass');
defineClass('Consoloid.Context.CastableDummyClass', 'Consoloid.Context.Object');

require("../../Test/ConsoleUnitTest");
describeConsoleUnitTest('Consoloid.Context.Object', function() {
  var context;

  beforeEach(function() {
    context = env.create(Consoloid.Context.Object, {name:'alma'});
  });

  describe('#toString()', function () {
    it('should return string type name for the object.', function(){
      context.toString().should.equal('alma');

      context = env.create(Consoloid.Context.Object, {name:1234});
      context.toString().should.equal('1234');

      (function(){ env.create(Consoloid.Context.Object, {}); }).should.throw();
    });
  });

  describe('#isCastable(cls)', function() {
    it('should return true if cls is the own class object', function(){
      context.isCastable(Consoloid.Context.Object).should.true;
    });

    it('should return true if cls is the name of own class', function(){
      context.isCastable('Consoloid.Context.Object').should.true;
    });

    it('should return true if cls is the name of parent class', function(){
      context.isCastable('Consoloid.Base.Object').should.true;
    });

    it('should return true if cls is the parent class object', function(){
      context.isCastable(Consoloid.Base.Object).should.true;
    });

    it('should return false when cls (string or object) is not in inheritance chain', function(){
      context.isCastable(Consoloid.Context.DummyClass).should.false;
      context.isCastable('Consoloid.Context.DummyClass').should.false;
    });
  });

  describe('#cast(cls)', function() {
    it('should be able to cast object if cls is own class', function(){
      context.cast('Consoloid.Context.Object').should.be.an.instanceOf(Consoloid.Context.Object);
    });

    it('should be able to cast object if cls is the parent class', function(){
      context.cast('Consoloid.Base.Object').should.be.an.instanceOf(Consoloid.Context.Object);
    });

    it('should be able to cast object to the parent\'s parent class', function(){
      context = env.create('Consoloid.Context.CastableDummyClass', {name:'alma'});
      context.cast('Consoloid.Base.Object').should.be.an.instanceOf(Consoloid.Context.CastableDummyClass);
    });

    it('should throw exception if cls (string or object) is not in inheritance chain', function(){
      (function() { context.cast('Consoloid.Context.DummyClass') }).should.throw();
    });
  });

  describe('#isSameClass(cls)', function() {
    it('should be return true if the object is instanced from the same class', function(){
      context.isSameClass(Consoloid.Context.Object).should.be.true;
      context.isSameClass(Consoloid.Base.Object).should.be.false;
    });
  });

  describe('_tokenize(text)', function() {
    it('should not split the name of the context object into separate tokens', function() {
      context._tokenize('Foo Bar: Foo');
      context.tokens.length.should.equal(1);
      context.tokens[0].text.should.equal('Foo Bar: Foo');
    })
  });

  describe('#mention()', function(){
    it('should add to the context itself', function(){
      env.addServiceMock('context', { add: sinon.spy() });
      context.mention();
      env.container.get('context').add.calledWith(context).should.be.true;
    });
  });
});
