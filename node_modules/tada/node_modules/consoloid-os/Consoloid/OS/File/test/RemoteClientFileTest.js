require('../FileInterface.js');
require('../RemoteClientFile.js');

require('consoloid-framework/Consoloid/Test/UnitTest');
describeUnitTest('Consoloid.OS.File.RemoteClientFile', function() {
  var
    file,
    asyncRPCPeer,
    fileInfos,
    callback,
    buffer;
  beforeEach(function() {
    asyncRPCPeer = {
      callAsyncOnSharedService: sinon.stub(),
    };
    env.addServiceMock('async_rpc_handler_server', asyncRPCPeer);

    fileInfos = {
      "foo_bar": {
        name: "Foo.bar",
        size: 5,
        type: "text/plain"
      }
    };

    buffer = require('buffer').Buffer;

    file = env.create(Consoloid.OS.File.RemoteClientFile, { catalogue: "foo_catalogue" });
    callback = sinon.stub();
  });

  describe('#__constructor()', function() {
    it('sould require a catalogue name', function() {
      (function() {
        env.create(Consoloid.OS.File.RemoteClientFile, { });
      }).should.throwError();
    });
  });

  describe("#open(id, flags, callback)", function() {
    it('should check if file id exists in the catalogue, if exists, store id', function() {
      file.open('foo_bar', 'r', callback);
      asyncRPCPeer.callAsyncOnSharedService.calledOnce.should.be.ok;

      asyncRPCPeer.callAsyncOnSharedService.args[0][0].should.equal("file_catalogue");
      asyncRPCPeer.callAsyncOnSharedService.args[0][1].should.equal("getFileInfosFromCatalogueAsync");
      asyncRPCPeer.callAsyncOnSharedService.args[0][2][0].should.equal("foo_catalogue");
      (typeof asyncRPCPeer.callAsyncOnSharedService.args[0][3] == "function").should.be.true;
      (typeof asyncRPCPeer.callAsyncOnSharedService.args[0][4] == "function").should.be.true;
      (typeof asyncRPCPeer.callAsyncOnSharedService.args[0][5] == "function").should.be.true;

      asyncRPCPeer.callAsyncOnSharedService.args[0][3](fileInfos);

      file.id.should.equal('foo_bar');
      callback.calledOnce.should.be.ok;
    });

    it('should call the callback with the error', function() {
      file.open('/foo/bar', 'r', callback);
      asyncRPCPeer.callAsyncOnSharedService.args[0][4]('This is an error message.');

      callback.calledOnce.should.be.ok;
      callback.args[0][0].should.equal('This is an error message.');
    });

    it('should set the eof property to false', function() {
      file.open('foo_bar', 'r', callback);

      asyncRPCPeer.callAsyncOnSharedService.args[0][3](fileInfos);

      file.eof.should.equal(false);
    });

    it('should set the position property to 0', function() {
      file.open('foo_bar', 'r', callback);

      asyncRPCPeer.callAsyncOnSharedService.args[0][3](fileInfos);

      file.position.should.equal(0);
    });

    it('should send an error if there is already an opened file', function() {
      file.id = "barID";

      file.open('foo_barr', 'r', callback);

      asyncRPCPeer.callAsyncOnSharedService.called.should.not.be.ok;
      callback.calledOnce.should.be.ok;
      callback.args[0][0].should.be.ok;
    });

    it("should only allow 'r' mode", function() {
      file.open('foo_barr', 'r+', callback);
      callback.args[0][0].should.be.ok;
      file.open('foo_barr', 'rs', callback);
      callback.args[1][0].should.be.ok;
      file.open('foo_barr', 'rs+', callback);
      callback.args[2][0].should.be.ok;
      file.open('foo_barr', 'w', callback);
      callback.args[3][0].should.be.ok;
      file.open('foo_barr', 'wx', callback);
      callback.args[4][0].should.be.ok;
      file.open('foo_barr', 'a', callback);
      callback.args[5][0].should.be.ok;
      file.open('foo_barr', 'ax', callback);
      callback.args[6][0].should.be.ok;
      file.open('foo_barr', 'a+', callback);
      callback.args[7][0].should.be.ok;
      file.open('foo_barr', 'ax+', callback);
      callback.args[8][0].should.be.ok;
    });
  });

  describe("after opening a file", function() {
    var decoder;
    beforeEach(function() {
      decoder = new (require('string_decoder').StringDecoder)();
      file.open('foo_bar', 'r', function() {});
      asyncRPCPeer.callAsyncOnSharedService.args[0][3](fileInfos);
    });

    describe("#read(length, callback, [buffer], [offset], [position])", function() {
      it('should read the file async, with the length, from the position', function() {
        file.read(5, callback, undefined, undefined, 1);

        asyncRPCPeer.callAsyncOnSharedService.args[1][0].should.equal("file_catalogue");
        asyncRPCPeer.callAsyncOnSharedService.args[1][1].should.equal("getFileChunkAsync");
        asyncRPCPeer.callAsyncOnSharedService.args[1][2][0].should.equal("foo_catalogue");
        asyncRPCPeer.callAsyncOnSharedService.args[1][2][1].should.equal("foo_bar");
        asyncRPCPeer.callAsyncOnSharedService.args[1][2][2].should.equal(1);
        asyncRPCPeer.callAsyncOnSharedService.args[1][2][3].should.equal(5);
        (typeof asyncRPCPeer.callAsyncOnSharedService.args[1][3] == "function").should.be.true;
        (typeof asyncRPCPeer.callAsyncOnSharedService.args[1][4] == "function").should.be.true;
        (typeof asyncRPCPeer.callAsyncOnSharedService.args[1][5] == "function").should.be.true;
      });

      it('should add the returned data to the buffer', function() {
        var buf = new buffer(6);
        buf.writeUInt8(0x66, 0);

        file.read(5, callback, buf, 1);
        asyncRPCPeer.callAsyncOnSharedService.args[1][2][2].should.equal(0);
        asyncRPCPeer.callAsyncOnSharedService.args[1][3](new Buffer("oobar"));

        callback.calledOnce.should.be.ok;
        decoder.write(callback.args[0][1]).should.equal("foobar");
        callback.args[0][2].should.equal(5);
      });

      it('should create new buffer if not set, with the length of read bytes', function() {
        var buf = {"0": 0x66, "1": 0x6f, "2": 0x6f, "3": 0x62, "4": 0x61};

        file.read(5, callback);
        asyncRPCPeer.callAsyncOnSharedService.args[1][3](buf);

        callback.calledOnce.should.be.ok;
        decoder.write(callback.args[0][1]).should.equal("fooba");
        callback.args[0][2].should.equal(5);
      })

      it('should work with EOF', function() {
        file.read(6, callback);
        asyncRPCPeer.callAsyncOnSharedService.args[1][3](new Buffer("fooba"));

        file.getEOF().should.equal(true);
        file.position.should.equal(5);
      });

      it('should send an error, if there is no file open', function() {
        file.id = undefined;

        file.read(5, callback);

        asyncRPCPeer.callAsyncOnSharedService.calledTwice.should.not.be.ok;
        callback.calledOnce.should.be.ok;
        callback.args[0][0].should.be.ok;
      });

      it('should manually increase the position', function() {
        file.read(5, callback);

        asyncRPCPeer.callAsyncOnSharedService.args[1][3](new Buffer("fooba"));

        file.position.should.equal(5);
      });
    });

    describe("#getEOF()", function() {
      it('should return the eof property', function() {
        file.eof = true;
        file.getEOF().should.equal(true);

        file.eof = false;
        file.getEOF().should.equal(false);
      });
    });

    describe("#getFID()", function() {
      it('should return with the fd', function() {
        file.getFID().should.equal("foo_bar");
      });
    });

   describe("#seek(offset, callback, [whence])", function() {
      it('should seek to offset according to whence asyncronously', function() {
        file.seek(5, callback, 0);
        callback.calledOnce.should.be.ok;
        file.position.should.equal(5);
      });

      it('should fill whence as 0 (SEEK_SET) if not set', function() {
        file.seek(5, callback);
        callback.calledOnce.should.be.ok;
        file.position.should.equal(5);
      });

      it('should call the callback with the position', function() {
        file.seek(5, callback);
        callback.calledOnce.should.be.ok;
        callback.args[0][1].should.equal(5);
      });

      it('should set eof property if seek to end happened without an error', function() {
        file.seek(0, callback, 2);
        file.getEOF().should.equal(true);
      });

      it('should send an error, if there is no file open', function() {
        file.id = undefined;
        file.seek(5, callback);
        callback.args[0][0].should.be.ok;
      });

      it('should send an error, if whence is not 0 (SEEK_SET), 1 (SEEK_CUR), 2 (SEEK_END) or undefined', function() {
        file.seek(5, callback, 5);

        callback.calledOnce.should.be.ok;
        callback.args[0][0].should.be.ok;
      });
    });

    describe("#close", function() {
      it('should remove the id', function() {
        file.close(callback);

        callback.called.should.be.ok;
        (file.id == undefined).should.be.ok;
      });

      it('should send an error, if there is no file open', function() {
        file.id = undefined;

        file.close(callback);

        callback.calledOnce.should.be.ok;
        callback.args[0][0].should.be.ok;
      });
    });
  });
});