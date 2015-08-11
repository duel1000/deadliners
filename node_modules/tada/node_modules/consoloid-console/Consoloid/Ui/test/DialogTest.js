require('consoloid-framework/Consoloid/Test/UnitTest');
require("consoloid-framework/Consoloid/Widget/JQoteTemplate");
require('consoloid-framework/Consoloid/Widget/jquery.jqote2.min.js');
require("consoloid-framework/Consoloid/Widget/Widget");
require("consoloid-framework/Consoloid/Error/UserMessage");
require("../Dialog");
require("../Expression");

describeUnitTest('Consoloid.Ui.Dialog', function(){
  var
    consoleService,
    dialog;

  beforeEach(function() {
    consoleService = {
      createNewDialog: function() { return new $('<div />'); },
      animateMarginTopIfNecessary: sinon.spy(),
      getVisibleDialogsHeight: sinon.stub().returns(500)
    };
    env.addServiceMock('console', consoleService);

    env.readTemplate(__dirname + '/../templates.jqote', 'utf8');

    dialog = env.create(Consoloid.Ui.Dialog, {responseTemplateId: 'Consoloid-Ui-DialogResponse'});
  });

  describe('#render()', function() {
    beforeEach(function() {
      env.get('resource_loader').getParameter = sinon.stub()
        .withArgs('dialog.expressionTemplate')
          .returns('Consoloid-Ui-Expression');
    });

    it('should render the sentence that started the dialog', function() {
      var expressionModel = { getTextWithArguments: function() { return 'test sentence, foo bar' } };

      var console_spy = sinon.spy(consoleService, 'createNewDialog');

      dialog.start({ foo: 'bar' }, expressionModel);

      console_spy.calledOnce.should.be.equal(true);
    });

    it('should use a template that divides the dialog into starting sentence and ui area', function() {
      var expressionModel = { getTextWithArguments: function() { return 'test sentence, foo bar' } };

      dialog.start({ foo: 'bar' }, expressionModel);

      (dialog.expression.node != undefined).should.be.true;
      (dialog.response != undefined).should.be.true;

      (dialog.node.find('.request')[0] == dialog.expression.node[0]).should.be.true;
      (dialog.node.find('.response')[0] == dialog.response[0]).should.be.true;
    });

    it('should not render expression, if no expression model was given', function() {
      dialog.startWithoutExpression();

      (dialog.expression == undefined).should.be.true;
      (dialog.node.find('.response')[0] == dialog.response[0]).should.be.true;
    });
  });

  describe('#__lookupContextObject(cls, index, errorMessage)', function() {
    var contextObject, context;
    beforeEach(function() {
      context = {
        findByClass: sinon.stub().returns(["A", "B", "C"])
      };
      env.addServiceMock('context', context);
      env.addServiceMock('translator', { trans: function(msg) { return msg; } });
    });

    it('should lookup the first context object belonging to the class if no index is set', function() {
      var response = dialog.__lookupContextObject('Foo.Bar');

      context.findByClass.calledWith('Foo.Bar').should.be.true;
      response.should.equal("A");
    });

    it('should get the object with the index', function() {
      var response = dialog.__lookupContextObject('Foo.Bar', 2);
      response.should.equal("C");
    });

    it('should throw a user error, if no such class is found', function() {
      context.findByClass.returns([]);
      (function() {
        dialog.__lookupContextObject('Foo.Bar');
      }).should.throwError(Consoloid.Error.UserMessage);
    });

    it('should use the errorMessage parameter if set',function() {
      context.findByClass.returns([]);
      try {
        dialog.__lookupContextObject('Foo.Bar', 0, 'Woah woah!');
      } catch (err) {
        err.message.should.equal('Woah woah!');
      }
    });
  });

  afterEach(function() {
    $(document.body).empty();
    env.shutdown();
  });
});
