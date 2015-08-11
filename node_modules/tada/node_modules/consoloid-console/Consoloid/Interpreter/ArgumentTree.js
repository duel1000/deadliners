defineClass('Consoloid.Interpreter.ArgumentTree', 'Consoloid.Interpreter.LetterTree',
  {
    autocomplete: function(text)
    {
      var result = this.__base(text);
      $.each(result, function(index, hit) {
        if (hit.entity.getType() == 'boolean') {
          result[index].values['value'] = true;
        }
      });

      return result;
    }
  }
);
