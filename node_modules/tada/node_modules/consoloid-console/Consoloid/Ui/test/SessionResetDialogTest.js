require("consoloid-framework/Consoloid/Widget/JQoteTemplate");
require("consoloid-framework/Consoloid/Widget/Widget");
require("../Dialog");
require("../SessionResetDialog");
require('consoloid-framework/Consoloid/Test/UnitTest');

describeUnitTest('Consoloid.Ui.SessionResetDialog', function() {
  var reloadStub;
  beforeEach(function() {
    sinon.stub($, 'ajax');
    reloadStub = sinon.stub();
    global.location = { reload: reloadStub };
  });

  describe('#__constructor()', function() {
    it("should make an ajax call to tell the server to reset the session", function() {
      env.create(Consoloid.Ui.SessionResetDialog, {});

      $.ajax.calledOnce.should.equal(true);
      $.ajax.args[0][0].should.have.property('url', "testUrl/x");
    });

    it("should reload the webpage", function() {
      env.create(Consoloid.Ui.SessionResetDialog, {});

      reloadStub.calledOnce.should.equal(true);
    });

    it("should not reload the webpage if location is not defined", function() {
      delete global['location'];

      env.create(Consoloid.Ui.SessionResetDialog, {});

      reloadStub.called.should.equal(false);
    });
  })

  afterEach(function() {
    $.ajax.restore();

    delete global.location;
  });
});
