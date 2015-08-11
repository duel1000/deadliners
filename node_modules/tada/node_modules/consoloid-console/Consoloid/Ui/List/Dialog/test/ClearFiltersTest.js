require("consoloid-framework/Consoloid/Widget/JQoteTemplate");
require('consoloid-framework/Consoloid/Widget/jquery.jqote2.min.js');
require("consoloid-framework/Consoloid/Widget/Widget");
require("../../../Dialog");
require("../../../MultiStateDialog");
require("../../../Volatile/Dialog");
require('../ClearFilters');

require('consoloid-framework/Consoloid/Test/UnitTest');

describeUnitTest('Consoloid.Ui.List.Dialog.ClearFilters', function() {
  var
    eventDispatcher,
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

    eventDispatcher = {
      trigger: sinon.stub()
    };

    list = {
      getEventDispatcher: function() {
        return eventDispatcher;
      }
    };

    contextObject = {
      entity: {
        getList: function() {
          return list;
        }
      }
    };

    dialog = env.create(Consoloid.Ui.List.Dialog.ClearFilters, {
      arguments: {
        name: contextObject,
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

    it("should dispatch clear filters event", function() {
      dialog.setup();

      eventDispatcher.trigger.calledOnce.should.be.ok;
      eventDispatcher.trigger.args[0][0].should.equal("clear-filters");
    });

    it("should render an okay message", function() {
      dialog.setup();
      dialog.activeState.should.equal("normal");
    });
  });
});