var Pikarange = require('../'),
    expect = require('expect.js');

describe('Pikarange', function ()
{
    'use strict';

    it('should expose as a CommonJS module', function ()
    {
        expect(Pikarange).to.be.a('function');
    });

    it('should NOT leak to the global object', function ()
    {
        expect(window).to.not.have.property('Pikarange');
    });

    it('should be possible to create a new instance', function ()
    {
        expect(function () {
            new Pikarange();
        }).to.not.throwException();
    });
});