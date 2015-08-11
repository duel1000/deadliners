// TO-DOs
//  validate: selected file already in list, size, sizes, file count
//  DnD file selection + better template

defineClass('Consoloid.Form.File', 'Consoloid.Form.AutoValidatingField',
  {
    __constructor: function(options)
    {
      this.__base($.extend({
        templateId: 'Consoloid-Form-File',
        type: 'file',
        multipleFiles: true
      }, options));

      this.addEventListener('input[id=' + this.id + ']', 'change', this.__updateFileList.bind(this));
      this.addEventListener('#file_select-' + this.id + ' .remove-file-id', 'click', this.__removeFile.bind(this));
      this.fileList = [];
    },

    __updateFileList: function()
    {
      var $this = this;

      if(this.multipleFiles) {
        $.each(this.__getFileObjectsFromInput(),function(index, file){
          $this.fileList.push(file);
        });
      } else {
        this.fileList[0] = this.__getFileObjectsFromInput()[0];
      }

      this.render();
    },

    __removeFile: function(event)
    {
      this.fileList.splice(event.currentTarget.attributes["data-id"].value, 1);
      this.render();
    },

    __getFileObjectsFromInput: function()
    {
      return $("#" + this.id).prop("files");
    },

    getValue: function()
    {
      return {
        catalogueName: this.id,
        fileInfos: this.container.get('file_catalogue').getFileInfosFromCatalogue(this.id)
      };
    },

    parseUserInput: function()
    {
      this.container.get('file_catalogue').deleteCatalogue(this.id);
      this.container.get('file_catalogue').addFilesToCatalogue(this.id, this.fileList);
    }
  }
);
