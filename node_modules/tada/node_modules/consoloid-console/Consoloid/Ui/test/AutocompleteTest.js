require('consoloid-framework/Consoloid/Test/UnitTest');
require("consoloid-framework/Consoloid/Widget/JQoteTemplate");
require('consoloid-framework/Consoloid/Widget/jquery.jqote2.min.js');
require("consoloid-framework/Consoloid/Widget/Widget");
require("../Autocomplete");

describeUnitTest('Consoloid.Ui.Autocomplete', function(){
    var widget;
    var input;
    var gatherOptionsSpy;

    beforeEach(function() {
        env.container.addSharedObject('dom', { baseNode: document.body });
        env.readTemplate(__dirname + '/../templates.jqote', 'utf8');
        input = $('<input id="autocomplete"/>')
                    .appendTo($('body'));

        gatherOptionsSpy = sinon.spy();
        widget = env.create(Consoloid.Ui.Autocomplete, {height:300, inputfield:input, ideTimeout:500, gatherOptions:gatherOptionsSpy});
    });

    describe('#setHeight(maxHeight)', function(){
        it('should set maximum height of the widget', function(){
            widget.setHeight(500);
            widget.node.css('max-height').should.be.eql('500px');
        });

        it('should remove maximum height limit if the argument is undefined', function(){
           widget.setHeight();
           widget.node.css('max-height').should.be.fail;
        });
    });

    describe('#setLeftPositionToCursor(bool)', function(){
        it('should place the widget without overflow');
    });

    describe('#__construct(options)', function(){
        it('should be able to set the @height', function(){
            widget.node.css('max-height').should.be.eql('300px');
        });

        it('should require an @inputfield', function(){
            widget.inputfield.should.be.ok;
            (function(){ env.create(Consoloid.Ui.Autocomplete, {gatherOptions:gatherOptionsSpy}) }).should.throw(/inputfield/);
        });

        it('should have a parameter for autocomplete @idleTimeout', function(){
            widget.ideTimeout.should.be.eql(500);
            env.create(Consoloid.Ui.Autocomplete, {inputfield:input, gatherOptions:gatherOptionsSpy}).idleTimeout.should.be.ok;
        });

        it('should have a @gatherOptions callback which is executed on idle time', function(){
            widget.gatherOptions.should.be.ok;
            (function(){ env.create(Consoloid.Ui.Autocomplete, {inputfield:input}) }).should.throw(/gatherOptions/);
        });
    });

    xdescribe('#__convertCursorPositionToPixelPosition() jsdom cannot handle properly', function(){
        it('should return the converted position', function(){
            input.val('alma korte');
            var spy = sinon.spy(widget, '__getTextBeforeCursor');

            input[0].selectionStart = 0;
            widget.__convertCursorPositionToPixelPosition().should.be.eql(0);
            spy.called.should.be.true;

            //input[0].selectionStart = 0;
            //FIXME: jsdom cannot set properly the offset values
            //input.css('marginLeft', '10px');
            //widget.__convertCursorPositionToPixelPosition().should.be.eql(10);
        });
    });

    describe('#__getTextBeforeCursor', function(){
        it('should return the inputfield value form the beginning end to the cursor', function(){
            input.val('alma korte');
            input[0].selectionStart = 0;
            widget.__getTextBeforeCursor().should.be.eql('');

            input[0].selectionStart = 5;
            widget.__getTextBeforeCursor().should.be.eql('alma ');

            input[0].selectionStart = 100;
            widget.__getTextBeforeCursor().should.be.eql('alma korte');
        });
    });

    describe('#setOptions(options, autoSelectWhenOnlyOneOption)', function(){
        it('should replace own options', function(){
            widget.options.should.be.empty;
            widget.setOptions([{value:'alma'}]);
            widget.options[0].value.should.be.eql('alma');
        });

        it('should render the options', function(){
            widget.node.children().length.should.be.eql(0);
            widget.setOptions([{value:'korte'}, {value:'alma'}]);
            widget.node.children().length.should.be.eql(2);
            widget.node.find("*:contains('alma')").length.should.be.eql(1);
        });

        it('should set the widget position', function(){
            var setTopPositionSpy = sinon.spy(widget, '__setTopPosition');

            widget.setOptions([{value:'alma'}]);
            setTopPositionSpy.calledOnce.should.be.true;
        });

        it('should reset the index of the focused element', function(){
            widget.focusedIndex = 2;

            widget.setOptions([{value:'alma'}]);
            widget.focusedIndex.should.be.eql(0);
        });

        it('should select an option if autoSelectOnlyOneOption is true and only has one option', function(){
            var triggerOptionSpy = sinon.spy(widget, '__triggerOption');
            var renderSpy = sinon.spy(widget, 'render');

            widget.setOptions([{value:'alma2'}, {value:'alma'}], true);
            triggerOptionSpy.called.should.be.false;
            renderSpy.called.should.be.true;

            renderSpy.reset();
            triggerOptionSpy.reset();
            widget.setOptions([{value:'alma'}], true);
            triggerOptionSpy.called.should.be.true;
            renderSpy.called.should.be.false;
        });
    });

    describe('#hasOptions()', function(){
        it('should return false when has not options', function(){
            widget.hasOptions().should.be.false;
        });

        it('should return true when has options', function(){
            widget.setOptions([{value:'alma'}]);
            widget.hasOptions().should.be.true;
        });
    });

    describe('#clearOptions()', function(){
        it('should clear own options (from both template and variable)', function(){
            widget.setOptions([{value:'alma'}]);
            widget.options.length.should.be.eql(1);
            widget.node.find("*:contains('alma')").length.should.be.eql(1);

            widget.clearOptions();

            widget.options.length.should.be.eql(0);
            widget.node.find("*:contains('alma')").length.should.be.eql(0);
        });
    });

    describe('#__triggerOption(optionIndex, isSelect)', function(){
        beforeEach(function(){
            widget.setOptions([{value:'korte'},{value:'alma'}]);
        })

        it('should tigger a focus event with the option and should not empty own options', function(){
            var eventTriggerSpy = sinon.spy(function(event){ event.option.value.should.be.eql('alma'); })
            widget.node.bind('focus', function(event){
                eventTriggerSpy(event);
            });

            widget.__triggerOption(0);
            widget.node.children().length.should.be.eql(2);
            eventTriggerSpy.calledOnce.should.be.true;
        });

        it('should trigger a select event with the option and should empty own options', function(){
            var eventTriggerSpy = sinon.spy(function(event){ event.option.value.should.be.eql('alma'); })
            widget.node.bind('select', function(event){
                eventTriggerSpy(event);
            });

            widget.__triggerOption(0, true);
            widget.node.children().length.should.be.eql(0);
            eventTriggerSpy.calledOnce.should.be.true;
        });
    });

    describe('#__setFocusedIndex(index)', function(){
        beforeEach(function(){
            widget.setOptions([{value:'korte'}, {value:'alma'}]);
        });

        it('should not change the focusedIndex parameter when index is invalid', function(){
            widget.focusedIndex.should.be.eql(1);
            widget.__setFocusedIndex(-1);
            widget.focusedIndex.should.be.eql(1);
            widget.__setFocusedIndex(2);
            widget.focusedIndex.should.be.eql(1);
        });

        it('should change the focusedIndex parameter', function(){
            widget.__setFocusedIndex(0);
            widget.focusedIndex.should.be.eql(0);
        });

        it('should change the focused class', function(){
            widget.node.find('.focused').index().should.be.eql(1);
            widget.__setFocusedIndex(0);
            widget.node.find('.focused').index().should.be.eql(0);
        });

        it('should scroll to the option if not in the viewing area');
    });

    describe('#gatherOptionsAfterIdle()', function(){
        var clock;
        beforeEach(function(){
            clock = sinon.useFakeTimers()
        });

        it('should gather options after idle timeout', function(){
            widget.gatherOptions = sinon.spy(function(callback) { callback([{value:'alma2'},{value:'alma1'}])});
            widget.options.length.should.be.eql(0);

            widget.gatherOptionsAfterIdle();

            clock.tick(widget.idleTimeout * 0.5);
            widget.options.length.should.be.eql(0);

            clock.tick(widget.idleTimeout);
            widget.gatherOptions.called.should.be.true;
            widget.options.length.should.be.eql(2);
            widget.options[0].value.should.be.eql('alma1');
        });

        afterEach(function(){
            clock.restore();
        });
    });

    describe('#__keydownListener(event)', function(){
        var pressKey = function(keyCode)
                        {
                            widget.inputfield.trigger(jQuery.Event('keydown', {keyCode: keyCode}));
                        };
        var pressKeyAndExpect = function(keyCode, expectedEventType, expectedValue, cantCallSelectOrFocus)
                                {
                                    var selectOrFocusSpy = sinon.spy(function(event){ event.option.value.should.be.eql(expectedValue); });
                                    var keydownSpy = sinon.spy();
                                    var keydownListener = function(event){
                                                                if (event.keyCode == keyCode) keydownSpy(event);
                                                            };
                                    var selectOrFocusListener = function(event) { selectOrFocusSpy(event); };

                                    widget.inputfield.bind('keydown', keydownListener);
                                    widget.node.bind(expectedEventType, selectOrFocusListener);

                                    pressKey(keyCode);

                                    if (cantCallSelectOrFocus) {
                                        selectOrFocusSpy.calledOnce.should.be.false;
                                    } else {
                                        selectOrFocusSpy.calledOnce.should.be.true;
                                    }

                                    widget.inputfield.unbind('keydown', keydownListener);
                                    widget.node.unbind(expectedEventType, selectOrFocusListener);
                                };

        beforeEach(function(){
            widget.setOptions([{value:'alma1'}, {value:'alma2'}, {value:'alma3'}]);
        });

        it('should go up and focus an element on up arrow key', function(){
            pressKeyAndExpect(Consoloid.Ui.Autocomplete.UP, 'focus', 'alma2');
            pressKeyAndExpect(Consoloid.Ui.Autocomplete.UP, 'focus', 'alma3');
            pressKeyAndExpect(Consoloid.Ui.Autocomplete.UP, 'focus', 'alma1');
            pressKeyAndExpect(Consoloid.Ui.Autocomplete.UP, 'focus', 'alma2');

            widget.setOptions([]);
            pressKeyAndExpect(Consoloid.Ui.Autocomplete.UP, 'focus', undefined, true);
        });

        it('should go down and focus an element on down arrow key', function(){
            pressKeyAndExpect(Consoloid.Ui.Autocomplete.DOWN, 'focus', 'alma3', false);
            pressKeyAndExpect(Consoloid.Ui.Autocomplete.DOWN, 'focus', 'alma2', false);
            pressKeyAndExpect(Consoloid.Ui.Autocomplete.DOWN, 'focus', 'alma1', false);
            pressKeyAndExpect(Consoloid.Ui.Autocomplete.DOWN, 'focus', 'alma3', false);

            widget.setOptions([]);
            pressKeyAndExpect(Consoloid.Ui.Autocomplete.DOWN, 'focus', undefined, true);
        });

        it('should go down and focus an element on tab key', function(){
            pressKeyAndExpect(Consoloid.Ui.Autocomplete.TAB, 'focus', 'alma2', false);
            pressKeyAndExpect(Consoloid.Ui.Autocomplete.TAB, 'focus', 'alma3', false);
            pressKeyAndExpect(Consoloid.Ui.Autocomplete.TAB, 'focus', 'alma1', false);
            pressKeyAndExpect(Consoloid.Ui.Autocomplete.TAB, 'focus', 'alma2', false);

            widget.setOptions([]);
            pressKeyAndExpect(Consoloid.Ui.Autocomplete.TAB, 'focus', undefined, true);
        });

        it('should select the active element on enter key', function(){
            pressKeyAndExpect(Consoloid.Ui.Autocomplete.ENTER, 'select', 'alma1', false);
            widget.setOptions();
            pressKeyAndExpect(Consoloid.Ui.Autocomplete.ENTER, 'select', undefined, true);

            widget.setOptions([{value:'alma1'}, {value:'alma2'}, {value:'alma3'}]);
            pressKeyAndExpect(Consoloid.Ui.Autocomplete.DOWN, 'focus', 'alma3', false);
            pressKeyAndExpect(Consoloid.Ui.Autocomplete.ENTER, 'select', 'alma3', false);
        });

        it('should select with tab key if only one option is available', function(){
            widget.setOptions([{value:'alma1'}]);
            pressKeyAndExpect(Consoloid.Ui.Autocomplete.TAB, 'select', 'alma1', false);

            widget.setOptions([{value:'alma1'}, {value:'alma2'}]);
            pressKeyAndExpect(Consoloid.Ui.Autocomplete.TAB, 'select', undefined, true);
        });

        describe('what to do when not has any options and tab key is pressed', function(){
            it('should render options when has more then one', function(){
                widget.setOptions();
                widget.gatherOptions = sinon.spy(function(callback) { callback([{value:'alma1'},{value:'alma2'}])});
                pressKey(Consoloid.Ui.Autocomplete.TAB);
                widget.node.children().length.should.be.eql(2);
            });

            it('should select the first option when only has one', function(){
                widget.setOptions();
                widget.gatherOptions = sinon.spy(function(callback) { callback([{value:'alma1'}])});
                pressKeyAndExpect(Consoloid.Ui.Autocomplete.TAB, 'select', 'alma1');
                widget.node.children().length.should.be.eql(0);
            });
        });

        it('should clear options on esc key', function(){
            widget.options.length.should.be.ok;
            pressKey(Consoloid.Ui.Autocomplete.ESC);
            widget.options.length.should.be.eql(0);
        });
    });

    describe('#__clickOnOptionListener(event)', function(){
        it('should select the clicked element', function(){
            var eventTriggerSpy = sinon.spy(function(event){ event.option.value.should.be.eql('alma'); })
            widget.setOptions([{value:'korte'},{value:'alma'}]);
            widget.node.bind('select', function(event){
                eventTriggerSpy(event);
            });

            widget.node.children().eq(0).trigger('click');
            eventTriggerSpy.calledOnce.should.be.true;
        });
    });

    describe('#__clickListener(event)', function(){
        var eventTriggerSpy;
        beforeEach(function(){
            widget.setOptions([{value:'alma3'}, {value:'alma2'}, {value:'alma1'}]);
        });

        it('should clear the options when clicked to the body', function(){
            widget.node.children().length.should.be.eql(3);
            $('body').trigger('click');
            widget.node.children().length.should.be.eql(0);
        });

        it('should clear the options when clicked other elements', function(){
            widget.node.children().length.should.be.eql(3);
            $('.ruler').trigger('click');
            widget.node.children().length.should.be.eql(0);
        });

        it('should not clear when the target is the inputfield', function(){
            widget.node.children().length.should.be.eql(3);
            widget.inputfield.trigger('click');
            widget.node.children().length.should.be.eql(3);
        });

        it('should not clear when the target is an option', function(){
            widget.node.undelegate('div', 'click');

            widget.node.children().length.should.be.eql(3);
            widget.node.children().eq(0).trigger('click');
            widget.node.children().length.should.be.eql(3);
        });
    });

    afterEach(function(){
        $('html').unbind();
    });
});
