require('consoloid-framework/Consoloid/Widget/jquery.jqote2.min.js');
require('consoloid-framework/Consoloid/Widget/JQoteTemplate');
require("consoloid-framework/Consoloid/Widget/Widget");
require('../BaseFilterWidget.js');
require('consoloid-framework/Consoloid/Test/UnitTest');

describeUnitTest('Consoloid.Ui.List.BaseFilterWidget', function() {
  var
    widget,
    eventDispatcher;

  beforeEach(function() {
    global.__ = function(string) {
      return string;
    };

    env.readTemplate(__dirname + '/../templates.jqote', 'utf8');
    eventDispatcher = {
      bind: sinon.stub(),
      trigger: sinon.stub()
    };

    sinon.stub($.fn, 'slideDown', function(){});
    sinon.stub($.fn, 'slideUp', function(){});

    widget = env.create('Consoloid.Ui.List.BaseFilterWidget', {
      eventDispatcher: eventDispatcher
    });
  });

  describe("#__constructor(options)", function() {
    it("should require an event dispatcher", function() {
      (function() {
        env.create(Consoloid.Ui.List.BaseFilterWidget, {});
      }).should.throwError();
    });

    it('should register on the "filter-values-set" event and show itself on call, with the filter string', function() {
      eventDispatcher.bind.calledWith("filter-values-set").should.be.ok;

      widget.render();
      eventDispatcher.bind.args[0][1]({}, ['boo far', 'foo bar']);
      widget.node.find(".filter-value div").length.should.equal(2);
      widget.node.find(".filter-value div")[0].innerHTML.should.equal("boo far");
      widget.node.find(".filter-value div")[1].innerHTML.should.equal("foo bar");
      $.fn.slideDown.calledOnce.should.be.ok;
    });

    it('should register on the "filters-cleared" event and slide itself up when called', function() {
      eventDispatcher.bind.calledWith("filters-cleared").should.be.ok;

      widget.render();
      eventDispatcher.bind.args[0][1]({}, ['boo far']);
      eventDispatcher.bind.args[1][1]();

      $.fn.slideUp.calledOnce.should.be.ok;
    });

    it('should add click event on the clear button, that dispatches the "clear-filters" event', function() {
      widget.render();
      widget.node.find(".clear-filters").click();

      eventDispatcher.trigger.calledWith("clear-filters").should.be.ok;
    });
  });

  afterEach(function() {
    $.fn.slideDown.restore();
    $.fn.slideUp.restore();

    delete global.__;
  });
});
