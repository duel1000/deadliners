defineClass('Consoloid.Ui.Form.SubmitDialog', 'Consoloid.Ui.Volatile.Dialog',
  {
    setup: function()
    {
      var
        $this = this,
        baseSetup = this.__base,
        contextObject = ('name' in this.arguments && this.arguments.name) ?
                           this.arguments.name :
                           this.__lookupContextObject(
                               'Consoloid.Form.ContextObject',
                               0,
                               "There isn't any active form dialog to submit");

      this.dialog = contextObject.entity.dialog;
      this.dialog.submit(function(submitResponse) {
        if (submitResponse.success === false) {
          $this.activeState = "error";
          $this.message = __('Form submission failed.');
        } else {
          $this.message = submitResponse.message;
        }

        baseSetup.apply($this, []);
        $this.render();
      });
    },
  }
);
