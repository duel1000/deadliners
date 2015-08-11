defineClass('Consoloid.Ui.TypeWriter', 'Consoloid.Base.Object',
  {
    __constructor: function(options)
    {
      this.__base($.extend({
        longTime: 4000,
        shortTime: 3000
      }, options));

      this.queue = [];
      this.timeoutID = undefined;
      this.lastTextIsAutoExec = true;
      this.__typeNextCharacter = this.__typeNextCharacter.bind(this);
      this.__startNextQueuedText = this.__startNextQueuedText.bind(this);
    },

    setInputfield: function(inputfield)
    {
      this.inputfield = inputfield;
    },

    write: function(text, execAfterWritten)
    {
      if (!this.inputfield || this.inputfield.is(':disabled') || text === undefined) {
          return;
      }

      if (this.isWriting() && this.lastTextIsAutoExec) {
        this.__addToQueue(text);
        this.lastTextIsAutoExec = execAfterWritten;
        return;
      }

      this.lastTextIsAutoExec = execAfterWritten;
      this.__startWrite(text);
    },

    __hasInputfield: function()
    {
      return this.inputfield && this.inputfield.length;
    },

    isWriting: function()
    {
      return this.timeoutID !== undefined;
    },

    __addToQueue: function(text)
    {
      this.queue.push(text);
    },

    __startWrite: function(text)
    {
      this.inputfield.val('');

      this.baseSpeed = this.__chooseWriteSpeed(text);
      this.text = text;
      this.processedText = text;

      this.__setTimeout();
    },

    __setTimeout: function()
    {
      this.timeoutID = setTimeout(this.__typeNextCharacter, this.__getCharSpeed(this.baseSpeed));
    },

    __typeNextCharacter: function()
    {
      if (!this.processedText) {
        this.__dispatchCompleteEvent();
        return;
      }

      this.inputfield.val(this.inputfield.val() + this.processedText[0]);
      this.processedText = this.processedText.substr(1);
      this.inputfield.trigger(jQuery.Event('keyup'));

      this.__setTimeout();
    },

    __dispatchCompleteEvent: function()
    {
      if (this.queue.length != 0) {
        this.trigger('typeWriterComplete', true);
        this.timeoutID = setTimeout(this.__startNextQueuedText, 100);
        return;
      } else {
        this.trigger('typeWriterComplete', this.lastTextIsAutoExec);
      }

      this.stop();
    },

    __startNextQueuedText: function()
    {
      this.__startWrite(this.queue.shift());
    },

    __chooseWriteSpeed: function(text)
    {
      var msecBetweenChar = Math.round(this.__getRandomSpeed(this.shortTime, this.longTime) / text.length);
      return msecBetweenChar;
    },

    __getRandomSpeed: function(minMsecBetweenChar, maxMsecBetweenChar)
    {
      return Math.random() * maxMsecBetweenChar + (minMsecBetweenChar - maxMsecBetweenChar);
    },

    __getCharSpeed: function(baseSpeed)
    {
      return this.__getRandomSpeed(baseSpeed * 0.60, baseSpeed * 1.80);
    },

    stop: function()
    {
      this.timeoutID = clearTimeout(this.timeoutID);
      this.queue = [];
      this.hasManualExec = false;
    }
  }
);