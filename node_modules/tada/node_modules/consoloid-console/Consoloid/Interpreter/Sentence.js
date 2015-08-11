defineClass('Consoloid.Interpreter.Sentence', 'Consoloid.Base.Object',
  {
    __constructor: function(options)
    {
      this.__base($.extend({
        arguments: {},
        method: 'start'
      }, options), { overridableMethods: ['create' ,'validateArguments', 'requiredContextIsAvailable'] });

      this.requireProperty('patterns');
      this.requireProperty('service');

      this.__buildArgumentTree();
      this.__createExpressions();
    },

    __buildArgumentTree: function()
    {
      var $this = this;
      this.argumentTree = this.create('Consoloid.Interpreter.ArgumentTree', {
        container: $this.container
      });
      $.each(this.arguments, function(name, argument) {
        if (!(argument instanceof getClass('Consoloid.Interpreter.Argument'))) {
          $this.arguments[name] = $this.create.apply($this, [ 'Consoloid.Interpreter.Argument', $.extend(
            {},
            argument,
            {
              name: name,
              pattern: $this.get('translator').trans(argument.pattern),
              container: $this.container
            })
          ]);
          argument = $this.arguments[name];
        }
        $this.argumentTree.addEntity(argument);
      });
    },

    __createExpressions: function()
    {
      var $this = this;
      this.expressions = [];
      $.each(this.patterns, function(index, pattern) {
        var fixedArguments = {};
        if (typeof pattern != "string") {
          fixedArguments = $this.__createValuesFromFixedArguments(pattern.fixedArguments);
          pattern = pattern.pattern;
        }
        $this.expressions.push($this.create(
          'Consoloid.Interpreter.Expression',
          {
            sentence: $this,
            pattern: $this.get('translator').trans(pattern),
            container: $this.container,
            fixedArguments: fixedArguments
          }
        ));
      });
    },

    __createValuesFromFixedArguments: function(fixedArguments)
    {
      var result = {};
      $.each(fixedArguments, function(key, argument) {
        result[key] = {
          value: argument
        }
      });

      return result;
    },

    requiredContextIsAvailable: function()
    {
      return true;
    },

    validateArguments: function(arguments)
    {
      return true;
    },

    hasArguments: function()
    {
      return Object.keys(this.arguments).length !== 0;
    },

    hasArgument: function(name)
    {
      return (name in this.arguments);
    },

    getArgument: function(name)
    {
      if (this.hasArgument(name)){
        return this.arguments[name];
      }
      return undefined;
    },

    getExpressions: function()
    {
      return this.expressions;
    },

    /**
     * Return all possible argument interpretation.
     *
     * @param args Array arguments as text.
     * @returns Array Possible argument name-value pairs.
     */
    autocompleteArguments: function(args)
    {
      var optionTree = [ { args: args, values: {} } ];
      var result = [];
      while(optionTree.length > 0) {
        var option = optionTree.shift();
        $.each(this.__findOptionsForFirstArgument(option.args, option.values, result), function(index, newOption) {
          optionTree.push(newOption);
        });
      }
      return result;
    },

    __findOptionsForFirstArgument: function(args, values, result)
    {
      if (args.length == 0) {
        result.push(values);
        return [];
      }

      if (args.length == 1 && args[0] == '') {
        this.__setNullValueForAllMissingArguments(values, result);
        return [];
      }

      args = args.slice(0); // clone args
      var arg = args.shift();
      var excludes = this.__getExcludesFromValues(values);

      var options = $.grep(this.argumentTree.autocomplete(arg), function(option) {
        return $.inArray(option.entity, excludes) == -1 ? 1 : 0;
      });

      return $.map(options, function(option) {
        var newValues = {};
        newValues[option.entity.name] = option.values.value || null;

        return {
          args: args.slice(0),
          values: $.extend(newValues, values)
        };
      });
    },

    __setNullValueForAllMissingArguments: function(values, result)
    {
      var argumentsIncluded = [];
      for (var name in values) {
        argumentsIncluded.push(name);
      }

      $.each(this.arguments, function(name, argument) {
        if ($.inArray(name, argumentsIncluded) == -1) {
          var option = $.extend(null, values);
          option[name] = null;
          result.push(option);
        }
      })
    },

    __getExcludesFromValues: function(values)
    {
      var result = [];
      var $this = this;
      $.each(values, function(name, value) {
        result.push($this.arguments[name]);
      });

      return result;
    }
  },
  {
    EXACT_MATCH: 3,
    PARTIAL_MATCH: 2,
    CONTAINS_NONMATCHING_WORDS: 1,
    NO_MATCH: 0
  }
);
