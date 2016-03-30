/*!
 * Pikaday jQuery plugin.
 *
 * Copyright © 2013 David Bushell | BSD & MIT license | https://github.com/dbushell/Pikaday
 */

(function (root, factory)
{
    'use strict';

    if (typeof exports === 'object') {
        // CommonJS module
        factory(require('jquery'), require('underscore'), require('moment'), require('../pikaday'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery', 'underscore', 'moment', 'pikaday'], factory);
    } else {
        // Browser globals
        factory(root.jQuery, root._, root.moment, root.Pikaday);
    }
}(this, function ($, _, moment, Pikaday) {
    'use strict';

    function getInitRange (inputFrom, inputTo) {
        // initial state: range setup in markup
        var initRange = {
            start: $(inputFrom).val(),
            end: $(inputTo).val()
        }
        // Options
        if (initRange.start && initRange.end) {
            return initRange;
        }
    }

    function updateMarkup(options) {
        $(options.field).append('<input type="hidden" name="'+ options.output.from +'" value="">');
        $(options.field).append('<input type="hidden" name="'+ options.output.to +'" value="">');
        $(options.inputFrom).removeAttr('name');
        $(options.inputTo).removeAttr('name');
    }

    var selectors = {
        calendar: '.Picker-calendarContainer',
        from: '.Picker-from',
        to: '.Picker-to'
    };

    var DateRangePicker = function (options) {
        var self = this,
            element = $(options.field);

        var inputFrom = $(selectors.from, element).get(0),
            inputTo = $(selectors.to, element).get(0);

        var options = $.extend({}, options, {
            initRange: getInitRange(inputFrom, inputTo),
            container: $(selectors.calendar, element).get(0),
            inputFrom: inputFrom,
            inputTo: inputTo,
            output: { // <input type=hidden> for form validation
                from: inputFrom.getAttribute('name'),
                to: inputTo.getAttribute('name')
            }
        });

        this.el = element.get(0);
        this.$el = element;

        // Update Markup
        updateMarkup(options);

        // use by _onMouseOverCalendar to trigger disabledDates on hover
        this.hasAlreadyLeave = true;

        // this.$el.on('mouseover.calendar', selectors.calendar, $.proxy(this._onMouseOverCalendar, this));
        $(options.container).on('mouseover', $.proxy(this._onMouseOverCalendar, this));
        $(options.container).on('mouseleave', $.proxy(this._onMouseLeaveCalendar, this));
        $(options.container).on('rangeUpdate', $.proxy(this._onRangeUpdate, this));
        $(options.inputFrom).on('click', $.proxy(this._onInputClick, this));

        this.init(options);
    }

    var defaults = {
        format: 'YYYY-MM-DD',
        inputFrom: document.getElementById('from'),
        inputTo: document.getElementById('to'),
        container: document.getElementById('calendar'),
        limitDate: null,
        maxRangeDuration: null,
        allowDisabledDateInRange: false,
        getEndRangeMaxfct: null,
        disabledBeforeToday: false,
        minDate: new Date(2016, 0, 1)
    };

    var defaultsPikaday = {
        format: defaults.format,
        firstDay: 1,
        showWeekNumber: true,
        minDate: new Date(2016, 0, 1),
        maxDate: new Date(2016, 3, 12),
        showDaysInNextAndPreviousMonths: true,
        bound: false
    };

    // Pikaday Wrapper to manage Dates Range
    DateRangePicker.prototype = {
        init: function (options) {
            var self = this;
            this.config = $.extend({}, defaults, options);

            this.currentDate = new Date();

            this.pikaday = new Pikaday($.extend({}, defaultsPikaday, {
                field: this.config.inputFrom,
                container: this.config.container,
                format: this.config.format,
                maxDate: this.config.limitDate,
                disabledBeforeToday: this.config.disabledBeforeToday,
                minDate: this.config.minDate
            }));

            this.pikaday.config({
                disableDayFn: function(date) {
                    date = moment(date);
                    return _.some(self.config.disabledDays, function(current) {
                        return moment(current.start).format('YYYYMMDD') === date.format('YYYYMMDD') ||
                               moment(current.end).format('YYYYMMDD') === date.format('YYYYMMDD')   ||
                               date.isBetween(moment(current.start), moment(current.end));
                    });
                },

                onSelect: function(date) {
                    if (self.end) {
                        self.reset();
                    }

                    // First date range selection
                    if (!self.start) {
                        self.currentMax = self.getEndRangeMax(date);

                        // If max = start day => the end date is by default = start date
                        if (self.currentMax && moment(date).format('YYYYMMDD') === moment(self.currentMax).format('YYYYMMDD')) {
                            self.setOneDayRange(date);
                        } else {
                            self.setStartRange(date);
                        }
                    }
                    // Second date range selection:
                    // 		Set the end date IF start < date < currentMax
                    else if (!moment(date).isAfter(self.currentMax) && !moment(date).isBefore(self.start)) {
                            self.setEndRange(date);
                    } else {
                        return;
                    }
                    self.pikaday.draw();
                }
            });

            // Set an initial range
            if (this.config.initRange) {
                this.start = moment(this.config.initRange.start);
                this.end = moment(this.config.initRange.end);
                this.pikaday.setStartRange(this.start.toDate());
                this.pikaday.setEndRange(this.end.toDate());
            }

            // Binding
            this.$el.on('rangeUpdate', selectors.calendar, $.proxy(this.config.onRangeChange, this));
            // this.$el.on('mouseover.disabledDates', selectors.calendar, $.proxy(this.config.onHoverDisabledDate, this));
            // this.$el.on('leave.disabledDates', selectors.calendar, $.proxy(this.config.onLeaveDisabledDate, this));

            return this;
        },

        // Apply 2 constrains: maxRangeDuration && allowDisabledDateInRange
        getEndRangeMax: function(date) {
            // If no max duration && no disabled dates after current date
            // -> no limit in the range
            var	max = null;

            if (this.config.maxRangeDuration) {
                max =  moment(date).clone().add(this.config.maxRangeDuration - 1, 'days').toDate();
            }
            // If we don't want any disabled dates in a range
            //      -> find the closest disabled start range (in this.consfig.disabledDays)
            if (!this.config.allowDisabledDateInRange) {
                var fct;
                if (!this.config.maxRangeDuration) {
                    fct = function (current) {
                        return current.start.getTime() > date.getTime();
                    };
                } else {
                    // DANGER!! timezones :(
                    // Improve that test...
                    fct = function (current) {
                        return moment(current.start).format('YYYYMMDD') === moment(max).format('YYYYMMDD') ||
                               moment(current.start).isBetween(moment(date), max);
                    };
                }
                var closestDisabledDays = _.filter(this.config.disabledDays, fct);
                if(closestDisabledDays.length) {
                    max = moment(closestDisabledDays[0].start).subtract(1, 'days').toDate();
                }
            }

            max = (max && moment(max).isAfter(this.config.limitDate))?this.config.limitDate:max;
            // Added constrains
            max = (this.config.getEndRangeMaxfct)? this.config.getEndRangeMaxfct(max): max;
            return max;
        },

        setStartRange: function(date) {
            this.start = moment(date).startOf('day');
            this.pikaday.setStartRange(date);
            this.pikaday.setMaxRange(this.currentMax);
            this.pikaday.config({field: this.config.inputTo});
        },

        setEndRange: function (date) {
            this.end = moment(date).endOf('day');
            this.currentMax = null;
            this.pikaday.setMaxRange();
            this.pikaday.config({field: this.config.inputFrom});

            $(this.pikaday.el).trigger('rangeUpdate', [{
                start: this.start,
                end: this.end
            }]);
        },

        setOneDayRange: function(day) {
            this.pikaday.setStartRange();
            $(this.config.inputTo).val(moment(day).format(this.config.format));

            this.start = moment(day).startOf('day');
            this.end = moment(day).endOf('day');
            $(this.pikaday.el).trigger('rangeUpdate', [{
                start: this.start,
                end: this.end
            }]);
        },

        reset: function () {
            this.pikaday.setStartRange();
            this.pikaday.setEndRange();
            this.pikaday.setMaxRange();
            this.start = this.end = null;
            $(this.config.inputTo).val('');
        },

        _onMouseOverCalendar: function (ev) {
            // Manage hover disabled dates
            if ($(ev.target).hasClass('pika-day')) {
                if ($(ev.target).parent().hasClass('is-disabled') && !$(ev.target).parent().hasClass('is-past')) {
                    if (this.hasAlreadyLeave) {
                        this.hasAlreadyLeave = false;
                        $(selectors.calendar).trigger('hover.disabledDates');
                    }
                // Problem on is-disabled -> they have pointer-events: none;
                //      -> no reset when leave on disabled days
                } else if(!this.hasAlreadyLeave) {
                    this.hasAlreadyLeave = true;
                    $(selectors.calendar).trigger('leave.disabledDates');
                }
            }

            // Update on hover the end range date
            if (!this.end && this.start && $(ev.target).hasClass('pika-day')) {
                var target = ev.target,
                    _d = new Date(  target.getAttribute('data-pika-year'),
                                    target.getAttribute('data-pika-month'),
                                    target.getAttribute('data-pika-day'));

                if (this.currentDate.getTime() !== _d.getTime() && !$(ev.target).parent().hasClass('is-beforeStart')) {
                    this.currentDate = _d;
                    var endRange;
                    if (moment(this.currentDate).isAfter(this.start)) {
                        endRange = _d;
                    }
                    this.pikaday.setEndRange(endRange);
                    this.pikaday.draw();
                }
            }
        },

        _onMouseLeaveCalendar: function(ev) {
            if (this.start && !this.end) {
                this.pikaday.setEndRange();
                this.pikaday.draw();
            }
        },

        _onRangeUpdate: function (ev) {
            $('[name=' + this.config.output.from + ']').val(this.start.format());
            $('[name=' + this.config.output.to + ']').val(this.end.format());
        },

        _onInputClick: function(ev) {
            this.pikaday.config({field: this.config.inputFrom});
            $(this.config.inputFrom).val('');
            this.pikaday.setDate();

            this.reset();
            this.pikaday.draw();
        },

    };

    $.fn.daterangepicker = function(options) {
        var args = arguments;
        if (!args || !args.length) {
            args = [{ }];
        }

        return this.each(function() {
            var $this = $(this),
                data = $this.data('daterangepicker');

            if (!data && typeof args[0] === 'object') {
                var options = $.extend({}, args[0]);
                options.field = $this.get(0);
                $this.data('daterangepicker', $.extend(new DateRangePicker(options)));
            } else if (typeof option == 'string') {
                data[option].call($this);
            }
        });
    };

}));
