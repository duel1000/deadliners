require('consoloid-framework/Consoloid/Test/UnitTest');
require('../TypeWriter');

describeUnitTest('Consoloid.Ui.TypeWriter', function() {
  var
    clock,
    writer;

  beforeEach(function() {
    clock = sinon.useFakeTimers();
    writer = env.create(Consoloid.Ui.TypeWriter, { });

    writer.setInputfield($('<input id="inputSelector"/>'));
  });

  describe('#setInputfield(inputfield)', function(){
    it('should set the inputfield value', function(){
      writer.inputfield = undefined;
      writer.setInputfield($('<input id="inputSelector"/>'));
      writer.inputfield.attr('id').should.be.eql('inputSelector');
    });
  });

  describe('#write(text)', function(){
    it('should do nothing when not has input field', function(){
      writer.inputfield = undefined;
      writer.isWriting().should.be.false;
      writer.write('alma');
      writer.isWriting().should.be.false;
    });

    it('should do nothing when input field is disabled', function(){
      writer.inputfield = { is: sinon.stub().returns(true) };

      writer.isWriting().should.be.false;
      writer.write('apple');
      writer.inputfield.is.calledWith(':disabled').should.be.true;
      writer.isWriting().should.be.false;
    });

    describe('Queue', function(){
      it('should add text to the queue when the writer is write and the text is needed to exec', function(){
        writer.queue.length.should.be.eql(0);
        writer.write('alma1', true);
        writer.write('alma2', true);
        writer.write('alma3', true);

        writer.queue.length.should.be.eql(2);
        writer.queue[0].should.be.eql('alma2');
      });

      it('should do not add to the queue after has a manual exec text', function(){
        writer.write('alma1', false);
        writer.write('alma2', true);

        writer.queue.length.should.be.eql(0);

        writer.hasManualExec = false;
        writer.timeoutID = undefined;
        writer.queue = []
        writer.write('alma2', true);
        writer.write('alma1', false);
        writer.write('alma2', true);

        writer.queue.length.should.be.eql(1);
      });
    });

    it('should clear the previus input', function(){
      writer.inputfield.val('alma');
      writer.write('korte');

      writer.inputfield.val().should.be.eql('');
    });

    xit('should write the text into the inputfield like a human typed', function(){
      writer.write('alma');
      writer.inputfield.val().length.should.be.eql(0);

      clock.tick(200)
      writer.inputfield.val().length.should.be.above(0);
      writer.inputfield.val().length.should.be.below(4);
    });

    xit('should dispatch an typeWriterComplete event when its down', function(){
      var typeWriterCompleteSpy = sinon.spy();

      $(document).bind('typeWriterComplete', typeWriterCompleteSpy);

      writer.write('alma');
      clock.tick(500)

      typeWriterCompleteSpy.called.should.be.true;
    });

  });

  describe('#stop()', function(){
    it('should set isWriting state false', function(){
      writer.write('alma');
      writer.isWriting().should.be.true;

      writer.stop();
      writer.isWriting().should.be.false;
    });

    it('should drop the queue', function(){
      writer.write('alma1', true);
      writer.write('alma2', true);
      writer.queue.length.should.be.eql(1);

      writer.stop();
      writer.queue.length.should.be.eql(0);
    });
  });

  afterEach(function() {
    env.shutdown();
    clock.restore();
  });
});
