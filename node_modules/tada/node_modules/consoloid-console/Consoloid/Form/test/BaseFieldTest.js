require('consoloid-framework/Consoloid/Test/UnitTest');
require("consoloid-framework/Consoloid/Widget/JQoteTemplate");
require('consoloid-framework/Consoloid/Widget/jquery.jqote2.min.js');
require("consoloid-framework/Consoloid/Widget/Widget");
require("../BaseField");

describeUnitTest('Consoloid.Form.BaseField', function() {
  var
    field,
    validateSpy;

  beforeEach(function() {
    field = env.create(Consoloid.Form.BaseField, { name: 'foo', prefix: 'bar' });
    validateSpy = sinon.spy();
  });

  describe("#__constructor()", function() {
    it('should require name property', function() {
      (function () {
        env.create(Consoloid.Form.BaseField, { prefix: 'bar' });
      }).should.throwError(/name must be injected/);
    });

    it('should require prefix property', function() {
      (function () {
        env.create(Consoloid.Form.BaseField, { name: 'bar' });
      }).should.throwError(/prefix must be injected/);
    });

    it('should set field to be enabled by default', function() {
      field.enabled.should.be.equal(true);
    });
  });

  describe("#disable()", function() {
    it('should disable field', function() {
      field.disable();
      field.enabled.should.be.equal(false);
    });
  });

  describe("#enable()", function() {
    it('should enable field', function() {
      field.disable();
      field.enable();
      field.enabled.should.be.equal(true);
    });
  });

  describe("#getId()", function() {
    it('should return with "prefix-name"', function() {
      field.getId().should.be.equal('bar-foo');
    });
  });

  describe("#validate()", function() {
    var
      validator1,
      validator2;

    beforeEach(function() {
      validator1 = { validateField: sinon.stub().returns(true) };
      validator2 = { validateField: sinon.stub().returns(false) };
    })

    it('should call all validators added to field', function() {
      field.addValidator(validator1);
      field.addValidator(validator2);

      field.validate();

      validator1.validateField.calledOnce.should.be.ok;
      validator2.validateField.calledOnce.should.be.ok;
    });

    it('should return false when one of the validators returns false', function() {
      field.addValidator(validator1);
      field.addValidator(validator2);

      field.validate().should.be.equal(false);
    });

    it('should clear all errors before calling validators', function() {
      sinon.spy(field, 'clearError');

      field.addValidator(validator1);
      field.addValidator(validator2);

      field.validate();

      field.clearError.calledOnce.should.be.ok;
    });
  });

  describe("#renderErrorMessage()", function() {
    it('should render error message to the span within the div with the error class within the node', function() {
      field.node = $("<div><div class='error'></div></div>");
      field.setErrorMessage("This field is foobared.");

      field.renderErrorMessage();

      field.node.find('.error span').html().should.equal('This field is foobared.');
    });

    it('should remove error message span if there is no error', function() {
      field.node = $("<div><div class='error'><span>This field is still foobared.</span></div></div>");
      field.setErrorMessage(null);

      field.renderErrorMessage();

      field.node.find('.error').html().should.equal('');
    });
  });

  describe("#getName()", function() {
    it("should return with the name of the field", function() {
      field.getName().should.equal("foo");
    });
  });

  afterEach(function() {
    env.shutdown();
  });
});
