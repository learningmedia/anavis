(function () {
  'use strict';

  var commandFactory = function () {

    var changePartLength = function(partId, newLength) {
      return {
        name: 'changePartLength',
        partId: partId,
        newLength: newLength
      };
    };

    var changePartCategory = function(partId, newCategoryId) {
      return {
        name: 'changePartCategory',
        partId: partId,
        newCategoryId: newCategoryId
      };
    };

    return {
      changePartLength: changePartLength,
      changePartCategory: changePartCategory
    };
  
  };

  commandFactory.$inject = [];

  angular.module('core').factory('core.commandFactory', commandFactory);

})();
