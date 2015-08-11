require("consoloid-os/Consoloid/OS/File/CatalogueInterface");
require("../FileCatalogue");
require("consoloid-framework/Consoloid/Test/UnitTest");
describeUnitTest('Consoloid.Form.FileCatalogue', function() {
  var
    fileCatalogue,
    file,
    fileReader;

  beforeEach(function() {
    var createObject = function (o) {
      function F() {}
      F.prototype = o;
      return new F();
    };

    global.File = function() {
      var $this = createObject(File.prototype);
      $this.name = 'fileName';
      $this.path = 'path/';
      $this.size = 1024;
      $this.type = 'image/jpg';
      $this.slice = sinon.stub().returns('blob');

      return $this;
    }

    file = File();

    global.FileReader = function() {
      var $this = createObject(File.prototype);
      $this.readAsArrayBuffer = sinon.stub().returns('chunk');
      $this.addEventListener = sinon.stub();
      return $this;
    }

    fileCatalogue = env.create('Consoloid.Form.FileCatalogue', { maxChunkSize: 256 });
  });

  describe('#addFile(catalogueName, file)', function() {
    beforeEach(function(){
      fileCatalogue.catalogue['test'] = {};
    });

    it('should validate the file paramter for the File instance', function() {
      (function(){ fileCatalogue.addFile('test', 'its s string'); }).should.throw();
      (function(){ fileCatalogue.addFile('test', {}); }).should.throw();

      fileCatalogue.addFile('test', file);
    });

    it('should add file to fileCatalogue object on key "id"', function() {
      fileCatalogue.addFile('test', file);

      fileCatalogue.catalogue['test'].should.include({ 0: file })
    });

    it('should always generate unique id', function() {
      for(var i = 0, loopCount = 10; i < loopCount; i++) {
        fileCatalogue.addFile('test', file);
      }

      (Object.keys(fileCatalogue.catalogue['test'])).length.should.be.eql(loopCount);
    });

    it('should return the unique id', function() {
      var id = fileCatalogue.addFile('test', file);
      id.should.be.eql(0);
    });
  });

  describe('#addFilesToCatalogue(catalogueName, files)', function(){
    it('should create a catalogue with the given name if it does not exist', function(){
      fileCatalogue.catalogue.should.not.have.property('test')

      fileCatalogue.addFilesToCatalogue('test', []);

      fileCatalogue.catalogue.test.should.be.ok;
    });

    it('should add files to the given catalogue', function(){
      fileCatalogue.addFilesToCatalogue('test', [file, file]);
      (Object.keys(fileCatalogue.catalogue['test'])).length.should.be.eql(2);

      fileCatalogue.addFilesToCatalogue('test', [file, file]);
      (Object.keys(fileCatalogue.catalogue['test'])).length.should.be.eql(4);
    });
  });

  describe('#deleteCatalogue(name)', function(){
    it('should do nothing if the fileCatalogue does not have catalogue with the given name', function(){
      fileCatalogue.should.not.have.property('test');
      fileCatalogue.deleteCatalogue('test');
      fileCatalogue.should.not.have.property('test');
    });

    it('should delete the catalogue from the fileCatalogue', function(){
      fileCatalogue.addFilesToCatalogue('test', [file, file]);
      fileCatalogue.deleteCatalogue('test');
      fileCatalogue.should.not.have.property('test');
    });
  });

  describe('#removeFileFromCatalogue(name, id)', function() {
    it("should remove the file with the id", function() {
      fileCatalogue.addFilesToCatalogue('test', [file, file]);
      fileCatalogue.removeFileFromCatalogue('test', 0);
      (fileCatalogue.getFileInfosFromCatalogue('test')[0] == undefined).should.be.ok;
    });

    it("should throw error on invalid id or invalid catalogue", function() {
      (function() {
        fileCatalogue.removeFileFromCatalogue('test', "foobar");
      }).should.throw();

      fileCatalogue.addFilesToCatalogue('test', [file]);
      (function() {
        fileCatalogue.removeFileFromCatalogue('test', "foobar");
      }).should.throw();
    });
  });

  describe('#getFilesFromCatalogue(name)', function(){
    it('should return an empty array if the catalogue does not exist', function(){
      fileCatalogue.getFilesFromCatalogue('test').length.should.be.eql(0);
    });

    it('should return an array with the file objects', function(){
      fileCatalogue.addFilesToCatalogue('test', [file, file]);

      var files = fileCatalogue.getFilesFromCatalogue('test');
      files.length.should.be.eql(2);
      files[0].should.be.eql(file);
      files[1].should.be.eql(file);
    });
  });

  describe('#getFileInfosFromCatalogue(name)', function(){
    it('should return an empty array if the catalogue does not exist', function(){
      Object.keys(fileCatalogue.getFileInfosFromCatalogue('test')).length.should.be.eql(0);
    });

    it('should return an array with the file objects', function(){
      fileCatalogue.addFilesToCatalogue('test', [file, file]);

      var
        fileInfos = fileCatalogue.getFileInfosFromCatalogue('test'),
        ids = Object.keys(fileInfos);

      ids.length.should.be.eql(2);
      fileInfos[ids[0]].name.should.be.eql('fileName');
      fileInfos[ids[0]].type.should.be.eql('image/jpg');
      fileInfos[ids[0]].size.should.be.eql(1024);
      fileInfos[ids[0]].should.be.eql(fileInfos[ids[1]]);
    });
  });

  describe('#getFileChunkAsync(catalogueName, fileId, offset, chunkSize, callback)', function() {
    var
      id;

    beforeEach(function(){
      fileCatalogue.addFilesToCatalogue('test', []);
      id = fileCatalogue.addFile('test', file);
    });

    it('should validate arguments', function() {
      (function() {
        fileCatalogue.getFileChunkAsync(sinon.stub(), 'test', 'unknown', 0, 0);
      }).should.throwError('There is no file with id = unknown in test');

      (function() {
        fileCatalogue.getFileChunkAsync(sinon.stub(), 'test', id, file.size + 1, 0);
      }).should.throwError('Required file chunk is out of file size.');
    });

    it('should change chunkSize if exceeds filesize or maxChunkSize', function() {
      fileCatalogue.getFileChunkAsync(function(chunk) {
        file.slice.calledWithExactly(0, fileCatalogue.maxChunkSize);

        fileCatalogue.getFileChunkAsync(function(chunk) {
          file.slice.calledWithExactly(0, file.size);
        }, 'test', id, 900, 128);
      }, 'test', id, 0, 512);
    });

    it('should return the chunk', function() {
      fileCatalogue.getFileChunkAsync(function(chunk) {
        chunk.should.be.eql('chunk');
      }, 'test', id, 0, 1);
    });
  });

  afterEach(function(){
    delete global.File;
  });

});