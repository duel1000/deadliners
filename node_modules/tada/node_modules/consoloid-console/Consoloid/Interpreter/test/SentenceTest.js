require("../Token");
require("../Tokenizable");
require("../Letter");
require("../LetterTree");
require("../Expression");
require("../Argument");
require("../ArgumentTree");

require("../Sentence");
require("../../Test/ConsoleUnitTest");
describeConsoleUnitTest('Consoloid.Interpreter.Sentence', function() {
  describe('constructor', function() {
    it('should fail if patterns or service option is not given', function() {
      (function() { env.create(Consoloid.Interpreter.Sentence, { service: true }); }).should.throw();
      (function() { env.create(Consoloid.Interpreter.Sentence, { patterns: [] }); }).should.throw();
      (function() { env.create(Consoloid.Interpreter.Sentence, { patterns: [], service: true }); }).should.not.throw();
    });

    it("should work with string and plain object patterns", function() {
      var create = sinon.stub().withArgs('Consoloid.Interpreter.ArgumentTree').returns({
        addEntity: sinon.stub()
      });

      var sentence = env.create(Consoloid.Interpreter.Sentence, {
        create: create,
        patterns: [
          'show events',
          { pattern: "show events for last year", fixedArguments: { date: "2012" } }
        ],
        arguments: {
          date: {
            type: 'string',
            pattern: 'date <value>',
            required: false
          }
        },
        service: 'srv'
      });

      create.callCount.should.equal(4);
      create.args[2][0].should.equal('Consoloid.Interpreter.Expression');
      create.args[2][1].pattern.should.equal('show events');
      create.args[3][0].should.equal('Consoloid.Interpreter.Expression');
      create.args[3][1].pattern.should.equal('show events for last year');
      create.args[3][1].fixedArguments.date.value.should.equal('2012');
    });
  });

  describe('#autocompleteArguments(args)', function() {
    var sentence;
    beforeEach(function() {
      sentence = env.create(Consoloid.Interpreter.Sentence, {
        patterns: [ 'foo bar' ],
        service: 'srv',
        method: 'start',
        arguments: {
          name: {
            type: 'string',
            pattern: 'with name <value>',
            required: false
          },
          no_nana: {
            type: 'string',
            pattern: 'without nana <value>',
            required: false
          },
        }
      });
    });

    it('should autocomplete partial argument name', function() {
      var result = sentence.autocompleteArguments(['wi']);
      result.should.have.lengthOf(2);
      result[0].should.have.property('name', null);
      result[1].should.have.property('no_nana', null);
    });

    it('should autocomplete empty text', function() {
      var result = sentence.autocompleteArguments(['']);
      result.should.have.lengthOf(2);
      result[0].should.have.property('name', null);
      result[1].should.have.property('no_nana', null);

      var result = sentence.autocompleteArguments(['with name great', '']);
      result.should.have.lengthOf(1);
      result[0].should.have.property('name', 'great');
      result[0].should.have.property('no_nana', null);
    });

    it('should provide all possible argument interpretation for text', function() {
      var result = sentence.autocompleteArguments(['wi na value1', 'wi na value2']);
      result.should.have.lengthOf(2);
      result[0].should.have.property('name', 'value1');
      result[0].should.have.property('no_nana', 'value2');
      result[1].should.have.property('name', 'value2');
      result[1].should.have.property('no_nana', 'value1');
    });
  });

  describe('#getExpressions()', function()  {
    it('should return each configured expression in an array', function() {
      var sentence = env.create(Consoloid.Interpreter.Sentence, {
        patterns: [
          'show events for date <date>',
          'show events of <date>',
          'show events',
        ],
        service: 'srv',
        method: 'start',
        arguments: {
          date: {
            type: 'string',
            pattern: 'date <value>',
            required: false
          }
        }
      });

      sentence.getExpressions().should.have.lengthOf(3);
      sentence.getExpressions()[0].getText().should.be.equal('show events for date <date>');
    });
  });
});
