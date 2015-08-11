defineClass('Consoloid.Context.ExpectTypes', 'Consoloid.Base.Object',
  {
    setTypes: function(contextClasses)
    {
      this.contextClasses = contextClasses;
    },

    typesIsPresent: function()
    {
      var context = this.get('context');
      return !this.contextClasses.some(function(cls){
        return !context.hasClass(cls);
      });
    }
  }
);
