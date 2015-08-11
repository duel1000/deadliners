require('../FileInterface.js');
require('../File.js');

require('consoloid-framework/Consoloid/Test/UnitTest');
describeUnitTest('Consoloid.OS.File.File', function() {
  var
    file,
    fsMock,
    callback;
  beforeEach(function() {
    fsMock = {
      open: sinon.stub(),
      read: sinon.stub(),
      write: sinon.stub(),
      seek: sinon.stub(),
      close: sinon.stub()
    };

    file = env.create(Consoloid.OS.File.File, { fs: fsMock });
    callback = sinon.stub();
  });

  describe('#__constructor()', function() {
    it('sould set default value for fs', function() {
      file = env.create(Consoloid.OS.File.File, {});
      file.fs.should.be.ok;
    });
  });

  describe("#open(path, flags, callback, [mode])", function() {
    it('should open the file asyncronously with the set flags and mode, and store the fd', function() {
      file.open('/foo/bar', 'r', callback, '0666');

      fsMock.open.calledOnce.should.be.ok;
      fsMock.open.args[0][0].should.equal('/foo/bar');
      fsMock.open.args[0][1].should.equal('r');
      fsMock.open.args[0][2].should.equal('0666');
      (typeof(fsMock.open.args[0][3])).should.equal('function');

      fsMock.open.args[0][3](undefined, 'fooFD');

      callback.calledOnce.should.be.ok;

      file.fd.should.equal('fooFD');
    });

    it('should call the callback with the error', function() {
      file.open('/foo/bar', 'r', callback);
      fsMock.open.args[0][3]('This is an error message.', 'fooFD');

      callback.calledOnce.should.be.ok;
      callback.args[0][0].should.equal('This is an error message.');
    });

    it('should store the flags in a property', function() {
      file.open('/foo/bar', 'r', callback);

      fsMock.open.args[0][3](undefined, 'fooFD');

      file.flags.should.equal('r');
    });

    it('should set the eof property to false', function() {
      file.open('/foo/bar', 'r', callback);

      fsMock.open.args[0][3](undefined, 'fooFD');

      file.eof.should.equal(false);
    });

    it('should send an error if there is already an opened file', function() {
      file.fd = "barFD";

      file.open('/foo/bar', 'r', callback);

      fsMock.open.called.should.not.be.ok;
      callback.calledOnce.should.be.ok;
      callback.args[0][0].should.be.ok;
    });
  });

  describe("after opening a file", function() {
    beforeEach(function() {
      file.open('/foo/bar', 'r+', function() {});
      fsMock.open.args[0][3](undefined, 'fooFD');
    });

    describe("#read(length, callback, [buffer], [offset], [position])", function() {
      it('should read the file async, with the length, from the position', function() {
        file.read(5, callback, undefined, undefined, 1);

        fsMock.read.calledOnce.should.be.ok;
        fsMock.read.args[0][0].should.equal('fooFD');
        fsMock.read.args[0][2].should.equal(0);
        fsMock.read.args[0][3].should.equal(5);
        fsMock.read.args[0][4].should.equal(1);
        (typeof(fsMock.read.args[0][5])).should.equal('function');
      });

      it('should call the callback with the buffer containing the read bytes', function() {
        file.read(5, callback, "bufferMock", 2);
        fsMock.read.args[0][1].should.equal("bufferMock");

        fsMock.read.args[0][5](undefined, 5, "bufferMock");

        callback.calledOnce.should.be.ok;
        callback.args[0][1].should.equal("bufferMock");
      });

      it('should create new buffer if not set, with the length of read bytes', function() {
        file.read(5, callback);

        fsMock.read.args[0][1].length.should.equal(5);
      })

      it('should set the eof property', function() {
        file.read(5, callback, "bufferMock", undefined, 1);

        fsMock.read.args[0][5](undefined, 2, "bufferMock");

        file.eof.should.equal(true);
      });

      it('should send an error, if there is no file open', function() {
        file.fd = undefined;

        file.read(5, callback);

        fsMock.read.called.should.not.be.ok;
        callback.calledOnce.should.be.ok;
        callback.args[0][0].should.be.ok;
      });

      it('should send an error, if mode does not allow reading', function() {
        file.flags = 'w';
        file.read(5, callback);
        callback.args[0][0].should.be.ok;

        file.flags = 'wx';
        file.read(5, callback);
        callback.args[1][0].should.be.ok;

        file.flags = 'a';
        file.read(5, callback);
        callback.args[2][0].should.be.ok;

        file.flags = 'ax';
        file.read(5, callback);
        callback.args[3][0].should.be.ok;
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
        file.getFID().should.equal("fooFD");
      });
    });

    describe("#write(buffer, callback, [offset], [length], [position])", function() {
      var
        bufferMock;
      beforeEach(function() {
        bufferMock = {
          length: 5
        };
      });

      it('should write the buffer to the file async', function() {
        file.write(bufferMock, callback);

        fsMock.write.calledOnce.should.be.ok;
        fsMock.write.args[0][0].should.equal('fooFD');
        fsMock.write.args[0][1].should.equal(bufferMock);
        fsMock.write.args[0][2].should.equal(0);
        fsMock.write.args[0][3].should.equal(5);
        (typeof(fsMock.write.args[0][5])).should.equal('function');
      });

      it('should write from offset till length in the buffer, to position if set', function() {
        file.write(bufferMock, callback, 3, 2, 1);

        fsMock.write.calledOnce.should.be.ok;
        fsMock.write.args[0][0].should.equal('fooFD');
        fsMock.write.args[0][1].should.equal(bufferMock);
        fsMock.write.args[0][2].should.equal(3);
        fsMock.write.args[0][3].should.equal(2);
        fsMock.write.args[0][4].should.equal(1);
        (typeof(fsMock.write.args[0][5])).should.equal('function');
      });

      it('should call the callback with whatever fs.Write calls it', function() {
        file.write(bufferMock, callback);

        fsMock.write.args[0][5]("foo error msg");

        callback.calledOnce.should.be.ok;
        callback.args[0][0].should.equal("foo error msg");
      });

      it('should send an error, if there is no file open', function() {
        file.fd = undefined;

        file.write(5, callback);

        fsMock.write.called.should.not.be.ok;
        callback.calledOnce.should.be.ok;
        callback.args[0][0].should.be.ok;
      });

      it('should send an error, if mode does not allow writing', function() {
        file.flags = 'r';
        file.write(5, callback);
        callback.args[0][0].should.be.ok;

        file.flags = 'rs';
        file.write(5, callback);
        callback.args[1][0].should.be.ok;
      });

      it('should send number of bytes written to callback', function() {
        file.write(5, callback);

        fsMock.write.args[0][5](undefined, 3);
        callback.args[0][1].should.equal(3);
      });
    });

    describe("#seek(offset, callback, [whence])", function() {
      it('should seek to offset according to whence asyncronously', function() {
        file.seek(-5, callback, Consoloid.OS.File.File.SEEK_END);

        fsMock.seek.called.should.be.ok;

        fsMock.seek.args[0][0].should.equal('fooFD');
        fsMock.seek.args[0][1].should.equal(-5);
        fsMock.seek.args[0][2].should.equal(Consoloid.OS.File.File.SEEK_END);
        (typeof(fsMock.seek.args[0][3])).should.equal('function');
      });

      it('should fill whence as 0 (SEEK_SET) if not set', function() {
        file.seek(5, callback);

        fsMock.seek.args[0][2].should.equal(Consoloid.OS.File.File.SEEK_SET);
      });

      it('should call the callback with the position and the error', function() {
        file.seek(5, callback);

        fsMock.seek.args[0][3]("err", 5);

        callback.calledOnce.should.be.ok;
        callback.args[0][0].should.equal("err");
        callback.args[0][1].should.equal(5);
      });

      it('should set eof property if seek to end happened without an error', function() {
        file.eof = false;

        file.seek(0, callback, Consoloid.OS.File.File.SEEK_END);

        fsMock.seek.args[0][3](null, 5);

        file.eof.should.equal(true);
      });

      it('should send an error, if there is no file open', function() {
        file.fd = undefined;

        file.seek(5, callback);

        fsMock.seek.called.should.not.be.ok;
        callback.calledOnce.should.be.ok;
        callback.args[0][0].should.be.ok;
      });

      it('should send an error, if whence is not 0 (SEEK_SET), 1 (SEEK_CUR), 2 (SEEK_END) or undefined', function() {
        file.seek(5, callback, 5);

        callback.calledOnce.should.be.ok;
        callback.args[0][0].should.be.ok;
      });
    });

    describe("#close", function() {
      it('should close the file asyncronously', function() {
        file.close(callback);

        fsMock.close.calledOnce.should.be.ok;
        fsMock.close.args[0][0].should.equal('fooFD');
        (typeof(fsMock.close.args[0][1])).should.equal('function');

        fsMock.close.args[0][1]();

        callback.called.should.be.ok;
        (file.fd === undefined).should.equal(true);
        (file.flags === undefined).should.equal(true);
        (file.eof === undefined).should.equal(true);
      });

      it('should send the error message sent by fs.close', function() {
        file.close(callback);

        fsMock.close.args[0][1]('error message');

        callback.args[0][0].should.equal('error message');
      })

      it('should send an error, if there is no file open', function() {
        file.fd = undefined;

        file.close(callback);

        fsMock.close.called.should.not.be.ok;

        callback.calledOnce.should.be.ok;
        callback.args[0][0].should.be.ok;
      });
    });
  });
});