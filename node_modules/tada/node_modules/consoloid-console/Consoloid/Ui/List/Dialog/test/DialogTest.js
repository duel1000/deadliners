require("consoloid-framework/Consoloid/Widget/JQoteTemplate");
require('consoloid-framework/Consoloid/Widget/jquery.jqote2.min.js');
require("consoloid-framework/Consoloid/Widget/Widget");
require("../../../Dialog");
require("../Dialog");
require('consoloid-framework/Consoloid/Test/UnitTest');

Consoloid.Ui.List.Dialog.Dialog.index = {};
describeUnitTest('Consoloid.Ui.List.Dialog.Dialog', function() {
  var
    dialog,
    expression,
    context,
    contextObject,
    eventDispatcher,
    create,
    list,
    translator,
    template;

  beforeEach(function() {
    env.addServiceMock('translator', {
      trans: function(str) {
        return str;
      }
    });
    context = {
      add: sinon.spy(),
    };
    env.addServiceMock('context', context);
    contextObject = {};
    expression = {
      setReferenceText: sinon.stub(),
      render: function() {}
    };
    eventDispatcher = {
      bind: sinon.stub()
    };
    list = {
      render: sinon.stub(),
      getEventDispatcher: function() {
        return eventDispatcher;
      },
      setNode: sinon.spy()
    }

    template = env.create('Consoloid.Widget.JQoteTemplate', {
      id: 'Consoloid-Ui-List-Widget'
    });

    create = sinon.stub();
    create.withArgs('Consoloid.Ui.List.Dialog.ContextObject').returns(contextObject);
    create.withArgs('Consoloid.Widget.JQoteTemplate').returns(template);
    dialog = env.create(Consoloid.Ui.List.Dialog.Dialog, {
      name: "Foo List Dialog",
      list: list,
      expression: expression,
      create: create
    });
  });

  describe("#__constructor(options)", function() {
    it("should require a list widget, and a name for storing in the context", function() {
      (function() {
        env.create(Consoloid.Ui.List.Dialog.Dialog, {
          list: list
        });
      }).should.throwError();

      (function() {
        env.create(Consoloid.Ui.List.Dialog.Dialog, {
          name: "Foo List Dialog",
        });
      }).should.throwError();
    });

    it("should bind the resize animation to the size change of the list widget", function() {
      dialog = env.create(Consoloid.Ui.List.Dialog.Dialog, {
        name: "Foo List Dialog",
        list: list,
        _animateDialogResize: sinon.stub()
      });

      eventDispatcher.bind.args[1][0].should.equal("size-changed");

      dialog._animateDialogResize.called.should.not.be.ok;
      eventDispatcher.bind.args[1][1]();
      dialog._animateDialogResize.called.should.be.ok;
    });

    it("should incrementally name itself using static variables", function() {
      dialog = env.create(Consoloid.Ui.List.Dialog.Dialog, {
        name: "Foo",
        list: list,
      });
      dialog.name.should.equal("Foo: 1");

      dialog = env.create(Consoloid.Ui.List.Dialog.Dialog, {
        name: "Foo",
        list: list,
      });
      dialog.name.should.equal("Foo: 2");

      dialog = env.create(Consoloid.Ui.List.Dialog.Dialog, {
        name: "Bar",
        list: list,
      });
      dialog.name.should.equal("Bar: 1");
    });
  });

  describe("#render()", function() {
    beforeEach(function() {
      env.readTemplate(__dirname + '/../../templates.jqote', 'utf8');
      env.addServiceMock('console', {
        animateMarginTopIfNecessary: sinon.spy(),
        getVisibleDialogsHeight: sinon.stub().returns(500)
      });
      dialog.expression = expression;
      dialog.render();
    });

    it("should create and store a context object that points to the widget", function() {
      create.calledWith('Consoloid.Ui.List.Dialog.ContextObject').should.be.ok;
      create.args[2][1].list.should.equal(list);
      create.args[2][1].name.should.equal(dialog.name);
    });

    it("should set the name as reference text to the expression", function() {
      expression.setReferenceText.args[0][0].should.equal(dialog.name);
    });

    it("should render the list widget", function() {
      list.render.called.should.be.ok;
    });
  });
});
