require('../Base.js');
require('../Array.js');
require('consoloid-framework/Consoloid/Test/UnitTest');

describeUnitTest('Consoloid.Ui.List.DataSource.Array', function() {
  var dataSource;
  beforeEach(function() {
    dataSource = env.create(Consoloid.Ui.List.DataSource.Array, {
      data: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    });
  });

  describe("__constructor()", function() {
    it("should require the data", function() {
      (function() {
        env.create(Consoloid.Ui.List.DataSource.Array, { });
      }).should.throwError();
    });

    it("should set the default values", function() {
      dataSource.filteredDataIndexes.length.should.equal(10);
      for (var i = 0; i < 10; i++) {
        dataSource.filteredDataIndexes[i].should.equal(i);
      }
    });
  });

  describe("#setFilterValues(callback, filterValues, fromIndex, toIndex)", function() {
    it("should call the callback with the number of filtered lines.", function(done) {
      dataSource.setFilterValues(function(err, result) {
        result.count.should.equal(10);
        dataSource.filteredDataIndexes = [1, 3, 5, 7, 9];
        dataSource.setFilterValues(function(err, result) {
          result.count.should.equal(5);
          done();
        }, {});
      }, {});
    });

    it("should call the callback with filtered data from said range", function(done) {
      dataSource.filteredDataIndexes = [1, 3, 5, 7, 9];
      dataSource.setFilterValues(function(err, result) {
        result.data[0].should.equal(2);
        result.data[1].should.equal(4);
        result.data[2].should.equal(6);
        done();
      }, {}, 0, 2);
    });

    it("should send error on invalid range", function(done) {
      dataSource.setFilterValues(function(err, result) {
        err.should.be.ok;
        dataSource.setFilterValues(function(err, result) {
          err.should.be.ok;
          done();
        }, {}, -2, 2);
      }, {}, 20, 2);
    });

    it("should call the callback with empty array on valid, but out of bounds range", function(done) {
      dataSource.setFilterValues(function(err, result) {
        result.data.length.should.equal(0);
        done();
      }, {}, 99, 150);
    });

    it("should call the callback with the remaining elements if toIndex is out of bounds, but fromIndex is not", function(done) {
      dataSource.setFilterValues(function(err, result) {
        result.data.length.should.equal(1);
        result.data[0].should.equal(10);
        done();
      }, {}, 9, 150);
    });

    it("should call _setFilterValues function so future inheriters can test data against filterValues there", function(done) {
      sinon.spy(dataSource, '_setFilterValues');
      dataSource.setFilterValues(function(err, result) {
        dataSource._setFilterValues.calledOnce.should.be.ok;
        (typeof dataSource._setFilterValues.args[0][0]).should.equal("function");
        dataSource._setFilterValues.args[0][1].fookey.should.equal("value");
        dataSource._setFilterValues.args[0][1].barkey.should.equal("value2");
        done();
      }, { fookey: "value", barkey: "value2" }, 1, 10);
    });
  });

  describe("#getDataByRange(callback, fromIndex, toIndex)", function() {
    it("should call the callback with filtered data from said range", function(done) {
      dataSource.filteredDataIndexes = [1, 3, 5, 7, 9];
      dataSource.getDataByRange(function(err, data) {
        data[0].should.equal(2);
        data[1].should.equal(4);
        data[2].should.equal(6);
        done();
      }, 0, 2);
    });

    it("should send error on invalid range", function(done) {
      dataSource.getDataByRange(function(err, data) {
        err.should.be.ok;
        dataSource.getDataByRange(function(err, data) {
          err.should.be.ok;
          done();
        }, -2, 2);
      }, 20, 2);
    });

    it("should call the callback with empty array on valid, but out of bounds range", function(done) {
      dataSource.getDataByRange(function(err, data) {
        data.length.should.equal(0);
        done();
      }, 99, 150);
    });

    it("should call the callback with the remaining elements if toIndex is out of bounds, but fromIndex is not", function(done) {
      dataSource.getDataByRange(function(err, data) {
        data.length.should.equal(1);
        data[0].should.equal(10);
        done();
      }, 9, 150);
    });
  });
});
