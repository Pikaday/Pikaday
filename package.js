// package metadata file for Meteor.js
'use strict';

Package.describe({
  name: "dbushell:pikaday",
  summary: "A refreshing JavaScript Datepicker — official Meteor packaging",
  version: "1.3.3",
  git: "",
  documentation: 'README.md',
});

Package.onUse(function (api) {
  api.versionsFrom(['METEOR@0.9.1', 'METEOR@1.0']);
  api.use('jquery', 'client');
  api.use('momentjs:moment@2.9.0', 'client');
  api.export('Pikaday', 'client');
  api.addFiles([
    'pikaday.js',
    'css/pikaday.css',
    'meteor/export.js'
  ], 'client');
});

Package.onTest(function(api) {
    api.use('tinytest');
    api.use('dbushell:pikaday');
    api.addFiles('meteor/tests.js');
});
