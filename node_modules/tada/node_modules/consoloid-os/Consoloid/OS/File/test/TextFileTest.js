require('../FileInterface.js');
require('../AbstractFileDecorator.js');
require('../File.js');
require('../TextFile.js');

require('consoloid-framework/Consoloid/Test/UnitTest');

describeUnitTest('Consoloid.OS.File.TextFile', function() {
  var
    file,
    sourceFile,
    callback;
  beforeEach(function() {
    callback = sinon.stub();

    sourceFile = env.create(Consoloid.OS.File.File, {});
    file = env.create(Consoloid.OS.File.TextFile, { file: sourceFile });
  });

  describe("#open()", function() {
    it("should fill the default values on a successful open", function() {
      var fsMock = {
          open: sinon.stub()
      };
      var mockedFile = env.create(Consoloid.OS.File.File, { fs: fsMock });
      file = env.create(Consoloid.OS.File.TextFile, { file: mockedFile });
      file.open('/foo/bar', 'r', callback);
      fsMock.open.args[0][3](undefined, 'fooFD');

      file.currentLine.should.equal(0);
      file.index[0].should.equal(0);

      callback.called.should.be.ok;
    });
  });

  describe("#read(), #write(), #seek()", function() {
    it('should throw an exception', function() {
      (function() { file.read(); }).should.throwError();
      (function() { file.write(); }).should.throwError();
      (function() { file.seek(); }).should.throwError();
    });
  });

  describe("#readLine(callback, [lineNumber])", function() {
    it("should read one line from current position and send that to the callback", function(done) {
      file.open(__dirname + '/test.txt', 'r', function(err) {
        file.readLine(function(err, line) {
          line.should.equal("Abcdef\n");
          done();
        });
      });
    });

    it("should always seek to currentline before reading, because chunked reading messes up file position", function(done) {
      sinon.spy(file, "seekLine");
      file.open(__dirname + '/test.txt', 'r', function(err) {
        file.readLine(function(err, line) {
          file.seekLine.called.should.be.ok;
          line.should.equal("Abcdef\n");
          done();
        });
      });
    });

    it("should read the line with the lineNumber and send that to the callback", function(done) {
      file.open(__dirname + '/test.txt', 'r', function(err) {
        file.index[1] = 7;
        file.readLine(function(err, line) {
          line.should.equal("Ghijkl\n");
          done();
        }, 1);
      });
    });

    it("should read the line with the lineNumber, even if that line is 0", function(done) {
      file.open(__dirname + '/test.txt', 'r', function(err) {
        file.index[1] = 7;
        file.readLine(function(err, line) {
          file.readLine(function(err, line) {
            line.should.equal("Abcdef\n");
            done();
          }, 0);
        }, 1);
      });
    });

    it("should read the nth line with the lineNumber and send that to the callback, even if it's not in the index", function(done) {
      file.open(__dirname + '/test.txt', 'r', function(err) {
        file.readLine(function(err, line) {
          line.should.equal("Ghijkl\n");
          done();
        }, 1);
      });
    });

    it("should fill the index with all the new line/position information", function(done) {
      file.open(__dirname + '/test.txt', 'r', function(err) {
        file.readLine(function(err, line) {
          file.index[1].should.equal(7);
          file.index[2].should.equal(14);
          done();
        }, 2);
      });
    });

    it("should read file in chunks", function(done) {
      sinon.spy(sourceFile, "_read");
      file.chunkSize = 4096;

      file.open(__dirname + '/test.txt', 'r', function(err) {
        file.readLine(function(err, line) {
          file.index[1].should.equal(7);
          file.index[2].should.equal(14);

          sourceFile._read.calledOnce.should.be.ok;
          sourceFile._read.args[0][0].should.equal(4096);
          done();
        }, 0);
      });
    });

    it("should do chunk file reading, while caring about undecoded multibyte character bytes from the end of the previous chunk", function(done) {
      file.chunkSize = 1;
      file.open(__dirname + '/test.txt', 'r', function(err) {
        file.readLine(function(err, line) {
          line.should.equal("ŐŰőű");
          done();
        }, 3);
      });
    });
  });

  describe("#writeLine(line, callback)", function() {
    it("should write one line to current position and call the callback", function(done) {
      file.open('/tmp/consoloid_textfile_test.txt', 'w', function(err) {
        file.writeLine("FooBar", function(err) {
          (err == undefined).should.equal(true);
          sourceFile.fs.closeSync(sourceFile.fd);
          data = sourceFile.fs.readFileSync('/tmp/consoloid_textfile_test.txt');
          data.toString().should.equal("FooBar\n");
          sourceFile.fs.unlinkSync('/tmp/consoloid_textfile_test.txt');
          done();
        });
      });
    });

    it("should drop index for all following lines from currentline on a succesfull write", function(done) {
      sourceFile.fs.writeFileSync('/tmp/consoloid_textfile_test.txt', 'FooBar\nBarFoo\nBar');
      file.open('/tmp/consoloid_textfile_test.txt', 'r+', function(err) {
        file.index[1] = 7;
        file.index[2] = 14;
        file.writeLine("FooBar", function(err) {
          file.index.length.should.equal(1);
          (file.index[1] === undefined).should.equal(true);
          (file.index[2] === undefined).should.equal(true);
          sourceFile.fs.unlinkSync('/tmp/consoloid_textfile_test.txt');
          done();
        });
      });
    });

    it("should seek to line before writing, because chunked reading messes up position", function(done) {
      sinon.spy(file, "seekLine");
      file.open('/tmp/consoloid_textfile_test.txt', 'w', function(err) {
        file.writeLine("FooBar", function(err) {
          file.seekLine.called.should.be.ok;

          (err == undefined).should.equal(true);
          sourceFile.fs.closeSync(sourceFile.fd);
          data = sourceFile.fs.readFileSync('/tmp/consoloid_textfile_test.txt');
          data.toString().should.equal("FooBar\n");
          sourceFile.fs.unlinkSync('/tmp/consoloid_textfile_test.txt');
          done();
        });
      });
    });
  });

  describe("#seekToLine(lineNumber, callback)", function() {
    it("should seek to said line position manually if no index info is available", function(done) {
      file.open(__dirname + '/test.txt', 'r', function(err) {
        file.seekLine(2, function(err) {
          (err == undefined).should.equal(true);
          file.currentLine.should.equal(2);
          done();
        });
      });
    });

    it("should seek to said line directly if it's in the index", function(done) {
      file.open(__dirname + '/test.txt', 'r', function(err) {
        file.index[1] = 7;
        file.index[2] = 14;
        sinon.spy(sourceFile, '_read');
        file.seekLine(2, function(err) {
          (err == undefined).should.equal(true);
          sourceFile._read.called.should.not.be.ok;
          file.currentLine.should.equal(2);
          done();
        });
      });
    });

    it("should fill index with all the new line/position information", function(done) {
      file.open(__dirname + '/test.txt', 'r', function(err) {
        file.seekLine(2, function(err) {
          (err == undefined).should.equal(true);
          file.index[1].should.equal(7);
          file.index[2].should.equal(14);
          done();
        });
      });
    });

    it("should do the seeking from the current position", function(done) {
      file.open(__dirname + '/test.txt', 'r', function(err) {
        file.maxLineInIndex = 1;
        file.index[1] = 7;
        sinon.spy(sourceFile.fs, 'seek');
        file.seekLine(2, function(err) {
          (err == undefined).should.equal(true);
          file.currentLine.should.equal(2);

          for(var i = 0; i < sourceFile.fs.seek.callCount; i++) {
            sourceFile.fs.seek.args[i][2].should.equal(Consoloid.OS.File.FileInterface.SEEK_CUR);
          }
          done();
        });
      });
    });

    it("should read file in chunks", function(done) {
      sinon.spy(sourceFile, "_read");
      file.chunkSize = 4096;

      file.open(__dirname + '/test.txt', 'r', function(err) {
        file.seekLine(2, function(err) {
          sourceFile._read.calledOnce.should.be.ok;
          sourceFile._read.args[0][0].should.equal(4096);
          done();
        }, 0);
      });
    });
  });

  describe("#getLineCount(callback)", function() {
    it("should callback with the line count", function(done) {
      file.open(__dirname + '/test.txt', 'r', function(err) {
        file.getLineCount(function(err, lineCount) {
          lineCount.should.equal(4);
          file.lineCount.should.equal(4);
          done();
        });
      });
    });

    it("should get the line count by seekinkg till last line, then seek back to where it was", function(done) {
      file.chunkSize = 5;
      file.open(__dirname + '/test.txt', 'r', function(err) {
        file.seekLine(2, function(err) {
          file.getLineCount(function(err, lineCount) {
            file.index.length.should.equal(4);
            file.currentLine.should.equal(2);
            done();
          });
        });
      });
    });

    it("should just call with the line count if it was already calculated", function(done) {
      file.chunkSize = 2;
      file.lineCount = 4;
      file.open(__dirname + '/test.txt', 'r', function(err) {
        file.seekLine(2, function(err) {
          file.getLineCount(function(err, lineCount) {
            file.index.length.should.not.equal(4);
            lineCount.should.equal(4);
            done();
          });
        });
      });
    });
  });
});