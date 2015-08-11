require("../Letter");
require("../../Test/ConsoleUnitTest");
describeConsoleUnitTest('Consoloid.Interpreter.Letter', function() {
  var letter, testEntity;
  beforeEach(function() {
    letter = env.create(Consoloid.Interpreter.Letter, {});
    testEntity = env.create(Consoloid.Base.Object, {});
  });

  describe('#createChild(letter)', function() {
    it('should add new child with given letter', function() {
      letter.createChild('a');
      letter.children.should.have.property('a');
      letter.children.a.should.be.an.instanceof(Consoloid.Interpreter.Letter);
    });

    it('should throw an exception when letter already exists', function() {
      letter.createChild('a');
      (function() { letter.createChild('a'); }).should.throw();
    });
  });

  describe('#addEntity()', function() {
    it('should add entity to the letter', function() {
      letter.addEntity(testEntity);
      letter.hasEntity(testEntity).should.be.true;
      letter.entities.should.have.length(1);
    });

    it('should add entity only once', function() {
      letter.addEntity(testEntity);
      letter.addEntity(testEntity);
      letter.entities.should.have.length(1);
    });
  });

  describe('#removeEntity()', function(){
    it('should remove entity from the letter', function(){
      testEntity = env.create(Consoloid.Base.Object, {name:'alma'}),

      letter.addEntity(env.create(Consoloid.Base.Object, {name:'dummy'}));
      letter.addEntity(testEntity);
      letter.addEntity(env.create(Consoloid.Base.Object, {name:'dummy'}));
      letter.entities.length.should.be.eql(3);
      letter.entities[1].name.should.be.eql('alma')

      letter.removeEntity(testEntity);
      letter.entities.length.should.be.eql(2);
      letter.entities[1].name.should.be.not.eql('alma')
    });
  });

  describe('#getChild(letter)', function() {
    it('should return child node with given letter', function() {
      var letter = env.create(Consoloid.Interpreter.Letter, {});
      var child = letter.createChild('a');
      letter.getChild('a').should.be.equal(child);
    });
  });
});
