
require("consoloid-framework/Consoloid/Widget/JQoteTemplate");
require('consoloid-framework/Consoloid/Widget/jquery.jqote2.min.js');
require("consoloid-framework/Consoloid/Widget/Widget");
require("../../../Dialog");
require("../../../MultiStateDialog");
require("../../../Volatile/Dialog");
require('../Filter.js');
require('../FurtherFilter.js');

require('consoloid-framework/Consoloid/Test/UnitTest');

describeUnitTest('Consoloid.Ui.List.Dialog.FurtherFilter', function() {
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

    env.addServiceMock('translator', { trans: function(msg) { return msg; } });

    list = {
      setFilterString: sinon.stub(),
      appendFilterString: sinon.stub()
    };

    contextObject = {
      entity: {
        getList: function() {
          return list;
        }
      }
    };

    dialog = env.create(Consoloid.Ui.List.Dialog.FurtherFilter, {
      arguments: {
        name: contextObject,
        filter: {
          value: "foo: bar"
        }
      }
    });
  });

  describe("#setup()", function() {
    it("should call appendFilterString instead of setFilterString on the list", function() {
      dialog.setup();

      list.setFilterString.called.should.not.be.ok;
      list.appendFilterString.calledOnce.should.be.ok;
      list.appendFilterString.args[0][0].should.equal("foo: bar");
    });
  });
});