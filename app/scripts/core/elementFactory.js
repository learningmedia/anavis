(function () {
  'use strict';

  var elementFactory = function (uuid4) {

    var createPart = function(categoryId, length) {
      return {
        id: uuid4.generate(),
        categoryId: categoryId,
        length: length
      };
    };

    var createCategory = function(color, name) {
      return {
        id: uuid4.generate(),
        color: color,
        name: name
      };
    };

    var createWork = function () {
      return {
        id: uuid4.generate(),
        parts: [],
        categories: []
      };
    };

    return {
      createPart: createPart,
      createCategory: createCategory,
      createWork: createWork
    };

  };

  elementFactory.$inject = ['uuid4'];

  angular.module('core').factory('core.elementFactory', elementFactory);

})();
