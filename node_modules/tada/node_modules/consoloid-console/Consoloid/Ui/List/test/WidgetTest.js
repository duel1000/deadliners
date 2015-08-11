require("consoloid-framework/Consoloid/Widget/Widget");
require('../Widget.js');
require("consoloid-framework/Consoloid/Widget/JQoteTemplate");
require('consoloid-framework/Consoloid/Widget/jquery.jqote2.min.js');
require('consoloid-framework/Consoloid/Test/UnitTest');

describeUnitTest('Consoloid.Ui.List.Widget', function() {
  var
    create,
    scrollbar,
    filter,
    filterTokenizer,
    dataSource,
    listView,
    elementFactory,
    list,
    template;

  beforeEach(function() {
    env.readTemplate(__dirname + '/../templates.jqote', 'utf8');
    template = env.create('Consoloid.Widget.JQoteTemplate', {
      id: 'Consoloid-Ui-List-Widget'
    });

    listView = {
      setPage: sinon.stub(),
      getCurrentPage: sinon.stub().returns(5),
      getLastPossiblePage: sinon.stub().returns(8.3),
      getPageCount: sinon.stub().returns(10),
      render: sinon.stub(),
      setFilterValues: sinon.stub(),
      setNode: sinon.spy()
    };

    scrollbar = {
      setPageInfo: sinon.stub(),
      render: sinon.stub(),
      node: $('<div />')
    };

    filter = {
      render: sinon.stub(),
      node: $('<div />')
    };

    filterTokenizer = {
      tokenize: sinon.stub()
    };
    filterTokenizer.tokenize.withArgs('foo: bar').returns({ foo: "bar" });
    filterTokenizer.tokenize.withArgs('bar: foo').returns({ bar: "foo" });

    dataSource = {};

    elementFactory = {};

    create = sinon.stub();
    create.withArgs('Consoloid.Widget.JQoteTemplate').returns(template);
    create.withArgs('Foo.Bar.DataSource').returns(dataSource);
    create.withArgs('Foo.Bar.Factory').returns(elementFactory);
    create.withArgs('Foo.Bar.ListView').returns(listView);
    create.withArgs('Foo.Scroll.Bar').returns(scrollbar);
    create.withArgs('Foo.Bar.Filter').returns(filter);
    create.withArgs('Foo.Bar.FilterTokenizer').returns(filterTokenizer);

    list = env.create(Consoloid.Ui.List.Widget, {
      create: create,
      dataSourceClass: "Foo.Bar.DataSource",
      dataSourceOptions: {
        data: ["foo"]
      },
      factoryClass: "Foo.Bar.Factory",
      factoryOptions: {
        foo: "bar"
      },
      listViewClass: "Foo.Bar.ListView",
      listViewOptions: {
        radius: 2,
        numPerPage: 10
      },
      scrollbarClass: "Foo.Scroll.Bar",
      scrollbarOptions: {
        bar: "foo"
      },
      filterWidgetClass: "Foo.Bar.Filter",
      filterWidgetOptions: {
        name: "foolter"
      },
      filterTokenizerClass: "Foo.Bar.FilterTokenizer",
      filterTokenizerOptions: {
        name: "tokenizbar"
      }
    });
  });

  describe("#__constructor(options)", function() {
    it("should create a list view, with the datasource, element factory," +
        "scrollbar, filter widget and filter tokenizer according to options", function() {
      var getCallWith = function(firstArg) {
        var result;
        $.each(create.args, function(index, call) {
          if (call[0] == firstArg) {
            result = call;
          }
        });

        return result;
      };

      create.calledWith("Foo.Bar.DataSource").should.be.ok;
      create.calledWith("Foo.Bar.Factory").should.be.ok;
      create.calledWith("Foo.Bar.ListView").should.be.ok;
      create.calledWith("Foo.Scroll.Bar").should.be.ok;
      create.calledWith("Foo.Bar.Filter").should.be.ok;
      create.calledWith("Foo.Bar.FilterTokenizer").should.be.ok;

      getCallWith("Foo.Bar.DataSource")[1].data[0].should.equal("foo");
      getCallWith("Foo.Bar.DataSource")[1].container.should.equal(list.container);

      getCallWith("Foo.Bar.Factory")[1].foo.should.equal("bar");
      getCallWith("Foo.Bar.Factory")[1].container.should.equal(list.container);
      getCallWith("Foo.Bar.Factory")[1].eventDispatcher.should.equal(list.eventDispatcher);

      getCallWith("Foo.Bar.ListView")[1].radius.should.equal(2);
      getCallWith("Foo.Bar.ListView")[1].numPerPage.should.equal(10);
      getCallWith("Foo.Bar.ListView")[1].factory.should.equal(elementFactory);
      getCallWith("Foo.Bar.ListView")[1].dataSource.should.equal(dataSource);
      getCallWith("Foo.Bar.ListView")[1].eventDispatcher.should.equal(list.eventDispatcher);
      getCallWith("Foo.Bar.Factory")[1].container.should.equal(list.container);

      getCallWith("Foo.Scroll.Bar")[1].bar.should.equal("foo");
      getCallWith("Foo.Scroll.Bar")[1].eventDispatcher.should.equal(list.eventDispatcher);
      getCallWith("Foo.Scroll.Bar")[1].container.should.equal(list.container);

      getCallWith("Foo.Bar.Filter")[1].name.should.equal("foolter");
      getCallWith("Foo.Bar.Filter")[1].eventDispatcher.should.equal(list.eventDispatcher);
      getCallWith("Foo.Bar.Filter")[1].container.should.equal(list.container);

      getCallWith("Foo.Bar.FilterTokenizer")[1].name.should.equal("tokenizbar");
      getCallWith("Foo.Bar.FilterTokenizer")[1].container.should.equal(list.container);
    });

    it("should be able to work without a scrollbar or filter, but should require" +
        "a list view with a datasource and an element factory", function() {
      (function() {
        env.create(Consoloid.Ui.List.Widget, {
          create: create,
          dataSourceClass: "Foo.Bar.DataSource",
          dataSourceOptions: {
            data: ["foo"]
          },
          factoryClass: "Foo.Bar.Factory",
          factoryOptions: {
            foo: "bar"
          },
          listViewClass: "Foo.Bar.ListView",
          listViewOptions: {
            radius: 2,
            numPerPage: 10
          }
        });
      }).should.not.throwError();

      (function() {
        env.create(Consoloid.Ui.List.Widget, {
          create: create,
          dataSourceClass: "Foo.Bar.DataSource",
          dataSourceOptions: {
            data: ["foo"]
          },
          factoryClass: "Foo.Bar.Factory",
          factoryOptions: {
            foo: "bar"
          },
        });
      }).should.throwError();

      (function() {
        env.create(Consoloid.Ui.List.Widget, {
          create: create,
          dataSourceClass: "Foo.Bar.DataSource",
          dataSourceOptions: {
            data: ["foo"]
          },
          listViewClass: "Foo.Bar.ListView",
          listViewOptions: {
            radius: 2,
            numPerPage: 10
          }
        });
      }).should.throwError();

      (function() {
        env.create(Consoloid.Ui.List.Widget, {
          create: create,
          factoryClass: "Foo.Bar.Factory",
          factoryOptions: {
            foo: "bar"
          },
          listViewClass: "Foo.Bar.ListView",
          listViewOptions: {
            radius: 2,
            numPerPage: 10
          }
        });
      }).should.throwError();
    });

    it("should add paging events to the eventDispatcher", function() {
      list.eventDispatcher.trigger("page-changed");

      listView.getCurrentPage.calledOnce.should.be.ok;
      listView.getLastPossiblePage.calledOnce.should.be.ok;

      scrollbar.setPageInfo.calledOnce.should.be.ok;
      scrollbar.setPageInfo.args[0][0].should.equal(5);
      scrollbar.setPageInfo.args[0][1].should.equal(8.3);

      list.eventDispatcher.trigger("first-page");

      listView.setPage.calledOnce.should.be.ok;
      listView.setPage.calledWith(0).should.be.ok;

      list.eventDispatcher.trigger("previous-page");

      listView.getCurrentPage.calledTwice.should.be.ok;
      listView.setPage.calledTwice.should.be.ok;
      listView.setPage.calledWith(4).should.be.ok;

      list.eventDispatcher.trigger("next-page");

      listView.getCurrentPage.calledThrice.should.be.ok;
      listView.setPage.calledThrice.should.be.ok;
      listView.setPage.calledWith(6).should.be.ok;

      list.eventDispatcher.trigger("last-page");

      listView.getPageCount.calledOnce.should.be.ok;
      listView.setPage.callCount.should.equal(4);
      listView.setPage.calledWith(9).should.be.ok;
    });
  });

  it("should register to the clear-filters event, with a function that calls" +
      "listView's setFilterValues with an empty object, and then trigger the filters-cleared event", function() {
    sinon.spy(list.eventDispatcher, "trigger");
    list.filterStrings = ["foobar"];
    list.filterValues = { foo: "bar" };
    list.eventDispatcher.trigger("clear-filters");

    listView.setFilterValues.calledOnce.should.be.ok;
    $.isEmptyObject(listView.setFilterValues.args[0][0]).should.be.ok;
    list.eventDispatcher.trigger.calledWith("filters-cleared").should.be.ok;
    list.filterStrings.length.should.equal(0);
    $.isEmptyObject(list.filterValues).should.be.ok;
  });

  describe("#render()", function() {
    it("should render its elements", function() {
      list.render();

      listView.render.calledOnce.should.be.ok;
      scrollbar.render.calledOnce.should.be.ok;
      filter.render.calledOnce.should.be.ok;
    });
  });

  describe("#getEventDispatcher()", function() {
    it("should return the event dispatcher", function() {
      list.getEventDispatcher().should.equal(list.eventDispatcher);
    });
  });

  describe("#setFilterString(filterString)", function() {
    it("should tokenize the text and call the list view's setFilterValues", function() {
      list.setFilterString("foo: bar");

      filterTokenizer.tokenize.calledWith("foo: bar").should.be.ok;
      listView.setFilterValues.calledOnce.should.be.ok;
      listView.setFilterValues.args[0][0].foo.should.equal("bar");
    });

    it("should trigger the filter-values-set event with the filter string", function() {
      sinon.spy(list.eventDispatcher, "trigger");

      list.setFilterString("foo: bar");
      list.eventDispatcher.trigger.calledWith("filter-values-set").should.be.ok;
      list.eventDispatcher.trigger.args[0][1][0][0].should.equal("foo: bar");
    });

    it("should clear previous stored filter strings", function() {
      sinon.spy(list.eventDispatcher, "trigger");
      list.setFilterString("foo: bar");
      list.setFilterString("bar: foo");

      list.eventDispatcher.trigger.args[1][1][0].length.should.equal(1);
      list.eventDispatcher.trigger.args[1][1][0][0].should.equal("bar: foo");
    });
  });

  describe("#appendFilterString()", function() {
    it("should call setFilterValues on the list view with the previous values extended with the new", function() {
      list.setFilterString("foo: bar");

      list.appendFilterString("bar: foo");

      filterTokenizer.tokenize.calledWith("bar: foo").should.be.ok;
      listView.setFilterValues.calledTwice.should.be.ok;
      listView.setFilterValues.args[1][0].foo.should.equal("bar");
      listView.setFilterValues.args[1][0].bar.should.equal("foo");
    });

    it("should trigger the filter-values-set event with all the filter strings", function() {
      sinon.spy(list.eventDispatcher, "trigger");
      list.setFilterString("foo: bar");

      list.appendFilterString("bar: foo");

      list.eventDispatcher.trigger.calledWith("filter-values-set").should.be.ok;
      list.eventDispatcher.trigger.args[0][1][0][0].should.equal("foo: bar");
      list.eventDispatcher.trigger.args[0][1][0][1].should.equal("bar: foo");
    });
  });

  describe("#setPage(pageNumber)", function() {
    it("should set the page on the list view", function() {
      list.setPage(2);

      listView.setPage.calledWith(2).should.be.ok;
    });
  });

  describe("#getPageCount()", function() {
    it("should return with the number of pages in list view", function() {
      list.getPageCount().should.equal(10);

      listView.getPageCount.calledOnce.should.be.ok;
    });
  });

  describe("#getCurrentPage()", function() {
    it("should return with the current page in list view", function() {
      list.getCurrentPage().should.equal(5);

      listView.getCurrentPage.calledOnce.should.be.ok;
    });
  });
});
