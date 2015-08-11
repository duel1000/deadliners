defineClass('Consoloid.OS.File.FileInterface', 'Consoloid.Base.Object', {
  open: function(path, flags, callback, mode) {},
  read: function(length, callback, buffer, offset, position) {},
  getEOF: function() {},
  getFID: function() {},
  write: function(buffer, callback, offset, length, position) {},
  seek: function(offset, callback, whence) {},
  close: function(callback) {}
}, {
  SEEK_SET: 0,
  SEEK_CUR: 1,
  SEEK_END: 2
});