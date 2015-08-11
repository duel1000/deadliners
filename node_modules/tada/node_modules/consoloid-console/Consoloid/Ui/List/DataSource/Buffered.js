defineClass('Consoloid.Ui.List.DataSource.Buffered', 'Consoloid.Ui.List.DataSource.Base',
  {
    __constructor: function(options)
    {
      this.__base($.extend({
        chunkRegistry: [],
        callbackRegistry: []
      }, options));

      this.requireProperty('source');
      this.requireProperty('max');
    },

    getDataByRange: function(callback, fromIndex, toIndex)
    {
      if (fromIndex > toIndex || fromIndex < 0) {
        callback("Illegal range: fromIndex='" + fromIndex + "', toIndex='" + toIndex + "'");
        return;
      }

      var dataForRange = this.__getBufferedDataForRange(fromIndex, toIndex);
      if (dataForRange.everyChunkHasData) {
        callback(undefined, dataForRange.data);
        return;
      }

      var newChunks = this.__addRegistryEntries(callback, fromIndex, toIndex);

      var $this = this;
      $.each(newChunks, function(index, chunk) {
        $this.source.getDataByRange(function(err, data) {
          if (err) {
            $this.__dealWithChunkError(err, chunk.fromIndex, chunk.toIndex);
            return;
          }
          chunk.data = data;
          $this.__dealWithChunkAcquire();
        }, chunk.fromIndex, chunk.toIndex);
      });
    },

    __addRegistryEntries: function(callback, fromIndex, toIndex)
    {
      this.callbackRegistry.push({
        fromIndex: fromIndex,
        toIndex: toIndex,
        callback: callback
      });
      return this.__pushNotInRegistryChunks(fromIndex, toIndex);
    },

    __pushNotInRegistryChunks: function(fromIndex, toIndex)
    {
      var notInChunkIndexes = this.__getNotInChunkIndexes(fromIndex, toIndex);

      var newChunks = [];
      var currentChunk = undefined;

      for (var i = 0; i < notInChunkIndexes.length; i++) {
        if ((notInChunkIndexes[i-1] != undefined && notInChunkIndexes[i-1] + 1 != notInChunkIndexes[i])) {
          currentChunk.toIndex = notInChunkIndexes[i-1];
          newChunks.push(currentChunk);
        }
        if ((notInChunkIndexes[i-1] != undefined && notInChunkIndexes[i-1] + 1 != notInChunkIndexes[i]) || currentChunk == undefined) {
          currentChunk = {};
          currentChunk.data = this.__self.NOT_YET_ACQUIRED;
          currentChunk.fromIndex = notInChunkIndexes[i];
        }
        if (i == notInChunkIndexes.length - 1) {
          currentChunk.toIndex = notInChunkIndexes[i];
          newChunks.push(currentChunk);
        }
      }

      $.each(newChunks, (function(index, chunk) {
        this.chunkRegistry.unshift(chunk);
      }).bind(this));
      return newChunks;
    },

    __getNotInChunkIndexes: function(fromIndex, toIndex)
    {
      var notInChunkIndexes = [];
      for (var i = fromIndex; i <= toIndex; i++) {
        var inChunk = false;
        $.each(this.chunkRegistry, function(index, chunk) {
          if (i >= chunk.fromIndex && i <= chunk.toIndex) {
            inChunk = true;
          }
        });

        if (!inChunk) {
          notInChunkIndexes.push(i);
        }
      }

      return notInChunkIndexes;
    },

    __dealWithChunkError: function(err, fromIndex, toIndex)
    {
      var $this = this;
      var callbacks = this.__getAllCallbacksRelevantToRange(fromIndex, toIndex);
      $.each(callbacks, function(index, callbackObject) {
        $this.callbackRegistry.splice($this.callbackRegistry.indexOf(callbackObject), 1);
          callbackObject.callback(err);
      });

      var chunksNeedRemoval = [];
      $.each(this.chunkRegistry, function(index, chunk) {
        if (chunk.data == $this.__self.NOT_YET_ACQUIRED && $this.__getAllCallbacksRelevantToRange(chunk.fromIndex, chunk.toIndex).length == 0) {
          chunksNeedRemoval.push(chunk);
        }
      });

      $.each(chunksNeedRemoval, function(index, chunk) {
        $this.chunkRegistry.splice($this.chunkRegistry.indexOf(chunk), 1);
      })
    },

    __getAllCallbacksRelevantToRange: function(fromIndex, toIndex)
    {
      var results = [];
      $.each(this.callbackRegistry, (function(index, callbackObject) {
        if (this._rangesOverlap(fromIndex, toIndex, callbackObject.fromIndex, callbackObject.toIndex)) {
          results.push(callbackObject);
        }
      }).bind(this));

      return results;
    },

    _rangesOverlap: function(fromIndex0, toIndex0, fromIndex1, toIndex1)
    {
      return (fromIndex0 <= toIndex1 && toIndex0 >= fromIndex1);
    },

    __dealWithChunkAcquire: function()
    {
      this.__callCallbacksIfPossible();
      this.__removeOverflowingFinishedChunksFromBuffer();
    },

    __callCallbacksIfPossible: function()
    {
      var callbacksNeedCalling = [];
      var $this = this;
      $.each(this.callbackRegistry, function(index, callbackObject) {
        var dataForRange = $this.__getBufferedDataForRange(callbackObject.fromIndex, callbackObject.toIndex);

        if (dataForRange.everyChunkHasData) {
          callbacksNeedCalling.push({ callbackObject: callbackObject, data: dataForRange.data });
        }
      });

      $.each(callbacksNeedCalling, function(index, callbackObjectContainer) {
        $this.callbackRegistry.splice($this.callbackRegistry.indexOf(callbackObjectContainer.callbackObject), 1);
        callbackObjectContainer.callbackObject.callback(undefined, callbackObjectContainer.data);
      });
    },

    __getBufferedDataForRange: function(fromIndex, toIndex)
    {
      var $this = this;
      var data = [];
      var finishedChunkRangesLength= 0;
      $.each($this.chunkRegistry, function(index, chunk) {
        if ($this._rangesOverlap(chunk.fromIndex, chunk.toIndex, fromIndex, toIndex)) {
          if (chunk.data != $this.__self.NOT_YET_ACQUIRED) {
            for (var i = fromIndex; i <= toIndex; i++) {
              if (i >= chunk.fromIndex && i <= chunk.toIndex) {
                finishedChunkRangesLength++;
                if (chunk.data[i - chunk.fromIndex] != undefined)
                data[i - fromIndex] = chunk.data[i - chunk.fromIndex];
              }
            }
          }
        }
      });
      return { data: data, everyChunkHasData: (finishedChunkRangesLength == toIndex - fromIndex + 1) };
    },

    __removeOverflowingFinishedChunksFromBuffer: function()
    {
      var chunksThatNeedRemoval = [];
      var elementCounter = 0;

      var $this = this;
      $.each(this.chunkRegistry, function(index, chunk) {
        if ($this.__getAllCallbacksRelevantToRange(chunk.fromIndex, chunk.toIndex).length == 0) {
          if (elementCounter <= $this.max) {
            elementCounter += chunk.toIndex - chunk.fromIndex + 1;
          } else {
            chunksThatNeedRemoval.push(chunk);
          }
        }
      });

      $.each(chunksThatNeedRemoval, function(index, chunk) {
        $this.chunkRegistry.splice($this.chunkRegistry.indexOf(chunk), 1);
      });
    },

    setFilterValues: function(callback, filterValues, fromIndex, toIndex)
    {
      if (fromIndex > toIndex || fromIndex < 0) {
        callback("Illegal range: fromIndex='" + fromIndex + "', toIndex='" + toIndex + "'");
        return;
      }
      this.__clearRegistry();

      var $this = this;
      var newChunk = this.__addRegistryEntries(function(err, data) {
        callback(err, { data: data, count: $this.count })
      }, fromIndex, toIndex)[0];

      this.source.setFilterValues(function(err, result) {
        if (err) {
          $this.__dealWithChunkError(err, newChunk.fromIndex, newChunk.toIndex);
          return;
        }
        newChunk.data = result.data;
        $this.count = result.count;
        $this.__dealWithChunkAcquire();
      }, filterValues, fromIndex, toIndex);
    },

    __clearRegistry: function()
    {
      $.each(this.callbackRegistry, function(index, callbackObject) {
        callbackObject.callback("Removed by setFilterValues.");
      });
      this.callbackRegistry = [];
      this.chunkRegistry = [];
    }
  }, {
    NOT_YET_ACQUIRED: undefined
  }
);
