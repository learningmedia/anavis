(function () {
  'use strict';

  function elementFactory(uuid4) {

    function createPart(category, length, id) {
      return {
        id: id || uuid4.generate(),
        category: category,
        length: length
      };
    }

    function createCategory(name, color, id) {
      return {
        id: id || uuid4.generate(),
        color: color,
        name: name
      };
    }

    function createWork() {
      return {
        id: uuid4.generate(),
        parts: [],
        categories: []
      };
    }

    return {
      createPart: createPart,
      createCategory: createCategory,
      createWork: createWork
    };

  }

  elementFactory.$inject = ['uuid4'];

  angular.module('core').factory('core.elementFactory', ['uuid4', elementFactory]);

})();
