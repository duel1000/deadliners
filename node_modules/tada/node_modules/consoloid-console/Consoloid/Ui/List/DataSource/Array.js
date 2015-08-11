defineClass('Consoloid.Ui.List.DataSource.Array', 'Consoloid.Ui.List.DataSource.Base',
  {
    __constructor : function(options)
    {
      this.__base(options);

      this.requireProperty('data');
      this._clearFilters();
    },

    _clearFilters: function()
    {
      this.filteredDataIndexes = [];
      for ( var i = 0; i < this.data.length; i++) {
        this.filteredDataIndexes[i] = i;
      }
    },

    getDataByRange: function(callback, fromIndex, toIndex)
    {
      var result;

      try {
        result = this.__getDataByRange(fromIndex, toIndex);
      } catch (e) {
        callback(e.message);
        return;
      }

      callback(undefined, result);
    },

    __getDataByRange: function(fromIndex, toIndex)
    {
      if (fromIndex > toIndex || fromIndex < 0) {
        throw new Error("Illegal range: fromIndex='" + fromIndex + "', toIndex='" + toIndex + "'")
      }

      var result = [];
      for (var i = fromIndex; i <= Math.min(toIndex, this.filteredDataIndexes.length - 1); i++) {
        result.push(this.data[this.filteredDataIndexes[i]]);
      }
      return result;
    },

    setFilterValues: function(callback, filterValues, fromIndex, toIndex)
    {
      this._setFilterValues((function(err) {
        if (err != undefined) {
          callback(err);
          return;
        }

        var data;
        try {
          data = this.__getDataByRange(fromIndex, toIndex);
        } catch (e) {
          callback(e.message);
          return;
        }

        callback(undefined, {
          data: data,
          count: this.filteredDataIndexes.length,
        });
      }).bind(this), filterValues);
    },

    _setFilterValues: function(callback, filterValues)
    {
      callback(undefined);
    }
  }
);
