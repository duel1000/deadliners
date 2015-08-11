require('consoloid-framework/Consoloid/Test/UnitTest');
require("../BaseValidator");
require("../Number");

describeUnitTest('Consoloid.Form.Validator.Number', function() {
  var
    validator,
    field,
    form,
    translator;

  beforeEach(function() {
    field = {
      getValue: sinon.stub(),
      setErrorMessage: sinon.spy(),
      addValidator: sinon.spy()
    };

    form = {
      getField: function() {
        return field;
      }
    };

    translator = {
      trans: function(msg) { return msg; }
    };

    env.addServiceMock('form', form);
    env.addServiceMock('translator', translator);

    validator = env.create(Consoloid.Form.Validator.Number, {
      fieldNames: [ 'f1' ],
      min: -5,
      max: 5,
      step: 0.5
    });
  });

  describe("#__constructor()", function() {
    it('should set default values (null) for min/max/step', function() {
      validator = env.create(Consoloid.Form.Validator.Number, { });
      validator.should.not.have.ownProperty('min');
      validator.should.not.have.ownProperty('min');
      validator.should.not.have.ownProperty('max');
      validator.should.not.have.ownProperty('step');
    });

    it('should not allow larger min than max', function() {
      (function() {
        env.create(Consoloid.Form.Validator.Number, { min: 1, max: -1 });
      }).should.throwError(/invalid min-max pair/);
    });
  });

  describe("#validate()", function() {
    it('should validate against min value and set error message', function() {
      field.getValue.returns(5);
      validator.validate().should.equal(true);

      field.getValue.returns(-15);
      validator.validate().should.equal(false);
      field.setErrorMessage.calledWith('Values less than %min% is not allowed').should.be.ok;
    });

    it('should not validate min value when min is not given', function() {
      validator = env.create(Consoloid.Form.Validator.Number, { });

      field.getValue.returns(5);
      validator.validate().should.equal(true);
    });

    it('should validate against max value and set error message', function() {
      field.getValue.returns(-5);
      validator.validate().should.equal(true);

      field.getValue.returns(15);
      validator.validate().should.equal(false);
      field.setErrorMessage.calledWith('Values greater than %max% is not allowed').should.be.ok;
    });

    it('should validate against step value and set error message', function() {
      field.getValue.returns(2.5);
      validator.validate().should.equal(true);

      field.getValue.returns(2.3);
      validator.validate().should.equal(false);
      field.setErrorMessage.calledWith('Allowed stepping is %step%').should.be.ok;
    });

    it("should validate against non number value and set error message", function() {
      field.getValue.returns('test');
      validator.validate().should.equal(false);
      field.setErrorMessage.calledWith('Number required').should.be.ok;
    });

    it("should not allow empty value by default", function() {
      field.getValue.returns('');
      validator.validate().should.equal(false);
    });

    it("should allow empty value when allowEmpty is true", function() {
      field.getValue.returns('');

      validator = env.create(Consoloid.Form.Validator.Number, {
        fieldNames: [ 'f1' ],
        min: -5,
        allowEmpty: true
      });
      validator.validate().should.equal(true);
    });
  });

  afterEach(function() {
    env.shutdown();
  });
});
