(function () {
  'use strict';

  function host() {

    return {
      works: []
    };

  }

  host.$inject = [];

  angular.module('anavis').factory('core.host', [host]);

})();
