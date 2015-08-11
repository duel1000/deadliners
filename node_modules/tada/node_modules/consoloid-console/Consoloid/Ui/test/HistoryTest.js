require('consoloid-framework/Consoloid/Test/UnitTest');
require('../History');

describeUnitTest('Consoloid.Ui.History', function() {
  var current;
  var history;

  beforeEach(function() {
    history = env.create(Consoloid.Ui.History, {});
  });

  describe('#add(text)', function(){
    it('should add an element with autocomplete compatible format', function(){
      history.content.length.should.be.eql(0);
      history.add('alma');
      history.content.length.should.be.eql(1);
      history.content[0].value.should.be.eql('alma');
    });

    it('should do not add if the last element is same as the new', function(){
      history.add('alma');
      history.add('alma');
      history.content.length.should.be.eql(1);
      history.content[0].value.should.be.eql('alma');
    })
  });

  describe('#get()', function(){
    it('should return empty array when it\'s empty', function(){
      history.get().length.should.be.eql(0);
    });

    it('should return all element (last added is the first)', function(){
      history.add('korte');
      history.add('alma');

      var historyContent = history.get();
      historyContent.length.should.be.eql(2);
      historyContent[0].value.should.be.eql('alma');
      historyContent[1].value.should.be.eql('korte');
    });
  });

  describe('#clear()', function(){
    it('should clear', function(){
      history.add('korte');
      history.add('alma');

      history.clear();
      history.content.length.should.be.eql(0);
    });
  });
});
