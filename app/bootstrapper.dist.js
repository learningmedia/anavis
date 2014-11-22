(function () {
  'use strict';

  window.addEventListener('DOMContentLoaded', function () {
    System.map['uuid'] = 'lib/uuid';
    System.map['chroma'] = 'lib/chroma';
    System.import('app').then(function (app) {
      app.default.start();
    });
  });

})();
