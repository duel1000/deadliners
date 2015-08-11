defineClass('Consoloid.Context.Queue', 'Consoloid.Base.Object',
  {
    __constructor: function(options)
    {
      this.__base($.extend({
        limit: 5,
        entities: [],
        tree: options.tree || this.create('Consoloid.Context.Tree')
      }, options));
    },

    autocomplete: function(text, cls)
    {
        return this.tree.autocomplete(text, cls);
    },

    autocompleteWithSentence: function(text, argumentName, sentence, argumentValues)
    {
        if (!text.length) {
            var requestedArgument = argumentValues[argumentName];
            return this.findByClass(argumentValues[argumentName].cls)
              .filter(
                function(result){
                  requestedArgument.value = result.entity.toString();
                  requestedArgument.entity = result.entity;
                  return sentence.validateArguments(argumentValues);
              });
        }
        return this.tree.autocompleteWithSentence(text, argumentName, sentence, argumentValues);
    },

    hasClass: function(cls)
    {
        if (typeof cls == 'string') {
            cls = getClass(cls);
        }

        for (var i=0,len=this.entities.length; i < len; i++) {
            obj = this.entities[i];
            if (obj.isCastable(cls)) {
                return true;
            }
        }

        return false;
    },

    findByClass: function(cls)
    {
        if (typeof cls == 'string') {
            cls = getClass(cls);
        }

        var found = [];
        var obj;
        for (var i=0,len=this.entities.length; i < len; i++) {
            obj = this.entities[i];
            if (obj.isCastable(cls)) {
                found.push({entity:obj.cast(cls), value: obj.toString(), exactMatch:false});
            }
            if (found.length == this.limit) {
                break;
            }
        }

        return found;
    },

    findByStringAndClass: function(str, cls)
    {
        var found = this.tree.findTokens(str, cls);
        var result = [];
        var entity;
        for (var i=0,len=found.length; i < len; i++) {
            entity = found[i].getEntity();
            if (entity.toString() == str) {
                result.unshift(entity);
            }
        }
        return result;
    },

    getByClassAndString: function(cls, str)
    {
        var found = this.findByStringAndClass(str, cls);
        for (var i=0,len=found.length; i < len; i++) {
            if (found[i].isCastable(cls)) {
                return found[i].cast(cls);
            }
        }
    },

    remove: function(obj)
    {
        var index = this.entities.indexOf(obj);
        if (index != -1) {
            this.entities.splice(index, 1);
            this.tree.removeEntity(obj);
        }
    },

    add: function(obj)
    {
        if (!(obj instanceof Consoloid.Context.Object)) {
            throw new Error('Invalid type');
        }

        var existing = this.__getBySameClassAndString(obj.__self, obj.toString());
        if (existing) {
            this.remove(existing);
        }

        this.tree.addEntity(obj);
        this.entities.unshift(obj);
    },

    __getBySameClassAndString: function(cls, str)
    {
        var existing = this.findByStringAndClass(str, cls);
        if (existing[0]) {
            for (var i=0,len=existing.length; i < len; i++) {
                if (existing[i].isSameClass(cls)) {
                    return existing[i];
                }
            }
        }
    },

    mention: function(cls, str)
    {
        if (typeof cls == 'string') {
            cls = getClass(cls);
        }

        var object,
            existing = this.__getBySameClassAndString(cls, str);

        if (existing) {
            object = existing;
        } else {
            object = cls.fromString(str, this.container);
        }

        this.add(object);
    },

    forget: function(cls, str)
    {
        if (typeof cls == 'string') {
            cls = getClass(cls);
        }

        var obj = this.__getBySameClassAndString(cls, str);

        if (!obj) {
            return;
        }

        this.remove(obj);
    },

    empty: function()
    {
        this.entities = [];
    }
  }
);
