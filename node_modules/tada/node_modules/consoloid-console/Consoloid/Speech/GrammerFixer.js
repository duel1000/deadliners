defineClass('Consoloid.Speech.GrammerFixer', 'Consoloid.Base.Object',
  {
    __constructor: function(options)
    {
      this.__base($.extend({
        fixList: {}
      }, options));

      this.__createRegexpFromFixList();
    },

    __createRegexpFromFixList: function()
    {
      Object.keys(this.fixList).forEach(function(source){
        this.fixList[source] = {
            regexp: new RegExp('\\b'+source+'\\b', 'gi'),
            target: this.fixList[source]
        }
      }, this);
    },

    fix: function(text)
    {
      Object.keys(this.fixList).forEach(function(source){
        text = text.replace(this.fixList[source].regexp, this.fixList[source].target);
      }, this);

      return text;
    }
  }
);
