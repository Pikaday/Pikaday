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
        var element = $(options.field),
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

    // Pikaday Wrapper to manage Dates Range
    DateRangePicker.prototype = {
        defaultsPikaday: {
            format: defaults.format,
            firstDay: 1,
            showWeekNumber: true,
            minDate: new Date(2016, 0, 1),
            maxDate: new Date(2016, 3, 12),
            showDaysInNextAndPreviousMonths: true,
            bound: false
        },

        init: function (options) {
            var self = this;
            options = options || {};
            $.extend(this, defaults, options);

            this.currentDate = new Date();

            this.pikaday = new Pikaday($.extend(this.defaultsPikaday, {
                field: this.inputFrom,
                container: this.container,
                format: this.format,
                maxDate: this.limitDate && this.limitDate.toDate(),
                disabledBeforeToday: this.disabledBeforeToday
            }));

            this.pikaday.config({
                disableDayFn: function(date) {
                    date = moment(date);
                    return _.some(options.disabledDays, function(current) {
                        return moment(current.start).format('YYYYMMDD') === date.format('YYYYMMDD') ||
                               moment(current.end).format('YYYYMMDD') === date.format('YYYYMMDD')   ||
                               date.isBetween(moment(current.start), moment(current.end));
                    });
                },

                onSelect: function(date) {
                    if (self.end || self.oneDayRange) {
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
            this.setupEvents();

            // Set an initial range
            if (this.initRange) {
                this.start = moment(this.initRange.start);
                this.end = moment(this.initRange.end);
                this.pikaday.setStartRange(this.start.toDate());
                this.pikaday.setEndRange(this.end.toDate());
            }

            console.log(this)
            return this;
        },

        // Apply 2 constrains: maxRangeDuration && allowDisabledDateInRange
        getEndRangeMax: function(date) {
            var	max = moment(date).clone().add(this.maxRangeDuration - 1, 'days'),
                closestDisabledDays;

            if (!this.allowDisabledDateInRange) {
                closestDisabledDays = _.filter(this.disabledDays, function (current) {
                    return moment(current.start).format('YYYYMMDD') === max.format('YYYYMMDD') ||
                           moment(current.start).isBetween(moment(date), max);
                    // return	moment(current.start).isSame(max) || moment(current.start).isBetween(moment(date), max);
                });
                if(closestDisabledDays.length) {
                    max = moment(closestDisabledDays[0].start).subtract(1, 'days');
                }
            }
            max = (max.isAfter(this.limitDate))?this.limitDate:max;
            // Added constrains
            max = (this.getEndRangeMaxfct)? this.getEndRangeMaxfct(max): max;
            return max.toDate();
        },

        setStartRange: function(date) {
            this.start = moment(date).startOf('day');
            this.pikaday.setStartRange(date);
            this.pikaday.setMaxRange(this.currentMax);
            this.pikaday.config({field: this.inputTo});
        },

        setEndRange: function (date) {
            this.end = moment(date).endOf('day');
            this.currentMax = null;
            this.pikaday.setMaxRange();
            this.pikaday.config({field: this.inputFrom});

            $(this.pikaday.el).trigger('rangeUpdate', [{
                start: this.start,
                end: this.end
            }]);
        },

        setOneDayRange: function(day) {
            this.oneDayRange = moment(day).startOf('day');
            this.pikaday.setStartRange();
            $(this.inputTo).val(moment(day).format(this.format));

            this.start = this.oneDayRange;
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
            this.start = this.end = this.oneDayRange = null;
            $(this.inputTo).val('');
        },

        setupEvents: function () {
            $(this.pikaday.el).on('rangeUpdate', _.bind(function (ev) {
                $('[name=' + this.output.from + ']').val(this.start.format());
                $('[name=' + this.output.to + ']').val(this.end.format());
            }, this));
            $(this.pikaday.el).on('rangeUpdate', this.onRangeChange);

            $(this.inputFrom).on('click', _.bind(function() {
                this.pikaday.config({field: this.inputFrom});
                $(this.inputFrom).val('');
                this.pikaday.setDate();

                this.reset();
                this.pikaday.draw();
            }, this));

            $(this.pikaday.el).on('disabledDateOver', this.onDisabledDateOver);
            $(this.pikaday.el).on('disabledDateLeave', this.onDisabledDateLeave);

            this.hasAlreadyLeave = true;
            $(this.pikaday.el).on('mouseover', _.bind(function(ev) {
                if ($(ev.target).hasClass('pika-day')) {
                    if ($(ev.target).parent().hasClass('is-disabled') && !$(ev.target).parent().hasClass('is-past')) {
                        if (this.hasAlreadyLeave) {
                            this.hasAlreadyLeave = false;
                            $(this.pikaday.el).trigger('disabledDateOver');
                        }
                    } else if(!this.hasAlreadyLeave) {
                        this.hasAlreadyLeave = true;
                        $(this.pikaday.el).trigger('disabledDateLeave');
                    }
                }

                if (!this.end && this.start && $(ev.target).hasClass('pika-day')) {
                    var target = ev.target,
                        _d = new Date(  target.getAttribute('data-pika-year'),
                                        target.getAttribute('data-pika-month'),
                                        target.getAttribute('data-pika-day'));

                    if (this.currentDate.getTime() !== _d.getTime()) {
                        this.currentDate = _d;
                        var endRange;
                        if (moment(this.currentDate).isAfter(this.start)) {
                            endRange = _d;
                        }
                        this.pikaday.setEndRange(endRange);
                        this.pikaday.draw();
                    }
                }
            }, this));

            $(this.pikaday.el).on('mouseleave', _.bind(function(ev) {
                if (this.start && !this.end) {
                    this.pikaday.setEndRange();
                    this.pikaday.draw();
                }
            }, this));
        }
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
