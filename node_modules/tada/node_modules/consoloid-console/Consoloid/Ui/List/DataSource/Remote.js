defineClass('Consoloid.Ui.List.DataSource.Remote', 'Consoloid.Ui.List.DataSource.Buffered',
  {
    __constructor: function(options)
    {
      var originalSource = options.source;
      options.source = {};
      this.__addCallAsyncFunctionStub(originalSource, options.source, 'setFilterValues');
      this.__addCallAsyncFunctionStub(originalSource, options.source, 'getDataByRange');

      this.__base(options);
    },

    __addCallAsyncFunctionStub: function(originalSource, source, method) {
      source[method] = function(callback) {
        var args = [];
        for(var i = 1; i < arguments.length; i++)  {
          args.push(arguments[i]);
        };
        originalSource.callAsync(method, args, {
          success: function(result) {
            callback(undefined, result);
          },
          error: function(error) {
            callback(error);
          },
          timeout: function() {
            callback("Connection timed out.");
          }
        });
      }
    }
  }
);