var Pikarange = require('../'),
    expect = require('expect.js');

describe('Pikarange public method', function ()
{
    'use strict';

    describe('#getDate()', function() {
        it('should return null if date not set', function() {
            expect(new Pikarange().getDate()).to.be(null);
        });
    });

    describe('#toString()', function ()
    {
        it('should return empty string when date not set', function ()
        {
            var pikarange = new Pikarange();
            expect(pikarange.toString()).to.be.empty;
        });

        it('should return date string, formatted by moment, when date is set', function() {
            var date = new Date(2014, 3, 25),
            pikarange = new Pikarange({
                format: 'DD-MM-YY'
            });

            pikarange.setDate(date);
            expect(pikarange.toString()).to.eql('25-04-14');
        });
    });

    describe('When specifying minDate option in Constructor', function () {
        it('Should remove the time portion (flattening to midnight)', function () {
            var date = new Date(2015, 1, 17, 22, 10, 5),
                expected = new Date(2015, 1, 17, 0, 0, 0),
                pikarange = new Pikarange({ minDate: date });

            expect(pikarange._o.minDate).to.eql(expected);
        });
    });

    describe('#setMinDate()', function () {
        it('should flatten date to midnight ignoring time portion (consistent with minDate option in ctor)', function () {
            var date = new Date(2015, 1, 17, 22, 10, 5),
                expected = new Date(2015, 1, 17, 0, 0, 0),
                pikarange = new Pikarange();

            pikarange.setMinDate(date);
            expect(pikarange._o.minDate).to.eql(expected);
        });
    });
});
