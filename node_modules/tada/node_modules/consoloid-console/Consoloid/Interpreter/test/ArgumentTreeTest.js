require('../Tokenizable');
require('../Letter');
require('../LetterTree');
require('../Token');
require('../Argument');
require('../ArgumentTree');

require("../../Test/ConsoleUnitTest");
describeConsoleUnitTest('Consoloid.Interpreter.ArgumentTree', function() {
  var
    tree,
    testArgument1,
    testArgument2;

  beforeEach(function() {
    tree = env.create(Consoloid.Interpreter.ArgumentTree, {});

    testArgument1 = env.create(Consoloid.Interpreter.Argument, {
      pattern: 'with name <value>',
      type: 'string',
      required: false
    });

    testArgument2 = env.create(Consoloid.Interpreter.Argument, {
      pattern: 'with name greeting <value>',
      type: 'string',
      required: false
    });

    testArgument3 = env.create(Consoloid.Interpreter.Argument, {
      pattern: 'allow something',
      type: 'boolean',
      required: false
    });
  });

  describe('#addEntity()', function() {
    it('should not add <value> word', function() {
      tree.addEntity(testArgument1);

      tree.children.should.not.have.property('<');
      tree.children.should.have.property('w');
      tree.children.w.children.should.have.property('i');
      tree.children.w.children.i.children.should.have.property('t');
      tree.children.w.children.i.children.t.entities[0].getEntity().should.eql(testArgument1);
    });
  });

  describe('#autocomplete(text)', function() {
    it('should return arguments with possible values', function() {
      tree.addEntity(testArgument1);

      var result = tree.autocomplete('wi na greeting');
      result.should.have.lengthOf(1);
      result[0].should.have.property('entity', testArgument1);
      result[0].should.have.property('tokens');
      result[0].should.have.property('values');
      result[0].values.should.have.property('value', 'greeting');

      tree.addEntity(testArgument2);

      result = tree.autocomplete('wi name greeting');
      result.should.have.lengthOf(2);
      result[0].values.should.have.property('value', 'greeting');
      result[1].values.should.not.have.property('value');
    });

    it('should return true for arguments without value', function() {
      tree.addEntity(testArgument3);

      var result = tree.autocomplete('al som');
      result.should.have.lengthOf(1);
      result[0].should.have.property('entity', testArgument3);
      result[0].should.have.property('tokens');
      result[0].should.have.property('values');
      result[0].values.should.have.property('value', true);
    });

    it('should return empty array when arguments do not match', function() {
      tree.addEntity(testArgument1);

      var result = tree.autocomplete('foo bar');
      result.should.have.lengthOf(0);

      result = tree.autocomplete('foo');
      result.should.have.lengthOf(0);
    });
  });
});