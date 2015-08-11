require('consoloid-framework/Consoloid/Test/UnitTest');
require("../ExpressionReferenceListener");

describeUnitTest('Consoloid.Ui.ExpressionReferenceListener', function(){
  var
    consoleMock,
    typeWriter;

  beforeEach(function(){
    typeWriter = {write: function(){}};
    consoleMock = { };
    consoleMock.prompt = { focus: function() {}, search: function(){} };
    env.addServiceMock('type_writer', typeWriter);
    env.addServiceMock('console', consoleMock);

    sinon.spy(typeWriter, 'write');
  });

  describe('constructor', function() {
    it('should bind on links having sentence-reference css class', function() {
      var spy = sinon.spy($.fn, "delegate");

      env.create(Consoloid.Ui.ExpressionReferenceListener, {});

      spy.calledOnce.should.equal(true);
      spy.calledWith('.expression-reference', 'click').should.equal(true);
      $.fn.delegate.restore();
    });
  });

  describe('#referenceClicked()', function() {
    it('should call the type_writer write method with data-text property of html node when clicked', function() {
      var
        event = { target: $('<a href="#" class="expression-reference" data-text="hello world">x</a>'), stopPropagation: function() {} },
        listener = env.create(Consoloid.Ui.ExpressionReferenceListener, {});

      listener.referenceClicked(event);

      typeWriter.write.calledWith('hello world', false).should.be.true;
    });

    it('should call the type_writer write with true when the "data-exec" property is "true" or "1"', function() {
      var
        event = { target: $('<a href="#" class="expression-reference" data-text="hello world" data-exec="1">x</a>'), stopPropagation: function() {} },
        listener = env.create(Consoloid.Ui.ExpressionReferenceListener, {});

      listener.referenceClicked(event);

      typeWriter.write.calledWith('hello world', true).should.be.true;
    });

    it('should retrieve data-text from a parent link tag when an inner tag is clicked', function() {
      var
        nodes = $('<a href="#" class="expression-reference" data-text="hello world" data-exec="1"><img src="test.jpg" /></a>');
        event = {
          target: nodes.find('img'),
          stopPropagation: sinon.spy()
        },
        listener = env.create(Consoloid.Ui.ExpressionReferenceListener, {});

      listener.referenceClicked(event);

      typeWriter.write.calledWith('hello world', true).should.be.true;
    });
  });

  afterEach(function() {
    env.shutdown();
  });
});
