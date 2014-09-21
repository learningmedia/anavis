(function () {
  'use strict';

  var elementFactory = function (uuid4) {

    var createPart = function(category, length, id) {
      return {
        id: id || uuid4.generate(),
        category: category,
        length: length
      };
    };

    var createCategory = function(name, color, id) {
      return {
        id: id || uuid4.generate(),
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

  angular.module('core').factory('core.elementFactory', ['uuid4', elementFactory]);

})();
