require('consoloid-framework/Consoloid/Widget/jquery.jqote2.min.js');
require('consoloid-framework/Consoloid/Widget/JQoteTemplate');
require('../Base.js');
require('consoloid-framework/Consoloid/Test/UnitTest');


describeUnitTest('Consoloid.Ui.List.Factory.Base', function() {
  describe('constructor', function() {
    it('should create template object when templateId is given', function() {
      var factory = env.create(Consoloid.Ui.List.Factory.Base, {
        templateId: 'factory-test-template'
      });

      factory.should.have.property('template');
      factory.template.should.have.property('id', 'factory-test-template');
    });
  });

  describe('#render(elemenet)', function() {
    beforeEach(function() {
      $(document.body).append($('<script id="widget-render-test-template" type="text/x-jqote-template">\
          <a href="#" class="foo"><%= this.name %></a>\
          </script>'));
    });

    it('should render template', function() {
      var factory = env.create(Consoloid.Ui.List.Factory.Base, {
        templateId: 'widget-render-test-template'
      });

      factory.template = { get: sinon.stub() };
      var templateMock = sinon.mock(factory.template);
      factory.template.get.returns($('#widget-render-test-template'));

      var node = factory.render({ name: "bar" });
      node.html().should.equal('bar');

      factory.template.get.calledOnce.should.be.ok;
    });
  });

  afterEach(function() {
    $(document.body).empty();
  });
});
