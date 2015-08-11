defineClass('Consoloid.OS.File.AbstractFileDecorator', 'Consoloid.OS.File.FileInterface', {
  __constructor: function(options)
  {
    this.__base(options);

    this.requireProperty('file');
    if (!(this.file instanceof Consoloid.OS.File.FileInterface)) {
      throw new Error("File was not instance of Consoloid.OS.File.FileInterface");
    }
  },

  open: function(name, flags, callback, mode)
  {
    this.file.open(name, flags, callback, mode);
  },

  read: function(length, callback, buffer, offset, position)
  {
    this.file.read(length, callback, buffer, offset, position);
  },

  getEOF: function()
  {
    return this.file.getEOF();
  },

  getFID: function()
  {
    return this.file.getFID();
  },

  write: function(buffer, callback, offset, length, position)
  {
    this.file.write(buffer, callback, offset, length, position);
  },

  seek: function(offset, callback, whence)
  {
    this.file.seek(offset, callback, whence);
  },

  close: function(callback)
  {
    this.file.close(callback);
  }
});