defineClass('Consoloid.OS.File.CatalogueInterface', 'Consoloid.Base.Object',
  {
    getFileInfosFromCatalogueAsync: function(name, callback) {},
    getFileChunkAsync: function(catalogueName, fileId, offset, chunkSize, callback) {}
  }
);