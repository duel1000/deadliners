require('consoloid-framework/Consoloid/Test/UnitTest');
require("../BaseValidator");

describeUnitTest('Consoloid.Form.Validator.BaseValidator', function() {
  var
    field,
    form;

  beforeEach(function() {
    field = { addValidator: sinon.stub() };
    form = {
      getField: sinon.stub()
                  .returns(field)
    };
    env.addServiceMock('form', form);
  });

  describe("#__constructor()", function() {
    it('should set the fields to check from options', function() {
      var validator = env.create('Consoloid.Form.Validator.BaseValidator', { fieldNames: ['fieldset1/test-field'] });

      form.getField.calledWith('fieldset1/test-field').should.be.ok;
      validator.fields.length.should.equal(1);
      validator.fields[0].should.equal(field);
    });

    it('should add self as validator for configured fields', function() {
      var validator = env.create('Consoloid.Form.Validator.BaseValidator', { fieldNames: ['fieldset1/test-field'] });

      field.addValidator.calledOnce.should.be.ok;
      field.addValidator.calledWith(validator).should.be.ok;
    });
  });

  describe("#validate()", function() {
    it('should check all configured field one by one', function() {
      var validator = env.create('Consoloid.Form.Validator.BaseValidator', { fieldNames: ['f1', 'f2'] });

      sinon.stub(validator, 'validateField');

      validator.validate();

      validator.validateField.calledTwice.should.be.ok;
      validator.validateField.alwaysCalledWith(field).should.be.ok;
    });
  });

  afterEach(function() {
    env.shutdown();
  });
});
