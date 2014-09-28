(function () {
  'use strict';

  function commandFactory() {

    function changePartLength(partId, newLength) {
      return {
        name: 'changePartLength',
        partId: partId,
        newLength: newLength
      };
    }

    function changePartCategory(partId, newCategoryId) {
      return {
        name: 'changePartCategory',
        partId: partId,
        newCategoryId: newCategoryId
      };
    }

    return {
      changePartLength: changePartLength,
      changePartCategory: changePartCategory
    };

  }

  commandFactory.$inject = [];

  angular.module('anavis').factory('core.commandFactory', commandFactory);

})();
