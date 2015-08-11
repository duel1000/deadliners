defineClass('Consoloid.Ui.List.BaseFilterWidget', 'Consoloid.Widget.Widget',
  {
    __constructor: function(options)
    {
      this.__base($.extend({
        templateId: 'Consoloid-Ui-List-BaseFilterWidget',
      }, options));
      this.requireProperty('eventDispatcher');

      this.eventDispatcher.bind("filter-values-set", this.__filterValuesSet.bind(this));
      this.addEventListener('.clear-filters', 'click', this.__clearFilters.bind(this));
      this.eventDispatcher.bind("filters-cleared", this.__filterValuesCleared.bind(this));
    },

    __filterValuesSet: function(event, filterValueStrings)
    {
      this.node.find(".filter-value").empty();
      $.each(filterValueStrings, (function(index, filterValueString) {
        $('<div>' + filterValueString + '</div>').appendTo(this.node.find(".filter-value"));
      }).bind(this));
      this.node.find(".list-filter").slideDown();
    },

    __clearFilters: function()
    {
      this.eventDispatcher.trigger("clear-filters");
    },

    __filterValuesCleared: function()
    {
      this.node.find(".list-filter").slideUp();
    }
  }
);