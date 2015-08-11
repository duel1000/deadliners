require('consoloid-framework/Consoloid/Test/UnitTest');
require("../../Form/Validator/BaseValidator");
require("../SentenceAutocompleteValidator");

describeUnitTest('Consoloid.Ui.SentenceAutocompleteValidator', function() {
  var
    validator,
    fooField,
    barField,
    form,
    advisor,
    expression;

  beforeEach(function() {
    global.__ = function(string) { return string; }

    fooField = {
      getValue: sinon.stub().returns("fooValue"),
      setErrorMessage: sinon.stub(),
      addValidator: sinon.stub(),
      getName: sinon.stub().returns("fancyArgumentName"),
      parseUserInput: sinon.stub(),
      clearError: sinon.stub(),
      renderErrorMessage: sinon.stub()
    };

    barField = {
      getValue: sinon.stub().returns("barValue"),
      setErrorMessage: sinon.stub(),
      addValidator: sinon.stub(),
      getName: sinon.stub().returns("okayArgumentName"),
      parseUserInput: sinon.stub(),
      clearError: sinon.stub(),
      renderErrorMessage: sinon.stub()
    }

    form = {
      getField: sinon.stub(),
      getValue: sinon.stub().returns({
        fancyArgumentName: fooField.getValue(),
        okayArgumentName: barField.getValue()
      })
    };

    form.getField.withArgs("fancyArgumentName").returns(fooField);
    form.getField.withArgs("okayArgumentName").returns(barField);

    advisor = {
      matchArgumentsToExpression: sinon.stub().returns([{
        arguments: {
          fancyArgumentName: {
            erroneous: true,
            message: "This object you seek could not be summoned from the mighty context."
          },
          okayArgumentName: {}
        }
      }])
    };

    expression = {
      getTextWithArguments: sinon.stub().returns("foo bar sentence text")
    };

    env.addServiceMock('form', form);
    env.addServiceMock('autocomplete_advisor', advisor);

    validator = env.create(Consoloid.Ui.SentenceAutocompleteValidator, {
      fieldNames: [ 'fancyArgumentName', 'okayArgumentName' ],
      expression: expression
    });
  });

  describe("#__constructor(options)", function() {
    it('should require expression property', function() {
      (function () {
        env.create(Consoloid.Ui.SentenceAutocompleteValidator, { fieldNames: [ 'fancyArgumentName' ] });
      }).should.throwError(/expression must be injected/);
    });
  });

  describe("#validate()", function() {
    it("should call the the advisor with the expression", function() {
      validator.validate();

      expression.getTextWithArguments.calledOnce.should.be.ok;
      expression.getTextWithArguments.calledWith({ fancyArgumentName: { value: "fooValue" }, okayArgumentName: { value: "barValue" } }).should.be.ok;

      advisor.matchArgumentsToExpression.calledOnce.should.be.ok;
      advisor.matchArgumentsToExpression.calledWith("foo bar sentence text").should.be.ok;
    });

    it('should return true if the argument in the first result from dialog launcher is not erroneous', function() {
      advisor.matchArgumentsToExpression()[0].arguments.fancyArgumentName = {};
      validator.validate().should.be.ok;
    });

    it('should return false if the argument in the first result from dialog launcher is erroneous', function() {
      validator.validate().should.not.be.ok;
    });

    it("should set an error message on field if the argument in the first result from dialog launcher is erroneous", function() {
      validator.validate();
      fooField.setErrorMessage.calledWith('This object you seek could not be summoned from the mighty context.').should.be.ok;
    });

    it("should set an error message on every field if advisor did not return with any options", function() {
      advisor.matchArgumentsToExpression.returns([]);
      validator.validate().should.not.be.ok;
      fooField.setErrorMessage.calledOnce.should.be.ok;
      barField.setErrorMessage.calledOnce.should.be.ok;
    });
  });

  describe("#validateField()", function() {
    it("should put error message on every field if advisor did not return with any options", function() {
      advisor.matchArgumentsToExpression.returns([]);
      validator.validateField(fooField).should.not.be.ok;

      fooField.setErrorMessage.calledOnce.should.be.ok;
      barField.setErrorMessage.calledOnce.should.be.ok;
      fooField.renderErrorMessage.calledOnce.should.be.ok;
      barField.renderErrorMessage.calledOnce.should.be.ok;
    });

    it("should clear error message on every non erroneous field if advisor did return with an option", function() {
      validator.validateField(fooField).should.not.be.ok;

      fooField.setErrorMessage.calledOnce.should.be.ok;
      barField.clearError.calledOnce.should.be.ok;
      barField.setErrorMessage.called.should.not.be.ok;
      barField.renderErrorMessage.calledOnce.should.be.ok;
    });

  });

  afterEach(function() {
    delete global.__;
  });
});
