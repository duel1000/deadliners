require('../Process');
require('consoloid-framework/Consoloid/Test/UnitTest');

describeUnitTest('Consoloid.OS.Process', function() {
  var
    clock,
    process,
    childProcess;

  beforeEach(function() {

    clock = sinon.useFakeTimers();

    process = env.create('Consoloid.OS.Process', {
        command: 'ls',
        args: ['-l'],
        spawnOptions: {},
        killTimeOut: 1000
    });

    childProcess = {
      stdout: {
        on: sinon.spy()
      },
      stderr: {
        on: sinon.spy()
      },
      on: sinon.spy(),
      kill: sinon.spy(),
      disconnect: sinon.spy()
    };

    process.spawn = function(command, args, spawnOptions) {
      return childProcess;
    };
  });

  describe('#__constructor()', function() {
    it('should require command option to be specified', function() {
      (function() {
        process = env.create('Consoloid.OS.Process', {
          args: ['-l'],
          spawnOptions: {},
        });
      }).should.throwError('command must be injected');
    });
  });

  describe('#start()', function() {
    it('starts the given command if not started before', function() {
      sinon.stub(process, '__bindEventCallbacks');
      process.start();

      process.childProcess.should.be.eql(childProcess);
      process.isRunning.should.be.true;
    });

    it('throws error when the process is already started', function() {
      sinon.stub(process, '__bindEventCallbacks');
      (function() { process.start(); }).should.not.throwError();
      (function() { process.start(); }).should.throwError();
    });
  });

  describe('#__bindEventCallbacks()', function() {
    var throwError = false;
    beforeEach(function() {
      childProcess = {
        stdout: {
          on: function(event, callback) {
            callback('test');
          }
        },
        stderr: {
          on: function(event, callback) {
            callback('test');
          }
        },
        on: function(event, callback) {
          if (event == 'close') {
            callback('on close test');
          }

          if (event == 'error' && throwError) {
            callback('on error test');
          }
        },
        kill: sinon.spy()
      };

      sinon.spy(childProcess.stdout, 'on');
      sinon.spy(childProcess.stderr, 'on');
      sinon.spy(childProcess, 'on');
      sinon.spy(process, '__bindEventCallbacks');
    });

    it('should bind stdout read event to readStdout member', function() {
      sinon.spy(process, 'readStdout');
      process.start();

      process.__bindEventCallbacks.calledOnce.should.be.true;
      process.childProcess.stdout.on.calledOnce.should.be.true;

      process.readStdout.calledOnce.should.be.true;
    });

    it('should bind stderr read event to readStderr member', function() {
      sinon.spy(process, 'readStderr');
      process.start();

      process.__bindEventCallbacks.calledOnce.should.be.true;
      process.childProcess.stderr.on.calledOnce.should.be.true;

      process.readStderr.calledOnce.should.be.true;
    });

    it('should bind close event to onClose member', function() {
      sinon.spy(process, 'onClose');
      process.start();

      process.__bindEventCallbacks.calledOnce.should.be.true;
      process.childProcess.on.called.should.be.true;
      process.childProcess.on.args[0][0].should.be.eql('close');

      process.onClose.calledOnce.should.be.true;
      process.onClose.calledWithExactly('on close test').should.be.true;
    });

    it('should bind error event to onError member', function() {
      throwError = true;
      sinon.spy(process, 'onError');
      process.start();

      process.__bindEventCallbacks.calledOnce.should.be.true;
      process.childProcess.on.called.should.be.true;
      process.childProcess.on.args[1][0].should.be.eql('error');

      process.onError.calledOnce.should.be.true;
      process.onError.calledWithExactly('on error test').should.be.true;
    });
  });

  describe('#kill(signal)', function() {
    it('should send given signal to process', function () {
      process.start();
      process.kill('signal');
      process.childProcess.kill.calledWithExactly('signal').should.be.true;
    });

    it('should throw error when to process is not running', function() {
      (function() { process.kill('signal'); }).should.throwError();
    });
  });

  describe('#forceQuit()', function() {
    it('should send terminate signal to the process', function() {
      sinon.spy(process, 'kill')
      process.start();
      process.forceQuit();
      process.kill.calledOnce.should.be.true;
      process.kill.calledWithExactly('SIGTERM').should.be.true;
    });

    it('should wait specified timeout for the child process to exit and then stop the process', function() {
      sinon.spy(process, 'kill')
      sinon.spy(process, '__sendKillSignal');
      process.start();
      process.forceQuit();

      clock.tick(process.killTimeOut - 1);
      process.__sendKillSignal.calledOnce.should.be.false;
      clock.tick(1);
      process.__sendKillSignal.calledOnce.should.be.true;

      process.kill.calledTwice.should.be.true;
      process.kill.calledWithExactly('SIGKILL').should.be.true;
    });
  });

  describe('#__defaultStdoutCallback(data)', function() {
    it('should store standard output in stdout member', function() {
      process.childProcess = { pid: 1000 };
      process.__defaultStdoutCallback('test');
      process.getStdout().should.equal('test');
    });

    it('should not write to stdout member more than outputBufferSize', function() {
      process.childProcess = { pid: 1000 };
      process.outputBufferSize = 2;
      process.__defaultStdoutCallback('test');
      process.getStdout().should.equal('te');
      process.__defaultStdoutCallback('foo');
      process.getStdout().should.equal('te');
    });
  });

  describe('#__defaultStderrCallback(data)', function() {
    it('should store standard error in stderr member', function() {
      process.childProcess = { pid: 1000 };
      process.__defaultStderrCallback('test');
      process.getStderr().should.equal('test');
    });

    it('should not write to stderr member more than outputBufferSize', function() {
      process.childProcess = { pid: 1000 };
      process.outputBufferSize = 2;
      process.__defaultStderrCallback('test');
      process.getStderr().should.equal('te');
      process.__defaultStderrCallback('foo');
      process.getStderr().should.equal('te');
    });
  });
});