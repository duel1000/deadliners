require('../Token');
require("../Tokenizable");
require("../../Test/ConsoleUnitTest");
describeConsoleUnitTest('Consoloid.Interpreter.Tokenizable', function() {
  describe('#_tokenize()', function() {
    it('should return argument value places of the given text', function() {
      var tokenizable = env.create(Consoloid.Interpreter.Tokenizable, {})
      tokenizable._tokenize('rename <from> to <to>');

      var tokens = tokenizable.getTokens();
      tokens.should.have.lengthOf(4);
      tokens[0].should.have.property('type', Consoloid.Interpreter.Token.LITERAL);
      tokens[0].should.have.property('text', 'rename');
      tokens[1].should.have.property('type', Consoloid.Interpreter.Token.ARGUMENT_VALUE);
      tokens[1].should.have.property('text', 'from');
      tokens[2].should.have.property('type', Consoloid.Interpreter.Token.LITERAL);
      tokens[2].should.have.property('text', 'to');
      tokens[3].should.have.property('type', Consoloid.Interpreter.Token.ARGUMENT_VALUE);
      tokens[3].should.have.property('text', 'to');
    });

    it('should return expression with argument value of the text', function() {
      env.setTokenMocks({'rename "<from> to <to>"': ['rename', '<from> to <to>']});

      var tokenizable = env.create(Consoloid.Interpreter.Tokenizable, {})
      tokenizable._tokenize('rename "<from> to <to>"');

      var tokens = tokenizable.getTokens();
      tokens.should.have.lengthOf(2);
      tokens[0].should.have.property('type', Consoloid.Interpreter.Token.LITERAL);
      tokens[0].should.have.property('text', 'rename');
      tokens[1].should.have.property('type', Consoloid.Interpreter.Token.LITERAL);
      tokens[1].should.have.property('text', '<from> to <to>');
    });
  });
});
