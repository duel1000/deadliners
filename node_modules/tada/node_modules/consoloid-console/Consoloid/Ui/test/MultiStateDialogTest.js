require('consoloid-framework/Consoloid/Test/UnitTest');
require("consoloid-framework/Consoloid/Widget/JQoteTemplate");
require('consoloid-framework/Consoloid/Widget/jquery.jqote2.min.js');
require("consoloid-framework/Consoloid/Widget/Widget");
require("../Dialog");
require("../Expression");
require("../MultiStateDialog");

describeUnitTest('Consoloid.Ui.MultiStateDialog', function() {
  var
    dialog;

  beforeEach(function() {
    dialog = env.create(Consoloid.Ui.MultiStateDialog, {
      states: {
        foo: 'Consoloid-Ui-DialogResponse-Foo',
        bar: 'Consoloid-Ui-DialogResponse-Bar'
      },
      activeState: 'foo'
    });
  });

  describe("#__constructor()", function() {
    it('should throw an error if activeState is not element of states', function() {
      (function() {
        env.create(Consoloid.Ui.MultiStateDialog, {
          states: {
            foo: 'Consoloid-Ui-DialogResponse-Foo',
            bar: 'Consoloid-Ui-DialogResponse-Bar'
          },
          activeState: 'foobar'
        });
      }).should.throwError(/Invalid state/);
    });
  });

  describe("#switchState()", function() {
    it('should switch the active state', function() {
      sinon.stub(dialog, 'render').returns(dialog);
      dialog.switchState('bar');
      dialog.activeState.should.equal('bar');
    });

    it('should not accept states that are not known', function() {
      (function() {
        dialog.switchState('foo_bar');
      }).should.throwError(/Invalid state/);
    });

    it('should re-render itself with a different template', function() {
      sinon.stub(dialog, 'render').returns(dialog);
      dialog.switchState('bar');
      dialog.render.calledOnce.should.be.equal(true);
    });

    it('should not re-render itself if the active state is target state', function() {
      sinon.stub(dialog, 'render').returns(dialog);
      dialog.switchState('foo');
      dialog.render.called.should.not.be.equal();
    });
  });

  describe("#render()", function() {
    beforeEach(function() {
      env.readTemplate(__dirname + '/../templates.jqote', 'utf8');
      env.readTemplate(__dirname + '/resources/templates.jqote', 'utf8');

      var console = {
        createNewDialog: function() { return new $('<div />'); },
        animateMarginTopIfNecessary: sinon.spy(),
        getVisibleDialogsHeight: sinon.stub().returns(500)
      };
      env.addServiceMock('console', console);
    });

    it('should set the responseTemplate according to activeState', function() {
      var expressionModel = { getTextWithArguments: function() { return 'test sentence, foo bar'; } };

      env.get('resource_loader').getParameter = sinon.stub()
        .withArgs('dialog.expressionTemplate')
          .returns('Consoloid-Ui-Expression');

      dialog.start({ foo: 'bar' }, expressionModel);
      dialog.switchState('bar');
      dialog.responseTemplate.id.should.be.equal('Consoloid-Ui-DialogResponse-Bar');
    });
  });

  describe("#getActiveState()", function() {
    it("should return with active state", function() {
      dialog.getActiveState().should.equal('foo');
    });
  });

  afterEach(function() {
    $(document.body).empty();
    env.shutdown();
  });
});
