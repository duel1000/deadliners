defineClass('Consoloid.OS.File.RemoteClientFile', 'Consoloid.OS.File.FileInterface', {
  __constructor: function(options)
  {
    this.__base($.extend({
      eof: false,
      position: 0,
      id: undefined,
      buffer: require('buffer').Buffer
    }, options));

    this.requireProperty('catalogue');
    this.asyncRPCPear = this.get('async_rpc_handler_server');
  },

  open: function(id, flags, callback)
  {
    if (flags != "r") {
      callback("Only r mode is acceptable.");
      return;
    }
    if (this.id != undefined) {
      callback("There is already an opened file.");
      return;
    }

    this.asyncRPCPear.callAsyncOnSharedService(
      "file_catalogue",
      "getFileInfosFromCatalogueAsync",
      [ this.catalogue ],
      (function(fileInfos) {
        this.__retrivedFileInfos(fileInfos, id, callback);
      }).bind(this),
      function(err) {
        callback(err);
      },
      function() {
        callback("Opening remote file timed out.");
      }
    );
  },

  __retrivedFileInfos: function(fileInfos, id, callback)
  {
    if (!(id in fileInfos)) {
      callback("Unknown file");
      return;
    }

    this.id = id;
    this.eof = false;
    this.size = fileInfos[id].size;
    this.position = 0;
    callback(null);
  },

  read: function(length, callback, buffer, offset, position)
  {
    if (this.id == undefined) {
      callback('There is no opened file.');
      return;
    }

    this.position = position || this.position;
    this.asyncRPCPear.callAsyncOnSharedService(
      "file_catalogue",
      "getFileChunkAsync",
      [ this.catalogue, this.id, this.position, length ],
      (function(chunk) {
        this.__retrivedReadFileChunk(chunk, buffer, offset, callback);
      }).bind(this),
      function(err) {
        callback(err);
      },
      function() {
        callback("Reading remote file timed out.");
      }
    );
  },

  __retrivedReadFileChunk: function(chunk, buffer, originalOffset, callback)
  {
    offset = originalOffset || 0;
    buffer = buffer || new this.buffer(Object.keys(chunk).length + offset);
    $.each(chunk, function(index, value) {
      buffer.writeUInt8(value, offset++);
    })

    this.position = this.position + Object.keys(chunk).length;
    this.__adjustEOFValue();
    callback(null, buffer, buffer.length - (originalOffset || 0));
  },

  __adjustEOFValue: function()
  {
    if (this.position >= this.size) {
      this.eof = true;
      this.position = this.size;
    } else {
      this.eof = false;
    }
  },

  getEOF: function()
  {
    return this.eof;
  },

  getFID: function()
  {
    return this.id;
  },

  seek: function(offset, callback, whence)
  {
    if (this.id == undefined) {
      callback('There is no opened file.');
      return;
    }

    if (whence < 0 || whence > 2) {
      callback("Whence can only be set to 0, 1, 2, it was set to: " + whence);
      return;
    }

    whence = whence || this.__self.SEEK_SET;

    this.__setSeekPosition(offset, whence);

    callback(null, this.position);
  },

  __setSeekPosition: function(offset, whence)
  {
    switch(whence) {
      case this.__self.SEEK_SET:
        this.position = offset;
        break;
      case this.__self.SEEK_CUR:
        this.position += offset;
        break;
      case this.__self.SEEK_END:
        this.position = this.size + offset;
        break;
    }
    this.__adjustEOFValue();
  },

  close: function(callback)
  {
    if (this.id == undefined) {
      callback('There is no opened file.');
      return;
    }

    this.id = undefined;
    callback();
  }
});