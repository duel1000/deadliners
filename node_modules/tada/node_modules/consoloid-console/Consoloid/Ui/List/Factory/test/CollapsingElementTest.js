require("consoloid-framework/Consoloid/Widget/Widget");
require('consoloid-framework/Consoloid/Widget/jquery.jqote2.min.js');
require('consoloid-framework/Consoloid/Widget/JQoteTemplate');
require('../CollapsingElement.js');

require('consoloid-framework/Consoloid/Test/UnitTest');

describeUnitTest('Consoloid.Ui.List.Factory.CollapsingElement', function() {
  var
    element,
    eventDispatcher;
  beforeEach(function() {
    eventDispatcher = {
      bind: sinon.stub(),
      trigger: sinon.spy()
    };

    $.fn.is.restore ? $.fn.is.restore() : '';
    $.fn.show.restore ? $.fn.show.restore() : '';
    $.fn.hide.restore ? $.fn.hide.restore() : '';
    $.fn.fadeOut.restore ? $.fn.fadeOut.restore() : '';
    $.fn.animate.restore ? $.fn.animate.restore() : '';
    sinon.stub($.fn, 'is', function(){ return false; });
    sinon.stub($.fn, 'show', function(){ return $.fn; });
    sinon.stub($.fn, 'hide', function(){});
    sinon.stub($.fn, 'fadeOut', function(){ arguments[0].complete()});
    sinon.stub($.fn, "animate", function(){ arguments[1].complete()});

    element = env.create(Consoloid.Ui.List.Factory.CollapsingElement, {
      templateId: 'Consoloid-Ui-List-Factory-CollapsingElement',
      collapsedTemplateId: 'collapsed-test-template',
      extendedTemplateId: 'extended-test-template',
      eventDispatcher: eventDispatcher,
      data: "Foo bar data"
    });
  });

  describe("__constructor(options)", function() {
    it("should require two templates, one for each state, an event dispatcher and the data", function() {
      (function() {
        env.create(Consoloid.Ui.List.Factory.CollapsingElement, {
          extendedTemplateId: 'collapsed-test-template',
          eventDispatcher: eventDispatcher,
          data: "Foo bar data"
        });
      }).should.throwError();

      (function() {
        env.create(Consoloid.Ui.List.Factory.CollapsingElement, {
          collapsedTemplateId: 'collapsed-test-template',
          eventDispatcher: eventDispatcher,
          data: "Foo bar data"
        });
      }).should.throwError();

      (function() {
        env.create(Consoloid.Ui.List.Factory.CollapsingElement, {
          collapsedTemplateId: 'collapsed-test-template',
          extendedTemplateId: 'extended-test-template',
          data: "Foo bar data"
        });
      }).should.throwError();

      (function() {
        env.create(Consoloid.Ui.List.Factory.CollapsingElement, {
          collapsedTemplateId: 'collapsed-test-template',
          extendedTemplateId: 'extended-test-template',
          eventDispatcher: eventDispatcher
        });
      }).should.throwError();
    });
  });

  describe("render()", function() {
    beforeEach(function() {
      env.readTemplate(__dirname + '/../templates.jqote', 'utf8');
      $(document.body).append($('\
        <script id="collapsed-test-template" type="text/x-jqote-template">\
          <div style="height: 40px"><%= this.data %></div>\
        </script>\
        <script id="extended-test-template" type="text/x-jqote-template">\
          <div style="height: 99px"><%= this.data %></div>\
        </script>'
      ));

      element.render();
    });

    it("should render both templates, but hide the extended one", function() {
      element.node.find(".collapsed").text().should.equal("Foo bar data");
      element.node.find(".extended").text().should.equal("Foo bar data");

      element.node.find(".extended").hide.called.should.be.ok;
    });

    it("should add event listener to the more icon, that shows the extended state of the element", function() {
      element.node.find(".more").click();

      element.node.find(".collapsed").fadeOut.called.should.be.ok;
      element.node.find(".extended").show.called.should.be.ok;
    });

    it("should add event listener to the less icon, that shows the collapsed state of the element", function() {
      element.node.find(".extended").show();
      element.node.find(".collapsed").hide();

      element.node.find(".less").click();

      element.node.find(".collapsed").show.called.should.be.ok;
      element.node.find(".extended").hide.called.should.be.ok;
    });

    it("should add event listener to the scrolling event of the event dispatcher, that shows the collapsed state of the element", function() {
      eventDispatcher.bind.calledWith("scroll-state-changed").should.be.ok;

      element.node.find(".extended").show();
      element.node.find(".collapsed").hide();

      eventDispatcher.bind.args[0][1]();

      element.node.find(".collapsed").hide.called.should.be.ok;
      element.node.find(".extended").show.called.should.be.ok;
    });

    afterEach(function() {
      $.fn.is.restore();
      $.fn.show.restore();
      $.fn.hide.restore();
      $.fn.fadeOut.restore();
      $.fn.animate.restore();
    });
  });

});
