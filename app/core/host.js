(function () {
  'use strict';

  angular
    .module('anavis')
    .factory('host', [host]);

  host.$inject = [];

  function host() {
    return {
      works: [],
      executeCommand: function (command) {
        command.execute();
      }
    };
  }

})();
