require('../InputButton');
require('consoloid-framework/Consoloid/Test/UnitTest');

describeUnitTest('Consoloid.Speech.InputButton', function() {
  var
    button;

  beforeEach(function() {
    button = env.create('Consoloid.Speech.InputButton', {
      buttonNode: {
        click: sinon.spy(),
        css: sinon.spy()
      },
      outputNode: {
        val: sinon.spy()
      },
      recognizer: {
        start: sinon.stub().returns("foo"),
        abort: sinon.stub()
      },
      grammerFixer: {
        fix: sinon.spy(function(text){ return text; })
      }
    });
  });

  describe('#__constructor()', function() {
    it('should require a recognizer options', function() {
      (function() {
        env.create('Consoloid.Speech.InputButton', {});
      }).should.throwError('recognizer must be injected');
    });

    it('should not try to bind on click if button is not present', function() {
      env.create('Consoloid.Speech.InputButton', { recognizer: {}});
    });

    it('should bind on click of the button if button is present', function() {
      button.buttonNode.click.calledOnce.should.be.true;
    });
  });

  describe('#setOutputNode(node)', function(){
    it('should set the outputNode', function(){
      button.setOutputNode({ foo: true});
      button.outputNode.foo.should.be.true;
    });
  });

  describe('#setButtonNode(node)', function(){
    it('should bind on click of a button', function(){
      button = env.create('Consoloid.Speech.InputButton', {recognizer:{}});
      button.setButtonNode({ click: sinon.spy()});
      button.buttonNode.click.calledOnce.should.be.true;
    });
  });

  describe('#clicked()', function() {
    it('should start speech recognizing', function() {
      button.clicked();

      button.recognizer.start.calledOnce.should.be.true;
    });

    it('should abort speech recognizing if recognition is underway', function() {
      button.clicked();
      button.clicked();

      button.recognizer.abort.calledOnce.should.be.true;
    });
  });

  describe('#handleRecognitionCompleted()', function() {
    beforeEach(function(){
      button.handleRecognitionCompleted({
        options: [
          {
            text: 'What is this?',
            confidence: 0.9
          },
          {
            text: 'What is that?',
            confidence: 0.1
          }
        ]
      });
    });

    it('should fill outputNode with value from recognizer', function() {
      button.outputNode.val.calledOnce.should.be.true;
      button.outputNode.val.calledWith('What is this?').should.be.true;
    });

    it('should use the grammer fixer if have it', function() {
      button.grammerFixer.fix.calledWith('What is this?').should.be.true;
    });
  });
});
