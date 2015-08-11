require('../Base.js');
require('../Array.js');
require('../Buffered.js');
require('../Remote.js');

require('consoloid-framework/Consoloid/Test/UnitTest');
describeUnitTest('Consoloid.Ui.List.DataSource.Remote', function() {
  var
    dataSource,
    sourceMock,
    callbackSpy;
  beforeEach(function() {
    sourceMock = {
      callAsync: sinon.stub()
    }
    dataSource = env.create(Consoloid.Ui.List.DataSource.Remote, {
      source: sourceMock,
      max: 50
    });
    callbackSpy = sinon.spy();
  });

  describe("#__constructor(options)", function() {
    it("should add a wrapper for the source, that calls all needed methods with callAsync", function() {
      dataSource.source.setFilterValues(callbackSpy, { fookey: 'value' }, 0, 5);
      dataSource.source.getDataByRange(callbackSpy, 0, 5);

      sourceMock.callAsync.callCount.should.equal(2);

      sourceMock.callAsync.args[0][0].should.equal('setFilterValues');
      (sourceMock.callAsync.args[0][1] instanceof Array).should.be.ok;
      sourceMock.callAsync.args[0][1].length.should.equal(3);
      sourceMock.callAsync.args[0][1][0].fookey.should.equal('value');
      sourceMock.callAsync.args[0][1][1].should.equal(0);
      sourceMock.callAsync.args[0][1][2].should.equal(5);
      (typeof sourceMock.callAsync.args[0][2].success).should.equal("function");
      (typeof sourceMock.callAsync.args[0][2].timeout).should.equal("function");
      (typeof sourceMock.callAsync.args[0][2].error).should.equal("function");

      sourceMock.callAsync.args[1][0].should.equal('getDataByRange');
      (sourceMock.callAsync.args[1][1] instanceof Array).should.be.ok;
      sourceMock.callAsync.args[1][1].length.should.equal(2);
      sourceMock.callAsync.args[1][1][0].should.equal(0);
      sourceMock.callAsync.args[1][1][1].should.equal(5);
      (typeof sourceMock.callAsync.args[1][2].success).should.equal("function");
      (typeof sourceMock.callAsync.args[1][2].timeout).should.equal("function");
      (typeof sourceMock.callAsync.args[1][2].error).should.equal("function");
    });

    it("should call the callback with error/response according what callAsync callback was called", function() {
      dataSource.source.getDataByRange(callbackSpy, 0, 5);

      sourceMock.callAsync.args[0][2].success("foo");
      sourceMock.callAsync.args[0][2].timeout();
      sourceMock.callAsync.args[0][2].error("foo de error");

      callbackSpy.callCount.should.equal(3);

      (callbackSpy.args[0][0] == undefined).should.be.ok;
      callbackSpy.args[0][1].should.equal("foo");

      (callbackSpy.args[1][0] == undefined).should.not.be.ok;
      (callbackSpy.args[1][1] == undefined).should.be.ok;

      callbackSpy.args[2][0].should.equal("foo de error");
      (callbackSpy.args[2][1] == undefined).should.be.ok;
    });

    it("should do everything else normally", function() {
    });
  });
});