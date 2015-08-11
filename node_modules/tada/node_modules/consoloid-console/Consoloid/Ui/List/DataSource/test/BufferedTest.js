require('../Base.js');
require('../Array.js');
require('../Buffered.js');
require('consoloid-framework/Consoloid/Test/UnitTest');

describeUnitTest('Consoloid.Ui.List.DataSource.Buffered', function() {
  var
    dataSource,
    source,
    timedSource;

  beforeEach(function() {
    source = {
      getDataByRange: function(callback, fromIndex, toIndex) {
        if (fromIndex > toIndex || fromIndex < 0) {
          callback("Illegal range: fromIndex='" + fromIndex + "', toIndex='" + toIndex + "'");
          return;
        }

        var result = [];
        for (var i = fromIndex; i <= Math.min(toIndex, 99); i++) {
          result.push(i);
        }
        callback(undefined, result);
      },
      setFilterValues: function(callback, filterValues, fromIndex, toIndex) {
        this.getDataByRange(function(err, data) {
          callback(err, (data == undefined) ? undefined : {
            data: data,
            count: 100
          });
        }, fromIndex, toIndex);
      }
    };

    timedSource = {
      getDataByRange: function(callback, fromIndex, toIndex) {
        setTimeout(function() {
          source.getDataByRange(callback, fromIndex, toIndex);
        }, 100);
      },
      setFilterValues: function() {}
    };
    sinon.stub(timedSource, "setFilterValues", source.setFilterValues);

    callbackSpy = sinon.spy();

    dataSource = env.create(Consoloid.Ui.List.DataSource.Buffered, {
      source: timedSource,
      max: 50
    });
  });

  describe("#__constructor(options)", function() {
    it("should require a source dataSource", function() {
      (function() {
        env.create(Consoloid.Ui.List.DataSource.Buffered, { max: 70 });
      }).should.throwError();
    });

    it("should require the maximum number of elements to buffer", function() {
      (function() {
        env.create(Consoloid.Ui.List.DataSource.Buffered, { source: source });
      }).should.throwError();
    });
  });

  describe("#getDataByRange(callback, fromIndex, toIndex)", function() {
    it("should seem to work normally for whatever", function(done) {
      dataSource.source = source;
      dataSource.getDataByRange(function(err, data) {
        err.should.be.ok;
        dataSource.getDataByRange(function(err, data) {
          err.should.be.ok;
          dataSource.getDataByRange(function(err, data) {
            data.length.should.equal(10);
            for(var i = 0; i < 10; i++) {
              data[i].should.equal(i + 1);
            }
            dataSource.getDataByRange(function(err, data) {
              data.length.should.equal(90);
              for(var i = 0; i < 90; i++) {
                data[i].should.equal(i + 10);
              }
              done();
            }, 10, 100);
          }, 1, 10);
        }, -2, 2);
      }, 20, 2);
    });

    it("should check if part or whole range is already in the registry, and only add the needed ranges to the registry", function() {
      var clock = sinon.useFakeTimers();
      dataSource.chunkRegistry.length.should.equal(0);
      dataSource.getDataByRange(function() {}, 0, 9);

      dataSource.chunkRegistry.length.should.equal(1);
      dataSource.chunkRegistry[0].fromIndex.should.equal(0);
      dataSource.chunkRegistry[0].toIndex.should.equal(9);
      (dataSource.chunkRegistry[0].data == dataSource.__self.NOT_YET_ACQUIRED).should.be.ok;

      clock.tick(50);
      dataSource.getDataByRange(function() {}, 0, 19);

      dataSource.chunkRegistry.length.should.equal(2);
      dataSource.chunkRegistry[0].fromIndex.should.equal(10);
      dataSource.chunkRegistry[0].toIndex.should.equal(19);
      (dataSource.chunkRegistry[0].data == dataSource.__self.NOT_YET_ACQUIRED).should.be.ok;
      dataSource.chunkRegistry[1].fromIndex.should.equal(0);
      dataSource.chunkRegistry[1].toIndex.should.equal(9);
      (dataSource.chunkRegistry[1].data == dataSource.__self.NOT_YET_ACQUIRED).should.be.ok;

      clock.tick(50);

      dataSource.chunkRegistry.length.should.equal(2);
      dataSource.chunkRegistry[0].fromIndex.should.equal(10);
      dataSource.chunkRegistry[0].toIndex.should.equal(19);
      (dataSource.chunkRegistry[0].data == dataSource.__self.NOT_YET_ACQUIRED).should.be.ok;
      dataSource.chunkRegistry[1].fromIndex.should.equal(0);
      dataSource.chunkRegistry[1].toIndex.should.equal(9);
      dataSource.chunkRegistry[1].data.should.not.equal(dataSource.__self.NOT_YET_ACQUIRED);

      clock.tick(50);

      dataSource.chunkRegistry.length.should.equal(2);
      dataSource.chunkRegistry[0].fromIndex.should.equal(10);
      dataSource.chunkRegistry[0].toIndex.should.equal(19);
      dataSource.chunkRegistry[0].data.should.not.equal(dataSource.__self.NOT_YET_ACQUIRED);
      dataSource.chunkRegistry[1].fromIndex.should.equal(0);
      dataSource.chunkRegistry[1].toIndex.should.equal(9);
      dataSource.chunkRegistry[1].data.should.not.equal(dataSource.__self.NOT_YET_ACQUIRED);

      clock.restore();
    });

    it("should work with messy ranges too", function() {
      dataSource.chunkRegistry.length.should.equal(0);

      dataSource.getDataByRange(function() {}, 10, 19);
      dataSource.getDataByRange(function() {}, 30, 39);
      dataSource.getDataByRange(function() {}, 0, 49);

      dataSource.chunkRegistry.length.should.equal(5);
      dataSource.chunkRegistry[0].fromIndex.should.equal(40);
      dataSource.chunkRegistry[0].toIndex.should.equal(49);
      dataSource.chunkRegistry[1].fromIndex.should.equal(20);
      dataSource.chunkRegistry[1].toIndex.should.equal(29);
      dataSource.chunkRegistry[2].fromIndex.should.equal(0);
      dataSource.chunkRegistry[2].toIndex.should.equal(9);
      dataSource.chunkRegistry[3].fromIndex.should.equal(30);
      dataSource.chunkRegistry[3].toIndex.should.equal(39);
      dataSource.chunkRegistry[4].fromIndex.should.equal(10);
      dataSource.chunkRegistry[4].toIndex.should.equal(19);


    });

    it("should add a callback to the chunk in the registry that checks for completion in the callback registry," +
        "and if completed call the original callback with the data, also remove said callback", function() {
      var callbackSpy = sinon.spy();
      var callbackSpy2 = sinon.spy();
      var clock = sinon.useFakeTimers();
      dataSource.callbackRegistry.length.should.equal(0);

      dataSource.getDataByRange(callbackSpy, 0, 9);

      dataSource.callbackRegistry.length.should.equal(1);
      dataSource.callbackRegistry[0].fromIndex.should.equal(0);
      dataSource.callbackRegistry[0].toIndex.should.equal(9);
      dataSource.callbackRegistry[0].callback.should.equal(callbackSpy);

      clock.tick(50);
      dataSource.getDataByRange(callbackSpy2, 0, 19);

      dataSource.callbackRegistry.length.should.equal(2);
      dataSource.callbackRegistry[0].fromIndex.should.equal(0);
      dataSource.callbackRegistry[0].toIndex.should.equal(9);
      dataSource.callbackRegistry[0].callback.should.equal(callbackSpy);
      dataSource.callbackRegistry[1].fromIndex.should.equal(0);
      dataSource.callbackRegistry[1].toIndex.should.equal(19);
      dataSource.callbackRegistry[1].callback.should.equal(callbackSpy2);

      clock.tick(50);

      callbackSpy.calledOnce.should.be.ok;
      callbackSpy2.called.should.not.be.ok;
      dataSource.callbackRegistry.indexOf(callbackSpy).should.equal(-1);

      clock.tick(50);
      callbackSpy.calledOnce.should.be.ok;
      callbackSpy2.calledOnce.should.be.ok;
      dataSource.callbackRegistry.indexOf(callbackSpy2).should.equal(-1);

      clock.restore();
    });

    it("should add a callback that if gets error, calls all callbacks related to this chunk with the error" +
        "and remove this chunk and those callbacks from the registries", function() {
      var callbackSpy = sinon.spy();
      var callbackSpy2 = sinon.spy();
      var clock = sinon.useFakeTimers();

      sinon.stub(timedSource, "getDataByRange", function(callback) {
        setTimeout(function() {
          callback("Error");
        }, 100);
      });
      dataSource.getDataByRange(callbackSpy, 0, 19);
      clock.tick(50);
      dataSource.getDataByRange(callbackSpy2, 15, 20);
      clock.tick(50);

      callbackSpy.calledOnce.should.be.ok;
      callbackSpy.args[0][0].should.be.ok;

      callbackSpy2.calledOnce.should.be.ok;
      callbackSpy2.args[0][0].should.be.ok;

      dataSource.callbackRegistry.length.should.equal(0);
      dataSource.chunkRegistry.length.should.equal(0);

      clock.restore();
    });

    it("should remove old chunks", function() {
      var clock = sinon.useFakeTimers();
      dataSource.chunkRegistry.length.should.equal(0);

      dataSource.getDataByRange(function() {}, 0, 9);
      clock.tick(100);

      dataSource.chunkRegistry.length.should.equal(1);
      dataSource.chunkRegistry[0].fromIndex.should.equal(0);
      dataSource.chunkRegistry[0].toIndex.should.equal(9);

      dataSource.getDataByRange(function() {}, 0, 19);
      clock.tick(100);

      dataSource.chunkRegistry.length.should.equal(2);
      dataSource.chunkRegistry[0].fromIndex.should.equal(10);
      dataSource.chunkRegistry[0].toIndex.should.equal(19);
      dataSource.chunkRegistry[1].fromIndex.should.equal(0);
      dataSource.chunkRegistry[1].toIndex.should.equal(9);


      dataSource.getDataByRange(function() {}, 20, 49);
      clock.tick(100);

      dataSource.chunkRegistry.length.should.equal(3);
      dataSource.chunkRegistry[0].fromIndex.should.equal(20);
      dataSource.chunkRegistry[0].toIndex.should.equal(49);
      dataSource.chunkRegistry[1].fromIndex.should.equal(10);
      dataSource.chunkRegistry[1].toIndex.should.equal(19);
      dataSource.chunkRegistry[2].fromIndex.should.equal(0);
      dataSource.chunkRegistry[2].toIndex.should.equal(9);

      dataSource.getDataByRange(function() {}, 50, 60);
      clock.tick(100);

      dataSource.chunkRegistry.length.should.equal(3);
      dataSource.chunkRegistry[0].fromIndex.should.equal(50);
      dataSource.chunkRegistry[0].toIndex.should.equal(60);
      dataSource.chunkRegistry[1].fromIndex.should.equal(20);
      dataSource.chunkRegistry[1].toIndex.should.equal(49);
      dataSource.chunkRegistry[2].fromIndex.should.equal(10);
      dataSource.chunkRegistry[2].toIndex.should.equal(19);


      dataSource.getDataByRange(function() {}, 70, 99);
      clock.tick(100);

      dataSource.chunkRegistry.length.should.equal(3);
      dataSource.chunkRegistry[0].fromIndex.should.equal(70);
      dataSource.chunkRegistry[0].toIndex.should.equal(99);
      dataSource.chunkRegistry[1].fromIndex.should.equal(50);
      dataSource.chunkRegistry[1].toIndex.should.equal(60);
      dataSource.chunkRegistry[2].fromIndex.should.equal(20);
      dataSource.chunkRegistry[2].toIndex.should.equal(49);

      dataSource.getDataByRange(function() {}, 0, 3);
      clock.tick(100);

      dataSource.chunkRegistry.length.should.equal(4);
      dataSource.chunkRegistry[0].fromIndex.should.equal(0);
      dataSource.chunkRegistry[0].toIndex.should.equal(3);
      dataSource.chunkRegistry[1].fromIndex.should.equal(70);
      dataSource.chunkRegistry[1].toIndex.should.equal(99);
      dataSource.chunkRegistry[2].fromIndex.should.equal(50);
      dataSource.chunkRegistry[2].toIndex.should.equal(60);
      dataSource.chunkRegistry[3].fromIndex.should.equal(20);
      dataSource.chunkRegistry[3].toIndex.should.equal(49);

      clock.restore();
    });

    it("should simply call the callback if all data is already in the chunk registry", function(done) {
      dataSource.chunkRegistry = [{fromIndex: 0, toIndex: 1, data: ["foo", "bar"]}];
      dataSource.getDataByRange(function(err, data) {
        data[0].should.equal("foo");
        data[1].should.equal("bar");
        done();
      }, 0, 1);
    });
  });

  describe("#setFilterValues(callback, filterValues, fromIndex, toIndex)", function() {
    it("should clean the chunk and callback registry", function() {
      var spy = sinon.spy();
      dataSource.chunkRegistry = [{ fromIndex: 0, toIndex: 6, data: dataSource.__self.NOT_YET_ACQUIRED }, { fromIndex: 10, toIndex: 16, acquired: dataSource.__self.NOT_YET_ACQUIRED }];
      dataSource.callbackRegistry = [{ fromIndex: 0, toIndex: 6, callback: spy }, { fromIndex: 10, toIndex: 16, callback: spy }];

      dataSource.setFilterValues(function() {}, {}, 0, 5);
      spy.calledTwice.should.be.ok;
      spy.args[0][0].should.equal("Removed by setFilterValues.");
      spy.args[1][0].should.equal("Removed by setFilterValues.");
      dataSource.chunkRegistry.length.should.equal(1);
      dataSource.callbackRegistry.length.should.equal(1);
    });

    it("should seem to work normally for whatever", function(done) {
      dataSource.source = source;
      dataSource.setFilterValues(function(err, result) {
        err.should.be.ok;
        dataSource.setFilterValues(function(err, result) {
          err.should.be.ok;
          dataSource.setFilterValues(function(err, result) {
            result.data.length.should.equal(10);
            for(var i = 0; i < 10; i++) {
              result.data[i].should.equal(i+1);
            }
            result.count.should.equal(100);
            dataSource.setFilterValues(function(err, result) {
              result.data.length.should.equal(90);
              result.count.should.equal(100);
              for(var i = 0; i < 90; i++) {
                result.data[i].should.equal(i + 10);
              }
              done();
            }, {}, 10, 100);
          }, {}, 1, 10);
        }, { fookey: "foovalue" }, -2, 2);
      }, {}, 20, 2);
    });

    it("should call setFilterValues, with the filterValues on the source, instead of just calling getDataByRange", function() {
      dataSource.setFilterValues(function() {}, { key: 'foobar' }, 0, 2);
      timedSource.setFilterValues.calledOnce.should.be.ok;
      timedSource.setFilterValues.args[0][1].key.should.equal('foobar');
    });

    it("should do all this with minimal code duplication with getDataByRange");
  });
});