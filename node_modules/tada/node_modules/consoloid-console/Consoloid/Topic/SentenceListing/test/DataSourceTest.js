require('../../../Ui/List/DataSource/Base.js');
require('../../../Ui/List/DataSource/Array.js');
require('../DataSource.js')
require('consoloid-framework/Consoloid/Test/UnitTest');

defineClass('Consoloid.Topic.SentenceListing.DataSourceTestSentence', 'Consoloid.Base.Object',
  {
    requiredContextIsAvailable: function()
    {
      return true;
    }
  }
);

describeUnitTest('Consoloid.Topic.SentenceListing.DataSource', function() {
  describe('#__constructor', function() {
    it('should fill the datasource with patterns and topic of available sentences', function() {
      env.container.addDefinition('test_sentence_1', {
        tags: [ 'sentence', 'topic.console' ],
        cls: 'Consoloid.Topic.SentenceListing.DataSourceTestSentence',
        options: {
          service: 'test_dialog',
          patterns: [ 'test sentence 1', 'test sentence 2', 'test sentence 3' ],
          arguments: {}
        }
      });

      var dataSource = env.create('Consoloid.Topic.SentenceListing.DataSource', {});
      dataSource.data.length.should.equal(1);
      dataSource.data[0].should.eql({
        topic: 'console',
        pattern: 'test sentence 1',
        alternatives: [
          'test sentence 2',
          'test sentence 3'
        ]
      });
    });

    it('should handle the alternate definition syntax of sentences with fixed arguments', function() {
      env.container.addDefinition('test_sentence_1', {
        tags: [ 'sentence', 'topic.console' ],
        cls: 'Consoloid.Topic.SentenceListing.DataSourceTestSentence',
        options: {
          service: 'test_dialog',
          patterns: [
            'test sentence 1',
            {
              pattern: 'test sentence 2',
              fixedArguments: { foo: 'bar' }
            },
            'test sentence 3' ],
          arguments: {}
        }
      });

      var dataSource = env.create('Consoloid.Topic.SentenceListing.DataSource', {});
      dataSource.data.length.should.equal(1);
      dataSource.data[0].should.eql({
        topic: 'console',
        pattern: 'test sentence 1',
        alternatives: [
          'test sentence 2',
          'test sentence 3'
        ]
      });
    });
  });

  describe('#_setFilterValues', function() {
    var dataSource;
    beforeEach(function() {
      dataSource = env.create('Consoloid.Topic.SentenceListing.DataSource', {});
      dataSource.data = [
        {
          topic: 'topic1',
          pattern: 'foo bar joe',
          alternatives: []
        },
        {
          topic: 'topic1',
          pattern: 'joe',
          alternatives: [
            'some joe'
          ]
        },
        {
          topic: 'topic2',
          pattern: 'some other joe',
          alternatives: []
        }
      ];

      env.addServiceMock('translator', { trans: function(t) { return t; } });
    });

    it('should leave all items when filter values are empty', function(done) {
      dataSource._setFilterValues(function() {
        dataSource.getDataByRange(function(err, result) {
          result.length.should.equal(3);
          done();
        }, 0, 10);
      }, {});
    });

    it('should filter value given in word key', function(done) {
      dataSource._setFilterValues(function() {
        dataSource.getDataByRange(function(err, result) {
          result.length.should.equal(2);
          done();
        }, 0, 10);
      }, {
        word: 'some'
      });
    });

    it('should filter value given in topic key', function(done) {
      dataSource._setFilterValues(function() {
        dataSource.getDataByRange(function(err, result) {
          result.length.should.equal(2);
          done();
        }, 0, 10);
      }, {
        topic: 'topic1'
      });
    });

    it('should filter value given in word and topic key', function(done) {
      dataSource._setFilterValues(function() {
        dataSource.getDataByRange(function(err, result) {
          result.length.should.equal(1);
          done();
        }, 0, 10);
      }, {
        word: 'some',
        topic: 'topic1'
      });
    });
  });
});