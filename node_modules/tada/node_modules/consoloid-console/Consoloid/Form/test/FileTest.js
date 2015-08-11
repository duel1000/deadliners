require('consoloid-framework/Consoloid/Widget/JQoteTemplate');
require('consoloid-framework/Consoloid/Widget/jquery.jqote2.min.js');
require('consoloid-framework/Consoloid/Widget/Widget');
require('../BaseField');
require('../AutoValidatingField');
require('../File');

require('consoloid-framework/Consoloid/Test/UnitTest');
describeUnitTest('Consoloid.Form.File', function() {
  var
    fileWidget,
    eventListenerSpy;

  beforeEach(function() {
    file = {
        size: 1024,
        name: 'test.ext'
    };

    env.addServiceMock('file_catalogue', {
      getFileInfosFromCatalogue: function(){ return "FooBar"; },
      addFilesToCatalogue: function(){},
      deleteCatalogue: function(){}
    });
    sinon.spy(env.get('file_catalogue'), 'getFileInfosFromCatalogue');
    sinon.spy(env.get('file_catalogue'), 'addFilesToCatalogue');
    sinon.spy(env.get('file_catalogue'), 'deleteCatalogue');

    fileWidget = env.create('Consoloid.Form.File', {
      name: 'foo',
      prefix: '',
      id: 'bar',
      addEventListener: sinon.spy()
    });
  });

  describe('#__constructor', function() {
    it('should bind _autoValidateField to onchange event of file field', function() {
      fileWidget.addEventListener.calledTwice.should.be.true;
      fileWidget.addEventListener.args[0][0].should.be.eql('input[id=' + fileWidget.id + ']');
      fileWidget.addEventListener.args[0][1].should.be.eql('change');
      fileWidget.addEventListener.args[1][0].should.be.eql('#file_select-' + fileWidget.id + ' .remove-file-id');
      fileWidget.addEventListener.args[1][1].should.be.eql('click');
    });
  });

  describe("#__removeFile(event)", function() {
    it("should remove the file with the index in the event and rerender itself", function() {
      fileWidget.fileList = ["a", "b", "c"];
      fileWidget.render = sinon.spy();

      fileWidget.__removeFile({ currentTarget: { attributes: { "data-id": { value: 1 } } } });
      fileWidget.fileList.length.should.equal(2);
      fileWidget.fileList[0].should.equal("a");
      fileWidget.fileList[1].should.equal("c");

      fileWidget.render.calledOnce.should.be.ok;
    });
  });

  describe('#parseUserInput()', function() {
    beforeEach(function() {
      fileWidget.fileList = [file, file, file];
    });

    it('should add the files to the file catalogue', function() {
      fileWidget.parseUserInput();

      fileWidget.get('file_catalogue').addFilesToCatalogue.calledOnce.should.be.true;
      fileWidget.get('file_catalogue').deleteCatalogue.calledOnce.should.be.true;
    });
  });


  describe('#getValue()', function() {
    it("should return with the name of the catalogue, belonging to the filed", function() {
      var result = fileWidget.getValue();
      result.catalogueName.should.equal(fileWidget.id);
      result.fileInfos.should.equal("FooBar");

      fileWidget.get('file_catalogue').getFileInfosFromCatalogue.calledWith(fileWidget.id).should.be.ok;
    });
  });
});
