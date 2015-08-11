defineClass('Consoloid.Form.FileCatalogue', 'Consoloid.OS.File.CatalogueInterface',
  {
    __constructor: function(options)
    {
      this.__base($.extend({
        maxChunkSize: (4 * 1024 * 1024)
      }, options));

      this.catalogue = {};
      this.nextId = 0;
    },

    addFilesToCatalogue: function(catalogueName, files)
    {
      if (!this.catalogue[catalogueName]) {
        this.catalogue[catalogueName] = {};
      }

      files.forEach(function(file, index) {
        this.addFile(catalogueName, file);
      }, this);
    },

    addFile: function(catalogueName, file)
    {
      this.__validateFile(file);
      this.__validateId(catalogueName);

      var id = this.nextId++;
      this.catalogue[catalogueName][id] = file;

      return id;
    },

    __validateFile: function(file)
    {
      if (!(file instanceof File)) {
        throw new Error(file + ' is not a file object.');
      }

      return true;
    },

    __validateId: function(catalogueName, fileId)
    {
      if (this.catalogue[catalogueName] === undefined) {
        throw new Error('There is no catalogue with name ' + catalogueName);
      }
      if (fileId && this.catalogue[catalogueName][fileId] === undefined) {
        throw new Error('There is no file with id = ' + fileId + ' in ' + catalogueName);
      }

      return true;
    },

    deleteCatalogue: function(name)
    {
      if (this.catalogue.hasOwnProperty(name)) {
        this.catalogue[name] = undefined;
        delete this.catalogue[name];
      }
    },

    removeFileFromCatalogue: function(name, id) {
      this.__validateId(name, id);

      delete this.catalogue[name][id];
    },

    getFilesFromCatalogue: function(name)
    {
      if (!this.catalogue[name]) {
        return [];
      }

      var
        files = [],
        catalogue = this.catalogue[name];
      Object.keys(this.catalogue[name]).forEach(function(index){
        files.push(catalogue[index]);
      });

      return files;
    },

    getFileInfosFromCatalogue: function(name)
    {
      if (!this.catalogue[name]) {
        return {};
      }

      var
        fileInfos = {},
        catalogue = this.catalogue[name]
      Object.keys(this.catalogue[name]).forEach(function(id){
        var file = catalogue[id];
        fileInfos[id] = {name: file.name, size: file.size, type: file.type};
      });

      return fileInfos;
    },

    getFileInfosFromCatalogueAsync: function(callback, name)
    {
      callback(null, this.getFileInfosFromCatalogue(name));
    },

    getFileChunkAsync: function(callback, catalogueName, fileId, offset, chunkSize)
    {
      this.__validateId(catalogueName, fileId);
      var file = this.catalogue[catalogueName][fileId];

      var blob = file.slice(offset, this.__getChunkSize(file.size, offset, chunkSize));

      var reader = new FileReader();
      reader.addEventListener("loadend", function() {
        callback(null, new Uint8Array(reader.result));
      });
      reader.readAsArrayBuffer(blob);
    },

    __getChunkSize: function(fileSize, offset, chunkSize)
    {
      if (offset > fileSize) {
        throw new Error('Required file chunk is out of file size.');
      }
      if (chunkSize > this.maxChunkSize) {
        chunkSize = this.maxChunkSize;
      }
      if (offset + chunkSize > fileSize) {
        chunkSize = fileSize - offset;
      }

      return chunkSize;
    }
  }
);