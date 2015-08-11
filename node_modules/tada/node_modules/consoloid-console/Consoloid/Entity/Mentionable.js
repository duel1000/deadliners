defineClass('Consoloid.Entity.Mentionable', 'Consoloid.Base.Object',
  {
    __constructor: function(options)
    {
      this.__base($.extend({
        contextReferenceProperty: 'name'
      },options));

      this.requireProperty('contextCls');
    },

    mention: function()
    {
      this.get('context').mention(this.contextCls, this[this.contextReferenceProperty]);
    }
  }
);
