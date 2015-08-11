require("consoloid-framework/Consoloid/Widget/Widget");
require('../Base.js');
require('../Mousewheel.js');
require('../Kinetic.js');
require("consoloid-framework/Consoloid/Widget/JQoteTemplate");
require('consoloid-framework/Consoloid/Widget/jquery.jqote2.min.js');
require("consoloid-framework/Consoloid/Error/UserMessage");
require('consoloid-framework/Consoloid/Test/UnitTest');

describeUnitTest('Consoloid.Ui.List.View.Kinetic', function() {
  var
    cssLoader,
    dataSource,
    factory,
    list;

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

    list = env.create(Consoloid.Ui.List.View.Kinetic, {
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
    it("should load jquery.kinetic if not yet loaded", function() {
      var
        resourceLoader = env.get('resource_loader');

      delete jQuery.fn['kinetic'];

      sinon.stub(resourceLoader, 'getJs').returns(true);

      env.create(Consoloid.Ui.List.View.Kinetic, {
        dataSource: dataSource,
        numPerPage: 10,
        factory: factory,
      });

      resourceLoader.getJs.calledWith('Consoloid/Ui/List/jquery.kinetic').should.be.ok;

      resourceLoader.getJs.restore();
    });
  });

  describe("#__renderCompleteList(data)", function() {
    beforeEach(function() {
      list.render();
    });

    it("should add kinetic scrolling events", function() {
      list.__renderCompleteList([ 1 ]);

      $.fn.kinetic.calledOnce.should.be.ok;
      $.fn.kinetic.thisValues[0].selector.should.equal('.list-wrapper');
      $.fn.kinetic.args[0][0].x.should.equal(false);
      $.fn.kinetic.args[0][0].stopped.should.be.ok;
      $.fn.kinetic.args[0][0].started.should.be.ok;
      $.fn.kinetic.args[0][0].cancelled.should.be.ok;
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
    });

    it("should set the scrolling state to mousewheel and detach kinetic event handlers", function() {
      list.list.animate = sinon.spy();

      list.__mouseWheelHandler(-1);
      $.fn.kinetic.calledWith('detach').should.be.ok;
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

    it("should detach the kinetic event listeners on 'adjusting' and 'mousewheel' states", function() {
      list.__setScrollState("adjusting");
      list.__setScrollState("mousewheel");
      $.fn.kinetic.calledThrice.should.be.ok;
      $.fn.kinetic.args[1][0].should.equal('detach');
      $.fn.kinetic.args[2][0].should.equal('detach');
    });

    it("should attach the kinetic event listeners on 'none' state", function() {
      list.__setScrollState("none");
      $.fn.kinetic.calledTwice.should.be.ok;
      $.fn.kinetic.args[1][0].should.equal('attach');
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

    it("should detach kinetic eventlisteners", function() {
      sinon.spy(listNode, 'unbind');
      list.setPage(7);

      listNode.kinetic.calledWith("detach").should.be.ok;
    });
  });

  afterEach(function() {
    $.fn.hide.restore();
    $.fn.fadeIn.restore();
  });
});
