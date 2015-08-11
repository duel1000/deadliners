require('consoloid-framework/Consoloid/Test/UnitTest');
require("consoloid-framework/Consoloid/Widget/JQoteTemplate");
require('consoloid-framework/Consoloid/Widget/jquery.jqote2.min.js');
require("consoloid-framework/Consoloid/Widget/Widget");
require("../../../Interpreter/Token");
require("../../../Interpreter/Tokenizable");
require("../../../Context/Object");
require("../../../Form/ContextObject");
require("../../Dialog");
require("../../Expression");
require("../../MultiStateDialog");
require("../FormDialog");

Consoloid.Ui.Form.FormDialog.index = [];
describeUnitTest('Consoloid.Ui.Form.FormDialog', function() {
  var
    context,
    cssLoader,
    form,
    dialog,
    callback,
    translator;

  beforeEach(function() {
    callback = sinon.stub();
    context = {
      add: sinon.spy(),
      remove: sinon.spy()
    };

    env.addServiceMock('tokenizer', { parse: function(input) { return input.split(' ') } });
    env.addServiceMock('context', context);
    cssLoader = { load: sinon.spy() };
    env.addServiceMock('css_loader', cssLoader);
    form = {
      setNode: sinon.stub(),
      parseUserInput: sinon.spy(),
      validate: sinon.stub(),
      getValue: sinon.stub(),
      setErrorMessage: sinon.spy(),
      render: sinon.spy(),
      focus: sinon.spy(),
      enable: sinon.spy(),
      disable: sinon.spy()
    };
    form.setNode.returns(form);
    env.addServiceMock('form', form);

    translator = {
      trans: function(msg) {
        return msg;
      }
    }

    env.addServiceMock('translator', translator);

    global.__ = function(msg) { return translator.trans(msg) }

    dialog = env.create(Consoloid.Ui.Form.FormDialog, {
      formService: 'form',
      submitButtonText: 'Submit this test form',
      name: 'Foo Form Dialog'
    });
  });

  describe('#__constructor()', function() {
    it('should set the default states', function() {
      var states = Object.keys(dialog.states);
      states.indexOf('active').should.not.equal(-1);
      states.indexOf('submitted').should.not.equal(-1);
      dialog.activeState.should.equal('active');
    });

    it('should require a form service', function() {
      (function() {
        env.create(Consoloid.Ui.Form.FormDialog, { name: 'Foo Form Dialog' });
      }).should.throwError(/formService must be injected/);
    });

    it('should require a name', function() {
      (function() {
        dialog = env.create(Consoloid.Ui.Form.FormDialog, { formService: 'form' });
      }).should.throwError(/name must be injected/);
    });

    it('should create and/or increment a static counter and add that to name', function() {
      dialog = env.create(Consoloid.Ui.Form.FormDialog, {
        formService: 'form',
        submitButtonText: 'Submit this test form',
        name: 'Bar Form Dialog'
      });

      dialog.name.should.equal('Bar Form Dialog: 1');

      dialog = env.create(Consoloid.Ui.Form.FormDialog, {
        formService: 'form',
        submitButtonText: 'Submit this test form',
        name: 'Bar Form Dialog'
      });

      dialog.name.should.equal('Bar Form Dialog: 2');
    });
  });

  describe('#setup()', function() {
    it('should add itself to context, with a proper name', function() {
      dialog.setup();

      dialog.contextObject.name.should.equal(dialog.name);
    });
  })

  describe('#render()', function() {
    beforeEach(function() {
      env.readTemplate(__dirname + '/../../templates.jqote', 'utf8');
      env.readTemplate(__dirname + '/../templates.jqote', 'utf8');
      env.addServiceMock('console', {
        animateMarginTopIfNecessary: sinon.spy(),
        getVisibleDialogsHeight: sinon.stub().returns(500)
      });
      dialog.expression = { render: function() {}, setReferenceText: sinon.spy() };
    });

    it('should load css', function() {
      dialog.render();
      cssLoader.load.calledOnce.should.be.ok;
    });

    it('should add the dialog name as a reference text to the expression', function() {
      dialog.render();

      dialog.expression.setReferenceText.calledOnce.should.be.ok;
    });

    it('should render the form', function() {
      dialog.render();
      form.render.calledOnce.should.be.ok;
    });

    it('should set form id based on dialog id', function() {
      sinon.stub(dialog, 'create');
      sinon.stub(dialog, 'render');
      env.addServiceMock('console', {
        createNewDialog: function() {
          return {
            attr: function() {
              return 'test-1';
            }
          };
        }
      });

      env.get('resource_loader').getParameter =
        sinon.stub()
          .withArgs('dialog.expressionTemplate')
          .returns('Consoloid-Ui-Expression');

      dialog.start();
      form.prefix.should.equal('test-1');
    });

    it('should focus first form element when in active state', function() {
      dialog.render();
      form.focus.calledOnce.should.be.ok;

      form.focus.reset();

      dialog.switchState('submitted');
      form.focus.notCalled.should.be.ok;
    });

    describe('when the form is active', function() {
      it('should render the submit button below the form', function() {
        dialog.render();
        dialog.node.find('.response div.active a.submit-button').length.should.equal(1);
      });

      it('should add an expression-reference to the submit button', function() {
        dialog = env.create(Consoloid.Ui.Form.FormDialog, {
          formService: 'form',
          name: 'Foo Form Dialog'
        });
        dialog.expression = { render: function() {}, setReferenceText: function() {} };
        dialog.render();
        dialog.node.find('.response div.active a.submit-button').hasClass('expression-reference').should.be.ok;
      });

      it('should display configured text in submit button', function() {
        dialog.render();
        dialog.node.find('.response div.active a.submit-button').text().should.equal('Submit this test form');
      })

      it('should add form to context', function() {
        dialog.render();
        context.add.calledOnce.should.be.ok;
      });
    });

    describe('when the form is submitted', function() {
      it('should render the default submitted template below the form', function() {
        dialog.switchState('submitted');
        dialog.node.find('.response div.submitted span.status').length.should.equal(1);
      });

      it('should not render the submit button below the form', function() {
        dialog.switchState('submitted');
        dialog.node.find('.response div.active a.submit-button').length.should.equal(0);
      });

      it('should render the form with disabled fields', function() {
        dialog.switchState('submitted');
        form.disable.calledOnce.should.be.ok;
      });

      it('should remove form from context', function() {
        dialog.switchState('submitted');
        context.remove.calledOnce.should.be.ok;
      });
    });
  });

  describe('#submit()', function() {
    describe('when the form is not valid', function() {
      it('should re-render form with errors', function() {
        form.validate.returns(false);
        sinon.stub(dialog, '_renderForm');
        dialog.submit();

        dialog._renderForm.calledOnce.should.be.ok;
      });

      it('should call the callback with success as false', function() {
        form.validate.returns(false);
        dialog.submit(callback);

        callback.calledWith({ success: false }).should.be.ok;
      })
    });

    describe('when the form is valid', function() {
      var processor;

      beforeEach(function() {
        form.validate.returns(true);
        processor = {
          process: sinon.stub()
        };
        env.addServiceMock('testProcessor', processor);
      });

      describe('should call configured service method', function() {
        beforeEach(function() {
          dialog = env.create(Consoloid.Ui.Form.FormDialog, {
            formService: 'form',
            name: 'Foo Form Dialog',
            processor: {
              service: 'testProcessor',
              method: 'process'
            }
          });
          form.getValue.returns({ f1: 'test', f2: 'value' });

          processor.process.returns({result: 'ok', message: 'test response message' });
        });

        it('with form value as arguments', function() {
          sinon.stub(dialog, 'switchState');

          dialog.submit();

          processor.process.calledOnce.should.be.ok;
          processor.process.calledWith({ f1: 'test', f2: 'value' }).should.be.ok;
        });

        it('and display returned error', function() {
          processor.process.returns({result: 'error', errors:{ f1: 'error1' }});

          dialog.submit();

          dialog.form.setErrorMessage.calledOnce.should.be.ok;
        });

        it('and call the callback with success as false if error is returned', function() {
          processor.process.returns({result: 'error', errors:{ f1: 'error1' }});

          dialog.submit(callback);

          callback.calledWith({ success: false }).should.be.ok;
        });

        it('and call the callback with the response text on a success', function() {
          sinon.stub(dialog, 'render');
          dialog.submit(callback);

          callback.calledWith({ success: true, message: 'test response message' }).should.be.ok;
        });

        it('and switch state on success, store processed message and call the callback with the response text', function() {
          sinon.stub(dialog, 'switchState');

          dialog.submit();
          dialog.switchState.calledOnce.should.be.ok;
          dialog.switchState.calledWith('submitted').should.be.ok;
          dialog.processedMessage.should.equal('test response message');
        });
      });
    });
  });

  describe('#focus()', function() {
    it('should focus the form', function() {
      dialog.focus();
      form.focus.calledOnce.should.be.ok;
    });
  });

  afterEach(function() {
    global.__ = undefined;
    $(document.body).empty();
    env.shutdown();
  });
});
