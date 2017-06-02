var Pikaday = require('../'),
    expect = require('expect.js');

describe('Pikaday option', function ()
{
    'use strict';

    describe('onBeforeRender', function ()
    {

        it('should allow modifying markup', function ()
        {
            var origMarkup;
            var pikaday = new Pikaday({
                onBeforeRender: function (markup) {
                    // remember original markup
                    var container = document.createElement('div');
                    container.innerHTML = markup;
                    origMarkup = container.innerHTML;

                    return '<div class="wrapped-by-test">' + markup + '</div>';
                }
            });
            var wrappedByTest = pikaday.el.querySelector('.wrapped-by-test');

            expect(wrappedByTest).to.be.a(HTMLElement);
            expect(wrappedByTest.innerHTML).to.be(origMarkup);
        });

        it('should NOT modify markup when nothing is returned', function ()
        {
            var origMarkup;
            var pikaday = new Pikaday({
                onBeforeRender: function (markup) {
                    // remember original markup
                    var container = document.createElement('div');
                    container.innerHTML = markup;
                    origMarkup = container.innerHTML;

                    return;
                }
            });

            expect(pikaday.el.innerHTML).to.be(origMarkup);
        });

    });
});
