var Pikaday = require('../'),
    should = require('should');

describe('Pikaday', function ()
{
    'use strict';

    it('should expose as a CommonJS module', function ()
    {
        Pikaday.should.be.a.Function;
    });

    it('should NOT leak to the global object', function ()
    {
        should.not.exist(window.Pikaday);
    });

    it('should be possible to create a new instance', function ()
    {
        Pikaday.should.not.throw();
    });
});