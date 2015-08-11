require("consoloid-framework/Consoloid/Widget/JQoteTemplate");
require('consoloid-framework/Consoloid/Widget/jquery.jqote2.min.js');
require("consoloid-framework/Consoloid/Widget/Widget");
require("../../Dialog");
require("../../MultiStateDialog");
require('../Dialog.js');

require('consoloid-framework/Consoloid/Test/UnitTest');
describeUnitTest('Consoloid.Ui.Volatile.Dialog', function(){
  var
    dialog,
    containerDialogMock,
    consoleMock,
    expressionMock,
    createStub;

  beforeEach(function() {
    env.readTemplate(__dirname + '/../../templates.jqote', 'utf8');
    env.readTemplate(__dirname + '/../templates.jqote', 'utf8');

    containerDialogMock = {
      addVolatileDialog: sinon.stub().returns(new $('<div />')),
      removeVolatileDialog: sinon.stub(),
      start: sinon.stub(),
      render: sinon.stub()
    };

    expressionMock = {};

    createStub = sinon.stub(Consoloid.Ui.Volatile.Dialog.prototype, 'create');
    createStub.withArgs('Consoloid.Ui.Volatile.Container').returns(containerDialogMock);
    createStub.withArgs('Consoloid.Ui.Expression').returns(expressionMock);

    consoleMock = {
      createNewDialog: sinon.stub(),
      removeDialog: sinon.stub(),
      getLastDialog: sinon.stub().returns(containerDialogMock)
    };

    env.addServiceMock('console', consoleMock);

    dialog = env.create('Consoloid.Ui.Volatile.Dialog', {});
  });

  describe("#__constructor(options)", function() {
    it("should set the default values", function() {
      dialog.activeState.should.equal('normal');
    });
  });

  describe("#setup()", function() {
    it("should create Volatile Container dialog if the last dialog was not a container, and add itself to it", function() {
      consoleMock.getLastDialog.returns({});
      dialog.setup();

      consoleMock.getLastDialog.called.should.be.ok;

      createStub.calledWith('Consoloid.Ui.Volatile.Container').should.be.ok;

      consoleMock.createNewDialog.called.should.be.ok;
      consoleMock.createNewDialog.args[0][0].should.equal(containerDialogMock);

      dialog.volatileContainer.should.equal(containerDialogMock);

      containerDialogMock.start.called.should.be.ok;
      containerDialogMock.addVolatileDialog.called.should.be.ok;
    });

    it("should add itself to the Volatile Container dialog if that's the last dialog", function() {
      dialog.setup();
      consoleMock.getLastDialog.called.should.be.ok;

      createStub.calledWith('Consoloid.Ui.Volatile.Container').should.not.be.ok;

      consoleMock.createNewDialog.called.should.not.be.ok;

      dialog.volatileContainer.should.equal(containerDialogMock);

      containerDialogMock.addVolatileDialog.called.should.be.ok;
      containerDialogMock.addVolatileDialog.args[0][0].should.equal(dialog);
    });
  });

  describe("#handleArguments(args, expression)", function() {
    it("should not add itself to the console's dialogs, but should work normally anyway", function() {
      env.container.get('resource_loader').getParameter = sinon.stub().returns('Consoloid-Ui-Expression');

      dialog.handleArguments([], {});

      consoleMock.createNewDialog.called.should.not.be.ok;
      dialog.expression.should.equal(expressionMock);
      dialog.node.should.be.ok;
    });
  });

  describe("#remove()", function() {
    beforeEach(function() {
      dialog.setup();
    });

    it("should call the remove function of the volatile container with itself", function() {
      var spy = sinon.spy(dialog.node, "fadeOut");
      dialog.remove();

      spy.called.should.be.ok;
      spy.args[0][0].complete();

      containerDialogMock.removeVolatileDialog.called.should.be.ok;
      consoleMock.removeDialog.called.should.not.be.ok;

    });

    it("should do some fancy animation", function() {
      var animateSpy = sinon.spy(dialog.node, 'animate');
      var fadeSpy = sinon.spy(dialog.node, 'fadeOut');

      dialog.remove();

      animateSpy.called.should.be.ok;
      fadeSpy.called.should.be.ok;
    });
  });

  describe("#getMessage()", function() {
    it("should return with message", function() {
      dialog.message = "Hello World!";
      dialog.getMessage().should.equal("Hello World!");
    });
  });

  afterEach(function() {
    createStub.restore();
  });
});