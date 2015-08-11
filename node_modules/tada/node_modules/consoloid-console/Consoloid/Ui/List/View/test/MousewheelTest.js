require("consoloid-framework/Consoloid/Widget/Widget");
require('../Base.js');
require('../Mousewheel.js');
require("consoloid-framework/Consoloid/Widget/JQoteTemplate");
require('consoloid-framework/Consoloid/Widget/jquery.jqote2.min.js');
require("consoloid-framework/Consoloid/Error/UserMessage");
require('consoloid-framework/Consoloid/Test/UnitTest');

describeUnitTest('Consoloid.Ui.List.View.Mousewheel', function() {
  var
    cssLoader,
    dataSource,
    factory,
    list,
    clock;

  beforeEach(function() {
    clock = sinon.useFakeTimers();
    cssLoader = { load: sinon.spy() };
    env.addServiceMock('css_loader', cssLoader);
    jQuery.fn.mousewheel = sinon.spy();

    env.readTemplate(__dirname + '/../../templates.jqote', 'utf8');

    dataSource = {
      getDataByRange: sinon.spy(),
      setFilterValues: sinon.spy()
    };

    factory = {
      render: sinon.spy(function(element) {
        return $('<div class="elem' + element + '" style="height: 40px">' + element + '</div>');
      })
    };

    list = env.create(Consoloid.Ui.List.View.Mousewheel, {
      dataSource: dataSource,
      radius: 2,
      numPerPage: 10,
      factory: factory,
      node: $('<div />')
    });

    sinon.stub($.fn, 'hide', function(){ return $.fn; });
    sinon.stub($.fn, 'fadeIn', function(){});
  });

  describe("#__constructor(options)", function() {
    it("should load jquery.mousewheel if not yet loaded", function() {
      var
        resourceLoader = env.get('resource_loader');

      delete jQuery.fn['mousewheel'];

      sinon.stub(resourceLoader, 'getJs').returns(true);

      env.create(Consoloid.Ui.List.View.Mousewheel, {
        dataSource: dataSource,
        numPerPage: 10,
        factory: factory,
      });

      resourceLoader.getJs.calledWith('Consoloid/Ui/List/jquery.mousewheel').should.be.ok;

      resourceLoader.getJs.restore();
    });
  });

  describe("#__renderCompleteList(data)", function() {
    beforeEach(function() {
      list.render();
    });

    it("should add mousewheel scrolling events", function() {
      sinon.spy($.fn, 'bind');

      list.__renderCompleteList([ 1 ]);

      $.fn.bind.calledWith('mousewheel').should.be.ok;
      for (var i = 0; i < $.fn.bind.callCount; i++) {
        var call = $.fn.bind.getCall(i);
        if (call.calledWith("mousewheel")) {
          call.thisValue.selector.should.equal('.list-wrapper');
        }
      }

      $.fn.bind.restore();
    });

    describe("should add event handles event probagation:", function() {
      var
        handler,
        firstElement,
        lastElement,
        event,
        elementHeight = 40;
      beforeEach(function() {
        sinon.spy($.fn, 'bind');
        list.__renderCompleteListAfterSetFilterValues(undefined, {
          count: 14,
          data: [
            0, 1, 2, 3, 4, 5, 6, 7, 8, 9,
            10, 11, 12, 13
          ]
        });

        handler = $.fn.bind.args[0][1];

        firstElement = list.list.find('.list-element')[0];
        lastElement = list.list.find('.list-element')[13];

        event = {
          stopPropagation: sinon.stub()
        };
      });

      it("should not allow event propagation if list is not at the or bottom of the list", function() {
        list.list.scrollTop(5 * elementHeight);
        list.__listScrolled();

        var result = handler(event, 1);

        result.should.not.be.ok;
        event.stopPropagation.called.should.be.ok;
      });

      it("should allow event propagation if list is at the top of the list or bottom of the list", function() {
        var result = handler(event, 1);

        result.should.be.ok;
        event.stopPropagation.called.should.not.be.ok;

        list.list.scrollTop(13 * elementHeight);
        list.__listScrolled();

        result = handler(event, -1);

        result.should.be.ok;
        event.stopPropagation.called.should.not.be.ok;
      });

      afterEach(function() {
        $.fn.bind.restore();
      });
    });
  });

  describe("#__mouseWheelHandler", function() {
    beforeEach(function() {
      list.render();
      list.__renderCompleteListAfterSetFilterValues(undefined, {
        count: 20,
        data: [
          0, 1, 2, 3, 4, 5, 6, 7, 8, 9,
          10, 11, 12, 13, 14, 15, 16, 17, 18, 19
        ]
      });

      // Note: node module does not set scroll height after rendering items
      list.list[0].scrollHeight = 800;
      clock.tick(1);
    });

    it("should set the scrolling state to mousewheel", function() {
      list.list.animate = sinon.spy();

      list.__mouseWheelHandler(-1);
      list.scrollState.should.equal('mousewheel');
    });

    it("should stop last animation, then scroll to new target", function() {
      var listNode = list.list;
      sinon.spy(listNode, 'stop');
      sinon.spy(listNode, 'animate');

      list.__mouseWheelHandler(-1);
      list.__mouseWheelHandler(-1);
      list.__mouseWheelHandler(-1);
      list.__mouseWheelHandler(1);
      list.__mouseWheelHandler(-1);

      listNode.stop.called.should.be.ok;
      listNode.animate.called.should.be.ok;
      listNode.animate.args[0][0].scrollTop.should.equal(40);
      listNode.animate.args[1][0].scrollTop.should.equal(80);
      listNode.animate.args[2][0].scrollTop.should.equal(120);
      listNode.animate.args[3][0].scrollTop.should.equal(80);
      listNode.animate.args[4][0].scrollTop.should.equal(120);
    });

    it("should call __adjustScrolledList", function() {
      sinon.spy(list, '__adjustScrolledList');

      list.__mouseWheelHandler(-1);
      list.__adjustScrolledList.calledOnce.should.be.ok;
    });

    it("should not animate if one tries to scroll out of the data", function() {
      var listNode = list.list;
      sinon.spy(listNode, 'animate');

      list.__mouseWheelHandler(1);
      listNode.animate.called.should.not.be.ok;

      list.__mouseWheelHandler(-10);
      listNode.animate.called.should.be.ok;

      listNode.animate.reset();
      list.__mouseWheelHandler(-1);
      listNode.animate.called.should.not.be.ok;
    });
  });

  describe("#setPage(page)", function() {
    var
      oneElementHeight = 40,
      onePageHeight = 400,
      listNode;

    beforeEach(function() {
      list.render();
      list.__renderCompleteListAfterSetFilterValues(undefined, {
        count: 100,
        data: [
          0, 1, 2, 3, 4, 5, 6, 7, 8, 9,
          10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
          20, 21, 22, 23, 24, 25, 26, 27, 28, 29,
          30, 31, 32, 33, 34, 35, 36, 37, 38, 39,
          40, 41, 42, 43, 44, 45, 46, 47, 48, 49,
        ]
      });
      listNode = list.list;
      sinon.spy(list, '__adjustScrolledList');
    });

    it("should cancel mousewheel animation", function() {
      list.scrollState = "mousewheel";
      list.targetScrollTop = 555;

      list.setPage(7);

      list.scrollState.should.equal('none');
      (list.targetScrollTop == undefined).should.be.ok;
    });

    it("should detach mousewheel eventlistener if far away page was requested", function() {
      sinon.spy(listNode, 'unbind');
      list.setPage(7);

      listNode.unbind.calledWith("mousewheel").should.be.ok;
    });
  });

  afterEach(function() {
    clock.restore();
    $.fn.hide.restore();
    $.fn.fadeIn.restore();
  });
});
