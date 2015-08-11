require('../../Interpreter/Token');
require('../../Interpreter/Letter');
require('../../Interpreter/LetterTree');
require('../../Interpreter/Tokenizable');
require('../Tree');
require("../Object");
require("../../Test/ConsoleUnitTest");

defineClass('Consoloid.Context.DummyNotCastable');
defineClass('Consoloid.Context.DummyClass', 'Consoloid.Context.Object');

describeConsoleUnitTest('Consoloid.Context.Tree', function() {
  var
    tree;

  beforeEach(function() {
    tree = env.create(Consoloid.Context.Tree, {});
  });

  describe('#autocomplete(text, cls)', function(){
    beforeEach(function() {
      tree.addEntity(env.create('Consoloid.Context.Object', {name:'alm'}));
      tree.addEntity(env.create('Consoloid.Context.Object', {name:'alma'}));
      tree.addEntity(env.create('Consoloid.Context.DummyClass', {name:'alma'}));
      tree.addEntity(env.create('Consoloid.Context.Object', {name:'alma2'}));
      tree.addEntity(env.create('Consoloid.Context.DummyClass', {name:'alma4'}));
      tree.addEntity(env.create('Consoloid.Context.Object', {name:'alma4'}));
    });

    it('should return empty array when not has mathing entites', function(){
      var result = tree.autocomplete('alma2', Consoloid.Context.DummyNotCastable);
      result.length.should.be.eql(0);
    });

    it('should return element which is exactly match with text and cls', function(){
      var  result = tree.autocomplete('alma2', Consoloid.Context.Object);
      result.length.should.be.eql(1);
      result[0].tokens[0].getText().should.be.eql('alma2');
    });

    it('should return with reverse order', function(){
      var result = tree.autocomplete('al', Consoloid.Context.Object);
      result.length.should.be.eql(4);
      result[0].entity.toString().should.be.eql('alma4');
      result[0].value.should.be.eql('alma4');
      result[1].entity.toString().should.be.eql('alma2');
      result[1].value.should.be.eql('alma2');
      result[2].entity.toString().should.be.eql('alma');
      result[2].value.should.be.eql('alma');
      result[3].entity.toString().should.be.eql('alm');
      result[3].value.should.be.eql('alm');

      result[0].exactMatch.should.be.false;
      result[1].exactMatch.should.be.false;
    });

    it('should return the exact match in the first place', function(){
        var result = tree.autocomplete('alm', Consoloid.Context.Object);
        result.length.should.be.eql(4);
        result[0].entity.toString().should.be.eql('alm');
        result[0].value.should.be.eql('alm');
        result[1].entity.toString().should.be.eql('alma4');
        result[1].value.should.be.eql('alma4');
        result[2].entity.toString().should.be.eql('alma2');
        result[2].value.should.be.eql('alma2');
        result[3].entity.toString().should.be.eql('alma');
        result[3].value.should.be.eql('alma');

        result[0].exactMatch.should.be.true;
        result[1].exactMatch.should.be.false;
    });

    it('should collapse multiple exact text match and castable objects', function(){
      var  result = tree.autocomplete('alma4', Consoloid.Context.Object);
      result.length.should.be.eql(1);
      result[0].tokens[0].getText().should.be.eql('alma4');

      result = tree.autocomplete('al', Consoloid.Context.DummyClass);
      result.length.should.be.eql(2);
      result[0].tokens[0].getText().should.be.eql('alma4');
      result[1].tokens[0].getText().should.be.eql('alma');
    });
  });

  describe('#autocompleteWithSentence(text, argument, sentence, argumentValues)', function() {
    beforeEach(function() {
      tree.addEntity(env.create('Consoloid.Context.Object', {name:'alm'}));
      tree.addEntity(env.create('Consoloid.Context.Object', {name:'alma'}));
      tree.addEntity(env.create('Consoloid.Context.DummyClass', {name:'alma'}));
      tree.addEntity(env.create('Consoloid.Context.Object', {name:'alma2'}));
      tree.addEntity(env.create('Consoloid.Context.DummyClass', {name:'alma4'}));
      tree.addEntity(env.create('Consoloid.Context.Object', {name:'alma4'}));
    });

    it('should consider the sentence and arguments if thy present', function(){
    var
      sentence = {
        validateArguments: function(arguments) {
          arguments.context.entity.should.be.ok;
          if (arguments.context.value != 'alma') {
            return false;
          }
          return true;
        }
      },
      arguments = {
        context: {
          name: 'context',
          cls: 'Consoloid.Context.Object'
        }
      };

      result = tree.autocompleteWithSentence('al', 'context', sentence, arguments);

      result.length.should.be.eql(1);
      result[0].entity.toString().should.be.eql('alma');
    });
  });

  describe('#findTokens(word, cls)', function(){
    beforeEach(function() {
      tree.addEntity(env.create('Consoloid.Context.Object', {name:'alma'}));
      tree.addEntity(env.create('Consoloid.Context.DummyClass', {name:'alma'}));
    });

    it('should include entites with the same name', function(){
      var result = tree.findTokens('alma', Consoloid.Context.Object);
      result.length.should.be.eql(2);
    });
  });
});
