defineClass('Consoloid.Interpreter.TreeBuilder', 'Consoloid.Base.Object',
  {
    __constructor: function(options)
    {
      this.__base(options);

      if (!('tree' in this)) {
        throw new Error('tree must be injected');
      }
    },

    append: function(sentences)
    {
      var $this = this;
      $.each(sentences, function(index, sentence) {
        $.each(sentence.getExpressions(), function(index, expression) {
          $this.tree.addEntity(expression);
        });
      });
    },

    getTree: function()
    {
      return this.tree;
    },

    build: function()
    {
      this.append(this.container.getAllTagged('sentence'));
    }
  }
);
