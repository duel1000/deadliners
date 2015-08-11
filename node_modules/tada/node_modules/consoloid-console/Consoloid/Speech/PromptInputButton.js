defineClass('Consoloid.Speech.PromptInputButton', 'Consoloid.Speech.InputButton',
  {
    handleRecognitionCompleted: function(event)
    {
      this.__base(event);
      this.prompt.updateInputFieldSize();
      this.prompt.search();
    },

    __disableButtonClick: function()
    {
      var promptHeight = $("#prompt").outerHeight();
      this.buttonNode.addClass("clicked-prompt-mic");
      $("#prompt").css({ height: promptHeight});
    },

    __enableButtonClick: function()
    {
      this.__base();
      this.buttonNode.removeClass("clicked-prompt-mic");
    },

    handleSoundPulse: function(event)
    {
      var
        width = parseInt(this.buttonNode.css("width")),
        height = parseInt(this.buttonNode.css("height")),
        opactiy = this.buttonNode.css("opacity"),
        marginLeft = parseInt(this.buttonNode.css("marginLeft")),
        marginTop = parseInt(this.buttonNode.css("marginTop")),
        marginBottom = parseInt(this.buttonNode.css("marginBottom")),
        marginRight = parseInt(this.buttonNode.css("marginRight")),
        paddingTop = parseInt(this.buttonNode.css("paddingTop"));

      this.buttonNode.animate({
        width: width + 10,
        height: height + 10,
        marginLeft: marginLeft - 5,
        marginTop: marginTop - 5,
        marginBottom: marginBottom - 5,
        marginRight: marginRight - 5,
        paddingTop: paddingTop + 5,
        opacity: opactiy * 0.6
      }, {
        duration: 200,
        complete: (function() {
          this.buttonNode.animate({
            width: width,
            height: height,
            marginLeft: marginLeft,
            marginTop: marginTop,
            marginBottom: marginBottom,
            marginRight: marginRight,
            paddingTop: paddingTop,
            opacity: opactiy
          }, {
            complete: (function(){
              this.buttonNode.css({
                width: "",
                height: "",
                marginLeft: "",
                marginTop: "",
                marginBottom: "",
                marginRight: "",
                paddingTop: "",
                opacity: ""
              });
            }).bind(this)
          });
        }).bind(this)
      });
    }
  }
);