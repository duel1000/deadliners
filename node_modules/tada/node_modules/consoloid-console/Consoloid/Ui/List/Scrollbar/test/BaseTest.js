require('consoloid-framework/Consoloid/Widget/jquery.jqote2.min.js');
require('consoloid-framework/Consoloid/Widget/JQoteTemplate');
require("consoloid-framework/Consoloid/Widget/Widget");
require('../Base.js');
require('consoloid-framework/Consoloid/Test/UnitTest');

describeUnitTest('Consoloid.Ui.List.Scrollbar.Base', function() {
  var
    scrollbar,
    eventDispatcher;

  beforeEach(function() {
    env.readTemplate(__dirname + '/../../templates.jqote', 'utf8');
    eventDispatcher = {
      bind: sinon.stub(),
      trigger: sinon.stub()
    }
    scrollbar = env.create(Consoloid.Ui.List.Scrollbar.Base, { eventDispatcher: eventDispatcher });
  });

  describe("#__constructor(options)", function() {
    it("should set the default values", function() {
      scrollbar = env.create(Consoloid.Ui.List.Scrollbar.Base, { });
      (typeof scrollbar.eventDispatcher.bind == "function").should.be.ok;
      (typeof scrollbar.eventDispatcher.trigger == "function").should.be.ok;
    });

    it("should create event listeners for the buttons, that trigger paging", function() {
      scrollbar.eventListeners[0].selector.should.equal('.scrollbar-button-first-page');
      scrollbar.eventListeners[0].event.should.equal('click');

      scrollbar.pageNumber = 1;
      scrollbar.eventListeners[0].callback();

      eventDispatcher.trigger.calledOnce.should.be.ok;
      eventDispatcher.trigger.calledWith("first-page").should.be.ok;

      scrollbar.eventListeners[1].selector.should.equal('.scrollbar-button-previous-page');
      scrollbar.eventListeners[1].event.should.equal('click');
      scrollbar.eventListeners[1].callback();

      eventDispatcher.trigger.calledTwice.should.be.ok;
      eventDispatcher.trigger.calledWith("previous-page").should.be.ok;

      scrollbar.eventListeners[2].selector.should.equal('.scrollbar-button-next-page');
      scrollbar.eventListeners[2].event.should.equal('click');
      scrollbar.eventListeners[2].callback();

      eventDispatcher.trigger.calledThrice.should.be.ok;
      eventDispatcher.trigger.calledWith("next-page").should.be.ok;

      scrollbar.eventListeners[3].selector.should.equal('.scrollbar-button-last-page');
      scrollbar.eventListeners[3].event.should.equal('click');
      scrollbar.eventListeners[3].callback();

      eventDispatcher.trigger.callCount.should.equal(4);
      eventDispatcher.trigger.calledWith("last-page").should.be.ok;
    });

    it("should create these event listeners from functions that do not trigger if elementsDisabled is set true", function() {
      scrollbar.pageNumber = 1;
      scrollbar.elementsDisabled = true;
      scrollbar.eventListeners[0].callback();
      scrollbar.eventListeners[1].callback();
      scrollbar.eventListeners[2].callback();
      scrollbar.eventListeners[3].callback();

      eventDispatcher.trigger.called.should.not.be.ok;
    });

    it("should register a function on the scroll-state-changed event, that enables/disables all buttons", function() {
      scrollbar.__switchButtonEnabledState = sinon.spy();
      eventDispatcher.bind.calledWith("scroll-state-changed").should.be.ok;

      eventDispatcher.bind.args[0][1]({}, 'setpage');

      scrollbar.elementsDisabled.should.be.ok;

      eventDispatcher.bind.args[0][1]({}, 'none');

      scrollbar.elementsDisabled.should.not.be.ok;
    });
  });

  describe("#render()", function(){
    it("should call __switchButtonEnabledState", function() {
      scrollbar.__switchButtonEnabledState = sinon.spy();
      scrollbar.render();

      scrollbar.__switchButtonEnabledState.calledOnce.should.be.ok;
    });
  });

  describe("#getEventDispatcher()", function() {
    it("should return with the event dispatcher", function() {
      scrollbar.getEventDispatcher().should.equal(eventDispatcher);
    });
  });

  describe("#setPageInfo(pageNumber, lastPossiblePage)", function() {
    beforeEach(function() {
      scrollbar.render();
    });

    it("should set the pageNumber and lastPossiblePage, change it on the node", function() {
      scrollbar.node.find(".scrollbar-pagenumber").text().should.equal('1');

      scrollbar.setPageInfo(9.8, 10.1);
      scrollbar.node.find(".scrollbar-pagenumber").text().should.equal('11');
    });

    it("should call __switchButtonEnabledState", function() {
      scrollbar.__switchButtonEnabledState = sinon.spy();
      scrollbar.setPageInfo(9.8, 10.1);

      scrollbar.__switchButtonEnabledState.calledOnce.should.be.ok;
    });
  });

  describe("#__switchButtonEnabledState()", function() {
    beforeEach(function() {
      scrollbar.render();
    });

    it("should disable first and previous page buttons when on first page", function() {
      scrollbar.pageNumber = 0;
      scrollbar.lastPossiblePage = 10;
      scrollbar.__switchButtonEnabledState();

      scrollbar.node.find(".scrollbar-button-first-page").is(":disabled").should.be.ok;
      scrollbar.node.find(".scrollbar-button-previous-page").is(":disabled").should.be.ok;

      scrollbar.node.find(".scrollbar-button-next-page").is(":disabled").should.not.be.ok;
      scrollbar.node.find(".scrollbar-button-last-page").is(":disabled").should.not.be.ok;
    });

    it("should disable last and next page buttons when on last page", function() {
      scrollbar.pageNumber = 9.3;
      scrollbar.lastPossiblePage = 9.3;
      scrollbar.__switchButtonEnabledState();

      scrollbar.node.find(".scrollbar-button-first-page").is(":disabled").should.not.be.ok;
      scrollbar.node.find(".scrollbar-button-previous-page").is(":disabled").should.not.be.ok;

      scrollbar.node.find(".scrollbar-button-next-page").is(":disabled").should.be.ok;
      scrollbar.node.find(".scrollbar-button-last-page").is(":disabled").should.be.ok;
    });

    it("should reenable buttons on any other page", function() {
      scrollbar.pageNumber = 0;
      scrollbar.lastPossiblePage = 10;
      scrollbar.__switchButtonEnabledState();
      scrollbar.pageNumber = 2;
      scrollbar.__switchButtonEnabledState();

      scrollbar.node.find(".scrollbar-button-first-page").is(":disabled").should.not.be.ok;
      scrollbar.node.find(".scrollbar-button-previous-page").is(":disabled").should.not.be.ok;

      scrollbar.node.find(".scrollbar-button-next-page").is(":disabled").should.not.be.ok;
      scrollbar.node.find(".scrollbar-button-last-page").is(":disabled").should.not.be.ok;

      scrollbar.pageNumber = 10;
      scrollbar.__switchButtonEnabledState();
      scrollbar.pageNumber = 2;
      scrollbar.__switchButtonEnabledState();

      scrollbar.node.find(".scrollbar-button-first-page").is(":disabled").should.not.be.ok;
      scrollbar.node.find(".scrollbar-button-previous-page").is(":disabled").should.not.be.ok;

      scrollbar.node.find(".scrollbar-button-next-page").is(":disabled").should.not.be.ok;
      scrollbar.node.find(".scrollbar-button-last-page").is(":disabled").should.not.be.ok;
    });

    it("should disable all elements no matter what if elementsDisabled is set", function() {
      scrollbar.lastPossiblePage = 10;
      scrollbar.pageNumber = 2;
      scrollbar.elementsDisabled = true;

      scrollbar.__switchButtonEnabledState();

      scrollbar.node.find(".scrollbar-button-first-page").is(":disabled").should.be.ok;
      scrollbar.node.find(".scrollbar-button-previous-page").is(":disabled").should.be.ok;

      scrollbar.node.find(".scrollbar-button-next-page").is(":disabled").should.be.ok;
      scrollbar.node.find(".scrollbar-button-last-page").is(":disabled").should.be.ok;
    });
  })

});