require("consoloid-framework/Consoloid/Widget/Widget");
require('../Base.js');
require('../Mousewheel.js');
require('../Kinetic.js');
require('../BoundaryShowing.js');
require("consoloid-framework/Consoloid/Widget/JQoteTemplate");
require('consoloid-framework/Consoloid/Widget/jquery.jqote2.min.js');
require("consoloid-framework/Consoloid/Error/UserMessage");
require('consoloid-framework/Consoloid/Test/UnitTest');

describeUnitTest('Consoloid.Ui.List.View.BoundaryShowing', function() {
  var
    cssLoader,
    dataSource,
    factory,
    list,
    listNode,
    elementHeight = 40,
    pageHeight = 400;

  beforeEach(function() {
    cssLoader = { load: sinon.spy() };
    env.addServiceMock('css_loader', cssLoader);
    jQuery.fn.kinetic = sinon.spy();
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

    list = env.create(Consoloid.Ui.List.View.BoundaryShowing, {
      dataSource: dataSource,
      radius: 2,
      numPerPage: 10,
      factory: factory,
      node: $('<div />')
    });

    list.render();
    listNode = list.list;

    sinon.stub($.fn, 'hide', function(){ return $.fn; });
    sinon.stub($.fn, 'fadeIn', function(){});
  });

  describe("#__renderCompleteList(data, fromIndex)", function() {
    it("should add mouse and touch events for __addStretchAnimationsWhenNeeded to work with kinetic", function() {
      list.__addStretchAnimationsWhenNeeded = sinon.stub();
      sinon.spy(listNode, "bind");
      list.__renderCompleteList(["foo"], 0);

      listNode.bind.calledWith("touchmove.kinetic").should.be.ok;
      listNode.bind.calledWith("mousemove.kinetic").should.be.ok;
      listNode.bind.calledWith("mouseup.kinetic touchend.kinetic mouseleave.kinetic").should.be.ok;

      list.scrollState = "kinetic";
      var
        touchMoveFunction,
        mouseMoveFunction,
        endFunction;

      $.each(listNode.bind.args, function(index, arg) {
        switch (arg[0]) {
          case "touchmove.kinetic":
            touchMoveFunction = arg[1];
            break;
          case "mousemove.kinetic":
            mouseMoveFunction = arg[1];
            break;
          case "mouseup.kinetic touchend.kinetic mouseleave.kinetic":
            endFunction = arg[1];
            break;
        }
      });
      mouseMoveFunction({ pageY: 0 });
      mouseMoveFunction({ pageY: 10 });
      list.__addStretchAnimationsWhenNeeded.calledWith(10).should.be.ok;

      endFunction();

      touchMoveFunction({ originalEvent: { changedTouches: [{ pageY: 0 }] }, preventDefault: sinon.spy() });
      touchMoveFunction({ originalEvent: { changedTouches: [{ pageY: 20 }] }, preventDefault: sinon.spy() });
      list.__addStretchAnimationsWhenNeeded.calledWith(20).should.be.ok;

    });
  });

  describe("#__renderElements(fromIndex, data)", function() {
    var tenFoos = ["foo", "foo", "foo", "foo", "foo", "foo", "foo", "foo", "foo", "foo"];
    it("should add or remove the throbbers when nearing/leaving the limits", function() {
      list.count = 100;

      list.__renderElements(0, tenFoos.concat(tenFoos, tenFoos, tenFoos, tenFoos));
      listNode.find('.list-top-throbber').length.should.equal(0);
      listNode.find('.list-bottom-throbber').length.should.equal(1);

      list.currentPage = 4;
      list.__renderElements(50, tenFoos);

      listNode.find('.list-top-throbber').length.should.equal(1);
      listNode.find('.list-bottom-throbber').length.should.equal(1);

      list.currentPage = 9;
      list.__renderElements(60, tenFoos.concat(tenFoos, tenFoos, tenFoos));

      listNode.find('.list-top-throbber').length.should.equal(1);
      listNode.find('.list-bottom-throbber').length.should.equal(0);

      list.currentPage = 4;
      list.__renderElements(20, tenFoos.concat(tenFoos, tenFoos));

      listNode.find('.list-top-throbber').length.should.equal(1);
      listNode.find('.list-bottom-throbber').length.should.equal(1);
    });

    it("should not add throbbers to end if number of elements do not match number of pages × numPerPage", function() {
      list.count = 101;
      list.currentPage = 8;

      list.__renderElements(51, tenFoos.concat(tenFoos, tenFoos, tenFoos, tenFoos));
      listNode.find('.list-top-throbber').length.should.equal(1);
      listNode.find('.list-bottom-throbber').length.should.equal(0);
    });
  });

  describe("#__addStretchAnimationsWhenNeeded(scrollDelta)", function() {
    beforeEach(function() {
      list.__renderCompleteListAfterSetFilterValues(undefined, {
        count: 14,
        data: [
          0, 1, 2, 3, 4, 5, 6, 7, 8, 9,
          10, 11, 12, 13
        ]
      });

      sinon.spy(jQuery.fn, 'animate');
      sinon.spy(jQuery.fn, 'addClass');
    });

    it("should add stretch class to first/last rendered item, when trying to scroll over the end of data", function() {
      var
        firstElement = listNode.find('.list-element')[0],
        lastElement = listNode.find('.list-element')[13];

      $(firstElement).hasClass('element-stretch-top').should.not.be.ok;
      $(lastElement).hasClass('element-stretch-bottom').should.not.be.ok;

      list.__addStretchAnimationsWhenNeeded(1);
      $.fn.addClass.calledWith('element-stretch-top').should.be.ok;
      $.fn.addClass.thisValues[0][0].should.equal(firstElement);
      $.fn.animate.calledTwice.should.be.ok;
      $(firstElement).hasClass('element-stretch-top').should.not.be.ok;

      listNode.scrollTop(13 * elementHeight);
      list.__listScrolled();
      list.__addStretchAnimationsWhenNeeded(-1);
      $.fn.addClass.calledWith('element-stretch-bottom').should.be.ok;
      $.fn.addClass.thisValues[1][0].should.equal(lastElement);
      $.fn.animate.callCount.should.equal(4);
      $(lastElement).hasClass('element-stretch-bottom').should.not.be.ok;
    });

    it("should add additional downward scrolling at the bottom so full stretch can be seen", function() {
      var clock = sinon.useFakeTimers();
      listNode.scrollTop(13 * elementHeight);
      list.__listScrolled();
      list.__addStretchAnimationsWhenNeeded(-1);

      $.fn.kinetic.calledWith("start").should.be.ok;
      $.fn.kinetic.calledWith("stop").should.not.be.ok;
      $.fn.kinetic.args[1][1].velocityY.should.equal(10);

      clock.tick(1000);
      $.fn.kinetic.calledWith("stop").should.be.ok;

      clock.restore();
    })

    afterEach(function() {
      $.fn.animate.restore();
      $.fn.addClass.restore();
    });
  });

  describe("#__mouseWheelHandler(delta)", function() {
    it("should call __addStretchAnimationsWhenNeeded(delta)", function() {
      list.__addStretchAnimationsWhenNeeded = sinon.stub();

      list.__mouseWheelHandler(1);

      list.__addStretchAnimationsWhenNeeded.calledWith(1).should.be.ok;
    });
  });

  afterEach(function(){
    $.fn.hide.restore();
    $.fn.fadeIn.restore();
  });
});
