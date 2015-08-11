require('consoloid-framework/Consoloid/Test/UnitTest');
describeUnitTest('Consoloid.OS.File.FileInterface', function() {
  describe("#open(name, flags, callback, [mode])", function() {
    it("should open a file asnycronously");
  });

  describe("#read(length, callback, [buffer], [offset], [position])", function() {
    it("should read the file asnycronously");
  });

  describe("#getEOF())", function() {
    it("should return with the EOF state of the file");
  });

  describe("#getFID())", function() {
    it("should return with the file identifier (or descriptor) of the file");
  });

  describe("#write(buffer, callback, [offset], [length], [position])", function() {
    it("should write the file asnycronously");
  });

  describe("#seek(offset, callback, [whence])", function() {
    it("should seek in the file asnycronously");
  });

  describe("#close(callback)", function() {
    it("should close the file asnycronously");
  });
});