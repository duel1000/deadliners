require('consoloid-framework/Consoloid/Test/UnitTest');
require("../BaseValidator");
require("../Email");

describeUnitTest('Consoloid.Form.Validator.Email', function() {
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

    validator = env.create(Consoloid.Form.Validator.Email, { fieldNames: [ 'f1' ] });
  });

  describe("#validate()", function() {
    it("should accept a valid email address", function() {
      field.getValue.returns('info@agmen.hu');
      validator.validate().should.equal(true);

      field.getValue.returns('in.fo@agmen.hu');
      validator.validate().should.equal(true);

      field.getValue.returns('in-fo@mail.agmen.hu');
      validator.validate().should.equal(true);

      field.getValue.returns('in_fo@mail.agmen.hu');
      validator.validate().should.equal(true);
    });

    it("should not accept an invalid email address", function() {
      field.getValue.returns('info [at] agmen.hu');
      validator.validate().should.equal(false);

      field.getValue.returns('agmen.hu');
      validator.validate().should.equal(false);

      field.getValue.returns('info');
      validator.validate().should.equal(false);

      field.getValue.returns('@');
      validator.validate().should.equal(false);

      field.getValue.returns('@agmen.hu');
      validator.validate().should.equal(false);

      field.getValue.returns('mailto:info@agmen.hu');
      validator.validate().should.equal(false);

      field.getValue.returns('info.hu@agmen');
      validator.validate().should.equal(false);

      field.getValue.returns('info.agmen@');
      validator.validate().should.equal(false);

      field.getValue.returns('info@agmen@hu');
      validator.validate().should.equal(false);
    });
  });

  afterEach(function() {
    env.shutdown();
  });
});
