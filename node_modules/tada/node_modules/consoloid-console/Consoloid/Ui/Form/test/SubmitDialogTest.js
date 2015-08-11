require('consoloid-framework/Consoloid/Test/UnitTest');
require("consoloid-framework/Consoloid/Widget/JQoteTemplate");
require('consoloid-framework/Consoloid/Widget/jquery.jqote2.min.js');
require("consoloid-framework/Consoloid/Widget/Widget");
require("consoloid-framework/Consoloid/Error/UserMessage");
require("../../../Interpreter/Token");
require("../../../Interpreter/Tokenizable");
require("../../../Context/Object");
require("../../../Form/ContextObject");
require("../../Dialog");
require("../../MultiStateDialog");
require("../../Volatile/Dialog");
require("../SubmitDialog");

describeUnitTest('Consoloid.Ui.Form.SubmitDialog', function() {
  var
    context,
    dialog,
    consoleMock,
    containerDialogMock;

  beforeEach(function() {
    containerDialogMock = {
      addVolatileDialog: sinon.stub().returns(new $('<div />')),
      removeVolatileDialog: sinon.stub(),
      start: sinon.stub(),
      render: sinon.stub()
    };

    consoleMock = {
      getLastDialog: sinon.stub().returns(containerDialogMock)
    };

    env.addServiceMock('console', consoleMock);

    context = {
      findByClass: sinon.stub()
    };
    env.addServiceMock('context', context);
    env.addServiceMock('translator', { trans: function(msg) { return msg; } });

    dialog = env.create(Consoloid.Ui.Form.SubmitDialog, {
      arguments: {
        name: {
          entity: {
            dialog: {
              submit: sinon.spy()
            }
          }
        }
      }
    });
  });

  describe('#setup()', function() {
    describe('when form dialog name is not given', function() {
      beforeEach(function() {
        dialog.arguments = {};
      });

      it('should lookup first form dialog from context and call submit', function() {
        var formContextObjectMock = {
          entity: {
            dialog: {
              submit: sinon.spy()
            }
          }
        };
        context.findByClass.returns([formContextObjectMock]);

        dialog.setup();

        context.findByClass.calledWith('Consoloid.Form.ContextObject').should.be.ok;
        formContextObjectMock.entity.dialog.submit.calledOnce.should.be.ok;
      });

      it('should display error when there isn\'t any form dialog in context', function() {
        context.findByClass.returns([]);

        (function() {
          dialog.setup();
        }).should.throwError(Consoloid.Error.UserMessage);
      });
    });

    describe('when form dialog name is given', function() {
      it('should use received context item for submit', function() {
        dialog.setup();

        dialog.arguments.name.entity.dialog.submit.calledOnce.should.be.ok;
      });
    });

    it('should add a callback that sets response of the dialog', function() {
      sinon.stub(dialog, 'render');
      dialog.setup();

      var callback = dialog.arguments.name.entity.dialog.submit.getCall(0).args[0];
      callback.should.be.type('function');

      callback({ success: true, message: 'FooBar' });

      dialog.getMessage().should.equal('FooBar');
      dialog.render.calledOnce.should.be.ok;

      global.__ = function(text) {
        return text;
      }
      callback({ success: false });
      dialog.activeState.should.equal("error")
      dialog.getMessage().should.equal('Form submission failed.');

      delete global.__;
      dialog.render.restore();
    });

  });

  afterEach(function() {
    env.shutdown();
  });
});
