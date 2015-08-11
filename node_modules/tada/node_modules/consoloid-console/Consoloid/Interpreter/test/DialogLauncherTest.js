require("../DialogLauncher");
require("../../Test/ConsoleUnitTest");
describeConsoleUnitTest('Consoloid.Interpreter.DialogLauncher', function() {
  var
    dialogLauncher,
    advisor;

  beforeEach(function() {
    env.addServiceMock('translator', { trans: function(item) { return item; } });

    var dummyExpression = { doIt: function() { return false; } };
    var dummySentence = { getExpressions: function() { return [ dummyExpression ]; } };
    env.container.addSharedObject('default_fallback_sentence', dummySentence)
    env.container.addSharedObject('default_ambiguousity_avoider_sentence', dummySentence)
    env.container.addSharedObject('default_argument_fixer_sentence', dummySentence)

    advisor = {
      autocomplete: sinon.stub().returns([{ value: "hello world", arguments: {} }])
    };
    env.addServiceMock('autocomplete_advisor', advisor);

    dialogLauncher = env.create(Consoloid.Interpreter.DialogLauncher, {});
    sinon.spy(dialogLauncher, '__getAllAutocompleteOptions');
    sinon.spy(dialogLauncher, 'get');
  });

  describe('#autocompleteExpression(text)', function(){
    it('should autocomplete sentence options', function() {
      var options = dialogLauncher.autocompleteExpression('hel wor');
      advisor.autocomplete.calledOnce.should.be.ok;
      options.length.should.be.eql(1);
      options[0].value.should.be.eql('hello world');
    });

    it('should not return the with erroneous arguments', function() {
      advisor.autocomplete.returns([{
        arguments: {
          something: {
            erroneous: true
          }
        }
      }, {
        arguments: {
          something: {
          }
        }
      }]);

      var options = dialogLauncher.autocompleteExpression('foo bar');
      options.length.should.equal(1);
    });
  });

  describe('#startFromText(text)', function() {
    beforeEach(function(){
      sinon.stub(dialogLauncher, '__startDialog', function(){});
    });

    it('should do nothing when not has text', function() {
      dialogLauncher.startFromText();
      dialogLauncher.__getAllAutocompleteOptions.called.should.be.false;

      dialogLauncher.startFromText('');
      dialogLauncher.__getAllAutocompleteOptions.called.should.be.false;
    });

    it('should return false on tokenizer syntax error', function() {
      advisor.autocomplete.throws();
      dialogLauncher.startFromText(' ').should.be.false;
    });

    it('should start dialog using current sentence on enter', function() {
      dialogLauncher.startFromText('hel wor');

      dialogLauncher.__getAllAutocompleteOptions.calledWith('hel wor').should.be.true;
      dialogLauncher.get.called.should.be.false;
      var startDialogArgument = dialogLauncher.__startDialog.args[0][0];
      startDialogArgument.value.should.be.eql('hello world');
    });

    it('enter should start fallback dialog when advisor did not return with options', function() {
      advisor.autocomplete.returns([]);
      dialogLauncher.startFromText('no such sentence');

      dialogLauncher.__getAllAutocompleteOptions.calledWith('no such sentence').should.be.true;
      dialogLauncher.get.calledWith('default_fallback_sentence').should.be.true;
      var startDialogArgument = dialogLauncher.__startDialog.args[0][0];
      startDialogArgument.value.should.be.eql('no such sentence');
    });

    it('should start exact-match sentence on multiple matches', function() {
      advisor.autocomplete.returns([{ value: "hello world", score: 3, arguments: {} }, { value: "hello something else", score: 1, arguments: {} }]);

      dialogLauncher.startFromText('hel wor');

      dialogLauncher.__getAllAutocompleteOptions.calledWith('hel wor').should.be.true;
      dialogLauncher.get.called.should.be.false;
      var startDialogArgument = dialogLauncher.__startDialog.args[0][0];
      startDialogArgument.value.should.be.eql('hello world');
    });

    it('should not start first sentence on multiple exact-match sentences', function() {
      advisor.autocomplete.returns([{ value: "hello world", score: 3, arguments: {} }, { value: "hello work", score: 3, arguments: {} }]);

      dialogLauncher.startFromText('hel wor');

      dialogLauncher.__getAllAutocompleteOptions.calledWith('hel wor').should.be.true;
      dialogLauncher.get.calledWith('default_ambiguousity_avoider_sentence').should.be.true;
      var startDialogArgument = dialogLauncher.__startDialog.args[0][0];
      startDialogArgument.value.should.be.eql('hel wor');
    });

  });

  describe('#__startDialog(options)', function(){
    it('should emit an Consoloid.Interpreter.DialogLauncher.FailedToStartDialog event when starting a dialog fails', function() {
      var spy = sinon.spy();
      $(document).bind('Consoloid.Interpreter.DialogLauncher.FailedToStartDialog', spy);

      (function(){
        dialogLauncher.__startDialog({
          expression: {
            doIt: function(){
              throw new Error('test')
            },
            areArgumentsValid: sinon.stub().returns(true)
          }
        });
      }).should.throw();

      spy.calledOnce.should.be.true;
    });

    it('should start default_argument_fixer_sentence when a required argument is missing', function() {
      dialogLauncher.__startDialog({
        expression: {
          areArgumentsValid: sinon.stub().returns(false)
        }
      });

      dialogLauncher.get.calledWith('default_argument_fixer_sentence').should.be.true;
    });
  });
});