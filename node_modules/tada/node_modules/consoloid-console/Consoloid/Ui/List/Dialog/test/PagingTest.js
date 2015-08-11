require("consoloid-framework/Consoloid/Widget/JQoteTemplate");
require('consoloid-framework/Consoloid/Widget/jquery.jqote2.min.js');
require("consoloid-framework/Consoloid/Widget/Widget");
require("../../../Dialog");
require("../../../MultiStateDialog");
require("../../../Volatile/Dialog");
require('../Paging');

require('consoloid-framework/Consoloid/Test/UnitTest');

describeUnitTest('Consoloid.Ui.List.Dialog.Paging', function() {
  var
    context,
    contextObject,
    dialog,
    translator,
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

    translator = {
      trans: function(string) {
        switch (string) {
          case "first":
            return "első";
          case "last":
            return "utolsó";
          case "next":
            return "következő";
          case "previous":
            return "előző";
          default:
            return string;
        }
      }
    }

    env.addServiceMock('translator', translator);

    context = {
      findByClass: sinon.stub()
    };
    env.addServiceMock('context', context);

    list = {
      setPage: sinon.stub(),
      getCurrentPage: sinon.stub().returns(5),
      getPageCount: sinon.stub().returns(10),
    };

    contextObject = {
      entity: {
        getList: function() {
          return list;
        }
      }
    };

    dialog = env.create(Consoloid.Ui.List.Dialog.Paging, {
      arguments: {
        name: contextObject,
        page: {
          value: "2"
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

    it("should call set page list with page number in argument", function() {
      dialog.setup();

      list.setPage.calledOnce.should.be.ok;
      list.setPage.args[0][0].should.equal(1);
    });

    it('should set apropriate page if "first", "last", "next", "previous", or their translations are the page argument', function() {
      dialog.arguments.page.value = "first";
      dialog.setup();
      dialog.arguments.page.value = "első";
      dialog.setup();
      dialog.arguments.page.value = "last";
      dialog.setup();
      dialog.arguments.page.value = "utolsó";
      dialog.setup();
      dialog.arguments.page.value = "next";
      dialog.setup();
      dialog.arguments.page.value = "következő";
      dialog.setup();
      dialog.arguments.page.value = "previous";
      dialog.setup();
      dialog.arguments.page.value = "előző";
      dialog.setup();

      list.setPage.args[0][0].should.equal(0);
      list.setPage.args[1][0].should.equal(0);
      list.setPage.args[2][0].should.equal(9);
      list.setPage.args[3][0].should.equal(9);
      list.setPage.args[4][0].should.equal(6);
      list.setPage.args[5][0].should.equal(6);
      list.setPage.args[6][0].should.equal(4);
      list.setPage.args[7][0].should.equal(4);

      list.getCurrentPage.callCount.should.equal(4);
      list.getPageCount.callCount.should.equal(2);
    });

    it("should render an okay message if paging was successful", function() {
      dialog.setup();
      dialog.activeState.should.equal("normal");
    });

    it("should render a warning message if paging was unsuccessful", function() {
      list.setPage.throws();

      dialog.setup();
      dialog.activeState.should.equal("error");
    });
  });
});