(function () {
  'use strict';

  function host() {
    return {
      works: [],
      executeCommand: function (command) {
        command.execute();
      }
    };

  }

  host.$inject = [];

  angular.module('anavis').factory('core.host', [host]);

})();
