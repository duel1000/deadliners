require("../Tokenizable");
require('../Sentence');
require("../Token");
require("../Letter");
require("../LetterTree");
require("../Argument");
require("../ArgumentTree");

require("../Expression");
require("../../Test/ConsoleUnitTest");
describeConsoleUnitTest('Consoloid.Interpreter.Expression', function() {
  var
    sentence,
    expression;

  beforeEach(function(){
    sentence = env.create(Consoloid.Interpreter.Sentence, { patterns: [], service: 'srv', method: 'start' });
    expression = env.create(Consoloid.Interpreter.Expression, { sentence: sentence, pattern: 'say hello world' });
  });

  describe('constructor()', function() {
    it('should require sentence object and pattern in options', function() {
      (function() { env.create(Consoloid.Interpreter.Expression, { pattern: 'say hello world' }); }).should.throwError(/sentence/);
      (function() { env.create(Consoloid.Interpreter.Expression, { sentence: sentence }); }).should.throwError(/pattern/);
      (function() { env.create(Consoloid.Interpreter.Expression, { sentence: sentence, pattern: 'foo bar' }); }).should.not.throwError();
    });

    it('should fail when pattern refers to an unknown argument', function() {
      sentence = env.create(Consoloid.Interpreter.Sentence, {
        patterns: [],
        arguments: {
          path: {
            type: String,
            pattern: "path <value>"
          }
        },
        service: 'dummy'
      });


      (function() {
        env.create(Consoloid.Interpreter.Expression, { pattern: 'foo bar <path>', sentence: sentence })
      }).should.not.throwError();

      (function() {
        env.create(Consoloid.Interpreter.Expression, { pattern: 'foo bar <foo>', sentence: sentence })
      }).should.throwError();
    });
  });

  describe('#getTextWithArguments(values)', function() {
    it('should display one-word arguments without quote marks', function() {
      sentence = env.create(Consoloid.Interpreter.Sentence, {
        patterns: [],
        service: 'srv',
        arguments: {
          something: {
            type: String,
            pattern: 'say <value>'
          }
        }
      });
      expression = env.create(Consoloid.Interpreter.Expression, { sentence: sentence, pattern: 'say <something>' });
      expression.getTextWithArguments({ something:{ value: 'hello', exactMatch: true }})
        .should.be.eql('say hello');
    });

    it('should display more-word arguments with quote marks', function() {
      sentence = env.create(Consoloid.Interpreter.Sentence, {
        patterns: [],
        service: 'srv',
        arguments: {
          something: {
            type: String,
            pattern: 'say <value>'
          }
        }
      });
      expression = env.create(Consoloid.Interpreter.Expression, { sentence: sentence, pattern: 'say <something>' });
      expression.getTextWithArguments({ something:{ value: 'hello world', exactMatch: true }})
        .should.be.eql('say "hello world"');
    });

    it("should not show fixed arguments", function() {
      sentence = env.create(Consoloid.Interpreter.Sentence, {
        patterns: [],
        service: 'srv',
        arguments: {
          something: {
            type: String,
            pattern: 'say <value>'
          }
        }
      });
      expression = env.create(Consoloid.Interpreter.Expression, {
        sentence: sentence,
        pattern: 'say hello', fixedArguments: {
          something: {
            value: "hello"
          }
        }
      });
      expression.getTextWithArguments({ something:{ value: 'hello', exactMatch: true }})
        .should.be.eql('say hello');
    })
  });

  describe('#getAutocompleteScore(words, args)', function() {
    it('should return exact-match score for exact match', function() {
      expression.getAutocompleteScore(['say', 'hello', 'world'], {}).should.equal(Consoloid.Interpreter.Expression.EXACT_MATCH);
      expression.getAutocompleteScore(['sa', 'hel', 'wo'], {}).should.equal(Consoloid.Interpreter.Expression.EXACT_MATCH);
      expression.getAutocompleteScore(['say', 'hello'], {}).should.not.equal(Consoloid.Interpreter.Expression.EXACT_MATCH);
      expression.getAutocompleteScore(['hello', 'world'], {}).should.not.equal(Consoloid.Interpreter.Expression.EXACT_MATCH);
      expression.getAutocompleteScore(['hello', 'world', 'say'], {}).should.not.equal(Consoloid.Interpreter.Expression.EXACT_MATCH);
      expression.getAutocompleteScore(['hello'], {}).should.not.equal(Consoloid.Interpreter.Expression.EXACT_MATCH);
    });

    it('should return exact-match score for exact match with arguments', function() {
      sentence.arguments = {
        something: {
          type: String,
          pattern: 'say <value>'
        }
      }
      expression = env.create(Consoloid.Interpreter.Expression, { sentence: sentence, pattern: 'say <something> world' });

      expression.getAutocompleteScore(['say', 'hello', 'world'], {}).should.equal(Consoloid.Interpreter.Expression.EXACT_MATCH);
      expression.getAutocompleteScore(['sa', 'hel', 'wo'], {}).should.equal(Consoloid.Interpreter.Expression.EXACT_MATCH);
      expression.getAutocompleteScore(['say', 'hello'], {}).should.not.equal(Consoloid.Interpreter.Expression.EXACT_MATCH);
      expression.getAutocompleteScore(['hello', 'world'], {}).should.not.equal(Consoloid.Interpreter.Expression.EXACT_MATCH);
      expression.getAutocompleteScore(['hello', 'world', 'say'], {}).should.not.equal(Consoloid.Interpreter.Expression.EXACT_MATCH);
      expression.getAutocompleteScore(['hello'], {}).should.not.equal(Consoloid.Interpreter.Expression.EXACT_MATCH);
    });

    it('should return exact-match score case insensitively', function() {
      expression.getAutocompleteScore(['Say', 'Hello', 'world'], {}).should.equal(Consoloid.Interpreter.Expression.EXACT_MATCH);
    });

    it('should return partial-match score for partial match', function() {
      expression.getAutocompleteScore(['hello', 'world'], {}).should.equal(Consoloid.Interpreter.Expression.PARTIAL_MATCH);
      expression.getAutocompleteScore(['hello'], {}).should.equal(Consoloid.Interpreter.Expression.PARTIAL_MATCH);
      expression.getAutocompleteScore(['hel'], {}).should.equal(Consoloid.Interpreter.Expression.PARTIAL_MATCH);
      expression.getAutocompleteScore(['hezz'], {}).should.not.equal(Consoloid.Interpreter.Expression.PARTIAL_MATCH);
      expression.getAutocompleteScore(['hello', 'somebody'], {}).should.not.equal(Consoloid.Interpreter.Expression.PARTIAL_MATCH);
    });

    it('should return nonmatching word score for a match with a nonmatching word', function() {
      expression.getAutocompleteScore(['hezz', 'world'], {}).should.equal(Consoloid.Interpreter.Expression.CONTAINS_NONMATCHING_WORDS);
      expression.getAutocompleteScore(['hezz', 'work'], {}).should.not.equal(Consoloid.Interpreter.Expression.CONTAINS_NONMATCHING_WORDS);
    });

    it('should return no match score on no match', function() {
      expression.getAutocompleteScore(['hezz', 'work'], {}).should.equal(Consoloid.Interpreter.Expression.NO_MATCH);
    });

    it('should return match score considering arguments', function(){
      sentence.arguments = {
        something: {
          type: String,
          pattern: 'say <value>'
        },
        something2: {
          type: String,
          pattern: 'say <value>'
        }
      }
      expression = env.create(Consoloid.Interpreter.Expression, { sentence: sentence, pattern: 'hello <something> world' });

      expression.getAutocompleteScore(['he', 'hel', 'wo'], {something: { exactMatch: true}}).should.equal(
        Consoloid.Interpreter.Expression.EXACT_MATCH + Consoloid.Interpreter.Expression.EXACT_ARGUMENT_MATCH);

      expression.getAutocompleteScore(['he', 'world'], {something: { exactMatch: false}}).should.equal(
        Consoloid.Interpreter.Expression.PARTIAL_MATCH + Consoloid.Interpreter.Expression.PARTIAL_ARGUMENT_MATCH);

      expression.getAutocompleteScore(['he', 'hel', 'wo'], {something: { erroneous: true}}).should.equal(
          Consoloid.Interpreter.Expression.EXACT_MATCH + Consoloid.Interpreter.Expression.NO_ARGUMENT_MATCH);

      expression = env.create(Consoloid.Interpreter.Expression, { sentence: sentence, pattern: 'say <something> world <something2>' });

      expression.getAutocompleteScore(['hezz', 'he', 'world'], {something: { exactMatch: true}, something2: { exactMatch: false}})
        .should.equal(Consoloid.Interpreter.Expression.CONTAINS_NONMATCHING_WORDS +
          Consoloid.Interpreter.Expression.EXACT_ARGUMENT_MATCH +
          Consoloid.Interpreter.Expression.PARTIAL_ARGUMENT_MATCH);

      expression.getAutocompleteScore(['hezz', 'he', 'work'], {something: { exactMatch: false}, something2: { exactMatch: false}})
        .should.equal(Consoloid.Interpreter.Expression.NO_MATCH +
          Consoloid.Interpreter.Expression.PARTIAL_ARGUMENT_MATCH +
          Consoloid.Interpreter.Expression.PARTIAL_ARGUMENT_MATCH);
    });
  });

  describe('#areArgumentsValid(args)', function() {
    beforeEach(function() {
      sentence = env.create(Consoloid.Interpreter.Sentence, {
        patterns: [],
        service: 'srv',
        arguments: {
          required1: {
            type: String,
            pattern: 'foo <value>',
            required: true
          },
          required2: {
            type: String,
            pattern: 'bar <value>',
            required: true
          },
        }
      });
      expression = env.create(Consoloid.Interpreter.Expression, { sentence: sentence, pattern: 'test' });
    });

    it('should return true when all required arguments are present', function() {
      expression.areArgumentsValid({
        required1: { value: 'foo', exactMatch: true },
        required2: { value: 'bar', exactMatch: true }
      })
        .should.be.ok;
    });

    it("should return true even if a required argument is in the fixed arguments", function() {
      expression.fixedArguments = { required2: { value: 'bar' } };
      expression.areArgumentsValid({
        required1: { value: 'foo', exactMatch: true }
      })
        .should.be.ok;
    });

    it('should return false when a required arguments is not present', function() {
      expression.areArgumentsValid({
        required1: { value: 'foo', exactMatch: true },
      })
        .should.not.be.ok;

      expression.areArgumentsValid({
        required2: { value: 'bar', exactMatch: true }
      })
        .should.not.be.ok;
    });

    it('should return false if a required argument is present but erroneous', function() {
      expression.areArgumentsValid({
        required1: { value: 'foo', erroneous: true },
        required2: { value: 'bar', exactMatch: true }
      })
        .should.not.be.ok;

      expression.areArgumentsValid({
        required1: { value: 'foo', exactMatch: true },
        required2: { value: 'bar', erroneous: true }
      })
        .should.not.be.ok;
    });
  });

  describe("#doIt(args)", function() {
    var service;
    beforeEach(function() {
      service = {
        start: sinon.stub()
      };
      env.addServiceMock('srv', service);
    });

    it("should call method on service with arguments", function() {
      expression.doIt({ foo: "bar" });

      service.start.calledOnce.should.be.ok;
      service.start.args[0][0].foo.should.equal("bar");
    });

    it("should extend arguments with fixed arguments", function() {
      expression.fixedArguments = { foo: "bar" };
      expression.doIt();

      service.start.calledOnce.should.be.ok;
      service.start.args[0][0].foo.should.equal("bar");
    });
  });
});
