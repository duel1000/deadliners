require("../../../Interpreter/Tokenizer.js");
require('../BaseFilterTokenizer.js');
require("consoloid-framework/Consoloid/Error/UserMessage");
require('consoloid-framework/Consoloid/Test/UnitTest');

describeUnitTest('Consoloid.Ui.List.BaseFilterTokenizer', function() {
  var
    tokenizer,
    translator;
  beforeEach(function() {
    var translator = {
      trans: function(string) {
        switch(string) {
          case "name":
            return "név";
          case "address":
            return "cím";
          default:
            return string;
        }
      }
    };
    env.addServiceMock('translator', translator);
  });

  describe("#__constructor(options)", function() {
    it("should require an array of keys", function() {
      (function() {
        env.create(Consoloid.Ui.List.BaseFilterTokenizer, {})
      }).should.throwError();
    });
  });

  describe("#tokenize(filterString)", function() {
    beforeEach(function() {
      tokenizer = env.create(Consoloid.Ui.List.BaseFilterTokenizer, {
        keys: ["name", "address"]
      });
    });

    it("should translate the keys and look for those in the string, then return them in a plain object", function() {
      var response = tokenizer.tokenize("név: Béla cím: Budapest");
      response.name.should.equal("Béla");
      response.address.should.equal("Budapest");
    });

    it("should work with double-quotes", function() {
      var response = tokenizer.tokenize('név: "Kovács Béla" cím: "Budapest, Foo utca"');
      response.name.should.equal("Kovács Béla");
      response.address.should.equal("Budapest, Foo utca");
    });

    it("should not need to find all keys", function() {
      var response = tokenizer.tokenize('név: "Kovács Béla"');
      response.name.should.equal("Kovács Béla");
      (response.address == undefined).should.be.okay;
    });

    it("should throw a user error on unknown key", function() {
      (function() {
        tokenizer.tokenize('foo: Bar név: "Kovács Béla"');
      }).should.throwError(Consoloid.Error.UserMessage);
    });

    it("should work with lower case keys no matter what", function() {
      var response = tokenizer.tokenize('Név: "Kovács Béla"');
      response.name.should.equal("Kovács Béla");
      (response.address == undefined).should.be.okay;
    });
  });
});