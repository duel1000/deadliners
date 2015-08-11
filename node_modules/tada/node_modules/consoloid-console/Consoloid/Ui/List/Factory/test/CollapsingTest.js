require('../Collapsing.js');

require('consoloid-framework/Consoloid/Test/UnitTest');

describeUnitTest('Consoloid.Ui.List.Factory.Collapsing', function() {
  var
    eventDispatcher,
    factory,
    create,
    collapsingElement;
  beforeEach(function() {
    eventDispatcher = {};
    collapsingElement = {
      render: sinon.stub(),
      node: {}
    };

    factory = env.create(Consoloid.Ui.List.Factory.Collapsing, {
      collapsedTemplateId: 'collapsed-test-template',
      extendedTemplateId: 'extended-test-template',
      eventDispatcher: eventDispatcher,
    });

    create = sinon.stub().returns(collapsingElement);
    factory.create = create;
  });

  describe("__constructor(options)", function() {
    it("should require two templates, one for each state, and an event dispatcher", function() {
      (function() {
        env.create(Consoloid.Ui.List.Factory.Collapsing, {
          extendedTemplateId: 'collapsed-test-template',
          eventDispatcher: eventDispatcher
        });
      }).should.throwError();

      (function() {
        env.create(Consoloid.Ui.List.Factory.Collapsing, {
          collapsedTemplateId: 'collapsed-test-template',
          eventDispatcher: eventDispatcher
        });
      }).should.throwError();

      (function() {
        env.create(Consoloid.Ui.List.Factory.Collapsing, {
          collapsedTemplateId: 'collapsed-test-template',
          extendedTemplateId: 'extended-test-template',
        });
      }).should.throwError();
    });
  });

  describe("render(data)", function() {
    it("should create a collapsing list element and return with its node", function() {
      var data = {};
      factory.render(data).should.equal(collapsingElement.node);
      create.calledWith("Consoloid.Ui.List.Factory.CollapsingElement").should.be.ok;
      create.args[0][1].eventDispatcher.should.equal(eventDispatcher);
      create.args[0][1].extendedTemplateId.should.equal("extended-test-template");
      create.args[0][1].collapsedTemplateId.should.equal("collapsed-test-template");
      create.args[0][1].data.should.equal(data);

      collapsingElement.render.calledOnce.should.be.ok;
    });
  });
});
