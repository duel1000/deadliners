require('../../Interpreter/Letter');
require('../../Interpreter/LetterTree');
require('../../Interpreter/Token');
require('../../Interpreter/Tokenizable');
require("../Queue");
require("../Object");
require("../Tree");

defineClass('Consoloid.Context.DummyNotCastable');
defineClass('Consoloid.Context.DummyClass', 'Consoloid.Context.Object');

require("../../Test/ConsoleUnitTest");
describeConsoleUnitTest('Consoloid.Context.Queue', function() {
  var
    queue,
    tree,
    addContextObjectsToQueueAndTree = function(contextObjects)
    {
      var tokens = contextObjects.map(function(object, index) {
        queue.add(object);

        var tokenMock = env.mock('Consoloid.Interpreter.Token');
        tokenMock.getEntity.returns(object);
        return tokenMock;
      });

      tree.findTokens.returns(tokens);
    };

  beforeEach(function() {
    tree = env.mock('Consoloid.Context.Tree');
    tree.findTokens.returns([]);
    queue = env.create(Consoloid.Context.Queue, {limit:3, tree: tree});
  });

  describe('#autocomplete(text, cls)', function() {
    it('should call context tree autocomplete method', function(){
      queue.autocomplete('alm', Consoloid.Context.Object);
      tree.autocomplete.alwaysCalledWith('alm', Consoloid.Context.Object);
    });
  });

  describe('#hasClass(cls)', function() {
    it('should return context has object with class or not', function(){
      var
        object1 = env.create('Consoloid.Context.Object', {name:'first'}),
        object2 = env.create('Consoloid.Context.Object', {name:'second'});

      queue.hasClass('Consoloid.Context.Object').should.be.false;

      queue.add(object1);
      queue.hasClass('Consoloid.Context.Object').should.be.true;
      queue.add(object2);
      queue.hasClass('Consoloid.Context.Object').should.be.true;

      queue.remove(object1);
      queue.hasClass('Consoloid.Context.Object').should.be.true;
      queue.remove(object2);
      queue.hasClass('Consoloid.Context.Object').should.be.false;
    });
  });

  describe('#findByClass(cls)', function() {
    beforeEach(function() {
      queue.add(env.create('Consoloid.Context.Object', {name:'first'}));
      queue.add(env.create('Consoloid.Context.DummyClass', {name:'second'}));
      queue.add(env.create('Consoloid.Context.Object', {name:'third'}));
      queue.add(env.create('Consoloid.Context.DummyClass', {name:'fourth'}));
      queue.add(env.create('Consoloid.Context.Object', {name:'fifth'}));
    });

    it('should limit the number returned items as configured in constructor.', function(){
      queue.limit.should.be.eql(3);

      queue = env.create(Consoloid.Context.Queue, { tree: tree });
      queue.limit.should.be.eql(5);
    });

    it('should return objects castable to cls.', function(){
      var objs = queue.findByClass('Consoloid.Context.DummyClass');
      objs.should.be.an.instanceOf(Array);
      objs.length.should.be.eql(2);
      objs[0].entity.name.should.be.eql('fourth');
      objs[1].entity.name.should.be.eql('second');

      var objs = queue.findByClass('Consoloid.Context.Object');
      objs.length.should.be.eql(3);
      objs[0].entity.name.should.be.eql('fifth');
      objs[1].entity.name.should.be.eql('fourth');
      objs[2].entity.name.should.be.eql('third');
    });

    it('should return empty array when none of its items is castable to cls.', function(){
      queue.findByClass(Consoloid.Context.DummyNotCastable).should.be.empty;
    });

    it('should sort objects in reverse order as added.', function(){
      var objs = queue.findByClass('Consoloid.Context.Object');
      objs[0].entity.name.should.be.eql('fifth');
      addContextObjectsToQueueAndTree([env.create('Consoloid.Context.DummyClass', {name:'alma'})]);
    });
  });

  describe('#findByStringAndClass(str, cls)', function(){
    beforeEach(function() {
      addContextObjectsToQueueAndTree([
        env.create('Consoloid.Context.Object', {name:'alma'}),
        env.create('Consoloid.Context.DummyClass', {name:'alma'}),
        env.create('Consoloid.Context.Object', {name:'alma2'})
      ]);
    });

    it('should return empty array when found nothing', function(){
      queue.findByStringAndClass('korte', Consoloid.Context.Object).should.be.an.instanceOf(Array);
      queue.findByStringAndClass('korte', Consoloid.Context.Object).should.be.empty;
    });

    it('should return an array with all object', function(){
      var found = queue.findByStringAndClass('alma', Consoloid.Context.Object);
      found.length.should.be.eql(2);
      found[0].isSameClass(Consoloid.Context.DummyClass).should.be.true;
      addContextObjectsToQueueAndTree([env.create('Consoloid.Context.DummyClass', {name:'alma'})]);
    });
  });

  describe('#getByClassAndString(cls, str)', function(){
    beforeEach(function() {
      addContextObjectsToQueueAndTree([
        env.create('Consoloid.Context.Object', {name:'alma'}),
        env.create('Consoloid.Context.DummyClass', {name:'alma'}),
        env.create('Consoloid.Context.Object', {name:'alma2'})
      ]);
    });

    it('should return undefined when found nothing', function(){
      (queue.getByClassAndString(Consoloid.Context.Object, 'dummy') === undefined).should.be.true;
    });

    it('should return the casted object', function(){
      var obj = queue.getByClassAndString(Consoloid.Context.Object, 'alma2');
      obj.isSameClass(Consoloid.Context.Object).should.be.true;
      obj.toString().should.be.eql('alma2');
    });

    it('should return the first element with the given class and name on multiple match', function(){
      var obj = queue.getByClassAndString(Consoloid.Context.Object, 'alma');
      obj.isSameClass(Consoloid.Context.DummyClass).should.be.true;
      obj.toString().should.be.eql('alma');
    });
  });

  describe('#add(object)', function() {
    it('should can only add object to the queue which is castable to the Consoloid.Context.Object', function(){
      (function(){ queue.add({name:'alma'}); }).should.throw();
    });

    it('should add object to the queue.', function(){
      queue.entities.should.empty;
      queue.add(env.create('Consoloid.Context.Object', {name:'alma'}));
      queue.entities.should.not.empty;
      queue.add(env.create('Consoloid.Context.Object', {name:'korte'}));
      queue.entities[0].name.should.eql('korte');
    });

    it('should remove and readd an element with the same name and same cls', function(){
      var found;
      addContextObjectsToQueueAndTree([env.create('Consoloid.Context.DummyClass', {name:'alma'})]);
      queue.add(env.create('Consoloid.Context.DummyClass', {name:'korte'}));
      found = queue.findByClass(Consoloid.Context.DummyClass);
      found.length.should.be.eql(2);
      found[0].entity.name.should.be.eql('korte');

      queue.add(env.create('Consoloid.Context.DummyClass', {name:'alma'}));
      found = queue.findByClass(Consoloid.Context.DummyClass);
      found.length.should.be.eql(2);
      found[0].entity.name.should.be.eql('alma');
      found[0].entity.isSameClass(Consoloid.Context.DummyClass).should.be.true;

      queue.add(env.create('Consoloid.Context.Object', {name:'alma'}));
      found = queue.findByClass(Consoloid.Context.Object);
      found.length.should.be.eql(3);
      found[0].entity.name.should.be.eql('alma');
      found[0].entity.isSameClass(Consoloid.Context.Object).should.be.true;
    });
  });

  describe('#remove(object)', function() {
    it('should remove object from the queue.', function(){
      queue.add(env.create('Consoloid.Context.DummyClass', {name:'fourth'}));
      queue.add(env.create('Consoloid.Context.Object', {name:'fifth'}));

      var objs = queue.findByClass('Consoloid.Context.Object');
      objs[0].entity.name.should.be.eql('fifth');
      queue.remove(objs[0].entity)

      objs = queue.findByClass('Consoloid.Context.Object');
      objs.length.should.be.eql(1);
      objs[0].entity.name.should.be.eql('fourth');
    });
  });

  describe('#mention(cls, str)', function(){
    beforeEach(function(){
      Consoloid.Context.DummyClass.fromString = sinon.stub();
    });

    it('should create a new object when it does not exist with context object\'s fromString method', function(){
      Consoloid.Context.DummyClass.fromString.returns(env.create('Consoloid.Context.DummyClass', {name:'foo'}));

      queue.mention('Consoloid.Context.DummyClass', 'foo');

      Consoloid.Context.DummyClass.fromString.alwaysCalledWith('foo', env.container).should.be.true;;

      var matches = queue.findByClass('Consoloid.Context.DummyClass');
      matches.should.have.length(1);
      matches[0].entity.toString().should.be.eql('foo');
    });

    it('should readd the context object when it is exists in the context', function(){
      addContextObjectsToQueueAndTree([env.create('Consoloid.Context.DummyClass', {name: 'foo' })]);
      queue.add(env.create('Consoloid.Context.DummyClass', {name:'bar'}));

      var matches = queue.findByClass('Consoloid.Context.DummyClass');
      matches.should.have.length(2);
      matches[0].entity.toString().should.be.eql('bar');
      matches[1].entity.toString().should.be.eql('foo');

      queue.mention('Consoloid.Context.DummyClass', 'foo');

      var matches = queue.findByClass('Consoloid.Context.DummyClass');
      matches.should.have.length(2);
      matches[0].entity.toString().should.be.eql('foo');
      matches[1].entity.toString().should.be.eql('bar');

      Consoloid.Context.DummyClass.fromString.called.should.be.false;
    });

    afterEach(function(){
      Consoloid.Context.DummyClass.fromString = undefined;
    });
  });

  describe('#forget(cls, str)', function(){
    beforeEach(function(){
      addContextObjectsToQueueAndTree([env.create('Consoloid.Context.DummyClass', {name: 'foo' })]);
    });

    it('should does nothing when queue does not has object with the exact class and string', function(){
      queue.forget('Consoloid.Context.Object', 'foo');

      found = queue.findByClass(Consoloid.Context.DummyClass);
      found.length.should.be.eql(1);
    });

    it('should remove from the queue the matching object', function(){
      queue.forget('Consoloid.Context.DummyClass', 'foo');

      found = queue.findByClass(Consoloid.Context.DummyClass);
      found.should.be.empty;
    });
  });

  describe('#empty()', function() {
    it('should clear the queue.', function(){
      queue.add(env.create('Consoloid.Context.Object', {name:'alma'}));
      queue.hasClass('Consoloid.Context.Object').should.be.true;
      queue.entities.should.not.empty;
      queue.empty();
      queue.entities.should.empty;
      queue.hasClass('Consoloid.Context.Object').should.be.false;
    });
  });
});
