require('../Base')
require('../TextFile');

require('consoloid-framework/Consoloid/Test/UnitTest');

describeUnitTest('Consoloid.Ui.List.DataSource.TextFile', function() {
  var
    dataSource,
    textFile,
    create,
    callbackSpy;

  beforeEach(function() {
    textFile = {
      open: sinon.stub(),
      readLine: sinon.stub(),
      seekLine: sinon.stub(),
      getLineCount: sinon.stub()
    };

    create = sinon.stub();
    create.withArgs("Consoloid.OS.File.TextFile").returns(textFile);

    defineClass('Consoloid.Ui.List.DataSource.TextFileMocked', 'Consoloid.Ui.List.DataSource.TextFile', {
      create: create
    });

    dataSource = env.create(Consoloid.Ui.List.DataSource.TextFileMocked, {
      fileName: "/foo/bar",
      textFileOptions: {
        encoding: "utf8",
        chunkSize: 2048
      }
    });

    callbackSpy = sinon.spy();
  });

  describe("#__constructor(options)", function() {
    it("should require a filename", function() {
      (function() {
        env.create(Consoloid.Ui.List.DataSource.TextFile, {});
      }).should.throwError();
    });

    it("should create a TextFile object, with the additional options", function() {
      create.calledWith("Consoloid.OS.File.TextFile").should.be.ok;
      create.args[1][1].encoding.should.equal("utf8");
      create.args[1][1].chunkSize.should.equal(2048);
    });

    it("should add a File object to the TextFile object if it was not given beforehand", function() {
      create.calledWith("Consoloid.OS.File.File").should.be.ok;
    });
  });

  describe("#getDataByRange(callback, fromIndex, toIndex)", function() {
    it("should open the file, read the data, and call the callback with them", function() {
      dataSource.getDataByRange(callbackSpy, 0, 2);

      textFile.open.calledOnce.should.be.ok;
      textFile.open.args[0][0].should.equal("/foo/bar");
      textFile.open.args[0][1].should.equal("r");
      textFile.open.args[0][2]();

      textFile.readLine.calledOnce.should.be.ok;
      textFile.readLine.args[0][1].should.equal(0);
      textFile.readLine.args[0][0](undefined, "foo0");

      textFile.readLine.calledTwice.should.be.ok;
      textFile.readLine.args[1][1].should.equal(1);
      textFile.readLine.args[1][0](undefined, "foo1");

      textFile.readLine.calledThrice.should.be.ok;
      textFile.readLine.args[2][1].should.equal(2);
      textFile.readLine.args[2][0](undefined, "foo2");

      callbackSpy.calledOnce.should.be.ok;
      (callbackSpy.args[0][0] == undefined).should.be.ok;
      callbackSpy.args[0][1][0].should.equal("foo0");
      callbackSpy.args[0][1][1].should.equal("foo1");
      callbackSpy.args[0][1][2].should.equal("foo2");

      dataSource.opened.should.be.ok;
    });

    it("should only open the file if needed", function() {
      dataSource.opened = true;
      dataSource.getDataByRange(callbackSpy, 0, 2);

      textFile.open.called.should.not.be.ok;
      textFile.readLine.calledOnce.should.be.ok;
    });
  });

  describe("#setFilterValues(callback, filterValues, fromIndex, toIndex)", function() {
    it("should open the file, read the data and the count, and call the callback with them", function() {
      dataSource.setFilterValues(callbackSpy, {}, 0, 2);

      textFile.open.calledOnce.should.be.ok;
      textFile.open.args[0][0].should.equal("/foo/bar");
      textFile.open.args[0][1].should.equal("r");
      textFile.open.args[0][2]();

      textFile.getLineCount.calledOnce.should.be.ok;
      textFile.getLineCount.args[0][0](undefined, 10);

      textFile.readLine.calledOnce.should.be.ok;
      textFile.readLine.args[0][1].should.equal(0);
      textFile.readLine.args[0][0](undefined, "foo0");

      textFile.readLine.calledTwice.should.be.ok;
      textFile.readLine.args[1][1].should.equal(1);
      textFile.readLine.args[1][0](undefined, "foo1");

      textFile.readLine.calledThrice.should.be.ok;
      textFile.readLine.args[2][1].should.equal(2);
      textFile.readLine.args[2][0](undefined, "foo2");

      callbackSpy.calledOnce.should.be.ok;
      (callbackSpy.args[0][0] == undefined).should.be.ok;
      callbackSpy.args[0][1].data[0].should.equal("foo0");
      callbackSpy.args[0][1].data[1].should.equal("foo1");
      callbackSpy.args[0][1].data[2].should.equal("foo2");
      callbackSpy.args[0][1].count.should.equal(10);

      dataSource.opened.should.be.ok;
    });

    it("should only open the file if needed", function() {
      dataSource.opened = true;
      dataSource.setFilterValues(callbackSpy, {}, 0, 2);

      textFile.open.called.should.not.be.ok;
      textFile.getLineCount.calledOnce.should.be.ok;
      textFile.getLineCount.args[0][0](undefined, 10);

      textFile.readLine.calledOnce.should.be.ok;
    });
  });
});
