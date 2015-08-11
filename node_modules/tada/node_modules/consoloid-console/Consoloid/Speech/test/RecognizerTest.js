require('consoloid-framework/Consoloid/Error/UserMessage');
require('../Recognizer');
require('consoloid-framework/Consoloid/Test/UnitTest');

describeUnitTest('Consoloid.Speech.Recognizer', function() {
  var
    engine,
    recognizer;

  beforeEach(function() {
    engine = {
      isSupportedBySystem: sinon.stub().returns(true),
      setLanguage: sinon.spy(),
      setListeners: sinon.spy(),
      start: sinon.spy(),
      abort: sinon.spy()
    };

    env.addServiceMock('recognition_engine', engine);

    recognizer = env.create('Consoloid.Speech.Recognizer', {
      engineServiceNames: [ 'recognition_engine' ]
    });
  });

  describe('#__constructor()', function() {
    it('should find the first recognizer engine supported by system', function() {
      env.addServiceMock('not_supported_recognizer', {
        isSupportedBySystem: sinon.stub().returns(false)
      });
      env.addServiceMock('working_engine1', {
        isSupportedBySystem: sinon.stub().returns(true),
        setListeners: sinon.spy(),
        setLanguage: sinon.spy()
      });
      env.addServiceMock('working_engine2', {
        isSupportedBySystem: sinon.stub().returns(true)
      });

      recognizer = env.create('Consoloid.Speech.Recognizer', {
        engineServiceNames: [ 'not_supported_recognizer', 'working_engine1', 'working_engine2' ]
      });

      recognizer.engine.should.equal(env.container.get('working_engine1'));
      env.container.get('not_supported_recognizer').isSupportedBySystem.calledOnce.should.be.true;
      env.container.get('working_engine1').isSupportedBySystem.calledOnce.should.be.true;
      env.container.get('working_engine2').isSupportedBySystem.calledOnce.should.be.false;
    });

    it('should set language on created engine', function() {
      engine.setLanguage.calledOnce.should.be.true;
      engine.setLanguage.calledWith('en').should.be.true;
    });

    it('should bind to result, nomatch and error listeners of engine', function() {
      engine.setListeners.calledOnce.should.be.true;
      engine.setListeners.args[0][0].should.have.property('result');
      engine.setListeners.args[0][0].should.have.property('nomatch');
      engine.setListeners.args[0][0].should.have.property('error');
    });
  });

  describe('#isSpeechRecognitionSupported()', function() {
    it('should return true when engine is set', function() {
      recognizer.isSpeechRecognitionSupported().should.be.true;
    });

    it('should return false when engine is not set', function() {
      recognizer = env.create('Consoloid.Speech.Recognizer', {
        engineServiceNames: [ ]
      });

      recognizer.isSpeechRecognitionSupported().should.be.false;
    });
  });

  describe('#start(listeners)', function() {
    it('should return false when a previously started recognition is still pending', function() {
      recognizer.start({});

      recognizer.start({}).should.equal(false);
    });

    it('should throw exception when speech recognition is not supported by the system', function() {
      (function() {
        recognizer.engine = undefined;
        recognizer.start({});
      }).should.throwError(/is not supported/);
    })

    it('should return a unique identifier when recognition successfully started', function() {
      var firstRecognition = recognizer.start({});
      firstRecognition.should.not.equal(false);

      recognizer.abort(firstRecognition);

      var secondRecognition = recognizer.start({});
      secondRecognition.should.not.equal(false);
      secondRecognition.should.not.equal(firstRecognition);
    });

    it('starts engine', function() {
      recognizer.start({});

      engine.start.calledOnce.should.be.true;
    });
  });

  describe('#abort(recognitionId)', function() {
    it('should do nothing when the pending recognition is not the one given in argument', function() {
      var id = recognizer.start({});

      recognizer.isRecognitionPending().should.be.true;

      recognizer.abort(id+1);

      recognizer.isRecognitionPending().should.be.true;
    });

    it('should abort pending recognition', function() {
      var id = recognizer.start({});

      recognizer.isRecognitionPending().should.be.true;

      recognizer.abort(id);

      recognizer.isRecognitionPending().should.be.false;
    });

    it('should call abort on engine', function() {
      var id = recognizer.start({});

      engine.abort.calledOnce.should.be.false;

      recognizer.abort(id);

      engine.abort.calledOnce.should.be.true;
    });
  });

  describe('#forwardEventToActiveInput(event)', function() {
    it('should call the listener given at start method', function() {
      var spy = sinon.spy();

      recognizer.start({
        result: spy
      });

      recognizer.forwardEventToActiveInput({
        type: 'result',
        foo: 'bar'
      });

      spy.calledOnce.should.be.true;
      spy.args[0][0].should.have.property('foo', 'bar');
    });

    it('should do nothing when the listener is not given at the start method', function() {
      recognizer.start({});

      (function() {
        recognizer.forwardEventToActiveInput({
          type: 'result',
          foo: 'bar'
        });
      }).should.not.throwError();
    });

    it('should do nothing when recognition is not started', function() {
      var spy = sinon.spy();

      recognizer.abort(recognizer.start({
        result: spy
      }));

      recognizer.forwardEventToActiveInput({
        type: 'result',
        foo: 'bar'
      });

      spy.calledOnce.should.be.false;
    });
  });

  describe('#handleRecognitionCompleted(event)', function() {
    it('should clear pending recognition status', function() {
      recognizer.start({});

      recognizer.handleRecognitionCompleted({ type: 'error' });

      recognizer.isRecognitionPending().should.be.false;
    });

    it('should call the listener given at start method', function() {
      var spy = sinon.spy();

      recognizer.start({
        error: spy
      });

      recognizer.handleRecognitionCompleted({
        type: 'error',
        foo: 'bar'
      });

      spy.calledOnce.should.be.true;
      spy.args[0][0].should.have.property('foo', 'bar');
    });
  });
});
