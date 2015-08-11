defineClass('Consoloid.Ui.List.DataSource.TextFile', 'Consoloid.Ui.List.DataSource.Base',
  {
    __constructor: function(options)
    {
      this.__base($.extend({
        opened: false,
        textFileOptions: {}
      }, options));

      this.requireProperty('fileName');

      this.__createTextFile();
    },

    __createTextFile: function()
    {
      if (!("file" in this.textFileOptions)) {
        this.textFileOptions.file = this.create("Consoloid.OS.File.File", {});
      }

      this.textFile = this.create('Consoloid.OS.File.TextFile', this.textFileOptions);
    },

    getDataByRange: function(callback, fromIndex, toIndex)
    {
      if (!this.opened) {
        this.__openFile((function(err) {
          if (err) {
            callback(err);
            return;
          }

          this.__getData(callback, fromIndex, toIndex);
        }).bind(this));

        return;
      }

      this.__getData(callback, fromIndex, toIndex);
    },

    setFilterValues: function(callback, filterValues, fromIndex, toIndex)
    {
      if (!this.opened) {
        this.__openFile((function(err) {
          if (err) {
            callback(err);
            return;
          }

          this.__getCountAndData(callback, fromIndex, toIndex);
        }).bind(this));

        return;
      }

      this.__getCountAndData(callback, fromIndex, toIndex);
    },

    __openFile: function(callback)
    {
      this.textFile.open(this.fileName, "r", (function(err) {
        if (err) {
          callback(err);
          return;
        }

        this.opened = true;
        callback();
      }).bind(this));
    },

    __getCountAndData: function(callback, fromIndex, toIndex)
    {
      this.textFile.getLineCount((function(err, lineCount) {
        if (err) {
          callback(err);
          return;
        }

        this.count = lineCount;
        this.__getData((function(err, data) {
          if (err) {
            callback(err);
            return;
          }
          callback(undefined, {
            data: data,
            count: this.count
          });
        }).bind(this), fromIndex, toIndex);
      }).bind(this));
    },

    __getData: function(callback, fromIndex, toIndex, data)
    {
      if (data == undefined) {
        data = [];
      }

      if (fromIndex > toIndex || fromIndex == this.count) {
        var result = [];
        callback(undefined, data);
        return;
      }

      this.textFile.readLine((function(err, line) {
        if (err) {
          callback(err);
          return;
        }

        data.push(line);
        this.__getData(callback, fromIndex + 1, toIndex, data);
      }).bind(this), fromIndex);
    }
  }
);
