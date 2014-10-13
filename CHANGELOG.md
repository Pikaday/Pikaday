# Changelog

## 1.4.1 @kmandrup

- Fixed some dynamic styling bugs (oops!)

## 1.4.0 @kmandrup

- Fix: You can add Datepicker to container with bound: false and field: null

- Allow use of external day/week data to affect styling of day cells, week number cells and week rows
  - functions
    - calcDayData  
    - calcWeekData

  - styling controlled via styling Object, (default: {}) that can have styling functions 
    - toClasses
    - toStyles
    - toAttr

- Improved i18n support, with more formats (weekDay long to ultra short, month long/short)
  - i18n.months
  - i18n.weekdays
  - displayFormat
    - weekdayShort
    - weekdayLong
    - monthName

- Enable disabling of month navigation via navigateMonths boolean option (default: false)

- added debug option debugOn (default: false)
- enable customizable debug logging that can be made conditional depending on context, data and styling ;)

## 1.3.0 - TBA

- Fix #79 moving through months can cause calendar to "bounce around"
- Add configurable number of shown months
- #51 Add unit tests with ci: [testling](https://ci.testling.com/rikkert/pikaday)
- Fix #94 blur input field after date selection
- Add configuable container to render calendar into 
- Add option to show week numbers, see #147

## 1.2.0 - 2014-01-28

- Fix #8 Automatically adjust datepicker position
- Merge #45 Adjusting position
- Merge #11 Allow using a different element to open and bind the datepicker to
- Use new Bower package filename: bower.json
- Merge #90 Configuration options for the title, useful for Asian languages.
- Merge #96 Use proper UMD-wrapper
- Merge #92 Export as CommonJS module
- Merge #119 Use a px text-indent on .pika-prev/next to prevent Firefox bug
- Merge #60 Add customizable position option
- Add Component package definition

## 1.1.0 - 2013-03-29

- Add Ruby on Rails [gem](https://rubygems.org/gems/pikaday-gem)
- Add project configuration files. (jshint and editorconfig)
- Add AMD support to pikaday and pikaday.jquery

- Fix #52 check if date is valid when moment.js is available
- Fix #54 add CSS support for IE8

Notes:

- jQuery plugin needs pikaday.js loaded first
- See the examples/ dir:
  - amd.html module loading example
  - jquery-amd.html module loading the jQuery plugin example
  - jquery.html jQuery plugin example
  - moment.html moment.js library example

## 1.0.0 - 2013-03-15

- Fix issue #41 (minDate does not include the specified date)
- Add Bower package definition

## 0.0.2 - 2012-10-10

- jQuery plugin version

## 0.0.1 - 2012-10-08

- Basic documentation written
- GitHub repository is ready to go…
