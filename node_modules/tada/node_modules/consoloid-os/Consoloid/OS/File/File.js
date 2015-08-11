defineClass('Consoloid.OS.File.File', 'Consoloid.OS.File.FileInterface', {
  __constructor: function(options)
  {
    this.__base($.extend({
      fs: require('fs-ext'),
      buffer: require('buffer').Buffer,
      fd: undefined,
      eof: undefined,
      flags: undefined
    }, options));
  },

  open: function(path, flags, callback, mode)
  {
    if (this.fd !== undefined) {
      callback('There is already an opened file.');
      return;
    }

    var $this = this;
    this.fs.open(path, flags, mode, function(err, fd) {
      $this.fd = fd;
      $this.flags = flags;
      $this.eof = false;
      callback(err);
    });
  },

  read: function(length, callback, buffer, offset, position) {
    this._read(length, callback, buffer, offset, position);
  },

  _read: function(length, callback, buffer, offset, position)
  {
    if (this.fd === undefined) {
      callback('There is no opened file.');
      return;
    }

    if (this.flags[1] !== "+" && (this.flags[0] === "w" || this.flags[0] === "a")) {
      callback('Open flags do not allow reading: ' + this.flags);
      return;
    }

    buffer = buffer || new this.buffer(length);
    offset = offset || 0;

    var $this = this;
    this.fs.read(this.fd, buffer, offset, length, position, function(err, bytesRead, buffer) {
      if (bytesRead < length) {
        $this.eof = true;
      }
      callback(err, buffer, bytesRead);
    });
  },

  getEOF: function()
  {
    return this.eof;
  },

  getFID: function()
  {
    return this.fd;
  },

  write: function(buffer, callback, offset, length, position) {
    this._write(buffer, callback, offset, length, position);
  },

  _write: function(buffer, callback, offset, length, position) {
    if (this.fd === undefined) {
      callback('There is no opened file.');
      return;
    }

    if (this.flags === "r" || this.flags === "rs") {
      callback('Open flags do not allow writing: ' + this.flags);
      return;
    }

    length = length || buffer.length;
    offset = offset || 0;

    var $this = this;
    this.fs.write(this.fd, buffer, offset, length, position, function(err, bytesWritten, buffer) {
      callback(err, bytesWritten);
    });
  },

  seek: function(offset, callback, whence)
  {
    this._seek(offset, callback, whence);
  },

  _seek: function(offset, callback, whence)
  {
    if (this.fd === undefined) {
      callback('There is no opened file.');
      return;
    }

    whence = whence || this.__self.SEEK_SET;
    if (whence < 0 || whence > 2) {
      callback("Whence can only be set to 0, 1, 2, it was set to: " + whence);
      return;
    }

    var $this = this;
    this.fs.seek(this.fd, offset, whence, function(err, currFilePos) {
      if (whence === $this.__self.SEEK_END && offset === 0 && err == undefined) {
        $this.eof = true;
      }

      callback(err, currFilePos);
    });
  },

  close: function(callback)
  {
    if (this.fd === undefined) {
      callback('There is no opened file.');
      return;
    }

    var $this = this;
    this.fs.close(this.fd, function(err) {
      if (err == undefined) {
        $this.fd = undefined;
        $this.flags = undefined;
        $this.eof = undefined;
      }

      callback(err);
    })
  }
});