defineClass('Consoloid.OS.File.TextFile', 'Consoloid.OS.File.AbstractFileDecorator', {
  __constructor: function(options)
  {
    this.__base($.extend({
      position: undefined,
      index: undefined,
      buffer: require('buffer').Buffer,
      currentLine: undefined,
      lineBreak: "\n",
      chunkSize: 4096,
      decoderEngine: require('string_decoder').StringDecoder,
      encoding: 'utf8'
    }, options));
  },

  setEncoding: function(encoding, callback)
  {
    if (this.getFID() != undefined) {
      callback("Can't change encoding if file is opened");
      return;
    }

    this.encoding = encoding;
    callback();
  },

  open: function(path, flags, callback, mode)
  {
    var $this = this;
    this.__base(path, flags, function(error) {
      if (error == undefined) {
        $this.index = [];
        $this.index[0] = 0;
        $this.currentLine = 0;
      }

      callback(error);
    }, mode);
  },

  read: function()
  {
    throw new Error('read() is disabled in TextFile');
  },

  write: function()
  {
    throw new Error('write() is disabled in TextFile');
  },

  seek: function()
  {
    throw new Error('seek() is disabled in TextFile');
  },

  readLine: function(callback, lineNumber)
  {
    var $this = this;
    this.seekLine((lineNumber != undefined) ? lineNumber : this.currentLine, function() {
      $this._readOneChunk(undefined, callback);
    });
  },

  _readOneChunk: function(err, callback, buffer, currChunkPos, previousChunkFragment) {
    var $this = this;
    if (err) {
      callback(err);
      return;
    }

    var chunkReaderObject = {
      callback: callback,
      buffer: buffer,
      currChunkPos: currChunkPos,
      previousChunkFragment: previousChunkFragment || "",
      nextChunkFragment: previousChunkFragment || "",
      bufferOffset: 0
    }

    if (chunkReaderObject.buffer !== undefined) {
      var readString = this.__readString(chunkReaderObject);
      var foundLineCounter = this.__findLines(chunkReaderObject, readString);

      if (foundLineCounter != 0 || this.getEOF()) {
        this.__returnWithFirstLine(chunkReaderObject, readString, foundLineCounter);
        return;
      } else {
        this.__createNewBuffer(chunkReaderObject, readString);
      }
    }

    this.__getCurrentPositionAndReadNextChunk(chunkReaderObject);
  },

  __readString: function(chunkReaderObject)
  {
    var decoder = new this.decoderEngine(this.encoding)
    return decoder.write(chunkReaderObject.buffer);
  },

  __findLines: function(chunkReaderObject, readString)
  {
    var foundLineCounter = 0;
    readString.split('').forEach(function(value, index) {
      if (value == this.lineBreak) {
        chunkReaderObject.nextChunkFragment = "";
        foundLineCounter++;
        var lineBreakPositioninChunk = Buffer.byteLength(readString.slice(0, index + 1));
        this.index[this.currentLine + foundLineCounter] = chunkReaderObject.currChunkPos + lineBreakPositioninChunk;
      } else {
        chunkReaderObject.nextChunkFragment += value;
      }
    }, this);

    return foundLineCounter;
  },

  __returnWithFirstLine: function(chunkReaderObject, readString, foundLineCounter)
  {
    this.currentLine++;
    var firstLine = chunkReaderObject.previousChunkFragment
      + readString.split(this.lineBreak)[0]
      + ((foundLineCounter == 0) ? "" : this.lineBreak);
    chunkReaderObject.callback(undefined, firstLine);
  },

  __createNewBuffer: function(chunkReaderObject, readString)
  {
    if (Buffer.byteLength(readString, this.encoding) != chunkReaderObject.buffer.length) {
      chunkReaderObject.bufferOffset = chunkReaderObject.buffer.length - Buffer.byteLength(readString, this.encoding);

      var newBuffer = new Buffer(this.chunkSize + chunkReaderObject.bufferOffset);
      chunkReaderObject.buffer.copy(newBuffer, 0, Buffer.byteLength(readString, this.encoding));
      chunkReaderObject.buffer = newBuffer;
    } else {
      chunkReaderObject.buffer = new Buffer(this.chunkSize);
    }
  },

  __getCurrentPositionAndReadNextChunk: function(chunkReaderObject)
  {
    this.file.seek(0, (function (err, currChunkPos) {
      if (err) {
        callback(err);
        return;
      }
      this.file.read(this.chunkSize, (function(err, buffer, bytesRead) {
        if (err) {
          chunkReaderObject.callback(err);
          return;
        }

        var sizeAdjustedBuffer = buffer.slice(0, bytesRead + chunkReaderObject.bufferOffset);
        this._readOneChunk(err, chunkReaderObject.callback, sizeAdjustedBuffer, currChunkPos, chunkReaderObject.nextChunkFragment);
      }).bind(this), chunkReaderObject.buffer, chunkReaderObject.bufferOffset);
    }).bind(this), this.__self.SEEK_CUR);
  },

  writeLine: function(line, callback)
  {
    var $this = this;
    this.seekLine(this.currentLine, function() {
      $this.file.write(new $this.buffer(line + $this.lineBreak, $this.encoding), function(err) {
        if (err == undefined) {
          var indexesToRemove = $this.index.length - $this.currentLine - 1;
          for (var i = 0; i < indexesToRemove; i++) {
            $this.index.pop();
          }
        }
        callback(err);
      });
    });
  },

  seekLine: function(lineNumber, callback)
  {
    var $this = this;
    if (this.index[lineNumber] !== undefined) {
      this.__seekDirectlyToLine(lineNumber, callback);
      return;
    }
    this.__seekByReadingFromEndOfIndex(lineNumber, callback);
  },

  __seekDirectlyToLine: function(lineNumber, callback)
  {
    var $this = this;
    this.file.seek(0, function(err, position) {
      $this.file.seek($this.index[lineNumber] - position, function(err, position) {
        if (err == undefined) {
          $this.currentLine = lineNumber;
        }
        callback(err);
      }, $this.__self.SEEK_CUR);
    }, this.__self.SEEK_CUR);
  },

  __seekByReadingFromEndOfIndex: function(lineNumber, callback)
  {
    var $this = this;
    this.seekLine(this.index.length - 1, function(err) {
      if (err != undefined) {
        callback(err);
      } else {
        $this._readOneChunk(undefined, function() {
          $this.seekLine(lineNumber, callback);
        });
      }
    });
  },

  getLineCount: function(callback)
  {
    if (this.lineCount != undefined) {
      callback(undefined, this.lineCount);
      return;
    }
    var $this = this;
    var originalCurrentLine = this.currentLine;

    this.__readTillEndOfFile(function(err) {
      if (err) {
        callback(err);
        return;
      }
      $this.seekLine(originalCurrentLine, function(err) {
        if (err) {
          callback(err);
          return;
        }
        $this.lineCount = $this.index.length;
        callback(undefined, $this.index.length);
      });
    });
  },

  __readTillEndOfFile: function(callback)
  {
    var $this = this;
    var previousLastLine = this.index.length;
    this.readLine(function(err) {
      if (err) {
        callback(err);
        return;
      }

      if (previousLastLine == $this.index.length) {
        callback();
        return;
      }

      $this.__readTillEndOfFile(callback);
    }, this.index.length - 1);
  }
});
