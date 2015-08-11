require('consoloid-framework/Consoloid/Test/UnitTest');
require("consoloid-framework/Consoloid/Widget/JQoteTemplate");
require('consoloid-framework/Consoloid/Widget/jquery.jqote2.min.js');
require("consoloid-framework/Consoloid/Widget/Widget");
require("consoloid-framework/Consoloid/Widget/Widget");
require("consoloid-framework/Consoloid/Service/ChainedContainer");
require("../BaseField");
require("../FieldSet");
require("../Text");
require("../Validator/Number");
require("../Form");

describeUnitTest('Consoloid.Form.Form', function() {
  var
    form;

  beforeEach(function() {
    form = env.create('Consoloid.Form.Form', {
      name: 'testForm',
      fieldDefinitions: {
        name: {
          cls: 'Consoloid.Form.Text'
        },
        contactInfo: {
          cls: 'Consoloid.Form.FieldSet',
          options: {
            title: 'Contact Information',
            fieldDefinitions: {
              phone: {
                cls: 'Consoloid.Form.Text'
              },
              mobile: {
                cls: 'Consoloid.Form.Text'
              }
            }
          }
        }
      },
      validatorDefinitions: {
        foo: {
          cls: 'Consoloid.Form.Validator.Number',
          options: {}
        }
      }
    });
  });

  describe("#__constructor()", function() {
    it('should allow access to the services from the configured container', function() {
      form.container.get('server').url.should.equal('testUrl');
    });

    it('should have itself in the front container', function() {
      form.container.get('form').should.equal(form);
    });
  });

  describe("#validate()", function() {
    it('should create validators from definitions', function() {
      form.validate();
      form.validators.foo.should.be.instanceOf(getClass('Consoloid.Form.Validator.Number'));
    });

    it('should call validate on each validators', function() {
      // we need to trigger the lazy initialization of validators
      form.getValue();

      sinon.spy(form.validators.foo, 'validate');

      form.validate();

      form.validators.foo.validate.calledOnce.should.be.ok;
    });

    it('should clean any error in form before validation', function() {
      // we need to trigger the lazy initialization of validators
      form.getValue();

      sinon.spy(form.validators.foo, 'validate');
      sinon.spy(form.fields.contactInfo.fields.phone, 'clearError');

      form.validate();
      form.fields.contactInfo.fields.phone.clearError.calledOnce.should.be.ok;
    });
  });

  afterEach(function() {
    env.shutdown();
  });
});
