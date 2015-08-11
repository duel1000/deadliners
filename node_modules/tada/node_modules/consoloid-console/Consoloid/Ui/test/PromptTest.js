require('consoloid-framework/Consoloid/Test/UnitTest');
require("consoloid-framework/Consoloid/Widget/JQoteTemplate");
require('consoloid-framework/Consoloid/Widget/jquery.jqote2.min.js');
require("consoloid-framework/Consoloid/Widget/Widget");
require("../CurrentSentence");
require("../History");
require("../Autocomplete");
require("../Prompt");
require("../../Speech/InputButton");
require("../../Speech/PromptInputButton");

describeUnitTest('Consoloid.Ui.Prompt', function(){
  var
    prompt,
    context;

  beforeEach(function() {
    env.addServiceMock('speech_recognizer', { createButtonFrom: function() {} });
    env.container.addSharedObject('type_writer', {setInputfield: function(){}, stop: function(){}});
    env.container.addSharedObject('dom', { baseNode: document.body });

    env.readTemplate(__dirname + '/../templates.jqote', 'utf8');
    env.addServiceMock('speech_prompt_button', {
      setButtonNode: sinon.spy(),
      setOutputNode: sinon.spy()
    });

    var dialogLauncher = {
      startFromText: sinon.stub(),
      autocompleteExpression: sinon.stub(),
    }

    context = {
      autocompleteWithSentence: sinon.stub()
    }
    env.addServiceMock("context", context);

    prompt = env.create(Consoloid.Ui.Prompt, {
      dialogLauncher: dialogLauncher,
    });

    prompt.node.appendTo($(document.body));
    prompt.render();

    sinon.stub($.fn, 'show', function(){});
    sinon.stub($.fn, 'hide', function(){});
  });

  describe('#render()', function() {
    it('should display the sentence prompt', function() {
      $('.dialog .request').should.have.lengthOf(1);
    });
  });

  describe('#onEnter()', function(){
    beforeEach(function(){

      sinon.spy(prompt, 'updateInputFieldSize');
      sinon.spy(prompt.history, 'add');
      sinon.spy(prompt.currentSentence, 'clear');
    });

    it('should do nothing when inputfield has no string', function(){
      prompt.inputField.val('');
      prompt.onEnter();

      prompt.history.add.called.should.be.false;
      prompt.updateInputFieldSize.called.should.be.false;
      prompt.currentSentence.clear.called.should.be.false;
      prompt.dialogLauncher.startFromText.called.should.be.false;
    });

    it('should start a dialog with the inputfield value', function(){
      this.clock = sinon.useFakeTimers();

      prompt.inputField.val('alma');
      prompt.onEnter();

      this.clock.tick(0);

      prompt.updateInputFieldSize.called.should.be.true;
      prompt.currentSentence.clear.called.should.be.true;
      prompt.inputField.val().should.be.eql('');
      prompt.history.add.calledWith('alma').should.be.true;
      prompt.dialogLauncher.startFromText.calledWith('alma').should.be.true;

      this.clock.restore();
    });


    it('should re-enable prompt if dialog start created an error, then throw that error', function(){
      this.clock = sinon.useFakeTimers();

      prompt.dialogLauncher.startFromText = function() { throw new Error('körte') };
      prompt.inputField.val('alma');
      sinon.spy(prompt, 'enablePrompt');

      (function() {
        prompt.onEnter();
        this.clock.tick(0);
        prompt.enablePrompt.called.should.be.true;
      }).should.throw()

      prompt.dialogLauncher.startFromText = function() {};
      prompt.enablePrompt.restore();
      this.clock.restore();
    });
  });

  describe('#keydown()', function() {
    it('should start dialog using current sentence on enter', function() {
      var clock = sinon.useFakeTimers();
      sinon.spy(prompt, 'onEnter');

      prompt.inputField.val('hello wor');
      prompt.keydown({ keyCode: 13 });
      clock.tick(0);

      prompt.onEnter.calledOnce.should.be.true;
      clock.restore();
    });

    it('should show autocomplete widget with history on up arrow keyevent', function(){
      sinon.spy(prompt.autocompleteWidget, 'setOptions');
      sinon.spy(prompt.history, 'get');

      prompt.keydown({ keyCode: 38 });

      prompt.history.get.calledOnce.should.be.true;
      prompt.autocompleteWidget.setOptions.calledOnce.should.be.true;
    });

    it('should increase inputfield width on character event', function(){
      sinon.spy(prompt, 'updateInputFieldSize');

      prompt.keydown({keyCode: 65});

      prompt.updateInputFieldSize.calledOnce.should.be.true;
      prompt.updateInputFieldSize.calledWith(1).should.be.true;
    });

    it('should decrease inputfield width on delete/backspace event', function(){
      sinon.spy(prompt, 'updateInputFieldSize');

      prompt.keydown({keyCode: 8});
      prompt.keydown({keyCode: 46});

      prompt.updateInputFieldSize.calledTwice.should.be.true;
      prompt.updateInputFieldSize.alwaysCalledWith(-1).should.be.true;
    });
  });

  describe('#disablePrompt()', function() {
    it('should disable prompt', function() {
      prompt.node = $('<div><div class="prompt"><input class="human-text" /></div></div>');
      prompt.disablePrompt();

      prompt.enabled.should.be.false;
      prompt.node.find('.human-text').is(":disabled").should.be.true;
    });

    it('should show throbber', function() {
      prompt.node = $('<div><div class="prompt"><div class="actions"><ul></ul></div></div></div>');
      prompt.disablePrompt();

      prompt.node.html().should.equal('<div class="prompt"><div class="actions"><ul><li id="throbber"><img alt="throbber" src="/Consoloid/Ui/images/throbber.gif" /></li></ul></div></div>');
    });
  });

  describe('#enablePrompt()', function() {
    it('should enable prompt', function() {
      prompt.node = $('<div><div class="prompt"><input class="human-text" disabled="disabled" /></div></div>');
      prompt.enablePrompt();

      prompt.enabled.should.be.true;
      prompt.node.find('.human-text').is(":enabled").should.be.true;
    });

    it('should remove throbber', function() {
      prompt.node = $('<div><div class="actions"><ul><li id="throbber"><img alt="throbber" src="/Consoloid/Ui/images/throbber.gif" /></li></ul></div></div>');
      prompt.enablePrompt();

      prompt.node.find('#throbber').length.should.equal(0);
    });
  });

  describe('#autocomplete(setOptions)', function(){
    var setOptionsSpy;
    var currentSentence;
    var argument;

    beforeEach(function(){
      setOptionsSpy = sinon.spy();
      currentSentence = {
        get: function() { return { getSentence: function(){ return { getArgument: sentenceGetArgumentStub }}}},
        isMatching: function(){ return false; },
        getArgument: sinon.stub(),
        getSentence: function(){ return 'sentence'; },
        getNamedArguments: function(){ return 'namedArguments'; }
      }
      prompt.currentSentence = currentSentence;

      sinon.spy(prompt, 'getCursorPosition');
      argument = { isComplexType: function(){ return false;} };
      sinon.stub(argument, 'isComplexType');

      sinon.spy(prompt.autocompleteWidget, 'setLeftPositionToCursor');
    });

    it('should autocomplete for whole sentence when not has currentSentence', function(){
      prompt.autocomplete(setOptionsSpy);

      setOptionsSpy.calledOnce.should.be.true;
      prompt.autocompleteWidget.setLeftPositionToCursor.alwaysCalledWith(false).should.be.eql.true;
      prompt.dialogLauncher.autocompleteExpression.calledOnce.should.be.true;
      context.autocompleteWithSentence.called.should.be.false;
      prompt.getCursorPosition.called.should.be.false;
    });

    it('should do nothing when has currentSentence but the cursor not in an argument', function(){
      currentSentence.isMatching = function(){ return true; }

      prompt.autocomplete(setOptionsSpy);

      prompt.getCursorPosition.called.should.be.true;
      currentSentence.getArgument.calledOnce.should.be.true;
      setOptionsSpy.called.should.be.false;
      prompt.dialogLauncher.autocompleteExpression.called.should.be.false;
      context.autocompleteWithSentence.called.should.be.false;
    });

    it('should do nothing when has currentSentence and the cursor in an simple type argument', function(){
      currentSentence.isMatching = function(){ return true; }

      currentSentence.getArgument.returns({name:'alma', entity: argument});

      prompt.autocomplete(setOptionsSpy);

      prompt.getCursorPosition.called.should.be.true;
      argument.isComplexType.calledOnce.should.be.true;
      currentSentence.getArgument.calledOnce.should.be.true;
      setOptionsSpy.called.should.be.false;
      prompt.dialogLauncher.autocompleteExpression.called.should.be.false;
      context.autocompleteWithSentence.called.should.be.false;
    });

    it('should autocomplete from context when has currentSentence and the cursor in a complex type argument', function(){
      currentSentence.isMatching = function(){ return true; }
      argument.getType = function(){ return 'Consoloid.Context.Object'; };

      currentSentence.getArgument.returns({name:'alma', value:'korte', entity:argument});
      argument.isComplexType.returns(true);

      prompt.autocomplete(setOptionsSpy);

      prompt.getCursorPosition.called.should.be.true;
      argument.isComplexType.calledOnce.should.be.true;
      currentSentence.getArgument.calledOnce.should.be.true;
      prompt.autocompleteWidget.setLeftPositionToCursor.alwaysCalledWith(true).should.be.eql.true;
      context.autocompleteWithSentence.alwaysCalledWith('korte', 'alma', 'sentence', 'namedArguments').should.be.true;
      setOptionsSpy.called.should.be.true;
      prompt.dialogLauncher.autocompleteExpression.called.should.be.false;
    });
  });

  describe('#select(event)', function(){
    var event;

    beforeEach(function(){
      sinon.spy(prompt, "onEnter");

      event = {
        option: {
          value:'alma',
          expression: { text: 'alma' },
          sentence: {
            hasArguments: function() {
                return false;
              }
            }
          }
        };
    });

    it('should call onEnter when the sentence not has arguments', function(){
      var clock = sinon.useFakeTimers();
      sinon.spy(prompt, 'val');
      prompt.select(event);
      clock.tick(1);
      prompt.onEnter.calledOnce.should.be.true;
      prompt.val.calledWith(event.option.value).should.be.true;
      clock.restore();
    });

    it('should do nothing when the sentence has argument but not has inline arguments', function(){
      event.option.sentence.hasArguments = function() { return true; };
      event.option.expression.hasInlineArguments = function() { return false; };
      sinon.stub(prompt.currentSentence, 'set', function(){});

      prompt.select(event);
      prompt.onEnter.called.should.be.false;
      prompt.currentSentence.set.called.should.be.false;
    });

    it('should set/parse the currentSentence when the sentence has inline arguments', function(){
      event.option.sentence.hasArguments = function() { return true; };
      event.option.expression.hasInlineArguments = function() { return true; };
      sinon.stub(prompt.currentSentence, 'set', function(){});
      sinon.stub(prompt.currentSentence, 'parse', function(){});
      sinon.stub(prompt.currentSentence, 'getNextArgumentSelection', function(){ return [0,0]});

      prompt.select(event);
      prompt.onEnter.calledOnce.should.be.false;
      prompt.currentSentence.set.calledWith(event.option.expression).should.be.true;
      prompt.currentSentence.parse.calledWith(event.option.value).should.be.true;
      prompt.currentSentence.getNextArgumentSelection.calledOnce.should.be.true;
    });

    it('should update the argument when an argument selected', function(){
      event.option.sentence = undefined;
      event.option.exactMatch = false;
      var argument = { selection: [6,12] }
      sinon.spy(prompt, 'val');
      sinon.spy(prompt, 'setSelection');
      sinon.stub(prompt.inputField, 'val');
      sinon.stub(prompt.currentSentence, 'getArgument');
      sinon.stub(prompt.currentSentence, 'getNextArgumentSelection');
      prompt.currentSentence.getArgument.returns(argument);
      prompt.currentSentence.getNextArgumentSelection.returns([5,5])
      prompt.inputField.val.returns('param <name> bogy');

      prompt.select(event);
      prompt.val.alwaysCalledWith('param alma bogy').should.be.true;
      prompt.currentSentence.getNextArgumentSelection.alwaysCalledWith(10).should.be.eql.true;
      prompt.setSelection.alwaysCalledWith(5, 5).should.be.true;
    });

    it('should put argument in qoutes if it has more than one word', function(){
      event.option.sentence = undefined;
      event.option.exactMatch = false;
      event.option.value = "alma körte";
      var argument = { selection: [6,12] }
      sinon.spy(prompt, 'val');
      sinon.stub(prompt.inputField, 'val');
      sinon.stub(prompt.currentSentence, 'getArgument');
      sinon.stub(prompt.currentSentence, 'getNextArgumentSelection');
      prompt.currentSentence.getArgument.returns(argument);
      prompt.currentSentence.getNextArgumentSelection.returns([5,5])
      prompt.inputField.val.returns('param <name> bogy');

      prompt.select(event);
      prompt.val.alwaysCalledWith('param "alma körte" bogy').should.be.true;
    });

    it('should update the input value when not a sentence and not an argument selected', function() {
      event.option.sentence = undefined;
      event.option.exactMatch = undefined;
      sinon.spy(prompt, 'val');

      prompt.select(event);
      prompt.val.calledWith('alma').should.be.true;
      prompt.onEnter.calledOnce.should.be.false;
    });
  });

  afterEach(function() {
    $.fn.show.restore();
    $.fn.hide.restore();
  });
});
