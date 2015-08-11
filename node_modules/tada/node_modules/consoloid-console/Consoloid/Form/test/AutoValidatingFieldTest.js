require('consoloid-framework/Consoloid/Test/UnitTest');
require("consoloid-framework/Consoloid/Widget/JQoteTemplate");
require('consoloid-framework/Consoloid/Widget/jquery.jqote2.min.js');
require("consoloid-framework/Consoloid/Widget/Widget");
require("../BaseField");
require("../AutoValidatingField");

describeUnitTest('Consoloid.Form.AutoValidatingField', function() {
  var
    clock,
    field;

  beforeEach(function() {
    clock = sinon.useFakeTimers();
    field = env.create(Consoloid.Form.AutoValidatingField, {
      name: 'foo',
      prefix: 'bar',
      autoValidateTimeout: 600
    });
  });

  describe('#autoValidate()', function() {
    it('should start timer with configured timeout', function() {
      sinon.spy(global, 'setTimeout');

      field.autoValidate();

      setTimeout.calledOnce.should.be.ok;
      setTimeout.restore();
    });

    it('should restart timer when called before timeout', function() {
      sinon.spy(global, 'setTimeout');
      sinon.spy(global, 'clearTimeout');

      field.autoValidate();

      clock.tick(200);

      field.autoValidate();

      setTimeout.calledTwice.should.be.ok;
      clearTimeout.calledOnce.should.be.ok;
      setTimeout.restore();
      clearTimeout.restore();
    });

    it('should call _autoValidateField when timeout elapsed', function() {
      sinon.spy(field, '_autoValidateField');

      field.autoValidate();

      clock.tick(610);

      field._autoValidateField.calledOnce.should.be.ok;
    });

    it('should not start timer when timeout is not configured', function() {
      sinon.spy(global, 'setTimeout');

      field = env.create(Consoloid.Form.AutoValidatingField, {
        name: 'foo',
        prefix: 'bar',
        autoValidateTimeout: undefined
      });
      field.autoValidate();

      setTimeout.notCalled.should.be.ok;
      setTimeout.restore();
    });
  });

  describe('#_autoValidateField()', function() {
    it('should call validate', function() {
      sinon.spy(field, 'validate');

      field._autoValidateField();

      field.validate.calledOnce.should.be.ok;
    })

    it('should call renderErrorMessage', function() {
      sinon.spy(field, 'renderErrorMessage');
      sinon.stub(field, 'validate').returns(false);

      field._autoValidateField();

      field.renderErrorMessage.calledOnce.should.be.ok;
    })
  })

  afterEach(function() {
    env.shutdown();
    clock.restore();
  });
});
