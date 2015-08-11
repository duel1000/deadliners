defineClass('Consoloid.OS.Process', 'Consoloid.Base.Object',
  {
    __constructor: function(options)
    {
      this.__base($.extend({
        args: [],
        spawnOptions: {},
        readStdout: this.__defaultStdoutCallback.bind(this),
        readStderr: this.__defaultStderrCallback.bind(this),
        onClose: this.__defaultOnCloseCallback.bind(this),
        onError: this.__defaultOnErrorCallback.bind(this),
        killTimeOut: 5000,
        outputBufferSize: 1048576
      }, options));

      this.requireProperty('command');

      this.spawn = require('child_process').spawn;
      this.childProcess = undefined;
      this.isRunning = false;
      this.stdout = '';
      this.stderr = '';
    },

    __defaultStdoutCallback: function(data)
    {
      this.stdout += this.__getBufferToAppend(this.stdout.length, data);
      this.get('logger').log('debug', 'Process stdout', {pid: this.childProcess.pid, out: data.toString() });
    },

    __getBufferToAppend: function(length, data)
    {
      if (length + data.length > this.outputBufferSize) {
        data = data.slice(0, this.outputBufferSize - (length + data.length));
      }
      return data.toString();
    },

    __defaultStderrCallback: function(data)
    {
      this.stderr += this.__getBufferToAppend(this.stderr.length, data);
      this.get('logger').log('debug', 'Process stderr', {pid: this.childProcess.pid, error: data.toString() });
    },

    __defaultOnCloseCallback: function(code)
    {
      this.get('logger').log('info', 'Process closed', {pid: this.childProcess.pid, code: code });
    },

    __defaultOnErrorCallback: function(error)
    {
      this.get('logger').log('error', 'Process error', {pid: this.childProcess.pid, error: error.message });
    },

    getStdout: function()
    {
      return this.stdout;
    },

    getStderr: function()
    {
      return this.stderr;
    },

    start: function()
    {
      if (this.isRunning) {
        throw new Error('Process is already running, pid: ' + this.childProcess.pid);
      }

      this.childProcess = this.spawn(this.command, this.args, this.spawnOptions);
      this.isRunning = true;

      this.__bindEventCallbacks();
    },

    __bindEventCallbacks: function()
    {
      var $this = this;

      this.childProcess.stdout.on('data', function (data) {
        $this.readStdout(data);
      });

      this.childProcess.stderr.on('data', function (data) {
        $this.readStderr(data);
      });

      this.childProcess.on('close', function (code) {
        $this.isRunning = false;
        $this.onClose(code);
      });

      this.childProcess.on('error', function (error) {
        if (error.message == 'spawn ENOENT') {
          $this.isRunning = false;
        }
        $this.onError(error);
      });
    },

    writeStdin: function(data)
    {
      if (!this.isRunning) {
        throw new Error('Cannot write stdin since process is not running.');
      }

      this.childProcess.stdin.write(data);
    },

    forceQuit: function()
    {
      this.kill('SIGTERM');
      setTimeout(this.__sendKillSignal.bind(this), this.killTimeOut);
    },

    kill: function(signal)
    {
      if (!this.isRunning) {
        throw new Error('Cannot kill process since it is not running.');
      }
      this.childProcess.kill(signal);
    },

    __sendKillSignal: function()
    {
      if (this.isRunning) {
        this.kill('SIGKILL');
      }
    }
  }
);