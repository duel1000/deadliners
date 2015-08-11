defineClass('Consoloid.Ui.Form.FormDialog', 'Consoloid.Ui.MultiStateDialog',
  {
    __constructor: function(options)
    {
      this.__base($.extend({
        states: {
          'active': 'Consoloid-Ui-Form-FormDialogActive',
          'submitted': 'Consoloid-Ui-Form-FormDialogSubmitted'
        },
        activeState: 'active',
        controlTemplateIds: {
          'active': 'Consoloid-Ui-Form-FormDialogControlActive',
          'submitted': 'Consoloid-Ui-Form-FormDialogControlSubmitted',
        },
        submitButtonText: 'Submit'
      }, options));

      this.requireProperty('name');
      this.requireProperty('formService');
      this.form = this.container.get(this.formService);
      this.controlNode = undefined;
      this.controlTemplate = undefined;
      this.contextObject = undefined;

      this.__self.index[this.name] = this.__self.index[this.name]+1 || 1;

      this.name = this.get('translator').trans(this.name) + ': ' + this.__self.index[this.name];
    },

    setup: function()
    {
      this.form.prefix = this.node.attr('id');
      this.contextObject = this.create('Consoloid.Form.ContextObject', {
        name: this.name,
        dialog: this,
        container: this.container
      });
    },

    render: function()
    {
      this.get('css_loader').load('Consoloid-Ui-Form-form')

      this._updateResponseTemplate();
      this.expression.setReferenceText(this.name);
      this._renderExpressionAndResponse();
      this._renderForm();
      this._renderControlTemplate();
      this._animateDialogShowup();
      this._bindEventListeners();
      return this;
    },

    _renderForm: function()
    {
      if (this.activeState != 'active') {
        this.form.disable();
      }

      this.form
        .setNode(this.node.find('div.form'))
        .render();

      if (this.activeState == 'active') {
        this.form.focus();
        this.container.get('context').add(this.contextObject);
      } else {
        this.container.get('context').remove(this.contextObject);
      }
    },

    _renderControlTemplate: function()
    {
      this.controlNode = this.node.find('div.' + this.activeState);
      if (!this.controlNode) {
        throw new Error('Missing control dom node from state template; state="' + this.activeState + '"');
      }

      this._updateControlTemplate();
      this.controlNode.empty().jqoteapp(this.controlTemplate.get(), this);
    },

    _updateControlTemplate: function()
    {
      if (this.controlTemplate && this.controlTemplate.id == this.states[this.activeState]) {
        return;
      }

      if (!(this.activeState in this.controlTemplateIds)) {
        throw new Error('Control template is not defined for active state; state="' + this.activeState + '"');
      }

      this.controlTemplate = this.create('Consoloid.Widget.JQoteTemplate', {
        id: this.controlTemplateIds[this.activeState],
        container: this.container
      });
    },

    submit: function(callBack)
    {
      this.form.parseUserInput();
      if (!this.form.validate()) {
        this._renderForm();

        if (callBack) {
          callBack({ success: false });
        }
        return;
      }

      this._processForm();
      if (callBack) {
        var response = { success: (this.activeState == 'submitted') };
        if (this.activeState == 'submitted') {
          response.message = this.processedMessage;
        }
        callBack(response);
      }
    },

    _processForm: function()
    {
      if (!('processor' in this)) {
        return;
      }

      var response = this.container.get(this.processor.service)[this.processor.method || 'process'](this.form.getValue());
      if (!response || !('result' in response)) {
        throw new Error('Invalid response received from form processor');
      }

      switch(response.result) {
        case 'ok':
          this.processedMessage = this.get('translator').trans(response.message || 'Form sent.');
          this.switchState('submitted');
          break;

        case 'error':
          if (!('errors' in response)) {
            throw new Error('errors property are missing from response');
          }

          this.form.setErrorMessage(response.errors);
          break;

        default:
          throw new Error('Invalid result received from processor; result="' + response.result + '"');
      }
    },

    focus: function()
    {
      this.form.focus();
    },

    getForm: function()
    {
      return this.form;
    }
  },
  {
    index: {}
  }
);
