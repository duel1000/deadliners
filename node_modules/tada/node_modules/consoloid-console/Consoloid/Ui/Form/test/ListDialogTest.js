require('consoloid-framework/Consoloid/Test/UnitTest');
require("consoloid-framework/Consoloid/Widget/JQoteTemplate");
require('consoloid-framework/Consoloid/Widget/jquery.jqote2.min.js');
require("consoloid-framework/Consoloid/Widget/Widget");
require("../../../Interpreter/Token");
require("../../../Interpreter/Tokenizable");
require("../../../Context/Object");
require("../../../Form/ContextObject");
require("../../Dialog");
require("../../MultiStateDialog");
require("../ListDialog");

describeUnitTest('Consoloid.Ui.Form.ListDialog', function() {
  var
    context,
    dialog;

  beforeEach(function() {
    context = {
      findByClass: sinon.stub(),
      getByClassAndString: sinon.stub()
    };
    env.addServiceMock('context', context);

    dialog = env.create(Consoloid.Ui.Form.ListDialog, { arguments: {} });
  });

  describe('#setup()', function() {
    describe('when consoloid has active form dialogs', function() {
      it('should list form dialogs from context', function() {
        var formContextObjectMock = {
          entity: {
            name: 'test-name'
          }
        };

        context.findByClass.returns([formContextObjectMock, formContextObjectMock]);

        dialog.setup();

        context.findByClass.alwaysCalledWith('Consoloid.Form.ContextObject').should.be.ok;
        dialog.dialogNames.should.eql(['test-name', 'test-name']);
        dialog.activeState.should.equal('hasItems');
      });

      it('should focus dialogs when a list item is clicked', function() {
        env.readTemplate(__dirname + '/../../templates.jqote', 'utf8');
        env.readTemplate(__dirname + '/../templates.jqote', 'utf8');
        env.addServiceMock('console', {
          animateMarginTopIfNecessary: sinon.spy(),
          getVisibleDialogsHeight: sinon.stub().returns(500)
        });

        var formContextObjectMock = {
          name: 'test-name',
          entity: {
            name: 'test-name',
            dialog: {
              focus: sinon.spy()
            }
          }
        };

        context.findByClass.returns([formContextObjectMock]);
        context.getByClassAndString.returns(formContextObjectMock.entity);

        sinon.spy(Consoloid.Ui.Form.ListDialog.prototype, 'clickItem');

        dialog = env.create(Consoloid.Ui.Form.ListDialog, { arguments: {} });
        dialog.expression = { render: function() {} };
        dialog.setup();
        dialog.render();

        dialog.node.find('.response ul li a[data-name="test-name"]').click();

        formContextObjectMock.entity.dialog.focus.calledOnce.should.be.ok;
        Consoloid.Ui.Form.ListDialog.prototype.clickItem.calledOnce.should.be.ok;

        Consoloid.Ui.Form.ListDialog.prototype.clickItem.restore();
      });

      describe('when consoloid does not have any active form dialog', function() {
        it('should switch state to empty', function() {
          context.findByClass.returns([]);

          dialog.setup();

          context.findByClass.alwaysCalledWith('Consoloid.Form.ContextObject').should.be.ok;
          dialog.dialogNames.should.eql([]);
          dialog.activeState.should.equal('empty');
        })
      });
    });
  })

  afterEach(function() {
    env.shutdown();
  });
});
