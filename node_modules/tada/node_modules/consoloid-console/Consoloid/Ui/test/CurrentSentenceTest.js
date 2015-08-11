require('../../Interpreter/Token');
require('../../Interpreter/Tokenizable');
require('../../Interpreter/Letter');
require('../../Interpreter/LetterTree');
require('../../Interpreter/Argument');
require('../../Interpreter/ArgumentTree');
require('../../Interpreter/Sentence');
require('../../Interpreter/Expression');

require("../CurrentSentence");
require("../../Test/ConsoleUnitTest");
describeConsoleUnitTest('Consoloid.Ui.CurrentSentence', function() {
  var
  current,
  sentence,
  sentenceWithoutArguments,
  expression,
  expression2,
  expressionWithoutArguments;

  beforeEach(function() {
    current = env.create(Consoloid.Ui.CurrentSentence, {});
    sentence = env.create(Consoloid.Interpreter.Sentence, {
        patterns: [],
        arguments: {
          name: {
            type: String,
            pattern: "name <value>"
          },
          path: {
            type: String,
            pattern: "path <value>"
          }
        },
        service: 'dummy'
      });
    sentenceWithoutArguments = env.create(Consoloid.Interpreter.Sentence, {
        patterns: [],
        arguments: {},
        service: 'dummy'
      });
    expression = env.create(Consoloid.Interpreter.Expression, { sentence: sentence, pattern: 'Move <name> to <path>' });
    expression2 = env.create(Consoloid.Interpreter.Expression, { sentence: sentence, pattern: 'Move <name> folder to <path>' });
    expressionWithoutArguments = env.create(Consoloid.Interpreter.Expression, { sentence: sentenceWithoutArguments, pattern: 'Hello world' });
  });

  describe('#set(expression)', function(){
    it('should set the current sentence', function(){
      (undefined === current.expression).should.be.true;
      current.set(expression);
      current.expression.should.not.be.undefined;
    });
  });

  describe('#clear()', function(){
    it('should clear the current sentence', function(){
      current.set(expression);
      current.expression.should.not.be.undefined;
      current.clear();
      (undefined === current.expression).should.be.true;
    })
  });

  describe('#parse(string)', function(){
    beforeEach(function(){
      current.set(expression);
    });

    describe('#isMatching()', function(){
      describe('should return true', function(){
        it('when the sentence not has arguments and the string is same', function(){
          current.set(expressionWithoutArguments);
          current.parse('Hello world');
          current.isMatching().should.be.true;
        });

        it('when all arguments are present', function(){
          current.parse('Move alma to path');
          current.isMatching().should.be.true;
          current.argumentValues.length.should.be.equal(2);
          current.argumentValues[0].should.be.equal('alma');
          current.argumentValues[1].should.be.equal('path');

          current.set(expression2);
          current.parse('Move <alma> folder to <path>');
          current.isMatching().should.be.true;
          current.argumentValues.length.should.be.equal(2);
          current.argumentValues[0].should.be.equal('<alma>');
          current.argumentValues[1].should.be.equal('<path>');
        });

        it('when last argument is missing', function(){
          current.parse('Move alma to');
          current.isMatching().should.be.true;
          current.argumentValues.length.should.be.equal(2);
          current.argumentValues[0].should.be.equal('alma');
          current.argumentValues[1].should.be.equal('');

          current.set(expression2);
          current.parse('Move alma folder to');
          current.isMatching().should.be.true;
          current.argumentValues.length.should.be.equal(2);
          current.argumentValues[0].should.be.equal('alma');
          current.argumentValues[1].should.be.equal('');
        });

        it('when argument is missing from middle', function(){
          current.parse('Move to path');
          current.isMatching().should.be.true;
          current.argumentValues.length.should.be.equal(2);
          current.argumentValues[0].should.be.equal('');
          current.argumentValues[1].should.be.equal('path');

          current.set(expression2);
          current.parse('Move folder to path');
          current.isMatching().should.be.true;
          current.argumentValues.length.should.be.equal(2);
          current.argumentValues[0].should.be.equal('');
          current.argumentValues[1].should.be.equal('path');
        });

        it('when all arguments are missing', function(){
          current.parse('Move to');
          current.isMatching().should.be.true;
          current.argumentValues.length.should.be.equal(2);
          current.argumentValues[0].should.be.equal('');
          current.argumentValues[1].should.be.equal('');

          current.set(expression2);
          current.parse('Move folder to');
          current.isMatching().should.be.true;
          current.argumentValues.length.should.be.equal(2);
          current.argumentValues[0].should.be.equal('');
          current.argumentValues[1].should.be.equal('');
        });

        it('when the arguments has more space', function(){
          current.parse('Move alma     to    path');
          current.isMatching().should.be.true;
          current.argumentValues.length.should.be.equal(2);
          current.argumentValues[0].should.be.equal('alma    ');
          current.argumentValues[1].should.be.equal('   path');
        });
      });

      describe('should return false', function(){
        it('when not has selected sentence', function(){
          current.clear();
          current.parse('alma');
          current.isMatching().should.be.false;
        });

        it('when the sentence not has arguments and the string is not same', function(){
          current.set(expressionWithoutArguments);
          current.parse('Hello ');
          current.isMatching().should.be.false;
        });

        it('when the string has more token then the sentnce', function(){
          current.parse('Mov alma to path korte');
          current.isMatching().should.be.false;
        });

        it('when all argument is present but the middle literal does not match', function(){
          current.parse('Mov alma to path');
          current.isMatching().should.be.false;
        });

        it('when all argument is present but the last literal does not match', function(){
          current.parse('Move alma t path');
          current.isMatching().should.be.false;
        });

        it('when all argument is present but the first literal is missing', function(){
          current.parse('alma to path');
          current.isMatching().should.be.false;
        });

        it('when all argument is present but the last literal is missing', function(){
          current.parse('Move alma path');
          current.isMatching().should.be.false;
        });

        it('when the last literal and argument is missing', function(){
          current.parse('Move alma');
          current.isMatching().should.be.false;
          current.parse('Move ');
          current.isMatching().should.be.false;
        });

        it('when the text has more space', function(){
          current.set(expression2);
          current.parse('Move alma folder   to path');
          current.isMatching().should.be.false;
        });
      });
    });
  });

  describe('#__buildArguments()', function(){
    beforeEach(function(){
      current.set(expression);
    });

    it('should set when all arguments is present', function(){
      current.parse('Move alma to <path>');
      current.arguments[0].value.should.be.eql('alma');
      current.arguments[0].name.should.be.eql('name');
      current.arguments[0].selection[0].should.be.eql(5);
      current.arguments[0].selection[1].should.be.eql(9);
      current.arguments[1].value.should.be.eql('<path>');
      current.arguments[1].name.should.be.eql('path');
      current.arguments[1].selection[0].should.be.eql(13);
      current.arguments[1].selection[1].should.be.eql(19);
    });

    it('should set correct values when the sentence has same literal and argument value', function(){
      current.parse('Move to to path');
      current.arguments[0].value.should.be.eql('to');
      current.arguments[0].selection[0].should.be.eql(5);
      current.arguments[0].selection[1].should.be.eql(7);
      current.arguments[1].value.should.be.eql('path');
      current.arguments[1].selection[0].should.be.eql(11);
      current.arguments[1].selection[1].should.be.eql(15);

      expression = env.create(Consoloid.Interpreter.Expression, { sentence: sentence, pattern: 'Move to <name> a <path>' });
      current.set(expression);
      current.parse('Move to to a path');
      current.arguments[0].value.should.be.eql('to');
      current.arguments[0].selection[0].should.be.eql(8);
      current.arguments[0].selection[1].should.be.eql(10);
      current.arguments[1].value.should.be.eql('path');
      current.arguments[1].selection[0].should.be.eql(13);
      current.arguments[1].selection[1].should.be.eql(17);
    });

    it('should set correct values when missing an argument value', function(){
      current.parse('Move  to path');
      current.arguments[0].value.should.be.eql('');
      current.arguments[0].selection[0].should.be.eql(5);
      current.arguments[0].selection[1].should.be.eql(5);
      current.arguments[1].value.should.be.eql('path');
      current.arguments[1].selection[0].should.be.eql(9);
      current.arguments[1].selection[1].should.be.eql(13);

      current.parse('Move alma to ');
      current.arguments[0].value.should.be.eql('alma');
      current.arguments[0].selection[0].should.be.eql(5);
      current.arguments[0].selection[1].should.be.eql(9);
      current.arguments[1].value.should.be.eql('');
      current.arguments[1].selection[0].should.be.eql(13);
      current.arguments[1].selection[1].should.be.eql(13);
    });

    it('should set correct values when the arguments has more space', function(){
      current.parse('Move alma     to    path');
      current.arguments[0].value.should.be.eql('alma    ');
      current.arguments[0].selection[0].should.be.eql(5);
      current.arguments[0].selection[1].should.be.eql(13);
      current.arguments[1].value.should.be.eql('   path');
      current.arguments[1].selection[0].should.be.eql(17);
      current.arguments[1].selection[1].should.be.eql(24);
    });
  });

  describe('#getArgument(cursorPosition)', function(){
    beforeEach(function(){
      current.set(expression);
    });

    it('should return undefined when sentence not has argument', function(){
      current.set(expressionWithoutArguments);
      current.parse('Hello');
      (undefined === current.getArgument(0)).should.be.true;
      (undefined === current.getArgument(100)).should.be.true;
    });

    it('should return undefined when the parsed text is not matched', function(){
      current.parse('M alma to path');
      (undefined === current.getArgument(0)).should.be.true;
      (undefined === current.getArgument(10)).should.be.true;
      (undefined === current.getArgument(100)).should.be.true;
    });

    it('should return undefined when the cursor is not in an argument', function(){
      current.parse('Move alma to path');
      (undefined === current.getArgument(0)).should.be.true;
      (undefined === current.getArgument(10)).should.be.true;
      (undefined === current.getArgument(100)).should.be.true;
    });

    it('should return an argument string when the cursor is in an argument', function(){
      current.parse('Move alma to path');
      current.getArgument(5).name.should.be.equal('name');
      current.getArgument(5).value.should.be.equal('alma');
      current.getArgument(7).value.should.be.equal('alma');
      current.getArgument(9).value.should.be.equal('alma');
      current.getArgument(14).name.should.be.equal('path');
      current.getArgument(14).value.should.be.equal('path');
      current.getArgument(17).value.should.be.equal('path');
    });

    it('should return correct values when the sentcene has same argument and literal', function(){
      current.parse('Move to to path');
      current.getArgument(5).value.should.be.equal('to');
      (undefined === current.getArgument(9)).should.be.true;

      expression = env.create(Consoloid.Interpreter.Expression, { sentence: sentence, pattern: 'Move to <name> a <path>' });
      current.set(expression);
      current.parse('Move to to a path');
      (undefined === current.getArgument(5)).should.be.true;
      current.getArgument(9).value.should.be.equal('to');
    });

    it('should return an empty string when an argument value is empty', function(){
      current.parse('Move  to path');
      current.getArgument(5).value.should.be.equal('');
      current.getArgument(10).value.should.be.equal('path');

      current.parse('Move alma to ');
      current.getArgument(5).value.should.be.equal('alma');
      current.getArgument(13).value.should.be.equal('');
    });
  });

  describe('#getNextArgumentSelection(cursorPosition)', function(){
    beforeEach(function(){
      current.set(expression);
      current.parse('Move alma to path');
    });

    it('should return [0,0] when the sentence not has argument', function(){
      current.set(expressionWithoutArguments);
      current.parse('Hello');
      current.getNextArgumentSelection(0).should.be.eql([0,0]);
      current.getNextArgumentSelection(100).should.be.eql([0,0]);
    });

    it('should return the next argument char positions', function(){
      current.getNextArgumentSelection(0)[0].should.be.eql(5);
      current.getNextArgumentSelection(4)[1].should.be.eql(9);

      current.getNextArgumentSelection(5)[0].should.be.eql(13);
      current.getNextArgumentSelection(12)[1].should.be.eql(17);
    });

    it('should return the first argument char positions after the last argument', function(){
      current.getNextArgumentSelection(13)[0].should.be.eql(5);
      current.getNextArgumentSelection(15)[1].should.be.eql(9);
    });
  });

  describe('#getPrevArgumentSelection(cursorPosition)', function(){
    beforeEach(function(){
      current.set(expression);
      current.parse('Move alma to path');
    });

    it('should return [0,0] when the sentence not has argument', function(){
      current.set(expressionWithoutArguments);
      current.parse('Hello');
      current.getPrevArgumentSelection(0).should.be.eql([0,0]);
      current.getPrevArgumentSelection(100).should.be.eql([0,0]);
    });

    it('should return the prev argument char positions', function(){
      current.getPrevArgumentSelection(10)[0].should.be.eql(5);
      current.getPrevArgumentSelection(17)[1].should.be.eql(9);
    });

    it('should return the last argument char positions after the first argument', function(){
      current.getPrevArgumentSelection(0)[0].should.be.eql(13);
      current.getPrevArgumentSelection(9)[1].should.be.eql(17);
    });
  });
});