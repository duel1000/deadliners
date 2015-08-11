require("consoloid-framework/Consoloid/Widget/JQoteTemplate");
require('consoloid-framework/Consoloid/Widget/jquery.jqote2.min.js');
require("consoloid-framework/Consoloid/Widget/Widget");
require("../../Dialog");
require("../../MultiStateDialog");
require('../Container.js');

require('consoloid-framework/Consoloid/Test/UnitTest');
describeUnitTest('Consoloid.Ui.Volatile.Container', function(){
  var
    dialog,
    addEventListenerSpy,
    cssLoaderMock,
    consoleMock;

  beforeEach(function() {
    consoleMock = {
      createNewDialog: function() { return new $('<div />'); },
      animateMarginTopIfNecessary: function(){},
      getVisibleDialogsHeight: sinon.stub().returns(500),
      removeDialog: sinon.stub()
    };
    env.addServiceMock('console', consoleMock);
    env.readTemplate(__dirname + '/../../templates.jqote', 'utf8');
    env.readTemplate(__dirname + '/../templates.jqote', 'utf8');
    cssLoaderMock = { load: sinon.spy() };
    env.addServiceMock('css_loader', cssLoaderMock);

    addEventListenerSpy = sinon.spy(Consoloid.Ui.Volatile.Container.prototype, 'addEventListener');
    dialog = env.create('Consoloid.Ui.Volatile.Container', {
      node: new $('<div><div class="expander"></div><div class="volatile-convo-number"></div></div>')
    });

    var translatorMock = {
      trans:function(text, args) {
        if (args) {
          for (var key in args) {
            text = text.replace(key, args[key]);
          };
        }
        return text;
      }
    }
    env.addServiceMock('translator', translatorMock);
    sinon.stub($.fn, 'show', function(){});
    sinon.stub($.fn, 'hide', function(){});
    sinon.stub($.fn, 'fadeIn', function(){});
    sinon.stub($.fn, 'fadeOut', function(){});
  });

  describe("#__constructor(options)", function() {
    it("should set states (closed, opened), set default values", function() {
      dialog.states.closed.should.be.ok;
      dialog.states.opened.should.be.ok;
      dialog.activeState.should.equal('closed');
      dialog.dialogs.should.be.ok;
    });

    it("should add event listener for state switching", function() {
      addEventListenerSpy.called.should.be.ok;
      addEventListenerSpy.calledWith('div.expander, div.volatile-convo-number', 'click', dialog.switchState).should.be.ok;
    });
  });

  describe("#start()", function() {
    it("should not create expression", function() {
      (dialog.expression == undefined).should.be.ok;

      dialog.start();

      (dialog.expression == undefined).should.be.ok;
    });
  });

  describe("#render()", function() {
    it("should only show the default dialog appeearing animation on first render", function() {
      sinon.spy(dialog, "_animateDialogShowup");

      dialog.render();
      dialog.render();
      dialog.render();

      dialog._animateDialogShowup.calledOnce.should.be.ok;
      dialog._animateDialogShowup.restore();
    });

    it("should add css", function() {
      dialog.render();
      cssLoaderMock.load.calledWith('Consoloid-Ui-Volatile-volatile').should.be.ok;
    });

    it("should not render an expression", function() {
      var expressionMock = {
        render: sinon.stub()
      };
      dialog.expression = expressionMock;

      dialog.render();

      expressionMock.render.called.should.not.be.ok;
    });

    it("should render and show every volatile dialog node on open render", function() {
      var volatileConvoMock = {
        node: new $('<div />'),
        render: sinon.stub()
      }

      dialog.dialogs = [volatileConvoMock, volatileConvoMock, volatileConvoMock];
      dialog.activeState = "opened";

      dialog.render();

      volatileConvoMock.node.show.calledThrice.should.be.ok;
      volatileConvoMock.render.calledThrice.should.be.ok;
    });
  });

  describe("#switchState(state)", function() {
    it("should animate state change", function() {
      dialog.firstRender = false;
      sinon.spy(dialog, "_animateDialogShowup");

      dialog.switchState();
      dialog.switchState();
      dialog._animateDialogShowup.calledTwice.should.be.ok;

      dialog._animateDialogShowup.restore();
    });

    it("should swtich state between the two states if state is not set", function() {
      dialog.switchState();

      dialog.activeState.should.equal('opened');

      dialog.switchState();

      dialog.activeState.should.equal('closed');
    });

    it("should remove expander pulse", function() {
      dialog.node.find('.expander').addClass("pulse-both");
      dialog.node.find('.expander').addClass("pulse-error");
      dialog.node.find('.expander').addClass("pulse-info");

      dialog.switchState();

      dialog.node.find('.expander').hasClass('pulse-error').should.not.be.ok;
      dialog.node.find('.expander').hasClass('pulse-info').should.not.be.ok;
      dialog.node.find('.expander').hasClass('pulse-both').should.not.be.ok;
    });

    it("should clear new dialogs", function() {
      dialog.newDialogs = [{}];

      dialog.switchState();

      dialog.newDialogs.length.should.equal(0);
    });
  });

  describe("#addVolatileDialog(dialog)", function() {
    it("should add dialog", function() {
      dialog.addVolatileDialog({
        name: 'foo',
        render: function() {},
        getActiveState: sinon.stub().returns('normal'),
        node: new $('<div />')
      });

      dialog.activeVolatileDialog.name.should.equal('foo');
      dialog.dialogs[0].name.should.equal('foo');
    });

    it("should fadeIn the new convo, and add a timer when to fade out the bubble if in closed state", function() {
      var clock = sinon.useFakeTimers();
      var node = new $('<div />');

      dialog.addVolatileDialog({
        name: 'foo',
        node: node,
        render: function() {},
        getActiveState: sinon.stub().returns('normal'),
      });

      dialog.render();

      node.fadeIn.called.should.be.ok;
      dialog.disappearTimer.should.be.ok;

      clock.tick(10000);

      (dialog.disappearTimer == undefined).should.be.ok;
      node.fadeOut.called.should.be.ok;

      clock.restore();
    });

    it("should not hide the convo if state is changed in the mean time", function() {
      var clock = sinon.useFakeTimers();
      var node = new $('<div />');

      dialog.addVolatileDialog({
        node: node,
        render: function() {},
        getActiveState: sinon.stub().returns('normal')
      });

      dialog.render();
      clock.tick(100);
      dialog.switchState();
      clock.tick(10000);

      node.fadeOut.called.should.not.be.ok;

      clock.restore();
    });

    it("should add convo to new dialogs in closed state", function() {
        dialog.addVolatileDialog({
          node: new $('<div />'),
          render: function() {},
          getActiveState: sinon.stub().returns('normal')
        });

        dialog.newDialogs.length.should.equal(1);

        dialog.newDialogs = [];
        dialog.activeState = "opened";
        dialog.addVolatileDialog({
          node: new $('<div />'),
          render: function() {},
          getActiveState: sinon.stub().returns('normal')
        });

        dialog.newDialogs.length.should.equal(0);
    });
  });

  describe("#__refreshExpanderPulse()", function() {
    it("should set icon property if in closed state and new convo has info/error state", function() {
      var convoMock = {
        name: 'foo',
        render: sinon.stub(),
        node: new $('<div />'),
        getActiveState: sinon.stub().returns('info')
      };

      var convoMock2 = {
          name: 'foo',
          render: sinon.stub(),
          node: new $('<div />'),
          getActiveState: sinon.stub().returns('error')
        };

      dialog.addVolatileDialog(convoMock);
      dialog.__refreshExpanderPulse();

      dialog.node.find('.expander').hasClass('pulse-info').should.be.ok;

      dialog.addVolatileDialog(convoMock2);
      dialog.__refreshExpanderPulse();

      dialog.node.find('.expander').hasClass('pulse-both').should.be.ok;

      convoMock.getActiveState.returns('error');
      dialog.__refreshExpanderPulse();

      dialog.node.find('.expander').hasClass('pulse-error').should.be.ok;

      convoMock2.getActiveState.returns('info');
      dialog.__refreshExpanderPulse();

      dialog.node.find('.expander').hasClass('pulse-both').should.be.ok;
    });
  });

  describe("#removeVolatileDialog(dialog)", function() {
    var volatile;
    beforeEach(function() {
      volatile = { name: "foo" };
      dialog.dialogs.push(volatile);
    });

    it("should remove that dialog", function() {
      dialog.removeVolatileDialog(volatile);

      dialog.dialogs.length.should.equal(0);
    });

    it("should remove this dialog from the console, if there are no dialogs left", function() {
      dialog.removeVolatileDialog(volatile);

      consoleMock.removeDialog.called.should.be.ok;
    });

    it("should show the dialog counter if closed", function() {
      dialog.activeVolatileDialog = volatile;
      var spy = sinon.spy(dialog, '__dialogCounterFadeIn');
      dialog.removeVolatileDialog(volatile);

      spy.called.should.be.ok;
    });

    it("should remove active state of a dialog, so it won't show up again in closed state", function() {
      dialog.activeVolatileDialog = volatile;
      dialog.removeVolatileDialog(volatile);

      (dialog.activeVolatileDialog == undefined).should.be.ok;;
    });

    it("should remove pulse effect if the only pulse source is removed", function() {
      var convoMock = {
        getActiveState: sinon.stub().returns('error'),
      };
      dialog.newDialogs = [convoMock];
      dialog.activeVolatileDialog = convoMock;

      dialog.removeVolatileDialog(convoMock);

      dialog.node.find('.expander').hasClass('pulse-error').should.not.be.ok;
      dialog.node.find('.expander').hasClass('pulse-info').should.not.be.ok;
      dialog.node.find('.expander').hasClass('pulse-both').should.not.be.ok;

      var convoMock2 = {
        getActiveState: sinon.stub().returns('info'),
      };
      dialog.newDialogs = [convoMock2];
      dialog.activeVolatileDialog = convoMock2;

      dialog.removeVolatileDialog(convoMock2);

      dialog.node.find('.expander').hasClass('pulse-error').should.not.be.ok;
      dialog.node.find('.expander').hasClass('pulse-info').should.not.be.ok;
      dialog.node.find('.expander').hasClass('pulse-both').should.not.be.ok;

      dialog.newDialogs = [convoMock, convoMock2];
      dialog.activeVolatileDialog = convoMock;

      dialog.removeVolatileDialog(convoMock);

      dialog.node.find('.expander').hasClass('pulse-error').should.not.be.ok;
      dialog.node.find('.expander').hasClass('pulse-info').should.be.ok;
      dialog.node.find('.expander').hasClass('pulse-both').should.not.be.ok;
    });
  });

  describe("__dialogCounterFadeIn", function() {
    it('should fade in with proper text for one and multiple dialogs', function() {
      dialog.dialogs = [{}];
      dialog.__dialogCounterFadeIn();

      dialog.node.find('.volatile-convo-number').text().should.equal("One dialog");

      dialog.dialogs = [{}, {}];
      dialog.__dialogCounterFadeIn();

      dialog.node.find('.volatile-convo-number').text().should.equal("2 dialogs");
    });
  });

  afterEach(function() {
    $.fn.show.restore();
    $.fn.hide.restore();
    $.fn.fadeIn.restore();
    $.fn.fadeOut.restore();
    addEventListenerSpy.restore();
    delete global.__;
  });
});
