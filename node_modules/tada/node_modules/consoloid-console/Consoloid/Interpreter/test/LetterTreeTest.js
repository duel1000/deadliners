require('../Token');
require('../Tokenizable');
require('../Letter');

require("../LetterTree");
require("../../Test/ConsoleUnitTest");

defineClass('TestExpression', 'Consoloid.Interpreter.Tokenizable',
  {
    __constructor: function(options) {
      this.__base(options);
      this.requireProperty('text');
      this._tokenize(options.text);
    }
  }
);

describeConsoleUnitTest('Consoloid.Interpreter.LetterTree', function() {
  var
    testExpression1,
    testExpression2,
    testExpression3;

  beforeEach(function() {
    testExpression1 = env.create(TestExpression, { text: 'foo bar'});
    testExpression2 = env.create(TestExpression, { text: 'create barcode' });
    testExpression3 = env.create(TestExpression, { text: 'foo foo hey' });
  });

  describe('#addEntity(entity)', function() {
    it('should add letters representing entity tokens to the tree', function() {
      var tree = env.create(Consoloid.Interpreter.LetterTree, {});
      tree.addEntity(testExpression1);

      tree.children.should.have.property('f');
      tree.children.f.children.should.have.property('o');
      tree.children.f.children.o.children.should.have.property('o');

      tree.children.should.have.property('b');
      tree.children.b.children.should.have.property('a');
      tree.children.b.children.a.children.should.have.property('r');

      tree.children.f.children.should.not.have.property('b');
      tree.children.f.children.should.not.have.property('a');
      tree.children.f.children.should.not.have.property('r');
    });

    it('should add sentence expression to every letter of the tree', function() {
      var tree = env.create(Consoloid.Interpreter.LetterTree, {});
      tree.addEntity(testExpression1);

      tree.getChild('f').getEntities()[0].getEntity().should.eql(testExpression1);
      tree.getChild('f').getChild('o').getEntities()[0].getEntity().should.eql(testExpression1);
      tree.getChild('f').getChild('o').getChild('o').getEntities()[0].getEntity().should.eql(testExpression1);
    });
  });

  describe('#removeEntity(entity)', function() {
    it('should remove the entity from the whole tree', function(){
      var testExpression2 = env.create(TestExpression, { text: 'foo am' })
      var tree = env.create(Consoloid.Interpreter.LetterTree, {});
      tree.addEntity(testExpression1);
      tree.addEntity(testExpression2);

      tree.children.should.have.property('f');
      tree.children.should.have.property('a');
      tree.children.f.entities.length.should.be.eql(2);
      tree.children.a.entities.length.should.be.eql(1);
      tree.removeEntity(testExpression2);

      tree.children.should.have.property('f');
      tree.children.f.entities.length.should.be.eql(1);
      tree.children.should.not.have.property('a');
    });
  });

  describe('#_findTokens(word)', function() {
    it('should return matching tokens for given word', function() {
      var tree = env.create(Consoloid.Interpreter.LetterTree, {});
      tree.addEntity(testExpression1);

      var testExpression2 = env.create(TestExpression, { text: 'create barcode' });
      tree.addEntity(testExpression2);

      var testExpression3 = env.create(TestExpression, { text: 'foo foo hey' });
      tree.addEntity(testExpression3);

      var result = tree._findTokens('bar');
      result.should.have.lengthOf(2);
      result.should.include(testExpression1.getTokens()[1]);
      result.should.include(testExpression2.getTokens()[1]);
      result.should.not.include(testExpression3.getTokens()[0]);

      result = tree._findTokens('barcode');
      result.should.have.lengthOf(1);
      result.should.not.include(testExpression1.getTokens()[1]);
      result.should.include(testExpression2.getTokens()[1]);
      result.should.not.include(testExpression3.getTokens()[0]);
    });

    it('should be case insensitive', function() {
      var tree = env.create(Consoloid.Interpreter.LetterTree, {});
      tree.addEntity(testExpression1);

      var testExpression2 = env.create(TestExpression, { text: 'Create bArcode' });
      tree.addEntity(testExpression2);

      var result = tree._findTokens('creat');
      result.should.have.lengthOf(1);
      result.should.not.include(testExpression1.getTokens()[0]);
      result.should.include(testExpression2.getTokens()[0]);

      result = tree._findTokens('BaRCO');
      result.should.have.lengthOf(1);
      result.should.not.include(testExpression1.getTokens()[1]);
      result.should.include(testExpression2.getTokens()[1]);
    });
  });

  describe('#autocomplete(text)', function() {
    it('should find matching sentences for text using letter tree', function() {
      var tree = env.create(Consoloid.Interpreter.LetterTree, {});
      tree.addEntity(testExpression1);
      tree.addEntity(testExpression2);
      tree.addEntity(testExpression3);

      var result = tree.autocomplete('fo');

      result.should.have.lengthOf(2);
      result[0].should.have.property('entity', testExpression1);
      result[1].should.have.property('entity', testExpression3);

      result = tree.autocomplete('fo ba');
      result.should.have.lengthOf(1);
      result[0].should.have.property('entity', testExpression1);

      result = tree.autocomplete('ba ');
      result.should.have.lengthOf(2);
      result[0].should.have.property('entity', testExpression1);
      result[1].should.have.property('entity', testExpression2);
    });

    it('should only find words in order', function () {
      var testExpression2 = env.create(TestExpression, { text: 'bar foo' });
      var tree = env.create(Consoloid.Interpreter.LetterTree, {});
      tree.addEntity(testExpression1);
      tree.addEntity(testExpression2);

      var result = tree.autocomplete('ba fo');

      result.should.have.lengthOf(1);
      result[0].should.have.property('entity', testExpression2);

      result = tree.autocomplete('fo ba');
      result.should.have.lengthOf(1);
      result[0].should.have.property('entity', testExpression1);
    });

    it('should include an entity once in the results', function() {
      var testExpression2 = env.create(TestExpression, { text: 'foo foo hey' });
      var tree = env.create(Consoloid.Interpreter.LetterTree, {});
      tree.addEntity(testExpression1);
      tree.addEntity(testExpression2);

      var result = tree.autocomplete('fo');

      result.should.have.lengthOf(2);
      result[0].should.have.property('entity', testExpression1);
      result[1].should.have.property('entity', testExpression2);
    });

    it('should return empty array for tokenizer syntax error', function() {
      var testExpression2 = env.create(TestExpression, { text: 'foo foo hey' });
      var tree = env.create(Consoloid.Interpreter.LetterTree, {});

      var result = tree.autocomplete(' ');
      result.should.be.empty;
    });

    it('should work with repeating words', function() {
      var testExpression1 = env.create(TestExpression, { text: 'foo foo hey' });
      var tree = env.create(Consoloid.Interpreter.LetterTree, {});
      tree.addEntity(testExpression1);

      var result = tree.autocomplete('foo foo');

      result.should.have.lengthOf(1);
      result[0].should.have.property('entity', testExpression1);
    });

  });
});
