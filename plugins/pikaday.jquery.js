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

    var defaults = {
        format: 'YYYY-MM-DD',
        inputFrom: document.getElementById('from'),
        inputTo: document.getElementById('to'),
        container: document.getElementById('container'),
        limitDate: null,
        maxRangeDuration: null,
        allowDisabledDateInRange: false,
        getEndRangeMaxfct: null,
        disabledBeforeToday: false
    };

    // Pikaday Wrapper to manage Dates Range
    var DatePicker = {
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
                        return	date.isSame(current.start)	||
                                date.isSame(current.end)	||
                                date.isBetween(current.start, current.end);
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
                        if (self.currentMax && date.getTime() === self.currentMax.getTime()) {
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
                this.start = this.initRange.start;
                this.end = this.initRange.end;
                this.pikaday.setStartRange(this.initRange.start.toDate());
                this.pikaday.setEndRange(this.initRange.end.toDate());
            }
            return this;
        },

        // Apply 2 constrains: maxRangeDuration && allowDisabledDateInRange
        getEndRangeMax: function(date) {
            var	max = moment(date).clone().add(this.maxRangeDuration - 1, 'days'),
                closestDisabledDays;

            if (!this.allowDisabledDateInRange) {
                closestDisabledDays = _.filter(this.disabledDays, function (current) {
                    return	current.start.isSame(max) || current.start.isBetween(moment(date), max);
                });
                if(closestDisabledDays.length) {
                    max = closestDisabledDays[0].start.clone().subtract(1, 'days');
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

            $(this.pikaday.el).trigger('rangeUpdate', [{
                start: this.oneDayRange,
                end:  moment(day).endOf('day')
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
                    if ($(ev.target).parent().hasClass('is-disabled')) {
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
        }
    };


    $.fn.daterangepicker = function()
    {
        var args = arguments;

        if (!args || !args.length) {
            args = [{ }];
        }

        return this.each(function() {
            var self   = $(this),
                plugin = self.data('daterangepicker');

            if (!(plugin instanceof Pikaday)) {
                if (typeof args[0] === 'object') {
                    var options = $.extend({}, args[0]);
                    options.field = self[0];

                    var inputs = self.find('[data-daterangepicker-type]');
                    options.inputFrom = inputs.get(0);
                    options.inputTo = inputs.get(1);
                    options.container = self.find('[data-daterangepicker-type=container]').get(0);

                    // initial state: no dates selected
                    options.output = {
                        from: options.inputFrom.getAttribute('data-daterangepicker-type'),
                        to: options.inputTo.getAttribute('data-daterangepicker-type')
                    };

                    self.append('<input type="hidden" name="'+ options.output.from +'" value="">');
                    self.append('<input type="hidden" name="'+ options.output.to +'" value="">');

                    self.data('daterangepicker', DatePicker.init(options));
                }
            } else {
                if (typeof args[0] === 'string' && typeof plugin[args[0]] === 'function') {
                    plugin[args[0]].apply(plugin, Array.prototype.slice.call(args,1));

                    if (args[0] === 'destroy') {
                        self.removeData('daterangepicker');
                    }
                }
            }
        });
    };

}));
