defineClass('Consoloid.Ui.SessionResetDialog', 'Consoloid.Ui.Dialog',
  {
    __constructor: function(options)
    {
      this.__base($.extend({
        responseTemplateId: null // this will not be used by this class, but parent requires it.
      }, options));

      if (!this.__isRunningInBrowser()) {
        return;
      }

      $.ajax({
        type : 'POST',
        url : this.container.get('server').url + "/x",
        async : false
      });

      location.reload();
    },

    __isRunningInBrowser: function()
    {
      return ('location' in global);
    },

    start: function()
    {
    }
  });