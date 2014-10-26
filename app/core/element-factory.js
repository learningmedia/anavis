(function () {
  'use strict';

  angular
    .module('anavis')
    .factory('elementFactory', ['uuid4', elementFactory]);

  elementFactory.$inject = ['uuid4'];

  function elementFactory(uuid4) {
    return {
      createPart: createPart,
      createCategory: createCategory,
      createWork: createWork
    };

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
        categories: [],
        visualizations: []
      };
    }
  }

})();
