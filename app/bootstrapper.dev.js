(function () {
  'use strict';

  window.addEventListener('DOMContentLoaded', function () {
    System.map['uuid'] = 'bower_components/lil-uuid/uuid';
    System.map['chroma'] = 'bower_components/chroma-js/chroma';
    System.import('app').then(function (app) {
      app.default.start();
    });
  });

})();
