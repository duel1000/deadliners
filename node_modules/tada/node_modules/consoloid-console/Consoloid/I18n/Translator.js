defineClass('Consoloid.I18n.Translator', 'Consoloid.Base.Object',
  {
    __constructor: function(options)
    {
      this.__base($.extend({
        domains: { _default: {} }
      }, options));

      global.__ = this.trans.bind(this);
      global.__s = this.createTranslatedSentenceReference.bind(this);
    },

    /**
     * Creates link to a sentence.
     *
     * This method is accessible from templates through __s function.
     *
     * @param string sentence The sentence to copy into console.
     * @param {Object} arguments Argument patterns and values. e.g. { 'name <value>': 'John Doe' }.
     * @param string referenceText The string of the link. Defaults to value of sentence argument.
     * @param boolean exec Whether to auto-execute the sentence. Defaults to false.
     */
    createTranslatedSentenceReference: function(sentence, arguments, referenceText, exec)
    {
      arguments = arguments || {};
      referenceText = referenceText || sentence;
      exec = exec || '0';
      var argumentText = '';
      for (var argumentName in arguments) {
        argumentText += ', ' + this.trans(argumentName, {'<value>': arguments[argumentName]});
      }
      var textWithArguments = this.trans(sentence).replace('<', '&lt;').replace('>', '&gt;') + argumentText;
      var referenceData = {
        href: this.__getHref(textWithArguments),
        startText: textWithArguments,
        autoExecute: exec,
        linkText: this.trans(referenceText).replace('<', '&lt;').replace('>', '&gt;')
      }

      var result = this.__createExpressionReferenceFromTemplate(referenceData);

      return result;
    },

    __getHref: function(text)
    {
      var parameters = { text: text, href: '#' };
      this.trigger('Consoloid.Href.Generate', parameters);
      return parameters.href;
    },

    __createExpressionReferenceFromTemplate: function(data)
    {
      var template = this.create('Consoloid.Widget.JQoteTemplate', {
        id: "Consoloid-Ui-ExpressionReference",
        container: this.container
      });

      return template.get().jqote(data);
    },

    addMessage: function(message, translation, domain)
    {
      domain = domain || '_default';
      if (!(domain in this.domains)) {
        this.domains[domain] = {};
      }
      this.domains[domain][message] = translation;
      return this;
    },

    addMessages: function(expressions, domain)
    {
      var $this = this;
      $.each(expressions, function(message, translation) {
        $this.addMessage(message, translation, domain);
      });
    },

    trans: function(message, arguments, domain)
    {
      var expressions;

      if (domain) {
        expressions = this.domains[domain] || {};
      } else {
        expressions = this._getFirstDomainHaving(message);
        expressions = expressions && expressions.messages || {};
      }

      if (!(message in expressions)) {
        expressions = this.resolveMissing(message);
      }

      var result = expressions[message];
      $.each(arguments || {}, function(argument, value) {
        result = result.replace(argument, value);
      });

      return result;
    },

    _getFirstDomainHaving: function(message)
    {
      for (var name in this.domains) {
        if (message in this.domains[name]) {
          return { name: name, messages: this.domains[name]};
        }
      }

      return null;
    },

    resolveMissing: function(message)
    {
      this.domains._default[message] = message;
      return this.domains._default;
    }
  }
);