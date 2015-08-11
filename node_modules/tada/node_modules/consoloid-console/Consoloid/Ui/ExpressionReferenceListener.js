/**
 * Class for handling UI items that reference a sentence.
 *
 * Any link having css class "expression-reference" is automatically handled by this class.
 * Clicking these links result in filling the prompt with the "data-text" property of the
 * node. The sentence is started automatically when the "data-exec" property is "true" or "1".
 *
 * Example:
 * <pre>
 *   <a href="#" class="expression-reference" data-text="hello world">click me</a>.
 * </pre>
 */
defineClass('Consoloid.Ui.ExpressionReferenceListener', 'Consoloid.Base.Object',
  {
    __constructor: function(options)
    {
      this.__base(options);

      $(document).delegate('.expression-reference', 'click', this.referenceClicked.bind(this));
      this.bind('typeWriterComplete', this.__typeWritingCompleted.bind(this));
    },

    __typeWritingCompleted: function(event, exec)
    {
      if (exec) {
        this.container.get('console').prompt.search();
      } else {
        this.container.get('console').prompt.focus();
      }
    },

    referenceClicked: function(event)
    {
      var target = $(event.target);
      if (!target.hasClass('expression-reference')) {
        target = target.parent('.expression-reference');
      }

      var exec = target.attr('data-exec');
      this.container.get('type_writer').write(
            target.attr('data-text'),
            (exec == 'true' || exec == '1')
          );

      event.stopPropagation();
      return false;
    }
  }
);
