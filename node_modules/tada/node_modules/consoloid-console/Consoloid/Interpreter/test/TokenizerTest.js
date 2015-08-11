require('consoloid-framework/Consoloid/Test/UnitTest');
require('../Tokenizer');

describeUnitTest('Consoloid.Interpreter.Tokenizer', function(){
  var
    tokenizer;

  beforeEach(function() {
    tokenizer = env.create(Consoloid.Interpreter.Tokenizer, {});
  });

  describe('#_tokenizer()', function() {
    it('should return empty array for empty input', function() {
      tokenizer.parse('')
        .should.be.empty;
    });

    it('should seperate simple words', function() {
      var tokens = tokenizer.parse('say hello world');

      tokens.should.have.lengthOf(3);
      tokens[0].should.equal('say');
      tokens[1].should.equal('hello');
      tokens[2].should.equal('world');
    });

    it('should not seperate quote', function() {
      var tokens = tokenizer.parse('"say hello world"');

      tokens.should.have.lengthOf(1);
      tokens[0].should.equal('say hello world');
    });

    it('should return a word and a qoute', function() {
      var tokens = tokenizer.parse('say "hello world"');

      tokens.should.have.lengthOf(2);
      tokens[0].should.equal('say');
      tokens[1].should.equal('hello world');
    });

    it('should throw exception for empty quote', function() {
      (function() { tokenizer.parse('say " "') })
        .should.throwError();
    });

    it('should throw exception for non-ended quote', function() {
      (function() { tokenizer.parse('"quote"word"quote"word"') })
        .should.throwError();
    });

    it('should handle word-quote border without spaces', function() {
      var tokens = tokenizer.parse('"quote"word"quote"');

      tokens.should.have.lengthOf(3);
      tokens[0].should.equal('quote');
      tokens[1].should.equal('word');
      tokens[2].should.equal('quote');
    });

    it('should eliminate whitespaces', function() {
      var tokens = tokenizer.parse('  word1  word2  "  quoteWord1  quoteWord2  "  word3  ');

      tokens.should.have.lengthOf(4);
      tokens[0].should.equal('word1');
      tokens[1].should.equal('word2');
      tokens[2].should.equal('quoteWord1 quoteWord2');
      tokens[3].should.equal('word3');
    });

    it('should accept single quotes', function() {
      var tokens = tokenizer.parse("say 'hello world'");

      tokens.should.have.lengthOf(2);
      tokens[0].should.equal('say');
      tokens[1].should.equal('hello world');
    });

    it('should accept apostrophe', function() {
      var tokens = tokenizer.parse("Let's talk about 'computer's world'");

      tokens.should.have.lengthOf(4);
      tokens[0].should.equal("Let's");
      tokens[1].should.equal("talk");
      tokens[2].should.equal("about");
      tokens[3].should.equal("computer's world");
    });
  });

  afterEach(function() {
    env.shutdown();
  });
});
