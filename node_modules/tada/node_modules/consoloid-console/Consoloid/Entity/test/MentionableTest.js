require('consoloid-framework/Consoloid/Test/UnitTest');
require('../Mentionable');

describeUnitTest('Consoloid.Entity.Mentionable', function() {
  var
    entity;

  describe('constructor', function(){
    it('should require a contextCls property', function(){
      (function(){ new Consoloid.Entity.Mentionable(); }).should.throw('contextCls must be injected');
    });

    it('should set the default contextReferenceProperty to name', function(){
      entity = new Consoloid.Entity.Mentionable({contextCls: 'foo' });
      entity.contextReferenceProperty.should.be.eql('name');
    });
  });

  describe('#mention()', function(){
    beforeEach(function(){
      entity = env.create('Consoloid.Entity.Mentionable', {name: 'foo', contextCls: 'bar' });
    });

    it('should call the context\' mention method', function(){
      env.addServiceMock('context', { mention: sinon.spy() });
      entity.mention();
      env.get('context').mention.calledWith('bar', 'foo');
    });
  });
});
