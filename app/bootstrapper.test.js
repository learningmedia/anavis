(function () {
  'use strict';

  var karma             = window['__karma__'];
  var specFilePattern   = /\.specs\.js$/;
  var moduleNamePattern = /^\/base\/(.+)\.js$/;
  var specFiles         = Object.keys(karma.files).filter(function (file) { return specFilePattern.test(file); });
  var modules           = specFiles.map(function (file) { return file.replace(moduleNamePattern, '$1'); });
  var start             = karma.start;

  karma.start = function () {}; // Defer the start until all test modules are loaded...

  window.addEventListener('DOMContentLoaded', function () {
    System.baseURL = '/base';
    System.map['uuid'] = 'bower_components/lil-uuid/uuid';
    System.map['chroma'] = 'bower_components/chroma-js/chroma';
    var promises = modules.map(function (module) { return System.import(module); });
    Promise.all(promises).then(function () {
      karma.start = start;
      karma.start();
    });
  });

})();
