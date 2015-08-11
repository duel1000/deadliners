defineClass('Consoloid.Interpreter.Advisor', 'Consoloid.Base.Object',
  {
    __constructor: function(options)
    {
      this.__base(options);

      this.context = this.get('context');
      this.tree = this.get('letter_tree');
      builder = this.create('Consoloid.Interpreter.TreeBuilder', { tree: this.tree, container: this.container });
      builder.build();
    },

    autocomplete: function(text, args)
    {
      args = args || [];
      var result = [];
      var $this = this;

      $.each(this.tree.autocomplete(text), function(index, hit) {
        if (!hit.entity.getSentence().requiredContextIsAvailable()) {
          return;
        }

        result = result.concat($this.__autocompleteExpression(text, hit.entity, hit.values, args));
      });

      result.sort(function(a, b) {
        return b.score - a.score;
      });

      return result;
    },

    __autocompleteExpression: function(text, expression, values, args)
    {
      var
        sentence = expression.getSentence(),
        words = this.tree.getWords(text),
        args = args || [],
        result = [];
      $.each(sentence.autocompleteArguments(args), function(index, argumentValues) {
        if (this.__hasInlineArgumentForAnArgumentValue(expression, argumentValues)) {
          return;
        }

        var autocompletedArgumentValues = this.__autocompleteArgumentValues(sentence, $.extend({}, values, argumentValues), this.context.autocomplete.bind(this.context));
        var argumentValueVersionList = this.__buildAutocompletedArgumentValueOptions(autocompletedArgumentValues, sentence);

        result = result.concat(this.__addExpressionResults(argumentValueVersionList, sentence, expression, words));
      }.bind(this));

      return result;
    },

    __hasInlineArgumentForAnArgumentValue: function(expression, values)
    {
      var result = false;
      $.each(values, function(name, value) {
        if (expression.hasInlineArgument(name)) {
          result = true;
        }
      });

      return result;
    },

    __autocompleteArgumentValues: function(sentence, mergedArgumentValues, contextFunction)
    {
      var autocompletedArgumentValues = {};
      var arg;
      var convertedObj;
      for (var argumentName in mergedArgumentValues) {
        arg = sentence.arguments[argumentName];
        if (arg.isComplexType()) {
          autocompletedArgumentValues[argumentName] = contextFunction(mergedArgumentValues[argumentName], arg.getType());

          if (autocompletedArgumentValues[argumentName][0] == undefined || !autocompletedArgumentValues[argumentName][0].exactMatch) {
            try {
              convertedObj = this.__createContextObjectFromString(mergedArgumentValues[argumentName], arg.getType());
              autocompletedArgumentValues[argumentName].unshift({entity: convertedObj, value: convertedObj.toString(), exactMatch: true});
            } catch (e) {
              autocompletedArgumentValues[argumentName].push({value: mergedArgumentValues[argumentName], erroneous: true, message: e.message});
            }
          }
        } else {
          autocompletedArgumentValues[argumentName] = [{
            value: mergedArgumentValues[argumentName],
            exactMatch:true
          }];
        }
      }
      return autocompletedArgumentValues;
    },

    __createContextObjectFromString: function(str, cls)
    {
      if (typeof cls == 'string') {
        cls = getClass(cls);
      }

      return cls.fromString(str, this.container);
    },

    __buildAutocompletedArgumentValueOptions: function(autocompletedArgumentValues, sentence)
    {
      var nodes = [{availableOptions: autocompletedArgumentValues, values:{}}];
      var result = [];
      while(nodes.length > 0) {
        var node = nodes.shift();
        var argumentName = this.__getFirstObjectProperty(node.availableOptions);
        if (argumentName === undefined) {
          try {
            if (sentence.validateArguments(node.values)) {
              result.push(node.values);
            }
          } catch(error) {
            if (!(error instanceof getClass('Consoloid.Interpreter.InvalidArgumentsError'))) {
              throw(error);
            }

            error.getArguments().forEach(function(argument) {
              node.values[argument].exactMatch = false;
              node.values[argument].erroneous = true;
              node.values[argument].message = error.toString();
            });
            result.push(node.values);
          }

          continue;
        }
        for (var i = 0,len = node.availableOptions[argumentName].length; i < len; i++) {
          nodes.push(this.__createArgumentOption(node, argumentName, i));
        }
      }
      return result;
    },

    __getFirstObjectProperty: function(obj)
    {
      return Object.keys(obj)[0];
    },

    __createArgumentOption: function(node, argumentName, elementIndex)
    {
      var argumentValue = node.availableOptions[argumentName][elementIndex];
      var newOptions = $.extend(null, node.availableOptions);
      delete newOptions[argumentName];
      var newValues = $.extend(null, node.values);
      newValues[argumentName] = argumentValue;

      return {availableOptions: newOptions, values: newValues};
    },

    __addExpressionResults: function(argumentValueVersionList, sentence, expression, words)
    {
      var result = [];
      for (var i = 0, len = argumentValueVersionList.length; i < len; i++) {
        result.push({
          sentence: sentence,
          expression: expression,
          value: expression.getTextWithArguments(argumentValueVersionList[i]),
          arguments: argumentValueVersionList[i],
          score: expression.getAutocompleteScore(words, argumentValueVersionList[i])
        });
      }

      return result;
    },

    matchArgumentsToExpression: function(text, expression, argumentValues)
    {
      var
        sentence = expression.getSentence(),
        words = this.tree.getWords(text),
        result = [];

      var matchedArgumentValues = this.__autocompleteArgumentValues(sentence, argumentValues, this.__searchContextForEntity.bind(this));
      var argumentValueVersionList = this.__buildAutocompletedArgumentValueOptions(matchedArgumentValues, sentence);

      result = result.concat(this.__addExpressionResults(argumentValueVersionList, sentence, expression, words));

      return result;
    },

    __searchContextForEntity: function(text, cls)
    {
      return this.context.findByStringAndClass(text, cls).map(function(entity) {
        return {
          entity: entity,
          value: entity.name
        }
      });
    }
  }
);
