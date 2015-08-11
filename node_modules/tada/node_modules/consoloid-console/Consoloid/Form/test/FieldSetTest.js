require('consoloid-framework/Consoloid/Test/UnitTest');
require("consoloid-framework/Consoloid/Widget/JQoteTemplate");
require('consoloid-framework/Consoloid/Widget/jquery.jqote2.min.js');
require("consoloid-framework/Consoloid/Widget/Widget");
require("../BaseField");
require("../AutoValidatingField");
require("../Text");
require("../FieldSet");

describeUnitTest('Consoloid.Form.FieldSet', function() {
  var
    fieldSet;

  beforeEach(function() {
    fieldSet = env.create(Consoloid.Form.FieldSet, {
      name: 'foo',
      prefix: 'bar',
      fieldDefinitions: {
        f1: {
          cls: 'Consoloid.Form.Text',
          options: {}
        },
        f2: {
          cls: 'Consoloid.Form.Text',
          options: {}
        }
      }
    });
  });

  describe("#createFieldsFromDefinitions()", function() {
    it('should create fields from definitions', function() {
      fieldSet.getField('f1').should.be.instanceOf(getClass('Consoloid.Form.BaseField'));
      fieldSet.getField('f2').should.be.instanceOf(getClass('Consoloid.Form.BaseField'));
    });

    it('should set names from the property names in the definition', function() {
      fieldSet.getField('f2').name.should.be.equal('f2');
      fieldSet.getField('f2').getId().should.be.equal('bar-foo-f2');
    });
  });

  describe("#getField()", function() {
    it('should return field for sub-fieldset when using slash in field name', function() {
      fieldSet.fields = {
        f1: { getField: function() { return 'subfieldset-result'; } },
      };

      fieldSet.getField('f1/test').should.equal('subfieldset-result');
    });
  });

  describe("#getValue()", function() {
    it('should call getValue() on children', function() {
      sinon.spy(fieldSet.fields.f1, 'getValue');
      sinon.spy(fieldSet.fields.f2, 'getValue');

      fieldSet.getValue();

      fieldSet.fields.f1.getValue.calledOnce.should.be.equal(true);
      fieldSet.fields.f2.getValue.calledOnce.should.be.equal(true);
    });

    it('should return with values from all children', function() {
      fieldSet.fields = {
        f1: { getValue: function() { return 'field1'; } },
        f2: { getValue: function() { return 'field2'; } },
      };

      var value = fieldSet.getValue();
      value.f1.should.equal('field1');
      value.f2.should.equal('field2');
    });
  });

  describe("#setValue(values)", function() {
    it('should set value in children specified by name in values argument', function() {
      sinon.spy(fieldSet.fields.f1, 'setValue');
      sinon.spy(fieldSet.fields.f2, 'setValue');

      var value = fieldSet.setValue({ f1: 'apple', f2: 'apricot' });

      fieldSet.fields.f1.setValue.calledWith('apple').should.be.ok;
      fieldSet.fields.f2.setValue.calledWith('apricot').should.be.ok;
    });

    it('should not set value in children not specified in values argument', function() {
      sinon.spy(fieldSet.fields.f1, 'setValue');
      sinon.spy(fieldSet.fields.f2, 'setValue');

      var value = fieldSet.setValue({ f1: 'apple' });

      fieldSet.fields.f1.setValue.calledWith('apple').should.be.ok;
      fieldSet.fields.f2.setValue.called.should.not.be.ok;
    });

    it('should throw Error when value is specified for child field that is not defined', function() {
      fieldSet.fields = {};

      (function() { fieldSet.setValue({ f1: 'apple' }); })
        .should.throwError(/Child field does not exist/);
    });
  });

  describe("#getErrorMessage()", function() {
    it('should return error from children', function() {
      fieldSet.fields.f1.setErrorMessage('err1');
      fieldSet.fields.f2.setErrorMessage('err2');

      fieldSet.getErrorMessage().should.eql({f1: 'err1', f2: 'err2'});
    });
  });

  describe("#setErrorMessage()", function() {
    it('should set error on children', function() {
      fieldSet.setErrorMessage({f1: 'err1', f2: 'err2'});

      fieldSet.fields.f1.getErrorMessage().should.equal('err1');
      fieldSet.fields.f2.getErrorMessage().should.equal('err2');
    });
  });

  describe("#parseUserInput()", function() {
    it('should call parse input on children', function() {
      sinon.spy(fieldSet.fields.f1, 'parseUserInput');
      sinon.spy(fieldSet.fields.f2, 'parseUserInput');

      fieldSet.parseUserInput();

      fieldSet.fields.f1.parseUserInput.calledOnce.should.be.equal(true);
      fieldSet.fields.f2.parseUserInput.calledOnce.should.be.equal(true);
    });
  });

  describe("#disable()", function() {
    it('should disable all childs', function() {
      fieldSet.fields.f1.enabled.should.equal(true);
      fieldSet.fields.f2.enabled.should.equal(true);

      fieldSet.disable();

      fieldSet.fields.f1.enabled.should.equal(false);
      fieldSet.fields.f2.enabled.should.equal(false);
    });
  });

  describe("#enable()", function() {
    it('should enable all childs', function() {
      fieldSet.fields.f1.enabled.should.equal(true);
      fieldSet.fields.f2.enabled.should.equal(true);

      fieldSet.disable();
      fieldSet.enable();

      fieldSet.fields.f1.enabled.should.equal(true);
      fieldSet.fields.f2.enabled.should.equal(true);
    });
  });

  describe("#render()", function() {
    beforeEach(function() {
      env.readTemplate(__dirname + '/../templates.jqote', 'utf8');
    });

    it('should render all fields', function() {
      sinon.spy(fieldSet.fields.f1, 'render');
      sinon.spy(fieldSet.fields.f2, 'render');

      fieldSet.render();

      fieldSet.fields.f1.render.calledOnce.should.be.equal(true);
      fieldSet.fields.f2.render.calledOnce.should.be.equal(true);
      fieldSet.node.html().should.include(fieldSet.fields.f1.node.html());
      fieldSet.node.html().should.include(fieldSet.fields.f2.node.html());
    });

    afterEach(function() {
      $(document.body).empty();
    });
  });

  describe('#focus()', function() {
    it('should focus first child element', function() {
      sinon.spy(fieldSet.fields.f1, 'focus');
      sinon.spy(fieldSet.fields.f2, 'focus');

      fieldSet.focus();

      fieldSet.fields.f1.focus.calledOnce.should.be.equal(true);
      fieldSet.fields.f2.focus.notCalled.should.be.equal(true);
    });

  });

  afterEach(function() {
    env.shutdown();
  });
});
