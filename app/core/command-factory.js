(function () {
  'use strict';

  function commandFactory(host, elementFactory) {

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

    return {
      createWork: createWork,
      changePartLength: changePartLength,
      changePartCategory: changePartCategory
    };

  }

  commandFactory.$inject = ['core.host', 'core.elementFactory'];

  angular.module('anavis').factory('core.commandFactory', commandFactory);

})();
