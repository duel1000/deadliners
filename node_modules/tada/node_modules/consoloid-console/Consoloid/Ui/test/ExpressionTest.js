require('consoloid-framework/Consoloid/Test/UnitTest');
require("consoloid-framework/Consoloid/Widget/JQoteTemplate");
require('consoloid-framework/Consoloid/Widget/jquery.jqote2.min.js');
require("consoloid-framework/Consoloid/Widget/Widget");
require("../Expression");

describeUnitTest('Consoloid.Ui.Expression', function(){
  describe('#render()', function() {
    it('should display the texts', function() {
      var model = { getTextWithArguments: function() { return 'test sentence' } };

      var expression = env.create(Consoloid.Ui.Expression, {
        model: model,
        arguments: { foo: 'bar' },
        referenceText: 'FooBar:1'
      });

      env.readTemplate(__dirname + '/../templates.jqote', 'utf8');

      expression.render();
      expression.node.text().should.include('test sentence');
      expression.node.text().should.include('FooBar:1');
    });
  });

  describe('#update(name, value)', function() {
    it('should update argument with name to given value', function() {
      var model = { getTextWithArguments: function() {} };
      var stub = sinon.stub(model, 'getTextWithArguments', function(args) {
        return ('test sentence, having foo ' + args['foo']);
      });

      var expression = env.create(Consoloid.Ui.Expression, {
        model: model,
        arguments: { foo: 'bar' }
      });

      expression.update('foo', 'hello');
      expression.text.should.be.equal('test sentence, having foo hello');
      stub.calledTwice.should.equal(true);
    });
  });
});
