defineClass('Consoloid.Ui.Prompt', 'Consoloid.Widget.Widget',
  {
    __constructor: function(options)
    {
      this.__base($.extend({
        history: this.create('Consoloid.Ui.History', {}),
        templateId: 'Consoloid-Ui-Prompt',
        id: 'prompt',
        enabled: true
      }, options));

      if (!('dialogLauncher' in this)) {
        this.dialogLauncher = this.get('dialogLauncher');
      }

      if (!('currentSentence' in this)) {
        this.__createCurrentSentence();
      }

      this
        .addEventListener('a.search', 'click', this.search);
    },

    __createCurrentSentence: function()
    {
      this.currentSentence = this.create('Consoloid.Ui.CurrentSentence', {container: this.container});
    },

    search: function(event)
    {
      this.onEnter();
    },

    onEnter: function()
    {
      if (!this.enabled) {
        return
      }

      var $this = this;
      var text = $this.inputField.val();
      if (!text.trim()) {
        return;
      }

      this.disablePrompt();
      setTimeout(function() {
        try {
          $this.launchDialog(text);
        }
        catch(error) {
          $this.enablePrompt();
          throw error;
        }
        $this.enablePrompt();
      }, 0);
    },

    disablePrompt: function()
    {
      this.node.find('.actions li').hide();
      this.node.find('.actions ul').append('<li id="throbber"><img alt="throbber" src="/Consoloid/Ui/images/throbber.gif" /></li>');

      this.enabled = false;
      this.node.find('.human-text').prop('disabled', true);
    },

    enablePrompt: function()
    {
      this.node.find('.actions ul #throbber').remove();
      this.node.find('.actions li').show();

      this.enabled = true;
      this.node.find('.human-text').prop('disabled', false);
    },

    launchDialog: function(text) {
      var done = this.dialogLauncher.startFromText(text);
      if (done !== false) {
        this.inputField.val('');
        this.updateInputFieldSize(1);
        this.currentSentence.clear();
        this.history.add(text);
      }
    },

    render: function()
    {
      var $this = this;

      this.node
        .empty()
        .jqoteapp(this.template.get(), this);

      this.inputField = this.node.find('input.human-text');
      this.container.get('type_writer').setInputfield(this.inputField);

      this.speechInputButton = this.container.get('speech_prompt_button');
      this.speechInputButton.setButtonNode(this.node.find('#prompt-mic'));
      this.speechInputButton.setOutputNode(this.inputField);

      this.autocompleteWidget = this.create('Consoloid.Ui.Autocomplete', {
                                  height: 205,
                                  inputfield: this.inputField,
                                  idleTimeout: 200,
                                  gatherOptions: function(setOptions) { $this.autocomplete(setOptions) },
                                  container: this.container
                                });
      this.autocompleteWidget.node.bind('select', this.select.bind(this));

      this.inputField
        .attr('size', '1')
        .keydown(function(event) { $this.keydown.apply($this, [ event ]); })
        .keyup(function(event) { $this.keyup.apply($this, [ event ]); });

      this.addEventListener('#prompt', 'click', this.focus);
      $('body').keydown(this.inactiveFieldListener());

      this._bindEventListeners();
      return this;
    },

    keydown: function(event)
    {
      // backspace/delete
      if (event.keyCode == 8 || event.keyCode == 46) {
        this.updateInputFieldSize(-1);

      } else if (event.keyCode == 9) {
        event.preventDefault();

        if (this.currentSentence.isMatching()) {
          var selection;
          if (event.shiftKey) {
            selection = this.currentSentence.getPrevArgumentSelection(this.getCursorPosition());
          } else {
            selection = this.currentSentence.getNextArgumentSelection(this.getCursorPosition());
          }

          if (selection) {
            this.setSelection(selection[0], selection[1]);
            this.updateForceAutocompleteOnTab(selection[0]);
            this.autocompleteWidget.gatherOptionsAfterIdle();
          }
        }
      // sentence parser
      } else if (event.keyCode == 13 && this.inputField.val().length) {
        this.onEnter();

      } else if (event.keyCode == 38 && !this.autocompleteWidget.hasOptions()) {
        this.autocompleteWidget.setOptions(this.history.get());

      } else if (this.isCharacterKey(event.keyCode)){
        this.updateInputFieldSize(1);
      }
    },

    updateInputFieldSize: function(add)
    {
      var length = this.inputField.val().length + add;
      length = length < 1 ? 1 : length;
      this.inputField.attr('size', length);
    },

    getCursorPosition: function()
    {
      var caretPos = 0;
      var inputField = this.inputField[0];
      if (document.selection) {
        inputField.focus();
        var selection = document.selection.createRange();
        selection.moveStart('character', -inputField.value.length);
        caretPos = selection.text.length;
      } else if (inputField.selectionStart || inputField.selectionStart == '0') {
        caretPos = inputField.selectionStart;
      }
      return caretPos;
    },

    setSelection: function(from, to)
    {
      var inputField = this.inputField[0];
      if(inputField.setSelectionRange) {
        inputField.focus();
        inputField.setSelectionRange(from, to);
      } else if (inputField.createTextRange) {
        var range = inputField.createTextRange();
        range.moveStart('character', from);
        range.moveEnd('character', to);
        range.select();
      }
    },

    updateForceAutocompleteOnTab: function(cursorPosition)
    {
      var argument = this.currentSentence.getArgument(cursorPosition);
      if (!argument || !argument.entity.isComplexType()) {
        this.autocompleteWidget.clearOptions();
        this.autocompleteWidget.setForceAutocompleteOnTab(true);
      } else if (argument && argument.entity.isComplexType()) {
        this.autocompleteWidget.setForceAutocompleteOnTab(false);
      }
    },

    isCharacterKey: function(keyCode) {
      return !(
              keyCode == 9  || keyCode == 20 || // tab / capslock
              keyCode == 37 || keyCode == 38 || // arrow
              keyCode == 39 || keyCode == 40 || // arrow
              keyCode == 33 || keyCode == 34 || // page down / up
              keyCode == 35 || keyCode == 36 || // home / end
              keyCode == 16 || keyCode == 17 || // shift / ctrl
              keyCode == 18 || keyCode == 27  // alt / esc
              );
    },
    keyup: function(event)
    {
      this.currentSentence.parse(this.inputField.val());
      this.updateInputFieldSize(0);

      // left or right
      if ((event.keyCode == 37 || event.keyCode == 39) && this.currentSentence.isMatching()) {
        this.updateForceAutocompleteOnTab(this.getCursorPosition());
      }
    },

    autocomplete: function(setOptions)
    {
      if (this.currentSentence.isMatching()) {
        var argument = this.currentSentence.getArgument(this.getCursorPosition());
        if (argument && argument.entity.isComplexType()) {
            setOptions(this.__autocompleteContext(
              argument.value, argument.name,
              this.currentSentence.getSentence(), this.currentSentence.getNamedArguments()
              ));
            this.autocompleteWidget.setLeftPositionToCursor(true);
        }
      } else {
        var options = [];
        try {
          options = this.dialogLauncher.autocompleteExpression(this.inputField.val());
        } catch (error) {
          // tokenizer syntax error
          // no autocomplete by catching error
        }
        setOptions(options);
        this.autocompleteWidget.setLeftPositionToCursor(false);
      }
    },

    __autocompleteContext: function(text, argumentName, sentence, argumentValues)
    {
      return this.get("context").autocompleteWithSentence(text, argumentName, sentence, argumentValues);
    },

    select: function(event)
    {
      if (this.__isSentenceSelectEvent(event)) {
        this.__sentenceSelectionHandler(event.option);
      } else if (this.__isArgumentSelectEvent(event)) {
        this.__argumentSelectionHandler(event.option);
      } else {
        this.val(event.option.value, 0);
      }
    },

    __isSentenceSelectEvent: function(event)
    {
      return event.option.sentence;
    },

    __sentenceSelectionHandler: function(option)
    {
      this.val(option.value, 0);
      if(!option.sentence.hasArguments()) {
        this.onEnter();
      } else if (option.expression.hasInlineArguments()){
        this.currentSentence.set(option.expression);
        this.currentSentence.parse(option.value);
        var argumentSelection = this.currentSentence.getNextArgumentSelection(0);
        this.setSelection(argumentSelection[0], argumentSelection[1]);
      }
    },

    __isArgumentSelectEvent: function(event)
    {
      return event.option.exactMatch !== undefined;
    },

    __argumentSelectionHandler: function(option)
    {
      var argument = this.currentSentence.getArgument(this.getCursorPosition());
      if (argument) {
        var newText = this.inputField.val().substring(0, argument.selection[0]);
        newText += (option.value.indexOf(' ') != -1) ? '"' + option.value + '"' : option.value;
        var newCursorPosition = newText.length;
        newText += ' '+this.inputField.val().substring(argument.selection[1]+1);
        this.val(newText, 0);
        this.currentSentence.parse(newText);
        var argumentSelection = this.currentSentence.getNextArgumentSelection(newCursorPosition);
        this.setSelection(argumentSelection[0], argumentSelection[1]);
      }
    },

    focus: function()
    {
      this.inputField.focus();
      this.container.get('type_writer').stop();
    },

    val: function(value, widthOffset)
    {
      var result = this.inputField.val(value);
      this.updateInputFieldSize(widthOffset !== undefined ? widthOffset : 1);
      return result;
    },

    inactiveFieldListener: function() {
      var $this = this;
      return function(event) {
        var target = $(event.target);
        if (!target.is('input,select,textarea,.focusable,.focusable *')) {
          $this.focus();
          if (event.keyCode != 13) {
            $this.updateInputFieldSize(1);
          }
        }
      };
    }
  }
);
