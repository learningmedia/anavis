define(['uuid'], function(uuid) {
  'use strict';

  var createPart = function(categoryId, length) {
    return {
      id: uuid.v4(),
      categoryId: categoryId,
      length: length
    };
  };

  var createCategory = function(color, name) {
    return {
      id: uuid.v4(),
      color: color,
      name: name
    };
  };

  var createWork = function () {
    return {
      id: uuid.v4(),
      parts: [],
      categories: []
    };
  };

  return {
    createPart: createPart,
    createCategory: createCategory,
    createWork: createWork
  };

});