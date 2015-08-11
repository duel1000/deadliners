require('../Sentence');
require('../Tokenizable');
require('../Expression');
require('../Token');
require('../Letter');
require('../LetterTree');
require('../Argument');
require('../ArgumentTree');

require("../TreeBuilder");
require("../../Test/ConsoleUnitTest");
describeConsoleUnitTest('Consoloid.Interpreter.TreeBuilder', function() {
  var testSentence1, testSentence2, testSentence3;
  beforeEach(function() {
    testSentence1 = env.create(Consoloid.Interpreter.Sentence, { patterns: ['foo bar'], service: 'srv', method: 'start' });
    testSentence2 = env.create(Consoloid.Interpreter.Sentence, { patterns: ['create barcode'], service: 'srv', method: 'start' });
    testSentence3 = env.create(Consoloid.Interpreter.Sentence, { patterns: ['foo foo hey'], service: 'srv', method: 'start' });
  });

  describe('#append(sentences)', function() {
    it('should extend letter tree using sentences', function() {
      var builder = env.create(Consoloid.Interpreter.TreeBuilder, {
        tree: env.create(Consoloid.Interpreter.LetterTree, {})
      });

      builder.append([testSentence1, testSentence2, testSentence3]);

      var token = builder.getTree().getChild('f').getChild('o').getChild('o').getEntities()[0];
      token.getEntity().should.eql(testSentence1.getExpressions()[0]);
    });
  });

  describe('#build()', function() {
    it('should add all services tagged as sentence', function() {
      var builder = env.create(Consoloid.Interpreter.TreeBuilder, {
        tree: env.create(Consoloid.Interpreter.LetterTree, {})
      });

      env.container.addDefinition('tree_builder_test_sentence', {
        cls: Consoloid.Interpreter.Sentence,
        options: {
          patterns: ['hello world'],
          service: 'srv',
          method: 'start'
        },
        tags: ['sentence']
      });

      builder.build();
      builder.getTree().getChild('h').getChild('e').getChild('l').getChild('l').getChild('o').entities.should.have.lengthOf(1);
    });
  });
});
