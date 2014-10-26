(function () {
  'use strict';

  angular
    .module('anavis')
    .factory('commandFactory', commandFactory);

  commandFactory.$inject = ['host', 'elementFactory'];

  function commandFactory(host, elementFactory) {
    return {
      createWork: createWork,
      changePartLength: changePartLength,
      changePartCategory: changePartCategory
    };

    function createWork() {
      return {
        name: 'createWork',
        execute: function () {
          let work = elementFactory.createWork();
          let category = elementFactory.createCategory('Default', '#000080');
          work.categories.push(category);
          let part = elementFactory.createPart(category, 100);
          work.parts.push(part);
          host.works.push(work);
        }
      };
    }

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
  }

})();
