require('../TreeBuilder');
require("../Advisor");
require("../InvalidArgumentsError");
require("../../Test/ConsoleUnitTest");
describeConsoleUnitTest('Consoloid.Interpreter.Advisor', function() {
  var
    tree,
    advisor,
    context;

  beforeEach(function(){

    tree = {
      getWords: sinon.stub(),
      autocomplete: sinon.stub()
    };
    env.addServiceMock('letter_tree', tree);
    context = {
      autocomplete: sinon.stub(),
      autocompleteWithSentence: sinon.stub(),
      findByStringAndClass: sinon.stub()
    };
    env.addServiceMock('context', context);
    advisor = env.create(Consoloid.Interpreter.Advisor, {});
  });

  describe("#__constructor(options)", function() {
    it("should get tree and context", function() {
      advisor.tree.should.equal(tree);
      advisor.context.should.equal(context);
    });
  });

  describe('#autocomplete(text)', function() {
    describe('usage of the tree autocomplete method', function(){
      var
        sentence,
        hit;

      beforeEach(function(){
        sentence =
        {
          validateArguments: sinon.stub().returns(true),
          requiredContextIsAvailable: sinon.stub().returns(true),
          autocompleteArguments: sinon.stub().returns([{}])
        };
        hit = {
          entity: {
            getTextWithArguments: sinon.stub(),
            hasInlineArgument: sinon.stub().returns(false),
            getAutocompleteScore: sinon.stub().returns(1),
            getSentence: function() { return sentence; }
          },
          tokens: [],
          values: {}
        };

        tree.getWords.returns([ 'foo' , 'bar']);
        tree.autocomplete.returns([ hit ]);
        hit.entity.getTextWithArguments.returns('foo bar');
      });

      it('should return the autocompleted expressions', function(){
        var result = advisor.autocomplete('fo b');

        tree.autocomplete.called.should.be.true;
        hit.entity.getTextWithArguments.called.should.be.true;
        hit.entity.getAutocompleteScore.called.should.be.true;

        result.should.have.lengthOf(1);
        result[0].sentence.should.be.eql(sentence);
        result[0].expression.should.be.eql(hit.entity);
        result[0].value.should.be.eql('foo bar');
        result[0].arguments.should.be.eql({});
        result[0].score.should.be.eql(1);
      });

      it('should consider sentence requiredContextIsAvailable method', function(){
        sentence.requiredContextIsAvailable.returns(false);
        var result = advisor.autocomplete('fo b');

        result.should.be.empty;
      });
    });

    it('should find sentences having arguments matching given arguments', function() {
      var
        hit = {
          entity: {
            getTextWithArguments: sinon.stub(),
            hasInlineArgument: sinon.stub().returns(false),
            getAutocompleteScore: sinon.stub().returns(3),
            getSentence: function() {
              return {
                arguments: {
                  'name': {
                    isComplexType: sinon.stub().returns(false)
                  },
                  'no_nana': {
                    isComplexType: sinon.stub().returns(false)
                  },
                },
                validateArguments: sinon.stub().returns(true),
                requiredContextIsAvailable: sinon.stub().returns(true),
                autocompleteArguments: sinon.stub().returns(
                  [
                    { name: 'hello'},
                    { no_nana: 'hello' }
                  ]
                )
              }
            }
          },
          tokens: [],
          values: {}
        };

      tree.getWords.returns([ 'fo' , 'b']);
      tree.autocomplete.returns([ hit ]);
      hit.entity.getTextWithArguments.withArgs({ name: { value: 'hello', exactMatch: true } }).returns('foo bar, with name hello');
      hit.entity.getTextWithArguments.withArgs({ no_nana: { value: 'hello', exactMatch: true } }).returns('foo bar, without nana hello');

      var result = advisor.autocomplete('fo', 'bar');
      result.should.have.lengthOf(2);
      result[0].sentence.should.be.equal(result[1].sentence);
      result[0].arguments.name.value.should.be.eql('hello');
      result[0].value.should.eql('foo bar, with name hello');
      result[1].arguments.no_nana.value.should.be.eql('hello');
      result[1].value.should.eql('foo bar, without nana hello');
    });

    it('should not find inline argument sentence when argument value is provided after comma', function() {
      var
        hit = {
          entity: {
            hasInlineArgument: sinon.stub().returns(true),
            getSentence: function() {
              return {
                autocompleteArguments: sinon.stub().returns( [ { name: 'great'} ]),
                requiredContextIsAvailable: sinon.stub().returns(true),
              }
            }
          },
          tokens: [],
          values: {}
        };

      tree.getWords.returns([ 'do' , 'som']);
      tree.autocomplete.returns([ hit ]);

      var result = advisor.autocomplete('do som', ['with name great']);
      result.should.have.lengthOf(0);
    });

    it('should accept arguments for an expression form excluding the ones in the expression text', function() {
      var
        hit = {
          entity: {
            getTextWithArguments: sinon.stub(),
            hasInlineArgument: sinon.stub().returns(false),
            getAutocompleteScore: function(){},
            getSentence: function() {
              return {
                arguments: {
                  'name': {
                    isComplexType: sinon.stub().returns(false)
                  },
                  'no_nana': {
                    isComplexType: sinon.stub().returns(false)
                  },
                },
                validateArguments: sinon.stub().returns(true),
                requiredContextIsAvailable: sinon.stub().returns(true),
                autocompleteArguments: sinon.stub().returns(
                  [
                    { no_nana: 'juju' }
                  ]
                )
              }
            }
          },
          tokens: [],
          values: {name: 'great'}
        };

      tree.getWords.returns([ 'do', 'som', 'great' ]);
      tree.autocomplete.returns([ hit ]);
      hit.entity.hasInlineArgument.withArgs('name').returns(true);
      hit.entity.getTextWithArguments.withArgs({
        name: { value: 'great', exactMatch: true },
        no_nana: { value: 'juju', exactMatch: true }
        }).returns('do something great, without nana juju');

      var result = advisor.autocomplete('do som great', ['wi na juju']);
      result.should.have.lengthOf(1);
      result[0].arguments.name.value.should.be.eql('great');
      result[0].arguments.no_nana.value.should.be.eql('juju');
      result[0].value.should.eql('do something great, without nana juju');
    });

    describe('autocomplete expression agrument values from context', function(){
      it('when argument type is complex', function(){
        var
        hit = {
          entity: {
            getTextWithArguments: sinon.stub(),
            hasInlineArgument: sinon.stub().returns(false),
            getAutocompleteScore: function(){},
            getSentence: function() {
              return {
                arguments: {
                  'name': {
                    isComplexType: sinon.stub().returns(true),
                    getType: sinon.stub().returns('Consoloid.Base.Object')
                  }
                },
                validateArguments: sinon.stub().returns(true),
                requiredContextIsAvailable: sinon.stub().returns(true),
                autocompleteArguments: sinon.stub().returns(
                  [
                    { name: 'great'},
                  ]
                )
              }
            }
          },
          tokens: [],
          values: {}
        };

        tree.getWords.returns([ 'do', 'som' ]);
        tree.autocomplete.returns([ hit ]);
        context.autocomplete.returns([{ value:'great', exactMatch: true }]);
        hit.entity.getTextWithArguments.withArgs({name: { value: 'great', exactMatch: true }}).returns('do something, name great');

        var result = advisor.autocomplete('do som', ['na gre']);
        context.autocomplete.called.should.be.true;
        result.should.have.lengthOf(1);
        result[0].arguments.name.value.should.be.eql('great');
        result[0].value.should.eql('do something, name great');
      });

      it('and try to create a new one if the autocomplete was unsuccessful', function(){
        var
          newContextObject = { toString: sinon.stub().returns('gre') },
          hit = {
            entity: {
              getTextWithArguments: sinon.stub(),
              hasInlineArgument: sinon.stub().returns(false),
              getAutocompleteScore: function(){},
              getSentence: function() {
                return {
                  arguments: {
                    'name': {
                      isComplexType: sinon.stub().returns(true),
                      getType: sinon.stub().returns({
                        fromString: sinon.stub().returns(newContextObject)
                      })
                    }
                  },
                  validateArguments: sinon.stub().returns(true),
                  requiredContextIsAvailable: sinon.stub().returns(true),
                  autocompleteArguments: sinon.stub().returns(
                    [
                      { name: 'gre'},
                    ]
                  )
                }
              }
            },
            tokens: [],
            values: {}
          };

        tree.getWords.returns([ 'do', 'som' ]);
        tree.autocomplete.returns([ hit ]);
        context.autocomplete.returns([]);
        hit.entity.getTextWithArguments.withArgs({name: {entity: newContextObject, value: 'gre', exactMatch: true }}).returns('do something, name gre');

        var result = advisor.autocomplete('do som', ['na gre']);
        result.should.have.lengthOf(1);
        result[0].arguments.name.value.should.be.eql('gre');
        result[0].value.should.eql('do something, name gre');
      });

      it('should add the sentence with the inputed argument to result, but should mark arguments as erroneous', function() {
        var
          hit = {
            entity: {
              getTextWithArguments: sinon.stub(),
              hasInlineArgument: sinon.stub().returns(false),
              getAutocompleteScore: function(){},
              getSentence: function() {
                return {
                  arguments: {
                    'name': {
                      isComplexType: sinon.stub().returns(true),
                      getType: sinon.stub().returns({
                        fromString: sinon.stub().throws()
                      })
                    }
                  },
                  validateArguments: sinon.stub().returns(true),
                  requiredContextIsAvailable: sinon.stub().returns(true),
                  autocompleteArguments: sinon.stub().returns(
                    [
                      { name: 'gre'},
                    ]
                  )
                }
              }
            },
            tokens: [],
            values: {}
          };

        tree.getWords.returns([ 'do', 'som' ]);
        tree.autocomplete.returns([ hit ]);
        context.autocomplete.returns([]);
        hit.entity.getTextWithArguments.withArgs({name: {value: 'gre', erroneous: true }}).returns('do something, name gre');

        var result = advisor.autocomplete('do som', ['na gre']);
        result.should.have.lengthOf(1);
        result[0].arguments.name.value.should.be.eql('gre');
        result[0].arguments.name.erroneous.should.be.ok;
      });

      it("should create erroneous options for invalid argument combinations", function() {
        var
          error = env.create(Consoloid.Interpreter.InvalidArgumentsError, { message: "Strangely invalid argument", arguments: ["name"] }),
          hit = {
            entity: {
              getTextWithArguments: sinon.stub(),
              hasInlineArgument: sinon.stub().returns(false),
              getAutocompleteScore: function(){},
              getSentence: function() {
                return {
                  arguments: {
                    'name': {
                      isComplexType: sinon.stub().returns(false),
                    }
                  },
                  validateArguments: sinon.stub().throws(error),
                  requiredContextIsAvailable: sinon.stub().returns(true),
                  autocompleteArguments: sinon.stub().returns(
                    [
                      { name: 'gre'},
                    ]
                  )
                }
              }
            },
            tokens: [],
            values: {}
          };
        tree.getWords.returns([ 'do', 'som' ]);
        tree.autocomplete.returns([ hit ]);
        var result = advisor.autocomplete('do som', ['na gre']);
      });
    });
  });

  describe("#matchArgumentsToExpression(text, expression, values, args)", function() {
    it("should return results for only that expression", function() {
      tree.autocomplete.returns([ {
        entity: {
          getTextWithArguments: sinon.stub().returns("Do some work"),
          hasInlineArgument: sinon.stub().returns(false),
          getAutocompleteScore: sinon.stub(),
          getSentence: sinon.stub().returns({
            arguments: {
              'name': {
                isComplexType: sinon.stub().returns(false)
              }
            },
            validateArguments: sinon.stub().returns(true),
            requiredContextIsAvailable: sinon.stub().returns(true)
          })
        },
        tokens: [],
        values: {}
      }]);
      var theValidExpression = {
        getTextWithArguments: sinon.stub().returns("Do something"),
        hasInlineArgument: sinon.stub().returns(false),
        getAutocompleteScore: sinon.stub(),
        getSentence: sinon.stub().returns({
          arguments: {
            'name': {
              isComplexType: sinon.stub().returns(false)
            }
          },
          validateArguments: sinon.stub().returns(true),
          requiredContextIsAvailable: sinon.stub().returns(true)
        })
      }
      var result = advisor.matchArgumentsToExpression('do som', theValidExpression, { name: "Foo" });
      result[0].expression.should.equal(theValidExpression);
      result[0].arguments.name.value.should.equal("Foo");
      result[0].value.should.equal("Do something");
    });
  });

  describe('#__buildAutocompletedArgumentValueOptions(autcompletedArgumentValues, sentence)', function(){
    var source1 = {
      param1: [0,1],
      param2: [0],
      param3: [0,1,2]
    };
    var dest1 = [
      {param1: 0, param2: 0, param3: 0},
      {param1: 1, param2: 0, param3: 0},
      {param1: 0, param2: 0, param3: 1},
      {param1: 1, param2: 0, param3: 1},
      {param1: 0, param2: 0, param3: 2},
      {param1: 1, param2: 0, param3: 2}
    ];

    var source2 = {
      param1: [0,1],
      param2: [0,1,2],
      param3: [0,1]
    };
    var dest2 = [
      {param1: 0, param2: 0, param3: 0},
      {param1: 1, param2: 0, param3: 0},
      {param1: 0, param2: 1, param3: 0},
      {param1: 1, param2: 1, param3: 0},
      {param1: 0, param2: 2, param3: 0},
      {param1: 1, param2: 2, param3: 0},
      {param1: 0, param2: 0, param3: 1},
      {param1: 1, param2: 0, param3: 1},
      {param1: 0, param2: 1, param3: 1},
      {param1: 1, param2: 1, param3: 1},
      {param1: 0, param2: 2, param3: 1},
      {param1: 1, param2: 2, param3: 1},
    ];

    var compare = function(dest, result)
      {
        for (var i=0; i < dest.length; i++) {
          result.should.includeEql(dest[i])
        }
        result.should.have.lengthOf(dest.length);
      }

    var sentence = { validateArguments: function(){ return true; }, requiredContextIsAvailable: function(){ return true; } };

    it('should return an array with the combined possibilities', function(){
      var versions = advisor.__buildAutocompletedArgumentValueOptions(source1, sentence);
      compare(dest1, versions);

      versions = advisor.__buildAutocompletedArgumentValueOptions(source2, sentence);
      compare(dest2, versions);
    });

    it('should consider the sentence validateArguments method result', function(){
      sentence.validateArguments = function(arguments)
      {
        if (arguments.param1 == 0 || arguments.param3 == 1) {
          return false;
        }

        return true;
      }

      dest2 = [
        {param1: 1, param2: 0, param3: 0},
        {param1: 1, param2: 1, param3: 0},
        {param1: 1, param2: 2, param3: 0}
      ];

      var versions = advisor.__buildAutocompletedArgumentValueOptions(source2, sentence);
      compare(dest2, versions);
    });
  });
});
