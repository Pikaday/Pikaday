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

    var DateRangePicker = function (options) {
        var self = this,
            element = $(options.field),
            selectors = {
                calendar: '.Picker-calendarContainer',
                from: '.Picker-from',
                to: '.Picker-to'
            };

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

        // Update Markup
        updateMarkup(options);

        self.hasAlreadyLeave = true;
        self._onMouseOverCalendar = function (ev) {
            // Manage hover disabled dates
            if ($(ev.target).hasClass('pika-day')) {
                if ($(ev.target).parent().hasClass('is-disabled') && !$(ev.target).parent().hasClass('is-past')) {
                    if (self.hasAlreadyLeave) {
                        self.hasAlreadyLeave = false;
                        $(options.container).trigger('disabledDateOver');
                    }
                } else if(!self.hasAlreadyLeave) {
                    self.hasAlreadyLeave = true;
                    $(options.container).trigger('disabledDateLeave');
                }
            }

            // Update on hover the end range date
            if (!self.end && self.start && $(ev.target).hasClass('pika-day')) {
                var target = ev.target,
                    _d = new Date(  target.getAttribute('data-pika-year'),
                                    target.getAttribute('data-pika-month'),
                                    target.getAttribute('data-pika-day'));

                if (self.currentDate.getTime() !== _d.getTime() && !$(ev.target).parent().hasClass('is-beforeStart')) {
                    self.currentDate = _d;
                    var endRange;
                    if (moment(self.currentDate).isAfter(self.start)) {
                        endRange = _d;
                    }
                    self.pikaday.setEndRange(endRange);
                    self.pikaday.draw();
                }
            }
        };

        self._onMouseLeaveCalendar = function(ev) {
            if (self.start && !self.end) {
                self.pikaday.setEndRange();
                self.pikaday.draw();
            }
        };

        self._onRangeUpdate = function (ev) {
            $('[name=' + options.output.from + ']').val(self.start.format());
            $('[name=' + options.output.to + ']').val(self.end.format());
        };

        self._onInputClick = function(ev) {
            self.pikaday.config({field: options.inputFrom});
            $(options.inputFrom).val('');
            self.pikaday.setDate();

            self.reset();
            self.pikaday.draw();
        };

        $(options.container).on('mouseover', self._onMouseOverCalendar);
        $(options.container).on('mouseleave', self._onMouseLeaveCalendar);
        $(options.container).on('rangeUpdate', self._onRangeUpdate);
        $(options.inputFrom).on('click', self._onInputClick);

        this.el = element.get(0);
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
        disabledBeforeToday: false
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
            // $.extend(this, defaults, this.options);
            this.config = $.extend({}, defaults, options);

            this.currentDate = new Date();

            this.pikaday = new Pikaday($.extend({}, defaultsPikaday, {
                field: this.config.inputFrom,
                container: this.config.container,
                format: this.config.format,
                maxDate: this.config.limitDate && this.config.limitDate.toDate(),
                disabledBeforeToday: this.config.disabledBeforeToday
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

            // Events
            $(this.pikaday.el).on('rangeUpdate', this.config.onRangeChange);
            $(this.config.container).on('disabledDateOver', this.config.onDisabledDateOver);
            $(this.config.container).on('disabledDateLeave', this.config.onDisabledDateLeave);

            return this;
        },

        // Apply 2 constrains: maxRangeDuration && allowDisabledDateInRange
        getEndRangeMax: function(date) {
            var	max = moment(date).clone().add(this.config.maxRangeDuration - 1, 'days'),
                closestDisabledDays;

            if (!this.config.allowDisabledDateInRange) {
                closestDisabledDays = _.filter(this.config.disabledDays, function (current) {
                    return moment(current.start).format('YYYYMMDD') === max.format('YYYYMMDD') ||
                           moment(current.start).isBetween(moment(date), max);
                    // return	moment(current.start).isSame(max) || moment(current.start).isBetween(moment(date), max);
                });
                if(closestDisabledDays.length) {
                    max = moment(closestDisabledDays[0].start).subtract(1, 'days');
                }
            }
            max = (max.isAfter(this.config.limitDate))?this.config.limitDate:max;
            // Added constrains
            max = (this.config.getEndRangeMaxfct)? this.config.getEndRangeMaxfct(max): max;
            return max.toDate();
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
