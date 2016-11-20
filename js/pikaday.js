/*!
 * Pikaday
 *
 * Copyright © 2014 David Bushell | BSD & MIT license | https://github.com/dbushell/Pikaday
 */

const moment = require('moment');

/**
 * feature detection and helper functions
 */

var document = window.document;
var sto = window.setTimeout;


var fireEvent = (el, eventName, data) => {
  var ev = document.createEvent('HTMLEvents');
  ev.initEvent(eventName, true, false);
  ev = extend(ev, data);
  el.dispatchEvent(ev);
};

var trim = str => str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, '');
var hasClass = (el, cn) => (' ' + el.className + ' ').indexOf(' ' + cn + ' ') !== -1;

var addClass = (el, cn) => {
  if (!hasClass(el, cn)) {
    el.className = (el.className === '') ? cn : el.className + ' ' + cn;
  }
};

var removeClass = (el, cn) => {
  el.className = trim((' ' + el.className + ' ').replace(' ' + cn + ' ', ' '));
};

var isArray = obj => (/Array/).test(Object.prototype.toString.call(obj));
var makeArray = obj => obj === undefined ? [] : isArray(obj) ? obj : [obj];
var isDate = obj => (/Date/).test(Object.prototype.toString.call(obj)) && !isNaN(obj.getTime());

var isWeekend = date => {
  var day = date.getDay();
  return day === 0 || day === 6;
};

var isLeapYear = year => // solution by Matti Virkkunen: http://stackoverflow.com/a/4881951
  year % 4 === 0 && year % 100 !== 0 || year % 400 === 0;

var getDaysInMonth = (year, month) => [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];

var setToStartOfDay = date => {
  if (isDate(date)) date.setHours(0, 0, 0, 0);
};

var compareDates = (a, b) => // weak date comparison (use setToStartOfDay(date) to ensure correct result)
  a.getTime() === b.getTime();

var extend = (to, from, overwrite) => {
  var prop, hasProp;
  for (prop in from) {
    hasProp = to[prop] !== undefined;
    if (hasProp && typeof from[prop] === 'object' && from[prop] !== null && from[prop].nodeName === undefined) {
      if (isDate(from[prop])) {
        if (overwrite) {
          to[prop] = new Date(from[prop].getTime());
        }
      } else if (isArray(from[prop])) {
        if (overwrite) {
          to[prop] = from[prop].slice(0);
        }
      } else {
        to[prop] = extend({}, from[prop], overwrite);
      }
    } else if (overwrite || !hasProp) {
      to[prop] = from[prop];
    }
  }
  return to;
};

var adjustCalendar = calendar => {
  if (calendar.month < 0) {
    calendar.year -= Math.ceil(Math.abs(calendar.month) / 12);
    calendar.month += 12;
  }
  if (calendar.month > 11) {
    calendar.year += Math.floor(Math.abs(calendar.month) / 12);
    calendar.month -= 12;
  }
  return calendar;
};

/**
 * defaults and localisation
 */
var defaults = {

  // bind the picker to a form field
  field: null,

  // automatically show/hide the picker on `field` focus (default `true` if `field` is set)
  bound: undefined,

  // position of the datepicker, relative to the field (default to bottom & left)
  // ('bottom' & 'left' keywords are not used, 'top' & 'right' are modifier on the bottom/left position)
  position: 'bottom left',

  // automatically fit in the viewport even if it means repositioning from the position option
  reposition: true,

  // the default output format for `.toString()` and `field` value
  format: 'YYYY-MM-DD',

  // optional array of allowed input formats for `field` value and `.setDate()` with string (Moment.js required)
  // the default output `format` will be added to `inputFormats` if not already included
  inputFormats: [],

  // the initial date to view when first opened
  defaultDate: null,

  // make the `defaultDate` the initial selected value
  setDefaultDate: false,

  // first day of week (0: Sunday, 1: Monday etc)
  firstDay: 0,

  // the default flag for moment's strict date parsing
  formatStrict: false,

  // the minimum/earliest date that can be selected
  minDate: null,
  // the maximum/latest date that can be selected
  maxDate: null,

  // number of years either side, or array of upper/lower range
  yearRange: 10,

  // show week numbers at head of row
  showWeekNumber: false,

  // used internally (don't config outside)
  minYear: 0,
  maxYear: 9999,
  minMonth: undefined,
  maxMonth: undefined,

  startRange: null,
  endRange: null,

  // reverse the calendar for right-to-left languages
  isRTL: false,

  // additional text to append to the year in the calendar title
  yearSuffix: '',

  // render the month after year in the calendar title
  showMonthAfterYear: false,

  // Render days of the calendar grid that fall in the next or previous month
  showDaysInNextAndPreviousMonths: false,

  // how many months are visible
  numberOfMonths: 1,

  // when numberOfMonths is used, this will help you to choose where the main calendar will be (default `left`, can be set to `right`)
  // only used for the first display or when a selected date is not visible
  mainCalendar: 'left',

  // Specify a DOM element to render the calendar in
  container: undefined,

  // clear the input field (if `field` is set) on invalid input
  clearInvalidInput: false,

  // internationalization
  i18n: {
    previousMonth: 'Previous Month',
    nextMonth: 'Next Month',
    months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    weekdays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    weekdaysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  },

  // Theme Classname
  theme: null,

  // callback functions
  onSelect: null,
  onClear: null,
  onOpen: null,
  onClose: null,
  onDraw: null,

  //If set to true, and user agent is a mobile browser, datepicker will use system default
  useMobileDefault: false,
};

/**
 * templating functions to abstract HTML rendering
 */
var renderDayName = (opts, day, abbr) => {
  day += opts.firstDay;
  while (day >= 7) {
    day -= 7;
  }
  return abbr ? opts.i18n.weekdaysShort[day] : opts.i18n.weekdays[day];
};

var renderDay = opts => {
  var arr = [];
  var ariaSelected = 'false';
  if (opts.isEmpty) {
    if (opts.showDaysInNextAndPreviousMonths) {
      arr.push('is-outside-current-month');
    } else {
      return '<td class="is-empty"></td>';
    }
  }
  if (opts.isDisabled) {
    arr.push('is-disabled');
  }
  if (opts.isToday) {
    arr.push('is-today');
  }
  if (opts.isSelected) {
    arr.push('is-selected');
    ariaSelected = 'true';
  }
  if (opts.isInRange) {
    arr.push('is-inrange');
  }
  if (opts.isStartRange) {
    arr.push('is-startrange');
  }
  if (opts.isEndRange) {
    arr.push('is-endrange');
  }
  return '<td data-day="' + opts.day + '" class="' + arr.join(' ') + '" aria-selected="' + ariaSelected + '">' +
    '<button class="pika-button pika-day" type="button" ' +
    'data-pika-year="' + opts.year + '" data-pika-month="' + opts.month + '" data-pika-day="' + opts.day + '">' +
    opts.day +
    '</button>' +
    '</td>';
};

var renderWeek = (d, m, y) => {
  // Lifted from http://javascript.about.com/library/blweekyear.htm, lightly modified.
  var onejan = new Date(y, 0, 1),
    weekNum = Math.ceil((((new Date(y, m, d) - onejan) / 86400000) + onejan.getDay() + 1) / 7);
  return '<td class="pika-week">' + weekNum + '</td>';
};

var renderRow = (days, isRTL) => '<tr>' + (isRTL ? days.reverse() : days).join('') + '</tr>';
var renderBody = rows => '<tbody>' + rows.join('') + '</tbody>';

var renderHead = opts => {
  var i, arr = [];
  if (opts.showWeekNumber) {
    arr.push('<th></th>');
  }
  for (i = 0; i < 7; i++) {
    arr.push('<th scope="col"><abbr title="' + renderDayName(opts, i) + '">' + renderDayName(opts, i, true) + '</abbr></th>');
  }
  return '<thead><tr>' + (opts.isRTL ? arr.reverse() : arr).join('') + '</tr></thead>';
};

var renderTitle = (instance, c, year, month, refYear, randId) => {
  var i, j, arr,
    opts = instance._o,
    isMinYear = year === opts.minYear,
    isMaxYear = year === opts.maxYear,
    html = '<div id="' + randId + '" class="pika-title" role="heading" aria-live="assertive">',
    monthHtml,
    yearHtml,
    prev = true,
    next = true;

  for (arr = [], i = 0; i < 12; i++) {
    arr.push('<option value="' + (year === refYear ? i - c : 12 + i - c) + '"' +
      (i === month ? ' selected="selected"' : '') +
      ((isMinYear && i < opts.minMonth) || (isMaxYear && i > opts.maxMonth) ? 'disabled="disabled"' : '') + '>' +
      opts.i18n.months[i] + '</option>');
  }

  monthHtml = '<div class="pika-label">' + opts.i18n.months[month] + '<select class="pika-select pika-select-month" tabindex="-1">' + arr.join('') + '</select></div>';

  if (isArray(opts.yearRange)) {
    i = opts.yearRange[0];
    j = opts.yearRange[1] + 1;
  } else {
    i = year - opts.yearRange;
    j = 1 + year + opts.yearRange;
  }

  for (arr = []; i < j && i <= opts.maxYear; i++) {
    if (i >= opts.minYear) {
      arr.push('<option value="' + i + '"' + (i === year ? ' selected="selected"' : '') + '>' + (i) + '</option>');
    }
  }
  yearHtml = '<div class="pika-label">' + year + opts.yearSuffix + '<select class="pika-select pika-select-year" tabindex="-1">' + arr.join('') + '</select></div>';

  if (opts.showMonthAfterYear) {
    html += yearHtml + monthHtml;
  } else {
    html += monthHtml + yearHtml;
  }

  if (isMinYear && (month === 0 || opts.minMonth >= month)) {
    prev = false;
  }

  if (isMaxYear && (month === 11 || opts.maxMonth <= month)) {
    next = false;
  }

  if (c === 0) {
    html += '<button class="pika-prev' + (prev ? '' : ' is-disabled') + '" type="button">' + opts.i18n.previousMonth + '</button>';
  }
  if (c === (instance._o.numberOfMonths - 1)) {
    html += '<button class="pika-next' + (next ? '' : ' is-disabled') + '" type="button">' + opts.i18n.nextMonth + '</button>';
  }

  return html += '</div>';
};

var renderTable = (opts, data, randId) => '<table cellpadding="0" cellspacing="0" class="pika-table" role="grid" aria-labelledby="' + randId + '">' + renderHead(opts) + renderBody(data) + '</table>';


/**
 * Pikaday constructor
 */
class Pikaday {
  constructor(options) {
    const opts = this.config(options);

    if (options.useMobileDefault && this.isMobileBrowser()) {
      this.setInputType('date');
      return;
    };

    this.addedEvents = [];
    this.addEvent = (eventName, el, e, callback, capture) => {
      this.addedEvents[eventName] = {
        el,
        e,
        callback,
        el,
      }
      el.addEventListener(e, callback, !!capture);
    };

    this.removeEvent = (eventName, el, e, callback, capture) => {
      el.removeEventListener(e, callback, !!capture);
      delete this.addedEvents[eventName];
    };

    this._onMouseDown = function(e) {
      if (!this._v) {
        return;
      }
      e = e || window.event;
      var target = e.target || e.srcElement;
      if (!target) {
        return;
      }

      if (!hasClass(target, 'is-disabled')) {
        if (hasClass(target, 'pika-button') && !hasClass(target, 'is-empty') && !hasClass(target.parentNode, 'is-disabled')) {
          this.setDate(new Date(target.getAttribute('data-pika-year'), target.getAttribute('data-pika-month'), target.getAttribute('data-pika-day')));
          if (opts.bound) {
            sto(() => {
              this.hide();
              if (opts.field) {
                opts.field.blur();
              }
            }, 100);
          }
        } else if (hasClass(target, 'pika-prev')) {
          this.prevMonth();
        } else if (hasClass(target, 'pika-next')) {
          this.nextMonth();
        }
      }
      if (!hasClass(target, 'pika-select')) {
        // if this is touch event prevent mouse events emulation
        if (e.preventDefault) {
          e.preventDefault();
        } else {
          e.returnValue = false;
          return false;
        }
      } else {
        this._c = true;
      }
    };

    this._onChange = function(e) {
      e = e || window.event;
      var target = e.target || e.srcElement;
      if (!target) {
        return;
      }
      if (hasClass(target, 'pika-select-month')) {
        this.gotoMonth(target.value);
      } else if (hasClass(target, 'pika-select-year')) {
        this.gotoYear(target.value);
      }
    };

    this._onKeyChange = function(e) {
      e = e || window.event;

      if (this.isVisible()) {

        switch (e.keyCode) {
          case 13:
          case 27:
            opts.field.blur();
            break;
          case 37:
            e.preventDefault();
            this.adjustDate('subtract', 1);
            break;
          case 38:
            this.adjustDate('subtract', 7);
            break;
          case 39:
            this.adjustDate('add', 1);
            break;
          case 40:
            this.adjustDate('add', 7);
            break;
        }
      }
    };

    this._onInputChange = function(e) {
      var date;

      if (e.firedBy === this) {
        return;
      }

      this.setDate(date);

      if (!this._v) {
        this.show();
      }
    };

    this._onInputFocus = function() {
      this.show();
    };

    this._onInputClick = function() {
      this.show();
    };

    this._onInputBlur = function() {
      // IE allows pika div to gain focus; catch blur the input field
      var pEl = document.activeElement;
      do {
        if (hasClass(pEl, 'pika-single')) {
          return;
        }
      }
      while ((pEl = pEl.parentNode));

      if (!this._c) {
        this._b = sto(() => {
          this.hide();
        }, 50);
      }
      this._c = false;
    };

    this._onClick = function(e) {
      e = e || window.event;
      var target = e.target || e.srcElement;
      var pEl = target;
      if (!target) {
        return;
      }
      do {
        if (hasClass(pEl, 'pika-single') || pEl === opts.trigger) {
          return;
        }
      }
      while ((pEl = pEl.parentNode));
      if (this._v && target !== opts.trigger && pEl !== opts.trigger) {
        this.hide();
      }
    };

    this.el = document.createElement('div');
    this.el.className = 'pika-single' + (opts.isRTL ? ' is-rtl' : '') + (opts.theme ? ' ' + opts.theme : '');

    this.addEvent('mousedownmain', this.el, 'mousedown', this._onMouseDown.bind(this), true);
    this.addEvent('touchendmain', this.el, 'touchend', this._onMouseDown.bind(this), true);
    this.addEvent('changemain', this.el, 'change', this._onChange.bind(this));
    this.addEvent('docKeyChange', document, 'keydown', this._onKeyChange.bind(this));

    if (opts.field) {
      if (opts.container) {
        opts.container.appendChild(this.el);
      } else if (opts.bound) {
        document.body.appendChild(this.el);
      } else {
        opts.field.parentNode.insertBefore(this.el, opts.field.nextSibling);
      }
      this.addEvent('inputChange', opts.field, 'change', this._onInputChange.bind(this));

      if (!opts.defaultDate && opts.field.value) {
        opts.defaultDate = this.parseDate(opts.field.value);
        opts.setDefaultDate = true;
      }
    }

    var defDate = opts.defaultDate;

    if (isDate(defDate)) {
      if (opts.setDefaultDate) {
        this.setDate(defDate, true);
      } else {
        this.gotoDate(defDate);
      }
    } else {
      this.gotoDate(new Date());
    }

    if (opts.bound) {
      this.hide();
      this.el.className += ' is-bound';
      this.addEvent('inputClick', opts.trigger, 'click', this._onInputClick.bind(this));
      this.addEvent('inputFocus', opts.trigger, 'focus', this._onInputFocus.bind(this));
      this.addEvent('inputBlur', opts.trigger, 'blur', this._onInputBlur.bind(this));
    } else {
      this.show();
    }
  }

  /**
   * public Pikaday API
   */


  /**
   * configure functionality
   */
  config(options) {
    if (!this._o) {
      this._o = extend({}, defaults, true);
    }


    var opts = extend(this._o, options, true);

    if (opts.useMobileDefault && this.isMobileBrowser()) {
      this.setInputType('date');
      return opts;
    }

    opts.isRTL = !!opts.isRTL;

    opts.field = (opts.field && opts.field.nodeName) ? opts.field : null;

    opts.theme = (typeof opts.theme) === 'string' && opts.theme ? opts.theme : null;

    opts.bound = !!(opts.bound !== undefined ? opts.field && opts.bound : opts.field);

    opts.trigger = (opts.trigger && opts.trigger.nodeName) ? opts.trigger : opts.field;

    opts.disableWeekends = !!opts.disableWeekends;

    opts.disableDayFn = (typeof opts.disableDayFn) === 'function' ? opts.disableDayFn : null;

    var nom = parseInt(opts.numberOfMonths, 10) || 1;
    opts.numberOfMonths = nom > 4 ? 4 : nom;

    if (!isDate(opts.minDate)) {
      opts.minDate = false;
    }
    if (!isDate(opts.maxDate)) {
      opts.maxDate = false;
    }
    if ((opts.minDate && opts.maxDate) && opts.maxDate < opts.minDate) {
      opts.maxDate = opts.minDate = false;
    }
    if (opts.minDate) {
      this.setMinDate(opts.minDate);
    }
    if (opts.maxDate) {
      this.setMaxDate(opts.maxDate);
    }

    if (isArray(opts.yearRange)) {
      var fallback = new Date().getFullYear() - 10;
      opts.yearRange[0] = parseInt(opts.yearRange[0], 10) || fallback;
      opts.yearRange[1] = parseInt(opts.yearRange[1], 10) || fallback;
    } else {
      opts.yearRange = Math.abs(parseInt(opts.yearRange, 10)) || defaults.yearRange;
      if (opts.yearRange > 100) {
        opts.yearRange = 100;
      }
    }

    return opts;
  }

  /**
   * return a formatted string of the current selection (using Moment.js if available)
   */
  toString(format) {
    if (!isDate(this._d)) {
      return '';
    }

    return moment(this._d).format(format || this._o.format);
  }

  /**
   * return a Date parsed from the given string (using Moment.js if available)
   */
  parseDate(str, format) {
    var date;

    date = moment(str, format || this._o.inputFormats);
    date = date.isValid() ? date.toDate() : null;

    return date;
  }

  /**
   * return a Date object of the current selection with fallback for the current date
   */
  getDate() {
    return isDate(this._d) ? new Date(this._d.getTime()) : new Date();
  }

  /**
   * set the current selection
   */
  setDate(date, preventOnSelect) {
    if (!date) {
      this._d = null;

      if (this._o.field) {
        this._o.field.value = '';
        fireEvent(this._o.field, 'change', {
          firedBy: this
        });
      }

      return this.draw();
    }
    if (typeof date === 'string') {
      date = this.parseDate(date);
    }

    if (!isDate(date)) {
      return this.clearDate(this._o.clearInvalidInput, preventOnSelect);
    }

    var min = this._o.minDate;
    var max = this._o.maxDate;

    if (isDate(min) && date < min) {
      date = min;
    } else if (isDate(max) && date > max) {
      date = max;
    }

    this._d = new Date(date.getTime());
    setToStartOfDay(this._d);
    this.gotoDate(this._d);

    if (this._o.field) {
      this._o.field.value = this.toString();
      fireEvent(this._o.field, 'change', {
        firedBy: this
      });
    }
    if (!preventOnSelect && typeof this._o.onSelect === 'function') {
      this._o.onSelect.call(this, this.getDate());
    }
  }

  /**
   * clear the current selection
   */
  clearDate(clearField, preventOnClear) {
    this._d = null;
    this.draw();

    if (clearField && this._o.field) {
      this._o.field.value = null;
      fireEvent(this._o.field, 'change', {
        firedBy: this
      });
    }

    if (!preventOnClear && typeof this._o.onClear === 'function') {
      this._o.onClear.call(this);
    }
  }

  /**
   * change view to a specific date
   */
  gotoDate(date) {
    var newCalendar = true;

    if (!isDate(date)) {
      return;
    }

    if (this.calendars) {
      var firstVisibleDate = new Date(this.calendars[0].year, this.calendars[0].month, 1);
      var lastVisibleDate = new Date(this.calendars[this.calendars.length - 1].year, this.calendars[this.calendars.length - 1].month, 1);
      var visibleDate = date.getTime();
      // get the end of the month
      lastVisibleDate.setMonth(lastVisibleDate.getMonth() + 1);
      lastVisibleDate.setDate(lastVisibleDate.getDate() - 1);
      newCalendar = (visibleDate < firstVisibleDate.getTime() || lastVisibleDate.getTime() < visibleDate);
    }

    if (newCalendar) {
      this.calendars = [{
        month: date.getMonth(),
        year: date.getFullYear()
      }];
      if (this._o.mainCalendar === 'right') {
        this.calendars[0].month += 1 - this._o.numberOfMonths;
      }
    }

    this.adjustCalendars();
  }

  adjustDate(sign, days) {

    var day = this.getDate();
    var difference = parseInt(days) * 24 * 60 * 60 * 1000;

    var newDay;

    if (sign === 'add') {
      newDay = moment(day).add(days, "days").toDate();
    } else if (sign === 'subtract') {
      newDay = moment(day).subtract(days, "days").toDate();
    }

    this.setDate(newDay);
  }

  adjustCalendars() {
    this.calendars[0] = adjustCalendar(this.calendars[0]);
    for (var c = 1; c < this._o.numberOfMonths; c++) {
      this.calendars[c] = adjustCalendar({
        month: this.calendars[0].month + c,
        year: this.calendars[0].year
      });
    }
    this.draw();
  }

  gotoToday() {
    this.gotoDate(new Date());
  }

  /**
   * change view to a specific month (zero-index, e.g. 0: January)
   */
  gotoMonth(month) {
    if (!isNaN(month)) {
      this.calendars[0].month = parseInt(month, 10);
      this.adjustCalendars();
    }
  }

  nextMonth() {
    this.calendars[0].month++;
    this.adjustCalendars();
  }

  prevMonth() {
    this.calendars[0].month--;
    this.adjustCalendars();
  }

  /**
   * change view to a specific full year (e.g. "2012")
   */
  gotoYear(year) {
    if (!isNaN(year)) {
      this.calendars[0].year = parseInt(year, 10);
      this.adjustCalendars();
    }
  }

  /**
   * change the minDate
   */
  setMinDate(value) {
    if (value instanceof Date) {
      setToStartOfDay(value);
      this._o.minDate = value;
      this._o.minYear = value.getFullYear();
      this._o.minMonth = value.getMonth();
    } else {
      this._o.minDate = defaults.minDate;
      this._o.minYear = defaults.minYear;
      this._o.minMonth = defaults.minMonth;
      this._o.startRange = defaults.startRange;
    }

    this.draw();
  }

  /**
   * change the maxDate
   */
  setMaxDate(value) {
    if (value instanceof Date) {
      setToStartOfDay(value);
      this._o.maxDate = value;
      this._o.maxYear = value.getFullYear();
      this._o.maxMonth = value.getMonth();
    } else {
      this._o.maxDate = defaults.maxDate;
      this._o.maxYear = defaults.maxYear;
      this._o.maxMonth = defaults.maxMonth;
      this._o.endRange = defaults.endRange;
    }

    this.draw();
  }

  setStartRange(value) {
    this._o.startRange = value;
  }

  setEndRange(value) {
    this._o.endRange = value;
  }

  setInputType(inputType) {
    this._o.field.setAttribute('type', inputType);
  }

  /**
   * refresh the HTML
   */
  draw(force) {
    if (!this._v && !force) {
      return;
    }
    var opts = this._o;
    var minYear = opts.minYear;
    var maxYear = opts.maxYear;
    var minMonth = opts.minMonth;
    var maxMonth = opts.maxMonth;
    var html = '';
    var randId;

    if (this._y < minYear) {
      this._y = minYear;
      this._m = minMonth;
    } else if (this._y == minYear && !isNaN(minMonth) && this._m < minMonth) {
      this._m = minMonth;
    }
    if (this._y > maxYear) {
      this._y = maxYear;
      this._m = maxMonth;
    } else if (this._y == maxYear && !isNaN(maxMonth) && this._m > maxMonth) {
      this._m = maxMonth;
    }

    randId = 'pika-title-' + Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 2);

    for (var c = 0; c < opts.numberOfMonths; c++) {
      html += '<div class="pika-lendar">' + renderTitle(this, c, this.calendars[c].year, this.calendars[c].month, this.calendars[0].year, randId) + this.render(this.calendars[c].year, this.calendars[c].month, randId) + '</div>';
    }

    this.el.innerHTML = html;

    if (opts.bound) {
      if (opts.field.type !== 'hidden') {
        sto(() => {
          opts.trigger.focus();
        }, 1);
      }
    }

    if (typeof this._o.onDraw === 'function') {
      this._o.onDraw(this);
    }

    if (opts.bound) {
      // let the screen reader user know to use arrow keys
      opts.field.setAttribute('aria-label', 'Use the arrow keys to pick a date');
    }
  }

  adjustPosition() {
    var field;
    var pEl;
    var width;
    var height;
    var viewportWidth;
    var viewportHeight;
    var scrollTop;
    var left;
    var top;
    var clientRect;

    if (this._o.container) return;

    this.el.style.position = 'absolute';

    field = this._o.trigger;
    pEl = field;
    width = this.el.offsetWidth;
    height = this.el.offsetHeight;
    viewportWidth = window.innerWidth || document.documentElement.clientWidth;
    viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    scrollTop = window.pageYOffset || document.body.scrollTop || document.documentElement.scrollTop;

    if (typeof field.getBoundingClientRect === 'function') {
      clientRect = field.getBoundingClientRect();
      left = clientRect.left + window.pageXOffset;
      top = clientRect.bottom + window.pageYOffset;
    } else {
      left = pEl.offsetLeft;
      top = pEl.offsetTop + pEl.offsetHeight;
      while ((pEl = pEl.offsetParent)) {
        left += pEl.offsetLeft;
        top += pEl.offsetTop;
      }
    }

    // default position is bottom & left
    if ((this._o.reposition && left + width > viewportWidth) ||
      (
        this._o.position.indexOf('right') > -1 &&
        left - width + field.offsetWidth > 0
      )
    ) {
      left = left - width + field.offsetWidth;
    }
    if ((this._o.reposition && top + height > viewportHeight + scrollTop) ||
      (
        this._o.position.indexOf('top') > -1 &&
        top - height - field.offsetHeight > 0
      )
    ) {
      top = top - height - field.offsetHeight;
    }

    this.el.style.left = left + 'px';
    this.el.style.top = top + 'px';
  }

  /**
   * render HTML for a particular month
   */
  render(year, month, randId) {
    var opts = this._o;
    var now = new Date();
    var days = getDaysInMonth(year, month);
    var before = new Date(year, month, 1).getDay();
    var data = [];
    var row = [];
    setToStartOfDay(now);
    if (opts.firstDay > 0) {
      before -= opts.firstDay;
      if (before < 0) {
        before += 7;
      }
    }
    var previousMonth = month === 0 ? 11 : month - 1;
    var nextMonth = month === 11 ? 0 : month + 1;
    var yearOfPreviousMonth = month === 0 ? year - 1 : year;
    var yearOfNextMonth = month === 11 ? year + 1 : year;
    var daysInPreviousMonth = getDaysInMonth(yearOfPreviousMonth, previousMonth);
    var cells = days + before;
    var after = cells;
    while (after > 7) {
      after -= 7;
    }
    cells += 7 - after;
    for (var i = 0, r = 0; i < cells; i++) {
      var day = new Date(year, month, 1 + (i - before));
      var isSelected = isDate(this._d) ? compareDates(day, this._d) : false;
      var isToday = compareDates(day, now);
      var isEmpty = i < before || i >= (days + before);
      var dayNumber = 1 + (i - before);
      var monthNumber = month;
      var yearNumber = year;
      var isStartRange = opts.startRange && compareDates(opts.startRange, day);
      var isEndRange = opts.endRange && compareDates(opts.endRange, day);
      var isInRange = opts.startRange && opts.endRange && opts.startRange < day && day < opts.endRange;

      var isDisabled = (opts.minDate && day < opts.minDate) ||
        (opts.maxDate && day > opts.maxDate) ||
        (opts.disableWeekends && isWeekend(day)) ||
        (opts.disableDayFn && opts.disableDayFn(day));

      if (isEmpty) {
        if (i < before) {
          dayNumber = daysInPreviousMonth + dayNumber;
          monthNumber = previousMonth;
          yearNumber = yearOfPreviousMonth;
        } else {
          dayNumber = dayNumber - days;
          monthNumber = nextMonth;
          yearNumber = yearOfNextMonth;
        }
      }

      var dayConfig = {
        day: dayNumber,
        month: monthNumber,
        year: yearNumber,
        isSelected: isSelected,
        isToday: isToday,
        isDisabled: isDisabled,
        isEmpty: isEmpty,
        isStartRange: isStartRange,
        isEndRange: isEndRange,
        isInRange: isInRange,
        showDaysInNextAndPreviousMonths: opts.showDaysInNextAndPreviousMonths
      };

      row.push(renderDay(dayConfig));

      if (++r === 7) {
        if (opts.showWeekNumber) {
          row.unshift(renderWeek(i - before, month, year));
        }
        data.push(renderRow(row, opts.isRTL));
        row = [];
        r = 0;
      }
    }
    return renderTable(opts, data, randId);
  }

  isVisible() {
    return this._v;
  }

  /**
   * checks if the browser is running on a mobile device
   */
  isMobileBrowser() {
    var userAgent = navigator.userAgent || navigator.vendor || window.opera;

    return /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(userAgent) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(userAgent.substr(0, 4));
  }

  show() {
    if (!this.isVisible()) {
      removeClass(this.el, 'is-hidden');
      this._v = true;
      this.draw();
      if (this._o.bound) {
        this.addEvent('documentClick', document, 'click', this._onClick);
        this.adjustPosition();
      }
      if (typeof this._o.onOpen === 'function') {
        this._o.onOpen.call(this);
      }
    }
  }

  hide() {
    var v = this._v;
    if (v !== false) {
      if (this._o.bound) {
        this.removeEvent('documentClick', document, 'click', this._onClick);
      }
      this.el.style.position = 'static'; // reset
      this.el.style.left = 'auto';
      this.el.style.top = 'auto';
      addClass(this.el, 'is-hidden');
      this._v = false;
      if (v !== undefined && typeof this._o.onClose === 'function') {
        this._o.onClose.call(this);
      }
    }
  }

  /**
   * GAME OVER
   */
  destroy() {
    this.hide();
    for (var key in this.addedEvents) {
      var evt = this.addedEvents[key];
      this.removeEvent(key, evt.el, evt.e, evt.callback, !!evt.capture)
    }
      
    if (this.el.parentNode) {
      this.el.parentNode.removeChild(this.el);
    }
  }
}


module.exports = Pikaday;
