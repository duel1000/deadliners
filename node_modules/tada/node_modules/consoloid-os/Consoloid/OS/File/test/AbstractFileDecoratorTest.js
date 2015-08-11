require('../FileInterface.js');
require('../AbstractFileDecorator.js');

require('consoloid-framework/Consoloid/Test/UnitTest');
describeUnitTest('Consoloid.OS.File.AbstractFileDecorator', function() {
  var
    file,
    decorator,
    callback;
  beforeEach(function() {
    file = env.create(Consoloid.OS.File.FileInterface, {});
    file.open = sinon.stub();
    file.read = sinon.stub();
    file.getEOF = sinon.stub().returns(true);
    file.getFID = sinon.stub().returns("foo_bar_id");
    file.write = sinon.stub();
    file.seek = sinon.stub();
    file.close = sinon.stub();

    decorator = env.create(Consoloid.OS.File.AbstractFileDecorator, { file: file });
  });


  describe("#__constructor(options)", function() {
    it("should require a file", function() {
      (function() {
        env.create(Consoloid.OS.File.AbstractFileDecorator, {});
      }).should.throw;
    });
    it("should throw error if file is not instance of FileInterface", function() {
      (function() {
        env.create(Consoloid.OS.File.AbstractFileDecorator, {
          file: {
            open: sinon.stub(),
            read: sinon.stub(),
            getEOF: sinon.stub(),
            getFID: sinon.stub(),
            write: sinon.stub(),
            seek: sinon.stub(),
            close: sinon.stub()
          }
        });
      }).should.throw;
    });
  });

  describe("#open(name, flags, callback, [mode])", function() {
    it("should proxy all parameters", function() {
      decorator.open("A", "B", "C", "D");
      file.open.args[0][0].should.equal('A');
      file.open.args[0][1].should.equal('B');
      file.open.args[0][2].should.equal('C');
      file.open.args[0][3].should.equal('D');
    });
  });

  describe("#read(length, callback, [buffer], [offset], [position])", function() {
    it("should proxy all parameters", function() {
      decorator.read("A", "B", "C", "D", "E");
      file.read.args[0][0].should.equal('A');
      file.read.args[0][1].should.equal('B');
      file.read.args[0][2].should.equal('C');
      file.read.args[0][3].should.equal('D');
      file.read.args[0][4].should.equal('E');
    });
  });

  describe("#getEOF()", function() {
    it("should return with whatever the original file returns with", function() {
      decorator.getEOF().should.equal(true);

      file.getEOF.returns(false);
      decorator.getEOF().should.equal(false);
    });
  });

  describe("#getFID()", function() {
    it("should return with whatever the original file returns with", function() {
      decorator.getFID().should.equal("foo_bar_id");
    });
  });

  describe("#write(buffer, callback, [offset], [length], [position])", function() {
    it("should proxy all parameters", function() {
      decorator.write("A", "B", "C", "D", "E");
      file.write.args[0][0].should.equal('A');
      file.write.args[0][1].should.equal('B');
      file.write.args[0][2].should.equal('C');
      file.write.args[0][3].should.equal('D');
      file.write.args[0][4].should.equal('E');
    });
  });

  describe("#seek(offset, callback, [whence])", function() {
    it("should proxy all parameters", function() {
      decorator.seek("A", "B", "C");
      file.seek.args[0][0].should.equal('A');
      file.seek.args[0][1].should.equal('B');
      file.seek.args[0][2].should.equal('C');
    })
  });

  describe("#close(callback)", function() {
    it("should proxy all parameters", function() {
      decorator.close("A");
      file.close.args[0][0].should.equal('A');
    });
  });
});