/*!
 * Pikarange jQuery plugin.
 *
 * Copyright © 2017 Willy PT | BSD & MIT license | https://github.com/willypt/Pikarange
 */

(function (root, factory)
{
    'use strict';

    if (typeof exports === 'object') {
        // CommonJS module
        factory(require('jquery'), require('../pikarange'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery', 'pikarange'], factory);
    } else {
        // Browser globals
        factory(root.jQuery, root.Pikarange);
    }
}(this, function ($, Pikarange)
{
    'use strict';

    $.fn.pikarange = function()
    {
        var args = arguments;

        if (!args || !args.length) {
            args = [{ }];
        }

        return this.each(function()
        {
            var self   = $(this),
                plugin = self.data('pikarange');

            if (!(plugin instanceof Pikarange)) {
                if (typeof args[0] === 'object') {
                    var options = $.extend({}, args[0]);
                    options.field = self[0];
                    self.data('pikarange', new Pikarange(options));
                }
            } else {
                if (typeof args[0] === 'string' && typeof plugin[args[0]] === 'function') {
                    plugin[args[0]].apply(plugin, Array.prototype.slice.call(args,1));

                    if (args[0] === 'destroy') {
                        self.removeData('pikarange');
                    }
                }
            }
        });
    };

}));
