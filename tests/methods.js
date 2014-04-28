var Pikaday = require('../');
require('should');

describe('Pikaday public methods', function ()
{
    'use strict';

    describe('#toString()', function ()
    {
        it('should return empty string when date not set', function ()
        {
            var pikaday = new Pikaday();
            pikaday.toString().should.be.empty;
        });
        
        it('should return date string when date is set', function() {
            var date = new Date('2014-04-25'),
            pikaday = new Pikaday();

            pikaday.setDate(date);
                pikaday.toString().should.equal(date.toDateString());
        })
    });
});