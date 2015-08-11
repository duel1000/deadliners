require('../Base.js');

require('consoloid-framework/Consoloid/Test/UnitTest');

describeUnitTest('Consoloid.Ui.List.DataSource.Base', function() {

  describe("#getDataByRange(callback, fromIndex, toIndex)", function() {
    it("should call the callback with the filtered data from said range");
  });

  describe("#setFilterValues(callback, filterValues, fromIndex, toIndex)", function() {
    it("should set the filters (list of key -> value pairs)");
    it("should call the callback with data from range and element count if possible")
  });
});