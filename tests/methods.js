var Pikaday = require('../'),
    expect = require('expect.js');

describe('Pikaday public method', function ()
{
    'use strict';

    describe('#getDate()', function() {
        it('should return null if date not set', function() {
            expect(new Pikaday().getDate()).to.be(null);
        });
    });

    describe('#toString()', function ()
    {
        it('should return empty string when date not set', function ()
        {
            var pikaday = new Pikaday();
            expect(pikaday.toString()).to.be.empty;
        });

        it('should return date string, formatted by moment, when date is set', function() {
            var date = new Date(2014, 3, 25),
            pikaday = new Pikaday({
                format: 'DD-MM-YY'
            });

            pikaday.setDate(date);
            expect(pikaday.toString()).to.eql('25-04-14');
        });

        it('should use toString function if one is provided', function () {
            var date = new Date(2014, 3, 25),
            pikaday = new Pikaday({
                toString: function(d) {
                    var date = d.getDate();
                    var month = d.getMonth() + 1;
                    return 'custom: ' + date + '/' + month;
                }
            });

            pikaday.setDate(date);
            expect(pikaday.toString()).to.eql('custom: 25/4');
        });

        it('should pass current format option to the toString function', function () {
            var date = new Date(2014, 3, 25);
            var expectedFormat = 'DD/MM/YYYY';
            var passedFormat;

            var pikaday = new Pikaday({
                format: expectedFormat,
                toString: function(d, format) {
                    passedFormat = format;
                    return '';
                }
            });

            pikaday.setDate(date);
            pikaday.toString(); // invoke toString to set the passedFormat variable
            expect(passedFormat).to.eql(expectedFormat);
        });

        it('should use parse function if one is provided', function () {
            var expectedDate = new Date(2017, 3, 6);
            var pikaday = new Pikaday({
                parse: function() {
                    return new Date(2017, 3, 6);
                }
            });

            // mock input field
            pikaday._o.field = {
                value: '',
                setAttribute: function() {},
                dispatchEvent: function() {},
            };
            pikaday._onInputChange({});

            expect(pikaday.getDate().getTime()).to.eql(expectedDate.getTime());
        });

        it('should pass input value and current format to the parse function', function () {
            var expectedValue = 'test value';
            var expectedFormat = 'DD/MM/YYYY';
            var passedValue;
            var passedFormat;
            var pikaday = new Pikaday({
                format: expectedFormat,
                parse: function(value, format) {
                    passedValue = value;
                    passedFormat = format;
                    return new Date(2017, 3, 6);
                }
            });

            // mock input field
            pikaday._o.field = {
                value: expectedValue,
                setAttribute: function() {},
                dispatchEvent: function() {},
            };
            pikaday._onInputChange({});

            expect(passedValue).to.eql(expectedValue);
            expect(passedFormat).to.eql(expectedFormat);
        });
    });

    describe('When specifying minDate option in Constructor', function () {
        it('Should remove the time portion (flattening to midnight)', function () {
            var date = new Date(2015, 1, 17, 22, 10, 5),
                expected = new Date(2015, 1, 17, 0, 0, 0),
                pikaday = new Pikaday({ minDate: date });

            expect(pikaday._o.minDate).to.eql(expected);
        });
    });

    describe('#setMinDate()', function () {
        it('should flatten date to midnight ignoring time portion (consistent with minDate option in ctor)', function () {
            var date = new Date(2015, 1, 17, 22, 10, 5),
                expected = new Date(2015, 1, 17, 0, 0, 0),
                pikaday = new Pikaday();

            pikaday.setMinDate(date);
            expect(pikaday._o.minDate).to.eql(expected);
        });
    });

    describe('#render()', function() {
        it('starts with the correct week number according to ISO8601', function() {
            var pikaday = new Pikaday({showWeekNumber: true});
            expect(pikaday.render(2016, 0)).to.contain('<td class="pika-week">53</td>')
        });
    });
});
