defineClass('Consoloid.Interpreter.Letter', 'Consoloid.Base.Object',
  {
    __constructor: function(options)
    {
      this.__base(options);

      this.children = {};
      this.entities = [];
    },

    createChild: function(letter)
    {
      if (letter in this.children) {
        throw new Error('Child already exists; letter="' + letter + '"');
      }

      this.children[letter] = this.create('Consoloid.Interpreter.Letter', {});
      return this.children[letter];
    },

    getChild: function(letter)
    {
      if (letter in this.children) {
        return this.children[letter];
      } else {
        throw new Error('No such child; letter="' + letter + '"');
      }
    },

    getOrCreateChild: function(letter)
    {
      if (!(letter in this.children)) {
        this.children[letter] = this.create('Consoloid.Interpreter.Letter', {});
      }
      return this.children[letter];
    },

    addEntity: function(entity)
    {
      if (!this.hasEntity(entity)) {
        this.entities.push(entity);
      }
    },

    removeEntity: function(entity)
    {
        var index = $.inArray(entity, this.entities);
        if (index != -1) {
          this.entities.splice(index, 1);
        }
    },

    hasEntity: function(entity)
    {
      return $.inArray(entity, this.entities) != -1;
    },

    getEntities: function()
    {
      return this.entities;
    }
  }
);
