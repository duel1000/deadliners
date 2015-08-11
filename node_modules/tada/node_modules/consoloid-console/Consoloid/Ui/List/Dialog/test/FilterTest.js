require("consoloid-framework/Consoloid/Widget/JQoteTemplate");
require('consoloid-framework/Consoloid/Widget/jquery.jqote2.min.js');
require("consoloid-framework/Consoloid/Widget/Widget");
require("../../../Dialog");
require("../../../MultiStateDialog");
require("../../../Volatile/Dialog");
require('../Filter');

require('consoloid-framework/Consoloid/Test/UnitTest');

describeUnitTest('Consoloid.Ui.List.Dialog.Filter', function() {
  var
    context,
    contextObject,
    dialog,
    console,
    list,
    containerDialog;

  beforeEach(function() {
    containerDialog = {
      addVolatileDialog: sinon.stub().returns(new $('<div />')),
      removeVolatileDialog: sinon.stub(),
      start: sinon.stub(),
      render: sinon.stub()
    };

    console = {
      getLastDialog: sinon.stub().returns(containerDialog)
    };

    env.addServiceMock('console', console);

    context = {
      findByClass: sinon.stub()
    };
    env.addServiceMock('context', context);
    env.addServiceMock('translator', { trans: function(msg) { return msg; } });

    list = {
      setFilterString: sinon.stub()
    };

    contextObject = {
      entity: {
        getList: function() {
          return list;
        }
      }
    };

    dialog = env.create(Consoloid.Ui.List.Dialog.Filter, {
      arguments: {
        name: contextObject,
        filter: {
          value: "foo: bar"
        }
      }
    });
  });

  describe("#setup()", function() {
    it("should find the last context object if none is given", function() {
      delete dialog.arguments.name;
      context.findByClass.returns([contextObject]);

      dialog.setup();

      context.findByClass.calledWith('Consoloid.Ui.List.Dialog.ContextObject').should.be.ok;
    });

    it("should call setFilterString on the list", function() {
      dialog.setup();

      list.setFilterString.calledOnce.should.be.ok;
      list.setFilterString.args[0][0].should.equal("foo: bar");
    });

    it("should render an okay message if filtering was successful", function() {
      dialog.setup();
      dialog.activeState.should.equal("normal");
    });
    it("should render a warning message if filtering was unsuccessful", function() {
      list.setFilterString.throws();

      dialog.setup();
      dialog.activeState.should.equal("error");
    });
  });
});