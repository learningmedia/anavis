'use strict';

import uuid from 'uuid';

function createPart(category, length, id) {
  return {
    id: id || uuid.uuid(),
    category: category,
    length: length
  };
}

function createCategory(name, color, id) {
  return {
    id: id || uuid.uuid(),
    color: color,
    name: name
  };
}

function createWork() {
  return {
    id: uuid.uuid(),
    parts: [],
    categories: [],
    visualizations: []
  };
}

export default {
  createPart: createPart,
  createCategory: createCategory,
  createWork: createWork
};
