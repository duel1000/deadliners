require('consoloid-framework/Consoloid/Test/UnitTest');
require("consoloid-framework/Consoloid/Widget/JQoteTemplate");
require('consoloid-framework/Consoloid/Widget/jquery.jqote2.min.js');
require("consoloid-framework/Consoloid/Widget/Widget");
require("../BaseField");
require("../Text");

describeUnitTest('Consoloid.Form.Text', function() {
  describe("#__constructor()", function() {
    it('should throw an error on unknown input type', function() {
      (function () {
        env.create(Consoloid.Form.Text, { name: 'foo', prefix: 'bar', type: 'alma' });
      }).should.throwError(/Unknown input type/);
    });

    it('should accept allowed type values', function() {
      var textField = env.create(Consoloid.Form.Text, { name: 'foo', prefix: 'bar', type: 'color' });
      textField.type.should.equal('color');
    });

    it('should default to text type', function() {
      var textField = env.create(Consoloid.Form.Text, { name: 'foo', prefix: 'bar' });
      textField.type.should.equal('text');
    });
  });

  describe('#parseUserInput()', function() {
    it('should read value from input field', function() {
      $(document.body).append($('<input type="text" id="bar-foo" value="testValue" />'));
      var textField = env.create(Consoloid.Form.Text, { name: 'foo', prefix: 'bar' });

      textField.parseUserInput();
      textField.getValue().should.equal('testValue');
    });
  });

  afterEach(function() {
    $(document.body).empty();
    env.shutdown();
  });
});
