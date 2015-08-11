require('consoloid-framework/Consoloid/Test/UnitTest');
require("consoloid-framework/Consoloid/Widget/JQoteTemplate");
require('consoloid-framework/Consoloid/Widget/jquery.jqote2.min.js');
require("consoloid-framework/Consoloid/Widget/Widget");
require("../BaseField");
require("../AutoValidatingField");
require("../Select");

describeUnitTest('Consoloid.Form.Select', function() {
  describe('#parseUserInput()', function() {
    it('should read value from input field', function() {
      $(document.body).append($('<select id="select-test"><option value="">None</option><option value="test" selected="selected">Test</option></select>'));
      var field = env.create(Consoloid.Form.Select, { name: 'test', prefix: 'select' });

      field.parseUserInput();
      field.getValue().should.equal('test');
    });
  });

  afterEach(function() {
    $(document.body).empty();
    env.shutdown();
  });
});
