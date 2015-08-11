require("consoloid-framework/Consoloid/Widget/Widget");
require('../Base.js');
require("consoloid-framework/Consoloid/Widget/JQoteTemplate");
require('consoloid-framework/Consoloid/Widget/jquery.jqote2.min.js');
require("consoloid-framework/Consoloid/Error/UserMessage");
require('consoloid-framework/Consoloid/Test/UnitTest');

describeUnitTest('Consoloid.Ui.List.View.Base', function() {
  var
    translator,
    cssLoader,
    dataSource,
    factory,
    eventDispatcher,
    list,
    clock;

  beforeEach(function() {
    clock = sinon.useFakeTimers();
    translator = { trans: function(msg) { return msg; } };
    env.addServiceMock('translator', translator);
    cssLoader = { load: sinon.spy() };
    env.addServiceMock('css_loader', cssLoader);

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

    eventDispatcher = {
      trigger: sinon.spy(),
      bind: sinon.spy()
    };

    list = env.create(Consoloid.Ui.List.View.Base, {
      dataSource: dataSource,
      radius: 2,
      numPerPage: 10,
      factory: factory,
      node: $('<div />'),
      eventDispatcher: eventDispatcher
    });

    sinon.stub($.fn, 'hide', function(){ return $.fn; });
    sinon.stub($.fn, 'fadeIn', function(){});
  });

  describe("#__constructor(options)", function() {
    it("should require a datasource, elements per page and an element factory, a radius of minimum 0", function() {
      (function() {
        env.create(Consoloid.Ui.List.View.Base, { numPerPage: 10, factory: factory });
      }).should.throwError();

      (function() {
        env.create(Consoloid.Ui.List.View.Base, { dataSource: dataSource, factory: factory });
      }).should.throwError();

      (function() {
        env.create(Consoloid.Ui.List.View.Base, { dataSource: dataSource, numPerPage: 10 });
      }).should.throwError();

      (function() {
        env.create(Consoloid.Ui.List.View.Base, { dataSource: dataSource, numPerPage: 10, factory: factory, radius: -4 });
      }).should.throwError();
    });
  });

  describe("#render()", function() {
    it("should call this.setFilterValues, with empty filters", function() {
      list.setFilterValues = sinon.spy();
      list.render();

      list.setFilterValues.calledOnce.should.be.ok;
      $.isEmptyObject(list.setFilterValues.args[0][0]).should.be.ok;
    });
  });

  describe("#setFilterValues(filterValues)", function() {
    it("should reset page offset and current page", function() {
      list.__renderCompleteListAfterSetFilterValues = sinon.spy();
      list.currentPage = 4;
      list.pageOffset = 3;

      list.setFilterValues({});

      list.currentPage.should.equal(0);
      list.pageOffset.should.equal(0);
    });

    it("should render a throbber and start loading data from dataSource", function() {
      sinon.stub(list, "setFilterValues");
      list.render();
      list.setFilterValues.restore();

      list.setFilterValues({});
      list.node.find(".throbber").length.should.equal(1);

      dataSource.setFilterValues.calledOnce.should.be.ok;
    });

    it("should call __renderCompleteListAfterSetFilterValues when data arrives from dataSource", function() {
      list.__renderCompleteListAfterSetFilterValues = sinon.spy();
      list.setFilterValues({});

      dataSource.setFilterValues.args[0][0]();

      list.__renderCompleteListAfterSetFilterValues.calledOnce.should.be.ok;
    });

    it("should load page 2 × radius + 1 pages", function() {
      list.__renderCompleteListAfterSetFilterValues = sinon.spy();
      list.setFilterValues({});

      dataSource.setFilterValues.args[0][2].should.equal(0);
      dataSource.setFilterValues.args[0][3].should.equal(49);
    });

    it("should give the filterValues argument to the data source", function() {
      list.setFilterValues({ name: "foo" });
      list.dataSource.setFilterValues.args[0][1].name.should.equal("foo");
    });
  });

  describe("#__renderCompleteListAfterSetFilterValues(err, result)", function() {
    beforeEach(function() {
      list.render();
      list.__renderCompleteList = sinon.spy();
      list.__renderCompleteListAfterSetFilterValues(undefined, { count: 2, data: [ 'foo', 'bar' ] });
    });

    it("should set the count", function() {
      list.count.should.equal(2);
    });

    it("should call __renderCompleteList", function() {
      list.__renderCompleteList.called.should.be.ok;
      list.__renderCompleteList.args[0][0][0].should.equal('foo');
      list.__renderCompleteList.args[0][0][1].should.equal('bar');
    });
  });

  describe("#__renderCompleteList(data)", function() {
    beforeEach(function() {
      list.render();
    });

    it("should remove the throbber", function() {
      list.__renderCompleteList([ 1 ]);

      list.node.find('.list-wrapper .throbber').length.should.equal(0);
    });

    it("should show message if no elements were rendered", function() {
      list.__renderCompleteList([]);

      list.node.find('.list-wrapper .empty-message').length.should.equal(1);
    }),

    it("should add a fade in effect when rendering", function() {
      list.__renderCompleteList([ 1 ]);

      $.fn.fadeIn.calledOnce.should.be.ok;
    }),

    it("should adjust its height according to num per page and list element height", function() {
      list.render();
      list.__renderCompleteList([ 1 ]);
      clock.tick(1);

      list.node.find('.list-wrapper').innerHeight().should.equal(400);
      eventDispatcher.trigger.calledWith('size-changed').should.be.ok;
    });

    it("should scroll to top and set default state", function() {
      sinon.stub($.fn, 'scroll', function(){});
      sinon.stub($.fn, 'scrollTop', function(){ return $.fn; });

      list.__renderCompleteList([ 1 ]);

      $.fn.scroll.calledOnce.should.be.ok;
      $.fn.scrollTop.calledWith(0).should.be.ok;

      list.scrollState.should.equal("none");

      $.fn.scrollTop.restore();
      $.fn.scroll.restore();
    });

    it("should render elements received from dataSource", function() {
      list.__renderCompleteList([ 1 ]);

      factory.render.calledOnce.should.be.true;
      list.node.find(".list-element-index-0").length.should.equal(1);
      list.node.find(".list-element-index-0").html().should.equal('1');
    });

    it("should render elements in order", function() {
      list.__renderCompleteList([ 1, 2 ]);

      factory.render.calledTwice.should.be.true;
      list.node.find(".list-element")[0].should.equal(list.node.find(".list-element-index-0")[0]);
      list.node.find(".list-element")[1].should.equal(list.node.find(".list-element-index-1")[0]);
      list.node.find(".list-element-index-0").html().should.equal('1');
      list.node.find(".list-element-index-1").html().should.equal('2');
    });
  });

  describe("#__setScrollState(state)", function() {
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
    });

    it("should set the state", function() {
      list.__setScrollState("foobar");
      list.scrollState.should.equal("foobar");
    });

    it("should call scroll-state-changed event", function() {
      list.__setScrollState("foobar");
      eventDispatcher.trigger.calledWith("scroll-state-changed").should.be.ok;
      eventDispatcher.trigger.args[0][1][0].should.equal("foobar");
    });
  });

  describe("#getScrollState()", function() {
    it("should return with scroll state", function() {
      list.__setScrollState("foobar");
      list.getScrollState().should.equal("foobar");
    });
  })

  describe("#__adjustScrolledList()", function() {
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
      sinon.spy($.fn, 'animate');
      clock.tick(1);
    });

    it("should set and unset the scrolling state to adjusting", function() {
      sinon.spy(list, '__setScrollState');
      list.__adjustScrolledList();

      list.__setScrollState.calledWith("adjusting").should.be.ok;
      list.__setScrollState.calledWith("none").should.be.ok;
    });

    it("should animate small up-down scroll so only fixed number of elements are shown", function() {
      list.node.find('.list-wrapper').scrollTop(19);
      list.__adjustScrolledList();

      list.node.animate.args[0][0].scrollTop.should.equal(0);

      list.node.find('.list-wrapper').scrollTop(20);
      list.__adjustScrolledList();

      list.node.animate.args[1][0].scrollTop.should.equal(40);
    });

    it("should not animate the small adjustment if it's not needed ", function() {
      list.node.find('.list-wrapper').scrollTop(40);
      list.__adjustScrolledList();

      list.node.animate.called.should.not.be.ok;
    });

    afterEach(function() {
      $.fn.animate.restore();
    });
  });

  describe("#__listScrolled()", function() {
    var
      oneElementHeight = 40,
      onePageHeight = 400;

    beforeEach(function() {
      list.render();
      list.__renderCompleteListAfterSetFilterValues(undefined, {
        count: 80,
        data: [
          0, 1, 2, 3, 4, 5, 6, 7, 8, 9,
          10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
          20, 21, 22, 23, 24, 25, 26, 27, 28, 29,
          30, 31, 32, 33, 34, 35, 36, 37, 38, 39,
          40, 41, 42, 43, 44, 45, 46, 47, 48, 49,
        ]
      });
      clock.tick(1);
    });

    it("should trigger page changed event", function() {
      list.node.find('.list-wrapper').scrollTop(0.5 * onePageHeight);
      list.__listScrolled();

      eventDispatcher.trigger.calledWith('page-changed').should.be.ok;
    });

    it("should load elements if nearing page radius", function() {
      function testSettingScrollTopStartsToRetrieveRangeFromDataSource(testConfiguration) {
        var
          scrollTopInPage = testConfiguration.scrollToPage,
          expectedStartIndex = testConfiguration.expectedStartIndex,
          expectedLastIndex = testConfiguration.expectedLastIndex;
        list.node.find('.list-wrapper').scrollTop(scrollTopInPage * onePageHeight);
        list.__listScrolled();

        dataSource.getDataByRange.calledOnce.should.be.ok;
        (typeof dataSource.getDataByRange.args[0][0]).should.equal("function");
        dataSource.getDataByRange.args[0][1].should.equal(expectedStartIndex);
        dataSource.getDataByRange.args[0][2].should.equal(expectedLastIndex);
        dataSource.getDataByRange.reset();
      }

      testSettingScrollTopStartsToRetrieveRangeFromDataSource({
        scrollToPage: 3,
        expectedStartIndex: 50,
        expectedLastIndex: 59
      });
      testSettingScrollTopStartsToRetrieveRangeFromDataSource({
        scrollToPage: 4,
        expectedStartIndex: 50,
        expectedLastIndex: 69
      });
      testSettingScrollTopStartsToRetrieveRangeFromDataSource({
        scrollToPage: 4.8,
        expectedStartIndex: 50,
        expectedLastIndex: 79
      });

      list.pageOffset = 3;

      testSettingScrollTopStartsToRetrieveRangeFromDataSource({
        scrollToPage: 1,
        expectedStartIndex: 20,
        expectedLastIndex: 29
      });
      testSettingScrollTopStartsToRetrieveRangeFromDataSource({
        scrollToPage: 0,
        expectedStartIndex: 10,
        expectedLastIndex: 29
      });
    });

    it("should work well even with multiple async requests to the dataSource", function() {
      list.node.find('.list-wrapper').scrollTop(3 * onePageHeight);
      list.__listScrolled();

      list.node.find('.list-wrapper').scrollTop(4 * onePageHeight);
      list.__listScrolled();

      dataSource.getDataByRange.args[0][0](undefined, [50, 51, 52, 53, 54, 55, 56, 57, 58, 59]);

      list.node.find('.list-wrapper').scrollTop().should.equal(3 * onePageHeight);
      list.node.find('.list-wrapper .list-element')[30].innerHTML.should.equal('40');

      dataSource.getDataByRange.args[1][0](undefined, [50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69]);

      list.node.find('.list-wrapper').scrollTop().should.equal(2 * onePageHeight);
      list.node.find('.list-wrapper .list-element')[20].innerHTML.should.equal('40');
    });

    it("should not render pages from callback if they are not relevant anymore at all", function() {
      list.node.find('.list-wrapper').scrollTop(4.5 * onePageHeight);
      list.__listScrolled();

      dataSource.getDataByRange.args[0][0](undefined, [50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79]);
      list.node.find('.list-wrapper').scrollTop().should.equal(600);
      list.node.find('.list-wrapper .list-element')[15].innerHTML.should.equal('45');

      list.node.find('.list-wrapper').scrollTop(0);
      list.__listScrolled();

      list.node.find('.list-wrapper').scrollTop(1600);
      list.__listScrolled();

      dataSource.getDataByRange.args[1][0](undefined, [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29]);

      list.node.find('.list-wrapper .list-element-index-10').length.should.equal(0);
      list.node.find('.list-wrapper .list-element-index-20').length.should.equal(0);
      list.node.find('.list-wrapper .list-element-index-30').length.should.equal(1);
      list.node.find('.list-wrapper .list-element-index-40').length.should.equal(1);
      list.node.find('.list-wrapper .list-element-index-50').length.should.equal(1);
      list.node.find('.list-wrapper .list-element-index-60').length.should.equal(1);
      list.node.find('.list-wrapper .list-element-index-70').length.should.equal(1);
    });

  });

  describe("#getCurrentPage()", function() {
    it("should return with the current page rounded according to the number of elements", function() {
      list.currentPage = 4.23;
      list.getCurrentPage().should.equal(4.2);
    });
  });


  describe("#setPage(page)", function() {
    var
      oneElementHeight = 40,
      onePageHeight = 400,
      listNode;

    beforeEach(function() {
      list.render();
      listNode = list.list;

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

      sinon.spy(list, '__adjustScrolledList');
      clock.tick(1);
    });

    it("should throw on invalid page", function() {
      (function() {
        list.setPage(-4);
      }).should.throwError(Consoloid.Error.UserMessage);

      (function() {
        list.setPage(2000);
      }).should.throwError(Consoloid.Error.UserMessage);
    });

    it('should set scroll state to "setpage" on nearbay scroll', function() {
      sinon.spy(list, "__setScrollState");
      list.setPage(2);
      list.__setScrollState.calledWith("setpage").should.be.ok;
    });

    it("should trigger page changed event on faraway scroll", function() {
      list.setPage(7);
      eventDispatcher.trigger.calledWith('page-changed').should.be.ok;
    });

    it("should set currentPage, load and render elements if far away page was requested", function() {
      list.setPage(7);

      list.currentPage.should.equal(7);
      dataSource.getDataByRange.called.should.be.ok;
      dataSource.getDataByRange.args[0][0](undefined,  [
                                                        50, 51, 52, 53, 54, 55, 56, 57, 58, 59,
                                                        60, 61, 62, 63, 64, 65, 66, 67, 68, 69,
                                                        70, 71, 72, 73, 74, 75, 76, 77, 78, 79,
                                                        80, 81, 82, 83, 84, 85, 86, 87, 88, 89,
                                                        90, 91, 92, 93, 94, 95, 96, 97, 98, 99,
                                                      ]);

      listNode.children().length.should.equal(50);

      list.node.find('.list-wrapper .list-element-index-50').length.should.equal(1);
      list.node.find('.list-wrapper .list-element-index-60').length.should.equal(1);
      list.node.find('.list-wrapper .list-element-index-70').length.should.equal(1);
      list.node.find('.list-wrapper .list-element-index-80').length.should.equal(1);
      list.node.find('.list-wrapper .list-element-index-90').length.should.equal(1);
      list.__adjustScrolledList.calledOnce.should.be.ok;
    });

    it("should set current page to the last possible page after jumping to last page, which isn't a full page", function() {
      list.__renderCompleteListAfterSetFilterValues(undefined, {
        count: 103,
        data: [
          0, 1, 2, 3, 4, 5, 6, 7, 8, 9,
          10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
          20, 21, 22, 23, 24, 25, 26, 27, 28, 29,
          30, 31, 32, 33, 34, 35, 36, 37, 38, 39,
          40, 41, 42, 43, 44, 45, 46, 47, 48, 49,
        ]
      });

      list.setPage(10);

      list.currentPage.should.equal(9.3);
      dataSource.getDataByRange.called.should.be.ok;
      dataSource.getDataByRange.args[0][1].should.equal(53);
      dataSource.getDataByRange.args[0][2].should.equal(102);
      dataSource.getDataByRange.args[0][0](undefined,  [
                                                                    53, 54, 55, 56, 57, 58, 59,
                                                        60, 61, 62, 63, 64, 65, 66, 67, 68, 69,
                                                        70, 71, 72, 73, 74, 75, 76, 77, 78, 79,
                                                        80, 81, 82, 83, 84, 85, 86, 87, 88, 89,
                                                        90, 91, 92, 93, 94, 95, 96, 97, 98, 99,
                                                        100, 101, 102
                                                      ]);

      list.currentPage.should.equal(9.3);
    });

    it("should detach eventlisteners and draw a throbber temporarily if far away page was requested", function() {
      sinon.spy(listNode, 'unbind');
      list.setPage(7);

      listNode.unbind.calledWith("scroll").should.be.ok;

      listNode.find(".throbber").length.should.equal(1);
    });

    it("should not try to find and manually remove elements one by one when faraway page jump", function() {
      sinon.spy($.fn, "remove");
      list.setPage(7);
      dataSource.getDataByRange.args[0][0](undefined,  [
                                                        50, 51, 52, 53, 54, 55, 56, 57, 58, 59,
                                                        60, 61, 62, 63, 64, 65, 66, 67, 68, 69,
                                                        70, 71, 72, 73, 74, 75, 76, 77, 78, 79,
                                                        80, 81, 82, 83, 84, 85, 86, 87, 88, 89,
                                                        90, 91, 92, 93, 94, 95, 96, 97, 98, 99,
                                                      ]);

      $.fn.remove.called.should.not.be.ok;

      $.fn.remove.restore();
    });

    it("should render only for the last setPage call if far away page was requested", function() {
      list.setPage(5);
      list.setPage(6);
      list.setPage(7);

      dataSource.getDataByRange.args[0][0](undefined,  [
                                                        "bad", "bad", "bad", "bad", "bad", "bad", "bad", "bad", "bad", "bad",
                                                        "bad", "bad", "bad", "bad", "bad", "bad", "bad", "bad", "bad", "bad",
                                                        "bad", "bad", "bad", "bad", "bad", "bad", "bad", "bad", "bad", "bad",
                                                        "bad", "bad", "bad", "bad", "bad", "bad", "bad", "bad", "bad", "bad",
                                                        "bad", "bad", "bad", "bad", "bad", "bad", "bad", "bad", "bad", "bad",
                                                      ]);
      dataSource.getDataByRange.args[1][0](undefined,  [
                                                        "bad", "bad", "bad", "bad", "bad", "bad", "bad", "bad", "bad", "bad",
                                                        "bad", "bad", "bad", "bad", "bad", "bad", "bad", "bad", "bad", "bad",
                                                        "bad", "bad", "bad", "bad", "bad", "bad", "bad", "bad", "bad", "bad",
                                                        "bad", "bad", "bad", "bad", "bad", "bad", "bad", "bad", "bad", "bad",
                                                        "bad", "bad", "bad", "bad", "bad", "bad", "bad", "bad", "bad", "bad",
                                                      ]);
      dataSource.getDataByRange.args[2][0](undefined,  [
                                                        "good", "good", "good", "good", "good", "good", "good", "good", "good", "good",
                                                        "good", "good", "good", "good", "good", "good", "good", "good", "good", "good",
                                                        "good", "good", "good", "good", "good", "good", "good", "good", "good", "good",
                                                        "good", "good", "good", "good", "good", "good", "good", "good", "good", "good",
                                                        "good", "good", "good", "good", "good", "good", "good", "good", "good", "good"
                                                      ]);

      factory.render.calledWith("bad").should.not.be.ok;

      for (var i = 0; i < 50; i++) {
        listNode.children()[i].innerHTML.should.equal("good");
      }
    });

    it("should not allow render of any other data than the last faraway jump request", function() {
      list.setPage(3);
      list.__listScrolled();
      list.setPage(4);
      list.__listScrolled();

      list.setPage(5);

      dataSource.getDataByRange.args[0][0](undefined,  [
                                                        "bad", "bad", "bad", "bad", "bad", "bad", "bad", "bad", "bad", "bad",
                                                        "bad", "bad", "bad", "bad", "bad", "bad", "bad", "bad", "bad", "bad",
                                                      ]);
      dataSource.getDataByRange.args[1][0](undefined,  [
                                                        "bad", "bad", "bad", "bad", "bad", "bad", "bad", "bad", "bad", "bad",
                                                        "bad", "bad", "bad", "bad", "bad", "bad", "bad", "bad", "bad", "bad",
                                                      ]);
      dataSource.getDataByRange.args[2][0](undefined,  [
                                                        "good", "good", "good", "good", "good", "good", "good", "good", "good", "good",
                                                        "good", "good", "good", "good", "good", "good", "good", "good", "good", "good",
                                                        "good", "good", "good", "good", "good", "good", "good", "good", "good", "good",
                                                        "good", "good", "good", "good", "good", "good", "good", "good", "good", "good",
                                                        "good", "good", "good", "good", "good", "good", "good", "good", "good", "good"
                                                      ]);


      factory.render.calledWith("bad").should.not.be.ok;

      for (var i = 0; i < 50; i++) {
        listNode.children()[i].innerHTML.should.equal("good");
      }
    });

    it("should work well on both ends of the datasource", function() {
      list.setPage(8);
      dataSource.getDataByRange.args[0][1].should.equal(50);
      dataSource.getDataByRange.args[0][2].should.equal(99);

      dataSource.getDataByRange.args[0][0](undefined,  [
                                                        "5", "5", "5", "5", "5", "5", "5", "5", "5", "5",
                                                        "6", "6", "6", "6", "6", "6", "6", "6", "6", "6",
                                                        "7", "7", "7", "7", "7", "7", "7", "7", "7", "7",
                                                        "8", "8", "8", "8", "8", "8", "8", "8", "8", "8",
                                                        "9", "9", "9", "9", "9", "9", "9", "9", "9", "9",
                                                      ]);

      var indexOfTheFirstElementTheUserSees = listNode.scrollTop() / onePageHeight * 10;
      for (var i = indexOfTheFirstElementTheUserSees; i < indexOfTheFirstElementTheUserSees + 10; i++) {
        listNode.children()[i].innerHTML.should.equal("8");
      }

      list.setPage(1);
      dataSource.getDataByRange.args[1][1].should.equal(00);
      dataSource.getDataByRange.args[1][2].should.equal(49);

      dataSource.getDataByRange.args[1][0](undefined,  [
                                                        "0", "0", "0", "0", "0", "0", "0", "0", "0", "0",
                                                        "1", "1", "1", "1", "1", "1", "1", "1", "1", "1",
                                                        "2", "2", "2", "2", "2", "2", "2", "2", "2", "2",
                                                        "3", "3", "3", "3", "3", "3", "3", "3", "3", "3",
                                                        "4", "4", "4", "4", "4", "4", "4", "4", "4", "4",
                                                      ]);

      indexOfTheFirstElementTheUserSees = listNode.scrollTop()/onePageHeight * 10;
      for (var i = indexOfTheFirstElementTheUserSees; i < indexOfTheFirstElementTheUserSees + 10; i++) {
        listNode.children()[i].innerHTML.should.equal("1");
      }
    });

    it("should work normally when trying to jump to a fragment after the last page", function() {
      list.setPage(9);

      dataSource.getDataByRange.args[0][0](undefined,  [
                                                        "5", "5", "5", "5", "5", "5", "5", "5", "5", "5",
                                                        "6", "6", "6", "6", "6", "6", "6", "6", "6", "6",
                                                        "7", "7", "7", "7", "7", "7", "7", "7", "7", "7",
                                                        "8", "8", "8", "8", "8", "8", "8", "8", "8", "8",
                                                        "9", "9", "9", "9", "9", "9", "9", "9", "9", "9",
                                                      ]);

      list.setPage(9.1);

      dataSource.getDataByRange.calledOnce.should.be.ok;
    });

    it("should scroll to page if it's near", function() {
      sinon.spy(listNode, 'stop');
      sinon.spy(listNode, 'animate');
      list.setPage(Math.PI);
      listNode.stop.called.should.be.ok;
      listNode.animate.called.should.be.ok;
      listNode.animate.args[0][0].scrollTop.should.equal(Math.PI * onePageHeight);

      list.__adjustScrolledList.calledOnce.should.be.ok;
    });

    /*TODO: This unit test sometimes works sometimes does not. Fix it or remove it.*/
    xit("should work well even if new pages were loaded into widget while scrolling to nearby page", function() {
      var clock = sinon.useFakeTimers();
      sinon.spy(listNode, 'animate');

      list.setPage(4);
      clock.tick(234);
      list.__listScrolled();
      clock.tick(78);
      list.__listScrolled();

      dataSource.getDataByRange.calledTwice.should.be.ok;
      dataSource.getDataByRange.args[0][0](undefined,  ["5foo", "5foo", "5foo", "5foo", "5foo", "5foo", "5foo", "5foo", "5foo", "5foo"]);
      dataSource.getDataByRange.args[1][0](undefined,  [
                                                        "5bar", "5bar", "5bar", "5bar", "5bar", "5bar", "5bar", "5bar", "5bar", "5bar",
                                                        "6bar", "6bar", "6bar", "6bar", "6bar", "6bar", "6bar", "6bar", "6bar", "6bar",
                                                      ]);

      clock.tick(400);

      var indexOfTheFirstElementTheUserSees = Math.round(listNode.scrollTop() / onePageHeight * 10);

      for (var i = indexOfTheFirstElementTheUserSees; i < indexOfTheFirstElementTheUserSees + 10; i++) {
        listNode.children()[i].innerHTML.should.equal((i + 20).toString());
      }

      clock.restore();
    });
  });

  describe("#getPageCount()", function() {
    it("should return with number of pages", function() {
      list.numPerPage = 2
      list.render();
      list.__renderCompleteListAfterSetFilterValues(undefined, { count: 9, data: [ 0, 1, 2, 3, 4, 5, 6, 7, 8 ] });

      list.getPageCount().should.equal(5);
    });
  });

  describe("#getLastPossiblePage()", function() {
    it("should return with last possible page, let that be not integer page number even", function() {
      list.count = 103;

      list.getLastPossiblePage().should.equal(9.3);
    });
  });

  afterEach(function() {
    clock.restore();
    $.fn.hide.restore();
    $.fn.fadeIn.restore();
  });
});
