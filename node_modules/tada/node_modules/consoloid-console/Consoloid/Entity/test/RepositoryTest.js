require('consoloid-framework/Consoloid/Test/UnitTest');
require('../Repository');

defineClass('Dummy', {
  __constructor: function(data)
  {
    this.name = data.name;
    this.prop = 'bar';
    this.prop2 = 'fooBar';
  },

  setProp: function(value)
  {
    this.prop = value;
  }
})

describeUnitTest('Consoloid.Entity.RepositoryTest', function() {
  var
    repository;

  beforeEach(function(){
    repository = new Consoloid.Entity.Repository({entityCls: 'Dummy', data: [new Dummy({ name: 'foo'}), new Dummy({ name: 'bar'})]});
  })

  describe('constructor', function(){
    it('should throw when entityCls does not present', function(){
      (function(){ new Consoloid.Entity.Repository() }).should.throw('entityCls must be injected');
    });

    it('should set the default idProperty to name', function(){
      repository = new Consoloid.Entity.Repository({ entityCls: 'Dummy'});
      repository.idProperty.should.be.eql('name');
    });
  });

  describe('#getEntityCount()', function(){
    it('should return the count of the entities inside repository', function(){
      repository.getEntityCount().should.be.eql(2);
    });
  });

  describe('#forEach(callback)', function(){
    it('should loop through the entities', function(){
      var callTime = 0;
      repository.forEach(function(value, index){
        if (index == 0) {
          value.name.should.be.eql('foo');
          callTime++;
        } else if (index == 1) {
          value.name.should.be.eql('bar');
          callTime++;
        }
      });

      callTime.should.be.eql(2);
    });
  });

  describe('#some(callback)', function(){
    it('should return true while iterating through the entites and the callback return true', function(){
      var
        callTime = 0,
        result = repository.some(function(value, index){
          callTime++;
          return value.name == 'foo' && index == 0;
        });

      result.should.be.true;
      callTime.should.be.eql(1);
    });

    it('should return false when the callback never return true', function(){
      var
        callTime = 0,
        result = repository.some(function(value) {
          callTime++;
          return value.name == 'foo2';
        });

        result.should.be.false;
        callTime.should.be.eql(2);
    });
  });

  describe('#hasEntity(id)', function(){
    it('should return true when repository has entity with the given id', function(){
      repository.hasEntity('foo').should.be.true;
    });
    it('should return false when repository does not have entity with the given id', function(){
      repository.hasEntity('foo2').should.be.false;
    });
  });

  describe('#getEntity(id)', function(){
    it('should throw when entity not found in the repository', function(){
      (function() { repository.getEntity('foo2'); }).should.throw('Entity foo2 not found in the repository');
    });

    it('should return the entity when repository has entity with the given id', function(){
      repository.getEntity('foo').should.be.eql(new Dummy({ name: 'foo'}));
    });
  });

  describe('#removeEntity(id)', function(){
    it('should remove tne entity from the repository', function(){
      repository.removeEntity('foo');
      repository.hasEntity('foo').should.be.false;
      repository.getEntityCount().should.be.eql(1);
    });

    it('should do nothing when entity not found', function(){
      repository.removeEntity('foo2');
      repository.getEntityCount().should.be.eql(2);
    });
  });

  describe('#updateEntity(data)', function(){
    it('should throw when data not has idproperty and entity is not present', function() {
      (function(){ repository.updateEntity({ prop: 'foo'}) }).should.throw('Id property is must be present in the data');
    });

    it('should search for the entity if it is not given', function(){
      (function() { repository.updateEntity({ name:'foo2'}); }).should.throw();
      repository.updateEntity({ name:'foo'});
    });

    it('should update entity through their setter methods', function(){
      var foo = repository.getEntity('foo');
      repository.updateEntity({ name:'foo', prop: 'newBar', prop2: 'newFooBar'});

      foo.prop.should.be.eql('newBar');
      foo.prop2.should.be.eql('fooBar');
    });
  });

  describe('#createEntity(data)', function(){
    it('should throw when data is not has id property', function(){
      (function(){ repository.createEntity({prop: 'alma'});}).should.throw('Id property is must be present in the data');
    });

    it('should throw when entity with that id is already exitst', function(){
      (function(){ repository.createEntity({ name: 'foo' }); }).should.throw('Entity with id foo already exists');
    });

    it('should add the new entity to itself', function(){
      repository.createEntity({name: 'newFoo'});
      repository.hasEntity('newFoo').should.be.true;
    });

    it('should return the new entity', function(){
      var entity = repository.createEntity({name: 'newFoo'});
      entity.name.should.be.eql('newFoo');
    });
  });

  describe('#update(dataList)', function(){
    it('should update the existing entities', function(){
      repository.update([{name: 'foo', prop: 'newValue'}, {name: 'bar', prop: 'newBarValue'}]);
      repository.getEntity('foo').prop.should.be.eql('newValue');
      repository.getEntity('bar').prop.should.be.eql('newBarValue');
    });

    it('should create new entities when dataList has', function(){
      repository.update([{name: 'newItem', prop: 'fooBar'}, {name: 'foo'}, {name: 'bar'}]);
      repository.getEntity('newItem').prop.should.be.eql('fooBar');
      repository.getEntityCount().should.be.eql(3);
    });

    it('should remove those entities which are not in the dataList', function(){
      repository.update([{name: 'bar'}]);
      repository.hasEntity('bar').should.be.true;
      repository.hasEntity('foo').should.be.false;

      repository.update([]);
      repository.getEntityCount().should.be.eql(0);
    });

    it('should work with all together', function(){
      repository.update([{name: 'newItem', prop: 'fooBar'}]);
      repository.getEntity('newItem').prop.should.be.eql('fooBar');
      repository.getEntityCount().should.be.eql(1);

      repository.update([{ name: 'foo', prop: 'newProp'}, { name: 'newFoo'}, {name: 'newBar'}]);
      repository.getEntityCount().should.be.eql(3);
      repository.hasEntity('foo').should.be.true;
      repository.hasEntity('newFoo').should.be.true;
      repository.hasEntity('newBar').should.be.true;
    });
  });
});
