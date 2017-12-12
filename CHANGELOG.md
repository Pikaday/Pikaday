# Changelog

## 1.7.0 - 2017-12-12

- Add keyboard input option, see #610

## 1.6.1 - 2017-06-06

- Fix memory leak, fixes #630

## 1.6.0 - 2017-05-31

- Add custom parsers, see #613
- Re-introduce correct null behavor, fixes #654
- Pick a whole week, see #516
- Added `events` option: dates that you would like to differentiate from regular days, see #152
- Fix the (re)position issue, see #643, #642
- Configure if field is blurred when date is selected, see #631
- Prevent error when no field is bound, fixes #611

## 1.5.1 - 2016-10-28

- Only set attribute if field is bound, see #567

## 1.5.0 - 2016-10-27

- Make Pikaday accessibile, see #522
- Add possibility to reset the max and min date to the date picker
- Make Pikaday XHTML compatible, see #492
- Remove unnecessary setTimeout call, fixes #496
- Make disabled buttons not clickable in IE 10 and below, fixes #288
- Show days in next and previous months

## 1.4.0 - 2015-10-30

- Fix touch device support, see #374
- Add possibility to reset the max and min date to the date picker

## 1.3.3 - 2015-02-17

- Add theme class support, see #260
- Fix on iOS, see #101, #121
- Add date range example, see #337
- Fix dates used in examples, see #329

## 1.3.2 - 2015-02-17

- Add options to disable days, see #171
- Add SCSS file, see #130

## 1.3.1 - 2015-02-04

- Fix for bug introduced in #166; fixes #224, #230

## 1.3.0 - 2015-01-09

- Fix #79 moving through months can cause calendar to "bounce around"
- Add configurable number of shown months
- #51 Add unit tests with ci: [testling](https://ci.testling.com/rikkert/pikaday)
- Fix #94 blur input field after date selection
- Add configuable container to render calendar into
- Add option to show week numbers, see #147
- Positioning is now optional, see #192

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
