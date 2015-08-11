defineClass('Consoloid.Ui.MultiStateDialog', 'Consoloid.Ui.Dialog',
  {
    __constructor: function(options)
    {
      this.__base($.extend({
        responseTemplateId: null // this will not be used by this class, but parent requires it.
      }, options));

      this.requireProperty('states');
      this.requireProperty('activeState');

      this.__checkValidState(this.activeState);
    },

    __checkValidState: function(state)
    {
      if (!(state in this.states)) {
        throw new Error("Invalid state: " + state);
      }
    },

    switchState: function(state)
    {
      this.__checkValidState(state);
      if (state !== this.activeState) {
        this.activeState = state;
        this.render();
      }
    },

    render: function()
    {
      this._updateResponseTemplate();
      return this.__base();
    },

    _updateResponseTemplate: function()
    {
      if (this.responseTemplate.id == this.states[this.activeState]) {
        return;
      }

      this.responseTemplate = this.create('Consoloid.Widget.JQoteTemplate', {
        id: this.states[this.activeState],
        container: this.container
      });
    },

    getActiveState: function()
    {
      return this.activeState;
    }
  }
);