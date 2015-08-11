require('consoloid-framework/Consoloid/Test/UnitTest');
require("consoloid-framework/Consoloid/Widget/JQoteTemplate");
require('consoloid-framework/Consoloid/Widget/jquery.jqote2.min.js');
require("consoloid-framework/Consoloid/Widget/Widget");
require("../BaseField");
require("../AutoValidatingField");
require("../TextArea");

describeUnitTest('Consoloid.Form.TextArea', function() {
  describe('#parseUserInput()', function() {
    it('should read value from input field', function() {
      $(document.body).append($('<textarea id="bar-foo">testValue</textarea>'));
      var textField = env.create(Consoloid.Form.TextArea, { name: 'foo', prefix: 'bar' });

      textField.parseUserInput();
      textField.getValue().should.equal('testValue');
    });
  });

  afterEach(function() {
    $(document.body).empty();
    env.shutdown();
  });
});
