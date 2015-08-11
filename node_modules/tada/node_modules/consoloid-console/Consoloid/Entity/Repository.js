defineClass('Consoloid.Entity.Repository', 'Consoloid.Base.Object',
  {
    __constructor: function(options)
    {
      this.__base($.extend({
        idProperty: 'name',
        data: []
      },options));

      this.requireProperty('entityCls');
    },

    getEntityCount: function()
    {
      return this.data.length;
    },

    forEach: function(callback)
    {
      this.data.forEach(callback, this);
    },

    some: function(callback)
    {
      return this.data.some(callback, this);
    },

    hasEntity: function(id)
    {
      return this.some(function(value){
        return value[this.idProperty] == id;
      });
    },

    getEntity: function(id)
    {
      var entity = this.__lazEntityGetter(id);
      if (!entity) {
        throw new Error('Entity '+id+' not found in the repository');
      }

      return entity;
    },

    __lazEntityGetter: function(id)
    {
      var entity;
      this.some(function(value){
        if (value[this.idProperty] == id) {
          entity = value;
          return true;
        }
      });

      return entity;
    },

    removeEntity: function(id)
    {
      this.some(function(value, index){
        if (value[this.idProperty] == id) {
          this.data.splice(index, 1);
          return 1;
        }
      });
    },

    updateEntity: function(data)
    {
      if (!data[this.idProperty]) {
        throw new Error('Id property is must be present in the data');
      }

      var entity = this.getEntity(data[this.idProperty]);
      this._updateEntityObject(entity, data);
    },

    _updateEntityObject: function(entity, data)
    {
      for (var prop in data) {
        var setterName = this.__convertToSetterName(prop);
        if (this.__entityHasMethod(entity, setterName)) {
          entity[setterName](data[prop]);
        }
      }
    },

    __convertToSetterName: function(prop)
    {
      return 'set' + prop[0].toUpperCase() + prop.substring(1);
    },

    __entityHasMethod: function(entity, method)
    {
      return typeof entity[method] == 'function';
    },

    createOrUpdateEntity: function(data)
    {
      var id = data[this.idProperty];
      if (!id) {
        throw new Error('Id property is must be present in the data');
      }

      var entity = this.__lazEntityGetter(id);
      if (entity) {
        this._updateEntityObject(entity, data);
      } else {
        entity = this.createEntity(data);
      }

      return entity;
    },

    createEntity: function(data)
    {
      if (!data[this.idProperty]) {
        throw new Error('Id property is must be present in the data');
      }

      if (this.hasEntity(data[this.idProperty])) {
        throw new Error('Entity with id ' + data[this.idProperty] + ' already exists');
      }

      var entityData = {container: this.container};
      entityData[this.idProperty] = data[this.idProperty];

      var entity = this.create(this.entityCls, entityData);
      this._updateEntityObject(entity, data);

      this.data.push(entity);

      return entity;
    },

    update: function(dataList)
    {
      var result = [];
      dataList.forEach(function(data, index){
        result.push(this.createOrUpdateEntity(data));
      }, this);

      this.data = result;
    }
  }
);
